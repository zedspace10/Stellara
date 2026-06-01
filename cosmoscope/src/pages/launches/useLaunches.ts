import { useEffect, useState } from "react";
import { transformLaunch, type Launch, type RawLaunch } from "./types";

const CACHE_KEY = "stellara_launches_v2";
const CACHE_TS_KEY = "stellara_launches_ts_v2";
const CACHE_TTL = 30 * 60 * 1000; // 30 min

const UPCOMING_URL =
  "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?format=json&limit=20&ordering=net";
const PREVIOUS_URL =
  "https://ll.thespacedevs.com/2.2.0/launch/previous/?format=json&limit=20&ordering=-net";

interface CachedShape {
  upcoming: Launch[];
  previous: Launch[];
  ts: number;
}

function readCache(): CachedShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) ?? "0", 10);
    if (!raw || !ts) return null;
    const parsed = JSON.parse(raw) as { upcoming: Launch[]; previous: Launch[] };
    const upcoming = parsed.upcoming.map(l => ({ ...l, netDate: new Date(l.net) }));
    const previous = (parsed.previous ?? []).map(l => ({ ...l, netDate: new Date(l.net) }));
    return { upcoming, previous, ts };
  } catch { return null; }
}

function writeCache(upcoming: Launch[], previous: Launch[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ upcoming, previous }));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
  } catch { /* quota */ }
}

async function fetchLaunches(url: string, signal: AbortSignal): Promise<Launch[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limited — please try again in a few minutes");
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json() as { results?: RawLaunch[] };
  return (json.results ?? []).map(transformLaunch);
}

export interface LaunchesState {
  upcoming: Launch[];
  previous: Launch[];
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  cacheDate: Date | null;
}

export function useLaunches(): LaunchesState {
  const [state, setState] = useState<LaunchesState>({
    upcoming: [], previous: [], loading: true, error: null, fromCache: false, cacheDate: null,
  });

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setState({
        upcoming: cached.upcoming, previous: cached.previous,
        loading: false, error: null, fromCache: true, cacheDate: new Date(cached.ts),
      });
      return;
    }
    if (cached) {
      setState(s => ({
        ...s, upcoming: cached.upcoming, previous: cached.previous,
        fromCache: true, cacheDate: new Date(cached.ts),
      }));
    }

    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const [upcoming, previous] = await Promise.all([
          fetchLaunches(UPCOMING_URL, controller.signal),
          fetchLaunches(PREVIOUS_URL, controller.signal),
        ]);
        if (cancelled) return;
        writeCache(upcoming, previous);
        setState({
          upcoming, previous,
          loading: false, error: null, fromCache: false, cacheDate: new Date(),
        });
      } catch (e) {
        if (cancelled || (e as Error).name === "AbortError") return;
        if (cached) {
          setState({
            upcoming: cached.upcoming, previous: cached.previous,
            loading: false, error: "Using cached data — live fetch unavailable",
            fromCache: true, cacheDate: new Date(cached.ts),
          });
        } else {
          setState({
            upcoming: [], previous: [], loading: false,
            error: (e as Error).message || "Unable to load launches",
            fromCache: false, cacheDate: null,
          });
        }
      }
    })();

    return () => { cancelled = true; controller.abort(); };
  }, []);

  return state;
}
