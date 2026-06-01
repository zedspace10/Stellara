import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Radio, ExternalLink, Rocket, Target, Building2, CheckCircle2, XCircle } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { getRocketDescription } from "./rocketInfo";
import {
  getStatusColor,
  getStatusLabel,
  formatLaunchTime,
  type Launch,
} from "./types";

interface Props {
  launch: Launch | null;
  onClose: () => void;
}

export function LaunchDetail({ launch, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus management + Escape to close
  useEffect(() => {
    if (!launch) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus into the panel
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      (first ?? panelRef.current)?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    // Lock body scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [launch, onClose]);

  return (
    <AnimatePresence>
      {launch && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(2,2,9,0.7)", backdropFilter: "blur(8px)" }}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            key={launch.id}
            role="dialog"
            aria-modal="true"
            aria-labelledby="launch-detail-title"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md overflow-y-auto outline-none"
            style={{ background: "#050511", borderLeft: "1px solid rgba(79,195,247,0.15)" }}
          >
            <DetailBody launch={launch} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailBody({ launch, onClose }: { launch: Launch; onClose: () => void }) {
  const sc = getStatusColor(launch.status);
  const isUpcoming = launch.netDate.getTime() > Date.now();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero image */}
      <div className="relative w-full h-56 overflow-hidden flex-shrink-0">
        {launch.image ? (
          <img
            src={launch.image}
            alt={launch.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full" style={{
            background: "radial-gradient(ellipse at center, rgba(79,195,247,0.2), transparent 70%), #0a0a18"
          }} />
        )}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(5,5,17,0.4) 0%, rgba(5,5,17,0.95) 100%)"
        }} />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status pill on image */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium"
          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, backdropFilter: "blur(8px)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.text }} />
          {getStatusLabel(launch.status)}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-6 space-y-6">
        {/* Name */}
        <div>
          <h2 id="launch-detail-title" className="text-xl text-white font-['Orbitron'] font-medium leading-tight">
            {launch.name}
          </h2>
          <div className="text-sm mt-1" style={{ color: "#4fc3f7" }}>{launch.rocketName}</div>
        </div>

        {/* Countdown if upcoming */}
        {isUpcoming && (
          <div className="py-4 rounded-xl flex justify-center"
            style={{ background: "rgba(255,213,79,0.04)", border: "1px solid rgba(255,213,79,0.15)" }}>
            <CountdownTimer target={launch.netDate} size="hero" />
          </div>
        )}

        {/* Live stream / webcast */}
        {isUpcoming && launch.webcastLive && launch.videoUrls.length > 0 ? (
          <a
            href={launch.videoUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #ef5350, #c62828)", color: "white" }}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="relative inline-flex items-center">
              <motion.span className="absolute inline-block w-2 h-2 rounded-full bg-white"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="ml-3.5 tracking-wider text-xs">LIVE</span>
            </span>
            <span className="ml-1">Watch Stream</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : isUpcoming && launch.videoUrls.length > 0 ? (
          <a href={launch.videoUrls[0]} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl text-xs"
            style={{ background: "rgba(79,195,247,0.06)", border: "1px solid rgba(79,195,247,0.2)", color: "#4fc3f7" }}>
            <span className="flex items-center gap-2"><Radio className="w-3 h-3" /> Stream starts ~30 minutes before launch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}

        {/* Past launch outcome */}
        {!isUpcoming && (launch.status === "Success" || launch.status === "Failure" || launch.status === "Partial Failure") && (
          <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
            style={{
              background: launch.status === "Success" ? "rgba(102,187,106,0.06)" : "rgba(239,83,80,0.06)",
              border: `1px solid ${launch.status === "Success" ? "rgba(102,187,106,0.25)" : "rgba(239,83,80,0.25)"}`,
            }}>
            {launch.status === "Success"
              ? <CheckCircle2 className="w-4 h-4 text-[#81c784] flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-[#ef9a9a] flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.25em] font-['Orbitron'] mb-1"
                style={{ color: launch.status === "Success" ? "#81c784" : "#ef9a9a" }}>
                {launch.status === "Success" ? "Mission Successful" : launch.status === "Partial Failure" ? "Partial Failure" : "Mission Failure"}
              </div>
              <div className="text-xs text-white/65 leading-relaxed">
                {launch.statusDescription || (launch.status === "Success"
                  ? `${launch.rocketName} successfully delivered its payload to ${launch.orbitName ?? "orbit"}.`
                  : `The mission did not achieve its planned objectives.`)}
              </div>
            </div>
          </div>
        )}

        {/* Mission section */}
        {(launch.missionDescription || launch.missionType) && (
          <div className="space-y-3">
            <SectionTitle icon={<Target className="w-3 h-3" />} label="Mission" />
            {launch.missionType && (
              <div className="inline-block text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgba(79,195,247,0.1)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.25)" }}>
                {launch.missionType}
              </div>
            )}
            {launch.missionDescription && (
              <p className="text-sm text-white/65 leading-relaxed">
                {launch.missionDescription}
              </p>
            )}
          </div>
        )}

        {/* Rocket section */}
        <div className="space-y-3">
          <SectionTitle icon={<Rocket className="w-3 h-3" />} label="Rocket" />
          <div className="rounded-xl px-4 py-3.5"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <div className="text-sm text-white font-medium">{launch.rocketName}</div>
              <div className="text-[10px] text-white/40">{launch.providerName}</div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              {getRocketDescription(launch.rocketName, launch.providerName)}
            </p>
          </div>
        </div>

        {/* Launch site + details */}
        <div className="space-y-3">
          <SectionTitle icon={<MapPin className="w-3 h-3" />} label="Launch Site & Window" />
          <div className="grid grid-cols-2 gap-3">
            {launch.orbitName && <Stat icon={<Target className="w-3 h-3" />} label="Destination" value={launch.orbitName} />}
            <Stat icon={<Building2 className="w-3 h-3" />} label="Provider" value={launch.providerName} fullWidth={!launch.orbitName} />
            <Stat icon={<MapPin className="w-3 h-3" />} label="Launch Site" value={launch.padLocation} fullWidth />
            <Stat icon={<Calendar className="w-3 h-3" />} label="Launch Time (local)" value={formatLaunchTime(launch.netDate)} fullWidth />
          </div>
        </div>

        {/* Status note */}
        {launch.statusDescription && (
          <div className="text-[11px] text-white/45 leading-relaxed italic px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {launch.statusDescription}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/35 font-['Orbitron']">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Stat({ icon, label, value, fullWidth }: { icon: React.ReactNode; label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? "col-span-2" : ""} rounded-lg px-3 py-2.5`}
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 mb-1">
        {icon}<span>{label}</span>
      </div>
      <div className="text-xs text-white/80">{value}</div>
    </div>
  );
}
