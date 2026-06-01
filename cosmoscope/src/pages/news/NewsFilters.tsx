import { Search, X } from "lucide-react";

const SOURCES = ["NASA", "ESA", "SpaceX", "JPL", "Hubble", "Webb"];

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  selectedSources: string[];
  onToggleSource: (s: string) => void;
  showSavedTab: boolean;
  viewMode: "all" | "saved";
  onViewModeChange: (m: "all" | "saved") => void;
  savedCount: number;
}

export function NewsFilters({
  search, onSearchChange,
  selectedSources, onToggleSource,
  showSavedTab, viewMode, onViewModeChange, savedCount,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search news articles"
          className="w-full pl-8 pr-10 py-2 text-sm text-white/80 placeholder-white/25 rounded-lg outline-none focus:border-[#4fc3f7]/40"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Source pills + saved tab */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {showSavedTab && (
          <>
            <button
              type="button"
              onClick={() => onViewModeChange("all")}
              className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors"
              style={{
                background: viewMode === "all" ? "rgba(79,195,247,0.15)" : "rgba(255,255,255,0.03)",
                color: viewMode === "all" ? "#4fc3f7" : "rgba(255,255,255,0.45)",
                border: `1px solid ${viewMode === "all" ? "rgba(79,195,247,0.4)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("saved")}
              className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors"
              style={{
                background: viewMode === "saved" ? "rgba(255,213,79,0.15)" : "rgba(255,255,255,0.03)",
                color: viewMode === "saved" ? "#ffd54f" : "rgba(255,255,255,0.45)",
                border: `1px solid ${viewMode === "saved" ? "rgba(255,213,79,0.45)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              Saved · {savedCount}
            </button>
            <div className="h-3 w-px bg-white/10 mx-1" />
          </>
        )}
        {SOURCES.map(src => {
          const active = selectedSources.includes(src);
          return (
            <button
              key={src}
              type="button"
              onClick={() => onToggleSource(src)}
              aria-pressed={active}
              className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full transition-all"
              style={{
                background: active ? "rgba(255,213,79,0.12)" : "rgba(255,255,255,0.03)",
                color: active ? "#ffd54f" : "rgba(255,255,255,0.45)",
                border: `1px solid ${active ? "rgba(255,213,79,0.45)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: active ? "0 0 12px rgba(255,213,79,0.2)" : "none",
              }}
            >
              {src}
            </button>
          );
        })}
      </div>
    </div>
  );
}
