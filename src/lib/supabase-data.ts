import type { Session } from "@supabase/supabase-js";
import type { Database, Tables } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Relations = Database["public"]["Tables"] & Database["public"]["Views"];
export type Announcement = Tables<"announcements">;
export type BlogPost = Tables<"blog_posts">;
export type Sermon = Tables<"sermons">;
export type GalleryPhoto = Tables<"gallery_photos">;
export type PastorProfile = Tables<"pastor_profile">;
export type SiteSettings = Tables<"site_settings">;
export type PrayerRequest = Tables<"prayer_requests">;
export type ChurchEvent = Tables<"events">;
export type Testimony = Tables<"testimonies">;

function useTable<Name extends keyof Relations>(
  table: Name,
  order: { col: Extract<keyof Tables<Name>, string>; asc?: boolean },
) {
  const [data, setData] = useState<Tables<Name>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { col, asc = false } = order;
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const relation: keyof Relations = table;
      const query =
        relation === "testimonies_public" ? supabase.from(relation) : supabase.from(relation);
      const { data: rows, error: queryError } = await query
        .select("*")
        .order(col, { ascending: asc });
      if (mounted) {
        // PostgREST's generic SELECT parser cannot resolve a generic relation name.
        // The relation and output rows are tied to the same generated schema key.
        setData((rows ?? []) as unknown as Tables<Name>[]);
        setError(queryError ? "Unable to load content. Please try again later." : null);
        setLoading(false);
      }
    };
    void load();
    const channel = supabase
      .channel(`rt-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        () => void load(),
      )
      .subscribe();
    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [table, col, asc]);
  return { data, loading, error };
}

export const useAnnouncements = () => {
  const { data, loading } = useTable("announcements", {
    col: "created_at",
    asc: false,
  });
  const now = Date.now();
  const active = data.filter(
    (a) => a.is_active && (!a.ends_at || new Date(a.ends_at).getTime() > now),
  );
  return { all: data, active, loading };
};
export const useBlogPosts = () => useTable("blog_posts", { col: "published_at", asc: false });
export const useSermons = () => useTable("sermons", { col: "preached_on", asc: false });
export const useGalleryPhotos = () => useTable("gallery_photos", { col: "created_at", asc: false });
export const usePrayerRequests = () =>
  useTable("prayer_requests", { col: "created_at", asc: false });
export const useEvents = () => useTable("events", { col: "starts_at", asc: true });
// Public-safe testimonies (no email column, only approved rows). Uses a DB view.
export const useTestimonies = () => {
  const result = useTable("testimonies_public", { col: "created_at", asc: false });
  return {
    ...result,
    data: result.data.filter(
      (
        row,
      ): row is Tables<"testimonies_public"> & {
        id: string;
        name: string;
        message: string;
        created_at: string;
      } => row.id !== null && row.name !== null && row.message !== null && row.created_at !== null,
    ),
  };
};
// Admin view of testimonies — includes email and pending rows. Requires admin role (RLS).
export const useTestimoniesAdmin = () => useTable("testimonies", { col: "created_at", asc: false });

export function usePastor() {
  const [pastor, setPastor] = useState<PastorProfile | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("pastor_profile").select("*").limit(1).maybeSingle();
      if (mounted) setPastor(data as PastorProfile | null);
    };
    load();
    const ch = supabase
      .channel("rt-pastor")
      .on("postgres_changes", { event: "*", schema: "public", table: "pastor_profile" }, () =>
        load(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
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
    const ch = supabase
      .channel("rt-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () =>
        load(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);
  return s;
}

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // defer role check
      setTimeout(async () => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
        setLoading(false);
      }, 0);
    });
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (!s) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id)
        .eq("role", "admin")
        .maybeSingle();
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
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
