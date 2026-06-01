import { useState, useEffect, useMemo } from "react";
import type { ExoplanetData, Filters, SortMode } from "./types";
import { transformPlanet } from "./utils";
import { FALLBACK_PLANETS } from "./fallbackPlanets";

const CACHE_KEY = "stellara_exoplanets_v4";
const CACHE_TS_KEY = "stellara_exoplanets_ts_v4";
const CACHE_TTL = 24 * 60 * 60 * 1000;

const COLS = [
  "pl_name", "hostname", "discoverymethod", "disc_year",
  "pl_orbper", "pl_rade", "pl_bmasse", "pl_eqt",
  "sy_dist", "sy_pnum", "sy_snum", "st_spectype", "ra", "dec",
].join(",");

const NASA_URL =
  `https://exoplanetarchive.ipac.caltech.edu/TAP/sync` +
  `?QUERY=${encodeURIComponent(`select ${COLS} from pscomppars where pl_controv_flag=0`)}` +
  `&FORMAT=json`;

const PROXY_A = `https://corsproxy.io/?url=${encodeURIComponent(NASA_URL)}`;
const PROXY_B = `https://api.allorigins.win/raw?url=${encodeURIComponent(NASA_URL)}`;

function readCache(): { data: ExoplanetData[]; ts: number } | null {
  try {
    const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) ?? "0", 10);
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw || !ts) return null;
    return { data: JSON.parse(raw) as ExoplanetData[], ts };
  } catch {
    return null;
  }
}

function writeCache(data: ExoplanetData[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
  } catch {
    // localStorage quota exceeded — ignore
  }
}

async function fetchUrl(url: string, signal: AbortSignal): Promise<ExoplanetData[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await res.json() as any[];
  if (!Array.isArray(raw) || raw.length === 0) throw new Error("Empty response");
  return raw.map(transformPlanet);
}

export interface ExoplanetsState {
  planets: ExoplanetData[];
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  fromFallback: boolean;
  cacheDate: Date | null;
  progress: number;
  statusMsg: string;
}

const LOADING_MSGS = [
  "Connecting to NASA Exoplanet Archive…",
  "Scanning confirmed worlds…",
  "Loading 5,500+ planets…",
  "Preparing your galaxy…",
];

export function useExoplanets(): ExoplanetsState {
  const [state, setState] = useState<ExoplanetsState>({
    planets: [],
    loading: true,
    error: null,
    fromCache: false,
    fromFallback: false,
    cacheDate: null,
    progress: 0,
    statusMsg: LOADING_MSGS[0],
  });

  useEffect(() => {
    // 1. Try fresh cache
    const cached = readCache();
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setState({
        planets: cached.data,
        loading: false,
        error: null,
        fromCache: true,
        fromFallback: false,
        cacheDate: new Date(cached.ts),
        progress: 100,
        statusMsg: "",
      });
      return;
    }

    // Show stale data while we fetch
    if (cached) {
      setState(s => ({
        ...s,
        planets: cached.data,
        fromCache: true,
        cacheDate: new Date(cached.ts),
        progress: 10,
        statusMsg: LOADING_MSGS[0],
      }));
    }

    let cancelled = false;
    const controller = new AbortController();
    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      if (!cancelled) setState(s => ({ ...s, statusMsg: LOADING_MSGS[msgIdx] }));
    }, 2000);

    (async () => {
      setState(s => ({ ...s, loading: true, progress: 15, statusMsg: LOADING_MSGS[0] }));

      // 2. Try Proxy A
      try {
        setState(s => ({ ...s, progress: 25, statusMsg: LOADING_MSGS[1] }));
        const planets = await fetchUrl(PROXY_A, controller.signal);
        if (cancelled) return;
        clearInterval(msgTimer);
        writeCache(planets);
        setState({ planets, loading: false, error: null, fromCache: false, fromFallback: false, cacheDate: new Date(), progress: 100, statusMsg: "" });
        return;
      } catch (e) {
        if (cancelled) return;
        if ((e as Error).name === "AbortError") return;
      }

      // 3. Try Proxy B
      try {
        setState(s => ({ ...s, progress: 55, statusMsg: LOADING_MSGS[2] }));
        const planets = await fetchUrl(PROXY_B, controller.signal);
        if (cancelled) return;
        clearInterval(msgTimer);
        writeCache(planets);
        setState({ planets, loading: false, error: null, fromCache: false, fromFallback: false, cacheDate: new Date(), progress: 100, statusMsg: "" });
        return;
      } catch (e) {
        if (cancelled) return;
        if ((e as Error).name === "AbortError") return;
      }

      clearInterval(msgTimer);
      if (cancelled) return;

      // 4. Use stale cache
      if (cached) {
        setState({
          planets: cached.data,
          loading: false,
          error: "Using cached data — live fetch unavailable",
          fromCache: true,
          fromFallback: false,
          cacheDate: new Date(cached.ts),
          progress: 100,
          statusMsg: "",
        });
        return;
      }

      // 5. Hardcoded fallback — always show something
      const fallback = FALLBACK_PLANETS.map(transformPlanet);
      setState({
        planets: fallback,
        loading: false,
        error: "Showing featured worlds — full dataset unavailable",
        fromCache: false,
        fromFallback: true,
        cacheDate: null,
        progress: 100,
        statusMsg: "",
      });
    })();

    return () => {
      cancelled = true;
      clearInterval(msgTimer);
      controller.abort();
    };
  }, []);

  return state;
}

function sortPlanets(planets: ExoplanetData[], sort: SortMode): ExoplanetData[] {
  const arr = [...planets];
  switch (sort) {
    case "earth-like": return arr.sort((a, b) => b.esi - a.esi);
    case "closest":    return arr.sort((a, b) => (a.distanceLY ?? 1e9) - (b.distanceLY ?? 1e9));
    case "largest":    return arr.sort((a, b) => (b.radius ?? 0) - (a.radius ?? 0));
    case "smallest":   return arr.sort((a, b) => (a.radius ?? 1e9) - (b.radius ?? 1e9));
    case "hottest":    return arr.sort((a, b) => (b.temp ?? 0) - (a.temp ?? 0));
    case "coolest":    return arr.sort((a, b) => (a.temp ?? 1e9) - (b.temp ?? 1e9));
    case "recent":     return arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "oldest":     return arr.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    default:           return arr;
  }
}

export function useFilteredPlanets(
  planets: ExoplanetData[],
  filters: Filters
): ExoplanetData[] {
  return useMemo(() => {
    let out = planets;
    const q = filters.search.trim().toLowerCase();
    if (q) {
      out = out.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.starName.toLowerCase().includes(q)
      );
    }
    if (filters.type !== "all") {
      out = out.filter(p => p.planetType === filters.type);
    }
    if (filters.habitability === "hz") {
      out = out.filter(p => p.inHabitableZone);
    } else if (filters.habitability === "potentially") {
      out = out.filter(p => p.potentiallyHabitable);
    } else if (filters.habitability === "earth-like") {
      out = out.filter(p => p.esi >= 0.6);
    }
    if (filters.method !== "all") {
      out = out.filter(p => p.method === filters.method);
    }
    if (filters.maxDistanceLY < 10000) {
      out = out.filter(p => p.distanceLY == null || p.distanceLY <= filters.maxDistanceLY);
    }
    out = out.filter(p => {
      if (p.year == null) return true;
      return p.year >= filters.yearMin && p.year <= filters.yearMax;
    });
    return sortPlanets(out, filters.sort);
  }, [planets, filters]);
}
