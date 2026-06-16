import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useGalleryPhotos } from "@/lib/supabase-data";
import { useState } from "react";
import { X, Download } from "lucide-react";
import { ShareMenu, downloadFile } from "@/components/site/ShareMenu";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Risen Power Gospel Ministry" },
      { name: "description", content: "Worship moments and ministry highlights from Risen Power Gospel Ministry captured in pictures." },
      { property: "og:title", content: "Gallery — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Worship moments and ministry highlights captured in pictures." },
      { property: "og:url", content: "https://risenpower.lovable.app/gallery" },
    ],
    links: [{ rel: "canonical", href: "https://risenpower.lovable.app/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const { data: photos, loading } = useGalleryPhotos();
  const [active, setActive] = useState<number | null>(null);
  const activePhoto = active !== null ? photos[active] : null;
  return (
    <div>
      <PageHeader tag="Worship Gallery" title="Captured Moments of Glory" subtitle="Every photo is a testimony of His goodness." />
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading && <p className="text-center text-sm text-navy-muted">Loading…</p>}
          <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3">
            {photos.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 0.05}>
                <button type="button" onClick={() => setActive(i)} className="group relative aspect-[4/5] block w-full overflow-hidden rounded-xl bg-surface cursor-zoom-in">
                  <img src={p.image_url} alt={p.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-3 sm:p-5 text-white">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/70">{p.category}</p>
                    <p className="font-display text-base sm:text-xl mt-1 text-left">{p.caption}</p>
                  </div>
                </button>
              </Reveal>
            ))}
            {!loading && !photos.length && <p className="col-span-full text-center text-sm text-navy-muted">No photos yet.</p>}
          </div>
        </div>
      </section>
      {activePhoto && (
        <div onClick={() => setActive(null)} className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
          <button aria-label="Close" onClick={() => setActive(null)} className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
            <X size={22} />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <img src={activePhoto.image_url} alt={activePhoto.caption} className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl" />
            <figcaption className="mt-4 text-center text-white">
              <p className="text-[10px] uppercase tracking-wider text-white/60">{activePhoto.category}</p>
              <p className="font-display text-xl mt-1">{activePhoto.caption}</p>
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {activePhoto.allow_download !== false && (
                  <button onClick={() => downloadFile(activePhoto.image_url, `${activePhoto.caption || "photo"}.jpg`.replace(/[\\/:*?"<>|]/g, "-"))} className="inline-flex items-center gap-1.5 rounded-md bg-white text-navy px-3 py-2 text-xs font-medium hover:bg-white/90">
                    <Download size={14} /> Download
                  </button>
                )}
                <ShareMenu url={`/gallery#${activePhoto.id}`} title={activePhoto.caption} text={activePhoto.caption} />
              </div>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
