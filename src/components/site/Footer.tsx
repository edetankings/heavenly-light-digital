import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Clock } from "lucide-react";
import logo from "@/assets/church-logo.jpg.asset.json";

export function Footer() {
  return (
    <footer className="relative bg-navy text-white mt-24 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[80%] rounded-full bg-[var(--gold)]/10 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2 max-w-md">
          <img src={logo.url} alt="Risen Power Gospel Ministries" className="h-20 w-20 object-contain bg-white rounded-full p-2 mb-5 ring-1 ring-[var(--gold)]/40" />
          <p className="text-white/70 text-sm leading-relaxed">
            Where faith is ignited, lives are transformed, and God's power is revealed. Join us in Delta State as we encounter the living God together.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)] hover:-translate-y-0.5 transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[var(--gold)] text-[11px] font-semibold uppercase tracking-[0.25em] mb-5">Explore</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            {[["/about","About"],["/sermons","Sermons"],["/events","Events"],["/gallery","Gallery"],["/testimonies","Testimonies"],["/contact","Contact"]].map(([to,l]) => (
              <li key={to}><Link to={to} className="hover:text-[var(--gold)] transition">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] text-[11px] font-semibold uppercase tracking-[0.25em] mb-5">Visit</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><a href="https://maps.app.goo.gl/PtuwLzYDwzKFwocJ9?g_st=ac" target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition">VITAFOAM Comfort Center, DSC Expressway, Effurun GRA, Warri 330102, Delta State, Nigeria</a></li>
            <li className="flex gap-2"><Phone size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><a href="tel:09072523125" className="hover:text-[var(--gold)] transition">09072523125</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--gold)] text-[11px] font-semibold uppercase tracking-[0.25em] mb-5">Service Times</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2"><Clock size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><span><span className="block text-white">Sunday</span>8:00 AM Divine Service</span></li>
            <li className="flex gap-2"><Clock size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><span><span className="block text-white">Wednesday</span>5:00 PM Bible Study</span></li>
            <li className="flex gap-2"><Clock size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><span><span className="block text-white">Friday</span>5:00 PM Revival Service</span></li>
            <li className="flex gap-2"><Clock size={16} className="shrink-0 mt-0.5 text-[var(--gold)]" /><span><span className="block text-white">1st &amp; 3rd Saturday</span>8:00 AM Morning Prayer</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Risen Power Gospel Ministries. All rights reserved.</p>
          <p>"For the kingdom of God is not in word, but in power." — 1 Cor 4:20</p>
        </div>
      </div>
    </footer>
  );
}
