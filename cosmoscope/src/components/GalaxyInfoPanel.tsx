import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { galaxyObjects } from "@/data/galaxyObjects";

export interface LiveFact {
  label: string;
  value: string;
}

interface GalaxyInfoPanelProps {
  objectId: string | null;
  onClose: () => void;
  /** Figures worked out for the date on screen, such as today's distance. They replace the fixed distance row. */
  liveFacts?: LiveFact[];
  action?: { label: string; onClick: () => void };
}

export default function GalaxyInfoPanel({ objectId, onClose, liveFacts, action }: GalaxyInfoPanelProps) {
  if (!objectId) return null;

  const object = galaxyObjects.find((o) => o.id === objectId);
  if (!object) return null;

  const rows: [string, string][] = [
    ...(liveFacts && liveFacts.length > 0
      ? liveFacts.map((f) => [f.label, f.value] as [string, string])
      : [["Distance", object.distance] as [string, string]]),
    ["Size", object.size],
    [object.type === "Spacecraft" ? "Launched" : "Discovered", object.discovery],
  ];

  return (
    <div
      className="absolute right-4 w-[22rem] max-w-[calc(100vw-2rem)] z-40 flex flex-col rounded-xl overflow-hidden"
      style={{ top: "220px", maxHeight: "calc(100vh - 240px)", background: "#0A0F17", border: "1px solid #1C2533" }}
    >
      <div className="shrink-0 px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: "1px solid #1C2533" }}>
        <div className="min-w-0">
          <h2 className="m-0 text-[26px] leading-tight" style={{ color: "#E8ECF1", fontWeight: 400 }}>{object.name}</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: "#8E9AA8" }}>{object.type}</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: "#8E9AA8" }} />
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 pt-4 pb-6">
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>{object.description}</p>

          {action && (
            <button
              onClick={action.onClick}
              className="mt-4 w-full rounded-md py-2 text-[14px] font-medium transition-opacity hover:opacity-90"
              style={{ background: "#E8ECF1", color: "#05070C" }}
            >
              {action.label}
            </button>
          )}

          <dl className="m-0 mt-6">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2" style={{ borderTop: "1px solid #161E2A" }}>
                <dt className="text-[14px] shrink-0" style={{ color: "#8E9AA8" }}>{label}</dt>
                <dd className="m-0 text-[14px] text-right tabular-nums" style={{ color: "#E8ECF1" }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </ScrollArea>
    </div>
  );
}
