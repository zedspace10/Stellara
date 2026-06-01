import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Zap, Circle, MapPin, Eye, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OurGalaxy() {
  useEffect(() => {
    document.title = "Our Galaxy — STELLARA";
  }, []);

  const notableObjects = [
    { name: "Sagittarius A*", type: "Supermassive Black Hole", description: "4 million solar masses, 26,000 light years away. The invisible engine at our galaxy's heart.", icon: <Circle className="w-6 h-6" /> },
    { name: "Eagle Nebula", type: "Stellar Nursery", description: "The Pillars of Creation, 7,000 light years away, where new stars are being born from vast clouds of gas and dust.", icon: <Zap className="w-6 h-6" /> },
    { name: "Omega Centauri", type: "Globular Cluster", description: "The largest globular cluster in the Milky Way, containing 10 million ancient stars 17,000 light years away.", icon: <Star className="w-6 h-6" /> },
    { name: "Orion Nebula", type: "Nebula", description: "Only 1,344 light years away, this stellar nursery is one of the most photographed objects in the night sky.", icon: <Zap className="w-6 h-6" /> },
    { name: "Crab Nebula", type: "Supernova Remnant", description: "The remnant of a stellar explosion witnessed in 1054 AD, now containing a rapidly spinning pulsar.", icon: <Zap className="w-6 h-6" /> },
    { name: "Large Magellanic Cloud", type: "Satellite Galaxy", description: "A companion galaxy 160,000 light years away, visible from the Southern Hemisphere with the naked eye.", icon: <Circle className="w-6 h-6" /> },
    { name: "Andromeda Galaxy", type: "Neighbour Galaxy", description: "Our nearest large galactic neighbour, 2.5 million light years away, on a collision course with the Milky Way in ~4.5 billion years.", icon: <Circle className="w-6 h-6" /> },
    { name: "Proxima Centauri", type: "Nearest Star", description: "Our closest stellar neighbour at just 4.24 light years, hosting at least one potentially habitable planet.", icon: <Star className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-[#e0e0e0] font-sans">
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative mb-24 py-20 text-center overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          {/* Animated Galaxy Background SVG */}
          <svg className="w-full h-full max-w-3xl animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="galaxy-grad">
                <stop offset="0%" stopColor="#ffd54f" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#4fc3f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0a0a1a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#galaxy-grad)" />
            <path d="M50,50 Q 80,20 90,50 T 50,50" fill="none" stroke="#4fc3f7" strokeWidth="1" opacity="0.5" />
            <path d="M50,50 Q 20,80 10,50 T 50,50" fill="none" stroke="#4fc3f7" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold font-['Orbitron'] text-white tracking-widest uppercase">The Milky Way</h1>
          <p className="text-xl md:text-2xl text-[#4fc3f7] max-w-3xl mx-auto font-light">Our home galaxy — a barred spiral 100,000 light years across</p>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
      >
        {[
          { label: "Diameter", value: "100,000 ly" },
          { label: "Stars", value: "100–400 billion" },
          { label: "Age", value: "13.6 billion yrs" },
          { label: "Type", value: "Barred Spiral" }
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 backdrop-blur border-white/10 text-center py-6">
            <CardContent className="p-0">
              <div className="text-[#4fc3f7] text-sm uppercase tracking-widest mb-2 font-semibold">{stat.label}</div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </motion.section>

      {/* Anatomy */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-white mb-12 text-center">Anatomy of Our Galaxy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/5 backdrop-blur border-white/10 p-6">
            <Circle className="w-10 h-10 text-[#ffd54f] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">The Core</h3>
            <p className="text-gray-300 leading-relaxed">A dense bulge of ancient stars surrounding Sagittarius A*, our galaxy's supermassive black hole of 4 million solar masses.</p>
          </Card>
          <Card className="bg-white/5 backdrop-blur border-white/10 p-6">
            <Zap className="w-10 h-10 text-[#4fc3f7] mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">The Spiral Arms</h3>
            <p className="text-gray-300 leading-relaxed">Four major spiral arms — Perseus, Norma, Scutum-Centaurus, and Sagittarius — sweep outward from the core, rich with young blue stars and stellar nurseries. Our Solar System sits in a minor spur called the Orion Arm.</p>
          </Card>
          <Card className="bg-white/5 backdrop-blur border-white/10 p-6">
            <Star className="w-10 h-10 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">The Halo</h3>
            <p className="text-gray-300 leading-relaxed">A vast spherical cloud of ancient stars and globular clusters surrounds the disc, extending up to 300,000 light years. Dark matter forms an invisible scaffolding extending far beyond.</p>
          </Card>
        </div>
      </motion.section>

      {/* You Are Here */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-24 flex flex-col items-center"
      >
        <div className="relative w-full max-w-[400px] aspect-square rounded-full border border-white/10 bg-[#050510] overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            <circle cx="50" cy="50" r="10" fill="#ffd54f" opacity="0.8"/>
            <path d="M 50 50 Q 80 20 90 60 T 50 50" fill="none" stroke="#e0f7fa" strokeWidth="2" opacity="0.6"/>
            <path d="M 50 50 Q 20 80 10 40 T 50 50" fill="none" stroke="#b2ebf2" strokeWidth="2" opacity="0.6"/>
            <path d="M 50 50 Q 80 80 40 90 T 50 50" fill="none" stroke="#80deea" strokeWidth="2" opacity="0.6"/>
            <path d="M 50 50 Q 20 20 60 10 T 50 50" fill="none" stroke="#4dd0e1" strokeWidth="2" opacity="0.6"/>
          </svg>
          <div className="absolute top-[65%] left-[35%] flex flex-col items-center animate-pulse">
            <div className="w-3 h-3 bg-[#4fc3f7] rounded-full shadow-[0_0_10px_#4fc3f7]"></div>
            <span className="text-xs text-[#4fc3f7] mt-2 whitespace-nowrap bg-black/50 px-2 py-1 rounded">Solar System — You Are Here</span>
          </div>
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 mt-4">
            <span className="text-xs text-[#ffd54f] bg-black/50 px-2 py-1 rounded">Sagittarius A*</span>
          </div>
        </div>
      </motion.section>

      {/* Notable Objects */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-['Orbitron'] text-white mb-12 text-center">Notable Objects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {notableObjects.map((obj, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur border-white/10 flex flex-col">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="text-[#4fc3f7]">{obj.icon}</div>
                <div>
                  <div className="font-bold text-white text-lg leading-tight">{obj.name}</div>
                  <div className="text-xs text-[#ffd54f] uppercase tracking-wider">{obj.type}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 leading-relaxed">{obj.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Scale Comparison */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-24 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">If the Milky Way were the size of a football pitch...</h2>
        <p className="text-xl text-gray-300 mb-8">The Solar System (out to the Oort Cloud) would be the size of a grain of sand.</p>
        <div className="w-full h-8 bg-white/10 rounded-full overflow-hidden relative border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4fc3f7]/20 to-[#ffd54f]/20"></div>
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>0 ly</span>
          <span>100,000 ly</span>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Card className="bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3a] border-[#4fc3f7]/30 max-w-3xl mx-auto p-12">
          <h2 className="text-3xl font-bold font-['Orbitron'] text-white mb-4">See for yourself</h2>
          <p className="text-lg text-gray-300 mb-8">See our galaxy in three dimensions — zoom from the Solar System all the way out to the observable universe.</p>
          <Button asChild size="lg" className="bg-[#4fc3f7] hover:bg-[#4fc3f7]/80 text-black font-bold px-8 py-6 text-lg rounded-full">
            <a href="/">Explore in Interactive Universe</a>
          </Button>
        </Card>
      </motion.section>

    </div>
  );
}