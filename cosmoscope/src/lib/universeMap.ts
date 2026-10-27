import * as THREE from "three";

// Where real things go in the universe view.
//
// Distances are squeezed so that our neighbourhood and the great clusters fit in one view: a
// galaxy twice as far away sits about 1.4 times further out. Directions are real, in galactic
// coordinates, so the Milky Way's own disc lies flat and its dust hides galaxies near that plane,
// as it does in the real sky.

/** Scene units from home for a distance in millions of light years. Andromeda sits at 9,000. */
export function universeR(mly: number) {
  return 9000 * Math.pow(Math.max(mly, 0.01) / 2.5, 0.45);
}

/** Galactic longitude and latitude in degrees, and distance in millions of light years, to the scene. */
export function galacticToScene(l: number, b: number, mly: number) {
  const R = universeR(mly);
  const lr = (l * Math.PI) / 180, br = (b * Math.PI) / 180;
  return new THREE.Vector3(R * Math.cos(br) * Math.cos(lr), R * Math.sin(br), R * Math.cos(br) * Math.sin(lr));
}

/** How much brighter than the Sun, from absolute visual magnitude, in plain words. */
export function timesSun(mv: number) {
  const L = Math.pow(10, (4.83 - mv) / 2.5);
  if (L >= 1e9) return `about ${Math.round(L / 1e9).toLocaleString("en-GB")} billion times as bright as the Sun`;
  if (L >= 1e6) return `about ${Math.round(L / 1e6).toLocaleString("en-GB")} million times as bright as the Sun`;
  return `about ${Math.round(L).toLocaleString("en-GB")} times as bright as the Sun`;
}

// Real places beyond our neighbourhood, for the landmarks.
export const FAR_LANDMARKS: Record<string, { l: number; b: number; mly: number }> = {
  "virgo-cluster": { l: 283.78, b: 74.49, mly: 54 },
  "perseus-cluster": { l: 150.57, b: -13.26, mly: 240 },
  "great-attractor": { l: 307, b: 9, mly: 250 },
  "coma-cluster": { l: 58.08, b: 87.96, mly: 321 },
};

/** Right ascension (hours) and declination (degrees) to galactic longitude and latitude (degrees). */
export function equatorialToGalactic(raHours: number, decDeg: number) {
  const T = [
    [-0.0548755604, -0.8734370902, -0.4838350155],
    [0.4941094279, -0.4448296300, 0.7469822445],
    [-0.8676661490, -0.1980763734, 0.4559837762],
  ];
  const a = (raHours * 15 * Math.PI) / 180, d = (decDeg * Math.PI) / 180;
  const v = [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  const g = T.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  const l = ((Math.atan2(g[1], g[0]) * 180) / Math.PI + 360) % 360;
  const b = (Math.asin(Math.max(-1, Math.min(1, g[2]))) * 180) / Math.PI;
  return { l, b };
}

/** Where a pin sits in the universe view. Very distant ones are brought in to the edge of the view. */
export function pinScene(raHours: number, decDeg: number, mly: number) {
  const { l, b } = equatorialToGalactic(raHours, decDeg);
  const v = galacticToScene(l, b, mly);
  const MAX = 190000;
  if (v.length() > MAX) v.setLength(MAX);
  return v;
}
