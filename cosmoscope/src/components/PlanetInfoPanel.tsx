import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { planets } from "@/data/planets";

interface PlanetInfoPanelProps {
  planetId: string | null;
  onClose: () => void;
  onViewInFocus?: () => void;
}

const NOTABLE_FACTS: Record<string, string[]> = {
  mercury: [
    "Mercury has almost no atmosphere to trap heat, so temperatures swing by about 600°C between day and night.",
    "A day on Mercury (sunrise to sunrise) lasts 176 Earth days, longer than its year.",
    "Despite being closest to the Sun, Mercury is not the hottest planet. Venus is.",
  ],
  venus: [
    "Venus spins backwards, so the Sun rises in the west and sets in the east.",
    "Atmospheric pressure on Venus is about 90 times Earth's, like being 900 metres underwater.",
    "Venus is the brightest natural object in the night sky after the Moon.",
  ],
  earth: [
    "Earth is the only planet known to harbour life, and the only one with liquid water on its surface.",
    "Our Moon is unusually large relative to Earth, stabilising our axial tilt.",
    "Earth's magnetic field deflects most of the solar wind, helping to protect our atmosphere.",
  ],
  mars: [
    "Mars hosts Olympus Mons, the largest volcano in the solar system, about 22 km high.",
    "A Martian day, called a sol, lasts 24 hours 40 minutes, almost the same as Earth's.",
    "Mars has the longest canyon in the solar system: Valles Marineris, 4,000 km long.",
  ],
  jupiter: [
    "Jupiter's Great Red Spot is a storm wider than Earth that has lasted at least 190 years.",
    "Jupiter's gravity shapes the orbits of asteroids and comets across the solar system.",
    "Jupiter has 101 known moons, including Ganymede, the largest moon in the solar system.",
  ],
  saturn: [
    "Saturn's main rings stretch about 280,000 km across, yet in many places are only about 10 metres thick.",
    "Saturn is the least dense planet. It would float in water, if there were an ocean big enough.",
    "Titan, Saturn's largest moon, has liquid methane lakes and a thick nitrogen atmosphere.",
  ],
  uranus: [
    "Uranus rotates on its side, tilted by 98°, probably after an ancient collision.",
    "Uranus has the coldest atmosphere of any planet, down to about −224°C.",
    "Uranus has 13 known rings, faint and dark compared to Saturn's.",
  ],
  neptune: [
    "Neptune has the fastest winds in the solar system, reaching about 2,100 km/h.",
    "Neptune was the first planet predicted mathematically before being observed.",
    "Triton, Neptune's moon, orbits backwards and is likely a captured Kuiper Belt object.",
  ],
};

const SCALE_COMPARISONS: Record<string, string> = {
  mercury: "If the Sun were as tall as a front door, Mercury would be a lentil 83 metres away.",
  venus: "If the Sun were as tall as a front door, Venus would be a grape 155 metres away.",
  earth: "If the Sun were as tall as a front door, Earth would be a grape 215 metres away.",
  mars: "If the Sun were as tall as a front door, Mars would be a pea 330 metres away.",
  jupiter: "If the Sun were as tall as a front door, Jupiter would be a football 1.1 km away.",
  saturn: "If the Sun were as tall as a front door, Saturn would be a small melon 2 km away.",
  uranus: "If the Sun were as tall as a front door, Uranus would be a tennis ball 4 km away.",
  neptune: "If the Sun were as tall as a front door, Neptune would be a tennis ball 6.5 km away.",
};

export default function PlanetInfoPanel({ planetId, onClose, onViewInFocus }: PlanetInfoPanelProps) {
  if (!planetId) return null;
  const planet = planets.find((p) => p.id === planetId);
  if (!planet) return null;

  const facts = NOTABLE_FACTS[planetId] ?? [];
  const scale = SCALE_COMPARISONS[planetId] ?? "";

  return (
    <>
      {/* Phones: a sheet from the bottom */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ maxHeight: "85vh" }}>
        <div
          className="rounded-t-xl flex flex-col"
          style={{ background: "#0A0F17", borderTop: "1px solid #1C2533", maxHeight: "85vh" }}
        >
          <div className="flex justify-center pt-2.5 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full" style={{ background: "#2A3546" }} />
          </div>
          <PanelContent planet={planet} facts={facts} scale={scale} onClose={onClose} onViewInFocus={onViewInFocus} />
        </div>
      </div>

      {/* Larger screens: a panel on the right */}
      <div
        className="hidden md:flex fixed right-4 bottom-4 z-50 flex-col w-[22rem] rounded-xl overflow-hidden"
        style={{ top: "220px", background: "#0A0F17", border: "1px solid #1C2533" }}
      >
        <PanelContent planet={planet} facts={facts} scale={scale} onClose={onClose} onViewInFocus={onViewInFocus} />
      </div>
    </>
  );
}

interface PanelContentProps {
  planet: (typeof planets)[number];
  facts: string[];
  scale: string;
  onClose: () => void;
  onViewInFocus?: () => void;
}

function PanelContent({ planet, facts, scale, onClose, onViewInFocus }: PanelContentProps) {
  const p = planet as typeof planet & Record<string, unknown>;
  const rows: [string, string][] = [
    ["Diameter", String(p.diameter)],
    ["Mass", String(p.mass)],
    ["Distance from the Sun", String(p.distance).replace(/([\d.]+)M km/, "$1 million km").replace(/([\d.]+)B km/, "$1 billion km")],
    ["One orbit", `${Number(p.orbitalPeriod).toLocaleString("en-GB")} days`],
    ["One day", String(p.day)],
    ["Known moons", String(p.moons)],
  ];
  return (
    <>
      <div className="shrink-0 px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: "1px solid #1C2533" }}>
        <div className="min-w-0">
          <h2 className="m-0 text-[28px] leading-tight" style={{ color: "#E8ECF1", fontWeight: 400 }}>{String(p.name)}</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: "#8E9AA8" }}>{String(p.type)}</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: "#8E9AA8" }} />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 pb-10 pt-4">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>{String(p.description)}</p>

          {onViewInFocus && (
            <button
              onClick={onViewInFocus}
              className="mt-4 w-full rounded-md py-2 text-[14px] font-medium transition-colors hover:bg-white/5"
              style={{ border: "1px solid #2A3546", color: "#E8ECF1" }}
            >
              View up close
            </button>
          )}

          <dl className="m-0 mt-6">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2" style={{ borderTop: "1px solid #161E2A" }}>
                <dt className="text-[14px]" style={{ color: "#8E9AA8" }}>{label}</dt>
                <dd className="m-0 text-[14px] text-right tabular-nums" style={{ color: "#E8ECF1" }}>{value}</dd>
              </div>
            ))}
          </dl>

          {scale && (
            <p className="m-0 mt-6 font-serif text-[17px] leading-snug" style={{ color: "#E8ECF1" }}>{scale}</p>
          )}

          {facts.length > 0 && (
            <ul className="m-0 mt-6 p-0 list-none space-y-3">
              {facts.map((fact) => (
                <li key={fact} className="text-[14px] leading-relaxed pl-3" style={{ color: "#C9D2DC", borderLeft: "1px solid #2A3546" }}>
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
