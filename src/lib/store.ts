import { useEffect, useState, useSyncExternalStore } from "react";

export type Sermon = {
  id: string;
  title: string;
  preacher: string;
  date: string;
  year: string;
  type: string;
  scripture: string;
  description: string;
  audio?: string;
  audioName?: string;
};
export type Photo = {
  id: string;
  caption: string;
  date: string;
  year: string;
  category: string;
  description: string;
  src: string;
};
export type Prayer = { id: string; name: string; type: string; message: string; date: string };

type State = { sermons: Sermon[]; photos: Photo[]; prayers: Prayer[]; liveUrl: string };

const KEY = "rpgm-store-v1";
const seed: State = {
  sermons: [
    {
      id: "s1",
      title: "The Power of Resurrection",
      preacher: "Pastor Daniel Okafor",
      date: "2026-04-12",
      year: "2026",
      type: "Sunday Service",
      scripture: "Romans 8:11",
      description: "An anointed message on walking in resurrection power every day.",
    },
    {
      id: "s2",
      title: "Faith That Moves Mountains",
      preacher: "Pastor Daniel Okafor",
      date: "2026-03-29",
      year: "2026",
      type: "Sunday Service",
      scripture: "Mark 11:22-24",
      description: "Discover the kind of faith that produces breakthrough.",
    },
    {
      id: "s3",
      title: "Living in Divine Purpose",
      preacher: "Min. Grace Eze",
      date: "2026-03-22",
      year: "2026",
      type: "Midweek Bible Study",
      scripture: "Jeremiah 29:11",
      description: "God's plans for you are good — learn to walk in them.",
    },
  ],
  photos: [
    {
      id: "p1",
      caption: "Sunday Glory Service",
      date: "2026-04-12",
      year: "2026",
      category: "Sunday Service",
      description: "Worship in His presence",
      src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80",
    },
    {
      id: "p2",
      caption: "Holy Ghost Night",
      date: "2026-03-30",
      year: "2026",
      category: "Crusade",
      description: "An unforgettable night of power",
      src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&q=80",
    },
    {
      id: "p3",
      caption: "Youth Revival",
      date: "2026-03-15",
      year: "2026",
      category: "Youth Program",
      description: "Fire on the next generation",
      src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80",
    },
    {
      id: "p4",
      caption: "Outreach in PH City",
      date: "2026-02-22",
      year: "2026",
      category: "Outreach",
      description: "Carrying the gospel to the streets",
      src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
    },
    {
      id: "p5",
      caption: "Women's Fellowship",
      date: "2026-02-10",
      year: "2026",
      category: "Women's Fellowship",
      description: "Daughters of Zion arise",
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    },
    {
      id: "p6",
      caption: "Choir Ministration",
      date: "2026-01-25",
      year: "2026",
      category: "Sunday Service",
      description: "Lifting up the name of Jesus",
      src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80",
    },
  ],
  prayers: [],
  liveUrl: "",
};

let state: State = (() => {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...seed, ...JSON.parse(raw) } : seed;
  } catch {
    return seed;
  }
})();

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => state;
const getServerSnapshot = () => seed;
const setState = (updater: (s: State) => State) => {
  state = updater(state);
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

export const useStore = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const actions = {
  addSermon: (s: Omit<Sermon, "id">) =>
    setState((p) => ({ ...p, sermons: [{ ...s, id: crypto.randomUUID() }, ...p.sermons] })),
  removeSermon: (id: string) =>
    setState((p) => ({ ...p, sermons: p.sermons.filter((x) => x.id !== id) })),
  addPhotos: (items: Omit<Photo, "id">[]) =>
    setState((p) => ({
      ...p,
      photos: [...items.map((x) => ({ ...x, id: crypto.randomUUID() })), ...p.photos],
    })),
  removePhoto: (id: string) =>
    setState((p) => ({ ...p, photos: p.photos.filter((x) => x.id !== id) })),
  addPrayer: (pr: Omit<Prayer, "id" | "date">) =>
    setState((p) => ({
      ...p,
      prayers: [{ ...pr, id: crypto.randomUUID(), date: new Date().toISOString() }, ...p.prayers],
    })),
  setLiveUrl: (u: string) => setState((p) => ({ ...p, liveUrl: u })),
};

export const useMounted = () => {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
};
