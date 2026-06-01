import React from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { articles } from "@/data/articles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button variant="outline">Return to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse markdown-like content (just simple blockquotes for now)
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-4 border-primary pl-6 py-2 my-8 text-xl italic text-gray-300 bg-white/5 rounded-r-lg">
            {paragraph.replace(/^>\s*/, '')}
          </blockquote>
        );
      }
      if (paragraph.startsWith('###')) {
        return (
          <h3 key={idx} className="text-2xl font-bold text-white mt-10 mb-4 font-['Orbitron']">
            {paragraph.replace(/^###\s*/, '')}
          </h3>
        );
      }
      if (paragraph.trim() === '') return null;
      return (
        <p key={idx} className="mb-6 text-lg leading-relaxed text-gray-300">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="w-full h-[40vh] md:h-[50vh] relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={article.coverImageUrl} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 md:px-8 pb-8 max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white mb-6 -ml-3">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to all articles
            </Button>
          </Link>
          <Badge className="mb-4 bg-primary text-primary-foreground">{article.category}</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-['Orbitron'] leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      <motion.div 
        className="max-w-3xl mx-auto px-4 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-10 pb-10 border-b border-white/10">
            {article.excerpt}
          </p>
          {renderContent(article.content)}
        </div>
      </motion.div>
    </div>
  );
}
