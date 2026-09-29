import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin, Pause, Play } from "lucide-react";
import { Reveal } from "@/components/site/Section";
import { SiteContainer } from "@/components/site/SitePrimitives";

// Preserve the existing atmospheric media; this is not a live-service stream.
const poster = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80";
const video = "https://cdn.coverr.co/videos/coverr-light-rays-through-a-forest-2633/1080p.mp4";

export function HomeHero({ image }: { image?: string }) {
  const hero = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [parallax, setParallax] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const source = image || poster;
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const offset = useTransform(scrollYProgress, [0, 1], [0, 48]);

  useEffect(() => {
    const preference = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setParallax(preference.matches);
    update();
    preference.addEventListener("change", update);
    const stopWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", stopWhenHidden);
    };
  }, []);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  return (
    <section ref={hero} className="home-hero" aria-labelledby="home-title">
      <motion.div className="home-hero-media" style={{ y: parallax ? offset : 0 }} aria-hidden="true">
        {failedImage !== source && <img src={source} alt="" width={1920} height={1080} fetchPriority="high" onError={() => setFailedImage(source)} />}
        {playing && <video autoPlay muted loop playsInline preload="none" poster={source} onError={() => { setPlaying(false); setMediaError(true); }}><source src={video} type="video/mp4" /></video>}
      </motion.div>
      <div className="home-hero-shade" aria-hidden="true" />
      <SiteContainer className="home-hero-content">
        <Reveal y={16}>
          <p className="home-eyebrow home-eyebrow--light">Risen Power Gospel Ministries</p>
        </Reveal>
        <h1 id="home-title">
          <Reveal y={18} delay={0.08}>A living faith.</Reveal>
          <Reveal y={18} delay={0.18}><em>A place to belong.</em></Reveal>
        </h1>
        <Reveal y={16} delay={0.25}>
          <p className="home-hero-description">Where faith is ignited, lives are transformed, and God's power is revealed. Come worship with us in Warri, Delta State.</p>
          <div className="home-actions">
            <a href="#plan-your-visit" className="home-button home-button--white">Plan your visit <ArrowUpRight size={18} aria-hidden="true" /></a>
            <Link to="/sermons" className="home-button home-button--glass"><Play size={16} aria-hidden="true" /> Watch sermons</Link>
          </div>
        </Reveal>
      </SiteContainer>
      <SiteContainer className="home-hero-bottom">
        <a href="#plan-your-visit" className="home-hero-location"><MapPin size={17} aria-hidden="true" /><span>Effurun, Warri <span aria-hidden="true">/</span> Delta State, Nigeria</span></a>
        <div className="home-hero-controls">
          {reducedMotion === false && <button type="button" aria-pressed={playing} onClick={() => { setMediaError(false); setPlaying((current) => !current); }} className="home-video-control">{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{playing ? "Pause background video" : "Play background video"}</button>}
          <a href="#welcome" className="home-scroll-link" aria-label="Explore our church"><ArrowDown size={19} aria-hidden="true" /></a>
        </div>
        <p className="home-media-error" role="status">{mediaError ? "Background video unavailable. You can continue exploring the website." : ""}</p>
      </SiteContainer>
    </section>
  );
}
