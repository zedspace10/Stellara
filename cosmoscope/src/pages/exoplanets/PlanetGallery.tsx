import { Fragment, useState, useRef, useCallback, useEffect } from "react";
import type { ExoplanetData } from "./types";
import { PlanetCard, QuoteCard } from "./PlanetCard";
import { getPlanetOfWeek, GALLERY_QUOTES } from "./utils";
import PlanetCanvas from "./PlanetCanvas";

interface Props {
  planets: ExoplanetData[];
  onSelect: (p: ExoplanetData) => void;
}

const PAGE_SIZE = 48;

export default function PlanetGallery({ planets, onSelect }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const potw = getPlanetOfWeek();
  const potwPlanet = planets.find(p => p.name === potw) ?? planets[0];

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
      {/* Planet of the week */}
      {potwPlanet && (
        <div className="mb-8">
          <h2 className="m-0 mb-3 text-[22px] font-normal" style={{ color: "#E8ECF1" }}>This week's world</h2>
          <button
            onClick={() => onSelect(potwPlanet)}
            className="w-full rounded-lg p-5 flex items-center gap-5 text-left transition-colors hover:bg-white/[0.03]"
            style={{ background: "#0A0F17", border: "1px solid #1C2533" }}
          >
            <div className="flex-shrink-0">
              <PlanetCanvas planet={potwPlanet} size={100} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="m-0 mb-1 font-serif text-[28px] font-normal leading-tight" style={{ color: "#E8ECF1" }}>{potwPlanet.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {potwPlanet.potentiallyHabitable
                  ? "This world sits within its star's habitable zone, one of the most compelling candidates in the known catalogue for conditions that could support liquid water."
                  : `Discovered in ${potwPlanet.year ?? "unknown"} by the ${potwPlanet.method} method, this world is ${(potwPlanet.radius ?? 1).toFixed(1)} times the size of Earth and orbiting ${potwPlanet.starName}.`}
              </p>
            </div>
          </button>
        </div>
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
            All {planets.length.toLocaleString()} worlds explored.
          </div>
          <div className="text-xs text-white/20 mt-1">The search for more continues.</div>
        </div>
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
