import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts, useRouterState,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-navy">404</h1>
        <p className="mt-3 text-navy-muted">This page wandered off the path.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">Return Home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-navy">Something interrupted us</h1>
        <p className="mt-2 text-sm text-navy-muted">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Risen Power Gospel Ministry" },
      { name: "description", content: "Where faith is ignited, lives are transformed, and God's power is revealed. Join Risen Power Gospel Ministry in Delta state, Nigeria." },
      { property: "og:title", content: "Risen Power Gospel Ministry" },
      { property: "og:description", content: "Where faith is ignited, lives are transformed, and God's power is revealed. Join Risen Power Gospel Ministry in Delta state, Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Risen Power Gospel Ministry" },
      { name: "twitter:description", content: "Where faith is ignited, lives are transformed, and God's power is revealed. Join Risen Power Gospel Ministry in Delta state, Nigeria." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ErCmRwJpuXdSBqnIkGtiNA4bpQI2/social-images/social-1778749494098-photo_2026-05-14_09-58-56.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ErCmRwJpuXdSBqnIkGtiNA4bpQI2/social-images/social-1778749494098-photo_2026-05-14_09-58-56.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { location } = useRouterState();
  const isAdmin = location.pathname.startsWith("/portal-rpgm-2026-x9k");
  return (
    <QueryClientProvider client={queryClient}>
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      <Toaster position="bottom-right" toastOptions={{ style: { background: "#fff", color: "#0a0f2e", border: "1px solid rgba(10,15,46,0.18)" } }} />
    </QueryClientProvider>
  );
}
