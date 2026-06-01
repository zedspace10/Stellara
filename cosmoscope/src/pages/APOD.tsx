import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export default function APOD() {
  const [data, setData] = useState<ApodData | null>(null);
  const [archive, setArchive] = useState<ApodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApod = async (date?: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const targetDate = date || today;
      const cacheKey = `apod_${targetDate}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 1000 * 60 * 60) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }

      const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY${date ? `&date=${date}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("NASA API rate limit exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch Astronomy Picture of the Day");
      }
      
      const json = await res.json();
      setData(json);
      localStorage.setItem(cacheKey, JSON.stringify({ data: json, timestamp: Date.now() }));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "APOD — STELLARA";
    fetchApod();

    // Fetch archive (past 7 days)
    const fetchArchive = async () => {
      setLoadingArchive(true);
      try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const endStr = endDate.toISOString().split("T")[0];
        const startStr = startDate.toISOString().split("T")[0];
        
        const cacheKey = `apod_archive_${startStr}_${endStr}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 60) {
            setArchive(parsed.data);
            setLoadingArchive(false);
            return;
          }
        }

        const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startStr}&end_date=${endStr}`);
        if (res.ok) {
          const json = await res.json();
          // reverse to show newest first
          const sorted = json.reverse();
          setArchive(sorted);
          localStorage.setItem(cacheKey, JSON.stringify({ data: sorted, timestamp: Date.now() }));
        }
      } catch (e) {
        console.error("Archive fetch failed", e);
      } finally {
        setLoadingArchive(false);
      }
    };

    fetchArchive();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Astronomy Picture of the Day</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">NASA's Daily Cosmos</h1>
          <p className="text-muted-foreground text-lg">A different astronomy and space science image featured each day.</p>
        </div>

        {error && (
          <Card className="p-8 text-center bg-red-950/20 border-red-500/50">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {loading && !error && (
          <div className="space-y-6">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-16">
            <div className="w-full lg:w-2/3">
              <Card className="overflow-hidden border-white/10 bg-black/50 shadow-2xl">
                {data.media_type === "video" ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={data.url}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={data.title}
                    />
                  </div>
                ) : (
                  <a href={data.hdurl || data.url} target="_blank" rel="noreferrer" className="block relative group">
                    <img 
                      src={data.url} 
                      alt={data.title} 
                      className="w-full object-contain max-h-[70vh] bg-black" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                        <ImageIcon className="w-4 h-4" />
                        <span>View High Resolution</span>
                      </div>
                    </div>
                  </a>
                )}
              </Card>
            </div>

            <div className="w-full lg:w-1/3 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{data.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {data.date}
                  </span>
                  {data.copyright && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">© {data.copyright}</span>
                  )}
                </div>
              </div>
              
              <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-gray-300 max-w-none">
                <p>{data.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Archive Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h3 className="text-2xl font-bold text-white font-['Orbitron'] mb-6">Recent Archives</h3>
          {loadingArchive ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : archive.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {archive.map((item) => (
                <div 
                  key={item.date} 
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-white/10 aspect-square bg-black/50 hover:border-primary/50 transition-colors"
                  onClick={() => fetchApod(item.date)}
                >
                  {item.media_type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-xs text-muted-foreground">Video</span>
                    </div>
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium line-clamp-2">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent archives found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
