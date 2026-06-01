import React, { useState } from "react";
import { Link } from "wouter";
import { Eye, Moon, Star, Telescope, Clock, CloudSun, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

function getMoonPhase(date: Date): { name: string; icon: string; illumination: number } {
  const synodicMonth = 29.53058867;
  const knownNew = new Date("2000-01-06T18:14:00Z");
  const diff = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const illum = Math.round((1 - Math.cos((phase / synodicMonth) * 2 * Math.PI)) / 2 * 100);
  if (phase < 1.85)   return { name: "New Moon", icon: "🌑", illumination: illum };
  if (phase < 7.38)   return { name: "Waxing Crescent", icon: "🌒", illumination: illum };
  if (phase < 9.22)   return { name: "First Quarter", icon: "🌓", illumination: illum };
  if (phase < 14.77)  return { name: "Waxing Gibbous", icon: "🌔", illumination: illum };
  if (phase < 16.61)  return { name: "Full Moon", icon: "🌕", illumination: illum };
  if (phase < 22.15)  return { name: "Waning Gibbous", icon: "🌖", illumination: illum };
  if (phase < 23.99)  return { name: "Last Quarter", icon: "🌗", illumination: illum };
  if (phase < 29.53)  return { name: "Waning Crescent", icon: "🌘", illumination: illum };
  return { name: "New Moon", icon: "🌑", illumination: illum };
}

function getSeeingConditions(phase: ReturnType<typeof getMoonPhase>): { stars: number; label: string } {
  const month = new Date().getMonth();
  const summer = month >= 4 && month <= 8;
  let stars = 4;
  if (phase.illumination > 80) stars -= 2;
  else if (phase.illumination > 50) stars -= 1;
  if (summer) stars -= 1;
  stars = Math.max(1, Math.min(5, stars));
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return { stars, label: labels[stars] };
}

const VISIBLE_PLANETS = [
  { name: "Venus", color: "#e8cda0", direction: "W", time: "Dusk", magnitude: -4.4, desc: "Bright beacon in the west after sunset" },
  { name: "Mars", color: "#c1440e", direction: "SE", time: "Late evening", magnitude: 0.8, desc: "Reddish glow in the south-east" },
  { name: "Jupiter", color: "#c88b3a", direction: "S", time: "Midnight", magnitude: -2.2, desc: "Brightest object in the south after midnight" },
  { name: "Saturn", color: "#e4d191", direction: "SW", time: "Evening", magnitude: 0.6, desc: "Golden-hued near the south-west" },
];

const UPCOMING_EVENTS = [
  { date: "Tomorrow", event: "ISS visible pass", time: "22:14", desc: "Magnitude -3.6, visible for 6 minutes, SE to NW" },
  { date: "In 3 days", event: "Jupiter at opposition", time: "All night", desc: "Jupiter at its closest and brightest this year" },
  { date: "In 5 days", event: "Perseid Meteor Shower peak", time: "After midnight", desc: "Up to 100 meteors/hour under ideal conditions" },
  { date: "In 7 days", event: "Conjunction: Moon & Venus", time: "Dusk", desc: "Moon passes 2° from Venus — beautiful pair in the west" },
];

export default function Observatory() {
  const [now] = useState(() => new Date());
  const moon = getMoonPhase(now);
  const seeing = getSeeingConditions(moon);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className="min-h-screen pt-20 pb-32 md:pb-8"
      style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-10 text-center">
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{dateStr}</p>
        <h1
          className="text-4xl md:text-5xl font-light text-white mb-2"
          style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.05em" }}
        >
          {greeting}.
        </h1>
        <p className="text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>Here is tonight's sky.</p>
      </div>

      <div className="max-w-2xl mx-auto px-5 space-y-4">
        {/* Moon */}
        <Section icon={<Moon className="w-4 h-4" />} title="The Moon Tonight" color="#c0c0d0">
          <div className="flex items-center gap-6">
            <div className="text-6xl">{moon.icon}</div>
            <div>
              <div className="text-xl font-semibold text-white mb-1">{moon.name}</div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {moon.illumination}% illuminated
              </div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {moon.illumination > 50 ? "Bright — best targets are star clusters, planets" : "Dark skies — ideal for deep sky objects"}
              </div>
            </div>
          </div>
        </Section>

        {/* Seeing conditions */}
        <Section icon={<Eye className="w-4 h-4" />} title="Seeing Conditions" color="#4fc3f7">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-5 h-5"
                  style={{ color: s <= seeing.stars ? "#ffd54f" : "rgba(255,255,255,0.15)" }}
                  fill={s <= seeing.stars ? "#ffd54f" : "none"}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-white">{seeing.label}</span>
          </div>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            {seeing.stars >= 4
              ? "Excellent night for deep sky objects and planetary detail."
              : seeing.stars === 3
              ? "Good conditions. Planets and bright clusters will be satisfying."
              : seeing.stars === 2
              ? "Moonlight reducing contrast. Stick to bright targets."
              : "Challenging tonight. Focus on the planets and Moon."}
          </p>
        </Section>

        {/* Visible planets */}
        <Section icon={<CloudSun className="w-4 h-4" />} title="Visible Planets" color="#9c27b0">
          <div className="space-y-3">
            {VISIBLE_PLANETS.map((p) => (
              <div key={p.name} className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {p.direction} · {p.time} · mag {p.magnitude}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Featured object */}
        <Section icon={<Telescope className="w-4 h-4" />} title="Featured Object Tonight" color="#ffd54f" accent>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-white">Jupiter</span>
              <span className="text-sm" style={{ color: "rgba(255,213,79,0.6)" }}>Gas Giant · Near opposition</span>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              Jupiter is near opposition — the best time of year to observe it. Through any telescope you'll see
              the equatorial cloud bands and, with steady seeing, the Great Red Spot. The four Galilean moons
              are visible as tiny dots even in binoculars.
            </p>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              Direction: South · Best time: After midnight · Magnitude: −2.2
            </p>
            <Link href="/">
              <button
                className="text-sm flex items-center gap-1 transition-colors"
                style={{ color: "#ffd54f" }}
              >
                View Jupiter in the Interactive Universe <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </Section>

        {/* Upcoming events */}
        <Section icon={<Clock className="w-4 h-4" />} title="Next 7 Days" color="#4fc3f7">
          <div className="space-y-3">
            {UPCOMING_EVENTS.map((e, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl p-3"
                style={{ background: "rgba(79,195,247,0.05)", border: "1px solid rgba(79,195,247,0.1)" }}
              >
                <div className="shrink-0 text-right" style={{ minWidth: "68px" }}>
                  <div className="text-xs font-semibold" style={{ color: "#4fc3f7" }}>{e.date}</div>
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{e.time}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{e.event}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="pt-4 pb-8 flex justify-center">
          <Link href="/">
            <Button
              size="lg"
              className="gap-2 px-8 font-semibold"
              style={{
                background: "linear-gradient(135deg, #ffd54f 0%, #ff8f00 100%)",
                color: "#0a0a1a",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "13px",
                letterSpacing: "0.05em",
                boxShadow: "0 0 30px rgba(255,213,79,0.3)",
              }}
            >
              <Telescope className="w-4 h-4" />
              Open Interactive Universe
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Section({
  icon,
  title,
  color,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: accent ? `rgba(255,213,79,0.04)` : "rgba(255,255,255,0.03)",
        border: `1px solid ${accent ? "rgba(255,213,79,0.15)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color }}>{icon}</span>
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
