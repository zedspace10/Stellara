import { memo } from "react";
import type { ExoplanetData } from "./types";
import { getPlanetTypeLabel, getPlanetTypeColor, formatDistanceLY, formatTemp, formatRadius } from "./utils";
import PlanetCanvas from "./PlanetCanvas";

interface Props {
  planet: ExoplanetData;
  onClick: (p: ExoplanetData) => void;
  featured?: boolean;
}

export const PlanetCard = memo(function PlanetCard({ planet, onClick, featured = false }: Props) {
  const typeColor = getPlanetTypeColor(planet.planetType);
  const typeLabel = getPlanetTypeLabel(planet.planetType);
  const canvasSize = featured ? 120 : 80;

  return (
    <button
      onClick={() => onClick(planet)}
      className="text-left w-full rounded-2xl p-4 transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,213,79,0.35)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(255,213,79,0.06)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Planet illustration */}
      <div className="flex justify-center mb-3">
        <PlanetCanvas planet={planet} size={canvasSize} />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[9px] px-2 py-0.5 rounded-full border font-medium"
          style={{ color: typeColor, borderColor: typeColor + "44", background: typeColor + "11" }}>
          {typeLabel}
        </span>
        {planet.potentiallyHabitable && (
          <span className="text-[9px] px-2 py-0.5 rounded-full border font-medium"
            style={{ color: "#66bb6a", borderColor: "#66bb6a44", background: "#66bb6a11" }}>
            ◉ HZ
          </span>
        )}
        {planet.year && planet.year >= 2022 && (
          <span className="text-[9px] px-2 py-0.5 rounded-full border font-medium"
            style={{ color: "#ffd54f", borderColor: "#ffd54f44", background: "#ffd54f11" }}>
            Webb
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-sm font-['Orbitron'] text-white/90 leading-tight mb-0.5 truncate group-hover:text-[#ffd54f] transition-colors">
        {planet.name}
      </div>
      <div className="text-[10px] text-white/35 mb-3 truncate">{planet.starName}</div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {[
          { label: "Radius", val: formatRadius(planet.radius) },
          { label: "Temp", val: planet.temp ? `${planet.temp.toFixed(0)} K` : "—" },
          { label: "Distance", val: formatDistanceLY(planet.distanceLY) },
          { label: "Found", val: planet.year?.toString() ?? "—" },
        ].map(({ label, val }) => (
          <div key={label}>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
            <div className="text-[11px] text-white/70 font-mono">{val}</div>
          </div>
        ))}
      </div>

      {/* ESI bar */}
      {planet.esi > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[9px] text-white/30 mb-1">
            <span>Earth Similarity</span>
            <span className={planet.esi > 0.6 ? "text-[#66bb6a]" : ""}>{(planet.esi * 100).toFixed(0)}%</span>
          </div>
          <div className="h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${planet.esi * 100}%`, background: planet.esi > 0.6 ? "#66bb6a" : planet.esi > 0.3 ? "#4fc3f7" : "#556677" }} />
          </div>
        </div>
      )}
    </button>
  );
});

// Quote card that appears between planet cards
export function QuoteCard({ text }: { text: string }) {
  return (
    <div className="col-span-full py-10 px-8 text-center rounded-2xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-base text-white/50 italic leading-relaxed max-w-2xl mx-auto font-light">
        "{text}"
      </p>
    </div>
  );
}
