import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal, SectionLabel } from "@/components/site/Section";
import { Quote } from "lucide-react";
import { useBlogPosts } from "@/lib/supabase-data";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Devotionals & Testimonies — Risen Power" }, { name: "description", content: "Daily devotionals and testimonies of God's power." }] }),
  component: Blog,
});

const testimonies = [
  { q: "After three years of unemployment, I got a job the same week I joined this house. God is faithful.", a: "Samuel I." },
  { q: "My mother was healed of stage-3 cancer after a prayer line. The doctors are still amazed!", a: "Blessing N." },
  { q: "I battled addiction for years. One altar call set me completely free. I am a new man.", a: "Tobi A." },
];

function Blog() {
  const { data: posts, loading } = useBlogPosts();
  return (
    <div>
      <PageHeader tag="Devotional & Testimony" title="Faith in Words" />
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>Latest Posts</SectionLabel>
          <h2 className="font-display text-3xl sm:text-4xl text-navy mb-8 sm:mb-10">Fresh Manna</h2>
          {loading && <p className="text-sm text-navy-muted">Loading…</p>}
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.published).map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <article className="glass-card overflow-hidden h-full flex flex-col">
                  {p.cover_image && <img src={p.cover_image} alt={p.title} loading="lazy" className="h-44 w-full object-cover" />}
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <p className="text-xs uppercase tracking-wider text-navy-muted">{new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{p.author ? ` · ${p.author}` : ""}</p>
                    <h3 className="font-display text-xl sm:text-2xl text-navy mt-2">{p.title}</h3>
                    {p.excerpt && <p className="text-navy-soft mt-3 flex-1">{p.excerpt}</p>}
                  </div>
                </article>
              </Reveal>
            ))}
            {!loading && !posts.length && <p className="text-sm text-navy-muted col-span-full">No posts yet.</p>}
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>Testimonies</SectionLabel>
          <h2 className="font-display text-3xl sm:text-4xl text-navy mb-8 sm:mb-10">He Still Does Wonders</h2>
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonies.map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card p-6 sm:p-8 h-full">
                  <Quote size={32} className="text-navy mb-3" />
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
