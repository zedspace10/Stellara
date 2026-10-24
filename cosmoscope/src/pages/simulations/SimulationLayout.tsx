import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface SimPhase {
  id: string;
  label: string;
  /** One or two words for the timeline under the simulation. */
  short?: string;
  timecode: string;
  description: string;
  scienceDetail: string;
  color: string;
}

interface Props {
  title: string;
  subtitle: string;
  phases: SimPhase[];
  currentPhaseIndex: number;
  totalProgress: number;
  isPlaying: boolean;
  scienceMode: boolean;
  speed: number;
  closingQuote?: string;
  closingAuthor?: string;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSpeedChange: (s: number) => void;
  onPhaseJump: (idx: number) => void;
  onScrub: (p: number) => void;
  onScienceModeToggle: () => void;
  children: ReactNode;
}

const SPEEDS = [0.25, 0.5, 1, 2, 5];

export default function SimulationLayout({
  title, subtitle, phases, currentPhaseIndex, totalProgress,
  isPlaying, scienceMode, speed, closingQuote, closingAuthor,
  onPlay, onPause, onRestart, onSpeedChange, onPhaseJump, onScrub,
  onScienceModeToggle, children
}: Props) {
  const phase = phases[currentPhaseIndex];
  const isEnd = currentPhaseIndex >= phases.length - 1 && totalProgress >= 0.99;

  return (
    <div className="h-[100dvh] bg-[#020209] text-[#e0e0e0] flex flex-col pt-14 pb-12 md:pt-16 md:pb-0">
      {/* Top bar */}
      <div className="relative z-40 flex items-center justify-between gap-3 px-4 py-2.5 border-b shrink-0" style={{ background: '#05070C', borderColor: '#1C2533' }}>
        <Link href="/simulations">
          <button className="text-[14px] whitespace-nowrap underline underline-offset-4 decoration-1 text-[#A3AFBC] hover:text-white transition-colors">
            All simulations
          </button>
        </Link>
        <div className="text-center">
          <div className="hidden sm:block font-serif text-[18px] text-[#E8ECF1] leading-tight">{title}</div>
        </div>
        <button
          onClick={onScienceModeToggle}
          aria-pressed={scienceMode}
          className={`text-[14px] whitespace-nowrap px-3 py-1 rounded-md border transition-colors ${
            scienceMode ? "border-[#A9C3E0] text-[#E8ECF1]" : "border-[#2A3546] text-[#A3AFBC] hover:text-white"
          }`}
        >
          {scienceMode ? "Less detail" : "More detail"}
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative min-h-0">
        {children}
        {/* Cinematic vignette — darkens edges to focus the centre */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)' }}
        />

        {/* Phase info overlay */}
        <motion.div
          key={currentPhaseIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-[22rem] pointer-events-none z-20"
        >
          <div className="rounded-lg p-4" style={{ background: 'rgba(5,7,12,0.88)', border: '1px solid #1C2533' }}>
            <div className="text-[13px] mb-1" style={{ color: '#8E9AA8' }}>
              Step {currentPhaseIndex + 1} of {phases.length}, {phase.timecode.charAt(0).toLowerCase() + phase.timecode.slice(1)}
            </div>
            <div className="font-serif text-[24px] leading-tight text-[#E8ECF1] mb-2">{phase.label}</div>
            <p className="m-0 text-[14px] text-[#C9D2DC] leading-relaxed">{phase.description}</p>
            {scienceMode && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="m-0 text-[13px] text-[#A3AFBC] mt-3 pt-3 border-t border-[#1C2533] leading-relaxed"
              >
                {phase.scienceDetail}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* End summary */}
        {isEnd && closingQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="rounded-lg p-8 max-w-lg text-center mx-4" style={{ background: 'rgba(5,7,12,0.9)', border: '1px solid #1C2533' }}>
              <div className="font-serif text-[#E8ECF1] text-[26px] leading-snug">
                {closingQuote}
              </div>
              {closingAuthor && (
                <div className="text-gray-400 text-sm">{closingAuthor}</div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="relative z-40 shrink-0 px-4 pt-2 pb-3" style={{ background: '#05070C', borderTop: '1px solid #1C2533' }}>
        {/* Phase markers timeline */}
        <div className="relative mb-2">
          <div className="flex justify-between mb-1">
            {phases.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onPhaseJump(i)}
                title={p.label}
                className={`text-xs font-sans transition-all ${
                  i === currentPhaseIndex ? "text-[#F3DDB0]" : "text-gray-600 hover:text-gray-400"
                }`}
                style={{ flex: 1, textAlign: "center" }}
              >
                ·
              </button>
            ))}
          </div>
          <Slider
            value={[Math.round(totalProgress * 1000)]}
            min={0}
            max={1000}
            step={1}
            onValueChange={([v]) => onScrub(v / 1000)}
            className="w-full"
          />
          <div className="flex justify-between mt-1 overflow-hidden">
            {phases.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onPhaseJump(i)}
                className={`text-[11px] truncate transition-colors px-0.5 ${
                  i === currentPhaseIndex ? "text-[#A9C3E0]" : "text-gray-600 hover:text-gray-400"
                }`}
                style={{ flex: 1, textAlign: "center" }}
              >
                {p.short ?? p.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onRestart} className="w-8 h-8 text-gray-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="icon" onClick={isPlaying ? onPause : onPlay}
              className="w-9 h-9 bg-[#A9C3E0] hover:bg-[#A9C3E0]/80 text-black rounded-full">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            {currentPhaseIndex < phases.length - 1 && (
              <Button size="icon" variant="ghost" onClick={() => onPhaseJump(currentPhaseIndex + 1)}
                className="w-8 h-8 text-gray-400 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`text-xs px-2 py-1 rounded-lg transition-all ${
                  speed === s
                    ? "text-[#A9C3E0] border"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              style={speed === s ? { background: 'rgba(169,195,224,0.18)', borderColor: 'rgba(169,195,224,0.55)', boxShadow: '0 0 12px rgba(169,195,224,0.18)' } : {}}
              >
                {s}×
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 tabular-nums min-w-[60px] text-right">
            {(totalProgress * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
