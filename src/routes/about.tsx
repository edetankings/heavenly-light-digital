import { createFileRoute } from "@tanstack.react-router";
import { MapPin } from "lucide-react";
import { PageHeader, Reveal, SectionLabel } from "@/components/site/Section";
import { usePastor } from "@/lib/supabase-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Risen Power Gospel Ministry" },
      { name: "description", content: "Discover our vision, mission, and the heart behind Risen Power Gospel Ministry in Warri, Delta State, Nigeria." },
      { property: "og:title", content: "About Risen Power Gospel Ministry" },
      { property: "og:description", content: "Our vision, mission, beliefs, senior pastor, service times, and ministries at Risen Power in Warri, Delta State." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/about` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/about` }],
  }),
  component: About,
});

const features = [
  { img: "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?w=900&q=80", t: "Our Vision", b: "To raise a generation of Spirit-filled believers who carry the resurrection power of Jesus into every sphere of life." },
  { img: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=900&q=80", t: "Our Mission", b: "To win souls, disciple believers, and demonstrate the kingdom of God through worship, the Word, and signs following." },
  { img: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=900&q=80", t: "Our Beliefs", b: "We believe in one God, the inspired Word, salvation in Christ alone, the baptism of the Holy Spirit, and the soon return of Jesus." },
];
const services = [
  { d: "Sunday · 8:00 AM", t: "Divine Service" },
  { d: "Wed · 5:00 PM", t: "Bible Study" },
  { d: "Friday · 5:00 PM", t: "Revival Service" },
  { d: "1st & 3rd Saturday · 8:00 AM", t: "Morning Prayer" },
];
const ministries = ["Youth Ministry","Women's Fellowship","Men's Fellowship","Choir & Worship","Children's Church","Prayer Team"];

function About() {
  const pastor = usePastor();
  return (
    <div>
      <PageHeader tag="About Us" title="A House of Power & Presence" subtitle="Rooted in Delta State with a global flame — we are family before we are anything else." />

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="text-lg text-navy-soft leading-relaxed">
              Risen Power Gospel Ministry is a community of worshippers contending for the manifest presence of God in our generation.
              Established in the heart of Delta State, we are committed to the uncompromised gospel of Jesus Christ — preaching the Word,
              releasing the Spirit, and watching lives transformed week after week.
            </p>
          </Reveal>
        </div>
      </section>
