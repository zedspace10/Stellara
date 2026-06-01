import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { planets } from '@/data/planets';
import PlanetInfoPanel from '@/components/PlanetInfoPanel';
import GalaxyInfoPanel from '@/components/GalaxyInfoPanel';
import PaleBlueDotSequence from '@/components/PaleBlueDotSequence';
import SunInfoPanel from '@/components/SunInfoPanel';
import SagittariusPanel from '@/components/SagittariusPanel';
import UniverseInfoPanel from '@/components/UniverseInfoPanel';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Camera, Dice1, Compass as Compass2, Star } from 'lucide-react';

const COMETS = [
  { id: 'halley', name: "Halley's Comet", orbitRadius: 35, orbitSpeed: 0.008, color: 0xccddff, tailLength: 8, phase: 0 },
  { id: 'hale-bopp', name: "Hale-Bopp", orbitRadius: 50, orbitSpeed: 0.004, color: 0xaaccff, tailLength: 12, phase: Math.PI * 0.7 },
  { id: 'neowise', name: "NEOWISE", orbitRadius: 28, orbitSpeed: 0.012, color: 0xffeedd, tailLength: 6, phase: Math.PI * 1.3 },
];

const EXPLORE_DESTINATIONS = [
  { name: "Saturn's rings", level: 1, cameraPos: [42, 8, 15], target: [40, 0, 0] },
  { name: "Jupiter close-up", level: 1, cameraPos: [30, 6, 12], target: [28, 0, 0] },
  { name: "Earth and Moon", level: 1, cameraPos: [14, 4, 8], target: [12, 0, 0] },
  { name: "Asteroid Belt", level: 1, cameraPos: [0, 20, 30], target: [0, 0, 0] },
  { name: "The Galactic Core", level: 2, cameraPos: [0, 3000, 6000], target: [0, 0, 0] },
  { name: "Eagle Nebula", level: 2, cameraPos: [-3000, 2000, 5000], target: [-3000, 50, 2000] },
  { name: "Omega Centauri", level: 2, cameraPos: [-8000, 3000, 0], target: [-8000, 2000, -3000] },
  { name: "The Cosmic Web", level: 3, cameraPos: [0, 150000, 280000], target: [0, 0, 0] },
  { name: "Andromeda Galaxy", level: 3, cameraPos: [12000, 5000, 0], target: [10000, -1000, -5000] },
];

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/** Creates a soft radial-gradient sprite texture — gives Points circular glow discs. */
function makeCircleTex(innerCol = 'rgba(255,255,255,1)', outerCol = 'rgba(255,255,255,0)'): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const h = size / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0,   innerCol);
  g.addColorStop(0.35, innerCol.replace(/[\d.]+\)$/, '0.85)'));
  g.addColorStop(0.65, innerCol.replace(/[\d.]+\)$/, '0.4)'));
  g.addColorStop(1,   outerCol);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/** Returns true on low-power / mobile devices. */
function isLowPower(): boolean {
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  return (mem !== undefined && mem < 4) || window.innerWidth < 768;
}

function WebGLFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <svg viewBox="0 0 128 128" className="w-full h-full opacity-60">
            <circle cx="64" cy="64" r="10" fill="#ffd54f" />
            <ellipse cx="64" cy="64" rx="28" ry="8" fill="none" stroke="#4fc3f7" strokeWidth="1" opacity="0.5"/>
            <circle cx="92" cy="64" r="3" fill="#4fc3f7" />
            <ellipse cx="64" cy="64" rx="45" ry="14" fill="none" stroke="#9c27b0" strokeWidth="1" opacity="0.4"/>
            <circle cx="109" cy="64" r="4" fill="#c88b3a" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#ffd54f] mb-3" style={{fontFamily: 'Orbitron, sans-serif'}}>
          Interactive Universe
        </h2>
        <p className="text-[#e0e0e0]/70 max-w-md mx-auto leading-relaxed mb-2">
          The 3D solar system requires WebGL, which isn't available in this preview environment.
        </p>
        <p className="text-[#4fc3f7]/80 text-sm max-w-md mx-auto">
          Open this app in a standard browser to experience the full interactive universe.
        </p>
      </div>
    </div>
  );
}

export default function SolarSystem() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelMountRef = useRef<HTMLDivElement>(null);
  
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedGalaxyObject, setSelectedGalaxyObject] = useState<string | null>(null);
  const [selectedSagittarius, setSelectedSagittarius] = useState(false);
  const [selectedUniverseObject, setSelectedUniverseObject] = useState<string | null>(null);
  
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [webglSupported] = useState(() => checkWebGLSupport());
  
  const speedRef = useRef(1);
  const isPausedRef = useRef(false);
  
  const [zoomLevel, setZoomLevel] = useState(1); // 1: Solar System, 2: Galaxy, 3: Universe
  const [showUniverseText, setShowUniverseText] = useState(false);
  const [isEdgeOn, setIsEdgeOn] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetMeshesRef = useRef<Record<string, { mesh: THREE.Mesh, pivot: THREE.Object3D, label: CSS2DObject }>>({});
  
  const zoomLevelRef = useRef(1);
  const transitioningRef = useRef(false);
  const cameraTargetRef = useRef<THREE.Vector3 | null>(null);
  const lookAtTargetRef = useRef<THREE.Vector3 | null>(null);
  
  const galaxyGroupRef = useRef<THREE.Group | null>(null);
  const solarSystemGroupRef = useRef<THREE.Group | null>(null);
  const universeGroupRef = useRef<THREE.Group | null>(null);
  const cometMeshesRef = useRef<Record<string, { mesh: THREE.Mesh, tail: THREE.Line }>>({});
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const planetHitMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const planetSpeedFactorsRef = useRef<Record<string, number>>({});
  const planetAnglesRef = useRef<Record<string, number>>({});
  const mousePosScreenRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const observatoryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const universeFilamentGroupRef = useRef<THREE.Group | null>(null);
  const universeVoidGroupRef = useRef<THREE.Group | null>(null);
  const universeLabelGroupRef = useRef<THREE.Group | null>(null);
  const universeVoidHitMeshesRef = useRef<THREE.Mesh[]>([]);
  const universeLandmarkMeshesRef = useRef<THREE.Mesh[]>([]);
  const zoomTargetRef = useRef<number | null>(null);
  const clickPulseRef = useRef<{ mesh: THREE.Mesh; startTime: number } | null>(null);
  const thresholdCounterRef = useRef<Record<string, number>>({ '1to2': 0, '2to1': 0, '2to3': 0, '3to2': 0 });
  const clickGuardRef = useRef(false);
  const transitionCompleteCounterRef = useRef(0);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [screenshotMode, setScreenshotMode] = useState(false);
  const [paleBlueDot, setPaleBlueDot] = useState(false);
  const [showComets, setShowComets] = useState(true);
  const [exploreToast, setExploreToast] = useState<string | null>(null);
  const [externalLevelRequest, setExternalLevelRequest] = useState<number | null>(null);
  const [selectedSun, setSelectedSun] = useState(false);
  const [isObservatory, setIsObservatory] = useState(false);
  const [isTelescopeMode, setIsTelescopeMode] = useState(false);
  const [darkSkyMinutes, setDarkSkyMinutes] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  // Universe HUD
  const [showUniverseLabels, setShowUniverseLabels] = useState(true);
  const [showUniverseFilaments, setShowUniverseFilaments] = useState(true);
  const [showUniverseVoids, setShowUniverseVoids] = useState(true);
  const [universeFact, setUniverseFact] = useState(0);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Universe HUD visibility sync
  useEffect(() => {
    if (universeFilamentGroupRef.current) universeFilamentGroupRef.current.visible = showUniverseFilaments;
  }, [showUniverseFilaments]);
  useEffect(() => {
    if (universeVoidGroupRef.current) universeVoidGroupRef.current.visible = showUniverseVoids;
  }, [showUniverseVoids]);
  useEffect(() => {
    if (universeLabelGroupRef.current) universeLabelGroupRef.current.visible = showUniverseLabels;
  }, [showUniverseLabels]);

  // Rotating universe facts
  const UNIVERSE_FACTS = [
    "There are more galaxies in the observable universe than grains of sand on Earth.",
    "The cosmic web formed from quantum fluctuations in the first second after the Big Bang.",
    "The voids between filaments are so large that light takes hundreds of millions of years to cross them.",
    "Dark matter forms the invisible scaffolding of every filament you can see.",
    "The Boötes Void is so empty that if the Milky Way were inside it, we would not have known other galaxies existed until the late 20th century.",
    "The observable universe is 93 billion light years across — yet the full universe may be infinite.",
  ];
  useEffect(() => {
    if (zoomLevel !== 3) return;
    const interval = setInterval(() => {
      setUniverseFact((f) => (f + 1) % UNIVERSE_FACTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [zoomLevel]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleObjectClick = useCallback((id: string, level: number) => {
    if (id === 'sagittarius-a' || id === 'sagittarius-a*' || id === 'sagittarius_a') {
      setSelectedSagittarius(true);
      setSelectedPlanet(null);
      setSelectedGalaxyObject(null);
      setSelectedUniverseObject(null);
      return;
    }
    if (level === 1) {
      setSelectedPlanet(id);
      setSelectedGalaxyObject(null);
      setSelectedUniverseObject(null);
    } else if (level === 3) {
      setSelectedUniverseObject(id);
      setSelectedPlanet(null);
      setSelectedGalaxyObject(null);
    } else {
      setSelectedGalaxyObject(id);
      setSelectedPlanet(null);
      setSelectedUniverseObject(null);
    }
  }, []);

  const triggerTransition = useCallback((targetLevel: number) => {
    if (transitioningRef.current || zoomLevelRef.current === targetLevel) return;
    
    transitioningRef.current = true;
    zoomLevelRef.current = targetLevel;
    setZoomLevel(targetLevel);
    
    if (targetLevel === 1) {
      cameraTargetRef.current = new THREE.Vector3(0, 50, 100);
      lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
      if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = true;
    } else if (targetLevel === 2) {
      cameraTargetRef.current = new THREE.Vector3(0, 8000, 12000);
      lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
      if (galaxyGroupRef.current) galaxyGroupRef.current.visible = true;
      if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = false;
    } else if (targetLevel === 3) {
      cameraTargetRef.current = new THREE.Vector3(0, 150000, 300000);
      lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
      if (universeGroupRef.current) universeGroupRef.current.visible = true;
      
      setShowUniverseText(true);
      setTimeout(() => setShowUniverseText(false), 3000);
    }
    
    // Safety timeout — force-complete transition after 3s so transitioningRef never gets stuck
    clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      if (transitioningRef.current) {
        transitioningRef.current = false;
        cameraTargetRef.current = null;
        lookAtTargetRef.current = null;
      }
    }, 3000);

    // Clear selection on transition
    setSelectedPlanet(null);
    setSelectedGalaxyObject(null);
    setSelectedSagittarius(false);
    setSelectedUniverseObject(null);
  }, []);

  // Safe transition — resets stuck state, sets 500ms click guard, then fires
  const safeTransition = useCallback((targetLevel: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Block CSS2D label clicks and raycaster for 500ms after any zoom button press
    clickGuardRef.current = true;
    setTimeout(() => { clickGuardRef.current = false; }, 500);
    transitioningRef.current = false;
    setTimeout(() => triggerTransition(targetLevel), 50);
  }, [triggerTransition]);

  useEffect(() => {
    document.title = "Interactive Universe — STELLARA";
    if (!webglSupported || !mountRef.current || !labelMountRef.current) return;

    // Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Setup Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500000);
    camera.position.set(0, 50, 100);
    cameraRef.current = camera;
    
    // Setup Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Setup CSS2DRenderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.zIndex = '2';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelMountRef.current.appendChild(labelRenderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300000;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 500);
    scene.add(sunLight);

    // ========================================================================
    // LEVEL 1: SOLAR SYSTEM
    // ========================================================================
    const solarSystemGroup = new THREE.Group();
    solarSystemGroupRef.current = solarSystemGroup;
    scene.add(solarSystemGroup);

    // ── Sun (reduced to 1.2 units, multi-pass glow) ──
    const sunRadius = 1.2;
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfffde7 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { id: 'sun', level: 1 };
    sunMeshRef.current = sun;
    solarSystemGroup.add(sun);

    // Sun hit mesh (1.5× visual radius) + label
    const sunHitGeo = new THREE.SphereGeometry(sunRadius * 2.5, 8, 8);
    const sunHitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const sunHitMesh = new THREE.Mesh(sunHitGeo, sunHitMat);
    sunHitMesh.userData = { id: 'sun', level: 1 };
    solarSystemGroup.add(sunHitMesh);

    const sunLabelDiv = document.createElement('div');
    sunLabelDiv.textContent = 'The Sun';
    sunLabelDiv.style.color = '#ffd54f';
    sunLabelDiv.style.fontFamily = 'Space Grotesk, sans-serif';
    sunLabelDiv.style.fontSize = '12px';
    sunLabelDiv.style.pointerEvents = 'auto';
    sunLabelDiv.style.cursor = 'pointer';
    sunLabelDiv.onclick = () => { setSelectedSun(true); setSelectedPlanet(null); setSelectedGalaxyObject(null); };
    const sunLabel = new CSS2DObject(sunLabelDiv);
    sunLabel.position.set(0, sunRadius * 1.5 + 0.8, 0);
    sun.add(sunLabel);

    // Glow passes: [radiusMultiplier, color, opacity]
    const glowPasses: [number, number, number][] = [
      [3.0, 0xfff3b0, 0.03],
      [2.2, 0xffdd44, 0.07],
      [1.6, 0xffcc00, 0.14],
    ];
    glowPasses.forEach(([rm, col, op]) => {
      solarSystemGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius * rm, 32, 32),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })
      ));
    });

    // ── Solar System Star Field (3000 stars, 3 depth layers) ──
    const lowPower = isLowPower();
    const bgCount = lowPower ? 1500 : 3000;
    const bgPos = new Float32Array(bgCount * 3);
    const bgCol = new Float32Array(bgCount * 3);
    const twinklePeriod = new Float32Array(bgCount);
    const twinkleOffset = new Float32Array(bgCount);

    for (let i = 0; i < bgCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      // Three depth layers
      let radius: number, hMin: number, hMax: number, sMax: number, lMin: number;
      if (i < bgCount * 0.67) {           // Layer 1 — distant
        radius = 600 + Math.random() * 400;
        hMin = 0.58; hMax = 0.67; sMax = 0.6; lMin = 0.85;
      } else if (i < bgCount * 0.9) {    // Layer 2 — mid
        radius = 350 + Math.random() * 200;
        hMin = 0.50; hMax = 0.78; sMax = 0.4; lMin = 0.85;
      } else {                            // Layer 3 — near / bright
        radius = 200 + Math.random() * 120;
        hMin = 0;   hMax = 1;    sMax = 0.2; lMin = 0.90;
      }
      bgPos[i*3]   = radius * Math.sin(phi) * Math.cos(theta);
      bgPos[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
      bgPos[i*3+2] = radius * Math.cos(phi);

      const hue = hMin + Math.random() * (hMax - hMin);
      const sat = Math.random() * sMax;
      const lit = lMin + Math.random() * (1 - lMin);
      const sc = new THREE.Color().setHSL(hue, sat, lit);
      bgCol[i*3]   = sc.r; bgCol[i*3+1] = sc.g; bgCol[i*3+2] = sc.b;

      twinklePeriod[i] = 2 + Math.random() * 4;   // seconds
      twinkleOffset[i] = Math.random() * Math.PI * 2;
    }

    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));
    const bgTex = makeCircleTex();
    const bgMat = new THREE.PointsMaterial({
      size: 2.0, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      map: bgTex, alphaTest: 0.005,
    });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars); // Not in any group — always visible at all zoom levels

    // Store twinkle data on the geometry for the animate loop
    (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array })
      .twinklePeriod = twinklePeriod;
    (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array })
      .twinkleOffset = twinkleOffset;

    // ── God Rays from Sun ──
    const rayCount = 14;
    const rayGroup = new THREE.Group();
    solarSystemGroup.add(rayGroup);
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2;
      const rayGeo = new THREE.BufferGeometry();
      const w = 0.8;
      const len = 900;
      const verts = new Float32Array([
        Math.cos(angle - w * 0.01) * sunRadius, Math.sin(angle - w * 0.01) * sunRadius, 0,
        Math.cos(angle + w * 0.01) * sunRadius, Math.sin(angle + w * 0.01) * sunRadius, 0,
        Math.cos(angle) * len,  Math.sin(angle) * len,  0,
      ]);
      rayGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const rayMat = new THREE.MeshBasicMaterial({
        color: 0xfff3b0, transparent: true, opacity: 0.025,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      rayGroup.add(new THREE.Mesh(rayGeo, rayMat));
    }

    // Create Planets
    planets.forEach(p => {
      const pivot = new THREE.Object3D();
      solarSystemGroup.add(pivot);

      const geo = new THREE.SphereGeometry(p.radiusScale, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ 
        color: p.color,
        roughness: 0.7,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.x = p.orbitRadius;
      mesh.rotation.z = p.tilt;
      mesh.userData = { id: p.id, level: 1 };
      
      pivot.add(mesh);

      if (p.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(p.radiusScale * 1.4, p.radiusScale * 2.2, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xe4d191,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      const orbitGeo = new THREE.RingGeometry(p.orbitRadius - 0.05, p.orbitRadius + 0.05, 128);
      const orbitMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.1 
      });
      const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
      orbitLine.rotation.x = Math.PI / 2;
      solarSystemGroup.add(orbitLine);

      const labelDiv = document.createElement('div');
      labelDiv.className = 'planet-label';
      labelDiv.textContent = p.name;
      labelDiv.style.color = '#ffffff';
      labelDiv.style.fontFamily = 'Space Grotesk, sans-serif';
      labelDiv.style.fontSize = '12px';
      labelDiv.style.pointerEvents = 'auto';
      labelDiv.style.cursor = 'pointer';
      labelDiv.onclick = () => handleObjectClick(p.id, 1);
      
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, p.radiusScale + 1, 0);
      mesh.add(label);

      planetMeshesRef.current[p.id] = { mesh, pivot, label };

      // Invisible 2.5× hit mesh for easier clicking
      const hitGeo = new THREE.SphereGeometry(p.radiusScale * 2.5, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.x = p.orbitRadius;
      hitMesh.userData = { id: p.id, level: 1 };
      pivot.add(hitMesh);
      planetHitMeshesRef.current[p.id] = hitMesh;

      // Init per-planet speed factors and accumulated angles
      planetSpeedFactorsRef.current[p.id] = 1.0;
      planetAnglesRef.current[p.id] = 0;
    });

    const asteroidCount = 2000;
    const astGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const astMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroidMesh = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
    
    const dummy = new THREE.Object3D();
    for (let i = 0; i < asteroidCount; i++) {
      const radius = 22 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      dummy.position.x = Math.cos(angle) * radius;
      dummy.position.z = Math.sin(angle) * radius;
      dummy.position.y = (Math.random() - 0.5) * 2;
      
      dummy.rotation.x = Math.random() * Math.PI;
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
      
      dummy.updateMatrix();
      asteroidMesh.setMatrixAt(i, dummy.matrix);
    }
    solarSystemGroup.add(asteroidMesh);

    // Create Comets
    COMETS.forEach(c => {
      const cGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const cMat = new THREE.MeshBasicMaterial({ color: c.color, blending: THREE.AdditiveBlending });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      
      cMesh.userData = { id: c.id, level: 1, isComet: true };
      solarSystemGroup.add(cMesh);

      // Tail
      const tailGeo = new THREE.BufferGeometry();
      tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const tailMat = new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
      const tailLine = new THREE.Line(tailGeo, tailMat);
      solarSystemGroup.add(tailLine);

      const cDiv = document.createElement('div');
      cDiv.className = 'planet-label';
      cDiv.textContent = c.name;
      cDiv.style.color = '#ffffff';
      cDiv.style.fontFamily = 'Space Grotesk, sans-serif';
      cDiv.style.fontSize = '10px';
      cDiv.style.pointerEvents = 'auto';
      cDiv.style.cursor = 'pointer';
      cDiv.onclick = () => {
        setSelectedGalaxyObject(c.id);
        setSelectedPlanet(null);
      };
      
      const cLabel = new CSS2DObject(cDiv);
      cLabel.position.set(0, 1.5, 0);
      cMesh.add(cLabel);

      cometMeshesRef.current[c.id] = { mesh: cMesh, tail: tailLine };
    });

    // ========================================================================
    // LEVEL 2: MILKY WAY GALAXY
    // ========================================================================
    const galaxyGroup = new THREE.Group();
    galaxyGroupRef.current = galaxyGroup;
    galaxyGroup.visible = false;
    scene.add(galaxyGroup);

    // Galactic Core
    const coreGeo = new THREE.SphereGeometry(800, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0, blending: THREE.AdditiveBlending });
    galaxyGroup.add(new THREE.Mesh(coreGeo, coreMat));

    const coreGlowGeo = new THREE.SphereGeometry(1400, 32, 32);
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    galaxyGroup.add(new THREE.Mesh(coreGlowGeo, coreGlowMat));

    const outerHaloGeo = new THREE.SphereGeometry(2500, 32, 32);
    const outerHaloMat = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
    galaxyGroup.add(new THREE.Mesh(outerHaloGeo, outerHaloMat));

    // Sagittarius A*
    const sagAGeo = new THREE.SphereGeometry(50, 16, 16);
    const sagAMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
    const sagA = new THREE.Mesh(sagAGeo, sagAMat);
    sagA.userData = { id: 'sagittarius-a', level: 2 };
    galaxyGroup.add(sagA);

    const sagADiv = document.createElement('div');
    sagADiv.textContent = 'Sagittarius A*';
    sagADiv.style.color = '#ffffff';
    sagADiv.style.fontFamily = 'Space Grotesk, sans-serif';
    sagADiv.style.fontSize = '12px';
    sagADiv.style.pointerEvents = 'auto';
    sagADiv.style.cursor = 'pointer';
    sagADiv.onclick = () => handleObjectClick('sagittarius-a', 2);
    const sagALabel = new CSS2DObject(sagADiv);
    sagALabel.position.set(0, 100, 0);
    sagA.add(sagALabel);

    // Star Particles
    const totalStars = 120000;
    const starPositions = new Float32Array(totalStars * 3);
    const starColors = new Float32Array(totalStars * 3);
    
    const colorCore = new THREE.Color(0xffcc88);
    const colorArm1 = new THREE.Color(0xcce8ff);
    const colorArm2 = new THREE.Color(0xffffff);
    const colorArm3 = new THREE.Color(0xfffde7);

    for (let i = 0; i < totalStars; i++) {
      let x, y, z;
      const c = new THREE.Color();
      
      if (i < 100000) {
        // Spiral Arms
        const numArms = 4;
        const armIndex = i % numArms;
        const armOffset = (armIndex / numArms) * 2 * Math.PI;
        
        const theta = 0.3 + Math.random() * 4.2;
        const a = 1500;
        const b = 0.4;
        const r = a * Math.exp(b * theta);
        
        x = r * Math.cos(theta + armOffset);
        z = r * Math.sin(theta + armOffset);
        
        const scatter = (Math.random() - 0.5) * r * 0.24;
        x += scatter * Math.cos(theta + armOffset + Math.PI/2);
        z += scatter * Math.sin(theta + armOffset + Math.PI/2);
        
        y = (Math.random() - 0.5) * r * 0.06;
        
        if (r < 3000) c.lerpColors(colorCore, colorArm2, r/3000);
        else if (r > 8000) c.copy(colorArm1);
        else c.copy(Math.random() > 0.5 ? colorArm2 : colorArm3);

      } else {
        // Halo stars
        const radius = Math.random() * 15000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
        c.set(0xffffff);
      }
      
      starPositions[i*3] = x;
      starPositions[i*3+1] = y;
      starPositions[i*3+2] = z;
      
      starColors[i*3] = c.r;
      starColors[i*3+1] = c.g;
      starColors[i*3+2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 15, vertexColors: true, blending: THREE.AdditiveBlending,
      transparent: true, opacity: 0.85, sizeAttenuation: true,
      map: makeCircleTex(), alphaTest: 0.005, depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    galaxyGroup.add(starPoints);

    // Nebulae
    const nebulaeData = [
      { id: 'eagle-nebula', name: 'Eagle Nebula', pos: [-3000, 50, 2000], col: 0x8844aa, s: 800 },
      { id: 'orion-nebula', name: 'Orion Nebula', pos: [4500, -20, 1000], col: 0x4466ff, s: 600 },
      { id: 'crab-nebula', name: 'Crab Nebula', pos: [5000, 100, -1000], col: 0xff6644, s: 400 },
      { id: 'lagoon-nebula', name: 'Lagoon Nebula', pos: [-1500, -30, 3000], col: 0xaa44cc, s: 700 }
    ];

    nebulaeData.forEach(n => {
      const nGeo = new THREE.PlaneGeometry(n.s, n.s);
      const nMat = new THREE.MeshBasicMaterial({ color: n.col, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
      nMesh.lookAt(0, 0, 0);
      nMesh.userData = { id: n.id, level: 2 };
      galaxyGroup.add(nMesh);
      
      const nDiv = document.createElement('div');
      nDiv.textContent = n.name;
      nDiv.style.color = '#ffffff';
      nDiv.style.fontFamily = 'Space Grotesk, sans-serif';
      nDiv.style.fontSize = '12px';
      nDiv.style.pointerEvents = 'auto';
      nDiv.style.cursor = 'pointer';
      nDiv.onclick = () => handleObjectClick(n.id, 2);
      const nLabel = new CSS2DObject(nDiv);
      nMesh.add(nLabel);
    });

    // You Are Here
    const youAreHereGeo = new THREE.CircleGeometry(50, 32);
    const youAreHereMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const youAreHere = new THREE.Mesh(youAreHereGeo, youAreHereMat);
    youAreHere.position.set(-4500, 0, 1500);
    youAreHere.lookAt(0, 100000, 0);
    galaxyGroup.add(youAreHere);

    const yahDiv = document.createElement('div');
    yahDiv.textContent = 'Solar System (You Are Here)';
    yahDiv.style.color = '#4fc3f7';
    yahDiv.style.fontFamily = 'Space Grotesk, sans-serif';
    yahDiv.style.fontSize = '12px';
    const yahLabel = new CSS2DObject(yahDiv);
    yahLabel.position.set(0, 100, 0);
    youAreHere.add(yahLabel);

    // Globular Clusters & Magellanic Clouds
    const clusterData = [
      { id: 'omega-centauri', name: 'Omega Centauri', pos: [-8000, 2000, -3000], r: 200, col: 0xfffde7 },
      { id: '47-tucanae', name: '47 Tucanae', pos: [-9000, -1500, -5000], r: 150, col: 0xfff9c4 },
      { id: 'm13', name: 'M13', pos: [6000, 3000, -2000], r: 120, col: 0xffffff },
      { id: 'm3', name: 'M3', pos: [3000, 4000, 1000], r: 100, col: 0xffffff },
      { id: 'm5', name: 'M5', pos: [-2000, -3500, -4000], r: 110, col: 0xffffff },
      { id: 'lmc', name: 'Large Magellanic Cloud', pos: [-15000, -2000, 8000], r: 600, col: 0xffe0b2 },
      { id: 'smc', name: 'Small Magellanic Cloud', pos: [-18000, -1000, 12000], r: 400, col: 0xffe0b2 }
    ];

    clusterData.forEach(c => {
      const cGeo = new THREE.SphereGeometry(c.r, 16, 16);
      const cMat = new THREE.MeshBasicMaterial({ color: c.col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
      cMesh.userData = { id: c.id, level: 2 };
      galaxyGroup.add(cMesh);

      const cDiv = document.createElement('div');
      cDiv.textContent = c.name;
      cDiv.style.color = '#ffffff';
      cDiv.style.fontFamily = 'Space Grotesk, sans-serif';
      cDiv.style.fontSize = '12px';
      cDiv.style.pointerEvents = 'auto';
      cDiv.style.cursor = 'pointer';
      cDiv.onclick = () => handleObjectClick(c.id, 2);
      const cLabel = new CSS2DObject(cDiv);
      cLabel.position.set(0, c.r + 50, 0);
      cMesh.add(cLabel);
    });

    // ========================================================================
    // LEVEL 3: OBSERVABLE UNIVERSE — COSMIC WEB
    // ========================================================================
    const universeGroup = new THREE.Group();
    universeGroupRef.current = universeGroup;
    universeGroup.visible = false;
    scene.add(universeGroup);

    const isMobile = window.innerWidth < 768;
    const GALAXY_COUNT = isMobile ? 12000 : 22000;

    // Step 1: Spine points for filament network
    const SPINE_COUNT = 100;
    const spinePoints: THREE.Vector3[] = [];
    for (let i = 0; i < SPINE_COUNT; i++) {
      const r = 40000 + Math.random() * 180000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      spinePoints.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.45,
        r * Math.cos(phi)
      ));
    }

    // Step 2: Catmull-Rom filaments between nearby spine points
    const filamentGroup = new THREE.Group();
    universeFilamentGroupRef.current = filamentGroup;
    universeGroup.add(filamentGroup);

    const usedPairs = new Set<string>();
    spinePoints.forEach((a, i) => {
      const nearest = spinePoints
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter(({ j }) => j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 4);

      nearest.forEach(({ j, d }) => {
        if (d > 180000) return;
        const key = [Math.min(i, j), Math.max(i, j)].join('-');
        if (usedPairs.has(key)) return;
        usedPairs.add(key);

        const b = spinePoints[j];
        const dist = a.distanceTo(b);
        // Two organic control points with random perpendicular offsets
        const mid1 = a.clone().lerp(b, 0.33);
        const mid2 = a.clone().lerp(b, 0.67);
        const perp1 = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const perp2 = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        mid1.addScaledVector(perp1, (Math.random()-0.5) * dist * 0.28);
        mid2.addScaledVector(perp2, (Math.random()-0.5) * dist * 0.28);

        const filOpacity = 0.04 + Math.random() * 0.08; // 0.04–0.12, varies per filament
        const curve = new THREE.CatmullRomCurve3([a, mid1, mid2, b]);
        const pts = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xfff5d0,
          transparent: true,
          opacity: filOpacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        filamentGroup.add(new THREE.Line(lineGeo, lineMat));
      });
    });

    // Collect sample positions from spine points for galaxy weighting
    const samplePoints = spinePoints;

    // Step 3: Galaxy positions weighted by filament proximity
    // Collect positions with density falloff near centre (reduces blown-out core)
    const acceptedPos: number[] = [];
    const acceptedCol: number[] = [];
    let attempts = 0;
    while (acceptedPos.length < GALAXY_COUNT * 3 && attempts < GALAXY_COUNT * 5) {
      attempts++;
      let pos: THREE.Vector3;
      const rand = Math.random();

      if (rand < 0.78 && samplePoints.length > 0) {
        const sp = samplePoints[Math.floor(Math.random() * samplePoints.length)];
        const spread = rand < 0.5 ? 10000 : 28000;
        pos = new THREE.Vector3(
          sp.x + (Math.random() - 0.5) * spread,
          sp.y + (Math.random() - 0.5) * spread * 0.4,
          sp.z + (Math.random() - 0.5) * spread
        );
      } else {
        const gr = 60000 + Math.random() * 160000;
        const theta2 = Math.random() * Math.PI * 2;
        const phi2 = Math.acos(Math.random() * 2 - 1);
        pos = new THREE.Vector3(
          gr * Math.sin(phi2) * Math.cos(theta2),
          gr * Math.sin(phi2) * Math.sin(theta2) * 0.4,
          gr * Math.cos(phi2)
        );
      }

      // Density falloff: reject centre-heavy positions
      const dc = pos.length();
      if (dc < 15000 && Math.random() >= 0.4) continue;
      if (dc < 30000 && Math.random() >= 0.7) continue;

      acceptedPos.push(pos.x, pos.y, pos.z);

      // 50% blue-white spirals, 35% yellow ellipticals, 15% red distant
      const cr = Math.random();
      let col: THREE.Color;
      if (cr < 0.50) {
        col = new THREE.Color().setHSL((210 + Math.random() * 30) / 360, 0.5 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
      } else if (cr < 0.85) {
        col = new THREE.Color().setHSL((40 + Math.random() * 20) / 360, 0.25 + Math.random() * 0.2, 0.65 + Math.random() * 0.25);
      } else {
        col = new THREE.Color().setHSL((5 + Math.random() * 15) / 360, 0.6 + Math.random() * 0.2, 0.5 + Math.random() * 0.25);
      }
      acceptedCol.push(col.r, col.g, col.b);
    }
    const galaxyPositions = new Float32Array(acceptedPos);
    const galaxyColors = new Float32Array(acceptedCol);

    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    const galaxyMat = new THREE.PointsMaterial({
      map: makeCircleTex(),
      size: isMobile ? 600 : 350,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
      alphaTest: 0.005,
    });
    universeGroup.add(new THREE.Points(galaxyGeo, galaxyMat));

    // Step 4: Named Voids
    const voidGroup = new THREE.Group();
    universeVoidGroupRef.current = voidGroup;
    universeGroup.add(voidGroup);

    const VOIDS = [
      {
        id: 'bootes-void', name: 'Boötes Void', pos: [80000, 5000, -60000] as [number,number,number], radius: 38000,
        info: 'One of the largest known voids — 330 million light years across. Only 60 galaxies found where thousands were expected.',
      },
      {
        id: 'local-void', name: 'Local Void', pos: [-20000, -3000, 30000] as [number,number,number], radius: 18000,
        info: 'The void our Local Group sits on the boundary of — spanning roughly 150 million light years.',
      },
      {
        id: 'eridanus-void', name: 'Eridanus Supervoid', pos: [-100000, -8000, 80000] as [number,number,number], radius: 52000,
        info: 'The largest known void — nearly 1 billion light years across. Associated with the CMB Cold Spot.',
      },
      {
        id: 'sculptor-void', name: 'Sculptor Void', pos: [50000, 4000, 90000] as [number,number,number], radius: 22000,
        info: 'One of the first cosmic voids ever discovered, in 1981.',
      },
    ];

    universeVoidHitMeshesRef.current = [];
    VOIDS.forEach(v => {
      const vGeo = new THREE.SphereGeometry(v.radius, 16, 16);
      const vMat = new THREE.MeshBasicMaterial({
        color: 0x000308, transparent: true, opacity: 0.35, depthWrite: false,
      });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      vMesh.position.set(...v.pos);
      // visual mesh has no userData.id so raycaster ignores it
      voidGroup.add(vMesh);

      // Faint blue wireframe edge
      const wGeo = new THREE.SphereGeometry(v.radius, 12, 12);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0x0a1628, transparent: true, opacity: 0.12, wireframe: true, depthWrite: false,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.position.copy(vMesh.position);
      voidGroup.add(wMesh);

      // Invisible hit sphere — 30% larger than visual for easy clicking
      const hitGeo = new THREE.SphereGeometry(v.radius * 1.3, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(...v.pos);
      hitMesh.userData = { id: v.id, level: 3, type: 'void' };
      voidGroup.add(hitMesh);
      universeVoidHitMeshesRef.current.push(hitMesh);

      const voidTier = (v.id === 'bootes-void' || v.id === 'eridanus-void') ? 2 : 3;
      const vDiv = document.createElement('div');
      vDiv.textContent = v.name;
      vDiv.style.cssText = voidTier === 2
        ? 'color:rgba(79,195,247,0.75);font-size:12px;font-family:Space Grotesk,sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);'
        : 'color:rgba(79,195,247,0.5);font-size:10px;font-family:Space Grotesk,sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);';
      vDiv.onclick = (e) => {
        e.stopPropagation();
        if (clickGuardRef.current) return;
        if (transitioningRef.current) return;
        if (zoomLevelRef.current !== 3) return;
        handleObjectClick(v.id, 3);
      };
      const vLabel = new CSS2DObject(vDiv);
      vLabel.position.set(0, v.radius + 3000, 0);
      vMesh.add(vLabel);

      // Void boundary glow — BackSide inner edge suggests the void wall
      const edgeGeo = new THREE.SphereGeometry(v.radius * 1.05, 32, 32);
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x1a3a6b, transparent: true, opacity: 0.08,
        side: THREE.BackSide, depthWrite: false,
      });
      const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
      edgeMesh.position.copy(vMesh.position);
      voidGroup.add(edgeMesh);
    });

    // Step 5: Landmark objects
    const labelGroup = new THREE.Group();
    universeLabelGroupRef.current = labelGroup;
    universeGroup.add(labelGroup);

    const LANDMARKS = [
      { id: 'milky-way-u', name: '🌌 You Are Here', pos: [0, 0, 0] as [number,number,number], col: 0xffd54f, s: 1800, labelOffset: [0, 3000, 0] as [number,number,number], tier: 1 },
      { id: 'andromeda-u', name: 'Andromeda', pos: [12000, -800, -5000] as [number,number,number], col: 0x4fc3f7, s: 1400, labelOffset: [0, -2000, 0] as [number,number,number], tier: 2 },
      { id: 'virgo-cluster', name: 'Virgo Cluster', pos: [-32000, 2500, -22000] as [number,number,number], col: 0xffffff, s: 2200, labelOffset: [2000, 0, 0] as [number,number,number], tier: 2 },
      { id: 'coma-cluster', name: 'Coma Cluster', pos: [65000, 6000, 32000] as [number,number,number], col: 0xffcc88, s: 2800, labelOffset: [0, 2000, 0] as [number,number,number], tier: 2 },
      { id: 'perseus-cluster', name: 'Perseus Cluster', pos: [-52000, -3500, 42000] as [number,number,number], col: 0xffffff, s: 2400, labelOffset: [-2000, 0, 0] as [number,number,number], tier: 2 },
      { id: 'great-attractor', name: 'Great Attractor', pos: [-45000, 1000, -70000] as [number,number,number], col: 0x9c27b0, s: 3200, labelOffset: [0, -2000, 0] as [number,number,number], tier: 2 },
    ];

    universeLandmarkMeshesRef.current = [];
    LANDMARKS.forEach(u => {
      const uGeo = new THREE.SphereGeometry(u.s, 16, 16);
      const uMat = new THREE.MeshBasicMaterial({
        color: u.col, transparent: true,
        opacity: u.id === 'milky-way-u' ? 0.35 : 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const uMesh = new THREE.Mesh(uGeo, uMat);
      uMesh.position.set(...u.pos);
      uMesh.userData = { id: u.id, level: 3, type: 'landmark' };
      labelGroup.add(uMesh);
      universeLandmarkMeshesRef.current.push(uMesh);

      // Outer glow
      const glowGeo = new THREE.SphereGeometry(u.s * 2.5, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: u.col, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(uMesh.position);
      labelGroup.add(glowMesh);

      const tierCss: Record<number, string> = {
        1: 'color:#ffd54f;font-size:14px;font-weight:700;',
        2: 'color:rgba(255,255,255,0.85);font-size:12px;font-weight:400;',
        3: 'color:rgba(255,255,255,0.55);font-size:10px;font-weight:400;',
      };
      const uDiv = document.createElement('div');
      uDiv.textContent = u.name;
      uDiv.style.cssText = `${tierCss[u.tier] ?? tierCss[2]}font-family:Space Grotesk,sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.04em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);`;
      uDiv.onclick = (e) => {
        e.stopPropagation();
        if (clickGuardRef.current) return;
        if (transitioningRef.current) return;
        if (zoomLevelRef.current !== 3) return;
        handleObjectClick(u.id, 3);
      };
      const uLabel = new CSS2DObject(uDiv);
      uLabel.position.set(...u.labelOffset);
      uMesh.add(uLabel);
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (clickGuardRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      const interactables: THREE.Object3D[] = [];
      if (zoomLevelRef.current === 1 && solarSystemGroupRef.current) {
        // Use enlarged hit meshes for planets, plus sun hit mesh
        interactables.push(...Object.values(planetHitMeshesRef.current));
        if (sunMeshRef.current) interactables.push(sunHitMesh);
        if (showComets) interactables.push(...Object.values(cometMeshesRef.current).map(c => c.mesh));
      } else if (zoomLevelRef.current === 2 && galaxyGroupRef.current) {
        galaxyGroupRef.current.children.forEach(c => { if(c.userData.id) interactables.push(c); });
      } else if (zoomLevelRef.current === 3) {
        // Only add specifically tagged hit meshes — NOT the galaxy point cloud
        interactables.push(...universeVoidHitMeshesRef.current);
        interactables.push(...universeLandmarkMeshesRef.current);
      }
      
      const intersects = raycaster.intersectObjects(interactables);
      
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        const level = intersects[0].object.userData.level;
        const isComet = intersects[0].object.userData.isComet;
        if (id) {
          if (id === 'sun') {
            setSelectedSun(true);
            setSelectedPlanet(null);
            setSelectedGalaxyObject(null);
            setSelectedSagittarius(false);
            setSelectedUniverseObject(null);
          } else if (isComet) {
            setSelectedGalaxyObject(id);
            setSelectedPlanet(null);
            setSelectedSagittarius(false);
          } else {
            handleObjectClick(id, level);
            // Click pulse for universe objects
            if (level === 3) {
              clickPulseRef.current = { mesh: intersects[0].object as THREE.Mesh, startTime: performance.now() };
            }
          }
        }
      }
    };
    
    renderer.domElement.addEventListener('click', onMouseClick);

    const hoverRaycaster = new THREE.Raycaster();
    const hoverMouse = new THREE.Vector2();
    const onMouseMove = (e: MouseEvent) => {
      mousePosScreenRef.current = { x: e.clientX, y: e.clientY };
      // Cursor change for universe-level hover
      if (zoomLevelRef.current === 3) {
        const hrect = renderer.domElement.getBoundingClientRect();
        hoverMouse.x = ((e.clientX - hrect.left) / hrect.width) * 2 - 1;
        hoverMouse.y = -((e.clientY - hrect.top) / hrect.height) * 2 + 1;
        hoverRaycaster.setFromCamera(hoverMouse, camera);
        const hoverTargets = [
          ...universeVoidHitMeshesRef.current,
          ...universeLandmarkMeshesRef.current,
        ];
        const hits = hoverRaycaster.intersectObjects(hoverTargets);
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
      } else if (zoomLevelRef.current !== 3) {
        // keep cursor managed by existing planet/galaxy hover logic
      }
    };
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let time = 0;
    let animationFrameId: number;
    let lastTime = performance.now();
    let totalElapsed = 0; // seconds
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      totalElapsed += dt / 1000;

      // ── Star twinkle ──
      if (bgMat && bgGeo) {
        const tp = (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array }).twinklePeriod;
        const to = (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array }).twinkleOffset;
        if (tp && to) {
          bgMat.opacity = 0.85 + Math.sin(totalElapsed * 0.3) * 0.05;
          bgMat.needsUpdate = true;
        }
      }

      // ── God rays slow rotation ──
      if (rayGroup) {
        rayGroup.rotation.z += 0.00008 * (speedRef.current || 1);
      }

      if (!isPausedRef.current && zoomLevelRef.current === 1) {
        time += 0.01 * speedRef.current;

        // Hover-to-slow: update per-planet speed factors from screen-space distances
        if (cameraRef.current) {
          const msx = mousePosScreenRef.current.x;
          const msy = mousePosScreenRef.current.y;
          const fovRad = (cameraRef.current.fov * Math.PI) / 180;
          planets.forEach(p => {
            const { mesh } = planetMeshesRef.current[p.id];
            if (!mesh) return;
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            const ndc = worldPos.clone().project(cameraRef.current!);
            const sx = (ndc.x + 1) / 2 * window.innerWidth;
            const sy = (-ndc.y + 1) / 2 * window.innerHeight;
            const camDist = cameraRef.current!.position.distanceTo(worldPos);
            const pixelRadius = (p.radiusScale / camDist) * (window.innerHeight / (2 * Math.tan(fovRad / 2)));
            const hoverRadius = Math.max(pixelRadius * 3, 40);
            const screenDist = Math.hypot(msx - sx, msy - sy);
            const targetFactor = screenDist < hoverRadius ? 0.15 : 1.0;
            const cur = planetSpeedFactorsRef.current[p.id] ?? 1.0;
            planetSpeedFactorsRef.current[p.id] = cur + (targetFactor - cur) * 0.06;
          });
        }
        
        // Per-planet accumulated angles (supports individual speed factors)
        planets.forEach(p => {
          const { pivot, mesh } = planetMeshesRef.current[p.id];
          const factor = planetSpeedFactorsRef.current[p.id] ?? 1.0;
          planetAnglesRef.current[p.id] = (planetAnglesRef.current[p.id] ?? 0) + 0.01 * speedRef.current * factor * (365 / p.orbitalPeriod);
          pivot.rotation.y = planetAnglesRef.current[p.id];
          mesh.rotation.y += 0.05 * speedRef.current * factor;
        });
        
        asteroidMesh.rotation.y += 0.0005 * speedRef.current;

        // Animate Comets
        COMETS.forEach(c => {
          const entry = cometMeshesRef.current[c.id];
          if (!entry) return;
          const { mesh, tail } = entry;
          
          mesh.visible = showComets;
          tail.visible = showComets;
          if (!showComets) return;

          mesh.position.x = Math.cos(time * c.orbitSpeed + c.phase) * c.orbitRadius;
          mesh.position.z = Math.sin(time * c.orbitSpeed + c.phase) * c.orbitRadius * 0.3;
          
          const sunPos = new THREE.Vector3(0,0,0);
          const dir = new THREE.Vector3().subVectors(mesh.position, sunPos).normalize();
          
          const tailPositions = tail.geometry.attributes.position.array as Float32Array;
          tailPositions[0] = mesh.position.x;
          tailPositions[1] = mesh.position.y;
          tailPositions[2] = mesh.position.z;
          tailPositions[3] = mesh.position.x + dir.x * c.tailLength;
          tailPositions[4] = mesh.position.y + dir.y * c.tailLength;
          tailPositions[5] = mesh.position.z + dir.z * c.tailLength;
          tail.geometry.attributes.position.needsUpdate = true;
        });
      }

      if (!isPausedRef.current && zoomLevelRef.current === 2) {
        galaxyGroup.rotation.y += 0.000005 * dt;
      }

      // ── Click pulse animation ──
      if (clickPulseRef.current) {
        const elapsed = performance.now() - clickPulseRef.current.startTime;
        const t = Math.min(elapsed / 400, 1);
        const scale = t < 0.5 ? 1 + t * 0.6 : 1.3 - (t - 0.5) * 0.6;
        clickPulseRef.current.mesh.scale.setScalar(scale);
        if (t >= 1) {
          clickPulseRef.current.mesh.scale.setScalar(1);
          clickPulseRef.current = null;
        }
      }
      
      // Auto-trigger transitions — debounced: must be past threshold for 20 consecutive frames
      const THRESHOLD_FRAMES = 20;
      const dist = controls.getDistance();

      if (zoomLevelRef.current === 1 && dist > 400 && !transitioningRef.current) {
        thresholdCounterRef.current['1to2']++;
        if (thresholdCounterRef.current['1to2'] >= THRESHOLD_FRAMES) {
          thresholdCounterRef.current['1to2'] = 0;
          triggerTransition(2);
        }
      } else { thresholdCounterRef.current['1to2'] = 0; }

      if (zoomLevelRef.current === 2 && dist < 200 && !transitioningRef.current) {
        thresholdCounterRef.current['2to1']++;
        if (thresholdCounterRef.current['2to1'] >= THRESHOLD_FRAMES) {
          thresholdCounterRef.current['2to1'] = 0;
          triggerTransition(1);
        }
      } else { thresholdCounterRef.current['2to1'] = 0; }

      if (zoomLevelRef.current === 2 && dist > 80000 && !transitioningRef.current) {
        thresholdCounterRef.current['2to3']++;
        if (thresholdCounterRef.current['2to3'] >= THRESHOLD_FRAMES) {
          thresholdCounterRef.current['2to3'] = 0;
          triggerTransition(3);
        }
      } else { thresholdCounterRef.current['2to3'] = 0; }

      if (zoomLevelRef.current === 3 && dist < 50000 && !transitioningRef.current) {
        thresholdCounterRef.current['3to2']++;
        if (thresholdCounterRef.current['3to2'] >= THRESHOLD_FRAMES) {
          thresholdCounterRef.current['3to2'] = 0;
          triggerTransition(2);
        }
      } else { thresholdCounterRef.current['3to2'] = 0; }

      // Camera transitions
      if (transitioningRef.current && cameraTargetRef.current && lookAtTargetRef.current) {
        camera.position.lerp(cameraTargetRef.current, 0.05);
        controls.target.lerp(lookAtTargetRef.current, 0.05);

        if (camera.position.distanceTo(cameraTargetRef.current) < 20) {
          transitionCompleteCounterRef.current++;
          if (transitionCompleteCounterRef.current > 10) {
            clearTimeout(transitionTimeoutRef.current);
            transitioningRef.current = false;
            transitionCompleteCounterRef.current = 0;
            camera.position.copy(cameraTargetRef.current);
            controls.target.copy(lookAtTargetRef.current);
            cameraTargetRef.current = null;
            lookAtTargetRef.current = null;
          }
        } else {
          transitionCompleteCounterRef.current = 0;
        }
      }
      
      if (externalLevelRequest !== null) {
        triggerTransition(externalLevelRequest);
        setExternalLevelRequest(null);
      }
      
      // Smooth zoom target (universe level)
      if (zoomTargetRef.current !== null) {
        const cur = camera.position.length();
        const nxt = THREE.MathUtils.lerp(cur, zoomTargetRef.current, 0.08);
        camera.position.normalize().multiplyScalar(nxt);
        if (Math.abs(nxt - zoomTargetRef.current) < 0.5) {
          zoomTargetRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    
    animate();

    // Resize handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (labelMountRef.current?.contains(labelRenderer.domElement)) {
        labelMountRef.current.removeChild(labelRenderer.domElement);
      }
      
      renderer.dispose();
      scene.clear();
    };
  }, [webglSupported, handleObjectClick, triggerTransition]);

  useEffect(() => {
    if (galaxyGroupRef.current) {
      if (isEdgeOn) {
        galaxyGroupRef.current.rotation.x = Math.PI / 2;
      } else {
        galaxyGroupRef.current.rotation.x = 0;
      }
    }
  }, [isEdgeOn]);

  useEffect(() => {
    if (paleBlueDot) {
      const timer = setTimeout(() => {
        setExternalLevelRequest(3);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [paleBlueDot]);

  const handleRandomExplore = () => {
    const dest = EXPLORE_DESTINATIONS[Math.floor(Math.random() * EXPLORE_DESTINATIONS.length)];
    setExploreToast(`Flying to ${dest.name}...`);
    setTimeout(() => setExploreToast(null), 3000);
    
    triggerTransition(dest.level);
    
    // Give transition time to start then move camera
    setTimeout(() => {
      cameraTargetRef.current = new THREE.Vector3(...dest.cameraPos);
      lookAtTargetRef.current = new THREE.Vector3(...dest.target);
      transitioningRef.current = true;
    }, 100);
  };

  const handleViewPlanet = () => {
    if (!selectedPlanet || !planetMeshesRef.current[selectedPlanet]) return;
    const mesh = planetMeshesRef.current[selectedPlanet].mesh;
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    cameraTargetRef.current = new THREE.Vector3(pos.x + 5, pos.y + 2, pos.z + 5);
    lookAtTargetRef.current = pos;
    transitioningRef.current = true;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.key) {
        case 'p':
        case 'P':
          setIsPaused(v => !v);
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
          break;
        case 'r':
        case 'R':
          if (cameraRef.current) {
            cameraTargetRef.current = new THREE.Vector3(0, 20, 50);
            lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
            transitioningRef.current = true;
          }
          break;
        case 'o':
        case 'O':
          setIsObservatory(prev => {
            if (!prev) {
              setDarkSkyMinutes(0);
              observatoryTimerRef.current = setInterval(() => {
                setDarkSkyMinutes(m => m + 1);
              }, 60000);
            } else {
              if (observatoryTimerRef.current) clearInterval(observatoryTimerRef.current);
              setIsTelescopeMode(false);
            }
            return !prev;
          });
          break;
        case 'Escape':
          setSelectedPlanet(null);
          setSelectedSun(false);
          setSelectedGalaxyObject(null);
          setSelectedSagittarius(false);
          setSelectedUniverseObject(null);
          setShowShortcuts(false);
          break;
        case '+':
        case '=':
          if (zoomLevelRef.current === 3) {
            const cur = cameraRef.current?.position.length() ?? 800;
            zoomTargetRef.current = Math.max(15, cur * 0.75);
          }
          break;
        case '-':
          if (zoomLevelRef.current === 3) {
            const cur2 = cameraRef.current?.position.length() ?? 800;
            zoomTargetRef.current = Math.min(1800, cur2 / 0.75);
          }
          break;
        case '?':
          setShowShortcuts(v => !v);
          break;
        case '0':
          if (zoomLevel === 1) {
            setSelectedSun(true);
            setSelectedPlanet(null);
            if (cameraRef.current) {
              cameraTargetRef.current = new THREE.Vector3(5, 3, 8);
              lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
              transitioningRef.current = true;
            }
          }
          break;
        default:
          if (/^[1-8]$/.test(e.key) && zoomLevel === 1) {
            const idx = parseInt(e.key) - 1;
            const planet = planets[idx];
            if (planet && planetMeshesRef.current[planet.id]) {
              const { mesh } = planetMeshesRef.current[planet.id];
              const pos = new THREE.Vector3();
              mesh.getWorldPosition(pos);
              setSelectedPlanet(planet.id);
              setSelectedSun(false);
              cameraTargetRef.current = new THREE.Vector3(pos.x + 5, pos.y + 2, pos.z + 5);
              lookAtTargetRef.current = pos;
              transitioningRef.current = true;
            }
          }
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [zoomLevel, planets]);

  if (!webglSupported) {
    return <WebGLFallback />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <div ref={labelMountRef} className="absolute inset-0 z-10 pointer-events-none" />
      
      {paleBlueDot && <PaleBlueDotSequence onComplete={() => setPaleBlueDot(false)} />}
      
      {exploreToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-[#4fc3f7] text-white px-6 py-3 rounded-full text-sm font-['Orbitron'] shadow-[0_0_15px_rgba(79,195,247,0.3)] animate-in fade-in zoom-in duration-300">
          {exploreToast}
        </div>
      )}

      {screenshotMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button variant="outline" onClick={() => setScreenshotMode(false)} className="bg-black/50 backdrop-blur border-white/20">
            Exit Screenshot Mode
          </Button>
        </div>
      )}

      {showUniverseText && !screenshotMode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-1000 bg-black/40 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-light tracking-widest text-white animate-pulse">
            The Observable Universe <br/><span className="text-2xl text-white/60">93 billion light years across · 2 trillion galaxies</span>
          </h1>
        </div>
      )}

      {/* Universe Level HUD */}
      {zoomLevel === 3 && !screenshotMode && (
        <>
          {/* Top-left */}
          <div className="absolute top-20 left-4 z-20 pointer-events-none">
            <p className="text-xs font-bold tracking-widest" style={{ fontFamily: "Orbitron, sans-serif", color: "#ffd54f", letterSpacing: "0.12em" }}>
              OBSERVABLE UNIVERSE
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>
              93 billion light years · 2 trillion galaxies
            </p>
          </div>

          {/* Bottom-centre rotating facts */}
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none max-w-sm"
            key={universeFact}
            style={{ animation: "fadeIn 1s ease-out" }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Grotesk, sans-serif", fontStyle: "italic" }}>
              "{UNIVERSE_FACTS[universeFact]}"
            </p>
          </div>
        </>
      )}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm mx-4"
            style={{ background: "rgba(6,6,20,0.98)", border: "1px solid rgba(79,195,247,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.1em" }}>
              KEYBOARD SHORTCUTS
            </h2>
            <div className="space-y-2">
              {[
                ["P", "Pause / Resume"],
                ["F", "Toggle Fullscreen"],
                ["R", "Reset Camera"],
                ["O", "Observatory Mode"],
                ["0", "Focus the Sun"],
                ["1 – 8", "Focus planet by order"],
                ["ESC", "Close panels"],
                ["?", "This overlay"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</span>
                  <kbd
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(79,195,247,0.1)",
                      border: "1px solid rgba(79,195,247,0.25)",
                      color: "#4fc3f7",
                      fontFamily: "monospace",
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-5 w-full py-2 rounded-xl text-xs transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            >
              Close (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Sun Info Panel */}
      {selectedSun && (
        <SunInfoPanel open={selectedSun} onClose={() => setSelectedSun(false)} />
      )}

      {/* Observatory Mode overlay */}
      {isObservatory && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Red light mode tint */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(60,0,0,0.18)", mixBlendMode: "multiply" }}
          />
          {/* Telescope eyepiece vignette */}
          {isTelescopeMode && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: "none" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.95) 62%, rgba(0,0,0,1) 100%)",
                }}
              />
              <div
                style={{
                  width: "min(65vw, 65vh)",
                  height: "min(65vw, 65vh)",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,80,0,0.25)",
                  boxShadow: "0 0 0 2px rgba(255,80,0,0.1), inset 0 0 60px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              />
              {/* Crosshair */}
              <div style={{ position: "absolute", left: "50%", top: "calc(50% - min(31.5vw,31.5vh))", transform: "translateX(-50%)", width: "1px", height: "min(63vw,63vh)", background: "rgba(255,80,0,0.2)" }} />
              <div style={{ position: "absolute", top: "50%", left: "calc(50% - min(31.5vw,31.5vh))", transform: "translateY(-50%)", height: "1px", width: "min(63vw,63vh)", background: "rgba(255,80,0,0.2)" }} />
            </div>
          )}
          {/* Dark sky timer */}
          <div
            className="absolute bottom-36 md:bottom-10 right-4 pointer-events-auto"
            style={{
              background: "rgba(40,0,0,0.7)",
              border: "1px solid rgba(180,0,0,0.3)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#ff6060",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "13px",
            }}
          >
            <div style={{ fontSize: "10px", opacity: 0.5, letterSpacing: "0.08em", marginBottom: 4 }}>OBSERVATORY MODE</div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>🔴 Red light active</div>
            <div style={{ fontSize: "11px", opacity: 0.5, marginTop: 2 }}>Eyes adapting: {darkSkyMinutes}m</div>
          </div>
        </div>
      )}

      {/* Top Right Controls — unified panel, always on top */}
      {!screenshotMode && (
        <div
          className="absolute top-20 right-4 z-[100] flex flex-col"
          style={{
            background: "rgba(10,10,26,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(79,195,247,0.2)",
            borderRadius: "12px",
            padding: "8px",
            minWidth: "160px",
            pointerEvents: "all",
          }}
        >
          {/* Universe-only toggles — shown only at level 3 */}
          {zoomLevel === 3 && (
            <>
              {[
                { label: "🌐 Labels", state: showUniverseLabels, set: setShowUniverseLabels },
                { label: "🕸 Filaments", state: showUniverseFilaments, set: setShowUniverseFilaments },
                { label: "⭕ Voids", state: showUniverseVoids, set: setShowUniverseVoids },
              ].map(({ label, state, set }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); set((v: boolean) => !v); }}
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    background: state ? "rgba(79,195,247,0.12)" : "transparent",
                    color: state ? "#4fc3f7" : "rgba(255,255,255,0.5)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left" as const,
                    width: "100%",
                    letterSpacing: "0.03em",
                    marginBottom: "2px",
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ height: 1, background: "rgba(79,195,247,0.15)", margin: "4px 2px 6px" }} />
            </>
          )}

          {/* Pale Blue Dot */}
          <button
            onClick={(e) => { e.stopPropagation(); setPaleBlueDot(true); }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              background: "rgba(255,213,79,0.06)",
              color: "#ffd54f",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
              marginBottom: "2px",
            }}
          >
            ⭐ Pale Blue Dot
          </button>

          {/* Observatory */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = !isObservatory;
              setIsObservatory(next);
              if (next) {
                setDarkSkyMinutes(0);
                observatoryTimerRef.current = setInterval(() => setDarkSkyMinutes(m => m + 1), 60000);
              } else {
                if (observatoryTimerRef.current) clearInterval(observatoryTimerRef.current);
                setIsTelescopeMode(false);
              }
            }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              background: isObservatory ? "rgba(220,38,38,0.15)" : "transparent",
              color: isObservatory ? "#f87171" : "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
              marginBottom: "2px",
            }}
          >
            🔭 {isObservatory ? "Exit Obs." : "Observatory"}
          </button>

          {isObservatory && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsTelescopeMode(t => !t); }}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                background: isTelescopeMode ? "rgba(251,146,60,0.15)" : "transparent",
                color: isTelescopeMode ? "#fb923c" : "rgba(255,200,150,0.6)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left" as const,
                width: "100%",
                letterSpacing: "0.03em",
                marginBottom: "2px",
              }}
            >
              🔬 {isTelescopeMode ? "Exit Eyepiece" : "Eyepiece"}
            </button>
          )}

          {/* Screenshot */}
          <button
            onClick={(e) => { e.stopPropagation(); setScreenshotMode(true); }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
            }}
          >
            📷 Screenshot
          </button>
        </div>
      )}

      {/* Zoom Level Indicator */}
      {!screenshotMode && (
        <div className="absolute bottom-32 md:bottom-6 left-6 z-20 flex flex-col gap-2">
          <div className="text-xs text-white/50 tracking-widest uppercase">
            {zoomLevel === 1 && "SOLAR SYSTEM"}
            {zoomLevel === 2 && "MILKY WAY GALAXY"}
            {zoomLevel === 3 && "OBSERVABLE UNIVERSE"}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${zoomLevel === 1 ? 'bg-[#4fc3f7]' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full ${zoomLevel === 2 ? 'bg-[#4fc3f7]' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full ${zoomLevel === 3 ? 'bg-[#4fc3f7]' : 'bg-white/20'}`} />
          </div>
          <div className="text-[10px] text-[#4fc3f7]">You Are Here</div>
        </div>
      )}
      
      {/* Controls Overlay */}
      {!screenshotMode && (
        <Card className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-background/80 backdrop-blur-xl border-white/10 p-4 z-20 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {zoomLevel === 1 && (
            <div className="flex items-center gap-2 w-full justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-20"
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <div className="w-32 md:w-48 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12 text-right">{speedMultiplier}x</span>
                  <Slider 
                    value={[speedMultiplier]} 
                    min={1} 
                    max={100} 
                    step={1} 
                    onValueChange={(val) => setSpeedMultiplier(val[0])}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-white flex items-center gap-1 cursor-pointer hover:text-[#4fc3f7] transition-colors">
                  <input type="checkbox" checked={showComets} onChange={(e) => setShowComets(e.target.checked)} className="rounded bg-black/50 border-white/20" /> Comets
                </label>
                <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                  <Compass2 className="w-4 h-4" /> Explore
                </Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(2, e)}>Zoom to Galaxy</Button>
              </div>
            </div>
          )}

          {zoomLevel === 2 && (
            <div className="flex items-center justify-between w-full gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEdgeOn(!isEdgeOn)}>
                  {isEdgeOn ? "Face-on View" : "Edge-on View"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                  <Compass2 className="w-4 h-4" /> Explore
                </Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(1, e)}>Zoom to Solar System</Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(3, e)}>Zoom Out to Universe</Button>
              </div>
            </div>
          )}

          {zoomLevel === 3 && (
            <div className="flex items-center justify-between w-full gap-2">
              <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                <Compass2 className="w-4 h-4" /> Explore
              </Button>
              <Button variant="secondary" size="sm" onClick={(e) => safeTransition(2, e)}>Zoom to Milky Way</Button>
            </div>
          )}

        </div>
      </Card>
      )}

      {/* Universe zoom controls */}
      {!screenshotMode && zoomLevel === 3 && (
        <div
          className="absolute z-40 flex flex-col gap-1.5"
          style={{ bottom: '6rem', right: '1rem' }}
        >
          {[
            { label: '+', title: 'Zoom In', action: () => { const c = cameraRef.current?.position.length() ?? 800; zoomTargetRef.current = Math.max(15, c * 0.75); } },
            { label: '⊙', title: 'Reset View', action: () => { zoomTargetRef.current = 800; if (controlsRef.current) controlsRef.current.target.set(0, 0, 0); } },
            { label: '−', title: 'Zoom Out', action: () => { const c = cameraRef.current?.position.length() ?? 800; zoomTargetRef.current = Math.min(1800, c / 0.75); } },
          ].map(({ label, title, action }) => (
            <button
              key={title}
              title={title}
              onClick={(e) => { e.stopPropagation(); action(); }}
              style={{
                width: 44,
                height: 44,
                background: 'rgba(10,10,26,0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(79,195,247,0.2)',
                borderRadius: 10,
                color: '#e0e0e0',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,195,247,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,195,247,0.6)';
                (e.currentTarget as HTMLButtonElement).style.color = '#4fc3f7';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,26,0.9)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(79,195,247,0.2)';
                (e.currentTarget as HTMLButtonElement).style.color = '#e0e0e0';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!screenshotMode && (
        <>
          <PlanetInfoPanel planetId={selectedPlanet} onClose={() => setSelectedPlanet(null)} onViewInFocus={handleViewPlanet} />
          <GalaxyInfoPanel objectId={selectedGalaxyObject} onClose={() => setSelectedGalaxyObject(null)} />
          <SagittariusPanel open={selectedSagittarius} onClose={() => setSelectedSagittarius(false)} />
          <UniverseInfoPanel objectId={selectedUniverseObject} onClose={() => setSelectedUniverseObject(null)} />
        </>
      )}
    </div>
  );
}