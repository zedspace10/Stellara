import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, SlidersHorizontal, Search, Shuffle, Map, Grid3X3, ArrowLeftRight, X } from "lucide-react";

import type { ExoplanetData, ViewMode, Filters } from "./exoplanets/types";
import { DEFAULT_FILTERS } from "./exoplanets/types";
import { getPlanetTypeLabel } from "./exoplanets/utils";
import { useExoplanets, useFilteredPlanets } from "./exoplanets/useExoplanets";
import SkyMap from "./exoplanets/SkyMap";
import PlanetGallery from "./exoplanets/PlanetGallery";
import ComparisonView from "./exoplanets/ComparisonView";
import PlanetDetail from "./exoplanets/PlanetDetail";
import FilterPanel from "./exoplanets/FilterPanel";

// ── Intro animation ──────────────────────────────────────────────────────────

const INTRO_LINES = [
  "5,500 confirmed worlds.",
  "And counting.",
  "None of them are Earth.",
];

function IntroScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [1200, 2400, 3800, 5400].map((ms, i) =>
      setTimeout(() => { if (i === 3) onDone(); else setPhase(i + 1); }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // Random star positions (stable)
  const stars = useMemo(() => Array.from({ length: 300 }, (_, i) => ({
    x: (Math.sin(i * 2.3) * 0.5 + 0.5) * 100,
    y: (Math.cos(i * 1.7) * 0.5 + 0.5) * 100,
    r: 0.5 + (i % 3) * 0.6,
    delay: i * 0.012,
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: "#020209" }}
      onClick={onDone}
    >
      {/* Stars appearing */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.4 + (i % 5) * 0.1, scale: 1 }}
            transition={{ delay: s.delay, duration: 0.4 }}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2 }}
          />
        ))}
      </div>

      {/* Text lines */}
      <div className="relative z-10 text-center">
        <div className="text-[10px] tracking-[0.4em] text-[#4fc3f7] mb-10 uppercase">STELLARA · Exoplanet Explorer</div>
        <div className="space-y-4 min-h-[120px] flex flex-col items-center justify-center">
          {INTRO_LINES.map((line, i) => (
            <AnimatePresence key={line}>
              {phase > i && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-4xl font-['Orbitron'] text-white"
                  style={{ color: i === 2 ? "rgba(255,255,255,0.6)" : "white" }}
                >
                  {line}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}
          className="mt-12 text-xs text-white/25 tracking-widest"
        >
          Tap to begin
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function LoadingState({ progress, statusMsg }: { progress: number; statusMsg: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40" style={{ background: "#020209" }}>
      {/* Scanning sweep line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(79,195,247,0.6), rgba(255,213,79,0.4), transparent)" }}
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-x-0"
          style={{ height: 80, background: "linear-gradient(to bottom, rgba(79,195,247,0.03), transparent)", pointerEvents: "none" }}
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-xs tracking-[0.35em] text-[#4fc3f7]/50 uppercase mb-6">NASA Exoplanet Archive</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={statusMsg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm font-['Orbitron'] text-white/70 mb-8 h-5"
          >
            {statusMsg}
          </motion.div>
        </AnimatePresence>

        <div className="w-64 h-px rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #4fc3f7, #ffd54f)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="text-[10px] text-white/20 mt-2 font-mono">{progress}%</div>
      </div>
    </div>
  );
}

// ── Active filter pills ───────────────────────────────────────────────────────

function ActiveFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const pills: { label: string; clear: () => void }[] = [];
  if (filters.type !== "all") pills.push({ label: getPlanetTypeLabel(filters.type), clear: () => onChange({ ...filters, type: "all" }) });
  if (filters.habitability !== "all") pills.push({ label: filters.habitability === "hz" ? "Habitable Zone" : filters.habitability === "potentially" ? "Potentially Habitable" : "Earth-like", clear: () => onChange({ ...filters, habitability: "all" }) });
  if (filters.method !== "all") pills.push({ label: filters.method, clear: () => onChange({ ...filters, method: "all" }) });
  if (filters.maxDistanceLY < 10000) pills.push({ label: `≤${filters.maxDistanceLY.toLocaleString()} ly`, clear: () => onChange({ ...filters, maxDistanceLY: 10000 }) });

  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {pills.map(p => (
        <span key={p.label} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border" style={{ color: "#ffd54f", borderColor: "rgba(255,213,79,0.3)", background: "rgba(255,213,79,0.06)" }}>
          {p.label}
          <button onClick={p.clear} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExoplanetExplorer() {
  const { planets, loading, error, progress, fromCache, fromFallback, cacheDate, statusMsg } = useExoplanets();
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<ViewMode>("gallery");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<ExoplanetData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useFilteredPlanets(planets, filters);
  const highlightIds = useMemo(() =>
    filters.search ? new Set(filtered.map(p => p.id)) : undefined,
  [filters.search, filtered]);

  const handleSelectPlanet = useCallback((p: ExoplanetData) => setSelected(p), []);
  const handleRandom = useCallback(() => {
    if (filtered.length === 0) return;
    setSelected(filtered[Math.floor(Math.random() * filtered.length)]);
  }, [filtered]);

  const methods = useMemo(() =>
    Array.from(new Set(planets.map(p => p.method).filter(Boolean))).sort(),
  [planets]);
  void methods; // used by FilterPanel internally

  // Show intro only once
  const introShownRef = useState(() => false)[0];
  void introShownRef;

  const isLoading = loading && planets.length === 0;

  return (
    <div className="relative w-full h-screen bg-[#020209] overflow-hidden flex flex-col" style={{ fontFamily: "Space Grotesk, sans-serif" }}>

      {/* Intro */}
      <AnimatePresence>
        {showIntro && !isLoading && (
          <IntroScreen onDone={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Loading — only blocks UI when we have no data at all */}
      {isLoading && <LoadingState progress={progress} statusMsg={statusMsg} />}

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-30" style={{ background: "rgba(2,2,9,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(79,195,247,0.1)" }}>
        <Link href="/">
          <button className="flex items-center gap-2 text-[#4fc3f7] hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> STELLARA
          </button>
        </Link>

        <div className="text-center">
          <div className="text-xs font-['Orbitron'] text-white/70 tracking-[0.15em]">EXOPLANET EXPLORER</div>
          {fromFallback ? (
            <button onClick={() => window.location.reload()} className="text-[9px] text-[#ffd54f]/60 hover:text-[#ffd54f] transition-colors">
              Featured worlds · Tap to retry live data
            </button>
          ) : fromCache && cacheDate ? (
            <div className="text-[9px] text-white/25">Cached · {cacheDate.toLocaleDateString()}</div>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleRandom} title="Random world"
            className="p-2 rounded-lg text-white/40 hover:text-[#ffd54f] transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={() => setShowFilters(s => !s)}
            className={`p-2 rounded-lg transition-colors ${showFilters ? "text-[#4fc3f7]" : "text-white/40 hover:text-white"}`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex-shrink-0 px-4 py-2 flex gap-2 z-20" style={{ background: "rgba(2,2,9,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search planet or star name…"
            className="w-full pl-8 pr-4 py-1.5 text-sm text-white/80 placeholder-white/25 rounded-lg outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
          />
          {filters.search && (
            <button onClick={() => setFilters(f => ({ ...f, search: "" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {[
            { v: "gallery" as ViewMode, icon: <Grid3X3 className="w-3.5 h-3.5" />, title: "Gallery" },
            { v: "skymap" as ViewMode, icon: <Map className="w-3.5 h-3.5" />, title: "Sky Map" },
            { v: "comparison" as ViewMode, icon: <ArrowLeftRight className="w-3.5 h-3.5" />, title: "Compare" },
          ].map(({ v, icon, title }) => (
            <button
              key={v}
              title={title}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 transition-colors ${view === v ? "text-[#4fc3f7]" : "text-white/35 hover:text-white/60"}`}
              style={view === v ? { background: "rgba(79,195,247,0.12)" } : {}}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter pills */}
      <ActiveFilters filters={filters} onChange={setFilters} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <PlanetGallery planets={filtered} onSelect={handleSelectPlanet} />
            </motion.div>
          )}
          {view === "skymap" && (
            <motion.div key="skymap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <SkyMap
                planets={filtered}
                highlightIds={highlightIds}
                onSelectStar={sys => { if (sys.planets[0]) setSelected(sys.planets[0]); }}
              />
            </motion.div>
          )}
          {view === "comparison" && (
            <motion.div key="comparison" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
              <ComparisonView planets={filtered} onSelect={handleSelectPlanet} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stat bar */}
      {!loading && planets.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between z-20 text-[10px] text-white/25"
          style={{ background: "rgba(2,2,9,0.7)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span>{filtered.length.toLocaleString()} worlds {filters.search || filters.type !== "all" ? "filtered" : "catalogued"}</span>
          <span>NASA Exoplanet Archive · {planets.length.toLocaleString()} confirmed</span>
        </div>
      )}

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
            totalCount={planets.length}
            filteredCount={filtered.length}
          />
        )}
      </AnimatePresence>

      {/* Planet detail panel */}
      <AnimatePresence>
        {selected && (
          <PlanetDetail
            key={selected.id}
            planet={selected}
            allPlanets={planets}
            onClose={() => setSelected(null)}
            onNavigate={p => setSelected(p)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
