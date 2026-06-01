import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

const TOPICS = [
  {
    id: "what-is",
    title: "What Is a Black Hole?",
    icon: "⚫",
    color: "#4fc3f7",
    teaser: "A region of spacetime where gravity is so strong that nothing — not even light — can escape.",
    keyFact: "The first black hole ever photographed: M87*, imaged in 2019 by the Event Horizon Telescope.",
    content: [
      { label: "Stellar mass", value: "3–20 × the Sun's mass" },
      { label: "Supermassive", value: "Millions to billions × the Sun" },
      { label: "Event horizon", value: "The point of no return" },
      { label: "Singularity", value: "Where our physics breaks down" },
    ],
    about: "Black holes form when massive stars collapse under their own gravity at the end of their lives. The result is an object so dense that spacetime curves in on itself. Nothing that crosses the event horizon can ever return — including light.",
    askTopic: "black holes",
  },
  {
    id: "inside",
    title: "Inside a Black Hole",
    icon: "🌀",
    color: "#9c27b0",
    teaser: "What actually happens to you as you fall in? The answer is stranger than any science fiction.",
    keyFact: "Spaghettification: tidal forces stretch infalling matter into long, thin strands before the singularity.",
    content: [
      { label: "Approach", value: "Time slows for outside observers" },
      { label: "Crossing horizon", value: "You may not notice the moment" },
      { label: "Spaghettification", value: "Tidal forces stretch matter" },
      { label: "Singularity", value: "Unknown — physics fails here" },
    ],
    about: "From outside, you never see someone reach the event horizon — time dilation stretches the image forever. But from inside the infalling perspective, the crossing happens in finite time. What follows is profound uncertainty: the singularity represents the edge of what physics can describe.",
    askTopic: "what happens inside a black hole",
  },
  {
    id: "gravitational-waves",
    title: "Gravitational Waves",
    icon: "〰️",
    color: "#4caf50",
    teaser: "Ripples in the fabric of spacetime itself — predicted by Einstein in 1916, detected in 2015.",
    keyFact: "The first detection in September 2015 came from two black holes merging 1.3 billion light years away.",
    content: [
      { label: "Predicted", value: "Einstein, 1916" },
      { label: "First detected", value: "LIGO, September 2015" },
      { label: "Source", value: "Merging black holes & neutron stars" },
      { label: "Future", value: "LISA — a space-based detector" },
    ],
    about: "When two black holes spiral together and merge, they send ripples through spacetime at the speed of light. LIGO detected these ripples — smaller than a proton — using lasers 4km long. Each detection is a new way of listening to the universe.",
    askTopic: "gravitational waves",
  },
  {
    id: "general-relativity",
    title: "General Relativity",
    icon: "🕸️",
    color: "#ff9800",
    teaser: "Einstein's masterpiece: mass curves spacetime, and curved spacetime tells matter how to move.",
    keyFact: "GPS satellites must correct for relativistic time dilation or navigation errors would grow by 11km per day.",
    content: [
      { label: "Core idea", value: "Mass curves spacetime" },
      { label: "Equivalence", value: "Gravity = acceleration" },
      { label: "Confirmed", value: "Solar eclipse, 1919" },
      { label: "Gravitational lensing", value: "Light bends around mass" },
    ],
    about: "Before Einstein, gravity was a force acting at a distance. After Einstein, gravity is the geometry of spacetime itself. Massive objects warp the fabric around them, and other objects follow those curves — what we experience as gravity.",
    askTopic: "general relativity",
  },
  {
    id: "hawking-radiation",
    title: "Hawking Radiation",
    icon: "✨",
    color: "#ffd54f",
    teaser: "Black holes aren't perfectly black. Quantum mechanics says they slowly evaporate — over unimaginable timescales.",
    keyFact: "A stellar black hole takes 10⁶⁷ years to evaporate. The universe is only 1.38 × 10¹⁰ years old.",
    content: [
      { label: "Mechanism", value: "Quantum pairs at the horizon" },
      { label: "Temperature", value: "Inversely proportional to mass" },
      { label: "Evaporation", value: "10⁶⁷ years for stellar mass" },
      { label: "Paradox", value: "What happens to the information?" },
    ],
    about: "Near the event horizon, quantum mechanics allows particle-antiparticle pairs to briefly appear. When one falls in and one escapes, the black hole loses mass. Over incomprehensible timescales, it evaporates entirely — but what happens to the information about everything that fell in?",
    askTopic: "Hawking radiation",
  },
  {
    id: "real-black-holes",
    title: "Real Black Holes",
    icon: "🔭",
    color: "#ef5350",
    teaser: "Two real black holes have been photographed. Both images rewrote the textbooks.",
    keyFact: "Sagittarius A* — the Milky Way's central black hole — is 4 million solar masses and 26,000 light years away.",
    content: [
      { label: "M87*", value: "6.5 billion M☉ · imaged 2019" },
      { label: "Sgr A*", value: "4 million M☉ · imaged 2022" },
      { label: "EHT", value: "A planet-sized radio telescope" },
      { label: "What we see", value: "Glowing gas, not the hole itself" },
    ],
    about: "The Event Horizon Telescope links radio dishes across Earth into a single planet-sized observatory. The glowing ring in the images is superheated gas spiralling into the black hole — the dark centre is the shadow of the event horizon, the first direct evidence of their existence.",
    askTopic: "the Event Horizon Telescope and black hole images",
  },
  {
    id: "wormholes",
    title: "Wormholes",
    icon: "🕳️",
    color: "#ab47bc",
    teaser: "Einstein-Rosen bridges: tunnels through spacetime connecting two distant points. Theoretically possible. Physically, unknown.",
    keyFact: "The ER=EPR conjecture suggests wormholes and quantum entanglement may be the same phenomenon.",
    content: [
      { label: "Theory", value: "Einstein & Rosen, 1935" },
      { label: "Stability", value: "Requires exotic matter" },
      { label: "Traversable?", value: "Kip Thorne showed possibly yes" },
      { label: "ER=EPR", value: "Wormholes = entanglement?" },
    ],
    about: "General relativity permits wormholes — tunnels connecting two points in spacetime — but keeping one open would require exotic matter with negative energy. Kip Thorne's work showed traversable wormholes are not forbidden by physics. Whether they exist in nature is unknown.",
    askTopic: "wormholes",
  },
  {
    id: "time-dilation",
    title: "Time Dilation",
    icon: "⏱️",
    color: "#26c6da",
    teaser: "Time is not constant. Near massive objects, time runs slower. This isn't theory — it's measured every day in GPS systems.",
    keyFact: "ISS astronauts age fractionally slower than people on Earth — about 0.007 seconds per 6-month mission.",
    content: [
      { label: "GPS correction", value: "+38 microseconds per day" },
      { label: "ISS effect", value: "0.007s slower per 6 months" },
      { label: "Event horizon", value: "Time effectively stops" },
      { label: "Twin paradox", value: "Moving twin ages slower" },
    ],
    about: "The closer you are to a massive object, the slower time flows for you relative to someone further away. This isn't just theory — GPS satellites run fast by 38 microseconds per day because of reduced gravity, and must be corrected or navigation drifts by kilometres.",
    askTopic: "time dilation",
    interactive: true,
  },
];

function TimeDilationCalc() {
  const [massRatio, setMassRatio] = useState(1);
  const [dist, setDist] = useState(10);

  const schwarzschild = 2 * 1.485e-27 * massRatio * 1.989e30 / (9e16);
  const rs = schwarzschild * 1e3;
  const distM = dist * rs;
  const dilation = Math.sqrt(1 - rs / distM);

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#4fc3f7", fontFamily: "Orbitron, sans-serif" }}>
        GRAVITATIONAL TIME DILATION
      </p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>Black hole mass</span>
            <span style={{ color: "#ffd54f" }}>{massRatio}× Sun</span>
          </div>
          <input
            type="range"
            min={1}
            max={1000}
            value={massRatio}
            onChange={(e) => setMassRatio(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>Distance from horizon</span>
            <span style={{ color: "#ffd54f" }}>{dist}× Schwarzschild radius</span>
          </div>
          <input
            type="range"
            min={2}
            max={50}
            value={dist}
            onChange={(e) => setDist(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
        </div>
        <div className="text-center pt-2">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Time runs at</p>
          <p className="text-2xl font-bold" style={{ color: "#ffd54f", fontFamily: "Orbitron, sans-serif" }}>
            {(dilation * 100).toFixed(4)}%
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>of normal speed at this location</p>
        </div>
      </div>
    </div>
  );
}

function SchwarzchildCalc() {
  const [mass, setMass] = useState(1);
  const rs = (2 * 6.674e-11 * mass * 1.989e30) / (9e16);
  const rskm = rs / 1000;
  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#4fc3f7", fontFamily: "Orbitron, sans-serif" }}>
        SCHWARZSCHILD RADIUS CALCULATOR
      </p>
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span>Stellar mass</span>
          <span style={{ color: "#ffd54f" }}>{mass}× Sun</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={mass}
          onChange={(e) => setMass(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
      </div>
      <div className="text-center mt-3">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Event horizon radius</p>
        <p className="text-2xl font-bold" style={{ color: "#4fc3f7", fontFamily: "Orbitron, sans-serif" }}>
          {rskm < 1 ? `${(rskm * 1000).toFixed(0)} m` : `${rskm.toFixed(1)} km`}
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          (Sun would collapse to {(2.95).toFixed(2)} km · Earth to 8.9 mm)
        </p>
      </div>
    </div>
  );
}

function TopicCard({ topic, onClick }: { topic: typeof TOPICS[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-6 transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = `${topic.color}44`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${topic.color}10`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-3xl">{topic.icon}</span>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold mb-1"
            style={{ fontFamily: "Orbitron, sans-serif", color: topic.color, letterSpacing: "0.06em" }}
          >
            {topic.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {topic.teaser}
          </p>
        </div>
      </div>
      <div
        className="text-xs px-3 py-2 rounded-lg"
        style={{ background: `${topic.color}12`, color: topic.color, borderLeft: `2px solid ${topic.color}50` }}
      >
        ★ {topic.keyFact}
      </div>
      <div className="mt-4 text-xs font-semibold" style={{ color: `${topic.color}99` }}>
        Explore topic →
      </div>
    </button>
  );
}

function TopicDetail({ topic, onBack }: { topic: typeof TOPICS[0]; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: "rgba(255,255,255,0.4)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = topic.color)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
      >
        ← Back to Black Holes &amp; Relativity
      </button>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{topic.icon}</span>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Orbitron, sans-serif", color: topic.color, letterSpacing: "0.06em" }}
        >
          {topic.title}
        </h1>
      </div>

      <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
        {topic.about}
      </p>

      <div
        className="rounded-xl p-4 mb-8"
        style={{ background: `${topic.color}10`, border: `1px solid ${topic.color}25` }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: topic.color, fontFamily: "Orbitron, sans-serif" }}>
          KEY FACTS
        </p>
        <div className="grid grid-cols-2 gap-3">
          {topic.content.map((item) => (
            <div key={item.label}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</p>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {topic.id === "what-is" && <SchwarzchildCalc />}
      {topic.id === "time-dilation" && <TimeDilationCalc />}

      <div
        className="mt-4 rounded-xl p-4"
        style={{ background: "rgba(255,213,79,0.06)", border: "1px solid rgba(255,213,79,0.2)" }}
      >
        <p className="text-xs mb-1" style={{ color: "rgba(255,213,79,0.6)" }}>Go deeper</p>
        <p className="text-sm" style={{ color: "#ffd54f" }}>★ {topic.keyFact}</p>
      </div>

      <Link
        href={`/ask?q=Tell me about ${topic.askTopic}`}
        className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
        style={{
          background: `${topic.color}12`,
          border: `1px solid ${topic.color}30`,
          color: topic.color,
          fontFamily: "Orbitron, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        Ask about {topic.askTopic} →
      </Link>
    </div>
  );
}

export default function BlackHoles() {
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null);
  const [entered, setEntered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animFrame: number;
    let t = 0;

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw spacetime grid lines warped by central mass
      ctx.strokeStyle = "rgba(79,195,247,0.12)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      const strength = 600;

      for (let gx = -8; gx <= 8; gx++) {
        ctx.beginPath();
        for (let step = 0; step <= 40; step++) {
          const gy = -8 + (16 * step) / 40;
          const wx = cx + gx * gridSize;
          const wy = cy + gy * gridSize;
          const dx = wx - cx;
          const dy = wy - cy;
          const r2 = dx * dx + dy * dy + 1;
          const factor = strength / r2;
          const nx = wx - dx * factor;
          const ny = wy - dy * factor;
          if (step === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }
      for (let gy = -8; gy <= 8; gy++) {
        ctx.beginPath();
        for (let step = 0; step <= 40; step++) {
          const gx = -8 + (16 * step) / 40;
          const wx = cx + gx * gridSize;
          const wy = cy + gy * gridSize;
          const dx = wx - cx;
          const dy = wy - cy;
          const r2 = dx * dx + dy * dy + 1;
          const factor = strength / r2;
          const nx = wx - dx * factor;
          const ny = wy - dy * factor;
          if (step === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }

      // Draw event horizon glow
      const radius = 50 + Math.sin(t) * 3;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + 40);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(0.6, "rgba(20,0,30,0.9)");
      grd.addColorStop(0.85, "rgba(100,0,150,0.4)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disc
      for (let i = 0; i < 200; i++) {
        const angle = (i / 200) * Math.PI * 2 + t * 0.5;
        const r = 55 + Math.sin(angle * 3 + t) * 15;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r * 0.3;
        const alpha = 0.3 + Math.random() * 0.3;
        const hue = 30 + Math.sin(angle + t) * 20;
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  if (selectedTopic) {
    return (
      <div className="min-h-screen pt-20 pb-0" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
        <TopicDetail topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-0" style={{ background: "linear-gradient(180deg, #020208 0%, #05050f 100%)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: "340px" }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-700"
          style={{ opacity: entered ? 1 : 0, transform: entered ? "none" : "translateY(20px)" }}
        >
          <h1
            className="text-3xl md:text-5xl font-bold tracking-widest mb-3"
            style={{ fontFamily: "Orbitron, sans-serif", color: "white", textShadow: "0 0 40px rgba(79,195,247,0.4)" }}
          >
            BLACK HOLES &amp; RELATIVITY
          </h1>
          <p className="text-base md:text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
            Where physics breaks down and wonder begins.
          </p>
        </div>
      </div>

      {/* Topics grid */}
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid md:grid-cols-2 gap-5">
          {TOPICS.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />
          ))}
        </div>

        {/* Simulation link */}
        <div
          className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: "rgba(156,39,176,0.08)", border: "1px solid rgba(156,39,176,0.2)" }}
        >
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Experience a black hole from the inside
          </p>
          <Link
            href="/simulations/inside-black-hole"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm"
            style={{
              background: "rgba(156,39,176,0.15)",
              border: "1px solid rgba(156,39,176,0.35)",
              color: "#ce93d8",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.08em",
            }}
          >
            🌀 Inside Black Hole Simulation →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
