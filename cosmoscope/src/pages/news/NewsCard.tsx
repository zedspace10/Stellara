import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Share2, ExternalLink, Rocket, Sparkles, Globe } from "lucide-react";
import {
  estimateReadTime,
  formatRelativeTime,
  getCategories,
  getSourceStyle,
  type NewsArticle,
} from "./types";

interface Props {
  article: NewsArticle;
  isSaved: boolean;
  onToggleSave: (a: NewsArticle) => void;
  index?: number;
}

function FallbackIcon({ cats }: { cats: string[] }) {
  let Icon: typeof Rocket = Sparkles;
  if (cats.includes("Launches")) Icon = Rocket;
  else if (cats.includes("Planets")) Icon = Globe;
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, rgba(79,195,247,0.15), transparent 70%), #0a0a18" }}>
      <Icon className="w-10 h-10 text-white/15" />
    </div>
  );
}

export function NewsCard({ article, isSaved, onToggleSave, index = 0 }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const sourceStyle = getSourceStyle(article.newsSite);
  const cats = getCategories(article);

  const onShare = async () => {
    const data = { title: article.title, text: `${article.title} — via STELLARA`, url: article.url };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(article.url);
    } catch { /* user cancelled */ }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
      className="group relative rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9", background: "#0a0a18" }}>
        {article.imageUrl && !imgFailed ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <FallbackIcon cats={cats} />
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
            style={{ background: sourceStyle.bg, color: sourceStyle.text, border: `1px solid ${sourceStyle.border}` }}>
            {article.newsSite}
          </span>
          <span className="text-[10px] text-white/35">·</span>
          <span className="text-[10px] text-white/45">{formatRelativeTime(article.publishedDate)}</span>
        </div>

        <h3 className="text-sm text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-[#4fc3f7] transition-colors">
          {article.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-white/30">{estimateReadTime(article.summary)}</span>
          <ExternalLink className="w-3 h-3 text-white/25 group-hover:text-[#4fc3f7] transition-colors" />
        </div>
      </div>

      {/* Stretched link covers the whole card — must come AFTER siblings so it
          sits on top of content but BELOW absolutely-positioned z-10 buttons */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={article.title}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 ring-[#4fc3f7]"
      />

      {/* Action buttons — sit above the link via z-10 */}
      <div className="absolute top-2 right-2 z-10 flex gap-1.5">
        <button
          type="button"
          onClick={() => onToggleSave(article)}
          aria-label={isSaved ? "Remove bookmark" : "Save for later"}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <Bookmark className="w-3.5 h-3.5"
            style={{ color: isSaved ? "#ffd54f" : "rgba(255,255,255,0.7)", fill: isSaved ? "#ffd54f" : "none" }} />
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share article"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.article>
  );
}
