import { useState } from "react";
import { Share2, Link as LinkIcon, Check, X } from "lucide-react";
import { toast } from "sonner";

type Props = { url?: string; title?: string; text?: string; className?: string };

function buildUrl(path?: string) {
  if (typeof window === "undefined") return path || "";
  if (!path) return window.location.href;
  if (/^https?:\/\//.test(path)) return path;
  return window.location.origin + path;
}

export function ShareMenu({
  url,
  title = "Risen Power Gospel Ministry",
  text = "",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = buildUrl(url);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text || title);

  const tryNative = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return true;
      } catch {
        /* user cancelled or failed */
      }
    }
    return false;
  };

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await tryNative();
    if (!ok) setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-white/80 text-navy px-3 py-2 text-xs font-medium hover:bg-surface transition ${className}`}
        aria-label="Share"
      >
        <Share2 size={14} /> Share
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[120] bg-navy/70 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-lg text-navy">Share</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface text-navy"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-2.5 text-sm text-navy hover:bg-surface text-center"
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={copy}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-navy text-white px-3 py-2.5 text-sm"
              >
                {copied ? <Check size={14} /> : <LinkIcon size={14} />}{" "}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
