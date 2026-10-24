import { useEffect } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { APP_STORE_URL } from "@/lib/links";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const TINT = "#A9C3E0";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="m-0 text-[28px] leading-tight" style={{ color: TEXT, fontWeight: 400 }}>{title}</h2>
      <div className="mt-4 space-y-4 text-[17px] leading-[1.7]" style={{ color: BODY }}>{children}</div>
    </section>
  );
}

export default function About() {
  useEffect(() => {
    document.title = "About | PALE";
  }, []);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C" }}>
      <article className="max-w-[38rem] mx-auto px-5 md:px-0 pt-14 pb-10">
        <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>About PALE</h1>
        <p className="mt-6 mb-0 font-serif text-[22px] leading-snug" style={{ color: TEXT }}>
          Seeing how vast the universe is, and how small and rare our world is within it, can make a hard day feel a
          little lighter. PALE is built around that idea.
        </p>

        <Section title="What you can do here">
          <p className="m-0">
            Fly through the solar system in 3D with every planet where it really is today. Journey from the smallest
            length that makes sense to the edge of the observable universe. Watch stars form and die. Find out what is in
            your sky tonight.{" "}
            {APP_STORE_URL ? (
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: TINT }}>
                The PALE app
              </a>
            ) : "The PALE app"}{" "}
            brings the same calm space to your phone.
          </p>
        </Section>

        <Section title="Why we built it">
          <p className="m-0">
            Space tools have often been locked behind expensive software or paywalls, or cluttered with ads. We think the
            universe belongs to everyone, and that a moment of wonder should never cost anything.
          </p>
        </Section>

        <Section title="What we care about">
          <ul className="m-0 pl-5 space-y-2 list-disc marker:text-[#5D6B79]">
            <li>Space science anyone can use, wherever they are</li>
            <li>Helping people find perspective and calm by looking up</li>
            <li>Inspiring the next generation of astronomers and scientists</li>
            <li>Donating telescopes to UK schools and community groups</li>
            <li>Keeping PALE free, with no ads and no premium tiers</li>
            <li>Checking every fact against its source, and keeping reflection clearly separate from science</li>
          </ul>
        </Section>

        <Section title="Who makes it">
          <p className="m-0">
            PALE is made by Stellara, a space education project based in the UK. The 3D universe is built with Three.js,
            and imagery comes from NASA, ESA and the James Webb Space Telescope.
          </p>
          <p className="m-0 text-[14px] leading-relaxed" style={{ color: MUTED }}>
            Planet positions use NASA JPL orbital elements. Planet and Sun surfaces are from{" "}
            <a href="https://www.solarsystemscope.com/textures/" className="underline underline-offset-2" style={{ color: BODY }}>Solar System Scope</a>,
            used under CC BY 4.0. The night sky uses the Yale Bright Star Catalogue. The typefaces are Newsreader and
            Instrument Sans, both under the SIL Open Font License.
          </p>
        </Section>

        <p className="mt-14 mb-0 text-[17px]">
          <Link href="/" className="underline underline-offset-4" style={{ color: TINT }}>Open the universe</Link>
        </p>
      </article>
      <Footer />
    </div>
  );
}
