import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "main", label: "A steady star", short: "Steady", timecode: "Today", description: "Like the Sun now: a stable, middle aged star fusing hydrogen at its centre, its gravity balanced by the pressure of hot gas.", scienceDetail: "The Sun is 4.6 billion years old and has about 5 billion years of core hydrogen left. Every second it turns about 600 million tonnes of hydrogen into helium and gives out 3.8 × 10²⁶ watts.", color: "#F3DDB0" },
  { id: "subgiant", label: "The core runs out", short: "Subgiant", timecode: "In about 5 billion years", description: "The hydrogen at the centre runs out. The core shrinks while hydrogen keeps burning in a shell around it, and the star swells and brightens.", scienceDetail: "As the core contracts it heats up, and the shell of hydrogen around it burns faster. The Sun will slowly grow and brighten over the next billion years or so.", color: "#ffb74d" },
  { id: "red-giant", label: "Red giant", short: "Red giant", timecode: "About 7 billion years from now", description: "The outer layers swell enormously. Mercury is swallowed, then Venus. Earth may be too. The Sun becomes a red giant around 200 times its present size.", scienceDetail: "At its largest, the Sun's radius may reach about 1 au. Whether Earth survives depends on how much mass the Sun loses as it grows. Either way, in about a billion years from now the Sun will already be bright enough to boil Earth's oceans away.", color: "#e53935" },
  { id: "helium", label: "Helium flash", short: "Flash", timecode: "About 7.6 billion years from now", description: "The helium core ignites all at once. For a few seconds it produces about as much power as a whole galaxy, all of it hidden deep inside the star.", scienceDetail: "The core is so dense that its pressure no longer depends on temperature, a quantum effect. When helium starts to fuse, the core heats without expanding to cool itself, and the burning runs away until it settles down.", color: "#ff9f43" },
  { id: "pn", label: "Planetary nebula", short: "Nebula", timecode: "About 8 billion years from now", description: "The outer layers drift away in shells of glowing gas, lit by the hot core left behind. These are some of the most beautiful sights in the sky.", scienceDetail: "A planetary nebula glows for only around 10,000 to 20,000 years. Some are round like rings, such as the Helix, some have two lobes like the Butterfly, and some have many shells, like the Cat's Eye.", color: "#60a5fa" },
  { id: "white-dwarf", label: "White dwarf", short: "White dwarf", timecode: "For trillions of years", description: "What remains is a white dwarf: about the size of Earth, made of carbon and oxygen, with no fusion left. It slowly cools.", scienceDetail: "White dwarfs are held up by electron degeneracy pressure, a quantum effect that stops electrons being squeezed together. They cannot be heavier than about 1.4 times the Sun's mass. Cooling all the way to a cold black dwarf would take far longer than the universe has existed.", color: "#a5f3fc" },
  { id: "supernova", label: "How bigger stars die", short: "Supernova", timecode: "Stars over 8 times the Sun's mass", description: "Stars more than eight times the Sun's mass end differently. Their iron cores collapse in less than a second, rebound, and blast the star apart as a supernova.", scienceDetail: "Fusing iron takes energy rather than giving it out, so once the core is iron nothing can hold it up. Above about 1.4 times the Sun's mass it collapses at a quarter of the speed of light in a fraction of a second. The rebound and a flood of neutrinos throw the outer layers off at 10,000 to 30,000 km per second.", color: "#ff6b35" },
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
    document.title = "Life & Death of a Star · PALE";
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
    const mat = new THREE.PointsMaterial({ size: 2.25, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
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
    <SimulationLayout title="Life & Death of a Star" subtitle="Five billion years in five minutes" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="Much of the carbon in you was made in stars like this one." onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
