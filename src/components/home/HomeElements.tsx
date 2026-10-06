import { useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Section";

export function HomeHeading({
  label,
  title,
  children,
  to,
  linkText,
}: {
  label: string;
  title: ReactNode;
  children?: ReactNode;
  to?: "/about" | "/sermons" | "/events" | "/gallery" | "/testimonies";
  linkText?: string;
}) {
  return (
    <div className="home-section-heading">
      <Reveal y={16}>
        <p className="home-eyebrow">{label}</p>
        <h2>{title}</h2>
        {children && <p className="home-section-intro">{children}</p>}
      </Reveal>
      {to && (
        <Link to={to} className="home-text-link">
          {linkText}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function HomeDataState({
  loading,
  error,
  empty,
  noun,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  noun: string;
}) {
  if (!loading && !error && !empty) return null;
  return (
    <div
      className={`home-data-state ${loading ? "home-data-state--loading" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="home-state-line" aria-hidden="true" />
      <p>
        {loading
          ? `Loading ${noun}...`
          : error
            ? `We couldn't load ${noun} right now. Please try again later.`
            : `New ${noun} will be shared here. Check back soon.`}
      </p>
    </div>
  );
}

export function HomePhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return failed === src ? (
    <div className={`home-photo-unavailable ${className}`}>
      <ImageOff size={24} aria-hidden="true" />
      <span>Image unavailable</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(src)}
    />
  );
}

export function HomePortraitMedia({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.6 });

  const moveWithPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion !== false || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 18);
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 18);
  };

  return (
    <div
      className="home-portrait-media"
      onPointerMove={moveWithPointer}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div className="home-portrait-motion-track" style={{ x: smoothX, y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
}
