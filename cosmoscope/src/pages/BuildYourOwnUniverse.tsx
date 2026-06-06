import { useEffect, useRef, useState, useCallback } from "react";
import BuildUniverseResults from "./BuildUniverseResults";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Shuffle, Play, Pause, Share2, ChevronDown } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface Params {
  G: number;
  darkMatter: number;
  darkEnergy: number;
  hubble: number;
  matterRatio: number;
  baryonDensity: number;
  fluctuation: number;
  dimensions: 2 | 3 | 4;
}

type OutcomeId = "our_universe" | "dead_universe" | "big_rip" | "empty_universe" | "annihilation" | "black_hole" | "stellar_nursery";

// ── Defaults ───────────────────────────────────────────────────
const DEFAULTS: Params = { G: 1, darkMatter: 1, darkEnergy: 1, hubble: 1, matterRatio: 1, baryonDensity: 1, fluctuation: 1, dimensions: 3 };

const PRESETS: Record<string, Partial<Params>> = {
  "Our Universe": DEFAULTS,
  "Dead Universe": { G: 6, darkEnergy: 0.2, darkMatter: 1, hubble: 1, matterRatio: 1, baryonDensity: 1, fluctuation: 1, dimensions: 3 },
  "Big Rip": { darkEnergy: 8.5, G: 1, darkMatter: 1, hubble: 1.5, matterRatio: 1, baryonDensity: 1, fluctuation: 1, dimensions: 3 },
  "Empty Universe": { G: 0.15, darkMatter: 0.2, darkEnergy: 1, hubble: 1, matterRatio: 1, baryonDensity: 0.3, fluctuation: 0.3, dimensions: 3 },
  "Black Hole Universe": { G: 9, darkMatter: 3, darkEnergy: 0.5, hubble: 0.8, matterRatio: 1, baryonDensity: 2, fluctuation: 5, dimensions: 3 },
  "Matter-Antimatter": { G: 1, darkMatter: 1, darkEnergy: 1, hubble: 1, matterRatio: 0.02, baryonDensity: 1, fluctuation: 1, dimensions: 3 },
};

const OUTCOMES: Record<OutcomeId, { label: string; color: string; bg: string; description: string }> = {
  our_universe:  { label: "Our Universe",                   color: "#4fc3f7", bg: "rgba(79,195,247,0.12)",   description: "Against all odds, your parameters created conditions for stars, planets, and possibly life." },
  dead_universe: { label: "Dead Universe — Big Crunch",     color: "#e53935", bg: "rgba(229,57,53,0.12)",    description: "Gravity won. Your universe collapsed under its own weight billions of years after the Big Bang." },
  big_rip:       { label: "The Big Rip",                    color: "#ce93d8", bg: "rgba(156,39,176,0.12)",   description: "Dark energy tore your universe apart. Galaxies, stars, then atoms themselves were ripped to pieces." },
  empty_universe:{ label: "Empty Universe",                 color: "#78909c", bg: "rgba(120,144,156,0.12)",  description: "Matter never clumped. No stars. No galaxies. Just a cold, dark, expanding void." },
  annihilation:  { label: "Matter-Antimatter Annihilation", color: "#ffd54f", bg: "rgba(255,213,79,0.12)",   description: "Your universe annihilated itself in the first second. Equal matter and antimatter left nothing." },
  black_hole:    { label: "Black Hole Universe",            color: "#880e4f", bg: "rgba(136,14,79,0.12)",    description: "Every star collapsed immediately into a black hole. The sky is darkness punctuated only by gravity." },
  stellar_nursery:{ label: "Stellar Nursery",               color: "#ff9f43", bg: "rgba(255,159,67,0.12)",   description: "Dense star clusters everywhere — no large galaxies, no empty space. An endless nursery of new suns." },
};

interface ParamConfig {
  key: keyof Omit<Params, "dimensions">;
  label: string; min: number; max: number; step: number; ours: number;
  desc: string; lowNote: string; highNote: string;
}

const PARAM_CONFIGS: ParamConfig[] = [
  { key: "G",            label: "Gravitational Constant",        min: 0.1, max: 10,  step: 0.05, ours: 1, desc: "Controls how strongly matter attracts matter",             lowNote: "No stars form",           highNote: "Universe collapses" },
  { key: "darkMatter",   label: "Dark Matter Density",           min: 0,   max: 5,   step: 0.05, ours: 1, desc: "The invisible scaffold of cosmic structure",               lowNote: "No galaxies form",        highNote: "Collapses to black holes" },
  { key: "darkEnergy",   label: "Dark Energy",                   min: 0,   max: 10,  step: 0.1,  ours: 1, desc: "Force driving accelerating expansion",                    lowNote: "Big Crunch",              highNote: "Big Rip" },
  { key: "hubble",       label: "Initial Expansion Rate",        min: 0.1, max: 5,   step: 0.05, ours: 1, desc: "How fast space expanded after the Big Bang",              lowNote: "Gravitational collapse",  highNote: "Matter scatters" },
  { key: "matterRatio",  label: "Matter/Antimatter Asymmetry",   min: 0,   max: 1,   step: 0.01, ours: 1, desc: "The imbalance that lets matter exist at all",             lowNote: "Total annihilation",      highNote: "Max matter" },
  { key: "baryonDensity",label: "Baryon Density",                min: 0.1, max: 10,  step: 0.1,  ours: 1, desc: "How many atoms form in the early universe",              lowNote: "Thin, sparse universe",   highNote: "Dense, rapid stars" },
  { key: "fluctuation",  label: "Quantum Fluctuation Amplitude", min: 0.1, max: 10,  step: 0.1,  ours: 1, desc: "The seeds of all cosmic structure",                       lowNote: "Perfectly smooth — void", highNote: "Clumpy chaos" },
];

// ── Helpers ────────────────────────────────────────────────────
function computeOutcome(p: Params): OutcomeId {
  if (p.matterRatio < 0.06) return "annihilation";
  if (p.darkEnergy > 7) return "big_rip";
  if (p.G > 8 || (p.G > 4 && p.darkEnergy < 0.4)) return "dead_universe";
  if (p.G > 5.5) return "black_hole";
  if (p.G < 0.28 || (p.hubble > 3.5 && p.darkMatter < 0.5)) return "empty_universe";
  if (p.hubble < 0.4 && p.G > 0.5 && p.darkEnergy < 3) return "stellar_nursery";
  return "our_universe";
}

function getStatus(v: number, ours: number, range: number): "low" | "ok" | "high" {
  const d = (v - ours) / range;
  if (d < -0.12) return "low";
  if (d > 0.12) return "high";
  return "ok";
}

function randomParams(): Params {
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  return {
    G: rand(0.1, 10), darkMatter: rand(0, 5), darkEnergy: rand(0, 10),
    hubble: rand(0.1, 5), matterRatio: rand(0, 1), baryonDensity: rand(0.1, 10),
    fluctuation: rand(0.1, 10), dimensions: [2, 3, 4][Math.floor(Math.random() * 3)] as 2 | 3 | 4,
  };
}

function encodeParams(p: Params): string {
  const vals = [p.G, p.darkMatter, p.darkEnergy, p.hubble, p.matterRatio, p.baryonDensity, p.fluctuation, p.dimensions];
  return btoa(vals.map(v => Number(v).toFixed(3)).join(","));
}

function decodeParams(s: string): Params | null {
  try {
    const vals = atob(s).split(",").map(Number);
    if (vals.length !== 8 || vals.some(isNaN)) return null;
    return { G: vals[0], darkMatter: vals[1], darkEnergy: vals[2], hubble: vals[3], matterRatio: vals[4], baryonDensity: vals[5], fluctuation: vals[6], dimensions: vals[7] as 2 | 3 | 4 };
  } catch { return null; }
}

// Seeded random (Mulberry32)
function seededRng(seed: number) {
  let s = seed;
  return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ── SimCanvas ──────────────────────────────────────────────────
const N_TOTAL_DESKTOP = 18000;
const N_TOTAL_MOBILE = 8000;
const UNIVERSE_RADIUS = 30;

function SimCanvas({ params, simTime, outcome }: { params: Params; simTime: number; outcome: OutcomeId }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef(params);
  const simTimeRef = useRef(simTime);
  const outcomeRef = useRef(outcome);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { simTimeRef.current = simTime; }, [simTime]);
  useEffect(() => { outcomeRef.current = outcome; }, [outcome]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const isMobile = window.innerWidth < 768;
    const N = isMobile ? N_TOTAL_MOBILE : N_TOTAL_DESKTOP;
    const N_DM = Math.floor(N * 0.28);   // dark matter
    const N_NM = Math.floor(N * 0.50);   // normal matter
    const N_ST = N - N_DM - N_NM;        // potential stars/galaxies

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 70);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // Bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 1.4, 0.5, 0.04);
    composer.addPass(bloom);

    // ── Pre-compute particle data ──────────────────────────────
    const rng = seededRng(12345);

    // Cluster nodes for the cosmic web
    const N_NODES = 40;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < N_NODES; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 5 + rng() * UNIVERSE_RADIUS * 0.8;
      nodes.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ));
    }

    // Connect nodes into filament edges
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 20) edges.push([i, j]);
      }
    }

    // Arrays: bang positions, filament targets, current positions, velocities
    const bangPos = new Float32Array(N * 3);     // explosion positions at t~1
    const targetPos = new Float32Array(N * 3);   // final filament positions
    const currPos = new Float32Array(N * 3);
    const velocity = new Float32Array(N * 3);
    const ptypes = new Uint8Array(N);             // 0=dm, 1=nm, 2=star

    for (let i = 0; i < N; i++) {
      const type = i < N_DM ? 0 : i < N_DM + N_NM ? 1 : 2;
      ptypes[i] = type;

      // Bang position: outward sphere
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const br = 25 + rng() * 20;
      bangPos[i * 3]     = br * Math.sin(phi) * Math.cos(theta);
      bangPos[i * 3 + 1] = br * Math.sin(phi) * Math.sin(theta);
      bangPos[i * 3 + 2] = br * Math.cos(phi);

      // Target position: along filaments
      if (type === 0) {
        // Dark matter: along filament edges
        const edge = edges[Math.floor(rng() * edges.length)];
        const t = rng();
        const a = nodes[edge[0]], b = nodes[edge[1]];
        const spread = (rng() - 0.5) * 3;
        targetPos[i * 3]     = a.x + (b.x - a.x) * t + spread;
        targetPos[i * 3 + 1] = a.y + (b.y - a.y) * t + spread;
        targetPos[i * 3 + 2] = a.z + (b.z - a.z) * t + spread;
      } else if (type === 1) {
        // Normal matter: near nodes
        const node = nodes[Math.floor(rng() * nodes.length)];
        const r = rng() * 4;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        targetPos[i * 3]     = node.x + r * Math.sin(ph) * Math.cos(th);
        targetPos[i * 3 + 1] = node.y + r * Math.sin(ph) * Math.sin(th);
        targetPos[i * 3 + 2] = node.z + r * Math.cos(ph);
      } else {
        // Stars: very near nodes
        const node = nodes[Math.floor(rng() * nodes.length)];
        const r = rng() * 1.5;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        targetPos[i * 3]     = node.x + r * Math.sin(ph) * Math.cos(th);
        targetPos[i * 3 + 1] = node.y + r * Math.sin(ph) * Math.sin(th);
        targetPos[i * 3 + 2] = node.z + r * Math.cos(ph);
      }

      // Velocity: radially outward (used in bang stage)
      const len = Math.sqrt(bangPos[i*3]**2 + bangPos[i*3+1]**2 + bangPos[i*3+2]**2) || 1;
      velocity[i * 3]     = bangPos[i * 3] / len;
      velocity[i * 3 + 1] = bangPos[i * 3 + 1] / len;
      velocity[i * 3 + 2] = bangPos[i * 3 + 2] / len;

      // Start at origin with tiny offset
      currPos[i * 3]     = (rng() - 0.5) * 0.5;
      currPos[i * 3 + 1] = (rng() - 0.5) * 0.5;
      currPos[i * 3 + 2] = (rng() - 0.5) * 0.5;
    }

    // Colors
    const colArr = new Float32Array(N * 3);

    // Geometry
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(currPos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

    // Circle texture
    const texCanvas = document.createElement("canvas");
    texCanvas.width = texCanvas.height = 64;
    const tc = texCanvas.getContext("2d")!;
    const g = tc.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.8)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    tc.fillStyle = g;
    tc.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(texCanvas);

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      map: tex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Orbital angles for galaxy rotation effect
    const orbitAngle = new Float32Array(N);
    const orbitRadius = new Float32Array(N);
    const orbitAxis = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      orbitAngle[i] = rng() * Math.PI * 2;
      orbitRadius[i] = Math.sqrt(targetPos[i*3]**2 + targetPos[i*3+1]**2 + targetPos[i*3+2]**2);
      orbitAxis[i*3] = rng() - 0.5;
      orbitAxis[i*3+1] = rng() - 0.5;
      orbitAxis[i*3+2] = rng() - 0.5;
    }

    // Camera orbit
    let camAngle = 0;
    const camSpeed = 0.003;

    // Resize
    const onResize = () => {
      if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Colors per type/outcome
    function updateColors(t: number, outcome: OutcomeId, p: Params) {
      const stage = t < 1 ? 0 : t < 4 ? 1 : t < 7 ? 2 : t < 10 ? 3 : 4;
      const bangProgress = Math.min(t, 1);

      for (let i = 0; i < N; i++) {
        const type = ptypes[i];
        let r = 0, g2 = 0, b = 0;

        if (stage === 0) {
          // Big Bang: hot orange-white
          const heat = 0.8 + bangProgress * 0.2;
          r = heat; g2 = heat * 0.5; b = heat * 0.2;
        } else if (stage === 1) {
          // Cooling
          if (type === 0) { r = 0.2; g2 = 0.15; b = 0.5; } // dark matter: blue-purple
          else { r = 0.6; g2 = 0.5; b = 0.3; }               // normal: warm dim
        } else if (stage === 2) {
          // Star formation
          if (type === 0) { r = 0.15; g2 = 0.1; b = 0.4; }
          else if (type === 1) { r = 0.5; g2 = 0.4; b = 0.25; }
          else {
            if (p.G > 5) { r = 0.1; g2 = 0.1; b = 0.1; } // black holes
            else { r = 0.7; g2 = 0.85; b = 1.0; }           // stars: blue-white
          }
        } else if (stage === 3) {
          // Galaxy formation
          if (type === 0) { r = 0.1; g2 = 0.08; b = 0.35; }
          else if (type === 1) { r = 0.45; g2 = 0.38; b = 0.22; }
          else {
            if (p.G > 5) { r = 0.05; g2 = 0.05; b = 0.1; }
            else { r = 0.85; g2 = 0.92; b = 1.0; }
          }
        } else {
          // Present — outcome-based
          switch (outcome) {
            case "our_universe":
              if (type === 0) { r = 0.12; g2 = 0.08; b = 0.38; }
              else if (type === 1) { r = 0.5; g2 = 0.4; b = 0.25; }
              else { r = 0.9; g2 = 0.95; b = 1.0; }
              break;
            case "dead_universe":
              r = 0.3; g2 = 0.1; b = 0.1; break;
            case "big_rip":
              r = 0.5; g2 = 0.1; b = 0.6; break;
            case "empty_universe":
              r = 0.08; g2 = 0.08; b = 0.15; break;
            case "annihilation":
              r = g2 = b = 0.02; break;
            case "black_hole":
              if (type === 2) { r = 0.6; g2 = 0.2; b = 0.5; }
              else { r = g2 = b = 0.03; }
              break;
            case "stellar_nursery":
              if (type === 2) { r = 1.0; g2 = 0.7; b = 0.3; }
              else { r = 0.4; g2 = 0.25; b = 0.1; }
              break;
          }
        }
        colArr[i * 3] = r;
        colArr[i * 3 + 1] = g2;
        colArr[i * 3 + 2] = b;
      }
      geo.attributes.color.needsUpdate = true;
    }

    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);

      const t = simTimeRef.current;
      const p = paramsRef.current;
      const outcome = outcomeRef.current;

      // Camera orbit
      camAngle += camSpeed;
      const camDist = 65 + Math.sin(camAngle * 0.3) * 10;
      camera.position.x = Math.sin(camAngle) * camDist;
      camera.position.z = Math.cos(camAngle) * camDist;
      camera.position.y = Math.sin(camAngle * 0.4) * 15;
      camera.lookAt(0, 0, 0);

      // Update particle positions based on sim time
      const stage = t < 1 ? 0 : t < 4 ? 1 : t < 7 ? 2 : t < 10 ? 3 : 4;

      const dim2D = p.dimensions === 2;
      const dim4D = p.dimensions === 4;

      for (let i = 0; i < N; i++) {
        const type = ptypes[i];
        let x = 0, y = 0, z = 0;

        if (stage === 0) {
          // Big bang: lerp from origin to bang positions
          const prog = Math.min(t, 1);
          const sp = prog * prog; // ease in
          const hubbleScale = p.hubble;
          x = bangPos[i*3] * sp * hubbleScale;
          y = bangPos[i*3+1] * sp * (dim2D ? 0.05 : hubbleScale);
          z = bangPos[i*3+2] * sp * (dim4D ? hubbleScale * 1.4 : hubbleScale);

        } else if (stage === 1) {
          // Cooling: lerp from bang to target, DM faster
          const prog = (t - 1) / 3;
          const dmProg = Math.min(prog * (1 + p.darkMatter * 0.3), 1);
          const nmProg = Math.min(prog * 0.6, 1);
          const sp = type === 0 ? dmProg : nmProg;
          const hubbleScale = p.hubble;

          const bx = bangPos[i*3] * hubbleScale;
          const by = bangPos[i*3+1] * (dim2D ? 0.05 : hubbleScale);
          const bz = bangPos[i*3+2] * hubbleScale;

          const sx = sp * sp * (3 - 2 * sp); // smoothstep
          x = bx + (targetPos[i*3] - bx) * sx;
          y = by + (targetPos[i*3+1] * (dim2D ? 0.1 : 1) - by) * sx;
          z = bz + (targetPos[i*3+2] - bz) * sx;

        } else if (stage === 2) {
          // Star formation: stars appear at target, others at target
          const prog = (t - 4) / 3;
          const sp = Math.min(prog, 1);

          if (type === 2 && p.G >= 0.4 && p.matterRatio > 0.05) {
            // Stars ignite
            const ignitionProg = Math.min(sp * 2, 1);
            x = targetPos[i*3] * ignitionProg;
            y = targetPos[i*3+1] * (dim2D ? 0.1 : ignitionProg);
            z = targetPos[i*3+2] * ignitionProg;
          } else {
            x = targetPos[i*3];
            y = targetPos[i*3+1] * (dim2D ? 0.1 : 1);
            z = targetPos[i*3+2];
          }

        } else if (stage === 3) {
          // Galaxy formation: orbital motion begins
          const prog = (t - 7) / 3;
          const orbitProg = prog * prog * (3 - 2 * prog);
          const baseX = targetPos[i*3];
          const baseY = targetPos[i*3+1] * (dim2D ? 0.1 : 1);
          const baseZ = targetPos[i*3+2];

          // Orbital offset
          const angle = orbitAngle[i] + prog * (p.G * 0.4) * (type === 2 ? 0.8 : 0.3);
          const r = Math.min(orbitRadius[i] * 0.15, 8);
          const ax = orbitAxis[i*3], ay = orbitAxis[i*3+1], az = orbitAxis[i*3+2];
          const alen = Math.sqrt(ax*ax + ay*ay + az*az) || 1;
          const nx = ax/alen, ny = ay/alen, nz = az/alen;
          // Rodrigues rotation of (1,0,0) by angle around n
          const ox = (Math.cos(angle) + nx*nx*(1-Math.cos(angle))) * r;
          const oy = (nx*ny*(1-Math.cos(angle)) - nz*Math.sin(angle)) * r;
          const oz = (nx*nz*(1-Math.cos(angle)) + ny*Math.sin(angle)) * r;

          x = baseX + ox * orbitProg;
          y = baseY + oy * orbitProg;
          z = baseZ + oz * orbitProg;

        } else {
          // Present: steady state, outcome-modulated
          const baseX = targetPos[i*3];
          const baseY = targetPos[i*3+1] * (dim2D ? 0.1 : 1);
          const baseZ = targetPos[i*3+2];

          const age = (t - 10) / 4;

          if (outcome === "dead_universe") {
            const collapse = age * age;
            x = baseX * (1 - collapse * 0.9);
            y = baseY * (1 - collapse * 0.9);
            z = baseZ * (1 - collapse * 0.9);
          } else if (outcome === "big_rip") {
            const rip = 1 + age * p.darkEnergy * 0.3;
            x = baseX * rip; y = baseY * rip; z = baseZ * rip;
          } else if (outcome === "annihilation") {
            const fade = Math.max(0, 1 - age * 3);
            x = baseX * fade; y = baseY * fade; z = baseZ * fade;
          } else {
            // Continuous gentle orbital motion
            const angle = orbitAngle[i] + (t - 7) * (p.G * 0.15) * (type === 2 ? 0.5 : 0.15);
            const r = Math.min(orbitRadius[i] * 0.15, 6);
            const ax = orbitAxis[i*3], ay = orbitAxis[i*3+1], az = orbitAxis[i*3+2];
            const alen = Math.sqrt(ax*ax + ay*ay + az*az) || 1;
            const nx = ax/alen, ny = ay/alen, nz = az/alen;
            const ox = (Math.cos(angle) + nx*nx*(1-Math.cos(angle))) * r;
            const oy = (nx*ny*(1-Math.cos(angle)) - nz*Math.sin(angle)) * r;
            const oz = (nx*nz*(1-Math.cos(angle)) + ny*Math.sin(angle)) * r;
            x = baseX + ox; y = baseY + oy; z = baseZ + oz;
          }
        }

        currPos[i*3] = x; currPos[i*3+1] = y; currPos[i*3+2] = z;
      }

      geo.attributes.position.needsUpdate = true;
      updateColors(t, outcome, p);

      // Bloom strength by stage and outcome
      const bangGlow = stage === 0 ? 2.0 + (1 - t) : 1.4;
      bloom.strength = outcome === "annihilation" && t > 1 ? 0.2 : bangGlow;

      composer.render();
    }

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      composer.dispose();
      geo.dispose();
      mat.dispose();
      tex.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []); // intentionally empty — uses refs for reactive state

  return <div ref={mountRef} className="w-full h-full" />;
}

// ── SliderRow ──────────────────────────────────────────────────
function SliderRow({ cfg, value, onChange }: { cfg: ParamConfig; value: number; onChange: (v: number) => void }) {
  const status = getStatus(value, cfg.ours, cfg.max - cfg.min);
  const pct = ((value - cfg.min) / (cfg.max - cfg.min)) * 100;

  const statusColor = status === "ok" ? "#4caf50" : status === "low" ? "#4fc3f7" : "#e53935";
  const statusLabel = status === "ok" ? "Optimal" : status === "low" ? "Too Low" : "Too High";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white/80">{cfg.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ color: statusColor, borderColor: statusColor + "55", background: statusColor + "11" }}>
            {statusLabel}
          </span>
          <span className="text-xs font-bold tabular-nums" style={{ color: "#ffd54f", minWidth: "36px", textAlign: "right" }}>
            {value === cfg.ours ? "1.0×" : `${value.toFixed(1)}×`}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
        {/* Ours marker */}
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white/30 z-10"
          style={{ left: `${((cfg.ours - cfg.min) / (cfg.max - cfg.min)) * 100}%` }} />
        {/* Fill */}
        <div className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #4fc3f7, ${statusColor})` }} />
        <input
          type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ margin: 0 }}
        />
      </div>
      <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.3)" }}>
        {status === "low" ? cfg.lowNote : status === "high" ? cfg.highNote : cfg.desc}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function BuildYourOwnUniverse() {
  const [params, setParams] = useState<Params>(() => {
    const url = new URLSearchParams(window.location.search);
    const encoded = url.get("u");
    if (encoded) { const decoded = decodeParams(encoded); if (decoded) return decoded; }
    return DEFAULTS;
  });

  const [simTime, setSimTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [preset, setPreset] = useState("Our Universe");
  const [copied, setCopied] = useState(false);
  // 0=none  1=text-about-constants  2=text-you-changed  3=fading-to-results
  const [cinematicPhase, setCinematicPhase] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const outcome = computeOutcome(params);
  const simTimeRef = useRef(simTime);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const cinematicTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { simTimeRef.current = simTime; }, [simTime]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const clearCinematicTimers = () => {
    cinematicTimers.current.forEach(clearTimeout);
    cinematicTimers.current = [];
  };

  // Sim time ticker
  useEffect(() => {
    let last = performance.now();
    let raf: number;
    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const dt = (now - last) / 1000;
      last = now;
      if (isPlayingRef.current) {
        setSimTime(prev => {
          const next = Math.min(prev + dt * speedRef.current, 14);
          if (next >= 14 && prev < 14) {
            // Trigger cinematic sequence
            isPlayingRef.current = false;
            setIsPlaying(false);
            setCinematicPhase(1);
            const t1 = setTimeout(() => setCinematicPhase(2), 2600);
            const t2 = setTimeout(() => setCinematicPhase(3), 4600);
            const t3 = setTimeout(() => { setShowResults(true); setCinematicPhase(0); }, 5300);
            cinematicTimers.current = [t1, t2, t3];
          }
          return next;
        });
      }
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearCinematicTimers(); };
  }, []);

  const resetSim = () => {
    clearCinematicTimers();
    setCinematicPhase(0);
    setShowResults(false);
    setSimTime(0);
    setIsPlaying(true);
  };

  const setParam = useCallback((key: keyof Params, value: number | 2 | 3 | 4) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setPreset("");
    resetSim();
  }, []);

  const applyPreset = (name: string) => {
    if (name === "Surprise Me") {
      setParams(randomParams());
    } else {
      const p = PRESETS[name];
      if (p) setParams({ ...DEFAULTS, ...p } as Params);
    }
    setPreset(name);
    resetSim();
  };

  const reset = () => { applyPreset("Our Universe"); };
  const randomise = () => { applyPreset("Surprise Me"); };

  const share = () => {
    const encoded = encodeParams(params);
    const url = `${window.location.origin}${window.location.pathname}?u=${encoded}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const stageLabels = ["Big Bang", "Cooling & Structure", "First Stars", "Galaxy Formation", "Present Day"];
  const currentStage = simTime < 1 ? 0 : simTime < 4 ? 1 : simTime < 7 ? 2 : simTime < 10 ? 3 : 4;
  const finetuned = Math.abs(params.G - 1) < 0.3 && Math.abs(params.darkEnergy - 1) < 1 && Math.abs(params.hubble - 1) < 0.5;

  // Count how many params differ meaningfully from defaults
  const changedCount = PARAM_CONFIGS.filter(c => Math.abs((params[c.key] as number) - 1) / (c.max - c.min) > 0.05).length
    + (params.dimensions !== 3 ? 1 : 0);

  useEffect(() => { document.title = "Build Your Own Universe — STELLARA"; }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen pt-14 md:pt-16 overflow-hidden" style={{ background: "#000" }}>

      {/* ── Left Panel ── */}
      <div className="md:w-[38%] flex flex-col border-r" style={{ borderColor: "rgba(79,195,247,0.12)", background: "rgba(5,5,15,0.97)" }}>

        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h1 className="text-sm font-bold tracking-widest text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
            BUILD YOUR OWN UNIVERSE
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Adjust the laws of physics. Watch a universe unfold.
          </p>
        </div>

        {/* Controls row */}
        <div className="px-4 py-2.5 border-b flex items-center gap-2 shrink-0 flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Preset dropdown */}
          <div className="relative flex-1 min-w-[120px]">
            <select
              value={preset}
              onChange={e => applyPreset(e.target.value)}
              className="w-full text-xs rounded-lg px-3 py-1.5 pr-7 appearance-none border outline-none"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "#e0e0e0" }}
            >
              <option value="">— Custom —</option>
              {Object.keys(PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
              <option value="Surprise Me">🎲 Surprise Me</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.4)" }} />
          </div>

          <button onClick={randomise} title="Randomise" className="p-1.5 rounded-lg border transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <Shuffle className="w-3.5 h-3.5" style={{ color: "#ffd54f" }} />
          </button>
          <button onClick={reset} title="Reset to Our Universe" className="p-1.5 rounded-lg border transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <RotateCcw className="w-3.5 h-3.5" style={{ color: "#4fc3f7" }} />
          </button>
          <button onClick={share} title="Share" className="p-1.5 rounded-lg border transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: copied ? "#4caf50" : "rgba(255,255,255,0.5)" }}>
            <Share2 className="w-3.5 h-3.5" />
          </button>
          {copied && <span className="text-[10px]" style={{ color: "#4caf50" }}>Copied!</span>}
        </div>

        {/* Sliders — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0">
          {PARAM_CONFIGS.map(cfg => (
            <SliderRow
              key={cfg.key}
              cfg={cfg}
              value={params[cfg.key] as number}
              onChange={v => setParam(cfg.key, v)}
            />
          ))}

          {/* Dimensions */}
          <div className="mb-4">
            <span className="text-xs font-medium text-white/80 block mb-2">Spatial Dimensions</span>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setParam("dimensions", d)}
                  className="flex-1 text-xs py-1.5 rounded-lg border transition-all font-bold"
                  style={{
                    background: params.dimensions === d ? "rgba(79,195,247,0.15)" : "rgba(255,255,255,0.04)",
                    borderColor: params.dimensions === d ? "#4fc3f7" : "rgba(255,255,255,0.12)",
                    color: params.dimensions === d ? "#4fc3f7" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {d}D
                </button>
              ))}
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {params.dimensions === 2 ? "No stable orbits — solar systems can't form"
                : params.dimensions === 4 ? "Gravity falls off too fast — atoms can't form"
                : "Three dimensions — the only stable option"}
            </p>
          </div>

          {/* Fine-tuning box */}
          {finetuned && (
            <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(255,213,79,0.06)", border: "1px solid rgba(255,213,79,0.2)" }}>
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,213,79,0.8)" }}>
                <strong>Fine-tuning alert:</strong> Your parameters are close to our universe's real values. Change any constant by even 1% and life as we know it becomes impossible. The universe we inhabit is extraordinarily improbable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Canvas ── */}
      <div className="flex-1 relative flex flex-col" style={{ minHeight: "50vh" }}>
        <SimCanvas params={params} simTime={simTime} outcome={outcome} />

        {/* Stage label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest"
          style={{ fontFamily: "Orbitron, sans-serif", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(79,195,247,0.2)", color: "#4fc3f7" }}>
          {stageLabels[currentStage].toUpperCase()}
        </div>

        {/* Universe age */}
        <div className="absolute top-3 right-3 text-right">
          <div className="text-xs font-bold tabular-nums" style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f" }}>
            {simTime < 0.01 ? "t = 0" : simTime < 1 ? `${(simTime * 1000).toFixed(0)} Myr` : `${simTime.toFixed(1)} Gyr`}
          </div>
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>cosmic time</div>
        </div>

        {/* ── Cinematic overlay ── */}
        <AnimatePresence>
          {cinematicPhase > 0 && (
            <motion.div
              key="cinematic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8"
              style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
            >
              <AnimatePresence mode="wait">
                {cinematicPhase === 1 && (
                  <motion.div key="c1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.9 }} className="text-center max-w-sm">
                    <p className="text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Orbitron, sans-serif", fontWeight: 300, letterSpacing: "0.04em" }}>
                      In our universe, every fundamental constant sits at a precise value.
                    </p>
                    <p className="text-sm mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Change any one of them significantly and nothing we know would exist.
                    </p>
                  </motion.div>
                )}
                {cinematicPhase === 2 && (
                  <motion.div key="c2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.9 }} className="text-center max-w-sm">
                    <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f" }}>
                      You changed
                    </p>
                    <p className="text-5xl font-bold mt-2" style={{ fontFamily: "Orbitron, sans-serif", color: "#fff" }}>
                      {changedCount}
                    </p>
                    <p className="text-lg mt-1" style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(255,255,255,0.5)" }}>
                      parameter{changedCount !== 1 ? "s" : ""}.
                    </p>
                  </motion.div>
                )}
                {cinematicPhase === 3 && (
                  <motion.div key="c3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }} className="text-center">
                    <p className="text-sm tracking-widest" style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(255,255,255,0.3)" }}>
                      Calculating your universe…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Full results panel ── */}
        <AnimatePresence>
          {showResults && (
            <BuildUniverseResults
              params={params}
              outcome={outcome}
              onRebuild={resetSim}
            />
          )}
        </AnimatePresence>

        {/* Timeline controls */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }}>
          {/* Stage markers */}
          <div className="relative h-1 mb-3">
            {[0, 1/14, 4/14, 7/14, 10/14].map((pos, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2 w-px h-3 rounded-full"
                style={{ left: `${pos * 100}%`, background: "rgba(255,255,255,0.2)" }} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsPlaying(p => !p)} className="p-1.5 rounded-full shrink-0 transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
            </button>

            {/* Scrubber */}
            <div className="flex-1 relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(simTime / 14) * 100}%`, background: "linear-gradient(90deg, #ff6b35, #ffd54f, #4fc3f7)" }} />
              <input type="range" min={0} max={14} step={0.01} value={simTime}
                onChange={e => { clearCinematicTimers(); setCinematicPhase(0); setShowResults(false); setSimTime(parseFloat(e.target.value)); setIsPlaying(false); }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ margin: 0 }} />
            </div>

            {/* Speed */}
            <div className="flex items-center gap-1 shrink-0">
              {[1, 10, 100].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className="text-[10px] px-1.5 py-0.5 rounded border transition-all"
                  style={{
                    borderColor: speed === s ? "#4fc3f7" : "rgba(255,255,255,0.15)",
                    color: speed === s ? "#4fc3f7" : "rgba(255,255,255,0.4)",
                    background: speed === s ? "rgba(79,195,247,0.1)" : "transparent",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >{s}×</button>
              ))}
            </div>

            <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>13.8 Gyr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
