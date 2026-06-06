import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "cloud", label: "Molecular Cloud", timecode: "Initial state", description: "A vast, cold molecular cloud — mostly hydrogen and helium — floats in space. Temperatures near absolute zero. It appears nearly invisible.", scienceDetail: "Molecular clouds can be 50–300 light-years across and contain 100–10,000,000 solar masses. They are primarily molecular hydrogen (H₂), CO, and dust. Internal turbulence and magnetic fields prevent immediate collapse.", color: "#2d3a4a" },
  { id: "shockwave", label: "Shockwave Trigger", timecode: "Year 0", description: "A nearby supernova sends a shockwave through the cloud, compressing one region beyond the Jeans stability limit. Collapse begins.", scienceDetail: "The Jeans criterion: when the thermal pressure can no longer resist gravitational collapse. M_Jeans = (5kT/Gm)^(3/2) × (3/4πρ)^(1/2). The shockwave reduces the critical mass, triggering fragmentation into multiple collapsing cores.", color: "#e53935" },
  { id: "collapse", label: "Protostellar Collapse", timecode: "Years 0 — 100,000", description: "The cloud core spirals inward. Conservation of angular momentum spins it faster, forming a protoplanetary disc. Heat builds at the centre.", scienceDetail: "Free-fall collapse takes ~100,000 years. The infalling gas becomes optically thick, trapping radiation and heating the core. A hydrostatic core forms when thermal pressure first halts collapse — the 'first Larson core'.", color: "#ff9f43" },
  { id: "jets", label: "Bipolar Jets", timecode: "Years 100,000 — 500,000", description: "Powerful jets of ionised plasma shoot from the poles along the rotation axis — visible for light-years. The disc channels material inward while jets clear the way.", scienceDetail: "Jets are driven by magnetocentrifugal acceleration — magnetic field lines threading the disc act like a sling. Jet velocities reach 100–1000 km/s. They carry away angular momentum, allowing the protostar to accrete mass.", color: "#60a5fa" },
  { id: "ttauri", label: "T-Tauri Phase", timecode: "Years 500,000 — 50 My", description: "The young star blasts away remaining gas with powerful stellar winds. The protoplanetary disc begins to clear. Planets are forming in the disc.", scienceDetail: "T-Tauri stars have 1–10× the Sun's luminosity but much stronger stellar winds (T-Tauri wind). This phase lasts ~50 million years for Sun-like stars. Disk clearing occurs through photoevaporation, planet formation, and stellar winds.", color: "#ffd54f" },
  { id: "mainseq", label: "Main Sequence Arrival", timecode: "~50 million years", description: "Core temperature reaches 15 million Kelvin. Hydrogen fusion ignites. Hydrostatic equilibrium — the star is born. It will burn for billions of years.", scienceDetail: "The proton-proton chain begins: 4H → He-4 + 2e⁺ + 2ν + 26.7 MeV. Radiation pressure from fusion precisely balances gravity — hydrostatic equilibrium. A Sun-like star will remain on the main sequence for ~10 billion years.", color: "#ffd54f" },
];

const N = 6000;

export default function StarBirthSim() {
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
    document.title = "Birth of a Star — STELLARA Simulations";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 30, 70);
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const composer = makeBloomComposer(renderer, scene, camera, W, H);

    const phasePos: Float32Array[] = PHASES.map((_, pi) => {
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const idx = i * 3;
        const r = Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        if (pi === 0) {
          // Large diffuse cloud
          const rad = 20 + r * 40;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Shockwave compression — denser region forming
          const rad = Math.random() < 0.6 ? 5 + r * 20 : 20 + r * 30;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 2) {
          // Collapsing with disc forming
          if (i < N * 0.7) {
            // Disc
            const dR = r * 25;
            arr[idx] = dR * Math.cos(theta);
            arr[idx + 1] = (Math.random() - 0.5) * 3 * (1 - r);
            arr[idx + 2] = dR * Math.sin(theta);
          } else {
            // Central protostar
            const rad2 = r * 4;
            arr[idx] = rad2 * Math.sin(phi) * Math.cos(theta);
            arr[idx + 1] = rad2 * Math.sin(phi) * Math.sin(theta);
            arr[idx + 2] = rad2 * Math.cos(phi);
          }
        } else if (pi === 3) {
          // Jets + disc
          if (i < N * 0.3) {
            // North jet
            arr[idx] = (Math.random() - 0.5) * 4;
            arr[idx + 1] = 5 + r * 40;
            arr[idx + 2] = (Math.random() - 0.5) * 4;
          } else if (i < N * 0.6) {
            // South jet
            arr[idx] = (Math.random() - 0.5) * 4;
            arr[idx + 1] = -(5 + r * 40);
            arr[idx + 2] = (Math.random() - 0.5) * 4;
          } else {
            // Disc
            const dR = 1 + r * 20;
            arr[idx] = dR * Math.cos(theta);
            arr[idx + 1] = (Math.random() - 0.5) * 2;
            arr[idx + 2] = dR * Math.sin(theta);
          }
        } else if (pi === 4) {
          // T-Tauri: clearing disc + wind
          if (i < N * 0.5) {
            // Remaining disc
            const dR = 2 + r * 15;
            arr[idx] = dR * Math.cos(theta);
            arr[idx + 1] = (Math.random() - 0.5) * 1.5;
            arr[idx + 2] = dR * Math.sin(theta);
          } else {
            // Stellar wind outward
            const rad2 = 5 + r * 35;
            arr[idx] = rad2 * Math.sin(phi) * Math.cos(theta);
            arr[idx + 1] = rad2 * Math.sin(phi) * Math.sin(theta);
            arr[idx + 2] = rad2 * Math.cos(phi);
          }
        } else {
          // Star: tight bright sphere + faint disc
          if (i < N * 0.2) {
            const rad2 = r * 5;
            arr[idx] = rad2 * Math.sin(phi) * Math.cos(theta);
            arr[idx + 1] = rad2 * Math.sin(phi) * Math.sin(theta);
            arr[idx + 2] = rad2 * Math.cos(phi);
          } else {
            const dR = 5 + r * 10;
            arr[idx] = dR * Math.cos(theta);
            arr[idx + 1] = (Math.random() - 0.5) * 0.8;
            arr[idx + 2] = dR * Math.sin(theta);
          }
        }
      }
      return arr;
    });

    const phaseColors = [0x1a1a2e, 0xcc1100, 0xff6600, 0x88ccff, 0xffd54f, 0xfffde7].map(c => new THREE.Color(c));
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3]; positions[i * 3 + 1] = phasePos[0][i * 3 + 1]; positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      colors[i * 3] = phaseColors[0].r; colors[i * 3 + 1] = phaseColors[0].g; colors[i * 3 + 2] = phaseColors[0].b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
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
        const idx = i * 3;
        const fp = phasePos[phaseIdx], tp = phasePos[next];
        positions[idx] = fp[idx] + (tp[idx] - fp[idx]) * t;
        positions[idx + 1] = fp[idx + 1] + (tp[idx + 1] - fp[idx + 1]) * t;
        positions[idx + 2] = fp[idx + 2] + (tp[idx + 2] - fp[idx + 2]) * t;
        colors[idx] = fc.r + (tc.r - fc.r) * t; colors[idx + 1] = fc.g + (tc.g - fc.g) * t; colors[idx + 2] = fc.b + (tc.b - fc.b) * t;
      }
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      pts.rotation.y += 0.002 * speedRef.current;
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
    <SimulationLayout title="Birth of a Star" subtitle="From cold cloud to nuclear furnace" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="Every atom in your body came from a star that exploded. You are all stardust." closingAuthor="Lawrence Krauss" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
