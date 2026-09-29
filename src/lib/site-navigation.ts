export const siteLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/sermons", label: "Sermons" },
  { to: "/live", label: "Live" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/testimonies", label: "Testimonies" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function isAccountRoute(pathname: string) {
  const path = pathname.toLowerCase().replace(/\/+$/, "");
  return ["/church-admin-secure", "/reset-password"].some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}
