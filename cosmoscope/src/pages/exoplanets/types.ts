export interface RawExoplanet {
  pl_name: string;
  hostname: string;
  discoverymethod: string | null;
  disc_year: number | null;
  pl_orbper: number | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  sy_dist: number | null;
  sy_pnum: number | null;
  sy_snum: number | null;
  st_spectype: string | null;
  ra: number | null;
  dec: number | null;
}

export interface ExoplanetData {
  id: string;
  name: string;
  starName: string;
  method: string;
  year: number | null;
  period: number | null;
  radius: number | null;
  mass: number | null;
  temp: number | null;
  distanceParsecs: number | null;
  distanceLY: number | null;
  numPlanets: number | null;
  numStars: number | null;
  spectralType: string | null;
  ra: number | null;
  dec: number | null;
  planetType: PlanetType;
  esi: number;
  inHabitableZone: boolean;
  potentiallyHabitable: boolean;
}

export type PlanetType =
  | "earth-sized"
  | "super-earth"
  | "mini-neptune"
  | "neptune-like"
  | "gas-giant"
  | "hot-jupiter"
  | "unknown";

export type ViewMode = "gallery" | "skymap" | "comparison";

export type SortMode =
  | "earth-like"
  | "closest"
  | "largest"
  | "smallest"
  | "hottest"
  | "coolest"
  | "recent"
  | "oldest";

export interface Filters {
  search: string;
  type: PlanetType | "all";
  habitability: "all" | "hz" | "potentially" | "earth-like";
  method: string;
  maxDistanceLY: number;
  yearMin: number;
  yearMax: number;
  sort: SortMode;
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "all",
  habitability: "all",
  method: "all",
  maxDistanceLY: 10000,
  yearMin: 1992,
  yearMax: new Date().getFullYear(),
  sort: "earth-like",
};
