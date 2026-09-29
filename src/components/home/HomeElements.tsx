import { useState, type ReactNode } from "react";
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
