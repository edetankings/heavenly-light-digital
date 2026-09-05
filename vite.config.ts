// Replace Lovable-provided Vite/TanStack bundle with explicit public plugins
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@cloudflare/vite-plugin";
import * as tanstackStartPkg from "@tanstack/start";

// Some @tanstack/start package versions don't expose a "./plugin" subpath via package exports,
// which causes Vercel's esbuild-based bundler to fail with "Missing './plugin' specifier".
// Resolve the plugin entry at runtime from the package's available exports to avoid relying on a
// subpath that may not be present in every release.
const tanstackStart: any = (tanstackStartPkg as any).plugin ?? (tanstackStartPkg as any).default ?? (tanstackStartPkg as any);

export default defineConfig({
  plugins: [
    // Redirect TanStack Start's server entry to src/server.ts
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tsconfigPaths(),
    tailwind(),
    // cloudflare plugin is included to preserve Cloudflare build behavior
    cloudflare(),
  ],
  resolve: {
    alias: [{ find: "@", replacement: new URL("./src", import.meta.url).pathname }],
    dedupe: ["react", "react-dom", "@tanstack/react-start", "@tanstack/react-router"],
  },
});
