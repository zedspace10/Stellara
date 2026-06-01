import { useState } from "react";
import type { ExoplanetData } from "./types";
import { formatRadius, getPlanetTypeLabel, formatDistanceLY, formatTemp } from "./utils";
import PlanetCanvas from "./PlanetCanvas";

interface Props {
  planets: ExoplanetData[];
  onSelect: (p: ExoplanetData) => void;
}

const SOLAR_SYSTEM = [
  { name: "Mercury", radius: 0.383, color: "#aaa" },
  { name: "Venus", radius: 0.949, color: "#e8c96a" },
  { name: "Earth", radius: 1.0, color: "#4488cc" },
  { name: "Mars", radius: 0.532, color: "#cc5533" },
  { name: "Jupiter", radius: 11.21, color: "#c8965a" },
  { name: "Saturn", radius: 9.45, color: "#d4a96a" },
  { name: "Uranus", radius: 4.01, color: "#88ccdd" },
  { name: "Neptune", radius: 3.88, color: "#3355cc" },
];

interface CompareItem {
  planet: ExoplanetData;
  label?: string;
}

export default function ComparisonView({ planets, onSelect }: Props) {
  const [selected, setSelected] = useState<CompareItem[]>([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const maxRadius = Math.max(
    ...SOLAR_SYSTEM.map(p => p.radius),
    ...selected.map(c => c.planet.radius ?? 1),
    1
  );
  const BASE_PX = 48; // Earth radius in px

  const addPlanet = (p: ExoplanetData) => {
    if (selected.some(c => c.planet.id === p.id)) return;
    setSelected(s => [...s, { planet: p }]);
    setShowSearch(false);
    setSearch("");
    onSelect(p);
  };

  const removePlanet = (id: string) => setSelected(s => s.filter(c => c.planet.id !== id));

  const results = search.length > 1
    ? planets.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const getBarH = (r: number) => Math.max(4, (r / maxRadius) * BASE_PX * 5);

  return (
    <div className="px-4 pb-20 pt-4">
      <div className="text-center mb-6">
        <div className="text-[10px] tracking-widest text-white/30 uppercase mb-1">Comparison View</div>
        <p className="text-sm text-white/50">See exoplanets sized relative to our solar system. Click any bar to explore.</p>
      </div>

      {/* Solar system reference */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-[10px] tracking-widest text-white/30 uppercase mb-4">Our Solar System — Reference</div>
        <div className="flex items-end gap-3 overflow-x-auto pb-2">
          {SOLAR_SYSTEM.map(p => {
            const h = getBarH(p.radius);
            return (
              <div key={p.name} className="flex flex-col items-center flex-shrink-0">
                <div className="text-[9px] text-white/40 mb-1">{p.radius}R⊕</div>
                <div className="rounded-full" style={{ width: Math.max(8, p.radius / maxRadius * BASE_PX * 2.5), height: Math.max(8, p.radius / maxRadius * BASE_PX * 2.5), background: `radial-gradient(circle at 35% 35%, white, ${p.color})`, boxShadow: `0 0 ${Math.max(4, p.radius * 2)}px ${p.color}66` }} />
                <div className="text-[9px] text-white/50 mt-1 whitespace-nowrap">{p.name}</div>
                <div className="mt-1 rounded-full w-1.5" style={{ height: h, background: p.color + "33" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add exoplanet */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowSearch(s => !s)}
          className="w-full py-3 rounded-xl text-sm border transition-colors text-white/50 hover:text-white"
          style={{ border: "1px solid rgba(79,195,247,0.2)", background: "rgba(79,195,247,0.04)" }}
        >
          + Add an exoplanet to compare
        </button>
        {showSearch && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden" style={{ background: "rgba(6,6,22,0.98)", border: "1px solid rgba(79,195,247,0.2)" }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search planet name..."
              className="w-full px-4 py-3 text-sm text-white bg-transparent outline-none border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            />
            {results.map(p => (
              <button key={p.id} onClick={() => addPlanet(p)}
                className="w-full px-4 py-2.5 text-sm text-left text-white/70 hover:text-white hover:bg-white/5 transition-colors flex justify-between">
                <span>{p.name}</span>
                <span className="text-[10px] text-white/30">{formatRadius(p.radius)}</span>
              </button>
            ))}
            {search.length > 1 && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-white/30">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Selected exoplanets comparison */}
      {selected.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,213,79,0.03)", border: "1px solid rgba(255,213,79,0.15)" }}>
          <div className="text-[10px] tracking-widest text-[#ffd54f]/60 uppercase mb-4">Exoplanet Comparison</div>
          <div className="flex items-end gap-4 overflow-x-auto pb-2">
            {/* Earth as reference */}
            <div className="flex flex-col items-center flex-shrink-0 opacity-40">
              <div className="text-[9px] text-white/40 mb-1">1.0 R⊕</div>
              <div className="rounded-full w-6 h-6" style={{ background: "radial-gradient(circle at 35% 35%, #aadeee, #1166aa)" }} />
              <div className="text-[9px] text-white/40 mt-1">Earth (ref)</div>
            </div>
            {selected.map(({ planet }) => {
              const r = planet.radius ?? 1;
              const displaySize = Math.max(6, Math.min(160, r / maxRadius * BASE_PX * 4));
              const h = getBarH(r);
              return (
                <div key={planet.id} className="flex flex-col items-center flex-shrink-0">
                  <div className="text-[9px] text-[#ffd54f]/80 mb-1">{formatRadius(planet.radius)}</div>
                  <div className="relative">
                    <PlanetCanvas planet={planet} size={displaySize} />
                  </div>
                  <div className="text-[9px] text-white/60 mt-1 max-w-[80px] text-center truncate font-['Orbitron']">{planet.name}</div>
                  <div className="text-[8px] text-white/30">{getPlanetTypeLabel(planet.planetType)}</div>
                  <div className="mt-1 rounded-full w-1.5" style={{ height: h, background: "rgba(255,213,79,0.25)" }} />
                  <button onClick={() => removePlanet(planet.id)} className="mt-2 text-[9px] text-white/25 hover:text-white/60 transition-colors">✕</button>
                </div>
              );
            })}
          </div>

          {/* Ratio table */}
          <div className="mt-5 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="grid text-[9px] text-white/30 uppercase tracking-wider px-4 py-2 border-b grid-cols-4"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span>World</span><span>vs Earth</span><span>Temp</span><span>Distance</span>
            </div>
            {selected.map(({ planet }) => (
              <div key={planet.id} className="grid grid-cols-4 px-4 py-2.5 text-xs" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-white/70 truncate font-['Orbitron'] text-[10px]">{planet.name}</span>
                <span className="text-[#ffd54f] font-mono">{planet.radius != null ? `${planet.radius.toFixed(1)}×` : "—"}</span>
                <span className="text-white/50 font-mono">{planet.temp ? `${planet.temp.toFixed(0)} K` : "—"}</span>
                <span className="text-white/50 font-mono">{formatDistanceLY(planet.distanceLY)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habitability leaderboard */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(102,187,106,0.03)", border: "1px solid rgba(102,187,106,0.12)" }}>
        <div className="text-[10px] tracking-widest text-[#66bb6a]/60 uppercase mb-3">Habitability Leaderboard — Top 20 Earth-like Candidates</div>
        <div className="space-y-2">
          {planets.filter(p => p.esi > 0).sort((a, b) => b.esi - a.esi).slice(0, 20).map((p, i) => (
            <button key={p.id} onClick={() => onSelect(p)} className="w-full flex items-center gap-3 py-1.5 hover:bg-white/5 rounded-lg px-2 transition-colors">
              <div className="text-[10px] text-white/25 w-5 text-right flex-shrink-0">#{i + 1}</div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs text-white/80 truncate font-['Orbitron']">{p.name}</div>
                <div className="text-[9px] text-white/30">{formatDistanceLY(p.distanceLY)} · {getPlanetTypeLabel(p.planetType)}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${p.esi * 100}%`, background: p.esi > 0.6 ? "#66bb6a" : "#4fc3f7" }} />
                </div>
                <div className="text-[10px] font-mono" style={{ color: p.esi > 0.6 ? "#66bb6a" : "#4fc3f7", minWidth: 32 }}>
                  {(p.esi * 100).toFixed(0)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Discovery timeline */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-[10px] tracking-widest text-white/30 uppercase mb-4">Discovery Timeline</div>
        <div className="relative">
          <div className="absolute left-16 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          {[
            { year: 1992, note: "First confirmed exoplanet (pulsar)" },
            { year: 1995, note: "51 Peg b — first around a Sun-like star" },
            { year: 2009, note: "Kepler launches — discoveries explode" },
            { year: 2014, note: "1,000 confirmed worlds" },
            { year: 2016, note: "TRAPPIST-1 announced" },
            { year: 2018, note: "TESS all-sky survey begins" },
            { year: 2022, note: "5,000 milestone. Webb launches" },
            { year: 2024, note: `5,600+ confirmed. Webb reads atmospheres` },
          ].map(({ year, note }) => (
            <div key={year} className="flex items-start gap-4 mb-3">
              <div className="text-[10px] text-white/30 font-mono w-12 flex-shrink-0 pt-0.5">{year}</div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: year >= 2022 ? "#ffd54f" : year >= 2009 ? "#4fc3f7" : "#666" }} />
              <div className="text-xs text-white/55 leading-relaxed">{note}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-[10px] text-white/25 text-center">
            In 30 years: zero known exoplanets → {planets.length.toLocaleString()}+ confirmed worlds. <br />
            We are just getting started.
          </div>
        </div>
      </div>

      {/* Nearest worlds */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(79,195,247,0.02)", border: "1px solid rgba(79,195,247,0.1)" }}>
        <div className="text-[10px] tracking-widest text-[#4fc3f7]/60 uppercase mb-1">Within Reach — Nearest Confirmed Worlds</div>
        <div className="text-[10px] text-white/25 mb-3">Exoplanets within 100 light years — the ones future technology might one day visit</div>
        <div className="space-y-2">
          {planets.filter(p => p.distanceLY != null && p.distanceLY <= 100)
            .sort((a, b) => (a.distanceLY ?? 0) - (b.distanceLY ?? 0))
            .slice(0, 10)
            .map(p => (
              <button key={p.id} onClick={() => onSelect(p)}
                className="w-full flex items-center justify-between py-1.5 hover:bg-white/5 rounded-lg px-2 transition-colors">
                <div className="text-left">
                  <div className="text-xs text-white/75 font-['Orbitron']">{p.name}</div>
                  <div className="text-[9px] text-white/30">{getPlanetTypeLabel(p.planetType)}{p.potentiallyHabitable ? " · 🟢 HZ" : ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#4fc3f7] font-mono">{formatDistanceLY(p.distanceLY)}</div>
                  {p.distanceLY != null && (
                    <div className="text-[9px] text-white/25">{(p.distanceLY * 10).toFixed(0)} yr at 10% c</div>
                  )}
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
