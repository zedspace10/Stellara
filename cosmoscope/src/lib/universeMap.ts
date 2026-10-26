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
