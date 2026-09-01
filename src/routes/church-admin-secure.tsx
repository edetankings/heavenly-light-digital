import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { Lock, LogOut, Flame, Trash2, Megaphone, BookOpen, Mic, ImageIcon, User, MessageSquare, Radio, Plus, Edit3, X, Save, Calendar, Heart, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useAnnouncements, useBlogPosts, useSermons, useGalleryPhotos, usePastor, useSiteSettings, usePrayerRequests, useEvents, useTestimoniesAdmin, uploadToBucket } from "@/lib/supabase-data";

const ALLOWED_ADMIN_EMAIL = "edetankings@gmail.com";
const MAX_ADMIN_DEVICES = 5;

function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("rpgm_device_id");
  if (!id) {
    id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) + "-" + Date.now().toString(36);
    localStorage.setItem("rpgm_device_id", id);
  }
  return id;
}

async function registerDeviceSession(userId: string) {
  const deviceId = getDeviceId();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null;
  // Upsert current device
  await supabase.from("admin_sessions").upsert(
    { user_id: userId, device_id: deviceId, user_agent: userAgent, last_seen_at: new Date().toISOString() },
    { onConflict: "user_id,device_id" }
  );
  // Enforce max devices: keep newest MAX, delete the rest
  const { data: rows } = await supabase
    .from("admin_sessions")
    .select("id,device_id,last_seen_at")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false });
  if (rows && rows.length > MAX_ADMIN_DEVICES) {
    const stale = rows.slice(MAX_ADMIN_DEVICES).map(r => (r as any).id);
    if (stale.length) await supabase.from("admin_sessions").delete().in("id", stale);
  }
}

export const Route = createFileRoute("/church-admin-secure")({
  head: () => ({ meta: [{ title: "Secure Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { session, isAdmin, loading } = useAuthSession();
  useEffect(() => {
    if (session?.user?.id && isAdmin) {
      registerDeviceSession(session.user.id).catch(() => {});
    }
  }, [session?.user?.id, isAdmin]);
  if (loading) return <div className="min-h-screen grid place-items-center bg-surface-alt"><p className="text-sm text-navy-muted">Loading…</p></div>;
  if (!session) return <AuthScreen mode="signin" />;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center bg-surface-alt px-4 text-center">
      <div className="max-w-sm">
        <p className="font-display text-3xl text-navy">Access Denied</p>
        <p className="text-sm text-navy-muted mt-2">This account is not authorized.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-md bg-navy text-white px-5 py-2.5 text-sm">Sign out</button>
      </div>
    </div>
  );
  return <Dashboard />;
}

function AuthScreen({ mode: initial }: { mode: "signin" | "signup" }) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initial);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "");
    setBusy(true);
    try {
      if (email && email !== ALLOWED_ADMIN_EMAIL) {
        throw new Error("This email is not authorized for admin access.");
      }
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/church-admin-secure`;
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      } else {
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        toast.success("Password reset email sent. Check your inbox.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-surface-alt px-4 py-10">
      <div className="w-full max-w-sm glass-card p-7 sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy text-white"><Lock size={18} /></div>
          <h1 className="font-display text-2xl sm:text-3xl text-navy mt-4">Secure Admin</h1>
          <p className="text-xs text-navy-muted mt-1">Authorized personnel only</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          {mode !== "forgot" && (
            <input name="password" type="password" required minLength={8} placeholder="Password (min 8)" className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          )}
          <button disabled={busy} type="submit" className="w-full rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset email" : "Sign in"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-xs text-navy-muted">
          {mode === "signin" && (
            <>
              <button type="button" onClick={() => setMode("forgot")} className="hover:text-navy">Forgot password?</button>
              <button type="button" onClick={() => setMode("signup")} className="hover:text-navy">First time? Create account</button>
            </>
          )}
          {mode === "signup" && (
            <button type="button" onClick={() => setMode("signin")} className="hover:text-navy">Already have an account? Sign in</button>
          )}
          {mode === "forgot" && (
            <button type="button" onClick={() => setMode("signin")} className="hover:text-navy">← Back to sign in</button>
          )}
        </div>
        <Link to="/" className="block mt-3 text-center text-xs text-navy-muted hover:text-navy">← Back to site</Link>
      </div>
    </div>
  );
}

type Tab = "announcements" | "events" | "testimonies" | "pastor" | "blog" | "sermons" | "gallery" | "prayers" | "live";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("announcements");
  const tabs: { k: Tab; l: string; Icon: any }[] = [
    { k: "announcements", l: "Announcements", Icon: Megaphone },
    { k: "events", l: "Events", Icon: Calendar },
    { k: "testimonies", l: "Testimonies", Icon: Heart },
    { k: "pastor", l: "Pastor", Icon: User },
    { k: "blog", l: "Blog", Icon: BookOpen },
    { k: "sermons", l: "Sermons", Icon: Mic },
    { k: "gallery", l: "Gallery", Icon: ImageIcon },
    { k: "prayers", l: "Prayers", Icon: MessageSquare },
    { k: "live", l: "Live", Icon: Radio },
  ];
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-white"><Flame size={16} /></span>
            <div className="min-w-0">
              <p className="font-display text-base sm:text-lg text-navy leading-tight truncate">Admin Dashboard</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-navy-muted truncate">Risen Power CMS</p>
            </div>
          </Link>
          <button onClick={async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) await supabase.from("admin_sessions").delete().eq("user_id", user.id).eq("device_id", getDeviceId());
            } catch {}
            await supabase.auth.signOut();
          }} className="inline-flex items-center gap-2 rounded-md border border-border px-3 sm:px-4 py-2 text-xs sm:text-sm text-navy hover:bg-surface"><LogOut size={14} /><span className="hidden sm:inline">Logout</span></button>
        </div>
        <nav className="mx-auto max-w-7xl px-2 sm:px-4 pb-3 flex gap-1 sm:gap-2 overflow-x-auto">
          {tabs.map(({ k, l, Icon }) => (
            <button key={k} onClick={() => setTab(k)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition border ${tab === k ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-navy"}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "events" && <EventsTab />}
        {tab === "testimonies" && <TestimoniesTab />}
        {tab === "pastor" && <PastorTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "sermons" && <SermonsTab />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "prayers" && <PrayersTab />}
        {tab === "live" && <LiveTab />}
      </main>
    </div>
  );
}

/* ---------- ANNOUNCEMENTS ---------- */
function AnnouncementsTab() {
  const { all } = useAnnouncements();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { title: String(fd.get("title")), body: String(fd.get("body")), is_active: fd.get("is_active") === "on", ends_at: String(fd.get("ends_at") || "") || null };
    const { error } = editing
      ? await supabase.from("announcements").update(payload).eq("id", editing.id)
      : await supabase.from("announcements").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Announcement updated" : "Announcement created");
    setOpen(false); setEditing(null);
  };
  const del = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl text-navy">Announcements</h2>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-navy text-white px-4 py-2 text-sm hover:opacity-90"><Plus size={14} /> New</button>
      </div>
      {open && (
        <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-3">
          <Input name="title" placeholder="Title" defaultValue={editing?.title} required />
          <textarea name="body" required defaultValue={editing?.body} placeholder="Announcement body" rows={3} className="rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          <Input type="datetime-local" name="ends_at" defaultValue={editing?.ends_at?.slice(0, 16)} />
          <label className="inline-flex items-center gap-2 text-sm text-navy"><input type="checkbox" name="is_active" defaultChecked={editing ? editing.is_active : true} /> Active</label>
          <div className="flex gap-2">
            <button className="rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="rounded-md border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid gap-3">
        {all.map(a => (
          <div key={a.id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy">{a.title} {!a.is_active && <span className="ml-2 text-[10px] uppercase tracking-wider text-navy-muted">Inactive</span>}</p>
              <p className="text-sm text-navy-soft mt-1">{a.body}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing(a); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy"><Edit3 size={14} /></button>
              <button onClick={() => del(a.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!all.length && <p className="text-sm text-navy-muted">No announcements yet.</p>}
      </div>
    </section>
  );
}

/* ---------- PASTOR ---------- */
function PastorTab() {
  const pastor = usePastor();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  if (!pastor) return <p className="text-sm text-navy-muted">Loading…</p>;

  const onPhoto = async (f: File) => {
    setUploading(true);
    try { const url = await uploadToBucket("pastor-photos", f); setPhoto(url); toast.success("Photo uploaded — click Save"); }
    catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = { name: String(fd.get("name")), title: String(fd.get("title")), short_message: String(fd.get("short_message")), bio: String(fd.get("bio")) };
    if (photo) payload.photo_url = photo;
    const { error } = await supabase.from("pastor_profile").update(payload).eq("id", pastor.id);
    if (error) return toast.error(error.message);
    toast.success("Pastor profile updated");
    setPhoto(null);
  };

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl sm:text-3xl text-navy">Pastor Profile</h2>
      <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-3">
          <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border bg-surface">
            <img src={photo || pastor.photo_url || ""} alt={pastor.name} className="h-full w-full object-cover" />
          </div>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-navy-muted mb-1">Change photo</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} className="block w-full text-xs text-navy" />
            {uploading && <p className="text-xs text-navy-muted mt-1">Uploading…</p>}
          </label>
        </div>
        <div className="md:col-span-2 grid gap-3">
          <Input name="name" defaultValue={pastor.name} placeholder="Name" required />
          <Input name="title" defaultValue={pastor.title} placeholder="Title" required />
          <Input name="short_message" defaultValue={pastor.short_message || ""} placeholder="Short message (one line)" />
          <textarea name="bio" defaultValue={pastor.bio || ""} placeholder="Bio / message" rows={6} className="rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          <button className="self-start rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save changes</button>
        </div>
      </form>
    </section>
  );
}

/* ---------- BLOG ---------- */
function BlogTab() {
  const { data: posts } = useBlogPosts();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setCover(editing?.cover_image || null); }, [editing]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || crypto.randomUUID();
  const onCover = async (f: File) => {
    setUploading(true);
    try { const url = await uploadToBucket("blog-images", f); setCover(url); toast.success("Cover uploaded"); }
    catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title"));
    const payload: any = {
      title, slug: editing?.slug || slugify(title),
      excerpt: String(fd.get("excerpt") || ""), body: String(fd.get("body")),
      author: String(fd.get("author") || ""), cover_image: cover,
      published: fd.get("published") === "on",
    };
    const { error } = editing
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Post updated" : "Post created");
    setOpen(false); setEditing(null); setCover(null);
  };
  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl text-navy">Blog Posts</h2>
        <button onClick={() => { setEditing(null); setCover(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-navy text-white px-4 py-2 text-sm"><Plus size={14} /> New</button>
      </div>
      {open && (
        <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-3">
          <Input name="title" placeholder="Title" defaultValue={editing?.title} required />
          <Input name="author" placeholder="Author" defaultValue={editing?.author || ""} />
          <Input name="excerpt" placeholder="Short excerpt" defaultValue={editing?.excerpt || ""} />
          <textarea name="body" required defaultValue={editing?.body} placeholder="Post body" rows={8} className="rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          <div>
            {cover && <img src={cover} alt="" className="mb-2 h-32 w-full object-cover rounded-md border border-border" />}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} className="text-xs text-navy" />
            {uploading && <p className="text-xs text-navy-muted">Uploading…</p>}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-navy"><input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} /> Published</label>
          <div className="flex gap-2">
            <button className="rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => { setOpen(false); setEditing(null); setCover(null); }} className="rounded-md border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid gap-3">
        {posts.map(p => (
          <div key={p.id} className="glass-card p-4 flex items-center gap-3">
            {p.cover_image && <img src={p.cover_image} alt="" className="h-14 w-14 rounded-md object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy truncate">{p.title}</p>
              <p className="text-xs text-navy-muted truncate">{new Date(p.published_at).toLocaleDateString()} {p.author ? `· ${p.author}` : ""} {!p.published && "· Draft"}</p>
            </div>
            <button onClick={() => { setEditing(p); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy shrink-0"><Edit3 size={14} /></button>
            <button onClick={() => del(p.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
        {!posts.length && <p className="text-sm text-navy-muted">No posts yet.</p>}
      </div>
    </section>
  );
}

/* ---------- SERMONS ---------- */
function SermonsTab() {
  const { data: sermons } = useSermons();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [audio, setAudio] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setAudio(editing?.audio_url ? { url: editing.audio_url, name: editing.audio_name || "audio" } : null); }, [editing]);

  const onAudio = async (f: File) => {
    setUploading(true);
    try { const url = await uploadToBucket("sermon-audio", f); setAudio({ url, name: f.name }); toast.success("Audio uploaded"); }
    catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      title: String(fd.get("title")), preacher: String(fd.get("preacher")),
      preached_on: String(fd.get("preached_on")), service_type: String(fd.get("service_type")),
      scripture: String(fd.get("scripture") || ""), description: String(fd.get("description") || ""),
      audio_url: audio?.url || null, audio_name: audio?.name || null,
      allow_download: fd.get("allow_download") === "on",
    };
    const { error } = editing
      ? await supabase.from("sermons").update(payload).eq("id", editing.id)
      : await supabase.from("sermons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Sermon updated" : "Sermon added");
    setOpen(false); setEditing(null); setAudio(null);
  };
  const del = async (id: string) => {
    if (!confirm("Delete this sermon?")) return;
    const { error } = await supabase.from("sermons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl text-navy">Sermons</h2>
        <button onClick={() => { setEditing(null); setAudio(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-navy text-white px-4 py-2 text-sm"><Plus size={14} /> New</button>
      </div>
      {open && (
        <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-3 sm:grid-cols-2">
          <Input name="title" placeholder="Title" defaultValue={editing?.title} required />
          <Input name="preacher" placeholder="Preacher" defaultValue={editing?.preacher} required />
          <Input type="date" name="preached_on" defaultValue={editing?.preached_on} required />
          <Select name="service_type" defaultValue={editing?.service_type} options={["Sunday Service","Midweek Bible Study","Friday Vigil","Special Program","Crusade"]} />
          <Input name="scripture" placeholder="Scripture (e.g. John 3:16)" defaultValue={editing?.scripture || ""} />
          <Input name="description" placeholder="Short description" defaultValue={editing?.description || ""} />
          <div className="sm:col-span-2">
            <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && onAudio(e.target.files[0])} className="text-xs text-navy" />
            {uploading && <p className="text-xs text-navy-muted">Uploading…</p>}
            {audio && <p className="text-xs text-navy mt-1">📎 {audio.name}</p>}
          </div>
          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="allow_download" defaultChecked={editing ? editing.allow_download !== false : true} className="h-4 w-4 accent-navy" />
            Allow visitors to download this audio
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button className="rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => { setOpen(false); setEditing(null); setAudio(null); }} className="rounded-md border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid gap-3">
        {sermons.map(s => (
          <div key={s.id} className="glass-card p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy truncate">{s.title}</p>
              <p className="text-xs text-navy-muted truncate">{s.preacher} · {new Date(s.preached_on).toLocaleDateString()} · {s.service_type}</p>
            </div>
            <button onClick={() => { setEditing(s); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy shrink-0"><Edit3 size={14} /></button>
            <button onClick={() => del(s.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
        {!sermons.length && <p className="text-sm text-navy-muted">No sermons yet.</p>}
      </div>
    </section>
  );
}

/* ---------- GALLERY ---------- */
function GalleryTab() {
  const { data: photos } = useGalleryPhotos();
  const [pending, setPending] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const onFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const f of files) {
        const url = await uploadToBucket("gallery-images", f);
        setPending(p => [...p, { url, name: f.name }]);
      }
    } catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pending.length) return toast.error("Upload at least one photo");
    const fd = new FormData(e.currentTarget);
    const rows = pending.map(p => ({
      caption: String(fd.get("caption")), category: String(fd.get("category")),
      description: String(fd.get("description") || ""), image_url: p.url,
      taken_on: String(fd.get("taken_on") || "") || null,
      allow_download: fd.get("allow_download") === "on",
    }));
    const { error } = await supabase.from("gallery_photos").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Uploaded ${rows.length} photo(s)`);
    setPending([]); e.currentTarget.reset();
  };
  const del = async (id: string, imageUrl?: string) => {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    // best-effort remove the stored file too
    try {
      const marker = "/gallery-images/";
      const idx = imageUrl?.indexOf(marker) ?? -1;
      if (imageUrl && idx > -1) {
        const path = decodeURIComponent(imageUrl.slice(idx + marker.length).split("?")[0]);
        await supabase.storage.from("gallery-images").remove([path]);
      }
    } catch { /* ignore storage cleanup failure */ }
    toast.success("Deleted");
  };


  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl sm:text-3xl text-navy">Gallery</h2>
      <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-3 sm:grid-cols-2">
        <Input name="caption" placeholder="Caption" required />
        <Select name="category" options={["Sunday Service","Crusade","Youth Program","Women's Fellowship","Men's Fellowship","Outreach","Special Event"]} />
        <Input type="date" name="taken_on" />
        <Input name="description" placeholder="Description" />
        <div className="sm:col-span-2">
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))} className="text-xs text-navy" />
          {uploading && <p className="text-xs text-navy-muted">Uploading…</p>}
          {pending.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {pending.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setPending(arr => arr.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-navy"><X size={10} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="allow_download" defaultChecked className="h-4 w-4 accent-navy" />
          Allow visitors to download these photos
        </label>
        <button className="sm:col-span-2 rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2"><Save size={14} /> Save photos</button>
      </form>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map(p => (
          <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
            <img src={p.image_url} alt={p.caption} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 to-transparent p-3 text-white">
              <p className="text-[10px] uppercase tracking-wider text-white/70 truncate">{p.category}</p>
              <p className="text-sm truncate">{p.caption}</p>
            </div>
            <button type="button" onClick={() => del(p.id, p.image_url)} aria-label={`Delete photo ${p.caption}`} className="absolute top-2 right-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-destructive text-white shadow-md hover:scale-105 transition"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- PRAYERS ---------- */
function PrayersTab() {
  const { data: prayers } = usePrayerRequests();
  const del = async (id: string) => {
    if (!confirm("Delete this prayer request?")) return;
    const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl sm:text-3xl text-navy">Prayer Requests</h2>
      <div className="grid gap-3">
        {prayers.map(p => (
          <div key={p.id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-start">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy">{p.name} <span className="ml-2 text-[10px] uppercase tracking-wider text-navy-muted">{p.prayer_type}</span></p>
              {p.email && <p className="text-xs text-navy-muted">✉ <a href={`mailto:${p.email}`} className="underline">{p.email}</a></p>}
              <p className="text-sm text-navy-soft mt-1">{p.message}</p>
              <p className="text-[10px] text-navy-muted mt-2">{new Date(p.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => del(p.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
        {!prayers.length && <p className="text-sm text-navy-muted">No prayer requests yet.</p>}
      </div>
    </section>
  );
}

/* ---------- LIVE ---------- */
function LiveTab() {
  const settings = useSiteSettings();
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(settings?.live_url || ""); }, [settings]);
  const save = async () => {
    const { error } = await supabase.from("site_settings").update({ live_url: url }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Live URL updated");
  };
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl sm:text-3xl text-navy">Live Stream URL</h2>
      <div className="glass-card p-5 sm:p-7 space-y-3">
        <p className="text-sm text-navy-muted">Paste the YouTube or Facebook live URL. Leave blank to show the offline state.</p>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        <button onClick={save} className="rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save</button>
      </div>
    </section>
  );
}

/* ---------- shared ---------- */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy w-full" />;
}
function Select({ options, ...props }: { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className="rounded-md border border-border bg-white px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy w-full">
      <option value="">Select…</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

/* ---------- EVENTS ---------- */
function EventsTab() {
  const { data: events } = useEvents();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { setCover(editing?.cover_image || null); }, [editing]);

  const onCover = async (f: File) => {
    setUploading(true);
    try { const url = await uploadToBucket("gallery-images", f); setCover(url); toast.success("Image uploaded"); }
    catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      title: String(fd.get("title")), description: String(fd.get("description") || ""),
      starts_at: new Date(String(fd.get("starts_at"))).toISOString(),
      location: String(fd.get("location") || ""), cover_image: cover, is_archived: false,
    };
    const { error } = editing
      ? await (supabase.from as any)("events").update(payload).eq("id", editing.id)
      : await (supabase.from as any)("events").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Event updated" : "Event created");
    setOpen(false); setEditing(null); setCover(null);
  };
  const archive = async (id: string) => {
    const { error } = await (supabase.from as any)("events").update({ is_archived: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Archived");
  };
  const del = async (id: string) => {
    if (!confirm("Delete this event permanently?")) return;
    const { error } = await (supabase.from as any)("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  const upcoming = events.filter((e: any) => !e.is_archived);
  const archived = events.filter((e: any) => e.is_archived);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl text-navy">Events</h2>
        <button onClick={() => { setEditing(null); setCover(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-navy text-white px-4 py-2 text-sm"><Plus size={14} /> New</button>
      </div>
      {open && (
        <form onSubmit={save} className="glass-card p-5 sm:p-7 grid gap-3 sm:grid-cols-2">
          <Input name="title" placeholder="Event title" defaultValue={editing?.title} required />
          <Input type="datetime-local" name="starts_at" defaultValue={editing?.starts_at?.slice(0,16)} required />
          <Input name="location" placeholder="Location" defaultValue={editing?.location || ""} />
          <div>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} className="text-xs text-navy" />
            {uploading && <p className="text-xs text-navy-muted">Uploading…</p>}
            {cover && <img src={cover} alt="" className="mt-2 h-20 rounded-md object-cover" />}
          </div>
          <textarea name="description" defaultValue={editing?.description || ""} placeholder="Description" rows={3} className="sm:col-span-2 rounded-md border border-border px-4 py-3 text-sm" />
          <div className="sm:col-span-2 flex gap-2">
            <button className="rounded-md bg-navy text-white px-5 py-2.5 text-sm inline-flex items-center gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => { setOpen(false); setEditing(null); setCover(null); }} className="rounded-md border border-border px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid gap-3">
        <p className="text-xs uppercase tracking-wider text-navy-muted">Upcoming</p>
        {upcoming.map((e: any) => (
          <div key={e.id} className="glass-card p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy truncate">{e.title}</p>
              <p className="text-xs text-navy-muted">{new Date(e.starts_at).toLocaleString()} {e.location ? `· ${e.location}` : ""}</p>
            </div>
            <button onClick={() => { setEditing(e); setOpen(true); }} className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy"><Edit3 size={14} /></button>
            <button onClick={() => archive(e.id)} title="Archive" className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy"><X size={14} /></button>
            <button onClick={() => del(e.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white"><Trash2 size={14} /></button>
          </div>
        ))}
        {!upcoming.length && <p className="text-sm text-navy-muted">No upcoming events.</p>}
        {archived.length > 0 && <>
          <p className="text-xs uppercase tracking-wider text-navy-muted mt-4">Archived</p>
          {archived.map((e: any) => (
            <div key={e.id} className="glass-card p-4 flex items-center gap-3 opacity-70">
              <div className="flex-1 min-w-0"><p className="font-medium text-navy truncate">{e.title}</p><p className="text-xs text-navy-muted">{new Date(e.starts_at).toLocaleDateString()}</p></div>
              <button onClick={() => del(e.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white"><Trash2 size={14} /></button>
            </div>
          ))}
        </>}
      </div>
    </section>
  );
}

/* ---------- TESTIMONIES ---------- */
function TestimoniesTab() {
  const { data: items } = useTestimoniesAdmin();
  const toggle = async (id: string, val: boolean) => {
    const { error } = await (supabase.from as any)("testimonies").update({ is_approved: val }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(val ? "Published" : "Unpublished");
  };
  const del = async (id: string) => {
    if (!confirm("Delete this testimony?")) return;
    const { error } = await (supabase.from as any)("testimonies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl sm:text-3xl text-navy">Testimonies</h2>
      <div className="grid gap-3">
        {items.map((t: any) => (
          <div key={t.id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-start">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-navy">{t.name} {t.is_approved ? <span className="ml-2 text-[10px] uppercase tracking-wider text-green-700">Published</span> : <span className="ml-2 text-[10px] uppercase tracking-wider text-navy-muted">Pending</span>}</p>
              {t.email && <p className="text-xs text-navy-muted">✉ {t.email}</p>}
              {t.title && <p className="text-sm text-navy mt-1 font-medium">{t.title}</p>}
              <p className="text-sm text-navy-soft mt-1">{t.message}</p>
              <p className="text-[10px] text-navy-muted mt-2">{new Date(t.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggle(t.id, !t.is_approved)} title={t.is_approved ? "Unpublish" : "Approve"} className="grid h-9 w-9 place-items-center rounded-md border border-border text-navy"><Check size={14} /></button>
              <button onClick={() => del(t.id)} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-navy-muted">No testimonies yet.</p>}
      </div>
    </section>
  );
}
