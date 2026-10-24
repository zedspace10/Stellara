import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";

// Shared building blocks for every simulation's shader: noise, stars and phase weights.
//
// Noise is read from a small tiling texture of random values rather than worked out with four
// hashes per lookup. Sampled at a smoothed position, the graphics card's own blending gives exactly
// the same smooth value noise, at a fraction of the cost. Every simulation leans on it heavily.
export const GLSL_COMMON = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uPhase;
uniform sampler2D uNoise;
uniform sampler2D uBake;
uniform float uBakeR;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash2(vec2 p) { float n = hash(p); return vec2(n, hash(p + n + 17.3)); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return texture2D(uNoise, (i + u + 0.5) / 256.0).r;
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
// Fields worked out once when the simulation loads, covering a square uBakeR across from the centre.
vec4 baked(vec2 p) { return texture2D(uBake, p / (2.0 * uBakeR) + 0.5); }
// A field of stars: sharp points of varied brightness and colour.
vec3 stars(vec2 p, float density) {
  vec2 g = floor(p * density), f = fract(p * density);
  float b = step(0.82, hash(g + 3.1));
  if (b == 0.0) return vec3(0.0);
  vec2 o = hash2(g);
  float d = length(f - o);
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 3.0 * hash(g + 9.0)) + 6.28 * hash(g));
  vec3 c = mix(vec3(1.0, 0.82, 0.65), vec3(0.75, 0.85, 1.0), hash(g + 5.0));
  return c * tw * smoothstep(0.08, 0.0, d) * (0.4 + 0.6 * hash(g + 1.7));
}
// How much of phase i is showing, with soft cross fades at the edges.
float ph(float i) { return smoothstep(i - 0.12, i + 0.12, uPhase) - smoothstep(i + 0.88, i + 1.12, uPhase); }
// Progress through phase i, from 0 to 1.
float lp(float i) { return clamp(uPhase - i, 0.0, 1.0); }
vec3 tonemap(vec3 c) { c = c / (1.0 + c * 0.6); return pow(c, vec3(0.92)); }
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Random values that tile every 256 cells, the same on every visit.
function makeNoiseTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  let s = 12345;
  for (let i = 0; i < data.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    data[i] = s >>> 24;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// How many pixels to draw. These scenes are made of soft light, so a lower resolution
// stretched to fill the screen looks almost the same and is far cheaper.
const PHONE_BUDGET = 210_000;
const DESKTOP_BUDGET = 1_100_000;
const MIN_SCALE = 0.45;

interface Props {
  title: string;
  phases: SimPhase[];
  closing: string;
  fragment: string;
  /** GLSL defining vec4 bakeField(vec2 p): anything that never changes, worked out once at load. */
  bake?: string;
  /** Half the width of the square the baked fields cover, in the shader's own units. */
  bakeRange?: number;
  secondsPerPhase?: number;
}

export default function ShaderSim({ title, phases, closing, fragment, bake, bakeRange = 3.2, secondsPerPhase = 18 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scienceMode, setScienceMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showFps] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("fps"));
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const jumpRef = useRef<number | null>(null);
  const total = phases.length * secondsPerPhase;

  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { document.title = `${title} | PALE`; }, [title]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    const phone = window.innerWidth < 700;
    const budget = phone ? PHONE_BUDGET : DESKTOP_BUDGET;
    const fitScale = () => {
      const area = Math.max(1, el.clientWidth * el.clientHeight);
      return Math.max(MIN_SCALE, Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(budget / area)));
    };
    let scale = fitScale();
    renderer.setPixelRatio(scale);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const noiseTex = makeNoiseTexture();
    const blank = new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat);
    blank.needsUpdate = true;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const plane = new THREE.PlaneGeometry(2, 2);

    // Work out the fields that never change, once, into a texture.
    let bakeTarget: THREE.WebGLRenderTarget | null = null;
    if (bake) {
      const size = Math.min(2048, renderer.capabilities.maxTextureSize);
      bakeTarget = new THREE.WebGLRenderTarget(size, size, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: false,
        depthBuffer: false,
      });
      const bakeMat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: GLSL_COMMON + bake + `\nvoid main() { gl_FragColor = bakeField((vUv * 2.0 - 1.0) * uBakeR); }\n`,
        uniforms: {
          uRes: { value: new THREE.Vector2(size, size) },
          uTime: { value: 0 },
          uPhase: { value: 0 },
          uNoise: { value: noiseTex },
          uBake: { value: blank },
          uBakeR: { value: bakeRange },
        },
        depthTest: false,
        depthWrite: false,
      });
      const bakeScene = new THREE.Scene();
      bakeScene.add(new THREE.Mesh(plane, bakeMat));
      renderer.setRenderTarget(bakeTarget);
      renderer.render(bakeScene, camera);
      renderer.setRenderTarget(null);
      bakeMat.dispose();
    }

    const uniforms = {
      uRes: { value: new THREE.Vector2(el.clientWidth * scale, el.clientHeight * scale) },
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uNoise: { value: noiseTex },
      uBake: { value: bakeTarget ? bakeTarget.texture : blank },
      uBakeR: { value: bakeRange },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: GLSL_COMMON + fragment, uniforms, depthTest: false, depthWrite: false });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(plane, material));

    const applyScale = () => {
      renderer.setPixelRatio(scale);
      renderer.setSize(el.clientWidth, el.clientHeight);
      uniforms.uRes.value.set(el.clientWidth * scale, el.clientHeight * scale);
    };

    // ?at=2.5 opens the simulation paused halfway through the third step, handy for sharing a moment.
    const at = Number(new URLSearchParams(window.location.search).get("at"));
    let simTime = Number.isFinite(at) && at > 0 ? Math.min(at * secondsPerPhase, total - 0.01) : 0;
    if (simTime > 0) { playingRef.current = false; setIsPlaying(false); }
    let clock = simTime;
    let last = performance.now();
    let lastIdx = -1;
    let lastReport = 0;
    // Frame timing: if the device cannot keep up, draw fewer pixels rather than stutter.
    let settle = 45;
    let winTime = 0, winFrames = 0;
    // If drawing fewer pixels did not help, the screen itself is capping the frame rate
    // (Low Power Mode, for example), so put the sharpness back and stop adjusting.
    let lastDrop: { avg: number; scale: number } | null = null;
    let adapt = true;
    let fpsTime = 0, fpsFrames = 0;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const rawDt = (now - last) / 1000;
      const dt = Math.min(0.1, rawDt);
      last = now;
      if (jumpRef.current !== null) { simTime = jumpRef.current * total; jumpRef.current = null; settle = Math.max(settle, 20); }
      if (playingRef.current) simTime = Math.min(simTime + dt * speedRef.current, total - 0.001);
      clock += dt * (playingRef.current ? speedRef.current : 0.15);
      const phase = simTime / secondsPerPhase;
      uniforms.uPhase.value = phase;
      uniforms.uTime.value = clock;
      renderer.render(scene, camera);

      if (rawDt < 0.5) {
        if (settle > 0) settle--;
        else {
          winTime += rawDt;
          winFrames++;
          if (winFrames >= 40) {
            const avg = winTime / winFrames;
            if (lastDrop && avg > lastDrop.avg * 0.9) {
              scale = lastDrop.scale;
              applyScale();
              adapt = false;
            } else if (adapt && avg > 0.026 && scale > MIN_SCALE) {
              lastDrop = { avg, scale };
              scale = Math.max(MIN_SCALE, scale * 0.8);
              applyScale();
              settle = 20;
            } else {
              lastDrop = null;
            }
            winTime = 0;
            winFrames = 0;
          }
        }
        if (fpsRef.current) {
          fpsTime += rawDt;
          fpsFrames++;
          if (fpsTime > 0.5) {
            const w = Math.round(el.clientWidth * scale), h = Math.round(el.clientHeight * scale);
            fpsRef.current.textContent = `${Math.round(fpsFrames / fpsTime)} fps · ${w}×${h}`;
            fpsTime = 0;
            fpsFrames = 0;
          }
        }
      }

      const idx = Math.min(Math.floor(phase), phases.length - 1);
      if (idx !== lastIdx) { lastIdx = idx; setCurrentPhaseIndex(idx); }
      if (now - lastReport > 120) { lastReport = now; setTotalProgress(simTime / total); }
      if (simTime >= total - 0.002 && playingRef.current) { setIsPlaying(false); setTotalProgress(1); }
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      scale = Math.min(scale, fitScale());
      applyScale();
      settle = Math.max(settle, 20);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      material.dispose();
      plane.dispose();
      noiseTex.dispose();
      blank.dispose();
      bakeTarget?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [fragment, bake, bakeRange, phases.length, secondsPerPhase, total]);

  const jump = useCallback((idx: number) => {
    jumpRef.current = (idx + 0.001) / phases.length;
    setCurrentPhaseIndex(idx);
    setTotalProgress(idx / phases.length);
    setIsPlaying(true);
  }, [phases.length]);
  const restart = useCallback(() => {
    jumpRef.current = 0;
    setCurrentPhaseIndex(0);
    setTotalProgress(0);
    setIsPlaying(true);
  }, []);

  return (
    <SimulationLayout
      title={title}
      subtitle=""
      phases={phases}
      currentPhaseIndex={currentPhaseIndex}
      totalProgress={totalProgress}
      isPlaying={isPlaying}
      scienceMode={scienceMode}
      speed={speed}
      closingQuote={closing}
      onPlay={() => { if (totalProgress >= 0.999) restart(); else setIsPlaying(true); }}
      onPause={() => setIsPlaying(false)}
      onRestart={restart}
      onSpeedChange={setSpeed}
      onPhaseJump={jump}
      onScrub={(p) => { jumpRef.current = Math.min(p, 0.9995); setTotalProgress(p); }}
      onScienceModeToggle={() => setScienceMode((v) => !v)}
    >
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      {showFps && (
        <div ref={fpsRef} className="absolute left-3 bottom-3 z-20 pointer-events-none text-[12px] tabular-nums px-2 py-1 rounded" style={{ background: "rgba(5,7,12,0.7)", color: "#A3AFBC" }} />
      )}
    </SimulationLayout>
  );
}
