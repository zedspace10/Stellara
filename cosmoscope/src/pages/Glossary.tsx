import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: "Stars" | "Galaxies" | "Cosmology" | "Physics" | "Phenomena" | "Instruments";
}

const CATEGORIES = ["Stars", "Galaxies", "Cosmology", "Physics", "Phenomena", "Instruments"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Stars: "#ffd54f",
  Galaxies: "#4fc3f7",
  Cosmology: "#9c27b0",
  Physics: "#ef5350",
  Phenomena: "#4caf50",
  Instruments: "#ff9800",
};

const FEATURED_TERMS: GlossaryTerm[] = [
  { term: "Black Hole", definition: "A region of spacetime where gravity is so strong that nothing, not even light, can escape from inside the event horizon.", category: "Phenomena" },
  { term: "Dark Matter", definition: "Invisible matter that doesn't interact with light but exerts gravitational effects — comprising 85% of all matter in the universe.", category: "Cosmology" },
  { term: "Dark Energy", definition: "A mysterious force causing the accelerating expansion of the universe, comprising 68% of the universe's total energy.", category: "Cosmology" },
  { term: "Event Horizon", definition: "The boundary around a black hole beyond which no information or matter can escape.", category: "Physics" },
  { term: "Galaxy", definition: "A system of millions to trillions of stars, gas, dust, and dark matter bound together by gravity.", category: "Galaxies" },
  { term: "Nebula", definition: "A cloud of gas and dust in space — often a stellar nursery where new stars are born, or the remnant of a dead star.", category: "Stars" },
  { term: "Neutron Star", definition: "The ultra-dense remnant of a massive star's collapse, packing more mass than the Sun into a sphere 20km across.", category: "Stars" },
  { term: "Pulsar", definition: "A rapidly rotating neutron star that emits beams of electromagnetic radiation, sweeping like a lighthouse.", category: "Stars" },
  { term: "Quasar", definition: "The intensely luminous nucleus of a distant galaxy, powered by a supermassive black hole actively consuming matter.", category: "Galaxies" },
  { term: "Redshift", definition: "The stretching of light to longer (redder) wavelengths as a source moves away, used to measure cosmic distances and velocities.", category: "Physics" },
  { term: "Singularity", definition: "A point of infinite density where the known laws of physics break down — found at the centres of black holes.", category: "Physics" },
  { term: "Supernova", definition: "The catastrophic explosion of a massive star at the end of its life — briefly outshining entire galaxies.", category: "Stars" },
  { term: "White Dwarf", definition: "The dense remnant of a Sun-like star after it exhausts its fuel, slowly cooling over billions of years.", category: "Stars" },
  { term: "Exoplanet", definition: "A planet orbiting a star other than our Sun. Over 5,500 have been confirmed as of 2024.", category: "Planets" as Category },
  { term: "Cosmic Microwave Background", definition: "The faint afterglow of the Big Bang's radiation, filling the entire universe at a temperature of 2.725 K.", category: "Cosmology" },
  { term: "Gravitational Wave", definition: "A ripple in the fabric of spacetime caused by accelerating massive objects, traveling at the speed of light.", category: "Physics" },
  { term: "Hawking Radiation", definition: "Theoretical thermal radiation emitted by black holes due to quantum effects near the event horizon, causing slow evaporation.", category: "Physics" },
  { term: "Light Year", definition: "The distance light travels in one year — about 9.46 trillion kilometres or 5.88 trillion miles.", category: "Phenomena" },
  { term: "Parsec", definition: "A unit of distance equal to 3.26 light years — the distance at which 1 AU subtends an angle of 1 arcsecond.", category: "Instruments" },
  { term: "Stellar Evolution", definition: "The process by which a star changes over its lifetime, from birth in a nebula through its main sequence life to its death.", category: "Stars" },
  { term: "Main Sequence", definition: "The band on the Hertzsprung-Russell diagram where most stars spend the majority of their lives, fusing hydrogen into helium.", category: "Stars" },
  { term: "Red Giant", definition: "A late stage of stellar evolution when a star's outer layers expand enormously after its core hydrogen is exhausted.", category: "Stars" },
  { term: "Accretion Disc", definition: "A rotating disc of gas and dust spiralling into a central object such as a black hole, neutron star, or forming star.", category: "Phenomena" },
  { term: "Chandrasekhar Limit", definition: "The maximum mass of a stable white dwarf star — 1.4 solar masses. Above this, it collapses into a neutron star or triggers a supernova.", category: "Physics" },
  { term: "Hubble Constant", definition: "The rate at which the universe is expanding, currently measured at approximately 70 km/s per megaparsec.", category: "Cosmology" },
  { term: "Inflation", definition: "A hypothesised period of extremely rapid exponential expansion in the very early universe, explaining its large-scale structure.", category: "Cosmology" },
  { term: "Multiverse", definition: "The hypothetical existence of multiple universes beyond our own observable universe, each potentially with different physical laws.", category: "Cosmology" },
  { term: "String Theory", definition: "A theoretical framework in which fundamental particles are one-dimensional vibrating strings, potentially unifying quantum mechanics and gravity.", category: "Physics" },
  { term: "Spacetime", definition: "The four-dimensional continuum combining three dimensions of space and one of time, unified by Einstein's relativity.", category: "Physics" },
  { term: "Gravitational Lensing", definition: "The bending of light around massive objects, as predicted by general relativity — allowing distant galaxies to act as natural telescopes.", category: "Phenomena" },
];

type TermWithMeta = GlossaryTerm & { aiContent?: string; loading?: boolean; error?: boolean };

function TermCard({
  term,
  onExpand,
}: {
  term: TermWithMeta;
  onExpand: () => void;
}) {
  const color = CATEGORY_COLORS[term.category as Category] ?? "#4fc3f7";
  return (
    <button
      onClick={onExpand}
      className="w-full text-left rounded-xl p-4 transition-all duration-150"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm" style={{ fontFamily: "Orbitron, sans-serif", color, letterSpacing: "0.04em" }}>
          {term.term}
        </h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          {term.category}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        {term.definition}
      </p>
    </button>
  );
}

function TermDetail({
  term,
  onClose,
}: {
  term: TermWithMeta;
  onClose: () => void;
}) {
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const color = CATEGORY_COLORS[term.category as Category] ?? "#4fc3f7";

  useEffect(() => {
    const cacheKey = `stellara_glossary_${term.term.toLowerCase().replace(/\s+/g, "_")}`;
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
        maxTokens: 600,
        system: `You are STELLARA's astronomy glossary. When given an astronomy or physics term provide:
1. A clear plain language definition
2. A real world analogy that makes it tangible
3. Why it matters in astronomy
4. One fascinating related fact
5. Related terms to explore
Write in STELLARA's voice — warm, clear, accessible. Never patronising. Format in clean markdown. Under 400 words.`,
        messages: [{ role: "user", content: `Define: ${term.term}` }],
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        const text = d.text || "";
        setAiContent(text);
        localStorage.setItem(cacheKey, text);
      })
      .catch(() => setAiContent(null))
      .finally(() => setLoading(false));
  }, [term.term]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: "rgba(8,8,22,0.99)", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between p-5 pb-4" style={{ background: "rgba(8,8,22,0.99)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: "Orbitron, sans-serif", color, letterSpacing: "0.06em" }}>
              {term.term}
            </h2>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
            >
              {term.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-sm"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
            {term.definition}
          </p>

          {loading && (
            <div className="text-center py-8">
              <div className="text-xl mb-2 animate-pulse">✨</div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Expanding definition...
              </p>
            </div>
          )}

          {aiContent && (
            <div className="prose prose-invert prose-sm max-w-none rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <ReactMarkdown>{aiContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<TermWithMeta | null>(null);
  const [customSearch, setCustomSearch] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTerms = FEATURED_TERMS.filter((t) => {
    if (letterFilter) return t.term.toUpperCase().startsWith(letterFilter);
    if (search) return t.term.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const exactMatch = FEATURED_TERMS.find(
    (t) => t.term.toLowerCase() === search.toLowerCase()
  );

  const showCustomSearch = search.length > 1 && !exactMatch && filteredTerms.length === 0;

  const handleCustomSearch = () => {
    if (!search) return;
    setCustomSearch(search);
    const customTerm: TermWithMeta = {
      term: search,
      definition: "Searching the universe...",
      category: "Physics",
    };
    setSelectedTerm(customTerm);
  };

  return (
    <div className="min-h-screen pt-20 pb-0" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-widest mb-3"
            style={{ fontFamily: "Orbitron, sans-serif", color: "#4fc3f7" }}
          >
            SPACE GLOSSARY
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>
            Every term you'll ever need.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search any astronomy term..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLetterFilter(null);
            }}
            className="w-full px-5 py-4 rounded-2xl text-base"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(79,195,247,0.2)",
              color: "white",
              outline: "none",
              fontFamily: "Inter, sans-serif",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Custom search prompt */}
        {showCustomSearch && (
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={handleCustomSearch}
              disabled={customLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(79,195,247,0.1)",
                border: "1px solid rgba(79,195,247,0.25)",
                color: "#4fc3f7",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "11px",
              }}
            >
              {customLoading ? "Searching..." : `Search the universe for "${search}"`}
            </button>
          </div>
        )}

        {/* Alphabet filter */}
        <div className="flex flex-wrap gap-1 mb-8">
          {ALPHABET.map((letter) => {
            const hasTerms = FEATURED_TERMS.some((t) => t.term.toUpperCase().startsWith(letter));
            return (
              <button
                key={letter}
                onClick={() => {
                  setLetterFilter(letterFilter === letter ? null : letter);
                  setSearch("");
                }}
                disabled={!hasTerms}
                className="w-7 h-7 rounded text-xs font-bold transition-all"
                style={{
                  background: letterFilter === letter ? "rgba(79,195,247,0.15)" : "transparent",
                  color: letterFilter === letter ? "#4fc3f7" : hasTerms ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
                  border: letterFilter === letter ? "1px solid rgba(79,195,247,0.3)" : "1px solid transparent",
                  cursor: hasTerms ? "pointer" : "default",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "10px",
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSearch(cat.toLowerCase())}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: `${color}10`,
                  border: `1px solid ${color}25`,
                  color: `${color}cc`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Terms grid */}
        {filteredTerms.length === 0 && !showCustomSearch ? (
          <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)" }}>
            No terms match. Try searching above.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredTerms.map((term) => (
              <TermCard key={term.term} term={term} onExpand={() => setSelectedTerm(term)} />
            ))}
          </div>
        )}

        <p className="text-center text-xs mt-10" style={{ color: "rgba(255,255,255,0.2)" }}>
          30 featured terms · explore any term in the universe
        </p>
      </div>

      {selectedTerm && (
        <TermDetail term={selectedTerm} onClose={() => setSelectedTerm(null)} />
      )}

      <Footer />
    </div>
  );
}
