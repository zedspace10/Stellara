import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "halo", label: "Dark Matter Halo", timecode: "t = 13.5 Bya", description: "An invisible sphere of dark matter — 10× more massive than the visible galaxy — collapses under its own gravity, creating a gravitational well.", scienceDetail: "Dark matter haloes formed through gravitational instability seeded by quantum fluctuations during inflation. The Milky Way's halo extends ~300,000 light-years and contains ~800 billion solar masses.", color: "#4a3f6b" },
  { id: "proto", label: "Proto-Galactic Cloud", timecode: "t ≈ 13.4 Bya", description: "Hydrogen and helium gas falls into the dark matter halo, forming a vast, diffuse proto-galactic cloud beginning to rotate.", scienceDetail: "As gas fell into the halo, conservation of angular momentum spun it faster. The proto-galactic cloud had a metallicity of ~0 (no heavy elements) — these would only come later from supernovae.", color: "#2d1b4e" },
  { id: "first-stars", label: "First Stars Form", timecode: "t ≈ 13.3 Bya", description: "Population III stars — massive, metal-free giants — ignite in the densest regions of the collapsing cloud. Their deaths seed the galaxy with heavy elements.", scienceDetail: "Pop III stars were likely 100–1000 solar masses, lived only a few million years, and died as hypernovae or pair-instability supernovae, distributing the first heavy elements (CNO, Fe) into the proto-galactic medium.", color: "#93c5fd" },
  { id: "mergers", label: "Dwarf Galaxy Mergers", timecode: "t = 12 — 10 Bya", description: "Hundreds of small dwarf galaxies form and collide in slow-motion cosmic choreography, merging to build the young Milky Way.", scienceDetail: "Hierarchical structure formation: small structures merged into larger ones. The Milky Way grew primarily through mergers. Evidence includes stellar streams (Sagittarius Stream) and the multi-metallicity populations in the halo.", color: "#818cf8" },
  { id: "disc", label: "Galactic Disc Forms", timecode: "t ≈ 10 Bya", description: "Gas cools, loses energy, and flattens into a rotating plane. Conservation of angular momentum transforms a sphere into a disc.", scienceDetail: "Gas dissipates energy through radiative cooling but conserves angular momentum. It collapses along the rotation axis but not radially, creating the characteristic thin disc (~1000 ly thick, ~100,000 ly wide).", color: "#60a5fa" },
  { id: "arms", label: "Spiral Arms Emerge", timecode: "t = 8 — 4 Bya", description: "Density waves propagate through the disc, triggering star formation in sweeping spiral arms. The Milky Way takes its iconic form.", scienceDetail: "Spiral arms are density waves, not fixed structures — stars move through them like cars through a traffic jam. The Milky Way has 4 major arms: Sagittarius, Perseus, Orion-Cygnus (our arm), and Norma-Cygnus.", color: "#a78bfa" },
  { id: "now", label: "The Milky Way Today", timecode: "t = 13.8 Bya (now)", description: "A barred spiral galaxy, 100,000 light-years wide, 400 billion stars, with Sagittarius A* — 4 million solar masses — at its heart. This is home.", scienceDetail: "The Milky Way will collide with Andromeda in ~4.5 billion years, eventually merging into an elliptical galaxy astronomers call 'Milkomeda'. Our Sun will likely be ejected to a wider orbit.", color: "#ffd54f" },
];

const N = 7000;

export default function MilkyWayBirthSim() {
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
    document.title = "Birth of the Milky Way — STELLARA Simulations";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 60, 120);
    camera.lookAt(0, 0, 0);

    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const composer = makeBloomComposer(renderer, scene, camera, W, H);

    // Build phase positions
    const phasePos: Float32Array[] = PHASES.map((_, pi) => {
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const idx = i * 3;
        const r = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        if (pi === 0) {
          // Sphere halo
          const rad = 40 + r * 30;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Collapsing cloud — squishing inward
          const rad = 20 + r * 50;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta) * 0.6;
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 2) {
          // Scattered stars
          const rad = 10 + r * 60;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = (Math.random() - 0.5) * 40;
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 3) {
          // Two merging blobs
          const blob = i < N / 2 ? 0 : 1;
          const cx = blob === 0 ? -20 : 20;
          const bRad = 8 + r * 12;
          arr[idx] = cx + bRad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = bRad * Math.sin(phi) * Math.sin(theta) * 0.5;
          arr[idx + 2] = bRad * Math.cos(phi);
        } else if (pi === 4) {
          // Flattening disc
          const dRad = 2 + r * 55;
          arr[idx] = dRad * Math.cos(theta);
          arr[idx + 1] = (Math.random() - 0.5) * 8;
          arr[idx + 2] = dRad * Math.sin(theta);
        } else if (pi === 5) {
          // Spiral arms
          const arm = Math.floor(Math.random() * 4);
          const armOffset = (arm / 4) * Math.PI * 2;
          const t2 = r * Math.PI * 2;
          const spiralR = 3 + r * 50;
          arr[idx] = spiralR * Math.cos(t2 + armOffset) + (Math.random() - 0.5) * 8;
          arr[idx + 1] = (Math.random() - 0.5) * 3;
          arr[idx + 2] = spiralR * Math.sin(t2 + armOffset) + (Math.random() - 0.5) * 8;
        } else {
          // Full galaxy
          const arm = Math.floor(Math.random() * 4);
          const armOffset = (arm / 4) * Math.PI * 2;
          const t2 = r * Math.PI * 2.5;
          const sR = 1 + r * 50;
          arr[idx] = sR * Math.cos(t2 + armOffset) + (Math.random() - 0.5) * 5;
          arr[idx + 1] = (Math.random() - 0.5) * 2 + (Math.random() < 0.05 ? (Math.random() - 0.5) * 20 : 0);
          arr[idx + 2] = sR * Math.sin(t2 + armOffset) + (Math.random() - 0.5) * 5;
        }
      }
      return arr;
    });

    const phaseColors = [0x3d1a66, 0x4a2080, 0xcce8ff, 0x818cf8, 0x3a7bd5, 0xb39ddb, 0xffd54f].map(c => new THREE.Color(c));

    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3];
      positions[i * 3 + 1] = phasePos[0][i * 3 + 1];
      positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      colors[i * 3] = phaseColors[0].r; colors[i * 3 + 1] = phaseColors[0].g; colors[i * 3 + 2] = phaseColors[0].b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const PHASE_DUR = 9;
    const TOTAL = PHASES.length * PHASE_DUR;
    let animId: number, simTime = 0, lastTime = performance.now(), fromPhase = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000; lastTime = now;
      if (jumpRef.current !== null) { simTime = jumpRef.current * TOTAL; jumpRef.current = null; }
      if (!isPausedRef.current) { simTime = Math.min(simTime + delta * speedRef.current, TOTAL - 0.001); }
      const rawPhase = simTime / PHASE_DUR;
      const phaseIdx = Math.min(Math.floor(rawPhase), PHASES.length - 1);
      const t = rawPhase - Math.floor(rawPhase);
      const next = Math.min(phaseIdx + 1, PHASES.length - 1);
      const fc = phaseColors[phaseIdx], tc = phaseColors[next];
      for (let i = 0; i < N; i++) {
        const idx = i * 3;
        const fp = phasePos[phaseIdx], tp = phasePos[next];
        positions[idx] = fp[idx] + (tp[idx] - fp[idx]) * t;
        positions[idx + 1] = fp[idx + 1] + (tp[idx + 1] - fp[idx + 1]) * t;
        positions[idx + 2] = fp[idx + 2] + (tp[idx + 2] - fp[idx + 2]) * t;
        colors[idx] = fc.r + (tc.r - fc.r) * t;
        colors[idx + 1] = fc.g + (tc.g - fc.g) * t;
        colors[idx + 2] = fc.b + (tc.b - fc.b) * t;
      }
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      pts.rotation.y += (phaseIdx >= 4 ? 0.003 : 0.0005) * speedRef.current;
      setCurrentPhaseIndex(phaseIdx);
      setTotalProgress(Math.min(simTime / TOTAL, 1));
      composer.render();
    }
    animate();

    const onResize = () => { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); composer.dispose(); renderer.dispose(); geo.dispose(); mat.dispose(); el.removeChild(renderer.domElement); };
  }, []);

  const handlePhaseJump = useCallback((idx: number) => { const p = idx / PHASES.length; jumpRef.current = p; setCurrentPhaseIndex(idx); setTotalProgress(p); }, []);
  const handleRestart = useCallback(() => { jumpRef.current = 0; setTotalProgress(0); setCurrentPhaseIndex(0); setIsPlaying(true); }, []);

  return (
    <SimulationLayout title="Birth of the Milky Way" subtitle="13.5 billion years of galactic assembly" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="We are the children of some star that lived and died before our Sun was born." closingAuthor="Carl Sagan" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
