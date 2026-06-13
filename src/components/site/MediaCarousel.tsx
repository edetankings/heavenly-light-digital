import { useCallback, useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Section";

type SlideSize = { base?: number; sm?: number; md?: number; lg?: number };

type MediaCarouselProps = {
  children: ReactNode[];
  slideSizes?: SlideSize;
  viewAllHref?: string;
  viewAllLabel?: string;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
};

export function MediaCarousel({
  children,
  slideSizes,
  viewAllHref,
  viewAllLabel = "View All",
  showDots = true,
  showArrows = true,
  className = "",
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const { base = 100, sm = 50, md = 33.333, lg = 33.333 } = slideSizes ?? {};
  const [isSm, setIsSm] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mSm = window.matchMedia("(min-width: 640px)");
    const mMd = window.matchMedia("(min-width: 768px)");
    const mLg = window.matchMedia("(min-width: 1024px)");
    const update = () => { setIsSm(mSm.matches); setIsMd(mMd.matches); setIsLg(mLg.matches); };
    update();
    mSm.addEventListener("change", update);
    mMd.addEventListener("change", update);
    mLg.addEventListener("change", update);
    return () => {
      mSm.removeEventListener("change", update);
      mMd.removeEventListener("change", update);
      mLg.removeEventListener("change", update);
    };
  }, []);
  const basis = isLg ? lg : isMd ? md : isSm ? sm : base;
  useEffect(() => { emblaApi?.reInit(); }, [emblaApi, basis]);

  return (
    <div className={className}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-5">
          {children.map((child, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0" style={{ flexBasis: `${basis}%` }}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {(showArrows || showDots || viewAllHref) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {showDots && scrollSnaps.length > 1 && (
            <div className="flex items-center gap-2">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === selectedIndex
                      ? "w-6 bg-navy"
                      : "w-2 bg-navy/25 hover:bg-navy/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {showArrows && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-navy hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-navy hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            {viewAllHref && (
              <Link
                to={viewAllHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy bg-white px-4 py-2 text-xs font-medium text-navy hover:bg-navy hover:text-white transition"
              >
                {viewAllLabel} <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaCarouselCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Reveal>
      <div className={`h-full ${className}`}>{children}</div>
    </Reveal>
  );
}
