import { createFileRoute } from "@tanstack.react-router";
import { MapPin, Phone, Send } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Risen Power Gospel Ministry" },
      { name: "description", content: "Reach out to Risen Power Gospel Ministry in Warri, Delta State — we would love to hear from you." },
      { property: "og:title", content: "Contact — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Get in touch with Risen Power Gospel Ministry in Warri, Delta State." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/contact` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/contact` }],
  }),
  component: Contact,
});

const info = [
  { Icon: MapPin, t: "Address", b: "VITAFOAM Comfort Center, DSC Expressway, Effurun GRA, Warri 330102, Delta State, Nigeria", href: "https://maps.app.goo.gl/PtuwLzYDwzKFwocJ9?g_st=ac" },
  { Icon: Phone, t: "Phone", b: "09072523125", href: "tel:09072523125" },
];

function Contact() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast.success("Message sent. We will reach out shortly.");
  };
  return (
    <div>
      <PageHeader tag="Reach Out" title="Let's Connect" subtitle="Whether you have a question or need prayer — we are here." />
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 mb-10 max-w-4xl mx-auto">
            {info.map((c, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card p-7 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white mx-auto mb-4"><c.Icon size={18} /></div>
                  <h3 className="font-display text-xl text-navy">{c.t}</h3>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noreferrer" : undefined} className="block text-navy-soft mt-2 hover:text-navy">{c.b}</a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <form onSubmit={onSubmit} className="glass-card p-8 md:p-10 max-w-3xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <input aria-label="Full name" required name="name" placeholder="Full Name" className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
