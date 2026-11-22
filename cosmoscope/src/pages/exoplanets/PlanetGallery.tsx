import { Fragment, useState, useRef, useCallback, useEffect } from "react";
import type { ExoplanetData } from "./types";
import { PlanetCard, QuoteCard } from "./PlanetCard";
import { GALLERY_QUOTES } from "./utils";
import PlanetCanvas from "./PlanetCanvas";
import { WORTH_KNOWING } from "./worthKnowing";

interface Props {
  planets: ExoplanetData[];
  onSelect: (p: ExoplanetData) => void;
  /** Every planet, so the six worth knowing can be found. Left out while a search or filter is on. */
  allPlanets?: ExoplanetData[];
}

const PAGE_SIZE = 48;

export default function PlanetGallery({ planets, onSelect, allPlanets }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const worth = allPlanets
    ? WORTH_KNOWING.map(w => ({ w, planet: allPlanets.find(p => p.name === w.archive) })).filter(x => x.planet)
    : [];

  // Intersection observer for infinite scroll
  const observe = useCallback(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + PAGE_SIZE, planets.length));
      }
    }, { rootMargin: "400px" });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [planets.length]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [planets]);

  useEffect(() => observe(), [observe]);

  const sliced = planets.slice(0, visible);

  return (
    <div className="px-5 md:px-8 pb-20 pt-4">
      {/* Six worth knowing */}
      {worth.length > 0 && (
        <section className="mb-10" aria-label="Worth knowing">
          <h2 className="m-0 text-[22px] font-normal" style={{ color: "#E8ECF1" }}>Worth knowing</h2>
          <p className="m-0 mt-1 mb-4 text-[13px]" style={{ color: "#7C8794" }}>
            Every picture here is an impression, not a photograph. Nobody has a close up picture of any of these worlds.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {worth.map(({ w, planet }) => (
              <button
                key={w.archive}
                onClick={() => onSelect(planet!)}
                className="rounded-lg p-4 flex items-start gap-4 text-left transition-colors hover:bg-white/[0.03]"
                style={{ background: "#0A0F17", border: "1px solid #1C2533" }}
              >
                <div className="flex-shrink-0 pt-1">
                  <PlanetCanvas planet={planet!} size={64} />
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 font-serif text-[20px] font-normal leading-tight" style={{ color: "#E8ECF1" }}>{w.name}</h3>
                  <p className="m-0 mt-0.5 text-[12px]" style={{ color: "#7C8794" }}>{w.where}</p>
                  <p className="m-0 mt-2 text-[13px] leading-relaxed" style={{ color: "#A3AFBC" }}>{w.text}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Count bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/50">
          {planets.length.toLocaleString()} confirmed worlds
        </div>
        <div className="text-xs text-white/25">{visible} loaded</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sliced.map((planet, i) => {
          const quoteAfter = (i + 1) % 20 === 0 && i < sliced.length - 1;
          return (
            <Fragment key={planet.id}>
              <PlanetCard planet={planet} onClick={onSelect} />
              {quoteAfter && (
                <QuoteCard text={GALLERY_QUOTES[Math.floor(i / 20) % GALLERY_QUOTES.length].text} />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Sentinel + end state */}
      <div ref={sentinelRef} className="h-8 mt-4" />
      {visible >= planets.length && planets.length > 0 && (
        <div className="text-center py-8">
          <div className="text-sm text-white/30 font-sans ">
            That is all {planets.length.toLocaleString()} here.
          </div>
          <div className="text-xs text-white/20 mt-1">The NASA Exoplanet Archive lists more than 6,000.</div>
        </div>
      )}
      {/* How we find them, and the thought to leave with */}
      {worth.length > 0 && visible >= planets.length && (
        <section className="max-w-[36rem] mx-auto py-10 text-center">
          <h2 className="m-0 text-[20px] font-normal" style={{ color: "#E8ECF1" }}>How we find them</h2>
          <p className="m-0 mt-3 text-[14px] leading-relaxed" style={{ color: "#A3AFBC" }}>
            Almost none of these planets has been seen directly. Most were found by watching a star dim very slightly, again
            and again, as a planet passed in front of it. Others gave themselves away by the tiny wobble their pull gives
            their star.
          </p>
          <p className="m-0 mt-6 font-serif text-[22px] leading-snug" style={{ color: "#E8ECF1" }}>
            Of every world we know, Earth is still the only one where we know anything lives.
          </p>
        </section>
      )}
      {planets.length === 0 && (
        <div className="text-center py-20">
          <div className="text-base text-white/30 font-sans mb-2">No worlds match these filters.</div>
          <div className="text-sm text-white/20">Try broadening your search.</div>
        </div>
      )}
    </div>
  );
}
