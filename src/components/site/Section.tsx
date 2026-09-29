import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileInView={reducedMotion ? undefined : { opacity: [0, 1], y: [y, 0] }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="section-divider" />
      <span className="section-tag">{children}</span>
    </div>
  );
}

export function PageHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 bg-white overflow-hidden">
      <div className="cross-watermark" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-3">
            <span className="section-divider" />
            <span className="section-tag">{tag}</span>
            <span className="section-divider" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-5xl md:text-7xl text-navy mt-5">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg text-navy-muted max-w-2xl mx-auto">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
