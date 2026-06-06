import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Creates a soft circular radial-gradient texture for Three.js PointsMaterial.
 * This gives particles a smooth glowing disc shape instead of hard squares.
 */
export function makeCircleTex(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0,   "rgba(255,255,255,1.0)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.5)");
  grad.addColorStop(1,   "rgba(255,255,255,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates a PointsMaterial configured for beautiful circular particles with glow.
 */
export function makeParticleMaterial(options: {
  size?: number;
  opacity?: number;
  vertexColors?: boolean;
  color?: number;
}): THREE.PointsMaterial {
  const { size = 2.0, opacity = 0.9, vertexColors = true, color = 0xffffff } = options;
  return new THREE.PointsMaterial({
    size,
    opacity,
    vertexColors,
    color: vertexColors ? 0xffffff : color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    map: makeCircleTex(),
    alphaTest: 0.005,
  });
}

/**
 * Linearly interpolates between two THREE.Color values.
 */
export function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

/**
 * Creates an EffectComposer with UnrealBloomPass for cinematic glow.
 * Use composer.render() instead of renderer.render(scene, camera).
 * Call composer.setSize(w, h) on resize.
 */
export function makeBloomComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.2,   // strength
    0.5,   // radius
    0.05,  // threshold — low so dim particles also glow
  );
  composer.addPass(bloom);
  return composer;
}

/**
 * Returns true on mobile/low-memory devices so particle counts can be reduced.
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator !== "undefined") {
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (mem !== undefined && mem < 4) return true;
  }
  return typeof window !== "undefined" && window.innerWidth < 768;
}
