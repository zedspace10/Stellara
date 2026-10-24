import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";
import { makeCircleTex, makeBloomComposer } from "./simUtils";

const PHASES: SimPhase[] = [
  { id: "approach", label: "A safe distance", short: "Approach", timecode: "1,000 times the horizon radius", description: "The black hole is a perfect dark disc against the stars. Already, the stars around it look slightly bent.", scienceDetail: "Out here gravity is strong but nothing dramatic happens. You could orbit safely. Light from the horizon area takes a fraction of a second to reach you for a black hole a few times the Sun's mass.", color: "#8DEBFF" },
  { id: "time-dilation", label: "Time slows", short: "Time", timecode: "10 times the horizon radius", description: "Your clock now runs slower than clocks far away. Starlight reaching you is shifted to bluer colours. The black hole grows to fill more of your view.", scienceDetail: "Hovering here, your clock runs at about 95% of the rate of a distant clock. The same effect makes light falling in from far away arrive bluer, by the same factor.", color: "#a78bfa" },
  { id: "photon-sphere", label: "The photon sphere", short: "Photons", timecode: "1.5 times the horizon radius", description: "Here light itself can circle the black hole. Hovering here, the black hole fills half your sky, and the rest of the universe is squeezed into the other half.", scienceDetail: "The photon sphere lies at 3GM/c². Orbits of light here are unstable: the smallest nudge sends a light ray falling in or escaping. Light can loop round, so in principle you could see the back of your own head.", color: "#F3DDB0" },
  { id: "crossing", label: "Crossing the horizon", short: "Horizon", timecode: "At the horizon", description: "You cross the event horizon. Locally, nothing feels different. There is no wall. But there is no way back.", scienceDetail: "For a supermassive black hole, the stretching force at the horizon is gentle, so crossing is uneventful. For a small one, you would be stretched apart before you got there. Some ways of drawing spacetime make the horizon look special, but others show nothing happens locally there.", color: "#ff9f43" },
  { id: "interior", label: "Inside", short: "Inside", timecode: "Between the horizon and the centre", description: "Space and time trade places. The centre is no longer a place ahead of you. It is a moment in your future, as unavoidable as tomorrow.", scienceDetail: "Inside the horizon, moving inward is as inevitable as moving forward in time. On a Penrose diagram the singularity is a moment rather than a location. Black holes slowly evaporate by Hawking radiation, but one the Sun's mass would take about 10⁶⁷ years.", color: "#A995FF" },
  { id: "singularity", label: "The singularity", short: "Centre", timecode: "Where the paths end", description: "Every path leads here. General relativity predicts infinite density, which almost certainly means the theory has reached its limit. What really happens is unknown.", scienceDetail: "Most physicists think a theory of quantum gravity will replace the singularity with something finite. Ideas from string theory and loop quantum gravity differ on what. We do not know yet.", color: "#ffffff" },
];

const N = 5000;

export default function InsideBlackHoleSim() {
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
    document.title = "Inside a Black Hole · PALE";
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, W / H, 0.01, 2000);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const composer = makeBloomComposer(renderer, scene, camera, W, H);

    // Grid lines for spacetime warping
    const gridGroup = new THREE.Group();
    const gridMat = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.4 });
    for (let i = -10; i <= 10; i++) {
      const hGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-50, 0, i * 5), new THREE.Vector3(50, 0, i * 5)]);
      const vGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 5, 0, -50), new THREE.Vector3(i * 5, 0, 50)]);
      gridGroup.add(new THREE.Line(hGeo, gridMat));
      gridGroup.add(new THREE.Line(vGeo, gridMat));
    }
    gridGroup.position.y = -20;
    scene.add(gridGroup);

    const phasePos: Float32Array[] = PHASES.map((_, pi) => {
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const idx = i * 3; const r = Math.random(); const theta = Math.random() * Math.PI * 2; const phi = Math.acos(2 * Math.random() - 1);
        if (pi === 0) {
          // Starfield sphere — safe distance
          const rad = 35 + r * 15;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        } else if (pi === 1) {
          // Stars compressing toward a band
          const rad = 30 + r * 15;
          const compPhi = phi * 0.6 + Math.PI * 0.2; // compress toward equator
          arr[idx] = rad * Math.sin(compPhi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(compPhi) * Math.sin(theta) * 0.4; arr[idx + 2] = rad * Math.cos(compPhi);
        } else if (pi === 2) {
          // Photon sphere — ring of light + stars in ring
          const ringR = 30 + r * 5;
          arr[idx] = ringR * Math.cos(theta); arr[idx + 1] = (Math.random() - 0.5) * 2; arr[idx + 2] = ringR * Math.sin(theta);
        } else if (pi === 3) {
          // Crossing — universe shrinks to point above
          if (i < N * 0.5) {
            // Stars shrinking to top point
            const t2 = r; const shrinkR = 5 + (1 - t2) * 20;
            arr[idx] = shrinkR * Math.cos(theta) * (1 - t2 * 0.5); arr[idx + 1] = 10 + t2 * 20; arr[idx + 2] = shrinkR * Math.sin(theta) * (1 - t2 * 0.5);
          } else {
            // Surrounding darkness
            const rad = r * 8;
            arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta) - 5; arr[idx + 2] = rad * Math.cos(phi);
          }
        } else if (pi === 4) {
          // Interior — warped grid particles
          arr[idx] = (Math.random() - 0.5) * 60; arr[idx + 1] = (Math.random() - 0.5) * 15; arr[idx + 2] = (Math.random() - 0.5) * 60;
        } else {
          // Singularity — everything converges to centre
          const rad = r * 2;
          arr[idx] = rad * Math.sin(phi) * Math.cos(theta); arr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta); arr[idx + 2] = rad * Math.cos(phi);
        }
      }
      return arr;
    });

    const phaseColors = [0x4fc3f7, 0x8855ff, 0xff9900, 0xcc3300, 0x220044, 0xffffff].map(c => new THREE.Color(c));
    const positions = new Float32Array(N * 3); const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = phasePos[0][i * 3]; positions[i * 3 + 1] = phasePos[0][i * 3 + 1]; positions[i * 3 + 2] = phasePos[0][i * 3 + 2];
      cols[i * 3] = phaseColors[0].r; cols[i * 3 + 1] = phaseColors[0].g; cols[i * 3 + 2] = phaseColors[0].b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mat = new THREE.PointsMaterial({ size: 2.5, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: makeCircleTex(), alphaTest: 0.005 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const PHASE_DUR = 9, TOTAL = PHASES.length * PHASE_DUR;
    let animId: number, simTime = 0, lastTime = performance.now(), t2 = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now(); const delta = (now - lastTime) / 1000; lastTime = now;
      if (jumpRef.current !== null) { simTime = jumpRef.current * TOTAL; jumpRef.current = null; }
      if (!isPausedRef.current) simTime = Math.min(simTime + delta * speedRef.current, TOTAL - 0.001);
      t2 += delta * 0.3;
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
      // Warp grid based on phase
      const warpAmt = phaseIdx >= 4 ? (phaseIdx - 3) * 0.5 : 0;
      gridGroup.children.forEach((child, ci) => {
        if (child instanceof THREE.Line) {
          const posAttr = child.geometry.attributes.position as THREE.BufferAttribute;
          const orig = ci % 2 === 0 ? -50 + Math.floor(ci / 2 - 10) * 5 : -50 + Math.floor(ci / 2 - 10) * 5;
          for (let j = 0; j < posAttr.count; j++) {
            posAttr.setY(j, -20 + Math.sin(posAttr.getX(j) * 0.1 + t2) * warpAmt + Math.sin(posAttr.getZ(j) * 0.1 + t2 * 0.7) * warpAmt);
          }
          posAttr.needsUpdate = true;
        }
      });
      gridMat.opacity = Math.min(0.4 + warpAmt * 0.2, 0.9);
      pts.rotation.y += 0.001 * speedRef.current;
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
    <SimulationLayout title="Inside a Black Hole" subtitle="Beyond the event horizon, as physics predicts it" phases={PHASES} currentPhaseIndex={currentPhaseIndex} totalProgress={totalProgress} isPlaying={isPlaying} scienceMode={scienceMode} speed={speed} closingQuote="What happens at the centre? Nobody knows yet." onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onRestart={handleRestart} onSpeedChange={setSpeed} onPhaseJump={handlePhaseJump} onScrub={(p) => { jumpRef.current = p; setTotalProgress(p); }} onScienceModeToggle={() => setScienceMode(v => !v)}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </SimulationLayout>
  );
}
