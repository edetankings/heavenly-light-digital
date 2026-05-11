import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Risen Power Gospel Ministry" }, { name: "description", content: "Upcoming services, revivals, and special programs." }] }),
  component: Events,
});

const events = [
  { m: "May", d: "18", t: "Holy Ghost Night", b: "An all-night encounter with the Spirit of God. Expect fire, expect breakthrough." },
  { m: "May", d: "25", t: "Youth Revival", b: "A powerful gathering for the next generation. Worship, the Word, and impartation." },
  { m: "Jun", d: "01", t: "Couples Summit", b: "Building Christ-centered marriages — a day of teaching, prayer, and renewal." },
  { m: "Jun", d: "15", t: "Evangelism Outreach", b: "Taking the gospel to the streets of Port Harcourt. Souls will be saved." },
];

function Events() {
  return (
    <div>
      <PageHeader tag="What's Coming" title="Upcoming Events" subtitle="Mark your calendar and gather with us." />
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-5xl px-6 space-y-6">
          {events.map((e, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <article className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="bg-navy text-white text-center rounded-xl px-6 py-4 shrink-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{e.m}</p>
                  <p className="font-display text-4xl leading-none mt-1">{e.d}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-navy">{e.t}</h3>
                  <p className="text-navy-soft mt-2">{e.b}</p>
                </div>
                <Calendar className="text-navy hidden md:block" size={22} />
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
