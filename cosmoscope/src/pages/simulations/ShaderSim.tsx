import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import SimulationLayout, { SimPhase } from "./SimulationLayout";

// Shared building blocks for every simulation's shader: noise, stars and phase weights.
export const GLSL_COMMON = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uPhase;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash2(vec2 p) { float n = hash(p); return vec2(n, hash(p + n + 17.3)); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
// A field of stars: sharp points of varied brightness and colour.
vec3 stars(vec2 p, float density) {
  vec2 g = floor(p * density), f = fract(p * density);
  vec2 o = hash2(g);
  float d = length(f - o);
  float b = step(0.82, hash(g + 3.1));
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 3.0 * hash(g + 9.0)) + 6.28 * hash(g));
  vec3 c = mix(vec3(1.0, 0.82, 0.65), vec3(0.75, 0.85, 1.0), hash(g + 5.0));
  return c * b * tw * smoothstep(0.08, 0.0, d) * (0.4 + 0.6 * hash(g + 1.7));
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

interface Props {
  title: string;
  phases: SimPhase[];
  closing: string;
  fragment: string;
  secondsPerPhase?: number;
}

export default function ShaderSim({ title, phases, closing, fragment, secondsPerPhase = 18 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scienceMode, setScienceMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
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
    // Phones draw at a slightly lower resolution; the soft light in these scenes hides it.
    let scale = window.innerWidth < 700 ? 0.8 : Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(scale);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const uniforms = {
      uRes: { value: new THREE.Vector2(el.clientWidth * scale, el.clientHeight * scale) },
      uTime: { value: 0 },
      uPhase: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: GLSL_COMMON + fragment, uniforms, depthTest: false, depthWrite: false });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // ?at=2.5 opens the simulation paused halfway through the third step, handy for sharing a moment.
    const at = Number(new URLSearchParams(window.location.search).get("at"));
    let simTime = Number.isFinite(at) && at > 0 ? Math.min(at * secondsPerPhase, total - 0.01) : 0;
    if (simTime > 0) { playingRef.current = false; setIsPlaying(false); }
    let clock = simTime;
    let last = performance.now();
    let lastIdx = -1;
    let lastReport = 0;
    let slowFrames = 0;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (jumpRef.current !== null) { simTime = jumpRef.current * total; jumpRef.current = null; }
      if (playingRef.current) simTime = Math.min(simTime + dt * speedRef.current, total - 0.001);
      clock += dt * (playingRef.current ? speedRef.current : 0.15);
      const phase = simTime / secondsPerPhase;
      uniforms.uPhase.value = phase;
      uniforms.uTime.value = clock;
      renderer.render(scene, camera);
      // If the device is struggling, draw fewer pixels rather than stutter.
      slowFrames = dt > 0.045 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 30 && scale > 0.5) {
        scale = Math.max(0.5, scale - 0.15);
        slowFrames = 0;
        renderer.setPixelRatio(scale);
        renderer.setSize(el.clientWidth, el.clientHeight);
        uniforms.uRes.value.set(el.clientWidth * scale, el.clientHeight * scale);
      }
      const idx = Math.min(Math.floor(phase), phases.length - 1);
      if (idx !== lastIdx) { lastIdx = idx; setCurrentPhaseIndex(idx); }
      if (now - lastReport > 120) { lastReport = now; setTotalProgress(simTime / total); }
      if (simTime >= total - 0.002 && playingRef.current) { setIsPlaying(false); setTotalProgress(1); }
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      uniforms.uRes.value.set(el.clientWidth * scale, el.clientHeight * scale);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [fragment, phases.length, secondsPerPhase, total]);

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
    </SimulationLayout>
  );
}
