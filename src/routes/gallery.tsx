import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useGalleryPhotos } from "@/lib/supabase-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Risen Power Gospel Ministry" }, { name: "description", content: "Worship moments and ministry highlights captured in pictures." }] }),
  component: Gallery,
});

function Gallery() {
  const { data: photos, loading } = useGalleryPhotos();
  return (
    <div>
      <PageHeader tag="Worship Gallery" title="Captured Moments of Glory" subtitle="Every photo is a testimony of His goodness." />
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading && <p className="text-center text-sm text-navy-muted">Loading…</p>}
          <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3">
            {photos.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
                  <img src={p.image_url} alt={p.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-3 sm:p-5 text-white">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/70">{p.category}</p>
                    <p className="font-display text-base sm:text-xl mt-1">{p.caption}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            {!loading && !photos.length && <p className="col-span-full text-center text-sm text-navy-muted">No photos yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
