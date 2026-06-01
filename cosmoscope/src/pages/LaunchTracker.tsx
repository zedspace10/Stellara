import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { useLaunches } from "./launches/useLaunches";
import { LaunchHero } from "./launches/LaunchHero";
import { LaunchCard } from "./launches/LaunchCard";
import { LaunchDetail } from "./launches/LaunchDetail";
import { YearSummaryCard } from "./launches/YearSummaryCard";
import { computeYearSummary } from "./launches/yearSummary";
import type { Launch } from "./launches/types";

type Tab = "upcoming" | "previous";

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className="text-xs tracking-[0.35em] text-[#4fc3f7]/50 uppercase mb-5 font-['Orbitron']">
        The Space Devs · Launch Library
      </div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
        <Rocket className="w-7 h-7" style={{ color: "#ffd54f" }} />
      </motion.div>
      <div className="text-sm font-['Orbitron'] text-white/60 mt-5">Scanning for upcoming launches…</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className="text-lg font-['Orbitron'] text-white/50 mb-3">No launches found.</div>
      <p className="text-sm text-white/30 text-center max-w-sm">{message}</p>
      <button onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2.5 rounded-full text-sm border border-[#4fc3f7]/30 text-[#4fc3f7]/70 hover:text-[#4fc3f7] transition-colors">
        Try again
      </button>
    </div>
  );
}

export default function LaunchTracker() {
  const { upcoming, previous, loading, error, fromCache, cacheDate } = useLaunches();
  const [selected, setSelected] = useState<Launch | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");

  const yearSummary = useMemo(() => computeYearSummary(previous), [previous]);

  const nextLaunch = upcoming[0];
  const rest = upcoming.slice(1);
  const isLoading = loading && upcoming.length === 0 && previous.length === 0;
  const isEmpty = !loading && upcoming.length === 0 && previous.length === 0;

  return (
    <div className="relative w-full min-h-screen bg-[#020209] flex flex-col"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(2,2,9,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(79,195,247,0.1)" }}>
        <Link href="/" className="flex items-center gap-2 text-[#4fc3f7] hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> STELLARA
        </Link>
        <div className="text-center">
          <div className="text-xs font-['Orbitron'] text-white/70 tracking-[0.15em]">LAUNCH TRACKER</div>
          {fromCache && cacheDate && (
            <div className="text-[9px] text-white/25">Updated · {cacheDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          )}
        </div>
        <div className="w-16" />
      </div>

      {error && (upcoming.length > 0 || previous.length > 0) && (
        <div className="mx-4 mt-3 px-3 py-2 text-[11px] text-[#ffd54f]/70 rounded-lg max-w-3xl w-full sm:mx-auto"
          style={{ background: "rgba(255,213,79,0.05)", border: "1px solid rgba(255,213,79,0.15)" }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : isEmpty ? (
        <EmptyState message={error ?? "The Launch Library is quiet right now."} />
      ) : (
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6 max-w-3xl mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-1 rounded-full p-1 self-center mx-auto"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["upcoming", "previous"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className="px-5 py-1.5 text-[11px] uppercase tracking-[0.25em] rounded-full font-['Orbitron'] transition-all"
                style={{
                  background: tab === t ? "rgba(79,195,247,0.15)" : "transparent",
                  color: tab === t ? "#4fc3f7" : "rgba(255,255,255,0.4)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "upcoming" ? (
            <>
              {nextLaunch && <LaunchHero launch={nextLaunch} onOpenDetail={setSelected} />}
              {rest.length > 0 && (
                <div className="space-y-3">
                  <SectionHeader label="Upcoming" count={`${rest.length} missions`} />
                  <div className="space-y-2">
                    {rest.map((l, i) => (
                      <LaunchCard key={l.id} launch={l} onClick={setSelected} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <YearSummaryCard summary={yearSummary} />
              {previous.length > 0 ? (
                <div className="space-y-3">
                  <SectionHeader label="Previous" count={`${previous.length} recent`} />
                  <div className="space-y-2">
                    {previous.map((l, i) => (
                      <LaunchCard key={l.id} launch={l} onClick={setSelected} index={i} variant="previous" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-white/35">No recent launches in the cache yet.</div>
              )}
            </>
          )}

          <div className="text-center pt-4 pb-8 text-[10px] text-white/25">
            Launch data provided by The Space Devs · Launch Library 2
          </div>
        </div>
      )}

      <LaunchDetail launch={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 font-['Orbitron']">{label}</div>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
      <div className="text-[10px] text-white/35">{count}</div>
    </div>
  );
}
