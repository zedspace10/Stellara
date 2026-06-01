export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  newsSite: string;
  publishedAt: string;
  publishedDate: Date;
  featured: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawArticle = any;

export function transformArticle(raw: RawArticle): NewsArticle {
  const published = raw.published_at ?? raw.publishedAt ?? new Date().toISOString();
  return {
    id: String(raw.id ?? raw.url ?? Math.random()),
    title: raw.title ?? "Untitled",
    summary: raw.summary ?? "",
    url: raw.url ?? "#",
    imageUrl: raw.image_url ?? raw.imageUrl ?? null,
    newsSite: raw.news_site ?? raw.newsSite ?? "Unknown",
    publishedAt: published,
    publishedDate: new Date(published),
    featured: Boolean(raw.featured),
  };
}

export interface SourceStyle {
  bg: string;
  text: string;
  border: string;
}

export function getSourceStyle(name: string): SourceStyle {
  const n = name.toLowerCase();
  if (n.includes("nasa") && !n.includes("jpl")) return { bg: "rgba(11,61,145,0.18)", text: "#90caf9", border: "rgba(11,61,145,0.55)" };
  if (n.includes("esa")) return { bg: "rgba(255,215,0,0.12)", text: "#ffd54f", border: "rgba(255,215,0,0.45)" };
  if (n.includes("spacex")) return { bg: "rgba(255,255,255,0.08)", text: "#ffffff", border: "rgba(255,255,255,0.35)" };
  if (n.includes("jpl")) return { bg: "rgba(204,0,0,0.15)", text: "#ef9a9a", border: "rgba(204,0,0,0.5)" };
  if (n.includes("hubble")) return { bg: "rgba(156,39,176,0.15)", text: "#ce93d8", border: "rgba(156,39,176,0.45)" };
  if (n.includes("webb")) return { bg: "rgba(255,143,0,0.13)", text: "#ffb74d", border: "rgba(255,143,0,0.45)" };
  if (n.includes("spaceflight now")) return { bg: "rgba(38,198,218,0.12)", text: "#4dd0e1", border: "rgba(38,198,218,0.45)" };
  if (n.includes("space.com") || n.includes("spacenews")) return { bg: "rgba(102,187,106,0.12)", text: "#a5d6a7", border: "rgba(102,187,106,0.4)" };
  return { bg: "rgba(79,195,247,0.1)", text: "#4fc3f7", border: "rgba(79,195,247,0.35)" };
}

export function formatRelativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: days > 365 ? "numeric" : undefined });
}

export function estimateReadTime(summary: string): string {
  // Rough heuristic — full articles avg ~500 words, summary suggests longer
  const baseWords = Math.max(300, summary.split(/\s+/).length * 5);
  const mins = Math.max(1, Math.round(baseWords / 220));
  return `${mins} min read`;
}

// Auto-tag categories from title + summary
export type Category =
  | "Planets" | "Stars" | "Galaxies" | "Black Holes"
  | "Missions" | "Launches" | "Telescopes" | "Life";

const CAT_KEYWORDS: Record<Category, RegExp> = {
  "Planets":     /\b(planet|exoplanet|mars|venus|jupiter|saturn|mercury|uranus|neptune|pluto|kepler-|trappist)/i,
  "Stars":       /\b(star|stellar|supernova|pulsar|nebula|sun|solar flare|red giant|white dwarf)/i,
  "Galaxies":    /\b(galaxy|galaxies|milky way|andromeda|quasar|cluster)/i,
  "Black Holes": /\b(black hole|event horizon|singularity|gravitational wave)/i,
  "Missions":    /\b(mission|rover|orbiter|probe|spacecraft|astronaut|crew|iss|space station)/i,
  "Launches":    /\b(launch|liftoff|rocket|falcon|atlas|ariane|starship|electron|soyuz|delta)/i,
  "Telescopes":  /\b(telescope|hubble|webb|jwst|observatory|chandra|spitzer)/i,
  "Life":        /\b(life|biosignature|habitable|astrobiology|water|methane|organic|alien)/i,
};

export function getCategories(article: NewsArticle): Category[] {
  const text = `${article.title} ${article.summary}`;
  const cats: Category[] = [];
  for (const [cat, re] of Object.entries(CAT_KEYWORDS) as [Category, RegExp][]) {
    if (re.test(text)) cats.push(cat);
  }
  return cats;
}
