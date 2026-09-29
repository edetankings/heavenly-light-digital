import { useEffect, useRef } from "react";
import type { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { INTRO_DEADLINE_MS, introSession } from "@/lib/intro-session";
import { ChurchLogo } from "./SitePrimitives";

export function LogoIntro() {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = useRef<() => void>(() => {});

  useEffect(() => {
    const element = dialog.current;
    if (!element || typeof element.showModal !== "function") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stopped = false;
    let context: gsap.Context | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(deadline);
      context?.revert();
      if (element.open) element.close();
    };
    dismiss.current = finish;

    // Defer the claim until after React Strict Mode's effect rehearsal.
    const frame = requestAnimationFrame(() => {
      if (stopped || !introSession.claim() || reducedMotion.matches || document.hidden) return;
      // The watchdog starts before animation loading: no dependency can hold the page open.
      deadline = setTimeout(finish, INTRO_DEADLINE_MS);
      try {
        element.showModal();
      } catch {
        finish();
        return;
      }
      void import("gsap")
        .then(({ gsap }) => {
          if (stopped) return;
          context = gsap.context(() => {
            gsap
              .timeline({ onComplete: finish, defaults: { ease: "power3.out" } })
              .fromTo(
                ".site-intro-light",
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1.4 },
                0,
              )
              .fromTo(
                ".site-intro-emblem",
                { opacity: 0, scale: 0.94, y: 12 },
                { opacity: 1, scale: 1, y: 0, duration: 1 },
                0.15,
              )
              .fromTo(
                ".site-intro-word",
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, stagger: 0.12, duration: 0.7 },
                0.65,
              )
              .fromTo(".site-intro-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, 0.9)
              .to(element, { opacity: 0, duration: 0.65 }, 2.45);
          }, element);
        })
        .catch(finish);
    });
    const preferenceChanged = () => {
      if (reducedMotion.matches) finish();
    };
    const visibilityChanged = () => {
      if (document.hidden) finish();
    };
    reducedMotion.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("pagehide", finish);
    return () => {
      cancelAnimationFrame(frame);
      finish();
      reducedMotion.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("pagehide", finish);
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="site-intro"
      aria-labelledby="intro-name"
      onCancel={(event) => {
        event.preventDefault();
        dismiss.current();
      }}
      onClose={() => dismiss.current()}
      onAnimationEnd={(event) => {
        if (event.animationName === "site-intro-deadline") dismiss.current();
      }}
    >
      <div className="site-intro-light" aria-hidden="true" />
      <div className="site-intro-content">
        <div className="site-intro-emblem">
          <ChurchLogo alt="" onError={() => dismiss.current()} />
        </div>
        <h2 id="intro-name" className="site-intro-name">
          <span className="site-intro-word">Risen Power</span>
          <span className="site-intro-word">Gospel Ministries</span>
        </h2>
        <div className="site-intro-rule" aria-hidden="true" />
      </div>
      <button type="button" className="site-intro-skip" onClick={() => dismiss.current()}>
        Skip Intro <ArrowRight size={16} aria-hidden="true" />
      </button>
    </dialog>
  );
}
