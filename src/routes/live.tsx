import { SITE_URL } from "@/lib/site-url";
import { createFileRoute } from "@tanstack/react-router";
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
      {
        name: "description",
        content: "Watch Risen Power Gospel Ministry services live and submit your prayer requests.",
      },
      { property: "og:title", content: "Live Stream — Risen Power Gospel Ministry" },
      {
        property: "og:description",
        content: "Watch our worship services live and submit your prayer requests.",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/live`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/live`,
      },
    ],
  }),
  component: Live,
});

function toEmbed(url: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  if (url.includes("facebook.com"))
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=1`;
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
      email: String(fd.get("email") || "").trim() || null,
      prayer_type: String(fd.get("type")),
      message: String(fd.get("message")).trim(),
    });
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
                <div className="flex items-center gap-2.5">
                  <span className="live-dot" />
                  <span className="text-xs uppercase tracking-[0.2em]">Live Broadcast</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/60">
                  Risen Power · Delta State
                </span>
              </div>
              <div className="aspect-video bg-navy relative">
                {liveUrl ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={toEmbed(liveUrl)}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-white/80 text-center px-6">
                    <div>
                      <Camera size={42} className="mx-auto mb-3" />
                      <p className="font-display text-2xl">Stream begins when service starts</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60 mt-2">
                        Sunday · 8:00 AM Divine Service
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="lg:col-span-2 glass-card p-7">
              <h2 className="font-display text-2xl text-navy">Prayer Request</h2>
              <p className="text-sm text-navy-muted mt-1">We agree with you in faith.</p>
              <form onSubmit={onPrayer} className="mt-5 space-y-3">
                <input
                  aria-label="Your name"
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full rounded-md border border-border px-4 py-2.5 text-sm"
                />
                <input
                  aria-label="Email address"
                  name="email"
                  type="email"
                  placeholder="Email (so we can follow up)"
                  className="w-full rounded-md border border-border px-4 py-2.5 text-sm"
                />
                <select
                  aria-label="Prayer request type"
                  name="type"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-border px-4 py-2.5 text-sm bg-white"
                >
                  <option value="" disabled>
                    Request type
                  </option>
                  {[
                    "Healing",
                    "Deliverance",
                    "Financial Breakthrough",
                    "Family",
                    "Salvation",
                    "Other",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <textarea
                  aria-label="Prayer request message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Share your request..."
                  className="w-full rounded-md border border-border px-4 py-2.5 text-sm"
                />
                <button
                  disabled={busy}
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={14} /> {busy ? "Sending…" : "Submit Request"}
                </button>
                <p className="text-[11px] text-navy-muted text-center">
                  Your request goes directly to our pastoral team.
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
