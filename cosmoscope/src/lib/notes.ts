// Notes sent to the universe. A note never leaves the device: it is kept in this browser, and
// can be carried to another device in a link whose contents sit after the #, which browsers never
// send to a server. What the page follows is real: the light that left Earth at the moment of
// sending, travelling outward at 299,792 km every second.

import { heliocentric } from "@/lib/ephemeris";
import { SPACECRAFT, spacecraftPosition, AU_KM, eqToEcliptic, Vec3 } from "@/lib/smallbodies";

export const C_KM_S = 299792.458;
const LY_KM = 9460730472580.8;
export const MAX_NOTE = 400;

export interface Note {
  id: string;
  text: string;
  sentAt: number;
  /** Where the person aimed it: one of DESTINATIONS. Light spreads every way, so this is the path we follow. */
  to?: string;
}

// ── Where a note can be sent ───────────────────────────────────────────────────
export interface Destination {
  id: string;
  name: string;
  /** Right ascension in hours and declination in degrees, so the note heads the real way. */
  ra: number;
  dec: number;
  ly: number;
  constellation: string;
  line: string;
}

export const DESTINATIONS: Destination[] = [
  { id: "proxima", name: "Proxima Centauri", ra: 14.4953, dec: -62.679, ly: 4.24, constellation: "Centaurus", line: "The nearest star to the Sun." },
  { id: "sirius", name: "Sirius", ra: 6.7525, dec: -16.716, ly: 8.6, constellation: "Canis Major", line: "The brightest star in the night sky." },
  { id: "tau-ceti", name: "Tau Ceti", ra: 1.7345, dec: -15.937, ly: 11.9, constellation: "Cetus", line: "A quiet star much like the Sun." },
  { id: "vega", name: "Vega", ra: 18.6156, dec: 38.784, ly: 25, constellation: "Lyra", line: "A bright blue white star, once the North Star." },
  { id: "trappist", name: "TRAPPIST-1", ra: 23.1081, dec: -5.041, ly: 40.7, constellation: "Aquarius", line: "A small star with seven rocky planets." },
  { id: "pleiades", name: "The Pleiades", ra: 3.7908, dec: 24.117, ly: 444, constellation: "Taurus", line: "The Seven Sisters, a cluster of young stars." },
  { id: "orion", name: "The Orion Nebula", ra: 5.5881, dec: -5.391, ly: 1344, constellation: "Orion", line: "A cloud where new stars are being born." },
  { id: "centre", name: "The centre of the Milky Way", ra: 17.7611, dec: -29.008, ly: 26000, constellation: "Sagittarius", line: "The heart of our galaxy." },
  { id: "andromeda", name: "The Andromeda Galaxy", ra: 0.7123, dec: 41.269, ly: 2.5e6, constellation: "Andromeda", line: "The nearest big galaxy." },
];

// No longer offered, but kept so that links to notes already sent this way still open.
const RETIRED_DESTINATIONS: Destination[] = [
  { id: "betelgeuse", name: "Betelgeuse", ra: 5.9195, dec: 7.407, ly: 550, constellation: "Orion", line: "The red supergiant at Orion's shoulder." },
];
const ALL_DESTINATIONS = [...DESTINATIONS, ...RETIRED_DESTINATIONS];

export const DEFAULT_DESTINATION = "proxima";

export function destinationOf(n: Note): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.id === n.to);
}

/** Unit vector towards a destination, heliocentric ecliptic. */
export function directionOf(d: Destination): Vec3 {
  return eqToEcliptic(d.ra, d.dec);
}

const YEAR_MS = 365.25 * 86400000;
export function arrivalOf(n: Note, d: Destination) {
  return n.sentAt + d.ly * YEAR_MS;
}

/** Where the note is at time t, in au from the Sun (heliocentric ecliptic). */
export function notePosition(n: Note, d: Destination, t: number): Vec3 {
  const e = heliocentric("earth", n.sentAt) ?? { x: 1, y: 0, z: 0 };
  const dir = directionOf(d);
  const r = kmTravelled(n.sentAt, t) / AU_KM;
  return { x: e.x + dir.x * r, y: e.y + dir.y * r, z: e.z + dir.z * r };
}

/** The way it is heading, as an astronomer would write it, without signs: "14h 30m, 62° 41′ south". */
export function headingLabel(d: Destination) {
  const h = Math.floor(d.ra), m = Math.round((d.ra - h) * 60);
  const a = Math.abs(d.dec), deg = Math.floor(a), min = Math.round((a - deg) * 60);
  return `${h}h ${String(m).padStart(2, "0")}m, ${deg}° ${String(min).padStart(2, "0")}′ ${d.dec >= 0 ? "north" : "south"}`;
}

// ── Keeping notes on this device ───────────────────────────────────────────────
const KEY = "pale_notes";
const SEEN_KEY = "pale_notes_seen";

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Note[]) : [];
    return Array.isArray(list) ? list.filter((n) => typeof n.text === "string" && typeof n.sentAt === "number") : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    /* storage blocked: the note still works for this visit */
  }
}

export function lastSeen(): number | null {
  try {
    const v = Number(localStorage.getItem(SEEN_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function markSeen(t = Date.now()) {
  try {
    localStorage.setItem(SEEN_KEY, String(t));
  } catch {
    /* fine */
  }
}

export function newNote(text: string, to?: string): Note {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return { id, text: text.trim().slice(0, MAX_NOTE), sentAt: Date.now(), ...(to ? { to } : {}) };
}

// ── Links that carry a note ─────────────────────────────────────────────────────
function toBase64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function noteLink(n: Note) {
  const payload = toBase64Url(JSON.stringify({ t: n.text, s: n.sentAt, ...(n.to ? { d: n.to } : {}) }));
  return `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/note#n=${payload}`;
}

export function noteFromHash(hash: string): Note | null {
  const m = hash.match(/n=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const { t, s, d } = JSON.parse(fromBase64Url(m[1])) as { t: unknown; s: unknown; d?: unknown };
    if (typeof t !== "string" || typeof s !== "number" || s > Date.now() + 60000) return null;
    const to = typeof d === "string" && ALL_DESTINATIONS.some((x) => x.id === d) ? d : undefined;
    return { id: `link-${s}`, text: t.slice(0, MAX_NOTE), sentAt: s, ...(to ? { to } : {}) };
  } catch {
    return null;
  }
}

// ── What the note passes on its way out ────────────────────────────────────────
export interface Milestone {
  id: string;
  name: string;
  /** Distance from Earth in km, at the moment the note was sent. */
  km: number;
  line: string;
  /** Shown on the track even when it is not next. */
  landmark?: boolean;
}

const ly = (n: number) => n * LY_KM;
const au = (n: number) => n * AU_KM;

const STARS: Milestone[] = [
  { id: "heliopause", name: "The edge of the Sun's wind", km: au(121), line: "Where the wind from the Sun gives way to the space between the stars." },
  { id: "oort-inner", name: "The Oort cloud", km: au(2000), line: "A vast shell of icy bodies where many comets are thought to come from. Nobody has seen it directly." },
  { id: "one-ly", name: "One light year", km: ly(1), line: "About 9.5 trillion km. Light needs a whole year to get here." },
  { id: "oort-outer", name: "The far edge of the Oort cloud", km: au(100000), line: "Out here the Sun's gravity barely holds on." },
  { id: "proxima", name: "Proxima Centauri", km: ly(4.24), line: "The nearest star to the Sun, with a planet where water could be liquid.", landmark: true },
  { id: "alpha-cen", name: "Alpha Centauri A and B", km: ly(4.37), line: "Two suns much like ours, circling each other." },
  { id: "barnard", name: "Barnard's Star", km: ly(5.96), line: "A small red star, about twice as old as the Sun." },
  { id: "sirius", name: "Sirius", km: ly(8.6), line: "The brightest star in the night sky." },
  { id: "tau-ceti", name: "Tau Ceti", km: ly(11.9), line: "A star much like the Sun. In 1960 it was one of the first places astronomers listened for a signal." },
  { id: "vega", name: "Vega", km: ly(25), line: "It was the North Star 14,000 years ago, and will be again." },
  { id: "trappist", name: "TRAPPIST-1", km: ly(40.7), line: "A small star with seven rocky planets." },
  { id: "aldebaran", name: "Aldebaran", km: ly(65), line: "The red eye of Taurus, the bull." },
  { id: "pleiades", name: "The Pleiades", km: ly(444), line: "A cluster of young stars, named in almost every culture on Earth." },
  { id: "betelgeuse", name: "Betelgeuse", km: ly(550), line: "The red supergiant at Orion's shoulder, hundreds of times wider than the Sun." },
  { id: "orion", name: "The Orion Nebula", km: ly(1344), line: "A cloud where new stars are being born right now." },
  { id: "centre", name: "The centre of the Milky Way", km: ly(26000), line: "Home to a black hole four million times the mass of the Sun.", landmark: true },
  { id: "andromeda", name: "The Andromeda Galaxy", km: ly(2.5e6), line: "The nearest big galaxy. The light we see from it tonight set off before our species existed.", landmark: true },
];

const PLANET_LINES: Record<string, string> = {
  mercury: "The smallest planet, and the closest to the Sun.",
  venus: "The hottest planet, wrapped in clouds of acid.",
  mars: "Every picture a rover sends home takes this long to reach us.",
  jupiter: "More than twice the mass of all the other planets put together.",
  saturn: "Its rings would stretch most of the way from Earth to the Moon.",
  uranus: "It rolls around the Sun on its side.",
  neptune: "One year there lasts 165 of ours.",
};

const CRAFT_LINES: Record<string, string> = {
  "new-horizons": "The spacecraft that flew past Pluto in 2015.",
  "voyager-2": "Launched in 1977, the only spacecraft to have visited Uranus and Neptune.",
  "voyager-1": "The farthest thing people have ever made.",
};

/** Everything the note passes, nearest first, worked out for the moment it was sent. */
export function milestonesFor(sentAt: number): Milestone[] {
  const list: Milestone[] = [
    { id: "moon", name: "The Moon", km: 384400, line: "The Apollo astronauts took three days to get here.", landmark: true },
  ];
  const earth = heliocentric("earth", sentAt);
  if (earth) {
    list.push({ id: "sun", name: "The Sun", km: au(earth.r), line: "Sunlight makes this same journey, the other way, every time it reaches you.", landmark: true });
    Object.keys(PLANET_LINES).forEach((id) => {
      const p = heliocentric(id, sentAt);
      if (!p) return;
      const name = id[0].toUpperCase() + id.slice(1);
      list.push({ id, name, km: au(Math.hypot(p.x - earth.x, p.y - earth.y, p.z - earth.z)), line: PLANET_LINES[id], landmark: id === "neptune" });
    });
    SPACECRAFT.forEach((s) => {
      const p = spacecraftPosition(s, sentAt);
      if (!p) return;
      list.push({ id: s.id, name: s.name, km: au(Math.hypot(p.x - earth.x, p.y - earth.y, p.z - earth.z)), line: CRAFT_LINES[s.id] ?? "", landmark: s.id === "voyager-1" });
    });
  }
  return [...list, ...STARS].sort((a, b) => a.km - b.km);
}

// ── Plain words for numbers ────────────────────────────────────────────────────
export function kmTravelled(sentAt: number, now: number) {
  return Math.max(0, (now - sentAt) / 1000) * C_KM_S;
}

export function whenReached(m: Milestone, sentAt: number) {
  return sentAt + (m.km / C_KM_S) * 1000;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

/** A length of time in the two largest units that matter: "4 minutes 12 seconds", "3 years 2 months". */
export function duration(ms: number) {
  const s = Math.max(0, ms / 1000);
  if (s < 10) return plural(Math.max(1, Math.round(s * 10) / 10), "second").replace(/^(\d+)\.0 /, "$1 ");
  if (s < 60) return plural(Math.round(s), "second");
  const m = Math.floor(s / 60);
  if (m < 60) return `${plural(m, "minute")}${Math.floor(s % 60) ? " " + plural(Math.floor(s % 60), "second") : ""}`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${plural(h, "hour")}${m % 60 ? " " + plural(m % 60, "minute") : ""}`;
  const d = Math.floor(h / 24);
  if (d < 60) return plural(d, "day");
  const years = s / (365.25 * 86400);
  if (years < 2) return plural(Math.round(years * 12), "month");
  if (years < 100) {
    const y = Math.floor(years);
    const mo = Math.floor((years - y) * 12);
    return `${plural(y, "year")}${mo ? " " + plural(mo, "month") : ""}`;
  }
  return `${Math.round(years).toLocaleString("en-GB")} years`;
}

export function bigKm(km: number) {
  if (km < 1e9) return `${Math.round(km).toLocaleString("en-GB")} km`;
  if (km < 1e12) return `${(km / 1e9).toFixed(1)} billion km`;
  if (km < 1e15) return `${(km / 1e12).toFixed(1)} trillion km`;
  return `${(km / LY_KM).toFixed(1)} light years`;
}

export function dateLabel(t: number) {
  const d = new Date(t);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/** A calendar file, so the person's own calendar reminds them, with no account needed. */
export function calendarFile(note: Note, m: Milestone, link: string) {
  const t = whenReached(m, note.sentAt);
  const stamp = (x: number) => new Date(x).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PALE//Note//EN",
    "BEGIN:VEVENT",
    `UID:${note.sentAt}-${m.id}@pale`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(t)}`,
    `DTEND:${stamp(t + 15 * 60000)}`,
    `SUMMARY:${esc(`Your note reaches ${inSentence(m.name)}`)}`,
    `DESCRIPTION:${esc(`${m.line}\n\nFollow it here: ${link}`)}`,
    `URL:${link}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}

// Calendar files want lines no longer than 75 characters, continued with a leading space.
function fold(line: string) {
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 73) out.push((i ? " " : "") + line.slice(i, i + 73));
  return out.join("\r\n");
}

/** "The Moon" as it reads mid sentence: "the Moon". */
export function inSentence(name: string) {
  return name.startsWith("The ") ? "the" + name.slice(3) : name;
}
