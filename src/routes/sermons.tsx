import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useSermons } from "@/lib/supabase-data";
import { AudioPlayer } from "@/components/site/AudioPlayer";
import { ShareMenu } from "@/components/site/ShareMenu";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — Risen Power Gospel Ministry" },
      { name: "description", content: "Browse and listen to anointed sermon messages from Risen Power Gospel Ministry." },
      { property: "og:title", content: "Sermons — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Browse and listen to anointed sermon messages from Risen Power Gospel Ministry." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/sermons` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/sermons` }],
  }),
  component: Sermons,
});

function Sermons() {
  const { data: sermons, loading } = useSermons();
  return (
    <div>
      <PageHeader tag="Sermon Archive" title="The Word, Alive & Active" subtitle="Anointed messages to feed your spirit and build your faith." />
      <section className="py-12 sm:py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading && <p className="text-center text-sm text-navy-muted">Loading sermons…</p>}
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((s, i) => (
              <Reveal key={s.id} delay={(i % 6) * 0.05}>
                <article className="glass-card p-6 sm:p-7 h-full flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-navy text-white text-[10px] uppercase tracking-wider px-3 py-1">{s.service_type}</span>
                    <span className="text-[10px] uppercase tracking-wider text-navy-muted">{new Date(s.preached_on).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl text-navy mt-4">{s.title}</h2>
                  <p className="text-xs uppercase tracking-wider text-navy-muted mt-1">{s.preacher}</p>
                  {s.scripture && <p className="text-sm italic text-navy-muted mt-2">{s.scripture}</p>}
                  {s.description && <p className="text-sm text-navy-soft mt-3 flex-1">{s.description}</p>}
                  {s.audio_url && (
                    <div className="mt-5">
                      <AudioPlayer
                        src={s.audio_url}
                        title={s.title}
                        downloadName={(s.audio_name || `${s.title}.mp3`).replace(/[[\\/:*?"<>|]/g, "-")}
                        allowDownload={s.allow_download !== false}
                      />
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
