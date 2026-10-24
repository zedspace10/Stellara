import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "collapse", label: "Core collapse", short: "Collapse", timecode: "The first second", description: "The iron core of a massive star collapses. If enough mass falls in, nothing can stop it, and a black hole is born.", scienceDetail: "When the core passes about 1.4 times the Sun's mass, it collapses to the density of an atomic nucleus. If what is left is heavier than about 2 to 3 times the Sun's mass, even neutron pressure cannot hold it up, and it becomes a black hole.", color: "#A995FF" },
  { id: "singularity", label: "The event horizon", short: "Horizon", timecode: "Milliseconds later", description: "The event horizon forms: the boundary beyond which not even light can escape. At the centre, general relativity predicts a point of infinite density.", scienceDetail: "The horizon's radius is 2GM/c², about 30 km for a black hole ten times the Sun's mass. Most physicists expect a theory of quantum gravity to replace the infinite density at the centre with something finite.", color: "#4a0080" },
  { id: "accretion", label: "Accretion disc", short: "Disc", timecode: "Later", description: "Gas pulled from a companion star spirals inward and forms a disc. Friction heats its inner edge to millions of degrees, glowing in X rays.", scienceDetail: "Gas can orbit stably only down to three times the horizon's radius. Inside that it plunges in. The inner disc of a black hole a few times the Sun's mass reaches around 10 million degrees.", color: "#ff6b35" },
  { id: "lensing", label: "Bent light", short: "Lensing", timecode: "Near the black hole", description: "Gravity bends light around the black hole. Stars behind it appear stretched and doubled, and can form rings.", scienceDetail: "At one and a half times the horizon's radius is the photon sphere, where light can travel in circles, though only unstably. When a background star, the black hole and the viewer line up exactly, the star appears as a ring, called an Einstein ring.", color: "#8DEBFF" },
  { id: "merger", label: "Black holes merge", short: "Merger", timecode: "When two meet", description: "Two black holes spiral together, sending out gravitational waves that stretch and squeeze space itself.", scienceDetail: "The first merger was detected by LIGO on 14 September 2015. Black holes of about 36 and 29 times the Sun's mass, 1.3 billion light years away, merged and turned three Suns' worth of mass into gravitational waves in a fraction of a second.", color: "#a78bfa" },
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
    document.title = "Black Hole Formation · PALE";
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
    const mat = new THREE.PointsMaterial({ size: 2.0, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
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
    <SimulationLayout title="Black Hole Formation" subtitle="Where spacetime ends" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="We first heard two black holes collide in 2015. The waves had been travelling for 1.3 billion years." onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
