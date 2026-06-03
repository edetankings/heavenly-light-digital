import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { Calendar, MapPin } from "lucide-react";
import { useEvents } from "@/lib/supabase-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Risen Power Gospel Ministries" }, { name: "description", content: "Upcoming services, revivals, and special programs." }] }),
  component: Events,
});

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Events() {
  const { data, loading } = useEvents();
  const upcoming = data.filter(e => !e.is_archived);

  return (
    <div>
      <PageHeader tag="What's Coming" title="Upcoming Events" subtitle="Mark your calendar and gather with us." />
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-5xl px-6 space-y-6">
          {loading && <p className="text-sm text-navy-muted text-center">Loading…</p>}
          {!loading && !upcoming.length && (
            <div className="glass-card p-10 text-center">
              <Calendar className="mx-auto text-navy mb-3" size={28} />
              <p className="text-navy-muted">No upcoming events. Check back soon.</p>
            </div>
          )}
          {upcoming.map((e, i) => {
            const d = new Date(e.starts_at);
            return (
              <Reveal key={e.id} delay={i * 0.06}>
                <article className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="bg-navy text-white text-center rounded-xl px-6 py-4 shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{MONTHS[d.getMonth()]}</p>
                    <p className="font-display text-4xl leading-none mt-1">{String(d.getDate()).padStart(2,"0")}</p>
                    <p className="text-[10px] text-white/60 mt-1">{d.getFullYear()}</p>
                  </div>
                  {e.cover_image && <img src={e.cover_image} alt={e.title} className="h-24 w-24 md:h-28 md:w-28 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <h3 className="font-display text-2xl text-navy">{e.title}</h3>
                    {e.description && <p className="text-navy-soft mt-2">{e.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-navy-muted">
                      <span className="inline-flex items-center gap-1.5"><Calendar size={12} /> {d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
                      {e.location && <span className="inline-flex items-center gap-1.5"><MapPin size={12} /> {e.location}</span>}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
