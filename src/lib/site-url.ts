import { resolveSiteOrigin } from "./site-origin";

export const SITE_URL = resolveSiteOrigin(import.meta.env.VITE_BASE_URL, import.meta.env.PROD);
