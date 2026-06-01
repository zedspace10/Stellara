import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, FlaskConical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface SimPhase {
  id: string;
  label: string;
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
    <div className="min-h-screen bg-[#020209] text-[#e0e0e0] flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b" style={{ background: 'rgba(10,10,26,0.75)', backdropFilter: 'blur(20px)', borderColor: 'rgba(79,195,247,0.18)' }}>
        <Link href="/simulations">
          <button className="flex items-center gap-2 text-sm text-[#4fc3f7] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Simulations
          </button>
        </Link>
        <div className="text-center">
          <div className="text-xs text-[#9c27b0] font-['Orbitron'] tracking-widest uppercase">STELLARA Simulations</div>
          <div className="text-sm font-bold font-['Orbitron'] text-white">{title}</div>
        </div>
        <button
          onClick={onScienceModeToggle}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            scienceMode
              ? "bg-[#4fc3f7]/20 border-[#4fc3f7] text-[#4fc3f7]"
              : "bg-white/5 border-white/20 text-gray-400 hover:border-white/40"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Science Mode
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative mt-[52px]">
        {children}
        {/* Cinematic vignette — darkens edges to focus the centre */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)' }}
        />

        {/* Phase info overlay */}
        <motion.div
          key={currentPhaseIndex}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-4 left-4 max-w-xs pointer-events-none"
        >
          <div className="rounded-2xl p-4" style={{ background: 'rgba(10,10,26,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(79,195,247,0.18)' }}>
            <div className="text-xs font-['Orbitron'] tracking-widest mb-1" style={{ color: phase.color }}>
              PHASE {currentPhaseIndex + 1}/{phases.length}
            </div>
            <div className="text-base font-bold text-white mb-1">{phase.label}</div>
            <div className="text-xs text-[#4fc3f7]/80 mb-2 font-mono">{phase.timecode}</div>
            <p className="text-xs text-gray-300 leading-relaxed">{phase.description}</p>
            {scienceMode && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-[#9c27b0]/90 mt-2 pt-2 border-t border-white/10 leading-relaxed"
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
            <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-[#ffd54f]/20 p-8 max-w-lg text-center mx-4">
              <div className="text-[#ffd54f] text-lg font-light italic leading-relaxed mb-4">
                "{closingQuote}"
              </div>
              {closingAuthor && (
                <div className="text-gray-400 text-sm">— {closingAuthor}</div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-3" style={{ background: 'rgba(10,10,26,0.80)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(79,195,247,0.18)' }}>
        {/* Phase markers timeline */}
        <div className="relative mb-2">
          <div className="flex justify-between mb-1">
            {phases.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onPhaseJump(i)}
                title={p.label}
                className={`text-[10px] font-['Orbitron'] transition-all ${
                  i === currentPhaseIndex ? "text-[#ffd54f]" : "text-gray-600 hover:text-gray-400"
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
                className={`text-[9px] truncate transition-colors px-0.5 ${
                  i === currentPhaseIndex ? "text-[#4fc3f7]" : "text-gray-600 hover:text-gray-400"
                }`}
                style={{ flex: 1, textAlign: "center" }}
              >
                {p.label.split(" ")[0]}
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
              className="w-9 h-9 bg-[#4fc3f7] hover:bg-[#4fc3f7]/80 text-black rounded-full">
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
                    ? "text-[#4fc3f7] border"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              style={speed === s ? { background: 'rgba(79,195,247,0.18)', borderColor: 'rgba(79,195,247,0.55)', boxShadow: '0 0 12px rgba(79,195,247,0.18)' } : {}}
              >
                {s}×
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 font-mono min-w-[60px] text-right">
            {(totalProgress * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
