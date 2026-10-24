// What is really in the sky, worked out on the device with no location needed.
//
// Planets: heliocentric positions from lib/ephemeris (NASA JPL elements), turned into
// their direction from Earth. Brightness: Mallama & Hilton (2018) magnitude formulas.
// Moon phases: Meeus, Astronomical Algorithms, chapter 49 (accurate to minutes).
// Seasons: the moment the Sun reaches 0, 90, 180 and 270 degrees of longitude.
// Meteor showers: International Meteor Organization working list (typical annual dates).

import { heliocentric } from "./ephemeris";

const DEG = Math.PI / 180;
const DAY = 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}

function norm180(x: number) {
  const y = norm360(x);
  return y > 180 ? y - 360 : y;
}

// Ecliptic longitude measured from the equinox of date rather than J2000.
function precess(lonDeg: number, timeMs: number) {
  const T = (timeMs - J2000_MS) / (36525 * DAY);
  return norm360(lonDeg + 1.3969713 * T);
}

/** Apparent longitude of the Sun, seen from Earth, in degrees. */
export function sunLongitude(timeMs: number) {
  const e = heliocentric("earth", timeMs)!;
  return precess(e.lon / DEG + 180, timeMs);
}

// ---------- Moon ----------

function jdeToMs(jde: number) {
  return (jde - 2440587.5) * DAY;
}

function moonPhaseTime(k: number) {
  const T = k / 1236.85;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * DEG;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * DEG;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * DEG;
  const O = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * DEG;
  const full = Math.abs(k % 1) > 0.25;
  const s = Math.sin;
  if (!full) {
    jde += -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
      + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
      - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
      - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
      - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O);
  } else {
    jde += -0.40614 * s(Mp) + 0.17302 * E * s(M) + 0.01614 * s(2 * Mp) + 0.01043 * s(2 * F)
      + 0.00734 * E * s(Mp - M) - 0.00515 * E * s(Mp + M) + 0.00209 * E * E * s(2 * M)
      - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
      - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
      - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(O);
  }
  return jdeToMs(jde);
}

export interface MoonInfo {
  name: string;
  /** 0 = new, 0.5 = full, 1 = new again. */
  fraction: number;
  /** Percentage of the disc lit. */
  illumination: number;
  waxing: boolean;
  nextNew: number;
  nextFull: number;
}

export function moon(timeMs: number): MoonInfo {
  const years = (timeMs - Date.UTC(2000, 0, 6)) / (365.25 * DAY);
  let k = Math.floor(years * 12.3685) - 1;
  // Find the new moon just before now.
  while (moonPhaseTime(k + 1) <= timeMs) k++;
  while (moonPhaseTime(k) > timeMs) k--;
  const prevNew = moonPhaseTime(k);
  const nextNew = moonPhaseTime(k + 1);
  const full = moonPhaseTime(k + 0.5);
  const nextFull = full > timeMs ? full : moonPhaseTime(k + 1.5);

  const fraction = (timeMs - prevNew) / (nextNew - prevNew);
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100);
  const f = fraction;
  const name =
    f < 0.034 || f > 0.966 ? "New Moon"
    : f < 0.216 ? "Waxing crescent"
    : f < 0.284 ? "First quarter"
    : f < 0.466 ? "Waxing gibbous"
    : f < 0.534 ? "Full Moon"
    : f < 0.716 ? "Waning gibbous"
    : f < 0.784 ? "Last quarter"
    : "Waning crescent";
  return { name, fraction, illumination, waxing: f < 0.5, nextNew, nextFull };
}

// ---------- Planets ----------

export interface PlanetTonight {
  id: string;
  name: string;
  /** Angle from the Sun in the sky, degrees. */
  elongation: number;
  magnitude: number;
  visible: boolean;
  /** Where and when to look, in plain words. */
  when: string;
  brightness: string;
}

const NAKED_EYE = [
  { id: "mercury", name: "Mercury", minElong: 18 },
  { id: "venus", name: "Venus", minElong: 10 },
  { id: "mars", name: "Mars", minElong: 15 },
  { id: "jupiter", name: "Jupiter", minElong: 15 },
  { id: "saturn", name: "Saturn", minElong: 15 },
];

function magnitude(id: string, r: number, delta: number, i: number) {
  const base = 5 * Math.log10(r * delta);
  switch (id) {
    case "mercury":
      return -0.613 + base + 6.328e-2 * i - 1.6336e-3 * i ** 2 + 3.3644e-5 * i ** 3 - 3.4265e-7 * i ** 4 + 1.6893e-9 * i ** 5 - 3.0334e-12 * i ** 6;
    case "venus":
      return -4.384 + base - 1.044e-3 * i + 3.687e-4 * i ** 2 - 2.814e-6 * i ** 3 + 8.938e-9 * i ** 4;
    case "mars":
      return -1.601 + base + 2.267e-2 * i - 1.302e-4 * i ** 2;
    case "jupiter":
      return -9.395 + base + 3.7e-4 * i + 6.16e-4 * i ** 2;
    case "saturn":
      // Globe only. The rings add up to about a magnitude when they are wide open.
      return -8.94 + base + 2.446e-4 * i + 2.672e-4 * i ** 2;
    default:
      return 99;
  }
}

function brightnessWords(m: number) {
  if (m < -3) return "Dazzling, the brightest thing in the sky after the Moon";
  if (m < -1.5) return "Very bright, brighter than any star";
  if (m < 0.5) return "Bright, easy to spot";
  if (m < 2) return "Fairly bright, like a medium star";
  return "Faint, needs a dark sky";
}

export function planetsTonight(timeMs: number): PlanetTonight[] {
  const earth = heliocentric("earth", timeMs)!;
  const sunLon = sunLongitude(timeMs);
  return NAKED_EYE.map(({ id, name, minElong }) => {
    const p = heliocentric(id, timeMs)!;
    const gx = p.x - earth.x, gy = p.y - earth.y, gz = p.z - earth.z;
    const delta = Math.hypot(gx, gy, gz);
    const sx = -earth.x, sy = -earth.y, sz = -earth.z;
    const R = earth.r;
    const cosE = (gx * sx + gy * sy + gz * sz) / (delta * R);
    const elongation = Math.acos(Math.max(-1, Math.min(1, cosE))) / DEG;
    const cosI = (p.r * p.r + delta * delta - R * R) / (2 * p.r * delta);
    const i = Math.acos(Math.max(-1, Math.min(1, cosI))) / DEG;
    const mag = magnitude(id, p.r, delta, i);

    const geoLon = precess(Math.atan2(gy, gx) / DEG, timeMs);
    const east = norm180(geoLon - sunLon) > 0;
    const visible = elongation >= minElong;

    let when: string;
    if (!visible) when = "Too close to the Sun to see right now";
    else if (elongation > 150) when = "Up all night, highest around midnight";
    else if (east) when = elongation < 45 ? "Evening sky, low in the west after sunset" : "Evening sky, visible after dark";
    else when = elongation < 45 ? "Morning sky, low in the east before dawn" : "Morning sky, visible before dawn";

    return {
      id,
      name,
      elongation,
      magnitude: Math.round(mag * 10) / 10,
      visible,
      when,
      brightness: id === "mercury" ? "Always low and brief, so you need a clear, flat horizon" : brightnessWords(mag),
    };
  });
}

// ---------- Seasons ----------

function sunCrossing(targetDeg: number, fromMs: number) {
  // Step forward a day at a time until the Sun passes the target, then narrow down.
  let a = fromMs;
  const diff = (t: number) => norm180(sunLongitude(t) - targetDeg);
  while (diff(a + DAY) < 0 || diff(a) >= 0) {
    a += DAY;
    if (a - fromMs > 400 * DAY) return NaN;
  }
  let b = a + DAY;
  for (let n = 0; n < 40; n++) {
    const m = (a + b) / 2;
    if (diff(m) < 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export function nextSeason(timeMs: number) {
  const events = [
    { deg: 0, name: "March equinox", northern: "First day of spring in the north" },
    { deg: 90, name: "June solstice", northern: "The longest day in the north" },
    { deg: 180, name: "September equinox", northern: "First day of autumn in the north" },
    { deg: 270, name: "December solstice", northern: "The shortest day in the north" },
  ];
  const found = events
    .map((e) => ({ ...e, time: sunCrossing(e.deg, timeMs) }))
    .filter((e) => !Number.isNaN(e.time) && e.time > timeMs)
    .sort((x, y) => x.time - y.time);
  return found[0];
}

// ---------- Meteor showers ----------

export interface Shower {
  name: string;
  /** Peak month (0 to 11) and day, typical for any year. */
  peak: [number, number];
  /** Activity window, month and day. */
  start: [number, number];
  end: [number, number];
  rate: number;
  radiant: string;
  note?: string;
}

const SHOWERS: Shower[] = [
  { name: "Quadrantids", peak: [0, 3], start: [11, 28], end: [0, 12], rate: 80, radiant: "Boötes", note: "A short, sharp peak lasting only a few hours." },
  { name: "Lyrids", peak: [3, 22], start: [3, 14], end: [3, 30], rate: 18, radiant: "Lyra" },
  { name: "Eta Aquariids", peak: [4, 6], start: [3, 19], end: [4, 28], rate: 50, radiant: "Aquarius", note: "Best seen from the southern hemisphere. Dust from Halley's Comet." },
  { name: "Perseids", peak: [7, 12], start: [6, 17], end: [7, 24], rate: 100, radiant: "Perseus", note: "The favourite of the northern summer." },
  { name: "Orionids", peak: [9, 21], start: [9, 2], end: [10, 7], rate: 20, radiant: "Orion", note: "Dust from Halley's Comet." },
  { name: "Leonids", peak: [10, 17], start: [10, 6], end: [10, 30], rate: 15, radiant: "Leo" },
  { name: "Geminids", peak: [11, 14], start: [11, 4], end: [11, 20], rate: 150, radiant: "Gemini", note: "Usually the richest shower of the year." },
  { name: "Ursids", peak: [11, 22], start: [11, 17], end: [11, 26], rate: 10, radiant: "Ursa Minor" },
];

function dateInYear(year: number, [m, d]: [number, number]) {
  return Date.UTC(year, m, d, 12);
}

export interface ShowerTonight extends Shower {
  peakTime: number;
  activeNow: boolean;
}

/** Showers active now, plus the next one to peak. */
export function showers(timeMs: number): ShowerTonight[] {
  const year = new Date(timeMs).getUTCFullYear();
  const list: ShowerTonight[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const s of SHOWERS) {
      const peakTime = dateInYear(y, s.peak);
      let start = dateInYear(y, s.start);
      let end = dateInYear(y, s.end);
      if (start > peakTime) start = dateInYear(y - 1, s.start);
      if (end < peakTime) end = dateInYear(y + 1, s.end);
      list.push({ ...s, peakTime, activeNow: timeMs >= start && timeMs <= end + DAY });
    }
  }
  const active = list.filter((s) => s.activeNow);
  const next = list.filter((s) => s.peakTime > timeMs && !s.activeNow).sort((a, b) => a.peakTime - b.peakTime)[0];
  return next ? [...active, next] : active;
}
