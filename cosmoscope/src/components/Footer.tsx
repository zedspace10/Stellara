import { Link } from "wouter";
import { Mail } from "lucide-react";
import MailingListForm from "./MailingListForm";
import { CONTACT_EMAIL } from "@/lib/links";

const LINKS = [
  { href: "/", label: "Universe" },
  { href: "/tonight", label: "Tonight" },
  { href: "/scale", label: "Scale" },
  { href: "/simulations", label: "Simulations" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t px-6 py-12" style={{ borderColor: "#1D3040", background: "#05070C" }}>
      <div className="max-w-[1240px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.32em", color: "#F5FAFF" }}>PALE</div>
            <p className="mt-1.5 mb-0 text-sm" style={{ color: "#A7B6C6" }}>A calm space to think.</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm no-underline transition-colors hover:text-white"
                style={{ color: "#A7B6C6" }}
              >
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm no-underline transition-colors hover:text-white" style={{ color: "#A7B6C6" }}>
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>

        <div className="rounded-2xl p-6 mb-8" style={{ background: "#0D1520", border: "1px solid #1D3040" }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4" style={{ color: "#8DEBFF" }} aria-hidden="true" />
            <h2 className="m-0 text-sm font-semibold" style={{ color: "#F5FAFF" }}>Hear when something is worth looking up for</h2>
          </div>
          <p className="mt-0 mb-4 text-sm" style={{ color: "#A7B6C6" }}>
            Occasional notes about meteor showers, eclipses and new things on PALE. No spam.
          </p>
          <MailingListForm compact />
        </div>

        <div
          className="pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
          style={{ borderColor: "#1D3040", color: "#7C8C9C" }}
        >
          <p className="m-0">Imagery: NASA, ESA and Webb. Free, with no ads.</p>
          <p className="m-0">PALE is made by Stellara, a not for profit space education project in the UK.</p>
        </div>
      </div>
    </footer>
  );
}
