import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { RotateCcw, MessageCircle, BookOpen, Share2, ExternalLink } from "lucide-react";

// ── Re-exported types (must match BuildYourOwnUniverse.tsx) ──────
export interface Params {
  G: number; darkMatter: number; darkEnergy: number; hubble: number;
  matterRatio: number; baryonDensity: number; fluctuation: number;
  dimensions: 2 | 3 | 4;
}

export type OutcomeId = "our_universe" | "dead_universe" | "big_rip" | "empty_universe" | "annihilation" | "black_hole" | "stellar_nursery";

// ── Life zones (range where complex life is possible) ────────────
const LIFE_ZONES: Record<keyof Omit<Params, "dimensions">, [number, number]> = {
  G:             [0.5,  2.0],
  darkMatter:    [0.3,  3.0],
  darkEnergy:    [0.1,  3.0],
  hubble:        [0.5,  2.0],
  matterRatio:   [0.6,  1.0],
  baryonDensity: [0.3,  5.0],
  fluctuation:   [0.3,  5.0],
};

const PARAM_LABELS: Record<keyof Omit<Params, "dimensions">, string> = {
  G: "Gravitational Constant", darkMatter: "Dark Matter Density",
  darkEnergy: "Dark Energy", hubble: "Initial Expansion Rate",
  matterRatio: "Matter/Antimatter Ratio", baryonDensity: "Baryon Density",
  fluctuation: "Quantum Fluctuations",
};

const PARAM_CONFIGS_MIN: Record<keyof Omit<Params, "dimensions">, number> = {
  G: 0.1, darkMatter: 0, darkEnergy: 0, hubble: 0.1, matterRatio: 0, baryonDensity: 0.1, fluctuation: 0.1,
};
const PARAM_CONFIGS_MAX: Record<keyof Omit<Params, "dimensions">, number> = {
  G: 10, darkMatter: 5, darkEnergy: 10, hubble: 5, matterRatio: 1, baryonDensity: 10, fluctuation: 10,
};

// ── Timeline events ───────────────────────────────────────────────
interface TimelineEvent { time: string; label: string; good: boolean; icon: string; }

function getTimeline(p: Params, outcome: OutcomeId): TimelineEvent[] {
  if (outcome === "annihilation") return [
    { time: "< 0.001 seconds", label: "Matter and antimatter collided", good: false, icon: "⚡" },
    { time: "< 1 second",       label: "Complete mutual annihilation — nothing survived", good: false, icon: "💥" },
    { time: "—",                label: "Your universe was forever silent", good: false, icon: "∅" },
  ];

  const events: TimelineEvent[] = [
    { time: "380,000 years", label: "Plasma cooled enough for atoms to form", good: true, icon: "⚛" },
  ];

  if (outcome === "empty_universe") return [...events,
    { time: "500 million years", label: "Matter too diffuse — no clouds condensed", good: false, icon: "☁" },
    { time: "—",                 label: "No stars ever formed. The universe remained dark and cold.", good: false, icon: "∅" },
  ];

  events.push({ time: "200 million years", label: "First stars ignited in dense regions", good: true, icon: "★" });

  if (outcome === "dead_universe") {
    const collapseTime = (4 / p.G).toFixed(1);
    return [...events,
      { time: "800 million years", label: "Galaxies began assembling — then stalled", good: false, icon: "⊛" },
      { time: `${collapseTime} billion years`, label: "Dark energy too weak — gravitational collapse began", good: false, icon: "⚠" },
      { time: `${(parseFloat(collapseTime) + 0.8).toFixed(1)} billion years`, label: "Universe collapsed back into a singularity", good: false, icon: "◉" },
    ];
  }

  if (outcome === "big_rip") {
    const ripTime = (2 / (p.darkEnergy - 7) + 11).toFixed(1);
    return [...events,
      { time: "1 billion years",  label: "Galaxies formed briefly before expansion accelerated", good: false, icon: "⊛" },
      { time: `${ripTime} billion years`, label: "Dark energy tore galaxies apart", good: false, icon: "⚠" },
      { time: `${(parseFloat(ripTime) + 1).toFixed(1)} billion years`, label: "Stars shredded. Then planets. Then atoms themselves.", good: false, icon: "💥" },
    ];
  }

  if (outcome === "black_hole") return [...events,
    { time: "500 million years", label: `Gravity ${p.G.toFixed(1)}× too strong — every star collapsed immediately`, good: false, icon: "◉" },
    { time: "1 billion years",   label: "Sky filled with black holes. No light escaped.", good: false, icon: "◉" },
    { time: "13.8 billion years",label: "Universe exists as a graveyard of black holes and silence", good: false, icon: "∅" },
  ];

  if (outcome === "stellar_nursery") return [...events,
    { time: "500 million years", label: "Dense star clusters formed everywhere with no gaps", good: true, icon: "✦" },
    { time: "2 billion years",   label: "No large galaxies — only endless stellar nurseries", good: true, icon: "⊛" },
    { time: "13.8 billion years",label: "Universe is bright with star formation — but no planetary systems", good: false, icon: "★" },
  ];

  // Our universe / near miss
  const hasGalaxies = p.darkMatter > 0.3 && p.G > 0.3;
  const hasSolarSystems = p.G > 0.6 && p.G < 6 && p.dimensions === 3;
  const hasLife = hasSolarSystems && p.baryonDensity > 0.4 && p.matterRatio > 0.5;

  if (hasGalaxies) events.push({ time: "1 billion years", label: "Galaxies assembled along dark matter filaments", good: true, icon: "⊛" });
  if (hasSolarSystems) {
    events.push({ time: "4.6 billion years", label: "Rocky planets formed in stellar nurseries", good: true, icon: "⊙" });
    if (hasLife) {
      events.push({ time: "9.1 billion years", label: "Complex chemistry — precursors to life", good: true, icon: "🧬" });
      events.push({ time: "13.8 billion years", label: "Intelligent observers exist to wonder about their universe", good: true, icon: "👁" });
    } else {
      events.push({ time: "13.8 billion years", label: "Planets exist — but conditions for life are marginal", good: false, icon: "⊙" });
    }
  } else {
    events.push({ time: "13.8 billion years", label: "Stars exist but planetary systems couldn't form", good: false, icon: "★" });
  }
  return events;
}

// ── Stats ─────────────────────────────────────────────────────────
interface UniverseStat { label: string; value: string; note?: string; }

function getStats(p: Params, outcome: OutcomeId): UniverseStat[] {
  const formatBig = (n: number) => n > 1e12 ? `${(n / 1e12).toFixed(0)} trillion` : n > 1e9 ? `${(n / 1e9).toFixed(0)} billion` : n > 1e6 ? `${(n / 1e6).toFixed(0)} million` : n.toFixed(0);

  if (outcome === "annihilation") return [
    { label: "Universe lifetime", value: "< 1 second" },
    { label: "Stars formed", value: "0" },
    { label: "Matter remaining", value: "None" },
    { label: "Habitable planets", value: "0" },
  ];

  const ageBillions = outcome === "dead_universe" ? parseFloat((4 / p.G).toFixed(1))
    : outcome === "big_rip" ? parseFloat(((2 / (Math.max(p.darkEnergy - 7, 0.1))) + 11).toFixed(1))
    : 13.8;

  const starMultiplier = outcome === "empty_universe" ? 0 : outcome === "dead_universe" ? 0.01 : 1;
  const stars = Math.max(0, Math.round(1e24 * p.G * p.baryonDensity * p.fluctuation * starMultiplier * (1 / Math.max(p.hubble, 0.3))));
  const galaxies = outcome === "our_universe" || outcome === "stellar_nursery"
    ? Math.round(2e12 * Math.sqrt(p.darkMatter) * p.G * 0.5) : 0;
  const bhPct = outcome === "black_hole" ? 99 : outcome === "dead_universe" ? 40 : Math.min(95, p.G * 5);
  const habitablePlanets = outcome === "our_universe" && p.dimensions === 3 ? Math.round(1e22 * p.baryonDensity * (1 / p.G) * p.fluctuation * 0.3) : 0;

  return [
    { label: "Universe age", value: `${ageBillions.toFixed(1)} billion years` },
    { label: "Stars formed", value: formatBig(stars), note: "estimated" },
    { label: "Galaxies", value: galaxies > 0 ? formatBig(galaxies) : "None" },
    { label: "Mass in black holes", value: `${bhPct.toFixed(0)}%` },
    { label: "Habitable planets", value: habitablePlanets > 0 ? `~${formatBig(habitablePlanets)}` : "None detected" },
    { label: "Dimensions", value: `${p.dimensions}D spacetime` },
  ];
}

// ── Decisive parameter ─────────────────────────────────────────────
function getDecisiveParam(p: Params): { key: keyof Omit<Params, "dimensions">; deviation: number } {
  let maxDev = 0;
  let maxKey: keyof Omit<Params, "dimensions"> = "G";
  const keys = Object.keys(LIFE_ZONES) as (keyof Omit<Params, "dimensions">)[];
  for (const k of keys) {
    const range = PARAM_CONFIGS_MAX[k] - PARAM_CONFIGS_MIN[k];
    const dev = Math.abs((p[k] as number) - 1) / range;
    if (dev > maxDev) { maxDev = dev; maxKey = k; }
  }
  return { key: maxKey, deviation: maxDev };
}

// ── Outcome icons (CSS animated) ───────────────────────────────────
function OutcomeIcon({ outcome }: { outcome: OutcomeId }) {
  const base = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden";
  if (outcome === "our_universe") return (
    <div className={base} style={{ background: "radial-gradient(circle, rgba(79,195,247,0.3) 0%, rgba(79,195,247,0.05) 70%)", border: "2px solid rgba(79,195,247,0.4)" }}>
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#4fc3f7]/60 animate-spin" style={{ animationDuration: "8s" }} />
      <div className="absolute w-6 h-6 rounded-full" style={{ background: "radial-gradient(circle, #ffd54f 30%, transparent 70%)" }} />
    </div>
  );
  if (outcome === "dead_universe") return (
    <div className={base} style={{ background: "radial-gradient(circle, rgba(229,57,53,0.3) 0%, rgba(229,57,53,0.05) 70%)", border: "2px solid rgba(229,57,53,0.4)" }}>
      <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, #e53935 0%, #880e0e 100%)", animationDuration: "1.5s" }} />
    </div>
  );
  if (outcome === "big_rip") return (
    <div className={base} style={{ background: "radial-gradient(circle, rgba(156,39,176,0.3) 0%, transparent 70%)", border: "2px solid rgba(156,39,176,0.4)" }}>
      {[0,60,120,180,240,300].map((deg, i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "#ce93d8", top: "50%", left: "50%", transform: `rotate(${deg}deg) translateX(28px)`, animationDelay: `${i * 0.15}s`, animationDuration: "2s" }} />
      ))}
      <div className="w-3 h-3 rounded-full" style={{ background: "#9c27b0" }} />
    </div>
  );
  if (outcome === "empty_universe") return (
    <div className={base} style={{ background: "rgba(0,0,0,0.6)", border: "2px solid rgba(120,144,156,0.3)" }}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#78909c", animationDuration: "3s" }} />
    </div>
  );
  if (outcome === "annihilation") return (
    <div className={base} style={{ border: "2px solid rgba(255,213,79,0.4)", background: "radial-gradient(circle, rgba(255,213,79,0.1) 0%, transparent 70%)" }}>
      <div className="w-12 h-12 rounded-full animate-ping" style={{ background: "radial-gradient(circle, rgba(255,213,79,0.8) 0%, transparent 70%)", animationDuration: "2s" }} />
    </div>
  );
  if (outcome === "black_hole") return (
    <div className={base} style={{ background: "#000", border: "2px solid rgba(136,14,79,0.4)" }}>
      <div className="absolute w-16 h-16 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(255,100,50,0.6) transparent transparent transparent", animationDuration: "3s" }} />
      <div className="w-6 h-6 rounded-full" style={{ background: "#000", border: "2px solid rgba(255,255,255,0.1)" }} />
    </div>
  );
  // stellar_nursery
  return (
    <div className={base} style={{ background: "radial-gradient(circle, rgba(255,159,67,0.2) 0%, transparent 70%)", border: "2px solid rgba(255,159,67,0.4)" }}>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse" style={{ background: "#ffd54f", top: `${50 + 35 * Math.sin(deg * Math.PI / 180)}%`, left: `${50 + 35 * Math.cos(deg * Math.PI / 180)}%`, animationDelay: `${i * 0.2}s` }} />
      ))}
      <div className="w-3 h-3 rounded-full" style={{ background: "#ff9f43" }} />
    </div>
  );
}

// ── Verdict sentence ───────────────────────────────────────────────
function getVerdict(p: Params, outcome: OutcomeId): string {
  switch (outcome) {
    case "our_universe":    return "Your universe could support stars, planets, and perhaps life.";
    case "dead_universe":   return `Your universe collapsed under its own gravity ${(4 / p.G).toFixed(1)} billion years after the Big Bang.`;
    case "big_rip":         return `Dark energy tore your universe apart approximately ${((2 / Math.max(p.darkEnergy - 7, 0.1)) + 11).toFixed(1)} billion years in.`;
    case "empty_universe":  return "Matter scattered too thinly — no stars, no galaxies, no light.";
    case "annihilation":    return "Your universe destroyed itself in less than a second. Nothing remained.";
    case "black_hole":      return `Gravity ${p.G.toFixed(1)}× too strong — every star collapsed before it could shine.`;
    case "stellar_nursery": return "Dense star clusters formed everywhere — a bright but planet-free universe.";
  }
}

// ── Fine-tuning meter ──────────────────────────────────────────────
function FineTuningMeter({ params }: { params: Params }) {
  const keys = Object.keys(LIFE_ZONES) as (keyof Omit<Params, "dimensions">)[];
  let inZone = 0;
  if (params.dimensions === 3) inZone++;
  const total = keys.length + 1;

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 className="text-xs font-bold tracking-widest text-white mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>
        LIFE POSSIBILITY METER
      </h3>
      <div className="space-y-3">
        {keys.map(k => {
          const val = params[k] as number;
          const [lo, hi] = LIFE_ZONES[k];
          const min = PARAM_CONFIGS_MIN[k], max = PARAM_CONFIGS_MAX[k];
          const pct = ((val - min) / (max - min)) * 100;
          const ourPct = ((1 - min) / (max - min)) * 100;
          const loPct = ((lo - min) / (max - min)) * 100;
          const hiPct = ((hi - min) / (max - min)) * 100;
          const status = val >= lo && val <= hi ? "in" : Math.abs(val - (lo + hi) / 2) < (hi - lo) ? "near" : "out";
          if (status === "in") inZone++;
          const dotColor = status === "in" ? "#4caf50" : status === "near" ? "#ffd54f" : "#e53935";

          return (
            <div key={k}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{PARAM_LABELS[k]}</span>
                <span className="text-[10px] font-bold" style={{ color: dotColor }}>{status === "in" ? "✓ In zone" : status === "near" ? "≈ Near zone" : "✗ Outside"}</span>
              </div>
              <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {/* Life zone highlight */}
                <div className="absolute top-0 h-full rounded-full" style={{ left: `${loPct}%`, width: `${hiPct - loPct}%`, background: "rgba(76,175,80,0.25)" }} />
                {/* Our universe marker */}
                <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-full" style={{ left: `${ourPct}%`, background: "rgba(255,255,255,0.4)" }} />
                {/* User value dot */}
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all" style={{ left: `calc(${pct}% - 6px)`, background: dotColor }} />
              </div>
            </div>
          );
        })}
        {/* Dimensions */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>Spatial Dimensions</span>
            <span className="text-[10px] font-bold" style={{ color: params.dimensions === 3 ? "#4caf50" : "#e53935" }}>
              {params.dimensions === 3 ? "✓ In zone" : "✗ Outside"}
            </span>
          </div>
          <div className="flex gap-2">
            {[2, 3, 4].map(d => (
              <div key={d} className="flex-1 h-2 rounded-full flex items-center justify-center text-[8px]"
                style={{ background: d === params.dimensions ? (d === 3 ? "rgba(76,175,80,0.5)" : "rgba(229,57,53,0.5)") : "rgba(255,255,255,0.06)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          {inZone} of {total} parameters within the life-permitting zone.{" "}
          {inZone === total
            ? <span style={{ color: "#4caf50" }}>Against all probability, your universe could support life.</span>
            : inZone >= total - 2
            ? <span style={{ color: "#ffd54f" }}>So close — just {total - inZone} parameter{total - inZone > 1 ? "s" : ""} outside the zone.</span>
            : <span style={{ color: "#e53935" }}>Life as we know it would be impossible here.</span>}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
interface Props {
  params: Params;
  outcome: OutcomeId;
  onRebuild: () => void;
}

export default function BuildUniverseResults({ params, outcome, onRebuild }: Props) {
  const [tab, setTab] = useState<"timeline" | "stats" | "tuning" | "compare">("timeline");
  const [copied, setCopied] = useState(false);

  const timeline = getTimeline(params, outcome);
  const stats = getStats(params, outcome);
  const decisive = getDecisiveParam(params);

  const paramKeys = Object.keys(LIFE_ZONES) as (keyof Omit<Params, "dimensions">)[];
  const OUTCOMES_META: Record<OutcomeId, { label: string; color: string; bg: string }> = {
    our_universe:   { label: "Our Universe",                   color: "#4fc3f7", bg: "rgba(79,195,247,0.08)"  },
    dead_universe:  { label: "Dead Universe — Big Crunch",     color: "#e53935", bg: "rgba(229,57,53,0.08)"   },
    big_rip:        { label: "The Big Rip",                    color: "#ce93d8", bg: "rgba(156,39,176,0.08)"  },
    empty_universe: { label: "Empty Universe",                 color: "#78909c", bg: "rgba(120,144,156,0.08)" },
    annihilation:   { label: "Matter-Antimatter Annihilation", color: "#ffd54f", bg: "rgba(255,213,79,0.08)"  },
    black_hole:     { label: "Black Hole Universe",            color: "#880e4f", bg: "rgba(136,14,79,0.08)"   },
    stellar_nursery:{ label: "Stellar Nursery",                color: "#ff9f43", bg: "rgba(255,159,67,0.08)"  },
  };
  const meta = OUTCOMES_META[outcome];

  function encodeParams(p: Params) {
    const vals = [p.G, p.darkMatter, p.darkEnergy, p.hubble, p.matterRatio, p.baryonDensity, p.fluctuation, p.dimensions];
    return btoa(vals.map(v => Number(v).toFixed(3)).join(","));
  }

  const share = () => {
    const encoded = encodeParams(params);
    const url = `${window.location.origin}/build-universe?u=${encoded}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const askUrl = `/ask?q=${encodeURIComponent(`Tell me about a "${meta.label}" universe — what would it look like and why?`)}`;
  const decisiveVal = params[decisive.key] as number;
  const decisiveMult = decisiveVal.toFixed(2);
  const decisiveDir = decisiveVal > 1 ? "higher" : "lower";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute inset-0 z-40 overflow-y-auto"
      style={{ background: "rgba(0,0,8,0.97)", backdropFilter: "blur(20px)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">

        {/* Hero */}
        <div className="text-center mb-8">
          <OutcomeIcon outcome={outcome} />
          <div className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Orbitron, sans-serif", color: meta.color }}>
            {meta.label}
          </div>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            {getVerdict(params, outcome)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["timeline", "stats", "tuning", "compare"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 text-[10px] py-1.5 rounded-lg transition-all font-bold tracking-wide capitalize"
              style={{
                fontFamily: "Orbitron, sans-serif",
                background: tab === t ? meta.bg : "transparent",
                color: tab === t ? meta.color : "rgba(255,255,255,0.35)",
                border: tab === t ? `1px solid ${meta.color}44` : "1px solid transparent",
              }}>
              {t === "tuning" ? "Fine-Tuning" : t}
            </button>
          ))}
        </div>

        {/* Tab: Timeline */}
        {tab === "timeline" && (
          <div className="relative pl-6 space-y-2">
            <div className="absolute left-2.5 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            {timeline.map((ev, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="relative rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ev.good ? "rgba(76,175,80,0.2)" : "rgba(229,57,53,0.2)"}` }}>
                <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: ev.good ? "rgba(76,175,80,0.3)" : "rgba(229,57,53,0.3)", border: `1px solid ${ev.good ? "#4caf50" : "#e53935"}` }}>
                  {ev.good ? "✓" : "✗"}
                </div>
                <div className="text-[10px] mb-0.5" style={{ color: ev.good ? "#4caf50" : "#e53935", fontFamily: "Orbitron, sans-serif" }}>
                  t = {ev.time}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{ev.icon} {ev.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab: Stats */}
        {tab === "stats" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                  className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                  <div className="text-sm font-bold" style={{ color: meta.color }}>{s.value}</div>
                  {s.note && <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{s.note}</div>}
                </motion.div>
              ))}
            </div>

            {/* Decisive parameter */}
            <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(255,213,79,0.05)", border: "1px solid rgba(255,213,79,0.25)" }}>
              <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#ffd54f", fontFamily: "Orbitron, sans-serif" }}>
                THE DECISIVE FACTOR
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                The most impactful change in your universe was{" "}
                <strong style={{ color: "#ffd54f" }}>{PARAM_LABELS[decisive.key]}</strong>.
                You set it to <strong style={{ color: "#ffd54f" }}>{decisiveMult}×</strong> — {Math.abs(decisiveVal - 1).toFixed(2)}× {decisiveDir} than our universe.
                This single change was the primary driver of your {meta.label}.
              </p>
              {decisiveVal > 1.2 && (
                <p className="text-[10px] mt-2 italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Try reducing it toward 1.0 to see if the outcome changes.
                </p>
              )}
              {decisiveVal < 0.8 && (
                <p className="text-[10px] mt-2 italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Try increasing it toward 1.0 to see if the outcome changes.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Fine-Tuning */}
        {tab === "tuning" && <FineTuningMeter params={params} />}

        {/* Tab: Compare */}
        {tab === "compare" && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="grid grid-cols-3 text-[10px] font-bold tracking-widest px-4 py-2.5" style={{ fontFamily: "Orbitron, sans-serif", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
              <span>PARAMETER</span><span className="text-center" style={{ color: meta.color }}>YOURS</span><span className="text-right">OURS</span>
            </div>
            {paramKeys.map((k, i) => {
              const val = params[k] as number;
              const diff = val - 1;
              const pctDiff = Math.round(diff * 100);
              const color = Math.abs(diff) < 0.2 ? "#4caf50" : Math.abs(diff) < 1 ? "#ffd54f" : "#e53935";
              return (
                <div key={k} className="grid grid-cols-3 px-4 py-3 text-xs items-center" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{PARAM_LABELS[k]}</span>
                  <div className="text-center">
                    <span className="font-bold" style={{ color }}>{val.toFixed(2)}×</span>
                    {pctDiff !== 0 && <span className="text-[10px] ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>({pctDiff > 0 ? "+" : ""}{pctDiff}%)</span>}
                  </div>
                  <span className="text-right font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>1.00×</span>
                </div>
              );
            })}
            <div className="grid grid-cols-3 px-4 py-3 text-xs items-center" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Dimensions</span>
              <div className="text-center font-bold" style={{ color: params.dimensions === 3 ? "#4caf50" : "#e53935" }}>{params.dimensions}D</div>
              <span className="text-right font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>3D</span>
            </div>
          </div>
        )}

        {/* What next */}
        <div className="mt-6 space-y-2">
          <div className="text-[10px] font-bold tracking-widest mb-3" style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(255,255,255,0.3)" }}>
            WHAT NEXT
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Link href={askUrl}>
              <div className="flex items-center gap-3 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,213,79,0.15)" }}>
                  <MessageCircle className="w-4 h-4" style={{ color: "#ffd54f" }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ask about this universe</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Open Ask the Universe with a pre-filled question about your outcome</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
              </div>
            </Link>
            <Link href="/education">
              <div className="flex items-center gap-3 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(79,195,247,0.1)" }}>
                  <BookOpen className="w-4 h-4" style={{ color: "#4fc3f7" }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Learn the science</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Explore the cosmological principles behind this simulation</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
              </div>
            </Link>
          </div>
        </div>

        {/* Share */}
        <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Share Your Universe</div>
              <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Anyone with the link loads your exact parameters</div>
            </div>
            <button onClick={share}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:opacity-80"
              style={{ background: meta.bg, border: `1px solid ${meta.color}55`, color: meta.color }}>
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Rebuild button */}
        <button onClick={onRebuild}
          className="w-full mt-5 py-4 rounded-2xl font-bold text-sm tracking-widest flex items-center justify-center gap-3 transition-all hover:opacity-80 active:scale-95"
          style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(135deg, rgba(255,213,79,0.15), rgba(79,195,247,0.1))", border: "1px solid rgba(255,213,79,0.4)", color: "#ffd54f" }}>
          <RotateCcw className="w-4 h-4" />
          BUILD ANOTHER UNIVERSE
        </button>
      </div>
    </motion.div>
  );
}
