import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, Moon, ChevronRight, Newspaper } from "lucide-react";
import { LaunchStrip } from "./discover/LaunchStrip";
import { ThisWeekInSpace } from "./discover/ThisWeekInSpace";
import { useNews } from "./news/useNews";
import { useBookmarks } from "./news/useBookmarks";
import { FeaturedStory } from "./news/FeaturedStory";
import { NewsCard } from "./news/NewsCard";

export default function Discover() {
  const { articles, loading } = useNews({ search: "" });
  const { isSaved, toggle } = useBookmarks();
  const [now] = useState(() => new Date());

  const featured = useMemo(
    () => articles.find(a => a.featured) ?? articles[0] ?? null,
    [articles]
  );
  const top = useMemo(
    () => articles.filter(a => a.id !== featured?.id).slice(0, 8),
    [articles, featured]
  );

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
          <div className="text-xs font-['Orbitron'] text-white/70 tracking-[0.15em]">DISCOVER</div>
          <div className="text-[9px] text-white/25">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="w-16" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6">
        {/* Hero strip — next launch */}
        <LaunchStrip />

        {/* Two-column on tablet+: APOD + Tonight's Sky */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiscoverCard
            href="/apod"
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            label="Astronomy Picture of the Day"
            title="Today's image from the cosmos"
            description="A new image and explanation from a professional astronomer, every single day."
            tint="rgba(156,39,176,0.08)"
            border="rgba(156,39,176,0.25)"
            accent="#ce93d8"
          />
          <DiscoverCard
            href="/tonight"
            icon={<Moon className="w-3.5 h-3.5" />}
            label="Tonight's Sky"
            title="What's visible tonight"
            description="Moon phase, planets, the brightest stars and ISS passes for your location."
            tint="rgba(79,195,247,0.07)"
            border="rgba(79,195,247,0.25)"
            accent="#4fc3f7"
          />
        </div>

        {/* This Week in Space History */}
        <ThisWeekInSpace />

        {/* News section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Newspaper className="w-3 h-3 text-white/45" />
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 font-['Orbitron']">
              Latest space news
            </div>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.1), transparent)" }} />
            <Link href="/news" className="text-[10px] text-[#4fc3f7]/80 hover:text-[#4fc3f7] inline-flex items-center gap-0.5">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {loading && articles.length === 0 ? (
            <div className="rounded-xl p-6 text-center text-xs text-white/30"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              Pulling the latest from across space…
            </div>
          ) : featured ? (
            <div className="space-y-4">
              <FeaturedStory article={featured} isSaved={isSaved(featured.id)} onToggleSave={toggle} />
              {top.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {top.map((a, i) => (
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
            </div>
          ) : null}
        </section>

        {/* Footer attribution */}
        <div className="text-center pt-6 pb-8 text-[10px] text-white/25 space-y-1">
          <div>Launch data provided by The Space Devs · News sourced from NASA, ESA, SpaceX, JPL and other space agencies</div>
        </div>
      </div>
    </div>
  );
}

interface DiscoverCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  tint: string;
  border: string;
  accent: string;
}

function DiscoverCard({ href, icon, label, title, description, tint, border, accent }: DiscoverCardProps) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 h-full transition-all hover:-translate-y-0.5"
        style={{ background: tint, border: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: accent }}>{icon}</span>
          <div className="text-[10px] uppercase tracking-[0.25em] font-['Orbitron']" style={{ color: accent }}>
            {label}
          </div>
        </div>
        <div className="text-base text-white mb-1 group-hover:text-white">{title}</div>
        <p className="text-xs text-white/55 leading-relaxed">{description}</p>
        <div className="mt-3 inline-flex items-center gap-0.5 text-[11px] group-hover:gap-1.5 transition-all" style={{ color: accent }}>
          Open <ChevronRight className="w-3 h-3" />
        </div>
      </motion.div>
    </Link>
  );
}
