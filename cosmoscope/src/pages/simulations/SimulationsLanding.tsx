import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";

const SIMS = [
  {
    id: "big-bang",
    title: "The Big Bang",
    description: "Watch space itself begin, from a hot dense beginning to the universe we see today.",
    duration: "~4 min",
    difficulty: "Beginner",
    difficultyColor: "#8DEBFF",
    colors: ["#ff6b35", "#ff9f43", "#F3DDB0"],
    icon: "✦",
  },
  {
    id: "milky-way-birth",
    title: "Birth of the Milky Way",
    description: "Watch our galaxy assemble over 13.5 billion years from dark matter and colliding dwarfs.",
    duration: "~3 min",
    difficulty: "Intermediate",
    difficultyColor: "#A995FF",
    colors: ["#A995FF", "#8DEBFF", "#F3DDB0"],
    icon: "⊛",
  },
  {
    id: "star-birth",
    title: "Birth of a Star",
    description: "A cold molecular cloud collapses under gravity until fusion ignites in its core.",
    duration: "~3 min",
    difficulty: "Beginner",
    difficultyColor: "#8DEBFF",
    colors: ["#e53935", "#ff9f43", "#F3DDB0"],
    icon: "★",
  },
  {
    id: "star-death",
    title: "Life & Death of a Star",
    description: "From a steady middle age to a red giant, a supernova, and beyond. Three ways a star can end.",
    duration: "~4 min",
    difficulty: "Intermediate",
    difficultyColor: "#A995FF",
    colors: ["#F3DDB0", "#e53935", "#A995FF"],
    icon: "☆",
  },
  {
    id: "black-hole",
    title: "Black Hole Formation",
    description: "Stellar collapse, accretion discs, gravitational lensing, and spacetime singularities.",
    duration: "~4 min",
    difficulty: "Advanced",
    difficultyColor: "#e53935",
    colors: ["#110022", "#A995FF", "#8DEBFF"],
    icon: "◉",
  },
  {
    id: "inside-black-hole",
    title: "Inside a Black Hole",
    description: "Cross the event horizon and head towards the centre, where our physics stops working.",
    duration: "~3 min",
    difficulty: "Advanced",
    difficultyColor: "#e53935",
    colors: ["#1a0030", "#A995FF", "#ff6b35"],
    icon: "⊗",
  },
  {
    id: "solar-system-formation",
    title: "Formation of the Solar System",
    description: "From a supernova shockwave 4.6 billion years ago to the world you stand on today.",
    duration: "~4 min",
    difficulty: "Intermediate",
    difficultyColor: "#A995FF",
    colors: ["#8DEBFF", "#e53935", "#F3DDB0"],
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
      className="group relative rounded-2xl border border-white/10 overflow-hidden bg-[#05070C] hover:border-white/25 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Preview canvas */}
      <div className="relative h-36 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070C] via-transparent to-transparent" />
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
        <div className="text-xs text-gray-500 font-sans tracking-widest mb-1">
          {String(SIMS.indexOf(sim) + 1).padStart(2, "0")}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-sans">{sim.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{sim.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {sim.duration}
          </div>
          <Link href={`/simulations/${sim.id}`}>
            <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-[#8DEBFF]/10 border border-[#8DEBFF]/30 text-[#8DEBFF] hover:bg-[#8DEBFF]/20 transition-all">
              <Play className="w-3.5 h-3.5 fill-[#8DEBFF]" />
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
    document.title = "Simulations · PALE";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-[1240px] mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-6 pb-12"
      >
        <h1 className="m-0 text-4xl md:text-5xl font-bold tracking-[-0.02em] text-white">Simulations</h1>
        <p className="mt-3 mb-0 text-lg leading-relaxed max-w-[620px]" style={{ color: "#A7B6C6" }}>
          Watch the biggest events in the history of the universe unfold, from the Big Bang to the death of a star.
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
        className="mt-12 p-6 rounded-2xl border border-[#F3DDB0]/20 bg-[#F3DDB0]/5 text-center"
      >
        <div className="text-[#F3DDB0] font-sans text-sm mb-2">New here? Try them in this order</div>
        <div className="text-sm" style={{ color: "#A7B6C6" }}>
          The Big Bang, then the birth of the solar system, the birth of a star, the death of a star, a black hole forming, the birth of the Milky Way, and finally inside a black hole.
        </div>
      </motion.div>
    </div>
  );
}
