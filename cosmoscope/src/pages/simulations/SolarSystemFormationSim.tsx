import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "nebula", label: "Molecular Cloud", timecode: "4.6 billion years ago", description: "A vast cold cloud of hydrogen, helium, and trace heavy elements drifts in the Milky Way's Orion Arm. A nearby supernova sends a shockwave — and the collapse begins.", scienceDetail: "The solar nebula contained material from multiple generations of stars. The presence of short-lived radioactive isotopes (Al-26, Fe-60) in meteorites proves a supernova triggered collapse within 1–2 million years of the cloud's formation.", color: "#2d3a4a" },
  { id: "solar-nebula", label: "Protoplanetary Disc", timecode: "4.598 Bya", description: "99.8% of the collapsing mass falls to the centre — the proto-Sun. The remaining 0.2% forms a rotating protoplanetary disc of gas and dust spanning 100+ AU.", scienceDetail: "The solar nebula's composition: ~75% H, ~23% He, ~2% heavier elements. The disc was ~0.013 solar masses. Turbulence in the disc (magnetorotational instability) drove angular momentum outward, allowing mass to accrete inward onto the proto-Sun.", color: "#ff9f43" },
  { id: "accretion", label: "Dust to Planetesimals", timecode: "4.597 — 4.570 Bya", description: "Dust grains collide and stick. Centimetre-scale grains become metre-scale rocks, then kilometre-scale planetesimals. The transition from cm to metre is still not fully understood.", scienceDetail: "The 'metre-barrier' problem: metre-sized objects drift inward too fast (Epstein drag regime) to grow further. Solutions include streaming instability (dust concentrates into dense clumps that then collapse gravitationally into planetesimals directly) and pebble accretion.", color: "#c8a96e" },
  { id: "frost-line", label: "Frost Line & Differentiation", timecode: "~4.568 Bya", description: "At 2.7 AU from the proto-Sun, water ice becomes stable. Inside: rocky silicate bodies. Outside: ice-rich bodies that become gas and ice giant cores. Jupiter begins to form.", scienceDetail: "The frost line is where the partial pressure of water vapour equals the sublimation pressure of water ice — at ~170 K. Jupiter's core (10–15 Earth masses of rock and ice) formed before the disc dissipated, triggering runaway gas accretion over ~1 million years.", color: "#60a5fa" },
  { id: "protoplanets", label: "Protoplanets & Chaos", timecode: "4.540 — 4.500 Bya", description: "Runaway accretion creates planetary embryos — Mars-sized bodies competing gravitationally. Their orbits destabilise. Giant impacts are frequent. The inner solar system is violent.", scienceDetail: "Runaway accretion: larger bodies have larger gravitational cross-sections, growing faster. Oligarchic growth: a few large embryos (Moon to Mars mass) dominate, clearing their orbital zones. The Nice Model shows Jupiter and Saturn migrating through the disc, scattering embryos.", color: "#e53935" },
  { id: "moon-forming", label: "The Giant Impact", timecode: "~4.500 Bya", description: "A Mars-sized body called Theia strikes proto-Earth. The impact vaporises both bodies' mantles. The debris cloud coalesces into the Moon — Earth's eternal companion — within ~100 years.", scienceDetail: "Giant Impact Hypothesis (Hartmann & Davis, 1975): explains the Moon's low iron content (it's mostly mantle material), its high angular momentum, and the identical oxygen isotope ratios of Earth and Moon. The impact lasted ~24 hours. Simulations match the Moon's current orbit.", color: "#ffd54f" },
  { id: "bombardment", label: "Late Heavy Bombardment", timecode: "~3.9 Bya", description: "Jupiter and Saturn migrate outward, destabilising the asteroid belt. The inner solar system is bombarded for 300 million years. The Moon's ancient craters record this violent era.", scienceDetail: "The Nice Model predicts Jupiter and Saturn crossed their 2:1 mean-motion resonance ~600 My after solar system formation. This sent swarms of asteroids and comets into the inner solar system — the Late Heavy Bombardment. Evidence: the age of lunar basin impacts clustering at ~3.9 Ga.", color: "#ff6b35" },
  { id: "today", label: "The Solar System Today", timecode: "Present day", description: "Eight planets. Hundreds of moons. Millions of asteroids. Countless comets. And one habitable world — Earth — where chemistry became biology, and biology became curiosity.", scienceDetail: "The solar system reached dynamical stability after the LHB. All eight planets now orbit in nearly circular, nearly coplanar orbits — the result of 4.6 billion years of gravitational sculpting. The Sun has 5 billion years of hydrogen fuel remaining.", color: "#4fc3f7" },
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
    document.title = "Solar System Formation — STELLARA Simulations";
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
    <SimulationLayout title="Solar System Formation" subtitle="4.6 billion years of cosmic construction" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="We are the local embodiment of a Cosmos grown to self-awareness." closingAuthor="Carl Sagan" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
