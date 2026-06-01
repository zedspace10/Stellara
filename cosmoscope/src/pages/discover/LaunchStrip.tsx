import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, ChevronRight } from "lucide-react";
import { useLaunches } from "../launches/useLaunches";
import { CountdownTimer } from "../launches/CountdownTimer";
import { getProviderColor, getStatusColor, getStatusLabel } from "../launches/types";

export function LaunchStrip() {
  const { upcoming, loading } = useLaunches();
  const next = upcoming[0];

  if (loading || !next) {
    return (
      <Link href="/launches" className="block rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <Rocket className="w-4 h-4 text-white/30" />
          <span className="text-xs text-white/40">Loading next launch…</span>
        </div>
      </Link>
    );
  }

  const sc = getStatusColor(next.status);
  const providerColor = getProviderColor(next.providerName);

  return (
    <Link href="/launches" className="block group">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, rgba(255,213,79,0.05), rgba(79,195,247,0.04))",
          border: "1px solid rgba(255,213,79,0.18)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${providerColor}40` }}>
            <Rocket className="w-4 h-4" style={{ color: providerColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[9px] uppercase tracking-wider text-[#ffd54f]/70 font-['Orbitron']">
                Next launch
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                <span className="w-1 h-1 rounded-full" style={{ background: sc.text }} />
                {getStatusLabel(next.status)}
              </span>
            </div>
            <div className="text-sm text-white truncate mt-0.5">{next.name}</div>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <CountdownTimer target={next.netDate} size="compact" />
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#4fc3f7] transition-colors flex-shrink-0" />
        </div>
        {/* Mobile countdown below */}
        <div className="sm:hidden mt-2 pt-2 border-t border-white/5 flex justify-center">
          <CountdownTimer target={next.netDate} size="compact" />
        </div>
      </motion.div>
    </Link>
  );
}
