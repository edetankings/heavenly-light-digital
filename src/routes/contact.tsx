import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Risen Power Gospel Ministry" }, { name: "description", content: "Reach out — we would love to hear from you." }] }),
  component: Contact,
});

const info = [
  { Icon: MapPin, t: "Address", b: "DSC Expressway, Effurun GRA, Warri 330102, Delta State" },
  { Icon: Phone, t: "Phone", b: "+234 803 000 0000" },
  { Icon: Mail, t: "Email", b: "hello@risenpower.ng" },
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
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {info.map((c, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card p-7 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white mx-auto mb-4"><c.Icon size={18} /></div>
                  <h3 className="font-display text-xl text-navy">{c.t}</h3>
                  <p className="text-navy-soft mt-2">{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <form onSubmit={onSubmit} className="glass-card p-8 md:p-10 max-w-3xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <input required name="name" placeholder="Full Name" className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <input required type="email" name="email" placeholder="Email" className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <input name="phone" placeholder="Phone" className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
                <input required name="subject" placeholder="Subject" className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
              </div>
              <textarea required rows={5} name="message" placeholder="Your message..." className="mt-4 w-full rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy" />
              <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy text-white px-7 py-3 text-sm font-medium hover:opacity-90"><Send size={14} /> Send Message</button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
