import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { getEventForToday } from "./spaceHistory";

export function ThisWeekInSpace() {
  const event = getEventForToday();
  const [m, d] = event.date.split("-").map(Number);
  const dateLabel = new Date(event.year, m - 1, d)
    .toLocaleDateString(undefined, { month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(50,40,30,0.4), rgba(20,15,10,0.85))",
        border: "1px solid rgba(255,213,79,0.15)",
        fontFamily: "'Crimson Pro', 'Georgia', serif",
      }}
    >
      {/* Subtle film grain */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, transparent 60%, #000 100%)" }} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3 text-[#ffd54f]/70" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#ffd54f]/70 font-['Orbitron']">
            On this day in space
          </div>
        </div>

        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span className="text-3xl font-['Orbitron'] font-medium text-[#ffd54f]">
            {event.year}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-white/40">{dateLabel}</span>
        </div>

        <h3 className="text-lg text-white/95 leading-tight mb-2 italic">
          {event.title}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}
