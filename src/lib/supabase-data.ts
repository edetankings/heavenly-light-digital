import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Announcement = { id: string; title: string; body: string; is_active: boolean; starts_at: string | null; ends_at: string | null; created_at: string };
export type BlogPost = { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_image: string | null; author: string | null; published: boolean; published_at: string };
export type Sermon = { id: string; title: string; preacher: string; preached_on: string; service_type: string; scripture: string | null; description: string | null; audio_url: string | null; audio_name: string | null; cover_image: string | null; allow_download?: boolean };
export type GalleryPhoto = { id: string; caption: string; category: string; description: string | null; image_url: string; taken_on: string | null; created_at: string; allow_download?: boolean };
export type PastorProfile = { id: string; name: string; title: string; photo_url: string | null; short_message: string | null; bio: string | null };
export type SiteSettings = { id: number; live_url: string | null };
export type PrayerRequest = { id: string; name: string; email: string | null; prayer_type: string; message: string; created_at: string };
export type ChurchEvent = { id: string; title: string; description: string | null; starts_at: string; location: string | null; cover_image: string | null; is_archived: boolean };
export type Testimony = { id: string; name: string; email: string | null; title: string | null; message: string; is_approved: boolean; created_at: string };

function useTable<T>(table: string, order: { col: string; asc?: boolean } = { col: "created_at", asc: false }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: rows } = await (supabase.from as any)(table).select("*").order(order.col, { ascending: !!order.asc });
      if (mounted) { setData((rows as T[]) || []); setLoading(false); }
    };
    load();
    const channel = supabase.channel(`rt-${table}`).on("postgres_changes", { event: "*", schema: "public", table }, () => load()).subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
  return { data, loading };
}

export const useAnnouncements = () => {
  const { data, loading } = useTable<Announcement>("announcements", { col: "created_at", asc: false });
  const now = Date.now();
  const active = data.filter(a => a.is_active && (!a.ends_at || new Date(a.ends_at).getTime() > now));
  return { all: data, active, loading };
};
export const useBlogPosts = () => useTable<BlogPost>("blog_posts", { col: "published_at", asc: false });
export const useSermons = () => useTable<Sermon>("sermons", { col: "preached_on", asc: false });
export const useGalleryPhotos = () => useTable<GalleryPhoto>("gallery_photos", { col: "created_at", asc: false });
export const usePrayerRequests = () => useTable<PrayerRequest>("prayer_requests", { col: "created_at", asc: false });
export const useEvents = () => useTable<ChurchEvent>("events", { col: "starts_at", asc: true });
// Public-safe testimonies (no email column, only approved rows). Uses a DB view.
export const useTestimonies = () => useTable<Testimony>("testimonies_public", { col: "created_at", asc: false });
// Admin view of testimonies — includes email and pending rows. Requires admin role (RLS).
export const useTestimoniesAdmin = () => useTable<Testimony>("testimonies", { col: "created_at", asc: false });

export function usePastor() {
  const [pastor, setPastor] = useState<PastorProfile | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("pastor_profile").select("*").limit(1).maybeSingle();
      if (mounted) setPastor(data as PastorProfile | null);
    };
    load();
    const ch = supabase.channel("rt-pastor").on("postgres_changes", { event: "*", schema: "public", table: "pastor_profile" }, () => load()).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return pastor;
}

export function useSiteSettings() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (mounted) setS(data as SiteSettings | null);
    };
    load();
    const ch = supabase.channel("rt-settings").on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => load()).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return s;
}

export function useAuthSession() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setIsAdmin(false); setLoading(false); return; }
      // defer role check
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
        setLoading(false);
      }, 0);
    });
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (!s) { setLoading(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  return { session, isAdmin, loading };
}

export async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
