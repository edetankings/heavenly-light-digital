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
  head: () => ({
    meta: [
      { title: "Risen Power Gospel Ministry — A House of Power & Presence" },
      { name: "description", content: "Risen Power Gospel Ministry in Warri, Delta State — where faith is ignited, lives are transformed, and God's power is revealed. Join us for worship, sermons, and prayer." },
      { property: "og:title", content: "Risen Power Gospel Ministry — A House of Power & Presence" },
      { property: "og:description", content: "Risen Power Gospel Ministry in Warri, Delta State — where faith is ignited, lives are transformed, and God's power is revealed." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/` }],
  }),
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
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const latestSermons = sermons.slice(0, 3);
  const latestPhotos = photos.slice(0, 5);
  const featuredTestimonies = approved.slice(0, 5);

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center bg-navy overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80"
          >
            <source src="https://cdn.coverr.co/videos/coverr-light-rays-through-a-forest-2633/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/70 to-navy/95" />
