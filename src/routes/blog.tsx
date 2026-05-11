import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal, SectionLabel } from "@/components/site/Section";
import { BookOpen, Sun, Heart, Quote } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Devotionals & Testimonies — Risen Power" }, { name: "description", content: "Daily devotionals and testimonies of God's power." }] }),
  component: Blog,
});

const posts = [
  { Icon: Sun, d: "Apr 28, 2026", t: "Walking in Resurrection Power", b: "The same Spirit that raised Christ lives in you. Today, walk like a son of glory." },
  { Icon: BookOpen, d: "Apr 22, 2026", t: "The Discipline of Hearing God", b: "Intimacy with God begins with stillness. Posture your heart to listen today." },
  { Icon: Heart, d: "Apr 15, 2026", t: "Loving People God's Way", b: "Love is the proof of discipleship. Let your life become His invitation." },
];
const testimonies = [
  { q: "After three years of unemployment, I got a job the same week I joined this house. God is faithful.", a: "Samuel I." },
  { q: "My mother was healed of stage-3 cancer after a prayer line. The doctors are still amazed!", a: "Blessing N." },
  { q: "I battled addiction for years. One altar call set me completely free. I am a new man.", a: "Tobi A." },
];

function Blog() {
  return (
    <div>
      <PageHeader tag="Devotional & Testimony" title="Faith in Words" />
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionLabel>Daily Devotional</SectionLabel>
          <h2 className="font-display text-4xl text-navy mb-10">Fresh Manna</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <article className="glass-card p-7 h-full">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white mb-4"><p.Icon size={18} /></div>
                  <p className="text-xs uppercase tracking-wider text-navy-muted">{p.d}</p>
                  <h3 className="font-display text-2xl text-navy mt-2">{p.t}</h3>
                  <p className="text-navy-soft mt-3">{p.b}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <SectionLabel>Testimonies</SectionLabel>
          <h2 className="font-display text-4xl text-navy mb-10">He Still Does Wonders</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonies.map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card p-8 h-full">
                  <Quote size={36} className="text-navy mb-3" />
                  <p className="text-navy-soft italic leading-relaxed">"{t.q}"</p>
                  <p className="mt-5 font-semibold text-navy">— {t.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
