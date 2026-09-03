// Replace Lovable-provided Vite/TanStack bundle with explicit public plugins
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@cloudflare/vite-plugin";
import tanstackStart from "@tanstack/start/plugin";

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
