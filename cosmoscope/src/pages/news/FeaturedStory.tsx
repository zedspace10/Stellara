import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Share2, ExternalLink } from "lucide-react";
import { formatRelativeTime, getSourceStyle, type NewsArticle } from "./types";

interface Props {
  article: NewsArticle;
  isSaved: boolean;
  onToggleSave: (a: NewsArticle) => void;
}

export function FeaturedStory({ article, isSaved, onToggleSave }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const ss = getSourceStyle(article.newsSite);

  const onShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: article.title, text: article.title + " — via STELLARA", url: article.url });
      else await navigator.clipboard.writeText(article.url);
    } catch { /* cancelled */ }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden rounded-2xl group"
      style={{ background: "#0a0a18", border: "1px solid rgba(79,195,247,0.18)", aspectRatio: "16/8" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {article.imageUrl && !imgFailed ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="eager"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{
            background: "radial-gradient(ellipse at 30% 20%, rgba(79,195,247,0.18), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(156,39,176,0.15), transparent 60%), #0a0a18"
          }} />
        )}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(2,2,9,0.3) 0%, rgba(2,2,9,0.6) 50%, rgba(2,2,9,0.95) 100%)"
        }} />
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-[0.25em] px-2 py-0.5 rounded font-medium"
            style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
            {article.newsSite}
          </span>
          <span className="text-[10px] text-white/40">·</span>
          <span className="text-[10px] text-white/55">{formatRelativeTime(article.publishedDate)}</span>
          <span className="ml-auto text-[10px] tracking-[0.3em] uppercase text-[#ffd54f]/70 font-['Orbitron']">
            Featured
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl text-white font-['Orbitron'] font-medium leading-tight mb-2 line-clamp-2">
          {article.title}
        </h2>
        <p className="text-sm text-white/65 leading-relaxed line-clamp-2 max-w-3xl">
          {article.summary}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#4fc3f7] group-hover:text-white transition-colors">
          Read full story
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Stretched link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={article.title}
        className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 ring-[#4fc3f7]"
      />

      {/* Action buttons above the link */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button
          type="button"
          onClick={() => onToggleSave(article)}
          aria-label={isSaved ? "Remove bookmark" : "Save for later"}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <Bookmark className="w-4 h-4"
            style={{ color: isSaved ? "#ffd54f" : "rgba(255,255,255,0.75)", fill: isSaved ? "#ffd54f" : "none" }} />
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share article"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/75 hover:text-white"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.article>
  );
}
