import { useState, useEffect } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";

type Hemisphere = "N" | "S" | "Both";

interface ConstellationData {
  id: string;
  name: string;
  abbr: string;
  hemisphere: Hemisphere;
  months: string;
  mythology: string;
  brightestStar: string;
  area: number;
  stars: Array<{ x: number; y: number; r: number; name?: string }>;
  lines: Array<[number, number]>;
}

const CONSTELLATIONS: ConstellationData[] = [
  {
    id: "orion", name: "Orion", abbr: "Ori", hemisphere: "Both", months: "Dec – Feb",
    mythology: "The great hunter of Greek myth, placed in the sky by Zeus.",
    brightestStar: "Rigel (β Ori)", area: 594,
    stars: [
      { x: 50, y: 20, r: 3, name: "Betelgeuse" }, { x: 75, y: 25, r: 3.5, name: "Bellatrix" },
      { x: 35, y: 22, r: 2 }, { x: 50, y: 55, r: 2 }, { x: 65, y: 55, r: 2 }, { x: 80, y: 55, r: 2 },
      { x: 30, y: 75, r: 3, name: "Saiph" }, { x: 70, y: 78, r: 4, name: "Rigel" },
    ],
    lines: [[0, 1], [0, 3], [1, 5], [3, 4], [4, 5], [3, 6], [5, 7], [2, 0]],
  },
  {
    id: "ursa-major", name: "Ursa Major", abbr: "UMa", hemisphere: "N", months: "Mar – May",
    mythology: "Callisto, transformed into a bear by Zeus and placed among the stars.",
    brightestStar: "Alioth (ε UMa)", area: 1280,
    stars: [
      { x: 15, y: 60, r: 2.5 }, { x: 30, y: 55, r: 2.5 }, { x: 50, y: 50, r: 3, name: "Alioth" },
      { x: 65, y: 45, r: 2.5 }, { x: 75, y: 30, r: 2, name: "Mizar" }, { x: 85, y: 20, r: 2 },
      { x: 70, y: 75, r: 2.5 }, { x: 55, y: 80, r: 2.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 1]],
  },
  {
    id: "cassiopeia", name: "Cassiopeia", abbr: "Cas", hemisphere: "N", months: "Oct – Dec",
    mythology: "Vain queen of Ethiopia, punished to circle the pole forever.",
    brightestStar: "Schedar (α Cas)", area: 598,
    stars: [
      { x: 10, y: 70, r: 2.5 }, { x: 25, y: 30, r: 3, name: "Schedar" },
      { x: 50, y: 60, r: 2.5 }, { x: 70, y: 25, r: 3 }, { x: 90, y: 50, r: 2.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: "leo", name: "Leo", abbr: "Leo", hemisphere: "N", months: "Mar – May",
    mythology: "The Nemean Lion slain by Hercules as his first labour.",
    brightestStar: "Regulus (α Leo)", area: 947,
    stars: [
      { x: 25, y: 60, r: 3.5, name: "Regulus" }, { x: 35, y: 35, r: 2.5 },
      { x: 50, y: 20, r: 2.5, name: "Algieba" }, { x: 70, y: 25, r: 2 },
      { x: 80, y: 45, r: 2 }, { x: 75, y: 70, r: 2.5, name: "Denebola" },
      { x: 50, y: 65, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
  },
  {
    id: "scorpius", name: "Scorpius", abbr: "Sco", hemisphere: "S", months: "Jun – Aug",
    mythology: "The scorpion that killed Orion, placed opposite him in the sky.",
    brightestStar: "Antares (α Sco)", area: 497,
    stars: [
      { x: 40, y: 15, r: 2 }, { x: 50, y: 25, r: 2 }, { x: 55, y: 38, r: 4, name: "Antares" },
      { x: 50, y: 52, r: 2.5 }, { x: 45, y: 65, r: 2 }, { x: 55, y: 75, r: 2 },
      { x: 65, y: 82, r: 2 }, { x: 75, y: 78, r: 2 }, { x: 80, y: 68, r: 2.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
  },
  {
    id: "cygnus", name: "Cygnus", abbr: "Cyg", hemisphere: "N", months: "Aug – Oct",
    mythology: "The swan form Zeus took when wooing Leda; or Orpheus transformed after death.",
    brightestStar: "Deneb (α Cyg)", area: 804,
    stars: [
      { x: 50, y: 10, r: 4, name: "Deneb" }, { x: 50, y: 35, r: 3, name: "Sadr" },
      { x: 50, y: 60, r: 2.5 }, { x: 50, y: 85, r: 3, name: "Albireo" },
      { x: 15, y: 38, r: 2.5 }, { x: 85, y: 38, r: 2.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]],
  },
  {
    id: "gemini", name: "Gemini", abbr: "Gem", hemisphere: "N", months: "Jan – Mar",
    mythology: "Castor and Pollux, the divine twins of Zeus, patrons of sailors.",
    brightestStar: "Pollux (β Gem)", area: 514,
    stars: [
      { x: 30, y: 10, r: 3, name: "Castor" }, { x: 55, y: 10, r: 4, name: "Pollux" },
      { x: 25, y: 35, r: 2 }, { x: 50, y: 32, r: 2 }, { x: 22, y: 58, r: 2.5 },
      { x: 47, y: 56, r: 2.5 }, { x: 20, y: 80, r: 2 }, { x: 45, y: 80, r: 2 },
    ],
    lines: [[0, 2], [2, 4], [4, 6], [1, 3], [3, 5], [5, 7], [6, 7]],
  },
  {
    id: "taurus", name: "Taurus", abbr: "Tau", hemisphere: "N", months: "Dec – Feb",
    mythology: "Zeus in the form of a bull; also home to the Pleiades and Hyades clusters.",
    brightestStar: "Aldebaran (α Tau)", area: 797,
    stars: [
      { x: 65, y: 50, r: 4, name: "Aldebaran" }, { x: 50, y: 55, r: 2 },
      { x: 40, y: 45, r: 2 }, { x: 55, y: 35, r: 2 }, { x: 45, y: 25, r: 2.5, name: "Elnath" },
      { x: 80, y: 30, r: 2 }, { x: 90, y: 20, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [0, 5], [5, 6]],
  },
  {
    id: "lyra", name: "Lyra", abbr: "Lyr", hemisphere: "N", months: "Jul – Sep",
    mythology: "The lyre of Orpheus, who could charm even rocks and rivers with its music.",
    brightestStar: "Vega (α Lyr)", area: 286,
    stars: [
      { x: 50, y: 15, r: 5, name: "Vega" }, { x: 35, y: 45, r: 2 },
      { x: 50, y: 55, r: 2.5 }, { x: 65, y: 45, r: 2 }, { x: 40, y: 75, r: 2 }, { x: 60, y: 75, r: 2 },
    ],
    lines: [[0, 1], [0, 3], [1, 2], [2, 3], [1, 4], [4, 5], [5, 3]],
  },
  {
    id: "andromeda", name: "Andromeda", abbr: "And", hemisphere: "N", months: "Oct – Dec",
    mythology: "Ethiopian princess chained to a rock as sacrifice; rescued by Perseus.",
    brightestStar: "Alpheratz (α And)", area: 722,
    stars: [
      { x: 15, y: 50, r: 3.5, name: "Alpheratz" }, { x: 35, y: 40, r: 2.5 },
      { x: 55, y: 35, r: 3, name: "Mirach" }, { x: 75, y: 30, r: 2.5 }, { x: 90, y: 20, r: 2 },
      { x: 55, y: 20, r: 2 }, { x: 55, y: 50, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6]],
  },
  {
    id: "canis-major", name: "Canis Major", abbr: "CMa", hemisphere: "S", months: "Jan – Mar",
    mythology: "One of Orion's hunting dogs, following him across the winter sky.",
    brightestStar: "Sirius (α CMa)", area: 380,
    stars: [
      { x: 50, y: 20, r: 5, name: "Sirius" }, { x: 35, y: 40, r: 2.5 },
      { x: 65, y: 38, r: 2 }, { x: 45, y: 60, r: 2 },
      { x: 65, y: 65, r: 2.5 }, { x: 50, y: 80, r: 2 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [3, 4], [4, 5]],
  },
  {
    id: "virgo", name: "Virgo", abbr: "Vir", hemisphere: "Both", months: "Apr – Jun",
    mythology: "Demeter or Persephone — the goddess of the harvest, holding an ear of wheat.",
    brightestStar: "Spica (α Vir)", area: 1294,
    stars: [
      { x: 75, y: 75, r: 4, name: "Spica" }, { x: 60, y: 60, r: 2.5 },
      { x: 45, y: 50, r: 2.5, name: "Porrima" }, { x: 30, y: 35, r: 2 },
      { x: 50, y: 25, r: 2 }, { x: 65, y: 20, r: 2 }, { x: 75, y: 40, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]],
  },
  {
    id: "sagittarius", name: "Sagittarius", abbr: "Sgr", hemisphere: "S", months: "Jul – Sep",
    mythology: "The centaur Chiron, wisest of his kind, aiming his bow at Scorpius.",
    brightestStar: "Kaus Australis (ε Sgr)", area: 867,
    stars: [
      { x: 40, y: 30, r: 3 }, { x: 55, y: 20, r: 2.5 }, { x: 65, y: 35, r: 3 },
      { x: 55, y: 50, r: 2.5 }, { x: 40, y: 55, r: 2 }, { x: 50, y: 70, r: 4, name: "Kaus Australis" },
      { x: 65, y: 65, r: 2.5 }, { x: 75, y: 50, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2], [3, 6]],
  },
  {
    id: "hercules", name: "Hercules", abbr: "Her", hemisphere: "N", months: "Jun – Aug",
    mythology: "The greatest of Greek heroes, performing 12 impossible labours.",
    brightestStar: "Kornephoros (β Her)", area: 1225,
    stars: [
      { x: 45, y: 15, r: 2 }, { x: 50, y: 30, r: 2 }, { x: 35, y: 45, r: 3, name: "Kornephoros" },
      { x: 55, y: 45, r: 2.5 }, { x: 30, y: 60, r: 2 }, { x: 55, y: 62, r: 2 },
      { x: 25, y: 78, r: 2 }, { x: 65, y: 80, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 1], [2, 4], [3, 5], [4, 6], [5, 7]],
  },
  {
    id: "aquila", name: "Aquila", abbr: "Aql", hemisphere: "Both", months: "Aug – Oct",
    mythology: "The eagle of Zeus, who carried the thunderbolts of the king of gods.",
    brightestStar: "Altair (α Aql)", area: 652,
    stars: [
      { x: 50, y: 40, r: 4, name: "Altair" }, { x: 35, y: 35, r: 2.5 },
      { x: 65, y: 35, r: 2.5 }, { x: 50, y: 60, r: 2.5 }, { x: 50, y: 80, r: 2 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [3, 4]],
  },
  {
    id: "perseus", name: "Perseus", abbr: "Per", hemisphere: "N", months: "Nov – Jan",
    mythology: "Hero who slew Medusa and rescued Andromeda from the sea monster.",
    brightestStar: "Mirfak (α Per)", area: 615,
    stars: [
      { x: 50, y: 15, r: 3.5, name: "Mirfak" }, { x: 40, y: 30, r: 2.5 },
      { x: 60, y: 30, r: 3, name: "Algol" }, { x: 35, y: 50, r: 2 },
      { x: 60, y: 50, r: 2 }, { x: 45, y: 70, r: 2 }, { x: 65, y: 65, r: 2 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [3, 5], [2, 4], [4, 6]],
  },
  {
    id: "aquarius", name: "Aquarius", abbr: "Aqr", hemisphere: "Both", months: "Sep – Nov",
    mythology: "Ganymede, the cup-bearer of the gods, eternally pouring water from the heavens.",
    brightestStar: "Sadalsuud (β Aqr)", area: 980,
    stars: [
      { x: 35, y: 20, r: 3 }, { x: 50, y: 35, r: 3.5, name: "Sadalsuud" },
      { x: 60, y: 50, r: 2.5 }, { x: 45, y: 60, r: 2 },
      { x: 65, y: 68, r: 2 }, { x: 50, y: 78, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5]],
  },
  {
    id: "pisces", name: "Pisces", abbr: "Psc", hemisphere: "N", months: "Oct – Dec",
    mythology: "Aphrodite and Eros transformed into fish, tied together to escape Typhon.",
    brightestStar: "Eta Piscium (η Psc)", area: 889,
    stars: [
      { x: 20, y: 40, r: 2 }, { x: 35, y: 30, r: 2.5 }, { x: 50, y: 25, r: 2 },
      { x: 65, y: 30, r: 2 }, { x: 75, y: 45, r: 2 }, { x: 70, y: 60, r: 2 },
      { x: 55, y: 70, r: 3, name: "Alrescha" }, { x: 40, y: 60, r: 2 },
      { x: 25, y: 65, r: 2.5 }, { x: 15, y: 55, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0]],
  },
  {
    id: "cancer", name: "Cancer", abbr: "Cnc", hemisphere: "N", months: "Feb – Apr",
    mythology: "The crab sent by Hera to distract Hercules during his battle with the Hydra.",
    brightestStar: "Al Tarf (β Cnc)", area: 506,
    stars: [
      { x: 50, y: 15, r: 2 }, { x: 30, y: 40, r: 2.5 }, { x: 70, y: 40, r: 2.5 },
      { x: 35, y: 65, r: 3, name: "Al Tarf" }, { x: 65, y: 65, r: 2.5 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]],
  },
  {
    id: "capricornus", name: "Capricornus", abbr: "Cap", hemisphere: "S", months: "Aug – Oct",
    mythology: "Pan, god of the wild, who transformed himself into a fish-goat to escape Typhon.",
    brightestStar: "Deneb Algedi (δ Cap)", area: 414,
    stars: [
      { x: 20, y: 40, r: 2.5 }, { x: 35, y: 30, r: 2.5 }, { x: 55, y: 25, r: 2 },
      { x: 70, y: 35, r: 3, name: "Deneb Algedi" }, { x: 80, y: 55, r: 2.5 },
      { x: 65, y: 68, r: 2 }, { x: 45, y: 72, r: 2 }, { x: 25, y: 60, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
  },
];

function ConstellationSVG({ data, size = 100 }: { data: ConstellationData; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ background: "#000" }}>
      {/* Stars glow */}
      {data.stars.map((star, i) => (
        <circle
          key={`glow-${i}`}
          cx={star.x}
          cy={star.y}
          r={star.r * 2.5}
          fill="rgba(255,255,255,0.06)"
        />
      ))}
      {/* Connection lines */}
      {data.lines.map(([a, b], i) => {
        const sa = data.stars[a];
        const sb = data.stars[b];
        if (!sa || !sb) return null;
        return (
          <line
            key={i}
            x1={sa.x} y1={sa.y}
            x2={sb.x} y2={sb.y}
            stroke="rgba(79,195,247,0.35)"
            strokeWidth="0.8"
          />
        );
      })}
      {/* Stars */}
      {data.stars.map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="white"
          style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))" }}
        />
      ))}
      {/* Star labels */}
      {data.stars.filter(s => s.name).map((star, i) => (
        <text
          key={i}
          x={star.x + star.r + 1}
          y={star.y + 1}
          fontSize="5"
          fill="rgba(255,213,79,0.7)"
          fontFamily="Inter, sans-serif"
        >
          {star.name}
        </text>
      ))}
    </svg>
  );
}

const HEMISPHERE_BADGE: Record<Hemisphere, { label: string; color: string }> = {
  N: { label: "Northern", color: "#4fc3f7" },
  S: { label: "Southern", color: "#ef5350" },
  Both: { label: "Both", color: "#9c27b0" },
};

function ConstellationCard({ data, onClick }: { data: ConstellationData; onClick: () => void }) {
  const badge = HEMISPHERE_BADGE[data.hemisphere];
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-4 text-left transition-all duration-200 w-full"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,195,247,0.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(79,195,247,0.15)" }}>
          <ConstellationSVG data={data} size={72} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white mb-0.5" style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f" }}>
            {data.name}
          </h3>
          <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{data.abbr} · {data.months}</p>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}35` }}
          >
            {badge.label}
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        {data.mythology}
      </p>
    </button>
  );
}

function ConstellationDetail({ data, onBack }: { data: ConstellationData; onBack: () => void }) {
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cacheKey = `stellara_constellation_${data.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAiContent(cached);
      return;
    }

    setLoading(true);
    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maxTokens: 800,
        system: `You are STELLARA's astronomy expert. When asked about a constellation provide: the mythology and origin story, the IAU abbreviation, the brightest stars and their types, the best viewing months from the UK, any notable deep sky objects within it, interesting historical significance, and one extraordinary fact most people don't know. Write in STELLARA's voice — warm, clear, wonderful. Format in clean markdown. Under 500 words.`,
        messages: [{ role: "user", content: `Tell me about the ${data.name} constellation.` }],
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        const text = d.text || "";
        setAiContent(text);
        localStorage.setItem(cacheKey, text);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [data.id, data.name]);

  const badge = HEMISPHERE_BADGE[data.hemisphere];

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: "rgba(255,255,255,0.4)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#4fc3f7")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
      >
        ← Back to Constellations
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="rounded-2xl overflow-hidden border self-start" style={{ borderColor: "rgba(79,195,247,0.15)" }}>
          <ConstellationSVG data={data} size={180} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f" }}>
            {data.name}
          </h1>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            {data.mythology}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "IAU Abbreviation", value: data.abbr },
              { label: "Area", value: `${data.area} sq°` },
              { label: "Brightest Star", value: data.brightestStar },
              { label: "Best Viewed", value: data.months },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <span
              className="text-[11px] px-3 py-1 rounded-full"
              style={{ background: `${badge.color}18`, color: badge.color, border: `1px solid ${badge.color}35` }}
            >
              {badge.label} Hemisphere
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-2xl mb-3 animate-pulse">✨</div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Learning the stories of {data.name}...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Signal lost. Connect an AI key to unlock full constellation stories.</p>
        </div>
      )}

      {aiContent && (
        <div
          className="prose prose-invert prose-sm max-w-none rounded-2xl p-6 mb-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <ReactMarkdown>{aiContent}</ReactMarkdown>
        </div>
      )}

      <Link
        href={`/ask`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
        style={{
          background: "rgba(255,213,79,0.08)",
          border: "1px solid rgba(255,213,79,0.25)",
          color: "#ffd54f",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        Ask more about {data.name} →
      </Link>
    </div>
  );
}

export default function Constellations() {
  const [hemisphere, setHemisphere] = useState<Hemisphere | "All">("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ConstellationData | null>(null);

  const filtered = CONSTELLATIONS.filter((c) => {
    const matchHemi = hemisphere === "All" || c.hemisphere === hemisphere || c.hemisphere === "Both";
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchHemi && matchSearch;
  });

  if (selected) {
    return (
      <div className="min-h-screen pt-20 pb-0" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
        <ConstellationDetail data={selected} onBack={() => setSelected(null)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-0" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-widest mb-3"
            style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f" }}
          >
            CONSTELLATION GUIDE
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>
            The patterns humanity has written in the stars.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search constellations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              outline: "none",
            }}
          />
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["All", "N", "S", "Both"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHemisphere(h)}
                className="px-4 py-2 text-xs font-semibold transition-colors"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  background: hemisphere === h ? "rgba(79,195,247,0.15)" : "transparent",
                  color: hemisphere === h ? "#4fc3f7" : "rgba(255,255,255,0.4)",
                }}
              >
                {h === "N" ? "Northern" : h === "S" ? "Southern" : h === "Both" ? "Equatorial" : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)" }}>
            No constellations match your search.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <ConstellationCard key={c.id} data={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
