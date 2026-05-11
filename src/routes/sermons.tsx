import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/sermons")({
  head: () => ({ meta: [{ title: "Sermons — Risen Power Gospel Ministry" }, { name: "description", content: "Browse anointed messages from Risen Power Gospel Ministry." }] }),
  component: Sermons,
});

function Sermons() {
  const { sermons } = useStore();
  return (
    <div>
      <PageHeader tag="Sermon Archive" title="The Word, Alive & Active" subtitle="Anointed messages to feed your spirit and build your faith." />
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <article className="glass-card p-7 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <button className="grid h-14 w-14 place-items-center rounded-full bg-navy text-white hover:scale-110 transition">
                      <Play size={18} className="ml-0.5" />
                    </button>
                    <span className="rounded-full bg-navy text-white text-[10px] uppercase tracking-wider px-3 py-1">{s.type}</span>
                  </div>
                  <h3 className="font-display text-2xl text-navy mt-5">{s.title}</h3>
                  <p className="text-xs uppercase tracking-wider text-navy-muted mt-2">{s.preacher} · {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p className="text-sm italic text-navy-muted mt-2">{s.scripture}</p>
                  <p className="text-sm text-navy-soft mt-4 flex-1">{s.description}</p>
                  {s.audio && <audio controls src={s.audio} className="mt-5 w-full" />}
                </article>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/admin" className="text-xs uppercase tracking-[0.2em] text-navy-muted hover:text-navy">⚙ Admin Panel</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
