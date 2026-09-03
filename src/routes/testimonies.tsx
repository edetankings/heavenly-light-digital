import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Send, Quote } from "lucide-react";
import { PageHeader, Reveal } from "@/components/site/Section";
import { useTestimonies } from "@/lib/supabase-data";
import { supabase } from "@/integrations/supabase/client";
import { ShareMenu } from "@/components/site/ShareMenu";

export const Route = createFileRoute("/testimonies")({
  head: () => ({
    meta: [
      { title: "Testimonies — Risen Power Gospel Ministry" },
      { name: "description", content: "Read what God is doing at Risen Power Gospel Ministry — and share your own testimony." },
      { property: "og:title", content: "Testimonies — Risen Power Gospel Ministry" },
      { property: "og:description", content: "Read what God is doing — and share your own testimony." },
      { property: "og:url", content: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/testimonies` },
    ],
    links: [{ rel: "canonical", href: `${import.meta.env.VITE_BASE_URL ?? "http://localhost:5173"}/testimonies` }],
  }),
  component: Testimonies,
});

function Testimonies() {
  const { data: all } = useTestimonies();
  const approved = all.filter(t => t.is_approved);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await (supabase.from as any)("testimonies").insert({
      name: String(fd.get("name")).trim(),
      email: String(fd.get("email") || "").trim() || null,
      title: String(fd.get("title") || "").trim() || null,
      message: String(fd.get("message")).trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thank you! Your testimony will be published after review.");
    e.currentTarget.reset();
  };

  return (
    <div>
      <PageHeader tag="His Goodness" title="Testimonies" subtitle="The Lord has done great things — share what He has done for you." />
      <section className="py-12 bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 lg:grid-cols-5">
          <Reveal>
            <form onSubmit={onSubmit} className="lg:col-span-2 glass-card p-7 space-y-3 self-start">
              <h2 className="font-display text-2xl text-navy">Share Your Testimony</h2>
              <p className="text-sm text-navy-muted">Your story will go to our team for approval before being published.</p>
              <input aria-label="Your name" name="name" required placeholder="Your name" className="w-full rounded-md border border-border px-4 py-2.5 text-sm" />
              <input aria-label="Email address (optional)" name="email" type="email" placeholder="Email (optional)" className="w-full rounded-md border border-border px-4 py-2.5 text-sm" />
