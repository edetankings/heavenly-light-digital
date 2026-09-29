import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, ArrowUpRight, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteLinks } from "@/lib/site-navigation";
import { ChurchBrand, SiteButton, SiteContainer } from "./SitePrimitives";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const reducedMotion = useReducedMotion();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className={`site-header ${isHome ? "site-header--home" : ""}`} data-scrolled={scrolled || open}>
      <SiteContainer className="site-header-inner">
        <Link to="/" className="site-brand-link" aria-label="Risen Power Gospel Ministries home">
          <ChurchBrand />
        </Link>
        <nav className="site-desktop-nav" aria-label="Main navigation">
          {siteLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="site-nav-link"
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ "aria-current": "page" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <SiteButton asChild className="site-header-live">
            <Link to="/live">
              Watch Live <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </SiteButton>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button
                type="button"
                className="site-menu-trigger"
                aria-label="Open navigation"
                whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              >
                <Menu size={24} aria-hidden="true" />
              </motion.button>
            </SheetTrigger>
            <SheetContent className={`site-mobile-menu ${isHome ? "site-mobile-menu--home" : ""}`}>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Explore Risen Power Gospel Ministries.
              </SheetDescription>
              <Link
                to="/"
                className="site-brand-link"
                onClick={() => setOpen(false)}
                aria-label="Risen Power Gospel Ministries home"
              >
                <ChurchBrand />
              </Link>
              <p className="site-eyebrow site-menu-label">Welcome to our church</p>
              <nav aria-label="Mobile navigation">
                {siteLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="site-mobile-link"
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: link.to === "/" }}
                    activeProps={{ "aria-current": "page" }}
                  >
                    <span aria-hidden="true" className="site-mobile-number">
                      0{index + 1}
                    </span>
                    <span>{link.label}</span>
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </Link>
                ))}
              </nav>
              <SiteButton asChild className="site-menu-live">
                <Link to="/live" onClick={() => setOpen(false)}>
                  Watch Live <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </SiteButton>
            </SheetContent>
          </Sheet>
        </div>
      </SiteContainer>
    </header>
  );
}
