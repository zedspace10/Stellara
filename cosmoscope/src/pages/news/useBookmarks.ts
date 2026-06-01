import { useCallback, useEffect, useState } from "react";
import type { NewsArticle } from "./types";

const KEY = "stellara_news_bookmarks_v1";

function read(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NewsArticle[];
    return parsed.map(a => ({ ...a, publishedDate: new Date(a.publishedAt) }));
  } catch { return []; }
}

function write(list: NewsArticle[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* quota */ }
}

export function useBookmarks() {
  const [saved, setSaved] = useState<NewsArticle[]>(() => read());

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSaved(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some(s => s.id === id),
    [saved]
  );

  const toggle = useCallback((a: NewsArticle) => {
    setSaved(prev => {
      const next = prev.some(p => p.id === a.id)
        ? prev.filter(p => p.id !== a.id)
        : [a, ...prev];
      write(next);
      return next;
    });
  }, []);

  return { saved, isSaved, toggle };
}
