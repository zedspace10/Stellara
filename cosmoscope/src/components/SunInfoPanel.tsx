import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SunInfoPanelProps {
  open: boolean;
  onClose: () => void;
}

const ROWS: [string, string][] = [
  ["Diameter", "1,392,700 km"],
  ["Mass", "1.989 × 10³⁰ kg"],
  ["Surface", "About 5,500°C"],
  ["Core", "About 15 million °C"],
  ["Age", "4.6 billion years"],
  ["Distance from Earth", "149.6 million km"],
  ["One turn", "25 to 35 days"],
  ["Made of", "73% hydrogen, 25% helium, 2% other"],
];

const FACTS = [
  "Sunlight takes about 8 minutes 20 seconds to reach Earth.",
  "About 1.3 million Earths would fit inside it.",
  "Its outer atmosphere, the corona, is over 1,000,000°C, far hotter than the surface below it.",
];

export default function SunInfoPanel({ open, onClose }: SunInfoPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Phones: a sheet from the bottom */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ maxHeight: "85vh" }}>
        <div className="rounded-t-xl flex flex-col" style={{ background: "#0A0F17", borderTop: "1px solid #1C2533", maxHeight: "85vh" }}>
          <div className="flex justify-center pt-2.5 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full" style={{ background: "#2A3546" }} />
          </div>
          <SunContent onClose={onClose} />
        </div>
      </div>

      {/* Larger screens: a panel on the right */}
      <div
        className="hidden md:flex fixed right-4 bottom-4 w-[22rem] flex-col z-50 overflow-hidden rounded-xl"
        style={{ top: "220px", background: "#0A0F17", border: "1px solid #1C2533" }}
      >
        <SunContent onClose={onClose} />
      </div>
    </>
  );
}

function SunContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="shrink-0 px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: "1px solid #1C2533" }}>
        <div>
          <h2 className="m-0 text-[28px] leading-tight" style={{ color: "#F3DDB0", fontWeight: 400 }}>The Sun</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: "#8E9AA8" }}>Our star, a yellow dwarf</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: "#8E9AA8" }} />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 pt-4 pb-10">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>
            A nearly perfect ball of hot plasma, powered by nuclear fusion at its centre. Every second it turns about
            600 million tonnes of hydrogen into helium, and the energy released is what makes life on Earth possible.
            It holds 99.8% of all the mass in the solar system.
          </p>

          <dl className="m-0 mt-6">
            {ROWS.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2" style={{ borderTop: "1px solid #161E2A" }}>
                <dt className="text-[14px] shrink-0" style={{ color: "#8E9AA8" }}>{label}</dt>
                <dd className="m-0 text-[14px] text-right tabular-nums" style={{ color: "#E8ECF1" }}>{value}</dd>
              </div>
            ))}
          </dl>

          <p className="m-0 mt-6 font-serif text-[17px] leading-snug" style={{ color: "#E8ECF1" }}>
            If the Sun were as tall as a front door, Earth would be a grape about 215 metres away.
          </p>

          <ul className="m-0 mt-6 p-0 list-none space-y-3">
            {FACTS.map((fact) => (
              <li key={fact} className="text-[14px] leading-relaxed pl-3" style={{ color: "#C9D2DC", borderLeft: "1px solid #2A3546" }}>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </>
  );
}
