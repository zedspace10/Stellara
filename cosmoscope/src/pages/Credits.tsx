import { useEffect } from "react";
import Footer from "@/components/Footer";
import { CONTACT_EMAIL } from "@/lib/links";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const TINT = "#A9C3E0";
const RULE = "#1C2533";

interface Source {
  what: string;
  from: string;
  href?: string;
  terms: string;
}

const GROUPS: { title: string; intro?: string; items: Source[] }[] = [
  {
    title: "The universe",
    intro:
      "Inside the ring in the universe view, every galaxy is a real one at its measured direction and distance. Beyond it, the cosmic web is an illustration of what the large scale universe is like, with the great clusters placed in their real directions.",
    items: [
      {
        what: "Galaxies within about 40 million light years",
        from: "Local Volume Database, A. B. Pace (2024), version 1.1.1",
        href: "https://github.com/apace7/local_volume_database",
        terms: "Public domain (CC0)",
      },
      {
        what: "Directions and distances of the Virgo, Coma and Perseus clusters and the Great Attractor",
        from: "Published measurements, rounded",
        terms: "Facts, not subject to copyright",
      },
    ],
  },
  {
    title: "The solar system",
    items: [
      {
        what: "Planet positions",
        from: "NASA JPL, approximate orbital elements for the major planets",
        href: "https://ssd.jpl.nasa.gov/planets/approx_pos.html",
        terms: "NASA, not subject to copyright",
      },
      {
        what: "Comet orbits",
        from: "NASA JPL Small-Body Database",
        href: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html",
        terms: "NASA, not subject to copyright",
      },
      {
        what: "Where Voyager 1, Voyager 2 and New Horizons are",
        from: "Distances and directions from the Sun on 24 October 2026, from Heavens Above",
        href: "https://www.heavens-above.com/",
        terms: "Facts, not subject to copyright",
      },
      {
        what: "Planet and Sun surfaces",
        from: "Solar System Scope. Saturn's rings and Earth's clouds were adapted from their files.",
        href: "https://www.solarsystemscope.com/textures/",
        terms: "CC BY 4.0",
      },
      {
        what: "Earth seen by Voyager 1, the Pale Blue Dot revisited",
        from: "NASA/JPL-Caltech, image PIA23645",
        href: "https://photojournal.jpl.nasa.gov/catalog/PIA23645",
        terms: "NASA, not subject to copyright",
      },
    ],
  },
  {
    title: "The sky and beyond",
    items: [
      {
        what: "Stars in the night sky",
        from: "Yale Bright Star Catalogue",
        terms: "Facts, not subject to copyright",
      },
      {
        what: "Planets around other stars",
        from: "NASA Exoplanet Archive",
        href: "https://exoplanetarchive.ipac.caltech.edu/",
        terms: "NASA, free to use with credit",
      },
      {
        what: "Picture of the day",
        from: "NASA Astronomy Picture of the Day. Each picture is credited to its own author.",
        href: "https://apod.nasa.gov/",
        terms: "Varies by picture, as stated with each one",
      },
      {
        what: "Star directions and distances for notes",
        from: "Published positions and distances for each star, rounded",
        terms: "Facts, not subject to copyright",
      },
    ],
  },
  {
    title: "How it is made",
    items: [
      { what: "3D graphics", from: "Three.js", href: "https://threejs.org/", terms: "MIT License" },
      { what: "Typefaces", from: "Newsreader and Instrument Sans", terms: "SIL Open Font License" },
    ],
  },
];

export default function Credits() {
  useEffect(() => {
    document.title = "Sources and credits | PALE";
  }, []);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C" }}>
      <article className="max-w-[44rem] mx-auto px-5 md:px-0 pt-14 pb-12">
        <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>Sources and credits</h1>
        <p className="mt-5 mb-0 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Everything in PALE that describes the real universe comes from published data. This is where each part comes
          from, and the terms it is shared under. All the writing on PALE is our own.
        </p>

        {GROUPS.map((g) => (
          <section key={g.title} className="mt-14">
            <h2 className="m-0 text-[26px] font-normal" style={{ color: TEXT }}>{g.title}</h2>
            {g.intro && <p className="mt-3 mb-0 text-[15px] leading-relaxed" style={{ color: BODY }}>{g.intro}</p>}
            <dl className="m-0 mt-5" style={{ borderTop: `1px solid ${RULE}` }}>
              {g.items.map((it) => (
                <div key={it.what} className="py-4 grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-x-6 gap-y-1" style={{ borderBottom: `1px solid ${RULE}` }}>
                  <dt className="text-[15px]" style={{ color: TEXT }}>{it.what}</dt>
                  <dd className="m-0 text-[15px] leading-relaxed" style={{ color: BODY }}>
                    {it.href ? (
                      <a href={it.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: TINT }}>{it.from}</a>
                    ) : (
                      it.from
                    )}
                    <span className="block mt-1 text-[13px]" style={{ color: MUTED }}>{it.terms}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="mt-14 mb-0 text-[15px] leading-relaxed" style={{ color: MUTED }}>
          Spotted something we have credited wrongly, or a fact that is out of date? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4" style={{ color: TINT }}>{CONTACT_EMAIL}</a> and we will fix it.
        </p>
      </article>
      <Footer />
    </div>
  );
}
