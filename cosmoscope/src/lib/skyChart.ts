// Where things are in the sky from the UK, worked out on the device. Nothing is sent anywhere.
//
// Everything is worked out for London. Elsewhere in the UK the times shift by a few minutes and
// the sky looks almost the same.
//
// Positions: planets from lib/ephemeris (NASA JPL elements). Moon: the low precision series from
// the Astronomical Almanac, good to a few tenths of a degree. Sidereal time and the change from
// sky coordinates to height and direction: Meeus, Astronomical Algorithms, chapters 12 and 13.

import { heliocentric } from "./ephemeris";

const DEG = Math.PI / 180;
const DAY = 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const OBLIQUITY = 23.4393 * DEG;
/** Seconds light takes to travel one astronomical unit. */
const LIGHT_SECONDS_PER_AU = 499.005;

export const LONDON = { lat: 51.5074, lon: -0.1278, name: "London" };

export interface RaDec { ra: number; dec: number } // radians
export interface AltAz { alt: number; az: number } // degrees; azimuth from north through east

function eclipticToEquatorial(lon: number, lat: number): RaDec {
  const sl = Math.sin(lon), cl = Math.cos(lon), sb = Math.sin(lat), cb = Math.cos(lat);
  const ra = Math.atan2(sl * Math.cos(OBLIQUITY) - (sb / cb) * Math.sin(OBLIQUITY), cl);
  const dec = Math.asin(sb * Math.cos(OBLIQUITY) + cb * Math.sin(OBLIQUITY) * sl);
  return { ra, dec };
}

/** Local sidereal time in radians. */
function siderealTime(timeMs: number, lonDeg: number) {
  const d = (timeMs - J2000_MS) / DAY;
  const gmst = 280.46061837 + 360.98564736629 * d;
  return ((((gmst + lonDeg) % 360) + 360) % 360) * DEG;
}

export function toAltAz(p: RaDec, timeMs: number, place = LONDON): AltAz {
  const H = siderealTime(timeMs, place.lon) - p.ra;
  const phi = place.lat * DEG;
  const alt = Math.asin(Math.sin(phi) * Math.sin(p.dec) + Math.cos(phi) * Math.cos(p.dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H) * Math.cos(p.dec), Math.cos(phi) * Math.sin(p.dec) - Math.sin(phi) * Math.cos(p.dec) * Math.cos(H));
  return { alt: alt / DEG, az: ((az / DEG) % 360 + 360) % 360 };
}

export function fromHoursDegrees(raHours: number, decDeg: number): RaDec {
  return { ra: raHours * 15 * DEG, dec: decDeg * DEG };
}

/** A unit direction in the J2000 ecliptic frame, as the bright star file stores it in scene axes. */
export function fromSceneAxes(x: number, y: number, z: number): RaDec {
  // Scene axes: x, ecliptic north up, towards the viewer. Back to ecliptic x, y, z first.
  const ex = x, ey = -z, ez = y;
  return eclipticToEquatorial(Math.atan2(ey, ex), Math.asin(Math.max(-1, Math.min(1, ez))));
}

export function sunPosition(timeMs: number): RaDec {
  const e = heliocentric("earth", timeMs)!;
  return eclipticToEquatorial(Math.atan2(-e.y, -e.x), Math.asin(-e.z / e.r));
}

export function planetPosition(id: string, timeMs: number): { pos: RaDec; au: number } {
  const e = heliocentric("earth", timeMs)!;
  const p = heliocentric(id, timeMs)!;
  const gx = p.x - e.x, gy = p.y - e.y, gz = p.z - e.z;
  const au = Math.hypot(gx, gy, gz);
  return { pos: eclipticToEquatorial(Math.atan2(gy, gx), Math.asin(gz / au)), au };
}

export function moonPosition(timeMs: number): RaDec {
  const d = (timeMs - J2000_MS) / DAY;
  const L = 218.316 + 13.176396 * d;
  const M = (134.963 + 13.064993 * d) * DEG;
  const F = (93.272 + 13.22935 * d) * DEG;
  const D = (297.850 + 12.190749 * d) * DEG;
  const Ms = (357.529 + 0.98560028 * d) * DEG;
  const lon = L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)
    + 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(Ms) - 0.114 * Math.sin(2 * F);
  const lat = 5.128 * Math.sin(F) + 0.281 * Math.sin(M + F) + 0.278 * Math.sin(M - F) + 0.173 * Math.sin(2 * D - F);
  // The series is for the equinox of date; take precession off so it matches everything else.
  const T = d / 36525;
  return eclipticToEquatorial((lon - 1.3969713 * T) * DEG, lat * DEG);
}

/** Light travel time from a planet, in words: "about 79 minutes" or "about 1 hour 20 minutes". */
export function lightTimeWords(au: number) {
  const minutes = Math.round((au * LIGHT_SECONDS_PER_AU) / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const hours = `${h} ${h === 1 ? "hour" : "hours"}`;
  return m ? `${hours} ${m} ${m === 1 ? "minute" : "minutes"}` : hours;
}

// ---------- Darkness ----------

/** Find when the Sun's height crosses a level, between two times, going down or up. */
function crossing(level: number, from: number, to: number, falling: boolean) {
  const alt = (t: number) => toAltAz(sunPosition(t), t).alt;
  const step = 5 * 60000;
  for (let t = from; t < to; t += step) {
    const a = alt(t), b = alt(t + step);
    if (falling ? a >= level && b < level : a <= level && b > level) {
      let lo = t, hi = t + step;
      for (let n = 0; n < 20; n++) {
        const mid = (lo + hi) / 2;
        const m = alt(mid);
        if (falling ? m >= level : m <= level) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
  }
  return null;
}

export interface Darkness {
  sunset: number | null;
  /** When the sky is fully dark (Sun 18 degrees below the horizon), if it gets there tonight. */
  dark: number | null;
  /** When the sky starts to brighten again before dawn. */
  darkEnds: number | null;
  sunrise: number | null;
  /** The darkest moment of the night, used when it never gets fully dark. */
  darkest: number;
}

/** Tonight's sunset and darkness, from noon today until noon tomorrow (UK time). */
export function darknessTonight(nowMs: number): Darkness {
  // Noon today in the UK. Close enough to use 12:00 UTC, which is noon or 13:00 UK time.
  const day = new Date(nowMs);
  let noon = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 12);
  // After midnight but before dawn, "tonight" is the night already under way.
  if (nowMs < noon && toAltAz(sunPosition(nowMs), nowMs).alt < 0 && new Date(nowMs).getUTCHours() < 10) noon -= DAY;
  const end = noon + DAY;
  const sunset = crossing(-0.833, noon, end, true);
  const dark = crossing(-18, noon, end, true);
  const darkEnds = crossing(-18, noon, end, false);
  const sunrise = crossing(-0.833, noon, end, false);
  let darkest = noon + DAY / 2, low = 90;
  for (let t = noon; t < end; t += 10 * 60000) {
    const a = toAltAz(sunPosition(t), t).alt;
    if (a < low) { low = a; darkest = t; }
  }
  return { sunset, dark, darkEnds, sunrise, darkest };
}

/** 9pm UK time on the evening of "tonight". */
export function ninePmTonight(nowMs: number) {
  const d = darknessTonight(nowMs);
  const base = d.sunset ?? nowMs;
  // Build 21:00 in London on the sunset's date, whatever the clocks are doing.
  const dateStr = new Date(base).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const [y, m, dd] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, dd, 21);
  const offsetHours = Number(new Date(guess).toLocaleString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false })) - 21;
  return guess - offsetHours * 3600000;
}

export function ukTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
}

// ---------- When to see each planet ----------

export type PlanetSlot = "all-night" | "evening" | "late" | "dawn" | "twilight";

/**
 * When a planet is above the UK horizon tonight, from its real height at a few moments: an hour
 * after sunset, 9pm, midnight, and an hour before sunrise. Better than going by its angle from the
 * Sun alone, which cannot tell a planet that rises at 10pm from one that rises at 5am.
 */
export function planetSlot(id: string, d: Darkness, ninePm: number): { slot: PlanetSlot; when: string } {
  const alt = (t: number) => toAltAz(planetPosition(id, t).pos, t).alt;
  const dusk = (d.sunset ?? ninePm - 4 * 3600000) + 3600000;
  const dawn = (d.sunrise ?? ninePm + 10 * 3600000) - 3600000;
  const midnight = ninePm + 3 * 3600000;
  const aDusk = alt(dusk), a9 = alt(ninePm), aMid = alt(midnight), aDawn = alt(dawn);
  const evening = Math.max(aDusk, a9) > 5;
  if (evening && aDawn > 5) return { slot: "all-night", when: "Up all night" };
  if (evening) {
    return Math.max(aDusk, a9) < 15 && aMid < 5
      ? { slot: "evening", when: "Evening sky, low in the west after sunset" }
      : { slot: "evening", when: "Evening sky, visible after dark" };
  }
  if (aMid > 5) return { slot: "late", when: "Rises late in the evening, visible until dawn" };
  if (aDawn > 5) {
    return aDawn < 15
      ? { slot: "dawn", when: "Morning sky, low in the east before dawn" }
      : { slot: "dawn", when: "Morning sky, visible before dawn" };
  }
  return { slot: "twilight", when: "Very low in the twilight, hard to see right now" };
}
