import { motion } from "framer-motion";
import { MapPin, Rocket, CheckCircle2, XCircle } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import {
  getProviderColor,
  getStatusColor,
  formatLaunchTime,
  type Launch,
} from "./types";

interface Props {
  launch: Launch;
  onClick: (l: Launch) => void;
  index: number;
  variant?: "upcoming" | "previous";
}

export function LaunchCard({ launch, onClick, index, variant = "upcoming" }: Props) {
  const sc = getStatusColor(launch.status);
  const providerColor = getProviderColor(launch.providerName);
  const isPast = variant === "previous";
  const success = launch.status === "Success";
  const failed = launch.status === "Failure" || launch.status === "Partial Failure";

  return (
    <motion.button
      type="button"
      onClick={() => onClick(launch)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full text-left rounded-xl overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Rocket icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: `${providerColor}14`,
            border: `1px solid ${providerColor}40`,
          }}
        >
          <Rocket className="w-4 h-4" style={{ color: providerColor }} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm text-white font-medium truncate">{launch.name}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/45 mt-0.5">
            <span className="truncate">{launch.rocketName}</span>
            <span className="text-white/20">·</span>
            <span className="truncate">{launch.providerName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/35 mt-1">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{launch.padLocation}</span>
          </div>
        </div>

        {/* Right: outcome (past) or countdown (upcoming) */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {isPast ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
              {success && <CheckCircle2 className="w-3 h-3" style={{ color: sc.text }} />}
              {failed && <XCircle className="w-3 h-3" style={{ color: sc.text }} />}
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: sc.text }}>
                {success ? "Success" : failed ? (launch.status === "Partial Failure" ? "Partial" : "Failure") : launch.status}
              </span>
            </div>
          ) : (
            <>
              <CountdownTimer target={launch.netDate} size="compact" />
              <div className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                {launch.status}
              </div>
            </>
          )}
          <div className="text-[9px] text-white/30">{formatLaunchTime(launch.netDate)}</div>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${providerColor}08, transparent)`,
        }}
      />
    </motion.button>
  );
}
