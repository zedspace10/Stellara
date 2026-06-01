import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "main", label: "Main Sequence", timecode: "Present day", description: "A stable, middle-aged star burns hydrogen in its core. Gravity and radiation pressure are perfectly balanced — hydrostatic equilibrium.", scienceDetail: "The Sun has been on the main sequence for 4.6 billion years and has ~5 billion left. It converts 600 million tonnes of hydrogen to helium every second via the proton-proton chain, releasing 3.8 × 10²⁶ watts.", color: "#ffd54f" },
  { id: "subgiant", label: "Subgiant Phase", timecode: "+5 billion years", description: "Hydrogen in the core is exhausted. The core contracts under gravity while hydrogen burning moves to a shell around it. The star brightens.", scienceDetail: "The hydrogen-depleted core contracts (Kelvin-Helmholtz contraction), releasing gravitational energy that heats the surrounding shell. Shell burning is more efficient, causing the star's luminosity to increase ~30% over the next billion years.", color: "#ffb74d" },
  { id: "red-giant", label: "Red Giant", timecode: "+5.4 billion years", description: "The outer layers expand enormously. Mercury is engulfed. Venus is engulfed. Earth may be too. The Sun becomes a bloated red giant, 200× its current size.", scienceDetail: "The Sun will expand to ~200 solar radii (0.93 AU). Whether Earth is engulfed depends on the Sun's mass loss rate during the AGB phase. Even if not physically engulfed, Earth's oceans will boil away within ~1 billion years.", color: "#e53935" },
  { id: "helium", label: "Helium Flash", timecode: "+5.4 Gy + 1 My", description: "The degenerate helium core suddenly ignites in an uncontrolled thermonuclear flash — releasing as much energy as a small galaxy for a few seconds. Invisible from outside.", scienceDetail: "In degenerate matter, pressure is independent of temperature (it's a quantum effect — Pauli exclusion principle). When helium fusion ignites, there's no pressure feedback, causing a runaway thermal reaction — the helium flash. ~10⁴⁴ J released in seconds.", color: "#ff9f43" },
  { id: "pn", label: "Planetary Nebula", timecode: "+7 billion years", description: "The outer layers are gently expelled in waves — glowing shells of ionised gas lit by ultraviolet radiation from the dying core. Among the most beautiful objects in the universe.", scienceDetail: "Planetary nebulae last ~20,000 years. They are ionised by the UV radiation of the contracting hot core. Common morphologies include spherical (like the Helix Nebula), bipolar (like the Butterfly Nebula), and complex multi-shell structures (like the Cat's Eye Nebula).", color: "#60a5fa" },
  { id: "white-dwarf", label: "White Dwarf", timecode: "+7 billion years (final state)", description: "An Earth-sized remnant of compressed carbon and oxygen, left behind. No fusion — just slowly radiating stored heat over trillions of years.", scienceDetail: "White dwarfs are supported by electron degeneracy pressure (Pauli exclusion principle prevents electrons from occupying the same quantum state). They have a maximum mass of 1.44 solar masses (Chandrasekhar limit). An isolated white dwarf will cool for 10¹⁵ years before becoming a 'black dwarf'.", color: "#a5f3fc" },
  { id: "supernova", label: "Core-Collapse Supernova", timecode: "Massive star death", description: "A star 8× more massive than the Sun exhausts all nuclear fuels. The iron core collapses in less than a second — then bounces. The shockwave destroys the star.", scienceDetail: "Iron fusion absorbs energy rather than releasing it. When the core exceeds the Chandrasekhar limit (1.44 M☉), it collapses at 1/4 the speed of light in ~0.25 seconds. The collapse rebounds, creating a shockwave that ejects the entire stellar envelope at 10,000–30,000 km/s — a supernova.", color: "#ff6b35" },
];

const N = 6500;

export default function StarDeathSim() {
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
    document.title = "Life & Death of a Star — STELLARA Simulations";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 20, 60);
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
          // Compact star
          const rad = r * 6; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Subgiant — slightly expanded
          const rad = 2 + r * 10; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 2) {
          // Red giant — huge
          const rad = 15 + r * 25; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 3) {
          // Helium flash — burst outward then collapse
          const rad = 5 + r * 40; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 4) {
          // Planetary nebula — shells
          const shell = Math.floor(Math.random() * 3);
          const shellR = 20 + shell * 12 + r * 8;
          arr[idx] = shellR * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = shellR * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = shellR * Math.cos(phi);
        } else if (pi === 5) {
          // White dwarf — tiny compact
          if (i < N * 0.3) {
            const rad = r * 2; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
          } else {
            // Fading outer nebula
            const rad = 30 + r * 20; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
          }
        } else {
          // Supernova — explosive sphere + bright core
          if (i < N * 0.15) {
            const rad = r * 1.5; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
          } else {
            const rad = 5 + r * 55; arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
          }
        }
      }
      return arr;
    });

    const phaseColors = [0xffd54f, 0xffcc44, 0xcc2200, 0xff8800, 0x88bbff, 0xffffff, 0xff4400].map(c => new THREE.Color(c));
    const positions = new Float32Array(N * 3); const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3]; positions[i * 3 + 1] = phasePos[0][i * 3 + 1]; positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      cols[i * 3] = phaseColors[0].r; cols[i * 3 + 1] = phaseColors[0].g; cols[i * 3 + 2] = phaseColors[0].b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Shockwave ring for supernova phase
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
      pts.rotation.y += 0.001 * speedRef.current;

      // Shockwave on supernova phase (index 6)
      if (phaseIdx === 6 && prevPhaseIdx !== 6) { shockwaveStartTime = performance.now(); }
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
    <SimulationLayout title="Life & Death of a Star" subtitle="Five billion years in five minutes" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="The death of one star is the birth of thousands of worlds." closingAuthor="Neil deGrasse Tyson" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
