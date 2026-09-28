import { useState } from "react";
import { useAnnouncements } from "@/lib/supabase-data";
import { Megaphone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AnnouncementBar() {
  const { active } = useAnnouncements();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [idx, setIdx] = useState(0);
  const visible = active.filter((a) => !dismissed[a.id]);
  if (!visible.length) return null;
  const a = visible[idx % visible.length];
  return (
    <AnimatePresence>
      <motion.div
        key={a.id}
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -32, opacity: 0 }}
        className="bg-navy text-white text-xs sm:text-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center gap-3">
          <Megaphone size={14} className="shrink-0 opacity-80" />
          <div className="flex-1 min-w-0 truncate">
            <span className="font-semibold mr-2">{a.title}</span>
            <span className="text-white/80">{a.body}</span>
          </div>
          {visible.length > 1 && (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="hidden sm:block text-[10px] uppercase tracking-wider text-white/60 hover:text-white"
            >
              Next →
            </button>
          )}
          <button
            onClick={() => setDismissed((d) => ({ ...d, [a.id]: true }))}
            aria-label="Dismiss"
            className="shrink-0 grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"
          >
            <X size={12} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
