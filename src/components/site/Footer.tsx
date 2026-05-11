import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <h3 className="font-display text-2xl text-white mb-3">Risen Power Gospel Ministry</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Where faith is ignited, lives are transformed, and God's power is revealed.
            Join us in Port Harcourt, Rivers State as we encounter the living God together.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:bg-white hover:text-navy transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {[["/about","About"],["/sermons","Sermons"],["/events","Events"],["/gallery","Gallery"],["/contact","Contact"]].map(([to,l]) => (
              <li key={to}><Link to={to} className="hover:text-white transition">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Visit</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5" />Port Harcourt, Rivers State, Nigeria</li>
            <li className="flex gap-2"><Phone size={16} className="shrink-0 mt-0.5" />+234 803 000 0000</li>
            <li className="flex gap-2"><Mail size={16} className="shrink-0 mt-0.5" />hello@risenpower.ng</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Risen Power Gospel Ministry. All rights reserved.</p>
          <p>"For the kingdom of God is not in word, but in power." — 1 Cor 4:20</p>
        </div>
      </div>
    </footer>
  );
}
