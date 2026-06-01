import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { YearSummary } from "./yearSummary";

interface Props { summary: YearSummary }

export function YearSummaryCard({ summary }: Props) {
  if (summary.total === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(79,195,247,0.06), rgba(156,39,176,0.05))",
        border: "1px solid rgba(79,195,247,0.18)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-3 h-3 text-[#4fc3f7]" />
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#4fc3f7]/80 font-['Orbitron']">
          This Year in Launches · {summary.year}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total" value={summary.total} color="#ffffff" />
        <Stat label="Success" value={summary.success} color="#81c784" />
        <Stat label="Failure" value={summary.failure} color="#ef9a9a" />
        <Stat label="Crewed" value={summary.crewed} color="#ffd54f" />
      </div>
      {summary.topProvider && (
        <div className="mt-3 pt-3 text-[10px] text-white/45 border-t border-white/5">
          Most active provider:{" "}
          <span className="text-white/80 font-medium">{summary.topProvider}</span>{" "}
          <span className="text-white/40">· {summary.topProviderCount} launches</span>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-['Orbitron'] font-medium tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[9px] tracking-wider uppercase text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
