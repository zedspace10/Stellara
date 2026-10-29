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
import { heliocentric, EPHEMERIS_MIN, EPHEMERIS_MAX } from '@/lib/ephemeris';
import { moon as moonPhase, sunLongitude } from '@/lib/sky';
import { COMETS, cometPosition, cometOrbit, SPACECRAFT, spacecraftPosition, toScene, formatKm, lightTime } from '@/lib/smallbodies';
import VoyagerLookBack from '@/components/VoyagerLookBack';
import NoteUniversePanel from '@/components/NoteUniversePanel';
import NearbyGalaxyPanel from '@/components/NearbyGalaxyPanel';
import PinPanel from '@/components/PinPanel';
import { PINS, LATEST_PIN, pinRaDec, isThisWeek } from '@/data/pins';
import { BIG_GALAXIES, DWARF_GALAXIES, LOCAL_VOLUME_MLY } from '@/data/localVolume';
import { galacticToScene, universeR, FAR_LANDMARKS, pinScene } from '@/lib/universeMap';
import { loadNotes, kmTravelled, Note, destinationOf, notePosition, directionOf, Destination, bigKm } from '@/lib/notes';
import { AU_KM, sceneRadius } from '@/lib/smallbodies';
import { Card } from '@/components/ui/card';
import { Camera, Dice1, Compass as Compass2, Star } from 'lucide-react';


// How fast time runs in the solar system view. Planet positions are real for whatever date is shown.
const TIME_RATES = [
  { label: "Real speed", daysPerSecond: 1 / 86400 },
  { label: "1 hour per second", daysPerSecond: 1 / 24 },
  { label: "1 day per second", daysPerSecond: 1 },
  { label: "1 week per second", daysPerSecond: 7 },
  { label: "1 month per second", daysPerSecond: 30.44 },
  { label: "1 year per second", daysPerSecond: 365.25 },
];
// Start on right now, at real speed: the first thing people see is where the planets really are at this
// moment. The camera drifts slowly around the Sun instead, and the speed menu is one tap away.
const DEFAULT_RATE = 0;
// One slow turn around the Sun takes about three and a half minutes.
const DRIFT_SPEED = 0.28;

// Distance and light time for a comet or spacecraft on the date shown in the view.
function liveFactsFor(id: string | null, timeMs: number) {
  if (!id) return undefined;
  const comet = COMETS.find(c => c.id === id);
  const craft = SPACECRAFT.find(c => c.id === id);
  const pos = comet ? cometPosition(comet, timeMs) : craft ? spacecraftPosition(craft, timeMs) : null;
  if (!pos) return undefined;
  const au = pos.r < 10 ? pos.r.toFixed(2) : pos.r.toFixed(1);
  const facts = [{ label: 'From the Sun', value: `${formatKm(pos.r)} (${au} au)` }];
  if (craft) {
    const earth = heliocentric('earth', timeMs);
    const d = earth ? Math.hypot(pos.x - earth.x, pos.y - earth.y, pos.z - earth.z) : pos.r;
    facts.push({ label: 'Its signals take', value: `${lightTime(d)} to reach us` });
  } else {
    facts.push({ label: 'Sunlight takes', value: `${lightTime(pos.r)} to reach it` });
  }
  return facts;
}

// A camera position that shows both the Sun and the note: looking at the line between them from
// the side and a little above, far enough back for both to fit, but not so far the view moves on.
function frameNote(q: THREE.Vector3) {
  const len = Math.max(14, q.length());
  const qd = q.lengthSq() > 0 ? q.clone().normalize() : new THREE.Vector3(1, 0, 0);
  const perp = new THREE.Vector3().crossVectors(qd, new THREE.Vector3(0, 1, 0));
  if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
  perp.normalize();
  const dir = perp.multiplyScalar(0.8).add(new THREE.Vector3(0, 0.6, 0)).normalize();
  const look = q.clone().multiplyScalar(0.5);
  return { cam: look.clone().addScaledVector(dir, Math.min(330, len * 1.7 + 25)), look };
}

// Andromeda's real place in the universe view.
const ANDROMEDA = BIG_GALAXIES.find(g => g.id === 'm31')!;
const ANDROMEDA_U = galacticToScene(ANDROMEDA.l, ANDROMEDA.b, ANDROMEDA.mly);
// Every galaxy inside this distance is drawn from the catalogue; beyond it the cosmic web is illustrative.
const LOCAL_VOLUME_R = universeR(LOCAL_VOLUME_MLY);

const EXPLORE_DESTINATIONS: { name: string; level: number; cameraPos: [number, number, number]; target: [number, number, number]; planetId?: string; offset?: [number, number, number] }[] = [
  { name: "Saturn's rings", level: 1, cameraPos: [42, 8, 15], target: [40, 0, 0], planetId: "saturn", offset: [2, 8, 15] },
  { name: "Jupiter close-up", level: 1, cameraPos: [30, 6, 12], target: [28, 0, 0], planetId: "jupiter", offset: [2, 6, 12] },
  { name: "Earth and Moon", level: 1, cameraPos: [14, 4, 8], target: [12, 0, 0], planetId: "earth", offset: [2, 4, 8] },
  { name: "Asteroid Belt", level: 1, cameraPos: [0, 20, 30], target: [0, 0, 0] },
  { name: "The Galactic Core", level: 2, cameraPos: [0, 3000, 6000], target: [0, 0, 0] },
  { name: "Eagle Nebula", level: 2, cameraPos: [-3000, 2000, 5000], target: [-3000, 50, 2000] },
  { name: "Omega Centauri", level: 2, cameraPos: [-8000, 3000, 0], target: [-8000, 2000, -3000] },
  { name: "The Cosmic Web", level: 3, cameraPos: [0, 150000, 280000], target: [0, 0, 0] },
  { name: "Andromeda Galaxy", level: 3, cameraPos: ANDROMEDA_U.clone().add(new THREE.Vector3(5000, 2500, 6000)).toArray(), target: ANDROMEDA_U.toArray() },
  { name: "Our galaxy neighbourhood", level: 3, cameraPos: [0, 24000, 72000], target: [0, 0, 0] },
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

/** Soft round glow, used for the Sun, nebulae, clusters and distant galaxies. */
function makeGlowTex(rgb: string, stops: [number, number][] = [[0, 1], [0.2, 0.55], [0.5, 0.15], [1, 0]]): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const h = size / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  stops.forEach(([at, a]) => g.addColorStop(at, `rgba(${rgb},${a})`));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A face on spiral galaxy drawn into a texture, squashed for viewing angle when used on a sprite. */
function makeSpiralTex(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const h = size / 2;
  ctx.globalCompositeOperation = 'lighter';
  let seed = 11;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 9000; i++) {
    const arm = i % 2;
    const t = rand() * 3.4;
    const r = 18 * Math.exp(0.42 * t) * (0.9 + rand() * 0.25);
    if (r > h * 0.95) continue;
    const a = t + arm * Math.PI + (rand() - 0.5) * 0.5;
    const x = h + Math.cos(a) * r, y = h + Math.sin(a) * r;
    const warm = r < h * 0.35;
    ctx.fillStyle = warm ? 'rgba(255,226,180,0.10)' : 'rgba(190,215,255,0.08)';
    ctx.beginPath(); ctx.arc(x, y, 1.6 + rand() * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  const core = ctx.createRadialGradient(h, h, 0, h, h, h * 0.45);
  core.addColorStop(0, 'rgba(255,240,215,0.95)');
  core.addColorStop(0.3, 'rgba(255,220,170,0.35)');
  core.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Approximate colour of a star from its surface temperature. */
function kelvinToColor(k: number): THREE.Color {
  const t = Math.max(1000, Math.min(40000, k)) / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * Math.pow(t - 60, -0.1332);
    g = 288.12 * Math.pow(t - 60, -0.0755);
    b = 255;
  }
  const clamp = (v: number) => Math.max(0, Math.min(255, v)) / 255;
  // Soften towards white: stars look mostly white to the eye, with a hint of colour.
  return new THREE.Color(0.35 + 0.65 * clamp(r), 0.35 + 0.65 * clamp(g), 0.35 + 0.65 * clamp(b));
}

const TEXTURE_FILES: Record<string, string> = {
  sun: 'sun.webp', mercury: 'mercury.webp', venus: 'venus.webp', earth: 'earth.webp', mars: 'mars.webp',
  jupiter: 'jupiter.webp', saturn: 'saturn.webp', uranus: 'uranus.webp', neptune: 'neptune.webp',
};

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
            <circle cx="64" cy="64" r="10" fill="#F3DDB0" />
            <ellipse cx="64" cy="64" rx="28" ry="8" fill="none" stroke="#A9C3E0" strokeWidth="1" opacity="0.5"/>
            <circle cx="92" cy="64" r="3" fill="#A9C3E0" />
            <ellipse cx="64" cy="64" rx="45" ry="14" fill="none" stroke="#A995FF" strokeWidth="1" opacity="0.4"/>
            <circle cx="109" cy="64" r="4" fill="#c88b3a" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#F3DDB0] mb-3" style={{fontFamily: '"Instrument Sans", sans-serif'}}>
          Interactive Universe
        </h2>
        <p className="text-[#e0e0e0]/70 max-w-md mx-auto leading-relaxed mb-2">
          The 3D solar system requires WebGL, which isn't available in this preview environment.
        </p>
        <p className="text-[#A9C3E0]/80 text-sm max-w-md mx-auto">
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
  
  const [rateIndex, setRateIndex] = useState(DEFAULT_RATE);
  const [isPaused, setIsPaused] = useState(false);
  const simTimeRef = useRef(Date.now());
  const rateRef = useRef(DEFAULT_RATE);
  const [simTime, setSimTime] = useState(() => Date.now());
  const [webglSupported] = useState(() => checkWebGLSupport());
  
  const speedRef = useRef(1);
  // The slow drift of the camera on arrival. It stops for good the moment the person touches the view,
  // chooses something, or has asked their device for less motion.
  const driftRef = useRef(
    typeof window === "undefined" || !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
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
  const cometOrbitGroupRef = useRef<THREE.Group | null>(null);
  const spacecraftRef = useRef<Record<string, { marker: THREE.Mesh; trail: THREE.Line }>>({});
  const showCometsRef = useRef(true);
  const selectedObjectRef = useRef<string | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const planetHitMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const planetSpeedFactorsRef = useRef<Record<string, number>>({});
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
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
  // The controls panel at the bottom. Its height is measured so everything else that sits near the
  // bottom of the screen can stay just above it, and above the tab bar on phones.
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockH, setDockH] = useState(72);
  useEffect(() => {
    const el = dockRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setDockH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [screenshotMode]);
  const [paleBlueDot, setPaleBlueDot] = useState(false);
  const [showComets, setShowComets] = useState(true);
  const [lookBack, setLookBack] = useState(false);
  useEffect(() => { showCometsRef.current = showComets; }, [showComets]);
  useEffect(() => { selectedObjectRef.current = selectedGalaxyObject; }, [selectedGalaxyObject]);
  const [exploreToast, setExploreToast] = useState<string | null>(null);
  const [externalLevelRequest, setExternalLevelRequest] = useState<number | null>(null);
  const [selectedSun, setSelectedSun] = useState(false);
  // The person's latest note, if they have sent one, shown as its light spreading out from Earth.
  const noteRef = useRef<Note | null>(null);
  if (noteRef.current === null && typeof window !== 'undefined') {
    noteRef.current = loadNotes().sort((a, b) => b.sentAt - a.sentAt)[0] ?? null;
  }
  const [noteOpen, setNoteOpen] = useState(false);
  const noteChipRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (selectedPlanet || selectedGalaxyObject || selectedSun) setNoteOpen(false);
  }, [selectedPlanet, selectedGalaxyObject, selectedSun]);
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
    rateRef.current = rateIndex;
    // Visual speed for things that are illustrative only (sun rays, asteroid belt, comets).
    speedRef.current = Math.min(100, Math.max(0.02, TIME_RATES[rateIndex].daysPerSecond / 36));
  }, [rateIndex]);

  // Keep the date readout in step with the simulation clock.
  useEffect(() => {
    const id = setInterval(() => setSimTime(simTimeRef.current), 250);
    return () => clearInterval(id);
  }, []);

  // Choosing a real galaxy flies the camera over to it.
  useEffect(() => {
    let pos: THREE.Vector3 | null = null;
    if (selectedUniverseObject?.startsWith('lv:')) {
      const g = BIG_GALAXIES.find(x => `lv:${x.id}` === selectedUniverseObject);
      if (g) pos = galacticToScene(g.l, g.b, g.mly);
    } else if (selectedUniverseObject?.startsWith('pin:')) {
      // A weekly picture: fly over to where it sits.
      const p = PINS.find(x => `pin:${x.id}` === selectedUniverseObject);
      if (p) { const { ra, dec } = pinRaDec(p); pos = pinScene(ra, dec, p.mly); }
    }
    if (!pos) return;
    cameraTargetRef.current = pos.clone().add(new THREE.Vector3(3500, 2000, 6000));
    lookAtTargetRef.current = pos;
    transitioningRef.current = true;
  }, [selectedUniverseObject]);

  useEffect(() => {
    if (selectedPlanet) driftRef.current = false;
  }, [selectedPlanet]);

  const jumpToNow = () => {
    simTimeRef.current = Date.now();
    setSimTime(simTimeRef.current);
  };

  // Arriving from the note page (/?note): set the sky to now and pull back until the note's light is in view.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('note') || !noteRef.current) return;
    const sentAt = noteRef.current.sentAt;
    const t = window.setTimeout(() => {
      // Far enough back to see both the Sun and the note, but never so far that the view moves on to the galaxy.
      const n = noteRef.current;
      const d = n ? destinationOf(n) : undefined;
      const q = n && d ? toScene(notePosition(n, d, Date.now())) : { x: 0, y: 0, z: 0 };
      const { cam, look } = frameNote(new THREE.Vector3(q.x, q.y, q.z));
      cameraTargetRef.current = cam;
      lookAtTargetRef.current = look;
      transitioningRef.current = true;
      // Switch the clock at once, so not even one frame runs at the faster speed.
      rateRef.current = 0;
      setRateIndex(0);
      simTimeRef.current = Date.now();
      setSimTime(simTimeRef.current);
      setNoteOpen(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

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
    "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
    "The cosmic web grew from tiny ripples present in the first fraction of a second after the Big Bang.",
    "The voids between filaments are so large that light takes hundreds of millions of years to cross them.",
    "Dark matter forms the invisible scaffolding of every filament you can see.",
    "The Boötes Void is so empty that if the Milky Way sat at its centre, we would probably not have known other galaxies existed until the 1960s.",
    "The observable universe is 93 billion light years across, yet the full universe may be infinite.",
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
      // The Milky Way model is thousands of times bigger than the solar system and centred on it,
      // so left showing it would fill the view with glow and hide the planets.
      if (galaxyGroupRef.current) galaxyGroupRef.current.visible = false;
      // The universe view is laid out at its own scale, so it is hidden closer in.
      if (universeGroupRef.current) universeGroupRef.current.visible = false;
    } else if (targetLevel === 2) {
      cameraTargetRef.current = new THREE.Vector3(0, 8000, 12000);
      lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
      if (galaxyGroupRef.current) galaxyGroupRef.current.visible = true;
      if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = false;
      if (universeGroupRef.current) universeGroupRef.current.visible = false;
    } else if (targetLevel === 3) {
      cameraTargetRef.current = new THREE.Vector3(0, 150000, 300000);
      lookAtTargetRef.current = new THREE.Vector3(0, 0, 0);
      if (universeGroupRef.current) universeGroupRef.current.visible = true;
      if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = false;
      if (galaxyGroupRef.current) galaxyGroupRef.current.visible = false;
      
      setShowUniverseText(true);
      setTimeout(() => setShowUniverseText(false), 3000);
    }
    
    // Safety timeout — force-complete transition after 3s so transitioningRef never gets stuck
    clearTimeout(transitionTimeoutRef.current);
    // If the flight is still going after 3 seconds (a long way, or a slow device), finish it by
    // putting the camera where it was heading. Stopping it part way left the camera far out,
    // and the view would then switch straight back out to the galaxy.
    transitionTimeoutRef.current = setTimeout(() => {
      if (transitioningRef.current) {
        if (cameraTargetRef.current && cameraRef.current) cameraRef.current.position.copy(cameraTargetRef.current);
        if (lookAtTargetRef.current && controlsRef.current) {
          controlsRef.current.target.copy(lookAtTargetRef.current);
          controlsRef.current.update();
        }
        transitioningRef.current = false;
        transitionCompleteCounterRef.current = 0;
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

  // Open one of the weekly pictures where it sits in the universe.
  const openPin = useCallback((id: string) => {
    const select = () => setSelectedUniverseObject(`pin:${id}`);
    if (zoomLevelRef.current !== 3) {
      triggerTransition(3);
      window.setTimeout(select, 2600);
    } else {
      select();
    }
  }, [triggerTransition]);

  // Arriving from the weekly page (/?pin=ngc-1827): go straight to that picture.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pin');
    if (!id || !PINS.some(p => p.id === id)) return;
    const t = window.setTimeout(() => openPin(id), 900);
    return () => clearTimeout(t);
  }, [openPin]);

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
    document.title = "Interactive Universe | PALE";
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    const texLoader = new THREE.TextureLoader();
    const texBase = `${import.meta.env.BASE_URL}textures/`;
    const loadTex = (file: string) => {
      const t = texLoader.load(texBase + file);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };

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
    controls.autoRotateSpeed = DRIFT_SPEED;
    controls.addEventListener('start', () => { driftRef.current = false; });

    // Lighting
    // Faint fill so the night side of each planet is just visible, then sunlight from the Sun itself.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.06);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff6e8, 3.2, 0, 0);
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
    const sunMaterial = new THREE.MeshBasicMaterial({ map: loadTex(TEXTURE_FILES.sun) });
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
    sunLabelDiv.style.color = '#F3DDB0';
    sunLabelDiv.style.fontFamily = '"Instrument Sans", sans-serif';
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
    void glowPasses;
    // The Sun's glow: two soft camera facing halos rather than solid shells.
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTex('255,226,160', [[0, 0.9], [0.12, 0.55], [0.35, 0.12], [1, 0]]),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    sunGlow.scale.set(sunRadius * 9, sunRadius * 9, 1);
    solarSystemGroup.add(sunGlow);
    const sunCorona = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTex('255,240,210', [[0, 0.35], [0.25, 0.08], [1, 0]]),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    sunCorona.scale.set(sunRadius * 26, sunRadius * 26, 1);
    solarSystemGroup.add(sunCorona);

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
    scene.add(bgStars); // Fallback until the real sky has loaded

    // ── The real night sky: about 9,000 naked eye stars from the Yale Bright Star Catalogue,
    // each in its true direction and colour. It moves with the camera, because real stars are
    // so far away that moving around the solar system never changes where they appear.
    const realSky = new THREE.Group();
    scene.add(realSky);
    let realSkyReady = false;
    fetch(`${import.meta.env.BASE_URL}data/bright-stars.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((d: { stars: [number, number, number, number, number][] } | null) => {
        if (!d) return;
        const R = 4000;
        const buckets = [
          { min: -9, max: 1, size: 4.4 },
          { min: 1, max: 2.5, size: 3.3 },
          { min: 2.5, max: 4, size: 2.4 },
          { min: 4, max: 99, size: 1.6 },
        ];
        const tex = makeCircleTex();
        buckets.forEach(b => {
          const sel = d.stars.filter(st => st[3] > b.min && st[3] <= b.max);
          const pos = new Float32Array(sel.length * 3);
          const col = new Float32Array(sel.length * 3);
          sel.forEach((st, i) => {
            pos[i * 3] = st[0] * R; pos[i * 3 + 1] = st[1] * R; pos[i * 3 + 2] = st[2] * R;
            const c = kelvinToColor(st[4] * 100);
            const fade = Math.max(0.35, Math.min(1, 1.05 - (st[3] - b.min) * 0.22));
            col[i * 3] = c.r * fade; col[i * 3 + 1] = c.g * fade; col[i * 3 + 2] = c.b * fade;
          });
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          g.setAttribute('color', new THREE.BufferAttribute(col, 3));
          realSky.add(new THREE.Points(g, new THREE.PointsMaterial({
            size: b.size, sizeAttenuation: false, vertexColors: true, map: tex,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, alphaTest: 0.01,
          })));
        });
        realSkyReady = true;
      })
      .catch(() => { /* keep the generated star field */ });

    // Store twinkle data on the geometry for the animate loop
    (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array })
      .twinklePeriod = twinklePeriod;
    (bgGeo as THREE.BufferGeometry & { twinklePeriod: Float32Array; twinkleOffset: Float32Array })
      .twinkleOffset = twinkleOffset;

    // ── God Rays from Sun ──
    const rayCount = 0; // God rays removed: a soft glow is closer to how the Sun looks
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
      pivot.rotation.y = heliocentric(p.id, simTimeRef.current)?.lon ?? 0;
      solarSystemGroup.add(pivot);

      const geo = new THREE.SphereGeometry(p.radiusScale, 64, 48);
      const mat = new THREE.MeshStandardMaterial({
        map: TEXTURE_FILES[p.id] ? loadTex(TEXTURE_FILES[p.id]) : null,
        color: TEXTURE_FILES[p.id] ? 0xffffff : p.color,
        roughness: 1,
        metalness: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.x = p.orbitRadius;
      mesh.rotation.z = p.tilt;
      mesh.userData = { id: p.id, level: 1 };
      
      pivot.add(mesh);

      if (p.id === 'saturn') {
        // The ring image is a top down view of the rings; use its left half on a flat square.
        const ringTex = loadTex('saturn-ring.webp');
        ringTex.repeat.set(0.5, 1);
        const ringSize = p.radiusScale * 2.33 * 2;
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex, transparent: true, side: THREE.DoubleSide,
          roughness: 1, metalness: 0, depthWrite: false,
        });
        const ring = new THREE.Mesh(new THREE.PlaneGeometry(ringSize, ringSize), ringMat);
        ring.rotation.x = -Math.PI / 2;
        mesh.add(ring);
      }

      if (p.id === 'earth') {
        // Clouds drift slightly faster than the ground beneath them.
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(p.radiusScale * 1.012, 64, 48),
          new THREE.MeshStandardMaterial({ map: loadTex('earth-clouds.webp'), transparent: true, depthWrite: false, roughness: 1, metalness: 0 }),
        );
        clouds.userData = { spin: 1.15 };
        mesh.add(clouds);

        // A thin blue atmosphere, brightest at the edge of the disc.
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(p.radiusScale * 1.06, 48, 32),
          new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
            vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
            fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(0.42, 0.72, 1.0, 1.0) * f * 0.9; }',
          }),
        );
        mesh.add(atmosphere);

        // The Moon, placed each frame at its real angle from the Sun (from the lunar phase).
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(p.radiusScale * 0.27, 48, 32),
          new THREE.MeshStandardMaterial({ map: loadTex('moon.webp'), roughness: 1, metalness: 0 }),
        );
        moonMesh.userData = { id: 'earth', level: 1 };
        pivot.add(moonMesh);
        moonMeshRef.current = moonMesh;
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
      labelDiv.style.fontFamily = '"Instrument Sans", sans-serif';
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

      // Init per-planet hover factors
      planetSpeedFactorsRef.current[p.id] = 1.0;
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

    // Labels that need to keep out of each other's way, most important first.
    const labelSlots: { obj: CSS2DObject; el: HTMLElement; w: number }[] = [];
    labelSlots.push({ obj: sunLabel, el: sunLabelDiv, w: 0 });
    [...planets].sort((a, b) => b.radiusScale - a.radiusScale).forEach(p => {
      const l = planetMeshesRef.current[p.id]?.label;
      if (l) labelSlots.push({ obj: l, el: l.element, w: 0 });
    });

    // Comets on their real orbits. A comet's whole orbit is drawn when you select it, and the
    // tail only grows when a comet comes in close to the Sun, as real tails do.
    const cometOrbitGroup = new THREE.Group();
    cometOrbitGroupRef.current = cometOrbitGroup;
    solarSystemGroup.add(cometOrbitGroup);
    COMETS.forEach(c => {
      const cc = new THREE.Color(c.color);
      const rgb = `${Math.round(cc.r * 255)},${Math.round(cc.g * 255)},${Math.round(cc.b * 255)}`;
      const orbitPts = cometOrbit(c).map(v => { const q = toScene(v); return new THREE.Vector3(q.x, q.y, q.z); });
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: 0.35, depthWrite: false }),
      );
      orbitLine.userData.cometId = c.id;
      cometOrbitGroup.add(orbitLine);

      // An invisible sphere to click, with a soft point of light inside it.
      const cMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      cMesh.userData = { id: c.id, level: 1, isComet: true };
      const cGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex(rgb, [[0, 1], [0.25, 0.45], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      cGlow.scale.set(1.3, 1.3, 1);
      cMesh.add(cGlow);
      solarSystemGroup.add(cMesh);

      const tailGeo = new THREE.BufferGeometry();
      tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const tailLine = new THREE.Line(tailGeo, new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
      solarSystemGroup.add(tailLine);

      const cDiv = document.createElement('div');
      cDiv.className = 'planet-label';
      cDiv.textContent = c.name;
      cDiv.style.cssText = 'color:rgba(255,255,255,0.75);font-family:"Instrument Sans",sans-serif;font-size:11px;pointer-events:auto;cursor:pointer;white-space:nowrap;';
      cDiv.onclick = () => { setSelectedGalaxyObject(c.id); setSelectedPlanet(null); setSelectedSun(false); };
      const cLabel = new CSS2DObject(cDiv);
      cLabel.position.set(0, 1.4, 0);
      cMesh.add(cLabel);
      labelSlots.push({ obj: cLabel, el: cDiv, w: 0 });

      cometMeshesRef.current[c.id] = { mesh: cMesh, tail: tailLine };
    });

    // Spacecraft leaving the solar system, at their real distance and direction from the Sun.
    // The faint line shows the straight path they have taken since passing Neptune's distance.
    SPACECRAFT.forEach(sc => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 8, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      marker.userData = { id: sc.id, level: 1, isComet: true };
      const dot = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex('169,195,224', [[0, 1], [0.2, 0.5], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      dot.scale.set(1.5, 1.5, 1);
      marker.add(dot);
      solarSystemGroup.add(marker);

      const trail = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: 0xa9c3e0, transparent: true, opacity: 0.22, depthWrite: false }),
      );
      solarSystemGroup.add(trail);

      const sDiv = document.createElement('div');
      sDiv.className = 'planet-label';
      sDiv.textContent = sc.name;
      sDiv.style.cssText = 'color:#A9C3E0;font-family:"Instrument Sans",sans-serif;font-size:11px;pointer-events:auto;cursor:pointer;white-space:nowrap;';
      sDiv.onclick = () => { setSelectedGalaxyObject(sc.id); setSelectedPlanet(null); setSelectedSun(false); };
      const sLabel = new CSS2DObject(sDiv);
      sLabel.position.set(0, 1.6, 0);
      marker.add(sLabel);
      labelSlots.push({ obj: sLabel, el: sDiv, w: 0 });

      spacecraftRef.current[sc.id] = { marker, trail };
    });

    // The person's latest note: one clear point of light where it is right now, with a soft pulse
    // around it, a short fading tail showing which way it is going, and its distance from Earth.
    // It is placed with the same squeezed scale as the planets and spacecraft, so it passes each of
    // them on screen when it really does.
    let noteMark: {
      core: THREE.Sprite; halo: THREE.Sprite; tail: THREE.Line; anchor: THREE.Object3D;
      dist: HTMLSpanElement; note: Note; dest: Destination; lastText: number;
      chip: HTMLButtonElement; arrow: HTMLSpanElement;
    } | null = null;
    const myNote = noteRef.current;
    const myDest = myNote ? destinationOf(myNote) : undefined;
    if (myNote && myDest) {
      const core = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex('255,244,218', [[0, 1], [0.18, 0.85], [0.4, 0.25], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true,
      }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex('243,221,176', [[0, 0], [0.62, 0], [0.74, 0.7], [0.86, 0], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true,
      }));
      const TAIL = 32;
      const tg = new THREE.BufferGeometry();
      tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TAIL * 3), 3));
      const tc = new Float32Array(TAIL * 3);
      for (let k = 0; k < TAIL; k++) {
        // Brightest at the note, fading to nothing behind it.
        const f = Math.pow(k / (TAIL - 1), 1.6);
        tc.set([0.95 * f, 0.87 * f, 0.69 * f], k * 3);
      }
      tg.setAttribute('color', new THREE.BufferAttribute(tc, 3));
      const tail = new THREE.Line(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const anchor = new THREE.Object3D();
      solarSystemGroup.add(tail, halo, core, anchor);

      const nDiv = document.createElement('div');
      nDiv.className = 'planet-label';
      nDiv.style.cssText = 'font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;white-space:nowrap;text-align:center;line-height:1.25;';
      // Sits above the point of light; an inner box, because the label spacing code sets the outer margin.
      const inner = document.createElement('div');
      inner.style.cssText = 'transform:translateY(-30px);';
      const title = document.createElement('span');
      title.textContent = 'Your note';
      title.style.cssText = 'display:block;color:#F3DDB0;font-size:12px;';
      const dist = document.createElement('span');
      dist.style.cssText = 'display:block;color:rgba(243,221,176,0.7);font-size:11px;font-variant-numeric:tabular-nums;';
      inner.append(title, dist);
      nDiv.append(inner);
      nDiv.onclick = () => { setNoteOpen(true); setSelectedGalaxyObject(null); setSelectedPlanet(null); setSelectedSun(false); };
      const nLabel = new CSS2DObject(nDiv);
      anchor.add(nLabel);
      labelSlots.unshift({ obj: nLabel, el: nDiv, w: 0 });
      // When the note is off screen, a small chip at the edge points the way and flies you there.
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.setAttribute('aria-label', 'Show your note');
      chip.style.cssText = 'position:absolute;display:none;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:rgba(10,15,23,0.85);border:1px solid rgba(243,221,176,0.45);color:#F3DDB0;font:12px "Instrument Sans",sans-serif;white-space:nowrap;pointer-events:auto;cursor:pointer;transform:translate(-50%,-50%);z-index:3;';
      const arrow = document.createElement('span');
      arrow.textContent = '➜';
      arrow.style.cssText = 'display:inline-block;';
      const chipText = document.createElement('span');
      chipText.textContent = 'Your note';
      chip.append(arrow, chipText);
      labelMountRef.current.appendChild(chip);
      chip.onclick = () => {
        const { cam, look } = frameNote(core.position.clone());
        cameraTargetRef.current = cam;
        lookAtTargetRef.current = look;
        transitioningRef.current = true;
        setNoteOpen(true); setSelectedGalaxyObject(null); setSelectedPlanet(null); setSelectedSun(false);
      };
      noteChipRef.current = chip;
      noteMark = { core, halo, tail, anchor, dist, note: myNote, dest: myDest, lastText: 0, chip, arrow };
    }

    // ========================================================================
    // LEVEL 2: MILKY WAY GALAXY
    // ========================================================================
    const galaxyGroup = new THREE.Group();
    galaxyGroupRef.current = galaxyGroup;
    galaxyGroup.visible = false;
    scene.add(galaxyGroup);

    const galaxyLabels: CSS2DObject[] = [];

    // Galactic core: a soft glow of old, warm stars, and the central bar the Milky Way is known to have.
    const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTex('255,214,160', [[0, 0.75], [0.15, 0.4], [0.45, 0.08], [1, 0]]),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    coreGlow.scale.set(7000, 7000, 1);
    galaxyGroup.add(coreGlow);

    const barCount = 26000;
    const barPos = new Float32Array(barCount * 3);
    const barCol = new Float32Array(barCount * 3);
    const barAngle = 0.47; // the bar points about 27 degrees from the Sun to centre line
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
    for (let i = 0; i < barCount; i++) {
      const bx = gauss() * 2600, bz = gauss() * 900, by = gauss() * 380;
      barPos[i * 3] = bx * Math.cos(barAngle) - bz * Math.sin(barAngle);
      barPos[i * 3 + 1] = by;
      barPos[i * 3 + 2] = bx * Math.sin(barAngle) + bz * Math.cos(barAngle);
      const warm = new THREE.Color().setHSL(0.09 + Math.random() * 0.03, 0.55, 0.62 + Math.random() * 0.2);
      barCol[i * 3] = warm.r; barCol[i * 3 + 1] = warm.g; barCol[i * 3 + 2] = warm.b;
    }
    const barGeo = new THREE.BufferGeometry();
    barGeo.setAttribute('position', new THREE.BufferAttribute(barPos, 3));
    barGeo.setAttribute('color', new THREE.BufferAttribute(barCol, 3));
    galaxyGroup.add(new THREE.Points(barGeo, new THREE.PointsMaterial({
      size: 16, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55,
      sizeAttenuation: true, map: makeCircleTex(), alphaTest: 0.005, depthWrite: false,
    })));

    // Sagittarius A*
    const sagAGeo = new THREE.SphereGeometry(30, 16, 16);
    const sagAMat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending });
    const sagA = new THREE.Mesh(sagAGeo, sagAMat);
    sagA.userData = { id: 'sagittarius-a', level: 2 };
    galaxyGroup.add(sagA);

    const sagADiv = document.createElement('div');
    sagADiv.textContent = 'Sagittarius A*';
    sagADiv.style.color = '#ffffff';
    sagADiv.style.fontFamily = '"Instrument Sans", sans-serif';
    sagADiv.style.fontSize = '12px';
    sagADiv.style.pointerEvents = 'auto';
    sagADiv.style.cursor = 'pointer';
    sagADiv.onclick = () => handleObjectClick('sagittarius-a', 2);
    const sagALabel = new CSS2DObject(sagADiv);
    sagALabel.position.set(0, 100, 0);
    sagA.add(sagALabel);
    galaxyLabels.push(sagALabel);

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
      { id: 'lagoon-nebula', name: 'Lagoon Nebula', pos: [-1500, -30, 3000], col: 0xaa44cc, s: 700 }
    ];

    nebulaeData.forEach(n => {
      const nc = new THREE.Color(n.col);
      const nMat = new THREE.SpriteMaterial({
        map: makeGlowTex(`${Math.round(nc.r * 255)},${Math.round(nc.g * 255)},${Math.round(nc.b * 255)}`, [[0, 0.8], [0.25, 0.45], [0.6, 0.1], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      });
      const nMesh = new THREE.Sprite(nMat);
      nMesh.scale.set(n.s * 1.6, n.s * 1.6, 1);
      nMesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
      nMesh.userData = { id: n.id, level: 2 };
      galaxyGroup.add(nMesh);
      
      const nDiv = document.createElement('div');
      nDiv.textContent = n.name;
      nDiv.style.color = '#ffffff';
      nDiv.style.fontFamily = '"Instrument Sans", sans-serif';
      nDiv.style.fontSize = '12px';
      nDiv.style.pointerEvents = 'auto';
      nDiv.style.cursor = 'pointer';
      nDiv.onclick = () => handleObjectClick(n.id, 2);
      const nLabel = new CSS2DObject(nDiv);
      nLabel.position.set(n.pos[0], n.pos[1] + n.s * 0.7, n.pos[2]);
      galaxyGroup.add(nLabel);
      galaxyLabels.push(nLabel);
    });

    // You Are Here
    const youAreHereGeo = new THREE.CircleGeometry(50, 32);
    const youAreHereMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const youAreHere = new THREE.Mesh(youAreHereGeo, youAreHereMat);
    youAreHere.position.set(-4500, 0, 1500);
    youAreHere.lookAt(0, 100000, 0);
    galaxyGroup.add(youAreHere);

    const yahDiv = document.createElement('div');
    yahDiv.textContent = 'You are here';
    yahDiv.style.color = '#A9C3E0';
    yahDiv.style.fontFamily = '"Instrument Sans", sans-serif';
    yahDiv.style.fontSize = '12px';
    const yahLabel = new CSS2DObject(yahDiv);
    yahLabel.position.set(0, 100, 0);
    youAreHere.add(yahLabel);
    galaxyLabels.push(yahLabel);

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
      const cc = new THREE.Color(c.col);
      const cMesh = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex(`${Math.round(cc.r * 255)},${Math.round(cc.g * 255)},${Math.round(cc.b * 255)}`, [[0, 0.9], [0.2, 0.5], [0.55, 0.1], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      cMesh.scale.set(c.r * 3, c.r * 3, 1);
      cMesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
      cMesh.userData = { id: c.id, level: 2 };
      galaxyGroup.add(cMesh);

      const cDiv = document.createElement('div');
      cDiv.textContent = c.name;
      cDiv.style.color = '#ffffff';
      cDiv.style.fontFamily = '"Instrument Sans", sans-serif';
      cDiv.style.fontSize = '12px';
      cDiv.style.pointerEvents = 'auto';
      cDiv.style.cursor = 'pointer';
      cDiv.onclick = () => handleObjectClick(c.id, 2);
      const cLabel = new CSS2DObject(cDiv);
      cLabel.position.set(c.pos[0], c.pos[1] + c.r + 50, c.pos[2]);
      galaxyGroup.add(cLabel);
      galaxyLabels.push(cLabel);
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

      // The neighbourhood is drawn from real data below, so the illustrative cloud stays outside it.
      const dc = pos.length();
      if (dc < LOCAL_VOLUME_R * 1.15) continue;

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
        info: 'One of the largest known voids, about 330 million light years across. Only about 60 galaxies have been found inside it, where around 2,000 would be expected.',
      },
      {
        id: 'local-void', name: 'Local Void', pos: [-20000, -3000, 30000] as [number,number,number], radius: 18000,
        info: 'The void at whose edge our Local Group sits, spanning roughly 150 million light years.',
      },
      {
        id: 'eridanus-void', name: 'Eridanus Supervoid', pos: [-100000, -8000, 80000] as [number,number,number], radius: 52000,
        info: 'One of the largest known voids, possibly up to 1.8 billion light years across. Linked to the CMB Cold Spot.',
      },
      {
        id: 'sculptor-void', name: 'Sculptor Void', pos: [50000, 4000, 90000] as [number,number,number], radius: 22000,
        info: 'A large, nearly empty region in the direction of the constellation Sculptor.',
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
        ? 'color:rgba(169,195,224,0.75);font-size:12px;font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);'
        : 'color:rgba(169,195,224,0.5);font-size:10px;font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.05em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);';
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
      // Sized to match the real neighbourhood around it: about 100,000 light years across.
      { id: 'milky-way-u', name: 'You are here', pos: [0, 0, 0] as [number,number,number], col: 0xffd54f, s: 700, labelOffset: [0, 1500, 0] as [number,number,number], tier: 1 },
      { id: 'andromeda-u', name: 'Andromeda', pos: ANDROMEDA_U.toArray() as [number,number,number], col: 0x4fc3f7, s: 800, labelOffset: [0, -1300, 0] as [number,number,number], tier: 2 },
      { id: 'virgo-cluster', name: 'Virgo Cluster', pos: (() => { const f = FAR_LANDMARKS['virgo-cluster']; return galacticToScene(f.l, f.b, f.mly).toArray() as [number,number,number]; })(), col: 0xffffff, s: 2200, labelOffset: [2000, 0, 0] as [number,number,number], tier: 2 },
      { id: 'coma-cluster', name: 'Coma Cluster', pos: (() => { const f = FAR_LANDMARKS['coma-cluster']; return galacticToScene(f.l, f.b, f.mly).toArray() as [number,number,number]; })(), col: 0xffcc88, s: 2800, labelOffset: [0, 2000, 0] as [number,number,number], tier: 2 },
      { id: 'perseus-cluster', name: 'Perseus Cluster', pos: (() => { const f = FAR_LANDMARKS['perseus-cluster']; return galacticToScene(f.l, f.b, f.mly).toArray() as [number,number,number]; })(), col: 0xffffff, s: 2400, labelOffset: [-2000, 0, 0] as [number,number,number], tier: 2 },
      { id: 'great-attractor', name: 'Great Attractor', pos: (() => { const f = FAR_LANDMARKS['great-attractor']; return galacticToScene(f.l, f.b, f.mly).toArray() as [number,number,number]; })(), col: 0x9c27b0, s: 3200, labelOffset: [0, -2000, 0] as [number,number,number], tier: 2 },
    ];

    universeLandmarkMeshesRef.current = [];
    // Names in the universe view, in order of importance; ones that would overlap a more important one wait.
    const lvLabels: { obj: CSS2DObject; el: HTMLElement; w: number }[] = [];
    LANDMARKS.forEach(u => {
      const uGeo = new THREE.SphereGeometry(u.s, 16, 16);
      // Invisible sphere to click on; what you see is the glow or spiral added below.
      const uMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const uMesh = new THREE.Mesh(uGeo, uMat);
      uMesh.position.set(...u.pos);
      uMesh.userData = { id: u.id, level: 3, type: 'landmark' };
      labelGroup.add(uMesh);
      universeLandmarkMeshesRef.current.push(uMesh);

      if (u.id === 'andromeda-u') {
        // Andromeda is a large spiral seen almost edge on, so it appears as a long oval.
        const spiral = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeSpiralTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, rotation: 0.6,
        }));
        spiral.scale.set(u.s * 6, u.s * 1.9, 1);
        spiral.position.copy(uMesh.position);
        labelGroup.add(spiral);
      } else if (u.id === 'milky-way-u') {
        // From this far out our galaxy is one small spiral, a little smaller than Andromeda.
        const mw = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeSpiralTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
          opacity: 0.85, color: 0xffe9c8, rotation: 0.4,
        }));
        mw.scale.set(u.s * 3.4, u.s * 3.4, 1);
        mw.position.copy(uMesh.position);
        labelGroup.add(mw);
      } else {
        const uc = new THREE.Color(u.col);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTex(`${Math.round(uc.r * 255)},${Math.round(uc.g * 255)},${Math.round(uc.b * 255)}`, [[0, 0.55], [0.2, 0.25], [0.55, 0.05], [1, 0]]),
          blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
        }));
        glow.scale.set(u.s * 4, u.s * 4, 1);
        glow.position.copy(uMesh.position);
        labelGroup.add(glow);
      }

      const tierCss: Record<number, string> = {
        1: 'color:#F3DDB0;font-size:14px;font-weight:700;',
        2: 'color:rgba(255,255,255,0.85);font-size:12px;font-weight:400;',
        3: 'color:rgba(255,255,255,0.55);font-size:10px;font-weight:400;',
      };
      const uDiv = document.createElement('div');
      uDiv.textContent = u.name;
      uDiv.style.cssText = `${tierCss[u.tier] ?? tierCss[2]}font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;letter-spacing:0.04em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);`;
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
      lvLabels.push({ obj: uLabel, el: uDiv, w: 0 });
    });

    // Step 6: Our real neighbourhood. Every galaxy within about 40 million light years that the
    // Local Volume Database lists, at its measured direction and distance.
    {
      const nD = DWARF_GALAXIES.length / 3;
      const dPos = new Float32Array(nD * 3);
      for (let i = 0; i < nD; i++) {
        const v = galacticToScene(DWARF_GALAXIES[i * 3], DWARF_GALAXIES[i * 3 + 1], DWARF_GALAXIES[i * 3 + 2]);
        dPos.set([v.x, v.y, v.z], i * 3);
      }
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
      universeGroup.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
        map: makeCircleTex(), size: isMobile ? 320 : 200, sizeAttenuation: true, color: 0xcfd9e8,
        transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, alphaTest: 0.005,
      })));

      BIG_GALAXIES.forEach(g => {
        if (g.id === 'm31') return; // Andromeda is drawn as a landmark above
        const pos = galacticToScene(g.l, g.b, g.mly);
        const bright = Math.min(1, Math.max(0, (-(g.mv ?? -19) - 16) / 6));
        const size = 450 + 1200 * bright;
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTex(bright > 0.6 ? '255,236,205' : '220,230,245', [[0, 1], [0.15, 0.55], [0.45, 0.12], [1, 0]]),
          blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
        }));
        glow.scale.set(size * 2, size * 2, 1);
        glow.position.copy(pos);
        universeGroup.add(glow);
        const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(700, size), 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hit.position.copy(pos);
        hit.userData = { id: `lv:${g.id}`, level: 3, type: 'nearby' };
        labelGroup.add(hit);
        universeLandmarkMeshesRef.current.push(hit);
        const gDiv = document.createElement('div');
        gDiv.textContent = g.name;
        gDiv.style.cssText = `color:rgba(232,236,241,${bright > 0.6 ? 0.85 : 0.62});font-size:${bright > 0.6 ? 12 : 11}px;font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);`;
        gDiv.onclick = (e) => {
          e.stopPropagation();
          if (clickGuardRef.current || transitioningRef.current || zoomLevelRef.current !== 3) return;
          handleObjectClick(`lv:${g.id}`, 3);
        };
        const gLabel = new CSS2DObject(gDiv);
        gLabel.position.set(0, -size * 0.9, 0);
        hit.add(gLabel);
        lvLabels.push({ obj: gLabel, el: gDiv, w: 0 });
      });

      // The edge of the real data, so it is clear what is measured and what is illustration.
      const ringPts: THREE.Vector3[] = [];
      for (let k = 0; k <= 160; k++) {
        const a = (k / 160) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * LOCAL_VOLUME_R, 0, Math.sin(a) * LOCAL_VOLUME_R));
      }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial({ color: 0xa9c3e0, transparent: true, opacity: 0.22, depthWrite: false }));
      universeGroup.add(ring);
      const rDiv = document.createElement('div');
      rDiv.textContent = 'Inside this ring, every galaxy is real';
      rDiv.style.cssText = 'color:rgba(169,195,224,0.8);font-size:11px;font-family:"Instrument Sans",sans-serif;white-space:nowrap;letter-spacing:0.03em;text-shadow:0 1px 4px rgba(0,0,0,0.8);';
      const rLabel = new CSS2DObject(rDiv);
      rLabel.position.set(0, 0, LOCAL_VOLUME_R);
      labelGroup.add(rLabel);
      lvLabels.push({ obj: rLabel, el: rDiv, w: 0 });
    }

    // Step 7: the weekly pictures, each where it really is. They keep the same size on screen at
    // any distance, and the newest one pulses gently so it can be found.
    const pinMarks: { glow: THREE.Sprite; ring: THREE.Sprite | null; hit: THREE.Mesh }[] = [];
    PINS.forEach(p => {
      const { ra, dec } = pinRaDec(p);
      const pos = pinScene(ra, dec, p.mly);
      const isNew = p.id === LATEST_PIN.id;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex('243,221,176', [[0, 1], [0.16, 0.8], [0.4, 0.2], [1, 0]]),
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true,
      }));
      glow.position.copy(pos);
      universeGroup.add(glow);
      let ring: THREE.Sprite | null = null;
      if (isNew) {
        ring = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTex('243,221,176', [[0, 0], [0.62, 0], [0.74, 0.7], [0.86, 0], [1, 0]]),
          blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true,
        }));
        ring.position.copy(pos);
        universeGroup.add(ring);
      }
      const hit = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      hit.position.copy(pos);
      hit.userData = { id: `pin:${p.id}`, level: 3, type: 'pin' };
      labelGroup.add(hit);
      universeLandmarkMeshesRef.current.push(hit);
      const pDiv = document.createElement('div');
      pDiv.textContent = isNew && isThisWeek(p) ? `New: ${p.object}` : p.object;
      pDiv.style.cssText = `color:#F3DDB0;font-size:12px;font-family:"Instrument Sans",sans-serif;pointer-events:auto;cursor:pointer;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.9);`;
      pDiv.onclick = (e) => {
        e.stopPropagation();
        if (clickGuardRef.current || transitioningRef.current || zoomLevelRef.current !== 3) return;
        handleObjectClick(`pin:${p.id}`, 3);
      };
      const pLabel = new CSS2DObject(pDiv);
      const holder = new THREE.Object3D();
      holder.position.copy(pos);
      holder.add(pLabel);
      labelGroup.add(holder);
      pLabel.element.style.marginTop = '0px';
      // The weekly pictures come first when names would overlap.
      lvLabels.unshift({ obj: pLabel, el: pDiv, w: 0 });
      pinMarks.push({ glow, ring, hit });
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
        if (showCometsRef.current) interactables.push(...Object.values(cometMeshesRef.current).map(c => c.mesh));
        interactables.push(...Object.values(spacecraftRef.current).map(sc => sc.marker).filter(m => m.visible));
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
    
    // Earth's axis is tilted 23.44 degrees, with the north pole leaning towards where the Sun
    // appears at the June solstice.
    const Y_AXIS = new THREE.Vector3(0, 1, 0);
    const EARTH_TILT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -23.44 * Math.PI / 180);
    const earthSpinQ = new THREE.Quaternion();
    const earthWorldQ = new THREE.Quaternion();
    let earthSpinAngle = 0;
    const labelPos = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      totalElapsed += dt / 1000;

      // ── Real sky follows the camera; the generated field is used further out ──
      const inSolarSystem = zoomLevelRef.current === 1;
      realSky.visible = inSolarSystem && realSkyReady;
      realSky.position.copy(camera.position);
      // The generated field is only a fallback while the real sky loads. It sits around the Sun, so from
      // the galaxy or universe views it would show up as a false bright ball at the centre.
      bgStars.visible = inSolarSystem && !realSkyReady;
      galaxyLabels.forEach(l => { l.visible = zoomLevelRef.current === 2; });
      starMat.opacity = zoomLevelRef.current === 3 ? 0.3 : 0.85;

      // Keep labels from sitting on top of each other: if a label would overlap one already
      // placed, nudge it up or down until it is clear.
      if (inSolarSystem) {
        const hw = renderer.domElement.clientWidth / 2;
        const hh = renderer.domElement.clientHeight / 2;
        const placed: [number, number, number, number][] = [];
        for (const slot of labelSlots) {
          let shown = slot.obj.visible;
          for (let o = slot.obj.parent; o && shown; o = o.parent) shown = o.visible;
          if (!shown) continue;
          slot.obj.getWorldPosition(labelPos).project(camera);
          if (labelPos.z > 1) continue;
          const x = labelPos.x * hw + hw;
          const y = -labelPos.y * hh + hh;
          if (!slot.w) slot.w = slot.el.offsetWidth;
          const half = (slot.w || 60) / 2 + 2;
          let chosen = 0;
          for (const off of [0, -14, 14, -28, 28, -42, 42]) {
            const clear = !placed.some(b => x - half < b[2] && x + half > b[0] && y + off - 7 < b[3] && y + off + 7 > b[1]);
            if (clear) { chosen = off; break; }
          }
          const mt = `${chosen}px`;
          if (slot.el.style.marginTop !== mt) slot.el.style.marginTop = mt;
          placed.push([x - half, y + chosen - 7, x + half, y + chosen + 7]);
        }
      }
      // Real galaxy names in the universe view: the nearest and brightest first, others hidden if they would overlap.
      if (zoomLevelRef.current === 3 && universeGroupRef.current?.visible) {
        const pulse = (totalElapsed * 0.6) % 1;
        for (const m of pinMarks) {
          const d = camera.position.distanceTo(m.glow.position);
          m.glow.scale.setScalar(d * 0.04);
          m.hit.scale.setScalar(d * 0.03);
          if (m.ring) {
            m.ring.scale.setScalar(d * (0.045 + 0.09 * pulse));
            (m.ring.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - pulse);
          }
        }
        const hw3 = renderer.domElement.clientWidth / 2;
        const hh3 = renderer.domElement.clientHeight / 2;
        const placed3: [number, number, number, number][] = [];
        for (const slot of lvLabels) {
          slot.obj.getWorldPosition(labelPos).project(camera);
          if (labelPos.z > 1) { slot.obj.visible = false; continue; }
          const x = labelPos.x * hw3 + hw3;
          const y = -labelPos.y * hh3 + hh3;
          if (!slot.w) slot.w = slot.el.offsetWidth || 80;
          const half = slot.w / 2 + 3;
          const clash = placed3.some(b => x - half < b[2] && x + half > b[0] && y - 8 < b[3] && y + 8 > b[1]);
          slot.obj.visible = !clash;
          if (!clash) placed3.push([x - half, y - 8, x + half, y + 8]);
        }
      }
      // The detailed Milky Way is far too big to sit among other galaxies, so once we are out past it
      // the small spiral landmark takes its place.
      if (galaxyGroupRef.current && zoomLevelRef.current === 3) {
        // Our neighbourhood is drawn from real data at this scale, where the Milky Way is only a
        // small spiral, so the detailed model of it stays hidden.
        galaxyGroupRef.current.visible = false;
      }

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
        
        // One shared clock keeps every planet in its real place. Hovering a planet slows the
        // clock so it is easy to click, except in Live mode, which always runs at real time.
        const isLive = rateRef.current === 0;
        const hoverFactor = isLive ? 1 : Math.min(1, ...planets.map(p => planetSpeedFactorsRef.current[p.id] ?? 1));
        const daysPerSecond = TIME_RATES[rateRef.current].daysPerSecond;
        // Cap each step so time does not leap ahead after the tab has been in the background.
        const stepMs = isLive ? dt : Math.min(dt, 100);
        simTimeRef.current += stepMs * daysPerSecond * 86400 * hoverFactor;
        if (simTimeRef.current > EPHEMERIS_MAX || simTimeRef.current < EPHEMERIS_MIN) {
          simTimeRef.current = Date.now();
        }
        time += 0.01 * speedRef.current * hoverFactor;

        planets.forEach(p => {
          const { pivot, mesh } = planetMeshesRef.current[p.id];
          const pos = heliocentric(p.id, simTimeRef.current);
          if (pos) pivot.rotation.y = pos.lon;
          if (p.id === 'earth') {
            // Earth turns to its real angle for this moment, with its axis fixed in space, so the
            // side facing the Sun is the side where it is daytime. At a week per second or faster
            // the real spin would flicker, so it turns smoothly instead until time slows down.
            if (daysPerSecond <= 1) {
              const jd = simTimeRef.current / 86400000 + 2440587.5;
              earthSpinAngle = ((280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360) * Math.PI / 180;
            } else {
              earthSpinAngle += (Math.PI * 2 * stepMs / 1000) * hoverFactor;
            }
            earthSpinQ.setFromAxisAngle(Y_AXIS, earthSpinAngle);
            earthWorldQ.copy(EARTH_TILT).multiply(earthSpinQ);
            mesh.quaternion.copy(pivot.quaternion).invert().multiply(earthWorldQ);
          } else {
            mesh.rotation.y += 0.01 * hoverFactor;
          }
          mesh.children.forEach(ch => { if (ch.userData.spin) ch.rotation.y += 0.01 * hoverFactor * (ch.userData.spin - 1); });

          if (p.id === 'earth' && moonMeshRef.current) {
            // The Moon's angle from the Sun follows its phase, so a full Moon sits opposite the Sun.
            const ph = moonPhase(simTimeRef.current);
            const moonLon = (sunLongitude(simTimeRef.current) + ph.fraction * 360) * Math.PI / 180;
            const a = moonLon - pivot.rotation.y;
            const d = p.radiusScale * 2.6;
            moonMeshRef.current.position.set(p.orbitRadius + Math.cos(a) * d, 0, -Math.sin(a) * d);
          }
        });
        
        asteroidMesh.rotation.y += 0.0005 * speedRef.current;

        // Comets and spacecraft at their real positions for the date shown
        const showC = showCometsRef.current;
        if (cometOrbitGroupRef.current) {
          cometOrbitGroupRef.current.visible = showC;
          cometOrbitGroupRef.current.children.forEach(o => { o.visible = o.userData.cometId === selectedObjectRef.current; });
        }
        COMETS.forEach(c => {
          const entry = cometMeshesRef.current[c.id];
          if (!entry) return;
          const { mesh, tail } = entry;
          mesh.visible = showC;
          if (!showC) { tail.visible = false; return; }

          const pos = cometPosition(c, simTimeRef.current);
          const q = toScene(pos);
          mesh.position.set(q.x, q.y, q.z);

          // Tails form inside about 5 au, growing as the comet nears the Sun, and point away from it.
          const tailLength = pos.r < 5 ? Math.min(10, (5 - pos.r) * 2.5) : 0;
          tail.visible = tailLength > 0;
          if (tailLength > 0) {
            const dir = mesh.position.clone().normalize();
            const tp = tail.geometry.attributes.position.array as Float32Array;
            tp[0] = q.x; tp[1] = q.y; tp[2] = q.z;
            tp[3] = q.x + dir.x * tailLength; tp[4] = q.y + dir.y * tailLength; tp[5] = q.z + dir.z * tailLength;
            tail.geometry.attributes.position.needsUpdate = true;
          }
        });

        SPACECRAFT.forEach(sc => {
          const entry = spacecraftRef.current[sc.id];
          if (!entry) return;
          const pos = spacecraftPosition(sc, simTimeRef.current);
          entry.marker.visible = !!pos;
          entry.trail.visible = !!pos && pos.r > 30.07;
          if (!pos) return;
          const q = toScene(pos);
          entry.marker.position.set(q.x, q.y, q.z);
          const start = toScene({ x: sc.dir.x * 30.07, y: sc.dir.y * 30.07, z: sc.dir.z * 30.07 });
          const tp = entry.trail.geometry.attributes.position.array as Float32Array;
          tp[0] = start.x; tp[1] = start.y; tp[2] = start.z;
          tp[3] = q.x; tp[4] = q.y; tp[5] = q.z;
          entry.trail.geometry.attributes.position.needsUpdate = true;
        });
      }

      if (noteMark && zoomLevelRef.current === 1) {
        const { core, halo, tail, anchor, note, dest } = noteMark;
        const nowMs = Date.now();
        const P = notePosition(note, dest, nowMs);
        const q = toScene(P);
        core.position.set(q.x, q.y, q.z);
        halo.position.copy(core.position);
        anchor.position.copy(core.position);
        // The same size on screen however far in or out the view is.
        const camDist = camera.position.distanceTo(core.position);
        core.scale.setScalar(camDist * 0.045);
        const pulse = (totalElapsed * 0.6) % 1;
        halo.scale.setScalar(camDist * (0.05 + 0.1 * pulse));
        (halo.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - pulse);
        // The tail: the last stretch of its path, which shows the way it is heading.
        const R = kmTravelled(note.sentAt, nowMs) / AU_KM;
        const E = notePosition(note, dest, note.sentAt);
        const dir = directionOf(dest);
        const ta = tail.geometry.attributes.position.array as Float32Array;
        const nT = ta.length / 3;
        for (let k = 0; k < nT; k++) {
          const r = R * (0.45 + 0.55 * (k / (nT - 1)));
          const w = toScene({ x: E.x + dir.x * r, y: E.y + dir.y * r, z: E.z + dir.z * r });
          ta[k * 3] = w.x; ta[k * 3 + 1] = w.y; ta[k * 3 + 2] = w.z;
        }
        tail.geometry.attributes.position.needsUpdate = true;
        tail.geometry.computeBoundingSphere();
        if (nowMs - noteMark.lastText > 500) {
          noteMark.lastText = nowMs;
          noteMark.dist.textContent = `${bigKm(kmTravelled(note.sentAt, nowMs))} from Earth`;
        }
        // Off screen, or hidden under the controls at the bottom: show the chip at the edge instead.
        const pr = core.position.clone().project(camera);
        const W = renderer.domElement.clientWidth, H = renderer.domElement.clientHeight;
        const behind = pr.z > 1;
        let sx = (pr.x + 1) / 2 * W, sy = (1 - pr.y) / 2 * H;
        const safeBottom = H - 150;
        const inView = !behind && sx > 24 && sx < W - 24 && sy > 70 && sy < safeBottom;
        if (inView) {
          if (noteMark.chip.style.display !== 'none') noteMark.chip.style.display = 'none';
        } else {
          let dx = sx - W / 2, dy = sy - H / 2;
          if (behind) { dx = -dx; dy = -dy; }
          const ang = Math.atan2(dy, dx);
          const kx = (W / 2 - 70) / Math.max(1e-6, Math.abs(Math.cos(ang)));
          const ky = ((dy > 0 ? safeBottom - H / 2 : H / 2 - 90)) / Math.max(1e-6, Math.abs(Math.sin(ang)));
          const k = Math.min(kx, ky);
          sx = W / 2 + Math.cos(ang) * k;
          sy = H / 2 + Math.sin(ang) * k;
          noteMark.chip.style.display = 'flex';
          noteMark.chip.style.left = `${sx}px`;
          noteMark.chip.style.top = `${sy}px`;
          noteMark.arrow.style.transform = `rotate(${ang}rad)`;
        }
      } else if (noteMark && noteMark.chip.style.display !== 'none') {
        noteMark.chip.style.display = 'none';
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

      // Only head back into the Milky Way when centred on home, not while looking at another galaxy.
      if (zoomLevelRef.current === 3 && dist < 50000 && controls.target.length() < 1500 && !transitioningRef.current) {
        thresholdCounterRef.current['3to2']++;
        if (thresholdCounterRef.current['3to2'] >= THRESHOLD_FRAMES) {
          thresholdCounterRef.current['3to2'] = 0;
          triggerTransition(2);
        }
      } else { thresholdCounterRef.current['3to2'] = 0; }

      // Camera transitions
      if (transitioningRef.current && cameraTargetRef.current && lookAtTargetRef.current) {
        // The same speed of flight however fast or slow the device draws frames.
        const ease = 1 - Math.pow(0.95, Math.min(dt, 100) / 16.67);
        camera.position.lerp(cameraTargetRef.current, ease);
        controls.target.lerp(lookAtTargetRef.current, ease);

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

      controls.autoRotate = driftRef.current && zoomLevelRef.current === 1 && !transitioningRef.current;
      controls.update(Math.min(dt, 100) / 1000);
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
      
      noteChipRef.current?.remove();
      noteChipRef.current = null;
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
    setExploreToast(`Flying to ${dest.name}`);
    setTimeout(() => setExploreToast(null), 3000);
    
    triggerTransition(dest.level);
    
    // Give transition time to start then move camera
    setTimeout(() => {
      const planetMesh = dest.planetId ? planetMeshesRef.current[dest.planetId]?.mesh : undefined;
      if (planetMesh && dest.offset) {
        // Planets move, so aim at where this one actually is right now.
        const pos = new THREE.Vector3();
        planetMesh.getWorldPosition(pos);
        const dir = pos.clone().setY(0).normalize();
        const side = new THREE.Vector3(-dir.z, 0, dir.x);
        const [, up, back] = dest.offset;
        cameraTargetRef.current = pos.clone().addScaledVector(dir, back * 0.6).addScaledVector(side, back * 0.8).add(new THREE.Vector3(0, up, 0));
        lookAtTargetRef.current = pos;
      } else {
        cameraTargetRef.current = new THREE.Vector3(...dest.cameraPos);
        lookAtTargetRef.current = new THREE.Vector3(...dest.target);
      }
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
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ ["--dock-h" as string]: `${dockH}px` }}>
      <style>{`
        .pale-dock { bottom: calc(3.75rem + env(safe-area-inset-bottom)); }
        .pale-above-dock { bottom: calc(3.75rem + env(safe-area-inset-bottom) + var(--dock-h) + 0.75rem); }
        @media (min-width: 768px) {
          .pale-dock { bottom: 1.5rem; }
          .pale-above-dock { bottom: calc(1.5rem + var(--dock-h) + 0.75rem); }
        }
        @media (min-width: 1024px) { .pale-lg-free { bottom: var(--lg-bottom); } }
      `}</style>
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <div ref={labelMountRef} className="absolute inset-0 z-10 pointer-events-none" />

      {!screenshotMode && (
        <p className={`absolute right-4 pale-above-dock pale-lg-free z-20 m-0 text-[11px] pointer-events-none ${zoomLevel === 3 ? "max-md:hidden" : ""}`} style={{ color: "rgba(245,250,255,0.45)", ["--lg-bottom" as string]: "1rem" }}>
          Sizes and distances are not to scale
        </p>
      )}
      
      {paleBlueDot && <PaleBlueDotSequence onComplete={() => setPaleBlueDot(false)} />}
      {lookBack && <VoyagerLookBack onClose={() => setLookBack(false)} />}
      
      {exploreToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-[14px] animate-in fade-in duration-300" style={{ background: "#0A0F17", border: "1px solid #1C2533", color: "#E8ECF1" }}>
          {exploreToast}
        </div>
      )}

      {screenshotMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button variant="outline" onClick={() => setScreenshotMode(false)} className="border-white/20" style={{ background: "#0A0F17" }}>
            Exit screenshot mode
          </Button>
        </div>
      )}

      {showUniverseText && !screenshotMode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-1000 bg-black/50">
          <h1 className="text-4xl md:text-6xl text-white text-center px-6">
            The observable universe<br/><span className="block mt-3 font-sans text-lg md:text-xl text-white/60">93 billion light years across, with hundreds of billions of galaxies</span>
          </h1>
        </div>
      )}

      {/* Universe Level HUD */}
      {zoomLevel === 3 && !screenshotMode && (
        <>
          {/* Bottom-centre rotating facts */}
          <div
            className="absolute pale-above-dock left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none max-w-sm hidden md:block"
            key={universeFact}
            style={{ animation: "fadeIn 1s ease-out" }}
          >
            <p className="font-serif text-[15px] leading-snug" style={{ color: "rgba(232,236,241,0.6)" }}>
              {UNIVERSE_FACTS[universeFact]}
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
            style={{ background: "rgba(6,6,20,0.98)", border: "1px solid rgba(169,195,224,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Instrument Sans', sans-serif", }}>
              KEYBOARD SHORTCUTS
            </h2>
            <div className="space-y-2">
              {[
                ["P", "Pause / Resume"],
                ["F", "Toggle Fullscreen"],
                ["R", "Reset Camera"],
                ["O", "Night vision"],
                ["0", "Focus the Sun"],
                ["1 to 8", "Focus planet by order"],
                ["ESC", "Close panels"],
                ["?", "This overlay"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</span>
                  <kbd
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(169,195,224,0.1)",
                      border: "1px solid rgba(169,195,224,0.25)",
                      color: "#A9C3E0",
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
            className="absolute pale-above-dock pale-lg-free right-4 pointer-events-auto"
            style={{
              ["--lg-bottom" as string]: "2.5rem",
              background: "rgba(40,0,0,0.7)",
              border: "1px solid rgba(180,0,0,0.3)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#ff6060",
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: "13px",
            }}
          >
            <div style={{ fontSize: "11px", opacity: 0.6, marginBottom: 4 }}>Night vision</div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>Red light on to protect your dark adapted eyes</div>
            <div style={{ fontSize: "11px", opacity: 0.5, marginTop: 2 }}>Eyes adapting: {darkSkyMinutes}m</div>
          </div>
        </div>
      )}

      {/* Top Right Controls — unified panel, always on top */}
      {!screenshotMode && (
        <div
          className="absolute top-[68px] right-3 z-[100] flex flex-col md:top-20 md:right-4"
          style={{
            background: "#0A0F17",
            border: "1px solid #1C2533",
            borderRadius: "10px",
            padding: "8px",
            minWidth: "160px",
            pointerEvents: "all",
          }}
        >
          {/* Universe-only toggles — shown only at level 3 */}
          {zoomLevel === 3 && (
            <>
              {[
                { label: "Labels", state: showUniverseLabels, set: setShowUniverseLabels },
                { label: "Cosmic web", state: showUniverseFilaments, set: setShowUniverseFilaments },
                { label: "Voids", state: showUniverseVoids, set: setShowUniverseVoids },
              ].map(({ label, state, set }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); set((v: boolean) => !v); }}
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    background: state ? "rgba(169,195,224,0.12)" : "transparent",
                    color: state ? "#A9C3E0" : "rgba(255,255,255,0.5)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "13px",
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
              <div style={{ height: 1, background: "rgba(169,195,224,0.15)", margin: "4px 2px 6px" }} />
            </>
          )}

          {/* Pale Blue Dot */}
          <button
            onClick={(e) => { e.stopPropagation(); setPaleBlueDot(true); }}
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              background: "rgba(243,221,176,0.06)",
              color: "#F3DDB0",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
              marginBottom: "2px",
            }}
          >
            Pale Blue Dot
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
              fontFamily: "'Instrument Sans', sans-serif",
              background: isObservatory ? "rgba(220,38,38,0.15)" : "transparent",
              color: isObservatory ? "#f87171" : "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
              marginBottom: "2px",
            }}
          >
            {isObservatory ? "Night vision off" : "Night vision"}
          </button>

          {isObservatory && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsTelescopeMode(t => !t); }}
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                background: isTelescopeMode ? "rgba(251,146,60,0.15)" : "transparent",
                color: isTelescopeMode ? "#fb923c" : "rgba(255,200,150,0.6)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left" as const,
                width: "100%",
                letterSpacing: "0.03em",
                marginBottom: "2px",
              }}
            >
              {isTelescopeMode ? "Leave eyepiece" : "Eyepiece view"}
            </button>
          )}

          {/* Screenshot */}
          <button
            onClick={(e) => { e.stopPropagation(); setScreenshotMode(true); }}
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left" as const,
              width: "100%",
              letterSpacing: "0.03em",
            }}
          >
            Hide controls
          </button>
        </div>
      )}

      {/* Where you are: the three views, the current one bright. Each one can be clicked. */}
      {!screenshotMode && (
        <nav aria-label="Views" className="absolute pale-above-dock pale-lg-free left-6 z-20 flex flex-col gap-1 text-[13px]" style={{ ["--lg-bottom" as string]: "1.5rem" }}>
          {[
            { level: 1, name: "Solar system" },
            { level: 2, name: "Milky Way" },
            { level: 3, name: "Universe" },
          ].map(v => (
            <button
              key={v.level}
              onClick={(e) => { if (v.level !== zoomLevel) safeTransition(v.level, e); }}
              aria-current={v.level === zoomLevel ? "true" : undefined}
              className="text-left transition-colors"
              style={{ color: v.level === zoomLevel ? "#E8ECF1" : "rgba(232,236,241,0.38)", pointerEvents: "auto" }}
            >
              {v.name}
            </button>
          ))}
        </nav>
      )}
      
      {/* Controls Overlay */}
      {!screenshotMode && (
        <Card ref={dockRef} className="absolute pale-dock left-1/2 -translate-x-1/2 w-[95%] max-w-3xl rounded-xl p-3.5 z-20 shadow-none flex flex-col gap-4" style={{ background: "#0A0F17", border: "1px solid #1C2533" }}>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="min-w-[9.5rem]" aria-live="polite">
                    <div className="text-sm font-semibold text-white tabular-nums">
                      {new Date(simTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {rateIndex <= 1 && (
                        <span className="ml-1.5 font-normal text-white/60">
                          {new Date(simTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50">
                      {rateIndex === 0
                        ? (Math.abs(simTime - Date.now()) < 3600000 ? 'Right now, at real speed' : 'Real positions on this date')
                        : 'Real positions on this date'}
                    </div>
                  </div>
                  <label className="sr-only" htmlFor="time-rate">Speed of time</label>
                  <select
                    id="time-rate"
                    value={rateIndex}
                    onChange={(e) => setRateIndex(Number(e.target.value))}
                    className="h-8 rounded-md bg-black/50 border border-white/15 px-2 text-xs text-white"
                  >
                    {TIME_RATES.map((r, i) => (
                      <option key={r.label} value={i}>{r.label}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={jumpToNow}>
                    Now
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-white flex items-center gap-1 cursor-pointer hover:text-[#A9C3E0] transition-colors">
                  <input type="checkbox" checked={showComets} onChange={(e) => setShowComets(e.target.checked)} className="rounded bg-black/50 border-white/20" /> Comets
                </label>
                <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                  Fly somewhere
                </Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(2, e)}>Out to the galaxy</Button>
              </div>
            </div>
          )}

          {zoomLevel === 2 && (
            <div className="flex items-center justify-between w-full gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEdgeOn(!isEdgeOn)}>
                  {isEdgeOn ? "Face on view" : "Edge on view"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                  Fly somewhere
                </Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(1, e)}>In to the solar system</Button>
                <Button variant="secondary" size="sm" onClick={(e) => safeTransition(3, e)}>Out to the universe</Button>
              </div>
            </div>
          )}

          {zoomLevel === 3 && (
            <div className="flex items-center justify-between w-full gap-2">
              <Button variant="secondary" size="sm" onClick={handleRandomExplore} className="gap-2">
                Fly somewhere
              </Button>
              <Button variant="secondary" size="sm" onClick={(e) => safeTransition(2, e)}>In to the Milky Way</Button>
            </div>
          )}

        </div>
      </Card>
      )}

      {/* Universe zoom controls */}
      {!screenshotMode && zoomLevel === 3 && (
        <div
          className="absolute z-40 flex flex-col gap-1.5 pale-above-dock"
          style={{ right: '1rem' }}
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
                border: '1px solid rgba(169,195,224,0.2)',
                borderRadius: 10,
                color: '#e0e0e0',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
                fontFamily: '"Instrument Sans", sans-serif',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(169,195,224,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(169,195,224,0.6)';
                (e.currentTarget as HTMLButtonElement).style.color = '#A9C3E0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,10,26,0.9)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(169,195,224,0.2)';
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
          <GalaxyInfoPanel
            objectId={selectedGalaxyObject}
            onClose={() => setSelectedGalaxyObject(null)}
            liveFacts={liveFactsFor(selectedGalaxyObject, simTime)}
            action={selectedGalaxyObject === 'voyager-1' ? { label: 'Look back at Earth', onClick: () => setLookBack(true) } : undefined}
          />
          <SagittariusPanel open={selectedSagittarius} onClose={() => setSelectedSagittarius(false)} />
          <NoteUniversePanel
            note={noteRef.current}
            open={noteOpen}
            onClose={() => setNoteOpen(false)}
            live={rateIndex === 0 && Math.abs(simTime - Date.now()) < 120000}
            onShowNow={() => { rateRef.current = 0; setRateIndex(0); jumpToNow(); }}
          />
          <UniverseInfoPanel objectId={selectedUniverseObject} onClose={() => setSelectedUniverseObject(null)} />
          <PinPanel
            pin={selectedUniverseObject?.startsWith('pin:') ? PINS.find(p => `pin:${p.id}` === selectedUniverseObject) ?? null : null}
            onClose={() => setSelectedUniverseObject(null)}
          />
          {/* The newest weekly picture, one tap away */}
          {!selectedUniverseObject?.startsWith('pin:') && (
            <button
              type="button"
              onClick={() => openPin(LATEST_PIN.id)}
              className="absolute left-4 top-[68px] md:top-[80px] z-30 flex items-center gap-2 rounded-full pl-2.5 pr-3.5 py-1.5 text-[13px] transition-colors hover:bg-white/[0.06]"
              style={{ background: 'rgba(10,15,23,0.82)', border: '1px solid rgba(243,221,176,0.35)', color: '#E8ECF1' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#F3DDB0', boxShadow: '0 0 8px 2px rgba(243,221,176,0.6)' }} />
              <span style={{ color: '#F3DDB0' }}>{isThisWeek(LATEST_PIN) ? 'New this week' : 'Latest'}</span>
              <span>{LATEST_PIN.object}</span>
            </button>
          )}
          <NearbyGalaxyPanel
            galaxy={selectedUniverseObject?.startsWith('lv:') ? BIG_GALAXIES.find(g => `lv:${g.id}` === selectedUniverseObject) ?? null : null}
            onClose={() => setSelectedUniverseObject(null)}
          />
        </>
      )}
    </div>
  );
}