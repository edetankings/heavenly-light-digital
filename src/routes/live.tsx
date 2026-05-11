import { createFileRoute } from "@tanstack/react-router";
import { Camera, Send } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useStore, actions } from "@/lib/store";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live Stream — Risen Power Gospel Ministry" }, { name: "description", content: "Watch our services live and submit your prayer requests." }] }),
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
  const { liveUrl, prayers } = useStore();
  const [draftUrl, setDraftUrl] = useState("");

  const onPrayer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    actions.addPrayer({ name: String(fd.get("name")), type: String(fd.get("type")), message: String(fd.get("message")) });
    e.currentTarget.reset();
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
                <span className="text-[10px] uppercase tracking-wider text-white/60">Risen Power · PH</span>
              </div>
              <div className="aspect-video bg-navy relative">
                {liveUrl ? (
                  <iframe className="absolute inset-0 h-full w-full" src={toEmbed(liveUrl)} allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-white/80 text-center px-6">
                    <div>
                      <Camera size={42} className="mx-auto mb-3" />
                      <p className="font-display text-2xl">Stream begins when service starts</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60 mt-2">Sun 8:00 AM · 10:30 AM</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col sm:flex-row gap-3">
                <input value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} placeholder="Paste YouTube or Facebook live URL" className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <button onClick={() => { actions.setLiveUrl(draftUrl); toast.success("Stream is now live."); }} className="rounded-md bg-navy text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">Go Live</button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="lg:col-span-2 glass-card p-7">
              <h3 className="font-display text-2xl text-navy">Prayer Request</h3>
              <p className="text-sm text-navy-muted mt-1">We agree with you in faith.</p>
              <form onSubmit={onPrayer} className="mt-5 space-y-3">
                <input name="name" required placeholder="Your name" className="w-full rounded-md border border-border px-4 py-2.5 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <select name="type" required defaultValue="" className="w-full rounded-md border border-border px-4 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="" disabled>Request type</option>
                  {["Healing","Deliverance","Financial Breakthrough","Family","Salvation","Other"].map(t => <option key={t}>{t}</option>)}
                </select>
                <textarea name="message" required rows={4} placeholder="Share your request..." className="w-full rounded-md border border-border px-4 py-2.5 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy text-white py-3 text-sm font-medium hover:opacity-90"><Send size={14} /> Submit Request</button>
              </form>

              {prayers.length > 0 && (
                <div className="mt-7 border-t border-border pt-5 max-h-72 overflow-auto">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-navy-muted mb-3">Recent Requests</p>
                  <ul className="space-y-3">
                    {prayers.slice(0, 8).map(p => (
                      <li key={p.id} className="text-sm">
                        <p className="font-semibold text-navy">{p.name} <span className="font-normal text-navy-muted">— {p.type}</span></p>
                        <p className="text-navy-soft mt-0.5">{p.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
