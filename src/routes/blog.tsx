import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal, SectionLabel } from "@/components/site/Section";
import { useBlogPosts } from "@/lib/supabase-data";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Devotionals — Risen Power Gospel Ministry" },
      { name: "description", content: "Daily devotionals and articles from Risen Power Gospel Ministry." },
      { property: "og:title", content: "Devotionals — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Daily devotionals and articles from Risen Power Gospel Ministry." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/blog` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/blog` }],
  }),
  component: Blog,
});

function Blog() {
  const { data: posts, loading } = useBlogPosts();
  return (
    <div>
      <PageHeader tag="Devotional" title="Faith in Words" />
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
    </div>
  );
}
