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

  const notes = [
    typeLabel,
    planet.potentiallyHabitable ? "in the habitable zone" : null,
    planet.year && planet.year >= 2022 ? "found in the Webb era" : null,
  ].filter(Boolean).join(", ");

  return (
    <button
      onClick={() => onClick(planet)}
      className="text-left w-full rounded-lg p-4 transition-colors group hover:bg-white/[0.03]"
      style={{ background: "#0A0F17", border: "1px solid #161E2A" }}
    >
      <div className="flex justify-center mb-3">
        <PlanetCanvas planet={planet} size={canvasSize} />
      </div>

      <div className="font-serif text-[19px] leading-tight truncate group-hover:underline underline-offset-4 decoration-1" style={{ color: "#E8ECF1" }}>
        {planet.name}
      </div>
      <div className="mt-1 text-[13px] leading-snug" style={{ color: typeColor }}>{notes.charAt(0).toUpperCase() + notes.slice(1)}</div>

      <dl className="m-0 mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {[
          { label: "Size", val: formatRadius(planet.radius) },
          { label: "Temperature", val: planet.temp ? `${planet.temp.toFixed(0)} K` : "Unknown" },
          { label: "Distance", val: formatDistanceLY(planet.distanceLY) },
          { label: "Found", val: planet.year?.toString() ?? "Unknown" },
        ].map(({ label, val }) => (
          <div key={label}>
            <dt className="text-[12px]" style={{ color: "#7C8794" }}>{label}</dt>
            <dd className="m-0 text-[13px] tabular-nums" style={{ color: "#C9D2DC" }}>{val}</dd>
          </div>
        ))}
      </dl>

      {planet.esi > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[12px] mb-1" style={{ color: "#7C8794" }}>
            <span>Earth similarity</span>
            <span className="tabular-nums" style={{ color: "#C9D2DC" }}>{(planet.esi * 100).toFixed(0)}%</span>
          </div>
          <div className="h-[2px]" style={{ background: "#1C2533" }}>
            <div className="h-full" style={{ width: `${planet.esi * 100}%`, background: "#A9C3E0" }} />
          </div>
        </div>
      )}
    </button>
  );
});

// Quote card that appears between planet cards
export function QuoteCard({ text }: { text: string }) {
  return (
    <div className="col-span-full py-10 px-2" style={{ borderTop: "1px solid #1C2533", borderBottom: "1px solid #1C2533" }}>
      <p className="m-0 font-serif text-[22px] leading-snug max-w-[40rem] mx-auto text-center" style={{ color: "#C9D2DC" }}>
        {text}
      </p>
    </div>
  );
}
