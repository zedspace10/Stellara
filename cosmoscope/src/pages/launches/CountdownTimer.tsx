import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNow } from "./useNow";

interface Parts {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  past: boolean;
}

function computeParts(target: Date, now: number): Parts {
  const diff = target.getTime() - now;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  return { days, hours, mins, secs, past };
}

function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0");
}

interface Props {
  target: Date;
  size?: "hero" | "compact";
}

export function CountdownTimer({ target, size = "hero" }: Props) {
  const now = useNow();
  const parts = useMemo(() => computeParts(target, now), [target, now]);

  const cells: { label: string; value: string }[] = [
    { label: "Days", value: pad(parts.days, parts.days >= 100 ? 3 : 2) },
    { label: "Hours", value: pad(parts.hours) },
    { label: "Mins", value: pad(parts.mins) },
    { label: "Secs", value: pad(parts.secs) },
  ];

  if (size === "compact") {
    return (
      <div className="flex items-baseline gap-1.5 font-['Orbitron']">
        {parts.past && <span className="text-[10px] text-white/40 mr-1">T+</span>}
        {!parts.past && <span className="text-[10px] text-white/40 mr-1">T-</span>}
        <span className="text-sm tabular-nums" style={{ color: "#ffd54f" }}>
          {parts.days > 0 && `${parts.days}d `}
          {pad(parts.hours)}:{pad(parts.mins)}:{pad(parts.secs)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-3">
        {parts.past ? "Lifted Off" : "Launching In"}
      </div>
      <div className="flex items-stretch gap-2 sm:gap-3">
        {cells.map((c, i) => (
          <div key={c.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="relative font-['Orbitron'] font-bold tabular-nums leading-none"
                style={{
                  fontSize: "clamp(2.5rem, 11vw, 4rem)",
                  color: "#ffd54f",
                  textShadow: "0 0 24px rgba(255,213,79,0.35), 0 0 4px rgba(255,213,79,0.6)",
                  minWidth: "1.6em",
                  textAlign: "center",
                }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={c.value}
                    initial={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {c.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/45 mt-2">
                {c.label}
              </div>
            </div>
            {i < cells.length - 1 && (
              <div
                className="font-['Orbitron'] font-bold text-white/20 self-start mt-0 mx-0"
                style={{ fontSize: "clamp(2rem, 9vw, 3.2rem)", lineHeight: 1 }}
              >
                :
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
