import { X } from "lucide-react";
import type { Filters, PlanetType, SortMode } from "./types";
import { DEFAULT_FILTERS } from "./types";
import { getPlanetTypeLabel } from "./utils";
import { motion } from "framer-motion";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  totalCount: number;
  filteredCount: number;
}

const PLANET_TYPES: (PlanetType | "all")[] = [
  "all", "earth-sized", "super-earth", "mini-neptune", "neptune-like", "gas-giant", "hot-jupiter",
];

const METHODS = ["all", "Transit", "Radial Velocity", "Direct Imaging", "Gravitational Microlensing", "Astrometry", "Eclipse Timing Variations", "Pulsar Timing"];

const SORTS: { value: SortMode; label: string }[] = [
  { value: "earth-like", label: "Most Earth-like" },
  { value: "closest", label: "Closest to Earth" },
  { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" },
  { value: "hottest", label: "Hottest" },
  { value: "coolest", label: "Coolest" },
  { value: "recent", label: "Most Recently Discovered" },
  { value: "oldest", label: "Oldest Discovery" },
];

function set<K extends keyof Filters>(filters: Filters, key: K, value: Filters[K]): Filters {
  return { ...filters, [key]: value };
}

export default function FilterPanel({ filters, onChange, onClose, totalCount, filteredCount }: Props) {
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.habitability !== "all" ||
    filters.method !== "all" ||
    filters.maxDistanceLY < 10000 ||
    filters.yearMin > 1992 ||
    filters.yearMax < new Date().getFullYear() ||
    filters.search !== "";

  return (
    <motion.aside
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 bottom-0 z-40 w-80 overflow-y-auto flex flex-col"
      style={{ background: "rgba(6,6,22,0.97)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(79,195,247,0.15)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div>
          <div className="text-sm font-['Orbitron'] text-white">Filters</div>
          <div className="text-xs text-white/40 mt-0.5">{filteredCount.toLocaleString()} / {totalCount.toLocaleString()} worlds</div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 px-5 py-4 space-y-6">
        {/* Sort */}
        <div>
          <div className="text-[10px] tracking-widest text-white/40 uppercase mb-2">Sort By</div>
          <select
            value={filters.sort}
            onChange={e => onChange(set(filters, "sort", e.target.value as SortMode))}
            className="w-full text-sm px-3 py-2 rounded-lg text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Planet type */}
        <div>
          <div className="text-[10px] tracking-widest text-white/40 uppercase mb-2">Planet Type</div>
          <div className="flex flex-wrap gap-2">
            {PLANET_TYPES.map(t => (
              <button
                key={t}
                onClick={() => onChange(set(filters, "type", t))}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filters.type === t ? "border-[#4fc3f7] text-[#4fc3f7]" : "border-white/15 text-white/50 hover:border-white/30"}`}
                style={filters.type === t ? { background: "rgba(79,195,247,0.12)" } : {}}
              >
                {t === "all" ? "All" : getPlanetTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Habitability */}
        <div>
          <div className="text-[10px] tracking-widest text-white/40 uppercase mb-2">Habitability</div>
          <div className="flex flex-col gap-2">
            {[
              { v: "all", l: "All planets" },
              { v: "hz", l: "Habitable zone only" },
              { v: "potentially", l: "Potentially habitable (rocky + HZ)" },
              { v: "earth-like", l: "Earth-like candidates (ESI ≥ 0.6)" },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => onChange(set(filters, "habitability", v as Filters["habitability"]))}
                className={`text-xs text-left px-3 py-2 rounded-lg border transition-all ${filters.habitability === v ? "border-[#66bb6a] text-[#66bb6a]" : "border-white/10 text-white/50 hover:border-white/25"}`}
                style={filters.habitability === v ? { background: "rgba(102,187,106,0.08)" } : {}}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Discovery method */}
        <div>
          <div className="text-[10px] tracking-widest text-white/40 uppercase mb-2">Discovery Method</div>
          <select
            value={filters.method}
            onChange={e => onChange(set(filters, "method", e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-lg text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {METHODS.map(m => <option key={m} value={m}>{m === "all" ? "All methods" : m}</option>)}
          </select>
        </div>

        {/* Distance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] tracking-widest text-white/40 uppercase">Max Distance</div>
            <div className="text-xs text-[#ffd54f]">
              {filters.maxDistanceLY >= 10000 ? "Any" : `${filters.maxDistanceLY.toLocaleString()} ly`}
            </div>
          </div>
          <input
            type="range" min={10} max={10000} step={10}
            value={filters.maxDistanceLY}
            onChange={e => onChange(set(filters, "maxDistanceLY", Number(e.target.value)))}
            className="w-full accent-[#4fc3f7]"
          />
          <div className="flex justify-between text-[9px] text-white/25 mt-1">
            <span>10 ly</span><span>100 ly (near)</span><span>10,000 ly</span>
          </div>
        </div>

        {/* Year range */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-[10px] tracking-widest text-white/40 uppercase">Discovery Year</div>
            <div className="text-xs text-[#ffd54f]">{filters.yearMin} – {filters.yearMax}</div>
          </div>
          <div className="space-y-2">
            <input type="range" min={1992} max={2024} value={filters.yearMin}
              onChange={e => onChange(set(filters, "yearMin", Math.min(Number(e.target.value), filters.yearMax - 1)))}
              className="w-full accent-[#4fc3f7]" />
            <input type="range" min={1992} max={2024} value={filters.yearMax}
              onChange={e => onChange(set(filters, "yearMax", Math.max(Number(e.target.value), filters.yearMin + 1)))}
              className="w-full accent-[#ffd54f]" />
          </div>
          <div className="flex justify-between text-[9px] text-white/25 mt-1">
            <span>1992</span><span>Kepler 2009</span><span>Webb 2022+</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS, search: filters.search })}
            className="w-full text-xs py-2 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </motion.aside>
  );
}
