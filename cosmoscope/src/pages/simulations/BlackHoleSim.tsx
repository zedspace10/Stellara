import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "collapse", label: "Core Collapse", timecode: "t = 0", description: "A massive star's iron core exceeds the Chandrasekhar limit. In a fraction of a second, it collapses. Then — nothing. A black hole is born from the ashes of a supernova.", scienceDetail: "When the iron core exceeds ~1.44 solar masses, electron degeneracy pressure is overwhelmed. The core collapses to nuclear density (~10¹⁷ kg/m³) in 0.25 seconds. If the remnant exceeds ~3 solar masses, not even neutron degeneracy pressure can halt collapse — a black hole forms.", color: "#9c27b0" },
  { id: "singularity", label: "Singularity & Event Horizon", timecode: "t = milliseconds", description: "The Schwarzschild radius defines the event horizon — the point of no return. Inside, escape velocity exceeds the speed of light. The singularity: infinite density, zero volume.", scienceDetail: "Schwarzschild radius: r_s = 2GM/c². For a 10 solar mass black hole, r_s ≈ 30 km. The singularity is a mathematical construct where general relativity predicts infinite curvature — most physicists believe quantum gravity will resolve this divergence.", color: "#4a0080" },
  { id: "accretion", label: "Accretion Disc", timecode: "Early evolution", description: "Gas from a companion star spirals inward. Conservation of angular momentum forms a disc. Friction heats the inner edge to millions of Kelvin — hotter than any star's surface, glowing blue-white.", scienceDetail: "The innermost stable circular orbit (ISCO) for a Schwarzschild BH is at 3× the Schwarzschild radius. Material inside this orbit spirals inward in milliseconds. The temperature follows T ∝ r^(-3/4), reaching 10⁷ K near the ISCO for stellar-mass BHs — emitting X-rays.", color: "#ff6b35" },
  { id: "lensing", label: "Gravitational Lensing", timecode: "Photon sphere: 1.5× r_s", description: "Mass warps spacetime. Light bends around the black hole — background stars appear duplicated, stretched into rings. At the photon sphere, light can orbit indefinitely.", scienceDetail: "The photon sphere exists at 1.5× the Schwarzschild radius where photons can travel in unstable circular orbits. Gravitational lensing follows the Schwarzschild metric. An Einstein ring forms when source, lens, and observer are perfectly aligned.", color: "#4fc3f7" },
  { id: "merger", label: "Black Hole Merger", timecode: "Inspiraling binary", description: "Two black holes spiral together, emitting gravitational waves that stretch and squeeze spacetime itself. The final merger — the universe's most violent event since the Big Bang.", scienceDetail: "Binary black hole mergers were first detected by LIGO on September 14, 2015 (GW150914). The two BHs (36 and 29 solar masses) merged at ~150 Mpc distance, releasing 3 solar masses worth of energy as gravitational waves in 0.2 seconds. Peak luminosity: 3.6 × 10⁴⁹ watts.", color: "#a78bfa" },
];

const N = 6000;

export default function BlackHoleSim() {
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
    document.title = "Black Hole Formation — STELLARA Simulations";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 25, 60);
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
          // Collapsing sphere
          const rad = r < 0.5 ? r * 30 : 25 + r * 25;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Event horizon — dark void with ring
          if (i < N * 0.2) {
            const rad = r * 3;
            arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
          } else {
            // Surrounding field
            const rad = 15 + r * 35;
            arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta) * 0.3; arr[idx + 2] = rad * Math.cos(phi);
          }
        } else if (pi === 2) {
          // Accretion disc — flat ring
          if (i < N * 0.8) {
            const dR = 4 + r * 30;
            arr[idx] = dR * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * (0.5 + r * 2); arr[idx + 2] = dR * Math.sin(theta);
          } else {
            // Jets
            arr[idx] = (Math.random() - 0.5) * 3; arr[idx + 1] = 5 + r * 35; arr[idx + 2] = (Math.random() - 0.5) * 3;
          }
        } else if (pi === 3) {
          // Background stars lensed into arcs
          const arcAngle = theta; const arcR = 20 + r * 25;
          arr[idx] = arcR * Math.cos(arcAngle + Math.sin(arcAngle) * 0.3);
          arr[idx + 1] = (Math.random() - 0.5) * 10;
          arr[idx + 2] = arcR * Math.sin(arcAngle + Math.sin(arcAngle) * 0.3);
        } else {
          // Two BHs spiraling together
          const bh = i < N / 2 ? 0 : 1;
          const bhAngle = (bh === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.5;
          const bhR = 8 + r * 5;
          arr[idx] = bhR * Math.cos(bhAngle) + (Math.random() - 0.5) * 8;
          arr[idx + 1] = (Math.random() - 0.5) * 8;
          arr[idx + 2] = bhR * Math.sin(bhAngle) + (Math.random() - 0.5) * 8;
        }
      }
      return arr;
    });

    const phaseColors = [0xcc1100, 0x110022, 0xffffff, 0x4fc3f7, 0xff8800].map(c => new THREE.Color(c));
    const positions = new Float32Array(N * 3); const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3]; positions[i * 3 + 1] = phasePos[0][i * 3 + 1]; positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      cols[i * 3] = phaseColors[0].r; cols[i * 3 + 1] = phaseColors[0].g; cols[i * 3 + 2] = phaseColors[0].b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({ size: 1.35, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Shockwave ring for core collapse phase
    const shockRingGeo = new THREE.RingGeometry(0, 1, 64);
    const shockRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const shockwave = new THREE.Mesh(shockRingGeo, shockRingMat);
    scene.add(shockwave);
    let shockwaveStartTime = -1;
    let prevPhaseIdx = -1;

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
      const rotSpeed = phaseIdx === 2 ? 0.005 : phaseIdx === 4 ? 0.008 : 0.001;
      pts.rotation.y += rotSpeed * speedRef.current;

      // Shockwave on collapse phase (0)
      if (phaseIdx === 0 && prevPhaseIdx !== 0) { shockwaveStartTime = performance.now(); }
      prevPhaseIdx = phaseIdx;
      if (shockwaveStartTime >= 0) {
        const elapsed = (performance.now() - shockwaveStartTime) / 1000;
        shockwave.scale.setScalar(Math.max(elapsed * 30, 0.01));
        shockRingMat.opacity = Math.max(0, 0.8 - elapsed * 0.4);
      }

      setCurrentPhaseIndex(phaseIdx); setTotalProgress(Math.min(simTime / TOTAL, 1));
      composer.render();
    }
    animate();
    const onResize = () => { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); composer.dispose(); renderer.dispose(); geo.dispose(); mat.dispose(); shockRingGeo.dispose(); shockRingMat.dispose(); el.removeChild(renderer.domElement); };
  }, []);

  const handlePhaseJump = useCallback((idx: number) => { jumpRef.current = idx / PHASES.length; setCurrentPhaseIndex(idx); setTotalProgress(idx / PHASES.length); }, []);
  const handleRestart = useCallback(() => { jumpRef.current = 0; setTotalProgress(0); setCurrentPhaseIndex(0); setIsPlaying(true); }, []);

  return (
    <SimulationLayout title="Black Hole Formation" subtitle="Where spacetime ends" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="A black hole is where God divided by zero." closingAuthor="Stephen Wright" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
