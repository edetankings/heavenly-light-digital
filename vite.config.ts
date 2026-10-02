import { fileURLToPath } from "node:url";
import { resolveSiteOrigin } from "./src/lib/site-origin";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwind from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_BASE_URL");
  const configuredOrigin = env.VITE_BASE_URL?.trim()
    ? env.VITE_BASE_URL
    : command === "build" && process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : env.VITE_BASE_URL;
  const origin = resolveSiteOrigin(configuredOrigin, command === "build");
  return {
    define: { "import.meta.env.VITE_BASE_URL": JSON.stringify(origin) },
    plugins: [
      tsconfigPaths(),
      tailwind(),
      tanstackStart({ server: { entry: "server" } }),
      nitro({ preset: "vercel" }),
      react(),
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: ["react", "react-dom", "@tanstack/react-start", "@tanstack/react-router"],
    },
  };
});
