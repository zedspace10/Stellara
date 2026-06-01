import { X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { ExoplanetData } from "./types";
import {
  getPlanetTypeLabel, getPlanetTypeColor, formatRadius, formatMass,
  formatPeriod, formatTemp, formatDistanceLY, habitabilityAssessment,
  travelTimes, getStarColor,
} from "./utils";
import PlanetCanvas from "./PlanetCanvas";

interface Props {
  planet: ExoplanetData;
  allPlanets: ExoplanetData[];
  onClose: () => void;
  onNavigate: (p: ExoplanetData) => void;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-xs text-white/80 font-mono text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function HabitabilityBar({ temp }: { temp: number | null }) {
  if (temp == null) return null;
  const position = Math.max(0, Math.min(100, ((temp - 50) / (2000 - 50)) * 100));
  const hz = temp >= 180 && temp <= 320;

  return (
    <div className="mt-3">
      <div className="relative h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        {/* Cold zone */}
        <div className="absolute left-0 top-0 bottom-0 w-[9%]" style={{ background: "linear-gradient(to right, #334488, #4466aa)" }} />
        {/* HZ */}
        <div className="absolute top-0 bottom-0" style={{ left: "9%", width: "14.5%", background: "linear-gradient(to right, #226622, #44aa44, #226622)" }} />
        {/* Hot zone */}
        <div className="absolute right-0 top-0 bottom-0 w-[76.5%]" style={{ background: "linear-gradient(to right, #886622, #cc4400, #ff2200)" }} />
        {/* Marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_white]" style={{ left: `${position}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-white/30 mt-1">
        <span>Too Cold</span>
        <span className={hz ? "text-[#66bb6a]" : ""}>Habitable Zone</span>
        <span>Too Hot</span>
      </div>
    </div>
  );
}

function OrbitalDiagram({ systemPlanets, current }: { systemPlanets: ExoplanetData[]; current: ExoplanetData }) {
  const sorted = [...systemPlanets].sort((a, b) => (a.period ?? 0) - (b.period ?? 0));
  const maxPeriod = Math.max(...sorted.map(p => p.period ?? 1));

  return (
    <div className="relative h-20 flex items-center">
      {/* Star */}
      <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: "radial-gradient(circle at 35% 35%, #fffde7, #ffb300)", boxShadow: "0 0 12px rgba(255,200,0,0.6)" }} />
      {/* Orbits */}
      <div className="flex-1 relative ml-2">
        {sorted.map((p, i) => {
          const period = p.period ?? 1;
          const x = Math.pow(period / maxPeriod, 0.4) * 100;
          const isCurrent = p.id === current.id;
          return (
            <div key={p.id} className="absolute" style={{ left: `${x}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
              <div
                className={`rounded-full transition-all ${isCurrent ? "ring-2 ring-[#ffd54f]" : ""}`}
                style={{
                  width: isCurrent ? 10 : 6,
                  height: isCurrent ? 10 : 6,
                  background: isCurrent ? "#ffd54f" : getStarColor(p.spectralType ?? null),
                  boxShadow: isCurrent ? "0 0 8px #ffd54f" : undefined,
                  marginTop: i % 2 === 0 ? -2 : 2,
                }}
                title={p.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlanetDetail({ planet, allPlanets, onClose, onNavigate }: Props) {
  const typeColor = getPlanetTypeColor(planet.planetType);
  const assessment = habitabilityAssessment(planet);
  const travel = travelTimes(planet.distanceLY);
  const systemPlanets = allPlanets.filter(p => p.starName === planet.starName);
  const siblings = systemPlanets.filter(p => p.id !== planet.id);

  const nasa_url = `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.name)}`;

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
      style={{ background: "rgba(4,4,18,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(79,195,247,0.15)" }}
    >
      {/* Hero */}
      <div className="relative flex flex-col items-center pt-14 pb-8 px-6"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(79,195,247,0.06) 0%, transparent 70%)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <PlanetCanvas planet={planet} size={140} animated />
        <div className="mt-5 text-center">
          <h1 className="text-2xl font-bold font-['Orbitron'] text-white leading-tight">{planet.name}</h1>
          <div className="text-sm text-white/40 mt-1">{planet.starName}</div>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="text-xs px-3 py-1 rounded-full border font-medium"
              style={{ color: typeColor, borderColor: typeColor + "44", background: typeColor + "11" }}>
              {getPlanetTypeLabel(planet.planetType)}
            </span>
            {planet.potentiallyHabitable && (
              <span className="text-xs px-3 py-1 rounded-full border font-medium"
                style={{ color: "#66bb6a", borderColor: "#66bb6a44", background: "#66bb6a11" }}>
                ◉ Potentially Habitable
              </span>
            )}
            {planet.year && planet.year >= 2022 && (
              <span className="text-xs px-3 py-1 rounded-full border border-[#ffd54f]/30 text-[#ffd54f]"
                style={{ background: "rgba(255,213,79,0.08)" }}>
                Webb Era
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-6">
        {/* Key stats */}
        <section>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mb-2">Key Data</div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <StatRow label="Radius" value={formatRadius(planet.radius)} />
            <StatRow label="Mass" value={formatMass(planet.mass)} />
            <StatRow label="Orbital Period" value={formatPeriod(planet.period)} />
            <StatRow label="Equilibrium Temp" value={formatTemp(planet.temp)} />
            <StatRow label="Distance from Earth" value={formatDistanceLY(planet.distanceLY)} />
            <StatRow label="Discovery Year" value={planet.year?.toString() ?? "Unknown"} />
            <StatRow label="Discovery Method" value={planet.method} />
            <StatRow label="Host Star Type" value={planet.spectralType ?? "Unknown"} />
            <StatRow label="Planets in System" value={planet.numPlanets?.toString() ?? "Unknown"} />
          </div>
        </section>

        {/* Habitability */}
        <section>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mb-3">Habitability Assessment</div>
          <HabitabilityBar temp={planet.temp} />
          <div className="mt-3 p-3 rounded-xl text-sm text-white/65 leading-relaxed"
            style={{ background: planet.potentiallyHabitable ? "rgba(102,187,106,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${planet.potentiallyHabitable ? "rgba(102,187,106,0.15)" : "rgba(255,255,255,0.06)"}` }}>
            {assessment}
          </div>
          {planet.esi > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <div className="text-xs text-white/40">Earth Similarity Index</div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${planet.esi * 100}%`, background: planet.esi > 0.6 ? "#66bb6a" : "#4fc3f7" }} />
              </div>
              <div className="text-xs font-mono" style={{ color: planet.esi > 0.6 ? "#66bb6a" : "#4fc3f7" }}>
                {(planet.esi * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </section>

        {/* If you were there */}
        <section className="rounded-xl p-4" style={{ background: "rgba(79,195,247,0.04)", border: "1px solid rgba(79,195,247,0.12)" }}>
          <div className="text-[10px] tracking-widest text-[#4fc3f7]/60 uppercase mb-2">
            If You Were There — Speculative but Science-Based
          </div>
          <div className="text-sm text-white/65 leading-relaxed space-y-2">
            {planet.period != null && (
              <p>A year on this world lasts {formatPeriod(planet.period)}
                {planet.period < 5 ? " — you'd age a year every few days." : planet.period < 365 ? "." : " — longer than an Earth year."}
              </p>
            )}
            {planet.mass != null && planet.radius != null && (
              <p>Surface gravity is roughly {((planet.mass / Math.pow(planet.radius, 2))).toFixed(1)}× Earth's
                {planet.mass / Math.pow(planet.radius, 2) > 2 ? " — you'd feel twice as heavy as on Earth." : planet.mass / Math.pow(planet.radius, 2) < 0.5 ? " — you'd feel almost weightless." : "."}
              </p>
            )}
            {planet.spectralType && (
              <p>
                {planet.spectralType[0] === "M"
                  ? "The host star is a red dwarf — dimmer than our Sun. The sky might glow a perpetual twilight red."
                  : planet.spectralType[0] === "K"
                    ? "Orbiting an orange dwarf star, the sky might have a warm amber hue at midday."
                    : planet.spectralType[0] === "F"
                      ? "The host star burns hotter and bluer than our Sun. Shadows here would be crisper, UV radiation stronger."
                      : "The host star is similar to our Sun. Days and nights might feel familiar in rhythm, if not in length."}
              </p>
            )}
            {planet.period != null && planet.period < 10 && (
              <p>Tidal locking is likely — one face permanently toward the star in eternal day, the other in endless night.</p>
            )}
          </div>
        </section>

        {/* Host star comparison */}
        <section>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mb-3">Host Star vs Our Sun</div>
          <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-1" style={{ background: "radial-gradient(circle at 35% 35%, #fffde7, #ffb300)", boxShadow: "0 0 10px rgba(255,180,0,0.4)" }} />
              <div className="text-[9px] text-white/40">Our Sun</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[10px] text-white/30">vs</div>
              <div className="text-xs text-white/50 mt-1">Type {planet.spectralType?.[0] ?? "?"} star</div>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 rounded-full"
                style={{ width: 28, height: 28, background: `radial-gradient(circle at 35% 35%, white, ${getStarColor(planet.spectralType)})`, boxShadow: `0 0 10px ${getStarColor(planet.spectralType)}66` }} />
              <div className="text-[9px] text-white/40 truncate max-w-[80px]">{planet.starName}</div>
            </div>
          </div>
          {systemPlanets.length > 1 && (
            <div className="mt-3">
              <div className="text-[10px] text-white/30 mb-2">{systemPlanets.length} known planets in this system</div>
              <OrbitalDiagram systemPlanets={systemPlanets} current={planet} />
            </div>
          )}
        </section>

        {/* Sibling planets */}
        {siblings.length > 0 && (
          <section>
            <div className="text-[10px] tracking-widest text-white/30 uppercase mb-2">Other Planets in This System</div>
            <div className="flex flex-wrap gap-2">
              {siblings.slice(0, 6).map(s => (
                <button key={s.id} onClick={() => onNavigate(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-[#4fc3f7]/50 hover:text-[#4fc3f7] transition-colors">
                  {s.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Travel time */}
        {travel && (
          <section>
            <div className="text-[10px] tracking-widest text-white/30 uppercase mb-2">Travel Time to {planet.name}</div>
            <div className="rounded-xl overflow-hidden divide-y divide-white/5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { label: "Walking (5 km/h)", val: travel.walking },
                { label: "Speed of Sound", val: travel.sound },
                { label: "Voyager 1 (61,000 km/h)", val: travel.voyager },
                { label: "10% Speed of Light", val: travel.tenPct },
                { label: "Speed of Light", val: travel.light },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-white/40">{label}</span>
                  <span className="text-xs font-mono text-white/75">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/25 mt-2 text-center">These numbers are humbling.</p>
          </section>
        )}

        {/* External link */}
        <a href={nasa_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs transition-colors"
          style={{ border: "1px solid rgba(79,195,247,0.2)", color: "rgba(79,195,247,0.7)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#4fc3f7")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(79,195,247,0.7)")}>
          <ExternalLink className="w-3.5 h-3.5" />
          View on NASA Exoplanet Archive
        </a>
      </div>
    </motion.div>
  );
}
