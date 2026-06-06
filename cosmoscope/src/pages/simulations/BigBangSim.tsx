import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "planck", label: "Planck Epoch", timecode: "t = 0 — 10⁻⁴³ s", description: "All forces are unified. The universe is smaller than a proton at 10³² Kelvin. Spacetime itself is undefined.", scienceDetail: "The Planck epoch is the earliest period of the universe, lasting from 0 to approximately 10⁻⁴³ seconds (Planck time). At these scales, quantum gravitational effects dominate and our current physics breaks down.", color: "#ffffff" },
  { id: "inflation", label: "Cosmic Inflation", timecode: "t = 10⁻³⁶ s", description: "Space expands exponentially — faster than light. This is not matter moving through space; space itself is growing.", scienceDetail: "Inflation was driven by a hypothetical scalar field called the inflaton. In ~10⁻³² seconds, the universe expanded by a factor of 10²⁶, smoothing out any curvature and seeding quantum fluctuations that become galaxies.", color: "#a78bfa" },
  { id: "plasma", label: "Quark-Gluon Plasma", timecode: "t = 10⁻³² s — 1 μs", description: "Energy converts to matter. The universe is an opaque, roiling soup of quarks and gluons hotter than any star.", scienceDetail: "After inflation, the inflaton field decayed into a hot dense plasma (reheating). Quarks, gluons, leptons, and their antimatter counterparts filled all of space in thermal equilibrium.", color: "#ff6b35" },
  { id: "nucleosynthesis", label: "Big Bang Nucleosynthesis", timecode: "t = 1 — 3 minutes", description: "Quarks bind into protons and neutrons. The universe cools enough for hydrogen and helium nuclei to form.", scienceDetail: "BBN produced the primordial abundances: ~75% hydrogen, ~25% helium-4, trace deuterium and lithium-7. These ratios are among the strongest confirmations of the Big Bang model.", color: "#ff9f43" },
  { id: "cmb", label: "Recombination & CMB", timecode: "t = 380,000 years", description: "The fog lifts. Electrons bind to nuclei. The universe becomes transparent — light streams freely for the first time. The Cosmic Microwave Background is born.", scienceDetail: "At ~3000 K, electrons and protons recombined into hydrogen atoms. Photons decoupled from matter and have been traveling freely ever since — we detect them today as the CMB at 2.73 K.", color: "#ffd54f" },
  { id: "dark-ages", label: "Cosmic Dark Ages", timecode: "t = 380,000 — 150 My", description: "Darkness. No stars, no light — only hydrogen gas slowly falling along dark matter filaments toward its fate.", scienceDetail: "During this era, dark matter haloes collapsed under gravity, drawing in baryonic gas. The first structures — cosmic web filaments — were forming, though no light was produced.", color: "#4a3f6b" },
  { id: "first-stars", label: "First Stars Ignite", timecode: "t = 150 million years", description: "Population III stars — massive, brilliant blue-white giants — ignite along dark matter filaments. The universe comes alive.", scienceDetail: "Pop III stars were metal-free, likely 100–1000 solar masses, extremely luminous, and short-lived. Their UV radiation reionized the surrounding gas (Epoch of Reionization), ending the cosmic dark ages.", color: "#93c5fd" },
  { id: "galaxies", label: "Galaxy Formation", timecode: "t = 400 million years", description: "Stars cluster along the cosmic web. Spiral structures emerge. The universe we recognise begins to take shape.", scienceDetail: "Early galaxies formed through hierarchical assembly: small structures merged into larger ones. Dark matter haloes provided the gravitational scaffolding. The first quasars (supermassive black holes accreting mass) appeared around this time.", color: "#818cf8" },
  { id: "now", label: "Today", timecode: "t = 13.8 billion years", description: "Hundreds of billions of galaxies. Trillions of stars. One pale blue dot. 13.8 billion years later — you are here.", scienceDetail: "The universe today has expanded to ~93 billion light-years in diameter (observable). Dark energy drives accelerating expansion. Star formation has peaked and is declining. The universe is ~68% dark energy, ~27% dark matter, ~5% ordinary matter.", color: "#4fc3f7" },
];

const PARTICLE_COUNT = 8000;

function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

export default function BigBangSim() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scienceMode, setScienceMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);

  const isPausedRef = useRef(false);
  const speedRef = useRef(1);
  const progressRef = useRef(0); // 0-1 across all phases
  const phaseRef = useRef(0);
  const jumpRef = useRef<number | null>(null);

  useEffect(() => { isPausedRef.current = !isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    document.title = "The Big Bang — STELLARA Simulations";
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.001, 5000);
    camera.position.set(0, 0, 80);

    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const composer = makeBloomComposer(renderer, scene, camera, W, H);

    // Ambient glow light
    scene.add(new THREE.AmbientLight(0x111133, 2));

    // Particle system
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    // Store base positions for each phase
    const phasePositions: Float32Array[] = PHASES.map((_, pi) => {
      const arr = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const r = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        if (pi === 0) {
          // Planck: all at origin
          arr[idx] = (Math.random() - 0.5) * 0.01;
          arr[idx + 1] = (Math.random() - 0.5) * 0.01;
          arr[idx + 2] = (Math.random() - 0.5) * 0.01;
        } else if (pi === 1) {
          // Inflation: explosive sphere
          const rad = 5 + r * 60;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 2) {
          // Plasma: dense swirling sphere
          const rad = 2 + r * 30;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 3) {
          // Nucleosynthesis: expanding, cooling
          const rad = 10 + r * 50;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 4) {
          // CMB: large sphere
          const rad = 60 + r * 10;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 5) {
          // Dark Ages: filaments
          const filament = Math.floor(Math.random() * 8);
          const fAngle = (filament / 8) * Math.PI * 2;
          const along = (Math.random() - 0.5) * 100;
          arr[idx] = Math.cos(fAngle) * 5 + along * Math.cos(fAngle) + (Math.random() - 0.5) * 8;
          arr[idx + 1] = (Math.random() - 0.5) * 20;
          arr[idx + 2] = Math.sin(fAngle) * 5 + along * Math.sin(fAngle) + (Math.random() - 0.5) * 8;
        } else if (pi === 6) {
          // First Stars: bright clusters on filaments
          const cl = Math.floor(Math.random() * 12);
          const clAngle = (cl / 12) * Math.PI * 2;
          const clR = 15 + Math.random() * 40;
          arr[idx] = Math.cos(clAngle) * clR + (Math.random() - 0.5) * 6;
          arr[idx + 1] = (Math.random() - 0.5) * 15;
          arr[idx + 2] = Math.sin(clAngle) * clR + (Math.random() - 0.5) * 6;
        } else if (pi === 7) {
          // Galaxy formation: spiral-ish clusters
          const arm = Math.floor(Math.random() * 4);
          const armAngle = (arm / 4) * Math.PI * 2 + r * Math.PI;
          const armR = 5 + r * 50;
          arr[idx] = Math.cos(armAngle) * armR + (Math.random() - 0.5) * 10;
          arr[idx + 1] = (Math.random() - 0.5) * 5;
          arr[idx + 2] = Math.sin(armAngle) * armR + (Math.random() - 0.5) * 10;
        } else {
          // Now: cosmic web
          const nx = (Math.random() - 0.5) * 120;
          const ny = (Math.random() - 0.5) * 120;
          const nz = (Math.random() - 0.5) * 120;
          arr[idx] = nx;
          arr[idx + 1] = ny;
          arr[idx + 2] = nz;
        }
      }
      return arr;
    });

    // Phase colours per spec — energy feel, not flat
    const phaseColors = [
      new THREE.Color("#ffffff"),   // Planck — pure white, intense
      new THREE.Color("#ffe0a0"),   // Inflation — white-hot with gold tinge
      new THREE.Color("#ff4400"),   // Quark-Gluon Plasma — deep orange-red
      new THREE.Color("#cc2200"),   // Nucleosynthesis — cooling red
      new THREE.Color("#fff3b0"),   // Recombination CMB — golden white
      new THREE.Color("#180030"),   // Dark Ages — near black, deep violet
      new THREE.Color("#cce8ff"),   // First Stars — brilliant blue-white
      new THREE.Color("#9fa8da"),   // Galaxy Formation — blue-violet
      new THREE.Color("#4fc3f7"),   // Today — sky blue
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = phasePositions[0][i * 3];
      positions[i * 3 + 1] = phasePositions[0][i * 3 + 1];
      positions[i * 3 + 2] = phasePositions[0][i * 3 + 2];
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: makeCircleTex(),
      alphaTest: 0.005,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const PHASE_DURATION = 8; // seconds per phase at 1x speed
    const TOTAL_DURATION = PHASES.length * PHASE_DURATION;

    let animId: number;
    let simTime = 0;
    let lastTime = performance.now();
    let lerpT = 0;
    let fromPhase = 0;

    function updateParticles(phaseIdx: number, t: number) {
      const nextPhase = Math.min(phaseIdx + 1, PHASES.length - 1);
      const fromPos = phasePositions[phaseIdx];
      const toPos = phasePositions[nextPhase];
      const fromCol = phaseColors[phaseIdx];
      const toCol = phaseColors[nextPhase];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        positions[idx] = fromPos[idx] + (toPos[idx] - fromPos[idx]) * t;
        positions[idx + 1] = fromPos[idx + 1] + (toPos[idx + 1] - fromPos[idx + 1]) * t;
        positions[idx + 2] = fromPos[idx + 2] + (toPos[idx + 2] - fromPos[idx + 2]) * t;

        const c = lerpColor(fromCol, toCol, t);
        colors[idx] = c.r;
        colors[idx + 1] = c.g;
        colors[idx + 2] = c.b;
      }

      (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (jumpRef.current !== null) {
        const target = jumpRef.current;
        simTime = target * TOTAL_DURATION;
        jumpRef.current = null;
      }

      if (!isPausedRef.current) {
        simTime += delta * speedRef.current;
        if (simTime > TOTAL_DURATION) simTime = TOTAL_DURATION - 0.001;
      }

      const rawPhase = simTime / PHASE_DURATION;
      const phaseIdx = Math.min(Math.floor(rawPhase), PHASES.length - 1);
      const phaseT = rawPhase - Math.floor(rawPhase);

      if (phaseIdx !== fromPhase) {
        fromPhase = phaseIdx;
        lerpT = 0;
      }
      lerpT = phaseT;

      updateParticles(phaseIdx, Math.min(lerpT, 1));
      points.rotation.y += 0.001 * speedRef.current;

      const overallProgress = Math.min(simTime / TOTAL_DURATION, 1);
      setTotalProgress(overallProgress);
      setCurrentPhaseIndex(phaseIdx);

      // Phase-reactive background for dramatic atmosphere
      const bgColors = [
        0x000000, // planck
        0x000005, // inflation
        0x0a0200, // plasma
        0x080100, // nucleosynthesis
        0x0a0800, // cmb
        0x000000, // dark-ages
        0x000008, // first-stars
        0x00000a, // galaxies
        0x000a14, // now
      ];
      scene.background = new THREE.Color(bgColors[phaseIdx] ?? 0x000000);

      composer.render();
    }

    animate();

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      composer.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  const handleScrub = useCallback((p: number) => {
    jumpRef.current = p;
    setTotalProgress(p);
  }, []);

  const handlePhaseJump = useCallback((idx: number) => {
    const p = idx / PHASES.length;
    jumpRef.current = p;
    setCurrentPhaseIndex(idx);
    setTotalProgress(p);
  }, []);

  const handleRestart = useCallback(() => {
    jumpRef.current = 0;
    setTotalProgress(0);
    setCurrentPhaseIndex(0);
    setIsPlaying(true);
  }, []);

  return (
    <SimulationLayout
      title="The Big Bang"
      subtitle="From singularity to the observable universe"
      phases={PHASES}
      currentPhaseIndex={currentPhaseIndex}
      totalProgress={totalProgress}
      isPlaying={isPlaying}
      scienceMode={scienceMode}
      speed={speed}
      closingQuote="The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself."
      closingAuthor="Carl Sagan"
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onRestart={handleRestart}
      onSpeedChange={setSpeed}
      onPhaseJump={handlePhaseJump}
      onScrub={handleScrub}
      onScienceModeToggle={() => setScienceMode(v => !v)}
    >
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
