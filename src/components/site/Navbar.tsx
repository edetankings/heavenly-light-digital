import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/church-logo.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/sermons", label: "Sermons" },
  { to: "/gallery", label: "Gallery" },
  { to: "/events", label: "Events" },
  { to: "/testimonies", label: "Testimonies" },
  { to: "/live", label: "Live" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all ${scrolled ? "border-b border-border shadow-[0_4px_20px_-12px_rgba(10,15,46,0.18)]" : "border-b border-transparent"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          aria-label="Risen Power Gospel Ministry"
        >
          <img
            src={logo}
            alt="Risen Power Gospel Ministry"
            className="h-12 w-12 md:h-14 md:w-14 object-contain"
          />
          <span className="font-display text-base sm:text-lg md:text-xl text-navy leading-tight tracking-tight">
            Risen Power
            <br className="hidden sm:block" />
            <span className="italic font-light"> Gospel Ministry</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-navy-soft hover:text-navy transition-colors relative"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-navy font-semibold [&>span]:scale-x-100" }}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-navy origin-left scale-x-0 transition-transform" />
            </Link>
          ))}
          <Link
            to="/live"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition"
          >
            <span className="live-dot" /> Watch Live
          </Link>
        </nav>
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid h-10 w-10 place-items-center rounded-md text-navy hover:bg-surface"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-border"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-3 py-2.5 rounded-md text-navy hover:bg-surface"
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "bg-surface font-semibold" }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/live"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
              >
                <span className="live-dot" /> Watch Live
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
