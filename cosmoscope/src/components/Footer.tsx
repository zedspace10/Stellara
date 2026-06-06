import { Link } from "wouter";
import { Mail } from "lucide-react";
import MailingListForm from "./MailingListForm";

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t py-10 px-5"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(2,2,8,0.5)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
          <div>
            <div
              className="text-xl font-bold tracking-wider mb-1"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              <span className="text-white">STELLAR</span>
              <span style={{ color: "#ffd54f" }}>A</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Explore the Universe, One Star at a Time
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: "/about", label: "About" },
              { href: "/blog", label: "Blog" },
              { href: "/education", label: "Education" },
              { href: "/observatory", label: "Tonight's Sky" },
              { href: "/ask", label: "Ask the Universe" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="text-right">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,213,79,0.7)" }}>
              Free forever. No ads. No profit. Just space.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(79,195,247,0.04)", border: "1px solid rgba(79,195,247,0.12)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-3.5 h-3.5" style={{ color: "#4fc3f7" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              Stay in the loop
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            New features, space events, and cosmic discoveries — delivered to your inbox.
          </p>
          <MailingListForm compact />
        </div>

        <div
          className="pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px]"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.22)" }}
        >
          <p>Imagery: NASA / ESA / Webb · Built with ♥ for everyone</p>
          <p>STELLARA is a Community Interest Company</p>
        </div>
      </div>
    </footer>
  );
}
