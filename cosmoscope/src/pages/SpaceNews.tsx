import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Newspaper, RefreshCw } from "lucide-react";
import { useNews, useDebounced } from "./news/useNews";
import { useBookmarks } from "./news/useBookmarks";
import { NewsCard } from "./news/NewsCard";
import { FeaturedStory } from "./news/FeaturedStory";
import { NewsFilters } from "./news/NewsFilters";

function OrbitLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(79,195,247,0.25)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ background: "#ffd54f", boxShadow: "0 0 10px #ffd54f" }} />
        </motion.div>
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{ border: "1px solid rgba(156,39,176,0.25)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: "#4fc3f7", boxShadow: "0 0 8px #4fc3f7" }} />
        </motion.div>
      </div>
      <div className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-['Orbitron']">{label}</div>
    </div>
  );
}

export default function SpaceNews() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 400);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "saved">("all");

  const { articles, loading, loadingMore, error, hasMore, fromCache, fromFallback, cacheDate, loadMore, refresh }
    = useNews({ search });
  const { saved, isSaved, toggle } = useBookmarks();

  // Filter by source client-side
  const displayed = useMemo(() => {
    let list = viewMode === "saved" ? saved : articles;
    if (selectedSources.length > 0) {
      const lower = selectedSources.map(s => s.toLowerCase());
      list = list.filter(a => lower.some(s => a.newsSite.toLowerCase().includes(s)));
    }
    return list;
  }, [articles, saved, selectedSources, viewMode]);

  // Featured = first featured article in the visible list, else first
  const featured = useMemo(() => {
    const f = displayed.find(a => a.featured) ?? displayed[0];
    return f ?? null;
  }, [displayed]);
  const rest = useMemo(() => displayed.filter(a => a.id !== featured?.id), [displayed, featured]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (viewMode === "saved") return; // no pagination for saved
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, viewMode]);

  const toggleSource = (s: string) =>
    setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const isInitialLoad = loading && articles.length === 0 && viewMode === "all";
  const isEmpty = !loading && displayed.length === 0;

  return (
    <div className="relative w-full min-h-screen bg-[#020209] flex flex-col"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(2,2,9,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(79,195,247,0.1)" }}>
        <Link href="/" className="flex items-center gap-2 text-[#4fc3f7] hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> STELLARA
        </Link>
        <div className="text-center">
          <div className="text-xs font-['Orbitron'] text-white/70 tracking-[0.15em]">SPACE NEWS</div>
          {fromCache && cacheDate && !fromFallback && (
            <div className="text-[9px] text-white/25">Updated · {cacheDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh news"
          className="p-2 rounded-lg text-white/40 hover:text-[#4fc3f7] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 pt-4 max-w-7xl mx-auto w-full">
        <NewsFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          selectedSources={selectedSources}
          onToggleSource={toggleSource}
          showSavedTab={saved.length > 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          savedCount={saved.length}
        />
      </div>

      {/* Error notice (non-blocking) */}
      {error && displayed.length > 0 && (
        <div className="mx-4 sm:mx-6 mt-3 px-3 py-2 text-[11px] text-[#ffd54f]/70 rounded-lg max-w-7xl w-full sm:mx-auto"
          style={{ background: "rgba(255,213,79,0.05)", border: "1px solid rgba(255,213,79,0.15)" }}>
          {error}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
        {isInitialLoad ? (
          <OrbitLoader label="Pulling the latest from across space…" />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="w-8 h-8 text-white/15 mb-3" />
            <div className="text-sm text-white/50">
              {viewMode === "saved"
                ? "No saved stories yet — tap the bookmark icon to save articles."
                : "No stories match your filters."}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured */}
            {featured && (
              <FeaturedStory article={featured} isSaved={isSaved(featured.id)} onToggleSave={toggle} />
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {rest.map((a, i) => (
                  <NewsCard
                    key={a.id}
                    article={a}
                    isSaved={isSaved(a.id)}
                    onToggleSave={toggle}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Sentinel + load more */}
            {viewMode === "all" && hasMore && !fromFallback && (
              <div ref={sentinelRef} className="flex justify-center pt-4">
                {loadingMore
                  ? <OrbitLoader label="Loading more…" />
                  : <button onClick={loadMore} className="text-xs text-white/40 hover:text-[#4fc3f7] transition-colors">Load more</button>}
              </div>
            )}

            {!hasMore && articles.length > 0 && viewMode === "all" && (
              <div className="text-center text-[10px] text-white/25 pt-2">You've reached the end of the feed.</div>
            )}

            {/* Attribution */}
            <div className="text-center pt-6 pb-4 text-[10px] text-white/25">
              News sourced from NASA, ESA, SpaceX, JPL, Hubble, JWST and other space agencies · via Spaceflight News API
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
