import { X } from "lucide-react";
import { Link } from "wouter";
import { Pin, pinDistance, pinDate, isThisWeek, LATEST_PIN } from "@/data/pins";
import { PinImage } from "@/pages/Discoveries";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

// A weekly picture, opened from where it sits in the 3D universe. On a computer it sits on the
// left, below the Latest button and clear of the view's controls on the right and at the bottom;
// on phones it rises from the bottom, stopping short of the controls at the top.
export default function PinPanel({ pin, onClose }: { pin: Pin | null; onClose: () => void }) {
  if (!pin) return null;
  const isLatest = pin.id === LATEST_PIN.id;
  return (
    <div
      className="fixed md:absolute z-[45] left-3 right-3 bottom-[60px] md:right-auto md:left-4 md:bottom-auto md:top-[128px] md:w-[24rem] max-h-[50vh] md:max-h-[calc(100vh-290px)] rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#0A0F17", border: `1px solid ${RULE}`, boxShadow: "0 -8px 32px rgba(0,0,0,0.5)" }}
    >
      <div className="shrink-0 px-5 pt-4 pb-3 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className="min-w-0">
          <p className="m-0 text-[12px]" style={{ color: isLatest ? WARM : MUTED }}>
            {isLatest && isThisWeek(pin) ? "New this week" : pinDate(pin)}
          </p>
          <h2 className="m-0 mt-0.5 text-[24px] leading-tight" style={{ color: TEXT, fontWeight: 400 }}>{pin.title}</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: MUTED }}>{pin.object}, {pinDistance(pin)}</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>
      <div className="overflow-y-auto px-5 pt-4 pb-5">
        <PinImage pin={pin} />
        <p className="m-0 mt-4 text-[15px] leading-relaxed" style={{ color: BODY }}>{pin.body[0]}</p>
        {pin.mly >= 1000 && (
          <p className="m-0 mt-3 text-[13px] leading-relaxed" style={{ color: MUTED }}>
            Far beyond the rest of this view, so it is drawn at the edge, in its real direction.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
          <Link href={`/discoveries#${pin.id}`} className="underline underline-offset-4" style={{ color: "#A9C3E0" }}>Read the whole story</Link>
          {pin.simulation && (
            <Link href={`/simulations/${pin.simulation.id}`} className="underline underline-offset-4" style={{ color: "#A9C3E0" }}>{pin.simulation.label}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
