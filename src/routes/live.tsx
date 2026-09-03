import { createFileRoute } from "@tanstack.react-router";
import { Camera, Send } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useSiteSettings } from "@/lib/supabase-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Stream — Risen Power Gospel Ministry" },
      { name: "description", content: "Watch Risen Power Gospel Ministry services live and submit your prayer requests." },
      { property: "og:title", content: "Live Stream — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Watch our worship services live and submit your prayer requests." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/live` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/live` }],
  }),
  component: Live,
});

function toEmbed(url: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  if (url.includes("facebook.com")) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=1`;
  return url;
}

function Live() {
  const settings = useSiteSettings();
  const liveUrl = settings?.live_url || "";
  const [busy, setBusy] = useState(false);

  const onPrayer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    const { error } = await supabase.from("prayer_requests").insert({
      name: String(fd.get("name")).trim(),
      email: (String(fd.get("email") || "").trim() || null) as any,
      prayer_type: String(fd.get("type")),
      message: String(fd.get("message")).trim(),
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    form.reset();
    toast.success("Your prayer request has been received. We are agreeing with you.");
  };

  return (
    <div>
      <PageHeader tag="Live Broadcast" title="Worship With Us, Wherever You Are" />
      <section className="py-12 bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 lg:grid-cols-5">
          <Reveal>
            <div className="lg:col-span-3 glass-card overflow-hidden">
              <div className="flex items-center justify-between bg-navy text-white px-5 py-3">
                <div className="flex items-center gap-2.5"><span className="live-dot" /><span className="text-xs uppercase tracking-[0.2em]">Live Broadcast</span></div>
                <span className="text-[10px] uppercase tracking-wider text-white/60">Risen Power · Delta State</span>
              </div>
              <div className="aspect-video bg-navy relative">
                {liveUrl ? (
