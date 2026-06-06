import { Link } from "wouter";
import { Heart, Star, Globe, BookOpen, ChevronRight, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import MailingListForm from "@/components/MailingListForm";

export default function About() {
  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
      <div className="max-w-2xl mx-auto px-5 py-10">

        <div className="text-center mb-14">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.08em" }}
          >
            STELLARA
          </h1>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
            Explore the Universe, One Star at a Time
          </p>
        </div>

        <Section icon={<Globe className="w-4 h-4" />} title="What is STELLARA?" color="#4fc3f7">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            STELLARA is a free, open astronomy and cosmology platform built for everyone — from curious
            ten-year-olds to seasoned stargazers. We believe that the universe belongs to everyone, and that
            access to genuine scientific wonder should never cost anything.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
            You can explore our Solar System in 3D, journey from the Planck length to the Observable Universe,
            discover tonight's sky, read daily imagery from NASA, and ask any question about space to our AI guide.
          </p>
        </Section>

        <Section icon={<Star className="w-4 h-4" />} title="Why we built it" color="#ffd54f">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Space exploration tools have historically been locked behind expensive software, paywalled journals,
            or cluttered with ads. STELLARA was built because we thought that was wrong.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
            The universe is the greatest story ever told. It deserves a beautiful, free, accessible platform
            to explore it. That's what we're building.
          </p>
        </Section>

        <Section icon={<Heart className="w-4 h-4" />} title="Our mission" color="#9c27b0">
          <ul className="space-y-2">
            {[
              "Make space science accessible to everyone, everywhere",
              "Inspire the next generation of astronomers and scientists",
              "Donate telescopes to UK schools and community groups",
              "Keep STELLARA free, forever — no ads, no premium tiers",
              "Build with scientific accuracy and genuine wonder",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span style={{ color: "#9c27b0" }}>·</span> {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<BookOpen className="w-4 h-4" />} title="Technology" color="#4fc3f7">
          <div className="space-y-1.5">
            {[
              ["3D Universe", "Three.js — real-time solar system, galaxy, and cosmic web rendering"],
              ["Imagery", "NASA APOD API · ESA · Webb Space Telescope"],
              ["Space data", "SpaceX · launch trackers · live ISS data"],
            ].map(([name, desc]) => (
              <div key={name} className="flex gap-3 text-sm">
                <span className="shrink-0 font-semibold" style={{ color: "#4fc3f7", minWidth: "120px" }}>{name}</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <div
          className="rounded-2xl p-6 mb-4"
          style={{ background: "rgba(79,195,247,0.04)", border: "1px solid rgba(79,195,247,0.12)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4" style={{ color: "#4fc3f7" }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              Stay in the loop
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
            Get updates on new features, upcoming space events, and cosmic discoveries — straight to your inbox. No spam, ever.
          </p>
          <MailingListForm />
        </div>

        <div className="mt-10 text-center">
          <Link href="/">
            <button
              className="flex items-center gap-2 mx-auto text-sm transition-colors"
              style={{ color: "#4fc3f7" }}
            >
              Open Interactive Universe <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
      <Footer />
    </div>
  );
}

function Section({
  icon, title, color, accent, children,
}: {
  icon: React.ReactNode; title: string; color: string; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: accent ? "rgba(255,213,79,0.03)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${accent ? "rgba(255,213,79,0.12)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color }}>{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
