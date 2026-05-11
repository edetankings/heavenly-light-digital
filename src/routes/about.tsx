import { createFileRoute } from "@tanstack/react-router";
import { Eye, Target, Book, User, MapPin } from "lucide-react";
import { PageHeader, Reveal, SectionLabel } from "@/components/site/Section";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Risen Power Gospel Ministry" },
    { name: "description", content: "Discover our vision, mission, and the heart behind Risen Power Gospel Ministry in Port Harcourt." },
    { property: "og:title", content: "About Risen Power Gospel Ministry" },
  ]}),
  component: About,
});

const features = [
  { Icon: Eye, t: "Our Vision", b: "To raise a generation of Spirit-filled believers who carry the resurrection power of Jesus into every sphere of life." },
  { Icon: Target, t: "Our Mission", b: "To win souls, disciple believers, and demonstrate the kingdom of God through worship, the Word, and signs following." },
  { Icon: Book, t: "Our Beliefs", b: "We believe in one God, the inspired Word, salvation in Christ alone, the baptism of the Holy Spirit, and the soon return of Jesus." },
];
const services = [
  { d: "Sun · 8:00 AM", t: "First Service" },
  { d: "Sun · 10:30 AM", t: "Second Service" },
  { d: "Wed · 5:00 PM", t: "Bible Study" },
  { d: "Fri · 6:00 PM", t: "Prayer & Vigil" },
];
const ministries = ["Youth Ministry","Women's Fellowship","Men's Fellowship","Choir & Worship","Children's Church","Prayer Team"];

function About() {
  return (
    <div>
      <PageHeader tag="About Us" title="A House of Power & Presence" subtitle="Born in Port Harcourt with a global flame — we are family before we are anything else." />

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="text-lg text-navy-soft leading-relaxed">
              Risen Power Gospel Ministry is a community of worshippers contending for the manifest presence of God in our generation.
              Established in the heart of Rivers State, we are committed to the uncompromised gospel of Jesus Christ — preaching the Word,
              releasing the Spirit, and watching lives transformed week after week.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="glass-card p-8 h-full">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white mb-5"><f.Icon size={20} /></div>
                  <h3 className="font-display text-2xl text-navy">{f.t}</h3>
                  <p className="mt-3 text-navy-soft leading-relaxed">{f.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-3 items-center">
          <Reveal>
            <div className="aspect-square rounded-full mx-auto w-64 bg-surface border border-border grid place-items-center">
              <User size={80} className="text-navy" />
            </div>
          </Reveal>
          <div className="md:col-span-2">
            <Reveal>
              <SectionLabel>Senior Pastor</SectionLabel>
              <h2 className="font-display text-4xl text-navy">Pastor Daniel Okafor</h2>
              <p className="text-sm text-navy-muted mt-1">Founder & Senior Pastor</p>
              <p className="mt-5 text-navy-soft leading-relaxed">
                A passionate teacher of the Word and minister of the Spirit, Pastor Daniel has shepherded Risen Power for over a decade,
                seeing thousands encounter Jesus through bold preaching, prophetic ministry, and a deep love for people.
                Alongside his wife, he leads with humility, hunger, and holy fire.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <span className="section-tag !text-white/70">Service Times</span>
            <h2 className="font-display text-4xl md:text-5xl text-white mt-3">When We Gather</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="rounded-xl border border-white/15 p-6 text-center hover:bg-white/5 transition">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">{s.d}</p>
                  <p className="font-display text-2xl mt-2">{s.t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-border aspect-[16/8] bg-surface relative">
              <iframe
                title="Map"
                className="absolute inset-0 h-full w-full"
                src="https://www.google.com/maps?q=Port+Harcourt,+Rivers+State&output=embed"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-sm text-navy-muted text-center inline-flex gap-2 items-center justify-center w-full"><MapPin size={14} /> Port Harcourt, Rivers State, Nigeria</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <SectionLabel>Get Involved</SectionLabel>
            <h2 className="font-display text-4xl text-navy">Our Ministries</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {ministries.map((m, i) => (
              <Reveal key={m} delay={i * 0.05}>
                <div className="glass-card p-7 text-center">
                  <h3 className="font-display text-xl text-navy">{m}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
