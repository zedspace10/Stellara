import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Clock, Calendar, Search, Tag } from "lucide-react";
import { articles } from "@/data/articles";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory ? article.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    document.title = "Blog — STELLARA";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold font-['Orbitron'] text-white">Cosmic <span className="text-primary">Journal</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discoveries, deep dives, and discussions from the edge of the known universe.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              type="search" 
              placeholder="Search articles..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={activeCategory === null ? "default" : "outline"} 
              className={`cursor-pointer ${activeCategory === null ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10'}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </Badge>
            {categories.map(cat => (
              <Badge 
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"} 
                className={`cursor-pointer ${activeCategory === cat ? 'bg-secondary text-secondary-foreground' : 'hover:bg-white/10'}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/blog/${article.slug}`}>
                    <Card className="h-full bg-card/40 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,195,247,0.15)] overflow-hidden cursor-pointer group">
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                        <img 
                          src={article.coverImageUrl} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <Badge className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md border-white/20 text-white">
                          {article.category}
                        </Badge>
                      </div>
                      <CardHeader>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                          {article.excerpt}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-white/5 pt-4 text-xs text-muted-foreground flex justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
