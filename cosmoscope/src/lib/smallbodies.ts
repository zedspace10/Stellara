// Real positions for comets and the spacecraft leaving the solar system.
//
// Comets: osculating orbital elements from the JPL Small Body Database (J2000 ecliptic),
// solved with Kepler's equation. Good to a fraction of a degree for decades either side
// of each perihelion, which is far finer than the 3D view can show.
//
// Spacecraft: distance and direction from the Sun on 24 October 2026 (Heavens Above),
// moving outward in a straight line at their current speed. Since their last planetary
// flyby they travel almost exactly in a straight line, so this holds for many years.

const DEG = Math.PI / 180;
const DAY_MS = 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const GAUSS_K = 0.01720209895; // radians per day, the Sun's gravitational constant in these units
const AU_KM = 149597870.7;

function jdToMs(jd: number) {
  return (jd - 2451545.0) * DAY_MS + J2000_MS;
}

export interface Vec3 { x: number; y: number; z: number }

/** Heliocentric ecliptic position in au, plus the distance from the Sun. */
export interface BodyPosition extends Vec3 { r: number }

interface CometElements {
  q: number;     // perihelion distance, au
  e: number;     // eccentricity
  i: number;     // inclination, degrees
  node: number;  // longitude of ascending node, degrees
  peri: number;  // argument of perihelion, degrees
  tp: number;    // time of perihelion, ms
}

export interface Comet {
  id: string;
  name: string;
  color: number;
  el: CometElements;
}

export const COMETS: Comet[] = [
  {
    id: 'halley', name: "Halley's Comet", color: 0xcfe0ff,
    el: { q: 0.58597811, e: 0.96714291, i: 162.2626906, node: 58.42008098, peri: 111.3324851, tp: jdToMs(2446470.9535) },
  },
  {
    id: 'hale-bopp', name: 'Hale-Bopp', color: 0xb8d2ff,
    el: { q: 0.91412, e: 0.99509, i: 89.43, node: 282.47, peri: 130.59, tp: jdToMs(2450539.64) },
  },
  {
    id: 'neowise', name: 'NEOWISE', color: 0xffeedd,
    el: { q: 0.29461, e: 0.99918, i: 128.94, node: 61.01, peri: 37.28, tp: jdToMs(2459034.18) },
  },
];

function rotate(el: CometElements, px: number, py: number): Vec3 {
  const cO = Math.cos(el.node * DEG), sO = Math.sin(el.node * DEG);
  const cw = Math.cos(el.peri * DEG), sw = Math.sin(el.peri * DEG);
  const ci = Math.cos(el.i * DEG), si = Math.sin(el.i * DEG);
  return {
    x: (cw * cO - sw * sO * ci) * px + (-sw * cO - cw * sO * ci) * py,
    y: (cw * sO + sw * cO * ci) * px + (-sw * sO + cw * cO * ci) * py,
    z: (sw * si) * px + (cw * si) * py,
  };
}

export function cometPosition(c: Comet, timeMs: number): BodyPosition {
  const { q, e } = c.el;
  const a = q / (1 - e);
  const n = GAUSS_K / Math.pow(a, 1.5);
  let M = n * (timeMs - c.el.tp) / DAY_MS;
  M = ((M + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  // Kepler's equation, E minus e sin E equals M, by Newton's method from a starting guess
  // that converges even for orbits as stretched as these.
  let E = M + Math.sign(Math.sin(M)) * 0.85 * e;
  for (let k = 0; k < 60; k++) {
    const f = E - e * Math.sin(E) - M;
    const d = f / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  const px = a * (Math.cos(E) - e);
  const py = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const p = rotate(c.el, px, py);
  return { ...p, r: Math.hypot(p.x, p.y, p.z) };
}

/** Points around the whole orbit, closer together near the Sun where it curves most. */
export function cometOrbit(c: Comet, steps = 360): Vec3[] {
  const { q, e } = c.el;
  const p = q * (1 + e);
  const pts: Vec3[] = [];
  for (let k = 0; k <= steps; k++) {
    const nu = -Math.PI + (2 * Math.PI * k) / steps;
    const r = p / (1 + e * Math.cos(nu));
    pts.push(rotate(c.el, r * Math.cos(nu), r * Math.sin(nu)));
  }
  return pts;
}

export interface Spacecraft {
  id: string;
  name: string;
  /** From this date on it travels in a straight line, so earlier dates are not drawn. */
  from: number;
  r0: number;          // au from the Sun at the reference date
  auPerYear: number;   // speed away from the Sun
  dir: Vec3;           // unit vector, heliocentric ecliptic
}

const SPACECRAFT_REF = Date.UTC(2026, 9, 24, 1, 0, 0);

function eqToEcliptic(raHours: number, decDeg: number): Vec3 {
  const eps = 23.4392911 * DEG;
  const ra = raHours * 15 * DEG, dec = decDeg * DEG;
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.cos(dec) * Math.sin(ra);
  const z = Math.sin(dec);
  return { x, y: y * Math.cos(eps) + z * Math.sin(eps), z: -y * Math.sin(eps) + z * Math.cos(eps) };
}

export const SPACECRAFT: Spacecraft[] = [
  { id: 'voyager-1', name: 'Voyager 1', from: Date.UTC(1981, 0, 1), r0: 172.199, auPerYear: 3.569, dir: eqToEcliptic(17 + 15 / 60, 12 + 8 / 60) },
  { id: 'voyager-2', name: 'Voyager 2', from: Date.UTC(1990, 0, 1), r0: 144.241, auPerYear: 3.218, dir: eqToEcliptic(20 + 5 / 60, -(59 + 48 / 60)) },
  { id: 'new-horizons', name: 'New Horizons', from: Date.UTC(2016, 0, 1), r0: 65.877, auPerYear: 2.861, dir: eqToEcliptic(19 + 15 / 60, -(20 + 18 / 60)) },
];

export function spacecraftPosition(s: Spacecraft, timeMs: number): BodyPosition | null {
  if (timeMs < s.from) return null;
  const r = s.r0 + s.auPerYear * (timeMs - SPACECRAFT_REF) / (365.25 * DAY_MS);
  if (r <= 0) return null;
  return { x: s.dir.x * r, y: s.dir.y * r, z: s.dir.z * r, r };
}

// The 3D view spaces the planets evenly rather than to scale. This maps a real distance
// from the Sun onto the same spacing, so comets and spacecraft sit in the right place
// relative to the planets. Beyond Neptune each doubling of distance adds the same step.
const SCALE: [number, number][] = [
  [0, 0], [0.387, 5], [0.723, 8], [1.0, 12], [1.524, 17], [5.203, 28], [9.537, 40], [19.19, 54], [30.07, 68],
];

export function sceneRadius(au: number): number {
  if (au >= 30.07) return 68 + 10 * Math.log2(au / 30.07);
  for (let k = 1; k < SCALE.length; k++) {
    const [a1, s1] = SCALE[k];
    if (au <= a1) {
      const [a0, s0] = SCALE[k - 1];
      return s0 + ((au - a0) / (a1 - a0)) * (s1 - s0);
    }
  }
  return 68;
}

/** Heliocentric ecliptic au to scene coordinates (x, north up, toward the viewer). */
export function toScene(p: Vec3): Vec3 {
  const r = Math.hypot(p.x, p.y, p.z);
  if (r === 0) return { x: 0, y: 0, z: 0 };
  const s = sceneRadius(r) / r;
  return { x: p.x * s, y: p.z * s, z: -p.y * s };
}

export function formatKm(au: number): string {
  const km = au * AU_KM;
  if (km >= 1e9) return `${(km / 1e9).toFixed(1)} billion km`;
  return `${Math.round(km / 1e6).toLocaleString('en-GB')} million km`;
}

/** How long light takes to cover this distance, in plain words. */
export function lightTime(au: number): string {
  const s = (au * AU_KM) / 299792.458;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m === 0 ? `${h} hour${h === 1 ? '' : 's'}` : `${h} hour${h === 1 ? '' : 's'} ${m} minute${m === 1 ? '' : 's'}`;
  const sec = Math.round(s % 60);
  return `${m} minute${m === 1 ? '' : 's'} ${sec} second${sec === 1 ? '' : 's'}`;
}

export { AU_KM };
