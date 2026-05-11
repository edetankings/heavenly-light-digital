import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, FormEvent, DragEvent } from "react";
import { toast } from "sonner";
import { Music, Camera, Trash2, Upload, LogOut, Lock, Flame } from "lucide-react";
import { useStore, actions } from "@/lib/store";

export const Route = createFileRoute("/portal-rpgm-2026-x9k")({
  head: () => ({ meta: [{ title: "Portal" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

const ADMIN_USER = "admin";
const ADMIN_PASS = "risenpower2026";
const KEY = "rpgm-admin-auth";

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); setAuthed(localStorage.getItem(KEY) === "1"); }, []);
  if (!mounted) return null;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;
  return <Panel onLogout={() => { localStorage.removeItem(KEY); setAuthed(false); }} />;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [err, setErr] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("u") === ADMIN_USER && fd.get("p") === ADMIN_PASS) {
      localStorage.setItem(KEY, "1");
      onSuccess();
      toast.success("Welcome back, Pastor.");
    } else setErr("Invalid credentials");
  };
  return (
    <div className="min-h-screen grid place-items-center bg-surface-alt px-4">
      <div className="w-full max-w-sm glass-card p-8">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy text-white"><Lock size={18} /></div>
          <h1 className="font-display text-3xl text-navy mt-4">Admin Access</h1>
          <p className="text-sm text-navy-muted mt-1">Risen Power Gospel Ministry</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input name="u" required placeholder="Username" className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          <input name="p" type="password" required placeholder="Password" className="w-full rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button type="submit" className="w-full rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90">Sign In</button>
        </form>
        <Link to="/" className="block mt-5 text-center text-xs text-navy-muted hover:text-navy">← Back to site</Link>
      </div>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const { sermons, photos, prayers } = useStore();
  const [tab, setTab] = useState<"sermons" | "photos" | "manage">("sermons");

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-white"><Flame size={16} /></span>
            <div>
              <p className="font-display text-lg text-navy leading-tight">Admin Dashboard</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-navy-muted">Risen Power CMS</p>
            </div>
          </Link>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-navy hover:bg-surface"><LogOut size={14} /> Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-3 mb-10">
          {[["Total Sermons", sermons.length], ["Total Photos", photos.length], ["Prayer Requests", prayers.length]].map(([t, n]) => (
            <div key={t as string} className="glass-card p-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-navy-muted">{t}</p>
              <p className="font-display text-5xl text-navy mt-2">{n}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[["sermons","Sermons"],["photos","Photos"],["manage","Manage All"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as any)} className={`px-5 py-2.5 rounded-md text-sm font-medium border transition ${tab === k ? "bg-navy text-white border-navy" : "bg-white text-navy border-border hover:border-navy"}`}>{l}</button>
          ))}
        </div>

        {tab === "sermons" && <SermonForm />}
        {tab === "photos" && <PhotoForm />}
        {tab === "manage" && <ManageAll />}
      </div>
    </div>
  );
}

function FileDrop({ accept, multiple, onFiles, icon: Icon, hint }: { accept: string; multiple?: boolean; onFiles: (files: File[]) => void; icon: any; hint: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${over ? "border-navy bg-surface" : "border-navy/30 bg-white hover:bg-surface"}`}
    >
      <Icon size={32} className="mx-auto text-navy mb-3" />
      <p className="text-sm text-navy">{hint}</p>
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => onFiles(Array.from(e.target.files || []))} />
    </div>
  );
}

const readAsDataURL = (f: File) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f); });

function SermonForm() {
  const [audio, setAudio] = useState<{ name: string; data: string } | null>(null);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    actions.addSermon({
      title: String(fd.get("title")), preacher: String(fd.get("preacher")), date: String(fd.get("date")),
      year: String(fd.get("year")), type: String(fd.get("type")), scripture: String(fd.get("scripture")),
      description: String(fd.get("description")), audio: audio?.data, audioName: audio?.name,
    });
    e.currentTarget.reset();
    setAudio(null);
    toast.success("Sermon added to the website.");
  };
  return (
    <form onSubmit={submit} className="glass-card p-8 grid gap-4 md:grid-cols-2">
      <Input name="title" placeholder="Sermon Title" required />
      <Input name="preacher" placeholder="Preacher Name" required />
      <Input type="date" name="date" required />
      <Input name="year" placeholder="Year (e.g. 2026)" required />
      <Select name="type" required options={["Sunday Service","Midweek Bible Study","Friday Vigil","Special Program","Crusade"]} />
      <Input name="scripture" placeholder="Scripture (e.g. John 3:16)" required />
      <textarea name="description" required placeholder="Sermon description..." rows={4} className="md:col-span-2 rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
      <div className="md:col-span-2">
        <FileDrop accept="audio/*" icon={Music} hint="Drop audio file or click to browse (MP3, WAV, M4A, OGG)" onFiles={async (files) => {
          const f = files[0]; if (!f) return;
          const data = await readAsDataURL(f);
          setAudio({ name: f.name, data });
        }} />
        {audio && <p className="mt-2 text-sm text-navy">📎 {audio.name}</p>}
      </div>
      <button className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90"><Upload size={14} /> Add Sermon to Website</button>
    </form>
  );
}

function PhotoForm() {
  const [pending, setPending] = useState<{ name: string; src: string }[]>([]);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pending.length) return toast.error("Please add at least one photo.");
    const fd = new FormData(e.currentTarget);
    actions.addPhotos(pending.map(p => ({
      caption: String(fd.get("caption")), date: String(fd.get("date")), year: String(fd.get("year")),
      category: String(fd.get("category")), description: String(fd.get("description")), src: p.src,
    })));
    e.currentTarget.reset();
    setPending([]);
    toast.success(`Uploaded ${pending.length} photo(s) to the website.`);
  };
  return (
    <form onSubmit={submit} className="glass-card p-8 grid gap-4 md:grid-cols-2">
      <Input name="caption" placeholder="Event Caption" required />
      <Input type="date" name="date" required />
      <Input name="year" placeholder="Year" required />
      <Select name="category" required options={["Sunday Service","Crusade","Youth Program","Women's Fellowship","Men's Fellowship","Outreach","Special Event"]} />
      <textarea name="description" placeholder="Photo description..." rows={3} className="md:col-span-2 rounded-md border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy" />
      <div className="md:col-span-2">
        <FileDrop accept="image/*" multiple icon={Camera} hint="Drop photos or click to browse (JPG, PNG, WEBP)" onFiles={async (files) => {
          const out = await Promise.all(files.map(async (f) => ({ name: f.name, src: await readAsDataURL(f) })));
          setPending(p => [...p, ...out]);
        }} />
        {pending.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            {pending.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
                <img src={p.src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setPending(arr => arr.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-navy hover:bg-destructive hover:text-white">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90"><Upload size={14} /> Upload Photos to Website</button>
    </form>
  );
}

function ManageAll() {
  const { sermons, photos } = useStore();
  return (
    <div className="space-y-10">
      <section>
        <h3 className="font-display text-2xl text-navy mb-4">All Sermons</h3>
        <div className="space-y-2">
          {sermons.map(s => (
            <div key={s.id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-navy truncate">{s.title}</p>
                <p className="text-xs text-navy-muted">{s.preacher} · {s.date} · {s.type}</p>
              </div>
              <button onClick={() => { actions.removeSermon(s.id); toast.success("Sermon deleted."); }} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white hover:opacity-90"><Trash2 size={14} /></button>
            </div>
          ))}
          {!sermons.length && <p className="text-sm text-navy-muted">No sermons yet.</p>}
        </div>
      </section>
      <section>
        <h3 className="font-display text-2xl text-navy mb-4">All Photos</h3>
        <div className="space-y-2">
          {photos.map(p => (
            <div key={p.id} className="glass-card p-3 flex items-center gap-4">
              <img src={p.src} alt="" className="h-14 w-14 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy truncate">{p.caption}</p>
                <p className="text-xs text-navy-muted">{p.category} · {p.date}</p>
              </div>
              <button onClick={() => { actions.removePhoto(p.id); toast.success("Photo deleted."); }} className="grid h-9 w-9 place-items-center rounded-md bg-destructive text-white hover:opacity-90"><Trash2 size={14} /></button>
            </div>
          ))}
          {!photos.length && <p className="text-sm text-navy-muted">No photos yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />;
}
function Select({ options, ...props }: { options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} defaultValue="" className="rounded-md border border-border bg-white px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy">
      <option value="" disabled>Select {props.name}...</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}
