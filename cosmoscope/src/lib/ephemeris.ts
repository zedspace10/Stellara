// Real planet positions for any date, from NASA JPL's published orbital elements.
//
// Source: E. M. Standish, "Keplerian Elements for Approximate Positions of the Major Planets",
// JPL Solar System Dynamics, Table 1 (valid 1800 AD to 2050 AD).
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
//
// Accuracy over that range is better than about a quarter of a degree for every planet,
// far finer than anything visible in the 3D view.

type Elements = [a: number, e: number, I: number, L: number, peri: number, node: number];

// For each planet: elements at J2000, then their rates of change per Julian century.
// a in au, angles in degrees. "earth" is the Earth Moon barycentre, as in the JPL table.
const TABLE: Record<string, { base: Elements; rate: Elements }> = {
  mercury: {
    base: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  venus: {
    base: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
    rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
  },
  earth: {
    base: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  },
  mars: {
    base: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  jupiter: {
    base: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  saturn: {
    base: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
  uranus: {
    base: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503],
    rate: [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  },
  neptune: {
    base: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
    rate: [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  },
};

export const EPHEMERIS_MIN = Date.UTC(1800, 0, 1);
export const EPHEMERIS_MAX = Date.UTC(2050, 11, 31);

const DEG = Math.PI / 180;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_CENTURY = 36525 * 86400000;

function norm180(deg: number) {
  const x = ((deg + 180) % 360 + 360) % 360;
  return x - 180;
}

export interface HelioPosition {
  /** Heliocentric ecliptic coordinates in au (J2000 ecliptic). */
  x: number;
  y: number;
  z: number;
  /** Distance from the Sun in au. */
  r: number;
  /** Heliocentric ecliptic longitude in radians, 0 to 2π. */
  lon: number;
}

export function heliocentric(id: string, timeMs: number): HelioPosition | null {
  const row = TABLE[id];
  if (!row) return null;
  const T = (timeMs - J2000_MS) / MS_PER_CENTURY;
  const [a, e, I, L, peri, node] = row.base.map((v, i) => v + row.rate[i] * T) as Elements;

  const argPeri = peri - node;
  const M = norm180(L - peri) * DEG;

  // Solve Kepler's equation E - e sin E = M.
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }

  const xo = a * (Math.cos(E) - e);
  const yo = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const w = argPeri * DEG, O = node * DEG, inc = I * DEG;
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(inc), si = Math.sin(inc);

  const x = (cw * cO - sw * sO * ci) * xo + (-sw * cO - cw * sO * ci) * yo;
  const y = (cw * sO + sw * cO * ci) * xo + (-sw * sO + cw * cO * ci) * yo;
  const z = sw * si * xo + cw * si * yo;

  let lon = Math.atan2(y, x);
  if (lon < 0) lon += Math.PI * 2;
  return { x, y, z, r: Math.hypot(x, y, z), lon };
}
