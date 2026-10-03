import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin, Play } from "lucide-react";
import { Reveal } from "@/components/site/Section";
import { SiteContainer } from "@/components/site/SitePrimitives";

// Locally hosted devotional imagery; see docs/HOMEPAGE_IMAGE_CREDITS.md.
const slides = [
  {
    src: "/images/home/cross-at-sunrise.jpg",
    alt: "A cross on a rocky summit at sunrise",
    width: 1600,
    height: 1067,
  },
  {
    src: "/images/home/christ-in-the-wilderness.jpg",
    alt: "Christ in the Wilderness, an 1872 painting by Ivan Kramskoi",
    width: 1280,
    height: 1122,
  },
  {
    src: "/images/home/clouds.jpg",
    alt: "Soft white clouds in an open blue sky",
    width: 1600,
    height: 1067,
  },
];

export function HomeHero() {
  const hero = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [parallax, setParallax] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const offset = useTransform(scrollYProgress, [0, 1], [0, 32]);

  useEffect(() => {
    setMounted(true);
    const preference = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setParallax(preference.matches);
    update();
    preference.addEventListener("change", update);
    const visibilityChanged = () => setVisible(!document.hidden);
    visibilityChanged();
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (!mounted || reducedMotion !== false || paused || !visible) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [mounted, reducedMotion, paused, visible]);

  return (
    <section
      ref={hero}
      className="home-hero"
      aria-labelledby="home-title"
      onFocusCapture={(event) => {
        if (
          !(event.target instanceof HTMLElement) ||
          !event.target.hasAttribute("data-slideshow-toggle")
        )
          setPaused(true);
      }}
    >
      <motion.div
        id="home-slides"
        className="home-hero-media"
        style={{ y: parallax ? offset : 0 }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured Christian imagery"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="home-hero-slide"
            data-active={active === index}
            aria-hidden={active !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            {!failedImages.includes(slide.src) ? (
              <img
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "low"}
                onError={() =>
                  setFailedImages((current) =>
                    current.includes(slide.src) ? current : [...current, slide.src],
                  )
                }
              />
            ) : (
              <span className="home-slide-unavailable">Image unavailable</span>
            )}
          </div>
        ))}
      </motion.div>
      <div className="home-hero-shade" aria-hidden="true" />
      <SiteContainer className="home-hero-content">
        <Reveal y={16}>
          <p className="home-eyebrow home-eyebrow--light">Risen Power Gospel Ministries</p>
        </Reveal>
        <h1 id="home-title">
          <motion.span
            initial={false}
            whileInView={reducedMotion ? undefined : { opacity: [0, 1], y: [16, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            A living faith.
          </motion.span>
          <motion.span
            initial={false}
            whileInView={reducedMotion ? undefined : { opacity: [0, 1], y: [16, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <em>A place to belong.</em>
          </motion.span>
        </h1>
        <Reveal y={16} delay={0.25}>
          <p className="home-hero-description">
            Where faith is ignited, lives are transformed, and God's power is revealed. Come worship
            with us in Warri, Delta State.
          </p>
          <div className="home-actions">
            <a href="#plan-your-visit" className="home-button home-button--blue">
              Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <Link to="/sermons" className="home-button home-button--glass">
              <Play size={16} aria-hidden="true" /> Watch sermons
            </Link>
          </div>
        </Reveal>
      </SiteContainer>
      <SiteContainer className="home-hero-bottom">
        <a href="#plan-your-visit" className="home-hero-location">
          <MapPin size={17} aria-hidden="true" />
          <span>
            Effurun, Warri <span aria-hidden="true">/</span> Delta State, Nigeria
          </span>
        </a>
        {mounted && reducedMotion === false && (
          <button
            type="button"
            data-slideshow-toggle
            className="home-slideshow-toggle"
            aria-controls="home-slides"
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? "Resume animation" : "Pause animation"}
          </button>
        )}
      </SiteContainer>
    </section>
  );
}
