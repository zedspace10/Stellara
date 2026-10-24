import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";
import { CONSTELLATION_STORIES } from "./constellationStories";

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
    id: "orion", name: "Orion", abbr: "Ori", hemisphere: "Both", months: "Dec to Feb",
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
    id: "ursa-major", name: "Ursa Major", abbr: "UMa", hemisphere: "N", months: "Mar to May",
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
    id: "cassiopeia", name: "Cassiopeia", abbr: "Cas", hemisphere: "N", months: "Oct to Dec",
    mythology: "Vain queen of Ethiopia, punished to circle the pole forever.",
    brightestStar: "Schedar (α Cas)", area: 598,
    stars: [
      { x: 10, y: 70, r: 2.5 }, { x: 25, y: 30, r: 3, name: "Schedar" },
      { x: 50, y: 60, r: 2.5 }, { x: 70, y: 25, r: 3 }, { x: 90, y: 50, r: 2.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: "leo", name: "Leo", abbr: "Leo", hemisphere: "N", months: "Mar to May",
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
    id: "scorpius", name: "Scorpius", abbr: "Sco", hemisphere: "S", months: "Jun to Aug",
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
    id: "cygnus", name: "Cygnus", abbr: "Cyg", hemisphere: "N", months: "Aug to Oct",
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
    id: "gemini", name: "Gemini", abbr: "Gem", hemisphere: "N", months: "Jan to Mar",
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
    id: "taurus", name: "Taurus", abbr: "Tau", hemisphere: "N", months: "Dec to Feb",
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
    id: "lyra", name: "Lyra", abbr: "Lyr", hemisphere: "N", months: "Jul to Sep",
    mythology: "The lyre of Orpheus, who could charm even rocks and rivers with its music.",
    brightestStar: "Vega (α Lyr)", area: 286,
    stars: [
      { x: 50, y: 15, r: 5, name: "Vega" }, { x: 35, y: 45, r: 2 },
      { x: 50, y: 55, r: 2.5 }, { x: 65, y: 45, r: 2 }, { x: 40, y: 75, r: 2 }, { x: 60, y: 75, r: 2 },
    ],
    lines: [[0, 1], [0, 3], [1, 2], [2, 3], [1, 4], [4, 5], [5, 3]],
  },
  {
    id: "andromeda", name: "Andromeda", abbr: "And", hemisphere: "N", months: "Oct to Dec",
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
    id: "canis-major", name: "Canis Major", abbr: "CMa", hemisphere: "S", months: "Jan to Mar",
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
    id: "virgo", name: "Virgo", abbr: "Vir", hemisphere: "Both", months: "Apr to Jun",
    mythology: "Demeter or Persephone, the goddess of the harvest, holding an ear of wheat.",
    brightestStar: "Spica (α Vir)", area: 1294,
    stars: [
      { x: 75, y: 75, r: 4, name: "Spica" }, { x: 60, y: 60, r: 2.5 },
      { x: 45, y: 50, r: 2.5, name: "Porrima" }, { x: 30, y: 35, r: 2 },
      { x: 50, y: 25, r: 2 }, { x: 65, y: 20, r: 2 }, { x: 75, y: 40, r: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]],
  },
  {
    id: "sagittarius", name: "Sagittarius", abbr: "Sgr", hemisphere: "S", months: "Jul to Sep",
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
    id: "hercules", name: "Hercules", abbr: "Her", hemisphere: "N", months: "Jun to Aug",
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
    id: "aquila", name: "Aquila", abbr: "Aql", hemisphere: "Both", months: "Aug to Oct",
    mythology: "The eagle of Zeus, who carried the thunderbolts of the king of gods.",
    brightestStar: "Altair (α Aql)", area: 652,
    stars: [
      { x: 50, y: 40, r: 4, name: "Altair" }, { x: 35, y: 35, r: 2.5 },
      { x: 65, y: 35, r: 2.5 }, { x: 50, y: 60, r: 2.5 }, { x: 50, y: 80, r: 2 },
    ],
    lines: [[0, 1], [0, 2], [0, 3], [3, 4]],
  },
  {
    id: "perseus", name: "Perseus", abbr: "Per", hemisphere: "N", months: "Nov to Jan",
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
    id: "aquarius", name: "Aquarius", abbr: "Aqr", hemisphere: "Both", months: "Sep to Nov",
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
    id: "pisces", name: "Pisces", abbr: "Psc", hemisphere: "N", months: "Oct to Dec",
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
    id: "cancer", name: "Cancer", abbr: "Cnc", hemisphere: "N", months: "Feb to Apr",
    mythology: "The crab sent by Hera to distract Hercules during his battle with the Hydra.",
    brightestStar: "Al Tarf (β Cnc)", area: 506,
    stars: [
      { x: 50, y: 15, r: 2 }, { x: 30, y: 40, r: 2.5 }, { x: 70, y: 40, r: 2.5 },
      { x: 35, y: 65, r: 3, name: "Al Tarf" }, { x: 65, y: 65, r: 2.5 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]],
  },
  {
    id: "capricornus", name: "Capricornus", abbr: "Cap", hemisphere: "S", months: "Aug to Oct",
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
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ background: "#0A0F17", display: "block" }} aria-hidden="true">
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
            stroke="rgba(169,195,224,0.35)"
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
        />
      ))}
      {/* Star labels */}
      {data.stars.filter(s => s.name).map((star, i) => (
        <text
          key={i}
          x={star.x + star.r + 1}
          y={star.y + 1}
          fontSize="5"
          fill="rgba(243,221,176,0.7)"
          fontFamily="'Instrument Sans', sans-serif"
        >
          {star.name}
        </text>
      ))}
    </svg>
  );
}

const HEMISPHERE_TEXT: Record<Hemisphere, string> = {
  N: "Northern sky",
  S: "Southern sky",
  Both: "Seen from both hemispheres",
};

function ConstellationCard({ data, onClick }: { data: ConstellationData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left flex gap-4 py-5 transition-colors"
      style={{ borderTop: "1px solid #1C2533" }}
    >
      <span className="shrink-0 rounded-md overflow-hidden">
        <ConstellationSVG data={data} size={84} />
      </span>
      <span className="min-w-0">
        <span className="block font-serif text-[22px] leading-tight group-hover:underline underline-offset-4 decoration-1" style={{ color: "#E8ECF1" }}>{data.name}</span>
        <span className="block mt-1 text-[13px]" style={{ color: "#8E9AA8" }}>Best seen {data.months}. {HEMISPHERE_TEXT[data.hemisphere]}.</span>
        <span className="block mt-2 text-[14px] leading-relaxed" style={{ color: "#A3AFBC" }}>{data.mythology}</span>
      </span>
    </button>
  );
}

function ConstellationDetail({ data, onBack }: { data: ConstellationData; onBack: () => void }) {
  const story = CONSTELLATION_STORIES[data.id];

  return (
    <div className="max-w-[40rem] mx-auto px-5 py-10">
      <button onClick={onBack} className="text-[15px] mb-10 underline underline-offset-4 transition-colors hover:text-white" style={{ color: "#A3AFBC" }}>
        All constellations
      </button>

      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="rounded-md overflow-hidden self-start shrink-0">
          <ConstellationSVG data={data} size={180} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="m-0 text-[44px] leading-none" style={{ color: "#E8ECF1" }}>{data.name}</h1>
          <p className="mt-3 mb-0 text-[16px] leading-relaxed" style={{ color: "#A3AFBC" }}>{data.mythology}</p>
          <dl className="m-0 mt-5">
            {[
              ["Abbreviation", data.abbr],
              ["Area", `${data.area} square degrees`],
              ["Brightest star", data.brightestStar],
              ["Best seen", data.months],
              ["Where", HEMISPHERE_TEXT[data.hemisphere]],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-1.5" style={{ borderTop: "1px solid #161E2A" }}>
                <dt className="text-[14px]" style={{ color: "#8E9AA8" }}>{label}</dt>
                <dd className="m-0 text-[14px] text-right" style={{ color: "#E8ECF1" }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {story && (
        <div className="prose prose-invert max-w-none prose-p:text-[#C9D2DC] prose-p:leading-[1.7] prose-headings:font-serif prose-headings:font-normal prose-strong:text-[#E8ECF1]">
          <ReactMarkdown>{story}</ReactMarkdown>
        </div>
      )}

      <p className="mt-10 text-[13px]" style={{ color: "#7C8794" }}>
        Star names follow the International Astronomical Union. Stories written by PALE.
      </p>
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
      <div className="min-h-screen pt-20 pb-0" style={{ background: "#05070C" }}>
        <ConstellationDetail data={selected} onBack={() => setSelected(null)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-0" style={{ background: "#05070C" }}>
      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        <header className="pt-4 pb-10">
          <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: "#E8ECF1" }}>Constellation guide</h1>
          <p className="mt-4 mb-0 text-[17px] leading-relaxed max-w-[34rem]" style={{ color: "#A3AFBC" }}>
            The patterns people have traced in the stars for thousands of years, and the stories behind them.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <label htmlFor="constellation-search" className="sr-only">Find a constellation</label>
          <input
            id="constellation-search"
            type="search"
            placeholder="Find a constellation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-[22rem] px-3 py-2 rounded-md text-[15px] bg-transparent outline-none placeholder:text-[#5D6B79]"
            style={{ border: "1px solid #2A3546", color: "#E8ECF1" }}
          />
          <div role="group" aria-label="Show" className="flex gap-5 text-[15px]">
            {(["All", "N", "S", "Both"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHemisphere(h)}
                aria-pressed={hemisphere === h}
                className="py-1 transition-colors underline-offset-[6px] decoration-1"
                style={{
                  color: hemisphere === h ? "#E8ECF1" : "#8E9AA8",
                  textDecorationLine: hemisphere === h ? "underline" : "none",
                  textDecorationColor: "#A9C3E0",
                }}
              >
                {h === "N" ? "Northern" : h === "S" ? "Southern" : h === "Both" ? "Both hemispheres" : "All"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-[16px]" style={{ color: "#8E9AA8" }}>
            No constellation by that name. Try another spelling, or clear the search.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
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
