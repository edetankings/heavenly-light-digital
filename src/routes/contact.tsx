import { supabase } from "@/integrations/supabase/client";
import { contactSchema } from "@/lib/contact-submission";
import { SITE_URL } from "@/lib/site-url";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Send } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Reveal } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Risen Power Gospel Ministry" },
      {
        name: "description",
        content:
          "Reach out to Risen Power Gospel Ministry in Warri, Delta State — we would love to hear from you.",
      },
      { property: "og:title", content: "Contact — Risen Power Gospel Ministry" },
      {
        property: "og:description",
        content: "Get in touch with Risen Power Gospel Ministry in Warri, Delta State.",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/contact`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE_URL}/contact`,
      },
    ],
  }),
  component: Contact,
});

const info = [
  {
    Icon: MapPin,
    t: "Address",
    b: "VITAFOAM Comfort Center, DSC Expressway, Effurun GRA, Warri 330102, Delta State, Nigeria",
    href: "https://maps.app.goo.gl/PtuwLzYDwzKFwocJ9?g_st=ac",
  },
  { Icon: Phone, t: "Phone", b: "09072523125", href: "tel:09072523125" },
];

function Contact() {
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting.current) return;
    const form = e.currentTarget;
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      toast.error("Please check your contact details and message length.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const message = parsed.data;
      const { error } = await supabase.rpc("submit_contact_message", {
        p_name: message.name,
        p_email: message.email,
        p_phone: message.phone,
        p_subject: message.subject,
        p_message: message.message,
      });
      if (error) throw error;
      form.reset();
      toast.success("Your message has been saved for the church team.");
    } catch {
      // Keep the message for retry; never claim delivery when the RPC is unavailable.
      toast.error("We could not save your message. Please try again or call the church.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <div>
      <PageHeader
        tag="Reach Out"
        title="Let's Connect"
        subtitle="Whether you have a question or need prayer — we are here."
      />
      <section className="py-16 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 mb-10 max-w-4xl mx-auto">
            {info.map((c, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass-card p-7 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white mx-auto mb-4">
                    <c.Icon size={18} />
                  </div>
                  <h3 className="font-display text-xl text-navy">{c.t}</h3>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                    className="block text-navy-soft mt-2 hover:text-navy"
                  >
                    {c.b}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <form onSubmit={onSubmit} className="glass-card p-8 md:p-10 max-w-3xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  aria-label="Full name"
                  required
                  name="name"
                  maxLength={120}
                  placeholder="Full Name"
                  className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  aria-label="Email address"
                  required
                  type="email"
                  name="email"
                  maxLength={254}
                  placeholder="Email"
                  className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  aria-label="Phone number"
                  name="phone"
                  maxLength={40}
                  placeholder="Phone"
                  className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  aria-label="Subject"
                  required
                  name="subject"
                  maxLength={200}
                  placeholder="Subject"
                  className="rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <textarea
                aria-label="Your message"
                required
                rows={5}
                name="message"
                maxLength={4000}
                placeholder="Your message..."
                className="mt-4 w-full rounded-md border border-border px-4 py-3 text-sm text-navy placeholder:text-navy-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy text-white px-7 py-3 text-sm font-medium hover:opacity-90"
              >
                <Send size={14} /> Send Message
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
