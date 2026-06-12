import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play, Clock, MapPin, Phone, ArrowRight, Quote } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/site/Section";
import { MediaCarousel, MediaCarouselCard } from "@/components/site/MediaCarousel";
import { AudioPlayer } from "@/components/site/AudioPlayer";
import { ShareMenu } from "@/components/site/ShareMenu";
import { useSermons, useGalleryPhotos, useTestimonies, usePastor } from "@/lib/supabase-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Risen Power Gospel Ministry — Where Faith Is Ignited" }] }),
  component: Index,
});

function Index() {
  const { data: sermons } = useSermons();
  const { data: photos } = useGalleryPhotos();
  const { data: testimonies } = useTestimonies();
  const pastor = usePastor();
  const approved = testimonies.filter(t => t.is_approved);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const latestSermons = sermons.slice(0, 3);
  const latestPhotos = photos.slice(0, 5);
  const featuredTestimonies = approved.slice(0, 5);

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center bg-white overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            poster="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80"
          >
            <source src="https://cdn.coverr.co/videos/coverr-light-rays-through-a-forest-2633/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/95 to-white" />
          <div className="cross-watermark" />
        </div>

        <motion.div style={{ y, opacity }} className="relative mx-auto max-w-6xl px-6 text-center py-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/30 px-4 py-1.5">
              <span className="section-tag">Welcome to Our Family</span>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-[14vw] leading-[0.95] md:text-[8.5vw] lg:text-[120px] text-navy mt-8 tracking-tight">
              Risen Power<br />
              <span className="italic font-light">Gospel Ministry</span>
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-7 text-lg md:text-xl text-navy-soft max-w-2xl mx-auto leading-relaxed">
              Where faith is ignited, lives are transformed, and God's power is revealed.
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-medium text-white hover:opacity-90 transition shadow-[0_10px_30px_-10px_rgba(10,15,46,0.5)]">
                Discover More <ArrowRight size={16} />
              </Link>
              <Link to="/live" className="inline-flex items-center gap-2 rounded-full bg-white border border-navy px-7 py-3.5 text-sm font-medium text-navy hover:bg-navy hover:text-white transition">
                <Play size={16} /> Watch Live
              </Link>
            </div>
          </Reveal>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-navy-muted">
          Scroll
        </motion.div>
      </section>

      {/* INFO STRIP */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3 md:divide-x md:divide-white/15">
          {[
            { icon: Clock, t: "Sunday Service", s: "8:00 AM & 10:30 AM" },
            { icon: MapPin, t: "Visit Us", s: "Delta State, Ebumude, Vita Form" },
            { icon: Phone, t: "Call Anytime", s: "+234 803 000 0000" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-4 md:px-8">
              <c.icon size={24} className="shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">{c.t}</p>
                <p className="text-base font-medium">{c.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BIBLE VERSE HIGHLIGHT */}
      <section className="py-28 md:py-36 bg-white relative overflow-hidden">
        <div className="cross-watermark" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <Quote className="mx-auto text-navy mb-6" size={36} />
            <p className="font-display italic text-3xl md:text-5xl text-navy leading-tight">
              "I am the resurrection and the life. He who believes in Me, though he may die, he shall live."
            </p>
            <p className="mt-6 section-tag">— John 11:25</p>
          </Reveal>
        </div>
      </section>

      {/* LATEST SERMONS */}
      <section className="py-24 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <SectionLabel>Recent Word</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl text-navy">Latest Sermons</h2>
            </div>
          </div>

          {latestSermons.length > 0 ? (
            <MediaCarousel
              viewAllHref="/sermons"
              viewAllLabel="View All Sermons"
              slideSizes={{ base: 100, sm: 50, md: 33.333, lg: 33.333 }}
            >
              {latestSermons.map((s) => (
                <MediaCarouselCard key={s.id}>
                  <article className="glass-card p-6 sm:p-7 h-full flex flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-navy text-white text-[10px] uppercase tracking-wider px-3 py-1">{s.service_type}</span>
                      <span className="text-[10px] uppercase tracking-wider text-navy-muted">{new Date(s.preached_on).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl text-navy mt-4">{s.title}</h3>
                    <p className="text-xs uppercase tracking-wider text-navy-muted mt-1">{s.preacher}</p>
                    {s.scripture && <p className="text-sm italic text-navy-muted mt-2">{s.scripture}</p>}
                    {s.description && <p className="text-sm text-navy-soft mt-3 flex-1">{s.description}</p>}
                    {s.audio_url && (
                      <div className="mt-4">
                        <AudioPlayer
                          src={s.audio_url}
                          title={s.title}
                          downloadName={(s.audio_name || `${s.title}.mp3`).replace(/[\\/:*?"<>|]/g, "-")}
                          allowDownload={s.allow_download !== false}
                        />
                      </div>
                    )}
                    <div className="mt-3 flex justify-end">
                      <ShareMenu url={`/sermons#${s.id}`} title={s.title} text={`${s.title} — ${s.preacher}`} />
                    </div>
                  </article>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          ) : (
            <p className="text-center text-sm text-navy-muted">Sermons will appear here soon.</p>
          )}
        </div>
      </section>

      {/* GALLERY HIGHLIGHTS */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <SectionLabel>Worship Moments</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl text-navy">In His Presence</h2>
            </div>
          </div>

          {latestPhotos.length > 0 ? (
            <MediaCarousel
              viewAllHref="/gallery"
              viewAllLabel="View All Photos"
              slideSizes={{ base: 85, sm: 50, md: 33.333, lg: 25 }}
            >
              {latestPhotos.map((p) => (
                <MediaCarouselCard key={p.id}>
                  <Link to="/gallery" className="group relative aspect-[4/5] block overflow-hidden rounded-xl bg-surface">
                    <img src={p.image_url} alt={p.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 to-transparent p-5 text-white">
                      <p className="text-[10px] uppercase tracking-wider text-white/70">{p.category}</p>
                      <p className="font-display text-lg sm:text-xl mt-1">{p.caption}</p>
                    </div>
                  </Link>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          ) : (
            <p className="text-center text-sm text-navy-muted">Gallery photos will appear here soon.</p>
          )}
        </div>
      </section>

      {/* PASTOR MESSAGE */}
      <section className="py-28 bg-surface">
        <div className="mx-auto max-w-6xl px-6 grid gap-12 md:grid-cols-5 items-center">
          <Reveal>
            <div className="md:col-span-2">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-navy to-navy-soft relative overflow-hidden">
                <img src={pastor?.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"} alt={pastor?.name || "Pastor"} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          </Reveal>
          <div className="md:col-span-3">
            <Reveal>
              <SectionLabel>A Word From Our Pastor</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl text-navy">"{pastor?.short_message || "Come as you are. Leave forever changed."}"</h2>
              <p className="mt-6 text-navy-soft leading-relaxed whitespace-pre-line">
                {pastor?.bio || "Beloved, every soul who walks through our doors is precious to God. We are not perfect — we are pursued. Together we lift our eyes to Jesus, the resurrection and the life."}
              </p>
              <p className="mt-6 font-display text-2xl text-navy">— {pastor?.name || "Pastor"}</p>
              <p className="text-sm text-navy-muted">{pastor?.title || "Senior Pastor"}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIES */}
      <section className="py-24 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3"><span className="section-divider" /><span className="section-tag">God Is Moving</span><span className="section-divider" /></div>
            <h2 className="font-display text-4xl md:text-5xl text-navy mt-5">Stories of His Power</h2>
          </div>

          {featuredTestimonies.length > 0 ? (
            <MediaCarousel
              viewAllHref="/testimonies"
              viewAllLabel="View All Testimonies"
              slideSizes={{ base: 100, sm: 50, md: 33.333, lg: 33.333 }}
            >
              {featuredTestimonies.map((t) => (
                <MediaCarouselCard key={t.id}>
                  <div className="glass-card p-7 sm:p-8 h-full flex flex-col">
                    <Quote size={28} className="text-navy mb-4" />
                    <p className="text-navy-soft leading-relaxed italic flex-1">"{t.message}"</p>
                    <p className="mt-6 font-semibold text-navy">— {t.name}</p>
                  </div>
                </MediaCarouselCard>
              ))}
            </MediaCarousel>
          ) : (
            <p className="text-center text-navy-muted">Be the first to share a testimony. <Link to="/testimonies" className="underline font-medium">Share yours →</Link></p>
          )}
        </div>
      </section>
    </div>
  );
}
