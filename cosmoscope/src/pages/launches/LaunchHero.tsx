import { motion } from "framer-motion";
import { MapPin, Radio, ExternalLink, Rocket } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { getStatusColor, getStatusLabel, type Launch } from "./types";

interface Props {
  launch: Launch;
  onOpenDetail: (l: Launch) => void;
}

export function LaunchHero({ launch, onOpenDetail }: Props) {
  const sc = getStatusColor(launch.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ background: "#0a0a18", border: "1px solid rgba(79,195,247,0.18)" }}
    >
      {/* Background image / fallback */}
      <div className="absolute inset-0">
        {launch.image ? (
          <img
            src={launch.image}
            alt=""
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full" style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(79,195,247,0.18), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(156,39,176,0.15), transparent 60%), #0a0a18"
          }} />
        )}
        {/* Darkening gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(10,10,24,0.7) 0%, rgba(10,10,24,0.85) 50%, rgba(10,10,24,0.95) 100%)"
        }} />
        {/* Subtle starfield */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: "radial-gradient(1px 1px at 12% 24%, white, transparent), radial-gradient(1px 1px at 78% 60%, white, transparent), radial-gradient(1px 1px at 45% 80%, white, transparent), radial-gradient(1px 1px at 90% 15%, white, transparent), radial-gradient(1px 1px at 30% 55%, white, transparent)",
          backgroundSize: "200px 200px",
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 py-8 sm:py-10 flex flex-col items-center">
        {/* NEXT LAUNCH label */}
        <div className="flex items-center gap-2 mb-6">
          <Rocket className="w-3 h-3" style={{ color: "#4fc3f7" }} />
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#4fc3f7]/70 font-['Orbitron']">
            Next Launch
          </div>
        </div>

        {/* Countdown */}
        <CountdownTimer target={launch.netDate} size="hero" />

        {/* Status pill */}
        <motion.div
          className="mt-7 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium"
          style={{
            background: sc.bg,
            border: `1px solid ${sc.border}`,
            color: sc.text,
            boxShadow: launch.status === "Go" ? `0 0 24px ${sc.glow}` : "none",
          }}
          animate={launch.status === "Go" ? { boxShadow: [`0 0 16px ${sc.glow}`, `0 0 28px ${sc.glow}`, `0 0 16px ${sc.glow}`] } : {}}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.text }} />
          {getStatusLabel(launch.status)}
        </motion.div>

        {/* Mission info */}
        <div className="mt-7 text-center max-w-xl">
          <h2 className="text-xl sm:text-2xl text-white font-['Orbitron'] font-medium leading-tight">
            {launch.name}
          </h2>
          <div className="mt-2 text-sm" style={{ color: "#4fc3f7" }}>
            {launch.rocketName}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {launch.providerName}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/45">
            <MapPin className="w-3 h-3" />
            <span>{launch.padLocation}</span>
          </div>
        </div>

        {/* Live stream */}
        {launch.webcastLive && launch.videoUrls.length > 0 && (
          <a
            href={launch.videoUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ef5350, #c62828)", color: "white", boxShadow: "0 0 24px rgba(239,83,80,0.5)" }}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="relative inline-flex items-center">
              <motion.span
                className="absolute inline-block w-2 h-2 rounded-full bg-white"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="ml-3.5 tracking-wider text-xs">LIVE</span>
            </span>
            <span className="ml-1">Watch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Details button */}
        <button
          onClick={() => onOpenDetail(launch)}
          className="mt-5 text-xs text-white/45 hover:text-[#4fc3f7] transition-colors underline-offset-4 hover:underline"
        >
          View mission details
        </button>
      </div>
    </motion.div>
  );
}
