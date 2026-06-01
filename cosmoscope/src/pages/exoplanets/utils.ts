import type { ExoplanetData, PlanetType, RawExoplanet } from "./types";

export function classifyPlanet(
  radius: number | null,
  period: number | null
): PlanetType {
  if (radius == null) return "unknown";
  if (radius >= 6 && period != null && period < 10) return "hot-jupiter";
  if (radius >= 6) return "gas-giant";
  if (radius >= 4) return "neptune-like";
  if (radius >= 2) return "mini-neptune";
  if (radius >= 1.5) return "super-earth";
  if (radius >= 0.5) return "earth-sized";
  return "unknown";
}

export function inHabitableZone(temp: number | null): boolean {
  if (temp == null) return false;
  return temp >= 180 && temp <= 320;
}

export function calcESI(
  radius: number | null,
  temp: number | null
): number {
  if (radius == null && temp == null) return 0;
  let esiR = 0.5;
  let esiT = 0.5;
  if (radius != null) {
    esiR = Math.pow(1 - Math.abs(radius - 1) / (radius + 1), 0.57);
  }
  if (temp != null) {
    esiT = Math.pow(1 - Math.abs(temp - 288) / (temp + 288), 5.58);
  }
  return Math.sqrt(esiR * esiT);
}

export function transformPlanet(raw: RawExoplanet): ExoplanetData {
  const radius = raw.pl_rade ?? null;
  const temp = raw.pl_eqt ?? null;
  const period = raw.pl_orbper ?? null;
  const distParsecs = raw.sy_dist ?? null;
  const distLY = distParsecs != null ? distParsecs * 3.26156 : null;
  const planetType = classifyPlanet(radius, period);
  const esi = calcESI(radius, temp);
  const hz = inHabitableZone(temp);
  const potentiallyHabitable = hz && radius != null && radius <= 2.5;

  return {
    id: raw.pl_name,
    name: raw.pl_name,
    starName: raw.hostname,
    method: raw.discoverymethod ?? "Unknown",
    year: raw.disc_year ?? null,
    period,
    radius,
    mass: raw.pl_bmasse ?? null,
    temp,
    distanceParsecs: distParsecs,
    distanceLY: distLY,
    numPlanets: raw.sy_pnum ?? null,
    numStars: raw.sy_snum ?? null,
    spectralType: raw.st_spectype ?? null,
    ra: raw.ra ?? null,
    dec: raw.dec ?? null,
    planetType,
    esi,
    inHabitableZone: hz,
    potentiallyHabitable,
  };
}

export function getStarColor(spectralType: string | null): string {
  if (!spectralType) return "#cccccc";
  const t = spectralType[0]?.toUpperCase();
  const map: Record<string, string> = {
    O: "#aabbff", B: "#bbccff", A: "#ddeeff",
    F: "#fff4cc", G: "#ffe87c", K: "#ffaa44", M: "#ff6644",
  };
  return map[t ?? ""] ?? "#cccccc";
}

export function getPlanetTypeLabel(type: PlanetType): string {
  const map: Record<PlanetType, string> = {
    "earth-sized": "Earth-sized",
    "super-earth": "Super-Earth",
    "mini-neptune": "Mini-Neptune",
    "neptune-like": "Neptune-like",
    "gas-giant": "Gas Giant",
    "hot-jupiter": "Hot Jupiter",
    "unknown": "Unknown",
  };
  return map[type];
}

export function getPlanetTypeColor(type: PlanetType): string {
  const map: Record<PlanetType, string> = {
    "earth-sized": "#4fc3f7",
    "super-earth": "#66bb6a",
    "mini-neptune": "#42a5f5",
    "neptune-like": "#26c6da",
    "gas-giant": "#ffa726",
    "hot-jupiter": "#ef5350",
    "unknown": "#888888",
  };
  return map[type];
}

export function formatDistanceLY(ly: number | null): string {
  if (ly == null) return "Unknown";
  if (ly < 100) return `${ly.toFixed(1)} ly`;
  if (ly < 10000) return `${ly.toFixed(0)} ly`;
  return `${(ly / 1000).toFixed(1)}k ly`;
}

export function formatParsecs(pc: number | null): string {
  if (pc == null) return "Unknown";
  return `${pc.toFixed(1)} pc`;
}

export function formatTemp(k: number | null): string {
  if (k == null) return "Unknown";
  const c = k - 273.15;
  return `${k.toFixed(0)} K (${c.toFixed(0)}°C)`;
}

export function formatPeriod(days: number | null): string {
  if (days == null) return "Unknown";
  if (days < 1) return `${(days * 24).toFixed(1)} hours`;
  if (days < 365) return `${days.toFixed(1)} days`;
  return `${(days / 365.25).toFixed(2)} years`;
}

export function formatRadius(r: number | null): string {
  if (r == null) return "Unknown";
  return `${r.toFixed(2)} R⊕`;
}

export function formatMass(m: number | null): string {
  if (m == null) return "Unknown";
  if (m > 318) return `${(m / 318).toFixed(1)} Jupiter masses`;
  return `${m.toFixed(1)} M⊕`;
}

export function travelTimes(ly: number | null): {
  walking: string; sound: string; voyager: string; tenPct: string; light: string;
} | null {
  if (ly == null) return null;
  const KM_PER_LY = 9.461e12;
  const dist = ly * KM_PER_LY;
  const yrs = (kmh: number) => dist / kmh / 8760;
  const fmt = (y: number): string => {
    if (y < 1) return `${(y * 365).toFixed(0)} days`;
    if (y < 1e4) return `${Math.round(y).toLocaleString()} years`;
    if (y < 1e6) return `${(y / 1e3).toFixed(0)}k years`;
    return `${(y / 1e6).toFixed(1)}M years`;
  };
  return {
    walking: fmt(yrs(5)),
    sound: fmt(yrs(1235)),
    voyager: fmt(yrs(61000)),
    tenPct: fmt(ly * 10),
    light: ly < 1 ? `${(ly * 365).toFixed(0)} days` : `${ly.toFixed(1)} years`,
  };
}

export function habitabilityAssessment(planet: ExoplanetData): string {
  const { temp, radius, inHabitableZone: hz, planetType } = planet;
  if (temp == null) return "Insufficient data to assess habitability for this world.";
  if (temp > 1000)
    return `At ${temp.toFixed(0)} K, this world's surface is hotter than lava. Any atmosphere would be stripped or scorched. Life as we know it is impossible here.`;
  if (temp < 100)
    return `At ${temp.toFixed(0)} K, this world is locked in deep freeze — far colder than anywhere on Earth. Liquid water, and life, are extremely unlikely.`;
  if (hz) {
    if (planetType === "gas-giant" || planetType === "hot-jupiter" || planetType === "neptune-like")
      return `This planet orbits within its star's habitable zone — where liquid water could exist. However, its large size (${radius?.toFixed(1) ?? "?"} Earth radii) suggests it is a gas or ice giant with no solid surface for life as we know it.`;
    if (planetType === "earth-sized" || planetType === "super-earth" || planetType === "mini-neptune")
      return `This world orbits within its star's habitable zone at a promising temperature of ${temp.toFixed(0)} K. Its size suggests it may be rocky. This makes it one of the more compelling candidates for habitability in the known catalogue.`;
  }
  if (temp < 200)
    return `At ${temp.toFixed(0)} K this world sits just outside the cold edge of the habitable zone. Surface water would be frozen, though subsurface oceans are theoretically possible.`;
  return `At ${temp.toFixed(0)} K this world sits just outside the warm edge of the habitable zone. Conditions would likely be too hot for liquid water at the surface.`;
}

export const PLANET_OF_WEEK_LIST = [
  "TRAPPIST-1 e", "Kepler-442 b", "Kepler-452 b", "GJ 667C c",
  "HD 40307 g", "Kepler-186 f", "TOI-700 d", "LHS 1140 b",
  "Proxima Cen b", "K2-18 b",
];

export function getPlanetOfWeek(): string {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  return PLANET_OF_WEEK_LIST[weekNum % PLANET_OF_WEEK_LIST.length];
}

export const GALLERY_QUOTES = [
  {
    text: "We have confirmed 5,500+ worlds in our galaxy alone. The Milky Way contains 200–400 billion stars. The maths is left as an exercise for the reader.",
  },
  {
    text: "The first exoplanet was confirmed in 1992. In 30 years we went from zero known worlds beyond our solar system to thousands. We are just getting started.",
  },
  {
    text: "Of all the confirmed exoplanets, none have yet shown definitive signs of life. The search continues.",
  },
  {
    text: "Every point of light you can see in the night sky is a star. Most of them have planets. Some of those planets may have life. We have not yet found it.",
  },
  {
    text: "The James Webb Space Telescope can now read the chemical fingerprints of exoplanet atmospheres. We are learning to smell worlds we cannot see.",
  },
];

export const DISCOVERY_TIMELINE = [
  { year: 1992, count: 1, note: "First confirmed exoplanet (pulsar planet PSR B1257+12)" },
  { year: 1995, count: 2, note: "51 Pegasi b — first around a Sun-like star" },
  { year: 2000, count: 30, note: "30 known worlds" },
  { year: 2009, count: 400, note: "Kepler Space Telescope launches" },
  { year: 2011, count: 700, note: "Kepler begins mass discovery" },
  { year: 2014, count: 1000, note: "1,000 confirmed planets milestone" },
  { year: 2016, count: 2000, note: "TRAPPIST-1 system announced" },
  { year: 2018, count: 3800, note: "TESS begins all-sky survey" },
  { year: 2022, count: 5000, note: "5,000 milestone. James Webb launches" },
  { year: 2024, count: 5600, note: "5,600+ confirmed. Webb reading atmospheres" },
];

export const NOTABLE_SYSTEMS: Record<string, { label: string; note: string }> = {
  "TRAPPIST-1": { label: "TRAPPIST-1", note: "7 Earth-sized planets, 3 in habitable zone" },
  "Kepler-452": { label: "Kepler-452", note: "Earth's 'older cousin'" },
  "55 Cnc": { label: "55 Cancri", note: "Diamond planet system" },
  "HD 209458": { label: "HD 209458", note: "First exoplanet atmosphere detected" },
  "Proxima Cen": { label: "Proxima Centauri", note: "Nearest exoplanet system (4.24 ly)" },
  "51 Peg": { label: "51 Pegasi", note: "First confirmed exoplanet (1995)" },
  "Kepler-442": { label: "Kepler-442", note: "Most Earth-like confirmed" },
  "GJ 1214": { label: "GJ 1214", note: "Possible ocean world" },
};
