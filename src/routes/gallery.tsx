import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Risen Power Gospel Ministry" }, { name: "description", content: "Worship moments and ministry highlights captured in pictures." }] }),
  component: Gallery,
});

function Gallery() {
  const { photos } = useStore();
  return (
    <div>
      <PageHeader tag="Worship Gallery" title="Captured Moments of Glory" subtitle="Every photo is a testimony of His goodness." />
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {photos.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
                  <img src={p.src} alt={p.caption} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-5 text-white">
                    <p className="text-[10px] uppercase tracking-wider text-white/70">{p.category} · {p.year}</p>
                    <p className="font-display text-xl mt-1">{p.caption}</p>
                  </div>
                </div>
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
