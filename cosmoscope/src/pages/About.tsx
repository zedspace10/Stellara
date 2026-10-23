import { useEffect } from "react";
import { Link } from "wouter";
import { Heart, Star, Globe, BookOpen, ChevronRight, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import MailingListForm from "@/components/MailingListForm";

export default function About() {
  useEffect(() => {
    document.title = "About · PALE";
  }, []);

  return (
    <div className="min-h-screen pt-20" style={{ background: "#05070C" }}>
      <div className="max-w-2xl mx-auto px-5 py-10">

        <div className="text-center mb-14">
          <h1 className="m-0 text-4xl md:text-5xl font-bold" style={{ color: "#F5FAFF", letterSpacing: "0.32em" }}>
            PALE
          </h1>
          <p className="mt-3 mb-0 text-base" style={{ color: "#A7B6C6" }}>A calm space to think</p>
        </div>

        <Section icon={<Globe className="w-4 h-4" />} title="What is PALE?" color="#8DEBFF">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D4DF" }}>
            PALE uses astronomy and cosmology as a way to find perspective. Seeing how vast the universe is, and how
            small and rare our world is within it, can make a hard day feel a little lighter.
          </p>
          <p className="mt-3 mb-0 text-[15px] leading-relaxed" style={{ color: "#C9D4DF" }}>
            On the website you can fly through the solar system in 3D, journey from the Planck length to the edge of
            the observable universe, watch stars form and die, and find out what is in your sky tonight. The PALE app
            brings the same calm space to your phone.
          </p>
        </Section>

        <Section icon={<Star className="w-4 h-4" />} title="Why we built it" color="#F3DDB0">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D4DF" }}>
            Space tools have often been locked behind expensive software or paywalls, or cluttered with ads. We think
            the universe belongs to everyone, and that a moment of wonder should never cost anything.
          </p>
        </Section>

        <Section icon={<Heart className="w-4 h-4" />} title="Our mission" color="#A995FF">
          <ul className="m-0 p-0 list-none space-y-2">
            {[
              "Make space science accessible to everyone, everywhere",
              "Help people find perspective, calm and meaning by looking up",
              "Inspire the next generation of astronomers and scientists",
              "Donate telescopes to UK schools and community groups",
              "Keep PALE free, with no ads and no premium tiers",
              "Check every fact against its source, and keep reflection clearly separate from science",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-[15px]" style={{ color: "#C9D4DF" }}>
                <span aria-hidden="true" style={{ color: "#A995FF" }}>·</span> {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<BookOpen className="w-4 h-4" />} title="Who makes it" color="#8DEBFF">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D4DF" }}>
            PALE is made by Stellara, a not for profit space education project based in the UK. The 3D universe is
            built with Three.js, and imagery comes from NASA, ESA and the James Webb Space Telescope.
          </p>
        </Section>

        <div className="rounded-2xl p-6 mb-4" style={{ background: "#0D1520", border: "1px solid #1D3040" }}>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4" style={{ color: "#8DEBFF" }} aria-hidden="true" />
            <h2 className="m-0 text-sm font-semibold" style={{ color: "#F5FAFF" }}>Stay in touch</h2>
          </div>
          <p className="mt-1 mb-4 text-[15px]" style={{ color: "#A7B6C6" }}>
            Occasional notes about meteor showers, eclipses and new things on PALE. No spam, ever.
          </p>
          <MailingListForm />
        </div>

        <div className="mt-10 text-center">
          <Link href="/universe" className="inline-flex items-center gap-2 text-[15px] no-underline" style={{ color: "#8DEBFF" }}>
            Open the interactive universe <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

      </div>
      <Footer />
    </div>
  );
}

function Section({
  icon, title, color, children,
}: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl p-5 mb-4" style={{ background: "#0D1520", border: "1px solid #1D3040" }}>
      <div className="flex items-center gap-2 mb-4">
        <span aria-hidden="true" style={{ color }}>{icon}</span>
        <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "#A7B6C6" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
