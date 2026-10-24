import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "nebula", label: "A cold cloud", short: "Cloud", timecode: "4.6 billion years ago", description: "A vast, cold cloud of gas and dust drifts somewhere in the Milky Way. Something disturbs it, and part of it begins to collapse.", scienceDetail: "The cloud held material from earlier generations of stars. Short lived radioactive elements found in meteorites, such as aluminium 26, show that a massive star nearby enriched it, and may have helped trigger its collapse.", color: "#2d3a4a" },
  { id: "solar-nebula", label: "A spinning disc", short: "Disc", timecode: "4.57 billion years ago", description: "Almost all of the collapsing gas falls to the centre and becomes the young Sun. What is left spreads into a flat, spinning disc of gas and dust.", scienceDetail: "The Sun took 99.8% of the mass. The disc was roughly 75% hydrogen, 23% helium and 2% everything else. The oldest solid grains in meteorites date from this time, 4.567 billion years ago.", color: "#ff9f43" },
  { id: "accretion", label: "Dust to planetesimals", short: "Dust", timecode: "The first few million years", description: "Dust grains collide and stick. Pebbles gather into boulders, then into bodies kilometres across, called planetesimals.", scienceDetail: "Growing past about a metre is hard, because bodies that size drift quickly towards the Sun. The leading idea is that clumps of pebbles became dense enough to collapse under their own gravity, forming planetesimals directly.", color: "#c8a96e" },
  { id: "frost-line", label: "The frost line", short: "Frost line", timecode: "The first few million years", description: "Far enough from the young Sun, water freezes into ice. Inside that line, worlds are made of rock and metal. Outside it, ice adds extra building material, and Jupiter starts to grow.", scienceDetail: "The frost line sat at around 3 au, where it was cold enough, about 150 degrees above absolute zero, for water ice to survive. Jupiter's core grew to roughly ten times Earth's mass and then pulled in gas rapidly, while the disc still had gas to give.", color: "#60a5fa" },
  { id: "protoplanets", label: "Young planets collide", short: "Collisions", timecode: "4.56 to 4.5 billion years ago", description: "Planetesimals merge into planetary embryos, some as big as Mars. Their orbits cross, and giant collisions are common.", scienceDetail: "The biggest bodies grow fastest, because their gravity sweeps up more material. Some models, such as the Grand Tack, have Jupiter moving inward and then back out while the gas disc remained, which would have scattered material across the inner solar system.", color: "#e53935" },
  { id: "moon-forming", label: "The giant impact", short: "Moon", timecode: "About 4.5 billion years ago", description: "A Mars sized body, named Theia, strikes the young Earth. Debris thrown into orbit gathers to form the Moon.", scienceDetail: "First proposed in 1975, the giant impact explains why the Moon has so little iron and why its rocks are such a close match for Earth's. Simulations suggest the Moon came together quickly, and a 2022 study found it could have formed in just hours.", color: "#F3DDB0" },
  { id: "bombardment", label: "An era of impacts", short: "Impacts", timecode: "Around 4 billion years ago", description: "The young planets are still being hit by leftover rocks and comets. The Moon's oldest craters keep a record of this violent time.", scienceDetail: "Moon rocks from the Apollo missions once pointed to a spike in impacts around 3.9 billion years ago, called the Late Heavy Bombardment, perhaps caused by the giant planets shifting their orbits. Newer studies suggest the impacts may instead have tailed off gradually. The question is still open.", color: "#ff6b35" },
  { id: "today", label: "The solar system today", short: "Today", timecode: "Today", description: "Eight planets. Hundreds of moons. Millions of asteroids and comets. And one world we know has life, where chemistry became biology, and biology became curious.", scienceDetail: "The planets now move on nearly circular orbits, almost in one plane, a pattern left by how they formed. The Sun is about halfway through its life, with about 5 billion years of hydrogen left in its core.", color: "#A9C3E0" },
];

const N = 7000;

export default function SolarSystemFormationSim() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scienceMode, setScienceMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const isPausedRef = useRef(false);
  const speedRef = useRef(1);
  const jumpRef = useRef<number | null>(null);

  useEffect(() => { isPausedRef.current = !isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    document.title = "Solar System Formation | PALE";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 40, 80);
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const composer = makeBloomComposer(renderer, scene, camera, W, H);

    const phasePos: Float32Array[] = PHASES.map((_, pi) => {
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const idx = i * 3; const r = Math.random(); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
        if (pi === 0) {
          // Vast nebula cloud
          const rad = 30 + r * 40; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Protoplanetary disc
          const dR = 1 + r * 55; arr[idx] = dR * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * 4 * (1 - r * 0.8); arr[idx + 2] = dR * Math.sin(theta);
        } else if (pi === 2) {
          // Clumping — denser rings
          const ring = Math.floor(Math.random() * 6); const ringR = 5 + ring * 9;
          arr[idx] = (ringR + (Math.random() - 0.5) * 4) * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * 2; arr[idx + 2] = (ringR + (Math.random() - 0.5) * 4) * Math.sin(theta);
        } else if (pi === 3) {
          // Frost line visible — two zones
          const inner = r < 0.45;
          const dR = inner ? 1 + r * 24 : 25 + r * 30;
          arr[idx] = dR * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * 2; arr[idx + 2] = dR * Math.sin(theta);
        } else if (pi === 4) {
          // Protoplanets — discrete blobs
          const planet = Math.floor(Math.random() * 6);
          const pR = [5, 10, 18, 30, 40, 50][planet]; const pAngle = (planet / 6) * Math.PI * 2 + Math.random() * 0.3;
          arr[idx] = pR * Math.cos(pAngle) + (Math.random() - 0.5) * 5; arr[idx + 1] = (Math.random() - 0.5) * 3; arr[idx + 2] = pR * Math.sin(pAngle) + (Math.random() - 0.5) * 5;
        } else if (pi === 5) {
          // Giant impact — two merging blobs at Earth distance
          if (i < N * 0.4) {
            // Earth + Theia merging
            const blob = i < N * 0.2 ? 0 : 1; const cx = blob === 0 ? -5 : 5;
            arr[idx] = 12 + cx + (Math.random() - 0.5) * 4; arr[idx + 1] = (Math.random() - 0.5) * 4; arr[idx + 2] = (Math.random() - 0.5) * 8;
          } else {
            // Debris cloud
            const bR = r * 20 + 5;
            arr[idx] = 12 + bR * Math.cos(theta); arr[idx + 1] = bR * Math.sin(theta) * 0.3; arr[idx + 2] = (Math.random() - 0.5) * 15;
          }
        } else if (pi === 6) {
          // Bombardment — impacts everywhere in inner system
          const zone = r < 0.6 ? (1 + r * 25) : (25 + r * 30);
          arr[idx] = zone * Math.cos(theta) + (Math.random() - 0.5) * 5; arr[idx + 1] = (Math.random() - 0.5) * 5; arr[idx + 2] = zone * Math.sin(theta) + (Math.random() - 0.5) * 5;
        } else {
          // Solar system today — neat orbital rings
          const orbit = Math.floor(Math.random() * 8);
          const oR = [5, 8, 12, 16, 25, 35, 46, 55][orbit];
          arr[idx] = (oR + (Math.random() - 0.5)) * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * 0.8; arr[idx + 2] = (oR + (Math.random() - 0.5)) * Math.sin(theta);
        }
      }
      return arr;
    });

    const phaseColors = [0x331100, 0xff8833, 0xcc6600, 0x4488ff, 0xcc1100, 0xffd54f, 0xff4400, 0x4fc3f7].map(c => new THREE.Color(c));
    const positions = new Float32Array(N * 3); const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3]; positions[i * 3 + 1] = phasePos[0][i * 3 + 1]; positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      cols[i * 3] = phaseColors[0].r; cols[i * 3 + 1] = phaseColors[0].g; cols[i * 3 + 2] = phaseColors[0].b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({ size: 2.0, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const PHASE_DUR = 9, TOTAL = PHASES.length * PHASE_DUR;
    let animId: number, simTime = 0, lastTime = performance.now();
    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now(); const delta = (now - lastTime) / 1000; lastTime = now;
      if (jumpRef.current !== null) { simTime = jumpRef.current * TOTAL; jumpRef.current = null; }
      if (!isPausedRef.current) simTime = Math.min(simTime + delta * speedRef.current, TOTAL - 0.001);
      const rawPhase = simTime / PHASE_DUR;
      const phaseIdx = Math.min(Math.floor(rawPhase), PHASES.length - 1);
      const t = rawPhase - Math.floor(rawPhase);
      const next = Math.min(phaseIdx + 1, PHASES.length - 1);
      const fc = phaseColors[phaseIdx], tc = phaseColors[next];
      for (let i = 0; i < N; i++) {
        const idx = i * 3; const fp = phasePos[phaseIdx], tp = phasePos[next];
        positions[idx] = fp[idx] + (tp[idx] - fp[idx]) * t; positions[idx + 1] = fp[idx + 1] + (tp[idx + 1] - fp[idx + 1]) * t; positions[idx + 2] = fp[idx + 2] + (tp[idx + 2] - fp[idx + 2]) * t;
        cols[idx] = fc.r + (tc.r - fc.r) * t; cols[idx + 1] = fc.g + (tc.g - fc.g) * t; cols[idx + 2] = fc.b + (tc.b - fc.b) * t;
      }
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      const rotSpeed = phaseIdx >= 1 && phaseIdx <= 3 ? 0.003 : 0.001;
      pts.rotation.y += rotSpeed * speedRef.current;
      setCurrentPhaseIndex(phaseIdx); setTotalProgress(Math.min(simTime / TOTAL, 1));
      composer.render();
    }
    animate();
    const onResize = () => { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); composer.dispose(); renderer.dispose(); geo.dispose(); mat.dispose(); el.removeChild(renderer.domElement); };
  }, []);

  const handlePhaseJump = useCallback((idx: number) => { jumpRef.current = idx / PHASES.length; setCurrentPhaseIndex(idx); setTotalProgress(idx / PHASES.length); }, []);
  const handleRestart = useCallback(() => { jumpRef.current = 0; setTotalProgress(0); setCurrentPhaseIndex(0); setIsPlaying(true); }, []);

  return (
    <SimulationLayout title="Solar System Formation" subtitle="4.6 billion years of cosmic construction" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="The ground beneath you was once dust in that disc." onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
