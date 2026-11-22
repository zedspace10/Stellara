import { useEffect, useState } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

// Other worlds: one calm page. How many planets we have found around other stars, a few of them
// worth knowing, and the plain fact that none is yet known to be like home.

const C = {
  border: "#1C2533",
  text: "#E8ECF1",
  muted: "#A3AFBC",
  faint: "#7C8794",
  tint: "#A9C3E0",
  warm: "#F3DDB0",
};

interface World {
  name: string;
  /** A plain guess at its colour, for a simple shaded disc. No continents, no oceans: we do not know. */
  tint: string;
  where: string;
  text: string;
}

const WORLDS: World[] = [
  {
    tint: "#C4895C",
    name: "51 Pegasi b",
    where: "50 light years away. A year there lasts about 4 days.",
    text: "In 1995, the first planet found around a star like the Sun. It is a giant, about half the mass of Jupiter, so close to its star that it races round in just over four days. Its discoverers, Michel Mayor and Didier Queloz, shared the Nobel Prize in Physics in 2019.",
  },
  {
    tint: "#9C8478",
    name: "Proxima Centauri b",
    where: "4.2 light years away. A year there lasts about 11 days.",
    text: "It circles the nearest star to the Sun. It is probably rocky, and it sits where water could be liquid, but its small red star often flares, and that may have stripped its air away.",
  },
  {
    tint: "#8E96A8",
    name: "TRAPPIST-1e",
    where: "40 light years away. A year there lasts about 6 days.",
    text: "One of seven Earth sized planets around a small, cool star. All seven would fit inside the orbit of Mercury. The Webb telescope is looking to see whether any of them have kept an atmosphere.",
  },
  {
    tint: "#A8806A",
    name: "Kepler-186f",
    where: "About 580 light years away. A year there lasts about 130 days.",
    text: "Found in 2014, the first planet about the size of Earth at the right distance from its star for liquid water. Its star is smaller and redder than the Sun, so noon there might look like the hour before sunset here.",
  },
  {
    tint: "#E2602E",
    name: "55 Cancri e",
    where: "41 light years away. A year there lasts about 18 hours.",
    text: "Almost twice the width of Earth, and so close to its star that its surface is probably molten rock. A whole year there is shorter than one day here.",
  },
  {
    tint: "#C9C1B4",
    name: "Kepler-16b",
    where: "245 light years away. A year there lasts about 229 days.",
    text: "A cold world about the size of Saturn that circles two stars at once. From its sky you would see two suns rise and two suns set.",
  },
];

/** A softly lit disc, lit from the upper left, in the planet's rough colour. */
function Disc({ tint }: { tint: string }) {
  return (
    <div
      aria-hidden="true"
      className="w-[64px] h-[64px] md:w-[96px] md:h-[96px] rounded-full"
      style={{
        background: `radial-gradient(circle at 34% 30%, color-mix(in srgb, ${tint} 55%, white) 0%, ${tint} 38%, color-mix(in srgb, ${tint} 30%, #05070C) 78%, #05070C 100%)`,
        boxShadow: `0 0 28px color-mix(in srgb, ${tint} 22%, transparent)`,
      }}
    />
  );
}

export default function ExoplanetExplorer() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Other worlds | PALE";
    const ctrl = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/exoplanets/count`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && j.count > 1000) setCount(j.count); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const howMany = count ? count.toLocaleString("en-GB") : "more than 6,000";

  return (
    <div className="min-h-screen pt-16" style={{ color: C.text }}>
      <div className="max-w-[920px] mx-auto px-5 md:px-8">
        <header className="pt-14 pb-12">
          <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]">Other worlds</h1>
          <p className="mt-4 mb-0 text-[17px] leading-relaxed max-w-[34rem]" style={{ color: C.muted }}>
            Many of the stars you can see have planets of their own. Since the first were found in the 1990s,
            astronomers have confirmed {howMany} of them.
          </p>
          <p className="mt-10 mb-0 font-serif text-[26px] md:text-[32px] leading-snug max-w-[34rem]">
            Not one of them is yet known to be like home.
          </p>
        </header>

        <section aria-label="A few of them" style={{ borderTop: `1px solid ${C.border}` }}>
          {WORLDS.map((w) => (
            <article
              key={w.name}
              className="grid grid-cols-[64px_1fr] md:grid-cols-[96px_1fr] gap-x-5 md:gap-x-8 py-8"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="pt-1">
                <Disc tint={w.tint} />
              </div>
              <div className="min-w-0">
                <h2 className="m-0 font-serif text-[24px] leading-tight" style={{ fontWeight: 400 }}>{w.name}</h2>
                <p className="mt-1 mb-0 text-[14px]" style={{ color: C.faint }}>{w.where}</p>
                <p className="mt-3 mb-0 text-[15px] leading-relaxed max-w-[36rem]" style={{ color: C.muted }}>{w.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="py-12 max-w-[36rem]">
          <h2 className="m-0 text-[22px] leading-tight" style={{ fontWeight: 400 }}>How we find them</h2>
          <p className="mt-3 mb-0 text-[15px] leading-relaxed" style={{ color: C.muted }}>
            Almost none of these planets has been seen directly. Most were found by watching a star dim very slightly, again
            and again, as a planet passed in front of it. Others gave themselves away by the tiny wobble their pull gives
            their star.
          </p>
          <p className="mt-8 mb-0 font-serif text-[22px] leading-snug">
            Of every world we know, Earth is still the only one where we know anything lives.
          </p>
          <p className="mt-6 mb-0 text-[15px]" style={{ color: C.muted }}>
            <Link href="/" className="underline underline-offset-4" style={{ color: C.tint }}>See our own Solar System in 3D</Link>, or{" "}
            <Link href="/note" className="underline underline-offset-4" style={{ color: C.tint }}>send a note towards TRAPPIST-1</Link>.
          </p>
          <p className="mt-10 mb-0 text-[13px]" style={{ color: C.faint }}>
            The count comes from the NASA Exoplanet Archive, checked once a day. Each circle is only a hint of a planet's
            colour: nobody has a close up picture of any of them.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
