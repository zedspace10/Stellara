import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock, BarChart2 } from "lucide-react";

const SIMS = [
  {
    id: "big-bang",
    title: "The Big Bang",
    description: "Witness the birth of spacetime itself — from a singularity to the observable universe.",
    duration: "~4 min",
    difficulty: "Beginner",
    difficultyColor: "#4fc3f7",
    colors: ["#ff6b35", "#ff9f43", "#ffd54f"],
    icon: "✦",
  },
  {
    id: "milky-way-birth",
    title: "Birth of the Milky Way",
    description: "Watch our galaxy assemble over 13.5 billion years from dark matter and colliding dwarfs.",
    duration: "~3 min",
    difficulty: "Intermediate",
    difficultyColor: "#9c27b0",
    colors: ["#9c27b0", "#4fc3f7", "#ffd54f"],
    icon: "⊛",
  },
  {
    id: "star-birth",
    title: "Birth of a Star",
    description: "A cold molecular cloud collapses under gravity until fusion ignites in its core.",
    duration: "~3 min",
    difficulty: "Beginner",
    difficultyColor: "#4fc3f7",
    colors: ["#e53935", "#ff9f43", "#ffd54f"],
    icon: "★",
  },
  {
    id: "star-death",
    title: "Life & Death of a Star",
    description: "From main sequence to red giant, supernova, and beyond — three stellar fates.",
    duration: "~4 min",
    difficulty: "Intermediate",
    difficultyColor: "#9c27b0",
    colors: ["#ffd54f", "#e53935", "#9c27b0"],
    icon: "☆",
  },
  {
    id: "black-hole",
    title: "Black Hole Formation",
    description: "Stellar collapse, accretion discs, gravitational lensing, and spacetime singularities.",
    duration: "~4 min",
    difficulty: "Advanced",
    difficultyColor: "#e53935",
    colors: ["#110022", "#9c27b0", "#4fc3f7"],
    icon: "◉",
  },
  {
    id: "inside-black-hole",
    title: "Inside a Black Hole",
    description: "Cross the event horizon and journey toward the singularity — where physics ends.",
    duration: "~3 min",
    difficulty: "Advanced",
    difficultyColor: "#e53935",
    colors: ["#1a0030", "#9c27b0", "#ff6b35"],
    icon: "⊗",
  },
  {
    id: "solar-system-formation",
    title: "Formation of the Solar System",
    description: "From a supernova shockwave 4.6 billion years ago to the world you stand on today.",
    duration: "~4 min",
    difficulty: "Intermediate",
    difficultyColor: "#9c27b0",
    colors: ["#4fc3f7", "#e53935", "#ffd54f"],
    icon: "⊙",
  },
];

function AnimatedCard({ sim, index }: { sim: typeof SIMS[0]; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.offsetWidth || 300;
    const ch = canvas.offsetHeight || 144;
    canvas.width = cw;
    canvas.height = ch;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }[] = [];
    const colors = sim.colors;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    let frame: number;
    let t = 0;

    function draw() {
      frame = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      t += 0.01;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        ctx!.globalAlpha = p.alpha;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // Central glow
      const gx = canvas!.width / 2 + Math.sin(t) * 20;
      const gy = canvas!.height / 2 + Math.cos(t * 0.7) * 15;
      const grad = ctx!.createRadialGradient(gx, gy, 0, gx, gy, 60);
      grad.addColorStop(0, "rgba(100,100,255,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [sim.colors]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative rounded-2xl border border-white/10 overflow-hidden bg-[#05050f] hover:border-white/25 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Preview canvas */}
      <div className="relative h-36 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-transparent to-transparent" />
        <div className="absolute top-3 right-3 text-2xl opacity-50 group-hover:opacity-80 transition-opacity" style={{ color: sim.colors[0] }}>
          {sim.icon}
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: sim.difficultyColor, borderColor: sim.difficultyColor + "44", background: sim.difficultyColor + "11" }}>
            {sim.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="text-xs text-gray-500 font-['Orbitron'] tracking-widest mb-1">
          {String(SIMS.indexOf(sim) + 1).padStart(2, "0")}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-['Orbitron']">{sim.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{sim.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {sim.duration}
          </div>
          <Link href={`/simulations/${sim.id}`}>
            <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-[#4fc3f7]/10 border border-[#4fc3f7]/30 text-[#4fc3f7] hover:bg-[#4fc3f7]/20 transition-all">
              <Play className="w-3.5 h-3.5 fill-[#4fc3f7]" />
              Begin
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function SimulationsLanding() {
  useEffect(() => {
    document.title = "Simulations — STELLARA";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 text-xs text-[#9c27b0] font-['Orbitron'] tracking-widest uppercase mb-4 px-4 py-2 rounded-full border border-[#9c27b0]/30 bg-[#9c27b0]/10">
          <BarChart2 className="w-3.5 h-3.5" />
          Interactive Cosmic Simulations
        </div>
        <h1 className="text-4xl md:text-6xl font-['Orbitron'] font-bold text-white mb-4">
          STELLARA <span className="text-[#4fc3f7]">Simulations</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          Witness the most profound events in cosmic history — scientifically accurate, visually cinematic.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {SIMS.map((sim, i) => (
          <AnimatedCard key={sim.id} sim={sim} index={i} />
        ))}
      </div>

      {/* Recommended order */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 p-6 rounded-2xl border border-[#ffd54f]/20 bg-[#ffd54f]/5 text-center"
      >
        <div className="text-[#ffd54f] font-['Orbitron'] text-sm mb-2">Recommended Order for New Explorers</div>
        <div className="text-gray-400 text-sm">
          Big Bang → Solar System Formation → Star Birth → Star Death → Black Hole → Milky Way Birth → Inside a Black Hole
        </div>
      </motion.div>
    </div>
  );
}
