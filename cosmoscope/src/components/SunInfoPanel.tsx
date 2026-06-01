import React from "react";
import { X, Flame, Thermometer, Ruler, Clock, Star, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SunInfoPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SunInfoPanel({ open, onClose }: SunInfoPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col" style={{ maxHeight: '85vh' }}>
        <div
          className="rounded-t-2xl flex flex-col"
          style={{
            background: 'rgba(10,10,26,0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,213,79,0.2)',
            borderBottom: 'none',
            maxHeight: '85vh',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <SunContent onClose={onClose} />
        </div>
      </div>

      {/* Desktop: side panel */}
      <Card
        className="hidden md:flex fixed right-4 bottom-4 w-96 flex-col z-50 shadow-2xl overflow-hidden"
        style={{
          top: '220px',
          background: 'rgba(10,10,26,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,213,79,0.2)',
          boxShadow: '0 0 40px rgba(255,213,79,0.08)',
        }}
      >
        <SunContent onClose={onClose} />
      </Card>
    </>
  );
}

function SunContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Sticky header */}
      <div
        className="flex items-start justify-between px-5 pt-4 pb-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,213,79,0.15)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,213,79,0.12)', color: '#ffd54f', border: '1px solid rgba(255,213,79,0.3)' }}
            >
              Star · G-Type Main Sequence
            </span>
          </div>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'Orbitron, sans-serif', color: '#ffd54f' }}
          >
            The Sun
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-white/10 text-white/70 hover:text-white shrink-0 mt-1"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Sun illustration */}
      <div
        className="shrink-0 flex items-center justify-center py-6"
        style={{ background: 'linear-gradient(180deg, rgba(255,213,79,0.06) 0%, transparent 100%)' }}
      >
        <div className="relative">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,200,0,0.35) 0%, rgba(255,150,0,0.1) 50%, transparent 70%)',
              transform: 'scale(3.2)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,213,79,0.25) 0%, transparent 70%)',
              transform: 'scale(2.2)',
            }}
          />
          {/* Sun body */}
          <div
            className="w-24 h-24 rounded-full relative"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fff9c4 0%, #ffd54f 40%, #ff8f00 80%, #e65100 100%)',
              boxShadow: '0 0 30px rgba(255,213,79,0.5), 0 0 60px rgba(255,150,0,0.3)',
            }}
          >
            {/* Surface detail */}
            <div
              className="absolute inset-2 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle at 60% 40%, transparent 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 pb-10 space-y-5">
          {/* Stats grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Diameter', value: '1,392,700 km', icon: <Ruler className="w-3.5 h-3.5" /> },
                { label: 'Mass', value: '1.989 × 10³⁰ kg', icon: <Atom className="w-3.5 h-3.5" /> },
                { label: 'Surface Temp', value: '5,778 K', icon: <Thermometer className="w-3.5 h-3.5" /> },
                { label: 'Core Temp', value: '15,000,000 K', icon: <Flame className="w-3.5 h-3.5" /> },
                { label: 'Age', value: '4.6 billion yrs', icon: <Clock className="w-3.5 h-3.5" /> },
                { label: 'Dist. from Earth', value: '149.6 million km', icon: <Ruler className="w-3.5 h-3.5" /> },
                { label: 'Rotation Period', value: '25–35 days', icon: <Clock className="w-3.5 h-3.5" /> },
                { label: 'Planets', value: '8', icon: <Star className="w-3.5 h-3.5" /> },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5 text-[#ffd54f] mb-1">
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white leading-tight">{s.value}</span>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-3 mt-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Composition</div>
              <span className="text-sm font-semibold text-white">73% Hydrogen · 25% Helium · 2% Other</span>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">About</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              The Sun is the star at the centre of our Solar System — a nearly perfect sphere of hot plasma generating
              energy through nuclear fusion in its core. Every second it converts 600 million tonnes of hydrogen into
              helium, releasing the energy that makes life on Earth possible. It accounts for 99.8% of the total mass
              of the Solar System.
            </p>
          </div>

          {/* Notable facts */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Notable Facts</h3>
            <div className="space-y-2">
              {[
                'Light from the Sun takes exactly 8 minutes and 20 seconds to reach Earth.',
                'The Sun is so large that 1.3 million Earths could fit inside it.',
                "The Sun's corona reaches 1,000,000°C — paradoxically hotter than the surface at 5,778K.",
              ].map((fact, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,213,79,0.05)', border: '1px solid rgba(255,213,79,0.1)' }}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: 'rgba(255,213,79,0.15)', color: '#ffd54f' }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{fact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scale comparison */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(79,195,247,0.05)', border: '1px solid rgba(79,195,247,0.15)' }}
          >
            <div className="flex items-center gap-2 text-[#4fc3f7] mb-2 text-xs font-semibold uppercase tracking-wider">
              <Ruler className="w-3.5 h-3.5" /> Scale Comparison
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              If the Sun were the size of a front door, Earth would be a 2p coin sitting 26 metres away.
            </p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
