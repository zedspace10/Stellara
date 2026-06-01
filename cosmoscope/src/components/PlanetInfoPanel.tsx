import React from "react";
import { X, Clock, Thermometer, Orbit, Disc, Weight, Ruler, Heart, Crosshair, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { planets } from "@/data/planets";
import { useFavourites } from "@/hooks/useFavourites";

interface PlanetInfoPanelProps {
  planetId: string | null;
  onClose: () => void;
  onViewInFocus?: () => void;
}

const NOTABLE_FACTS: Record<string, string[]> = {
  mercury: [
    "Mercury has no atmosphere to trap heat — temperatures swing 600°C between day and night.",
    "A day on Mercury (sunrise to sunrise) lasts 176 Earth days — longer than its year.",
    "Despite being closest to the Sun, Mercury is not the hottest planet — Venus is.",
  ],
  venus: [
    "Venus spins backwards — the Sun rises in the west and sets in the east.",
    "Atmospheric pressure on Venus is 90× that of Earth — equivalent to 900 metres underwater.",
    "Venus is the brightest natural object in the night sky after the Moon.",
  ],
  earth: [
    "Earth is the only planet known to harbour life — and liquid water on its surface.",
    "Our Moon is unusually large relative to Earth, stabilising our axial tilt.",
    "Earth's magnetic field shields us from solar wind that would otherwise strip our atmosphere.",
  ],
  mars: [
    "Mars hosts Olympus Mons — the largest volcano in the Solar System at 21 km high.",
    "A Martian day (sol) is 24 hours 37 minutes — almost identical to Earth's.",
    "Mars has the longest canyon in the Solar System: Valles Marineris, 4,000 km long.",
  ],
  jupiter: [
    "Jupiter's Great Red Spot is a storm that has raged for over 350 years.",
    "Jupiter's gravity acts as a shield, deflecting many asteroids away from the inner planets.",
    "Jupiter has 95 known moons — more than any other planet in our Solar System.",
  ],
  saturn: [
    "Saturn's rings are made of ice and rock, extending 282,000 km but only 10–100 metres thick.",
    "Saturn is the least dense planet — it would float in water if you had a big enough ocean.",
    "Titan, Saturn's largest moon, has liquid methane lakes and a thick nitrogen atmosphere.",
  ],
  uranus: [
    "Uranus rotates on its side — its axial tilt is 98°, likely from an ancient collision.",
    "Uranus is the coldest planetary atmosphere in the Solar System at −224°C.",
    "Uranus has 13 known rings, faint and dark compared to Saturn's.",
  ],
  neptune: [
    "Neptune has the fastest winds in the Solar System — reaching 2,100 km/h.",
    "Neptune was the first planet predicted mathematically before being observed.",
    "Triton, Neptune's moon, orbits backwards and is likely a captured Kuiper Belt object.",
  ],
};

const SCALE_COMPARISONS: Record<string, string> = {
  mercury: "If the Sun were a front door, Mercury would be a grape seed 3 metres away.",
  venus: "If the Sun were a front door, Venus would be a blueberry 5 metres away.",
  earth: "If the Sun were a front door, Earth would be a blueberry 7 metres away.",
  mars: "If the Sun were a front door, Mars would be a small pea 10 metres away.",
  jupiter: "If the Sun were a front door, Jupiter would be a softball 36 metres away.",
  saturn: "If the Sun were a front door, Saturn would be an orange 67 metres away.",
  uranus: "If the Sun were a front door, Uranus would be a golf ball 134 metres away.",
  neptune: "If the Sun were a front door, Neptune would be a golf ball 210 metres away.",
};

export default function PlanetInfoPanel({ planetId, onClose, onViewInFocus }: PlanetInfoPanelProps) {
  const { isFavourite, toggle } = useFavourites();

  if (!planetId) return null;
  const planet = planets.find((p) => p.id === planetId);
  if (!planet) return null;

  const isFav = isFavourite(`planet-${planetId}`);
  const facts = NOTABLE_FACTS[planetId] ?? [];
  const scale = SCALE_COMPARISONS[planetId] ?? "";
  const colorHex = `#${planet.color.toString(16).padStart(6, "0")}`;

  return (
    <>
      {/* Mobile: bottom sheet sliding up */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ maxHeight: "85vh" }}>
        <div
          className="rounded-t-2xl flex flex-col"
          style={{
            background: "rgba(10,10,26,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderBottom: "none",
            maxHeight: "85vh",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <PanelContent
            planet={planet}
            colorHex={colorHex}
            isFav={isFav}
            facts={facts}
            scale={scale}
            planetId={planetId}
            onClose={onClose}
            onViewInFocus={onViewInFocus}
            onToggleFav={() => toggle(`planet-${planetId}`)}
          />
        </div>
      </div>

      {/* Desktop: right side panel */}
      <div
        className="hidden md:flex fixed right-4 bottom-4 z-50 flex-col w-96 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          top: '220px',
          background: "rgba(10,10,26,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <PanelContent
          planet={planet}
          colorHex={colorHex}
          isFav={isFav}
          facts={facts}
          scale={scale}
          planetId={planetId}
          onClose={onClose}
          onViewInFocus={onViewInFocus}
          onToggleFav={() => toggle(`planet-${planetId}`)}
        />
      </div>
    </>
  );
}

interface PanelContentProps {
  planet: ReturnType<typeof planets.find> & object;
  colorHex: string;
  isFav: boolean;
  facts: string[];
  scale: string;
  planetId: string;
  onClose: () => void;
  onViewInFocus?: () => void;
  onToggleFav: () => void;
}

function PanelContent({ planet, colorHex, isFav, facts, scale, planetId, onClose, onViewInFocus, onToggleFav }: PanelContentProps) {
  if (!planet) return null;
  return (
    <>
      {/* Sticky header — never scrolls */}
      <div
        className="shrink-0 px-5 pt-4 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
              style={{
                background: `${colorHex}18`,
                color: colorHex,
                border: `1px solid ${colorHex}30`,
              }}
            >
              {(planet as any).type}
            </span>
            <div className="flex items-center gap-2">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "Orbitron, sans-serif", color: colorHex }}
              >
                {(planet as any).name}
              </h2>
              <button
                onClick={onToggleFav}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-white/30"}`} />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 mt-1"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 pb-10 pt-4 space-y-5">
          {/* Hero planet visual */}
          <div className="flex justify-center py-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${colorHex}30 0%, transparent 70%)`,
                  transform: "scale(2.5)",
                }}
              />
              <div
                className="w-20 h-20 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${colorHex}ff, ${colorHex}88)`,
                  boxShadow: `0 0 30px ${colorHex}40`,
                }}
              />
              {planetId === "saturn" && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "130px",
                    height: "130px",
                    border: `3px solid ${colorHex}80`,
                    transform: "translate(-50%, -50%) rotateX(70deg)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {onViewInFocus && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 gap-2"
                onClick={onViewInFocus}
                style={{ background: "rgba(79,195,247,0.1)", border: "1px solid rgba(79,195,247,0.2)", color: "#4fc3f7" }}
              >
                <Crosshair className="w-3.5 h-3.5" /> View in Focus
              </Button>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            {(planet as any).description}
          </p>

          {/* Stats grid */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Statistics</h3>
            <div className="space-y-0">
              {[
                { icon: <Disc className="w-3.5 h-3.5" />, label: "Diameter", value: (planet as any).diameter },
                { icon: <Weight className="w-3.5 h-3.5" />, label: "Mass", value: (planet as any).mass },
                { icon: <Orbit className="w-3.5 h-3.5" />, label: "Distance from Sun", value: (planet as any).distance },
                { icon: <Clock className="w-3.5 h-3.5" />, label: "Orbital Period", value: `${(planet as any).orbitalPeriod} days` },
                { icon: <Thermometer className="w-3.5 h-3.5" />, label: "Length of Day", value: (planet as any).day },
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Moons", value: String((planet as any).moons) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span style={{ color: colorHex }}>{row.icon}</span>
                    {row.label}
                  </div>
                  <span className="text-sm font-medium text-white ml-4 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notable facts */}
          {facts.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Notable Facts</h3>
              <div className="space-y-2">
                {facts.map((fact, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl p-3"
                    style={{ background: `${colorHex}08`, border: `1px solid ${colorHex}18` }}
                  >
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
                      style={{ background: `${colorHex}20`, color: colorHex }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scale comparison */}
          {scale && (
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(79,195,247,0.05)", border: "1px solid rgba(79,195,247,0.12)" }}
            >
              <div className="flex items-center gap-2 text-[#4fc3f7] mb-2 text-[10px] font-semibold uppercase tracking-wider">
                <Ruler className="w-3.5 h-3.5" /> Scale Comparison
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                {scale}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
