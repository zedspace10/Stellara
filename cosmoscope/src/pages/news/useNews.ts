import { useCallback, useEffect, useRef, useState } from "react";
import { transformArticle, type NewsArticle, type RawArticle } from "./types";
import { FALLBACK_ARTICLES } from "./fallbackArticles";

const CACHE_KEY = "stellara_news_v1";
const CACHE_TS_KEY = "stellara_news_ts_v1";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const PAGE_SIZE = 20;
const BASE = "https://api.spaceflightnewsapi.net/v4/articles/";

interface CachedShape {
  articles: NewsArticle[];
  ts: number;
}

function readCache(): CachedShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) ?? "0", 10);
    if (!raw || !ts) return null;
    const parsed = JSON.parse(raw) as { articles: NewsArticle[] };
    const articles = parsed.articles.map(a => ({ ...a, publishedDate: new Date(a.publishedAt) }));
    return { articles, ts };
  } catch { return null; }
}

function writeCache(articles: NewsArticle[]) {
  try {
    const trimmed = articles.slice(0, 60);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ articles: trimmed }));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
  } catch { /* quota */ }
}

interface FetchParams { search: string; offset: number }

function buildUrl({ search, offset }: FetchParams): string {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    ordering: "-published_at",
  });
  if (search.trim()) params.set("search", search.trim());
  return `${BASE}?${params.toString()}`;
}

async function fetchArticles(p: FetchParams, signal: AbortSignal): Promise<{ articles: NewsArticle[]; hasMore: boolean }> {
  const res = await fetch(buildUrl(p), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { results?: RawArticle[]; next?: string | null };
  const articles = (json.results ?? []).map(transformArticle);
  return { articles, hasMore: Boolean(json.next) };
}

export interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fromCache: boolean;
  fromFallback: boolean;
  cacheDate: Date | null;
  loadMore: () => void;
  refresh: () => void;
}

interface Options { search: string }

export function useNews({ search }: Options): NewsState {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [fromFallback, setFromFallback] = useState(false);
  const [cacheDate, setCacheDate] = useState<Date | null>(null);

  const offsetRef = useRef(0);
  const reqIdRef = useRef(0);
  // Track all in-flight controllers so we can abort on unmount/new request
  const initialAbortRef = useRef<AbortController | null>(null);
  const moreAbortRef = useRef<AbortController | null>(null);

  const doInitialLoad = useCallback(async (s: string) => {
    // Cancel any in-flight requests (both initial and load-more)
    initialAbortRef.current?.abort();
    moreAbortRef.current?.abort();
    moreAbortRef.current = null;

    const myReq = ++reqIdRef.current;
    const controller = new AbortController();
    initialAbortRef.current = controller;

    setLoading(true);
    setError(null);
    setArticles([]);
    setHasMore(true);
    offsetRef.current = 0;

    // Cache only for default (empty search)
    if (!s.trim()) {
      const cached = readCache();
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if (reqIdRef.current !== myReq) return;
        setArticles(cached.articles);
        setFromCache(true);
        setFromFallback(false);
        setCacheDate(new Date(cached.ts));
        setLoading(false);
        offsetRef.current = cached.articles.length;
        return;
      }
      if (cached) {
        setArticles(cached.articles);
        setFromCache(true);
        setCacheDate(new Date(cached.ts));
      }
    }

    try {
      const { articles: fresh, hasMore: more } = await fetchArticles(
        { search: s, offset: 0 }, controller.signal
      );
      if (reqIdRef.current !== myReq) return;
      setArticles(fresh);
      setHasMore(more);
      setFromCache(false);
      setFromFallback(false);
      setCacheDate(new Date());
      offsetRef.current = fresh.length;
      if (!s.trim()) writeCache(fresh);
    } catch (e) {
      if (reqIdRef.current !== myReq) return;
      if ((e as Error).name === "AbortError") return;
      const cached = readCache();
      if (cached && !s.trim()) {
        setArticles(cached.articles);
        setFromCache(true);
        setCacheDate(new Date(cached.ts));
        setError("Showing cached stories — live fetch unavailable");
      } else {
        setArticles(FALLBACK_ARTICLES);
        setFromFallback(true);
        setError("The signal was lost. Showing evergreen space stories.");
        setHasMore(false);
      }
    } finally {
      if (reqIdRef.current === myReq) setLoading(false);
      if (initialAbortRef.current === controller) initialAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    doInitialLoad(search);
    return () => {
      // Aborts whichever requests are currently in flight (next search will
      // also call doInitialLoad, which aborts them itself — this covers
      // unmount).
      initialAbortRef.current?.abort();
      moreAbortRef.current?.abort();
      initialAbortRef.current = null;
      moreAbortRef.current = null;
      reqIdRef.current++; // invalidate any in-flight resolution
    };
  }, [search, doInitialLoad]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    const myReq = reqIdRef.current;
    moreAbortRef.current?.abort();
    const controller = new AbortController();
    moreAbortRef.current = controller;
    setLoadingMore(true);

    (async () => {
      try {
        const { articles: more, hasMore: hm } = await fetchArticles(
          { search, offset: offsetRef.current }, controller.signal
        );
        if (reqIdRef.current !== myReq) return;
        setArticles(prev => {
          const seen = new Set(prev.map(p => p.id));
          return [...prev, ...more.filter(a => !seen.has(a.id))];
        });
        setHasMore(hm);
        offsetRef.current += more.length;
      } catch (e) {
        if (reqIdRef.current !== myReq) return;
        if ((e as Error).name === "AbortError") return;
        setHasMore(false);
      } finally {
        if (reqIdRef.current === myReq) setLoadingMore(false);
        if (moreAbortRef.current === controller) moreAbortRef.current = null;
      }
    })();
  }, [hasMore, loading, loadingMore, search]);

  return {
    articles, loading, loadingMore, error, hasMore,
    fromCache, fromFallback, cacheDate,
    loadMore, refresh: () => doInitialLoad(search),
  };
}

export function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}
