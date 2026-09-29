/** Validate a configured public origin without reflecting configuration in errors. */
export function resolveSiteOrigin(value: string | undefined, production: boolean): string {
  if (!value?.trim()) {
    if (!production) return "http://localhost:5173";
    throw new Error("VITE_BASE_URL must be configured before a production build.");
  }
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("VITE_BASE_URL must be an absolute website origin.");
  }
  const hostname = url.hostname.replace(/\.$/, "");
  const local =
    /^(localhost|127(?:\.\d+){3}|\[::1\]|0\.0\.0\.0)$/.test(hostname) ||
    hostname.endsWith(".localhost");
  if (
    !["https:", "http:"].includes(url.protocol) ||
    (production && (url.protocol !== "https:" || local)) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "VITE_BASE_URL must be a public HTTPS origin without credentials, path, query or fragment.",
    );
  }
  return url.origin;
}
