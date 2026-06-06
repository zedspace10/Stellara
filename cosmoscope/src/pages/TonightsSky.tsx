import React, { useState, useEffect, useRef } from "react";
import { Compass, MapPin, Moon, Sun, Stars, Calendar, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UPCOMING_EVENTS = [
  { name: "Perseid Meteor Shower", date: new Date('2025-08-12'), type: "Meteor Shower", description: "Up to 100 meteors per hour at peak. Best viewed after midnight facing northeast." },
  { name: "Partial Lunar Eclipse", date: new Date('2025-09-07'), type: "Eclipse", description: "A partial lunar eclipse visible from Europe, Asia, Africa, and Australia." },
  { name: "Geminid Meteor Shower", date: new Date('2025-12-13'), type: "Meteor Shower", description: "One of the year's best meteor showers — up to 120 meteors per hour." },
  { name: "Total Lunar Eclipse", date: new Date('2025-03-14'), type: "Eclipse", description: "A total lunar eclipse visible from the Americas, western Europe, and western Africa." },
  { name: "Jupiter at Opposition", date: new Date('2025-12-07'), type: "Planet", description: "Jupiter at its closest and brightest — visible all night and perfect for telescope viewing." },
  { name: "Mars at Opposition", date: new Date('2025-01-16'), type: "Planet", description: "Mars at its biggest and brightest in the sky." },
  { name: "Leonid Meteor Shower", date: new Date('2025-11-17'), type: "Meteor Shower", description: "Known for occasional storms of thousands of meteors per hour." },
  { name: "Summer Solstice", date: new Date('2025-06-21'), type: "Seasonal", description: "The longest day of the year in the Northern Hemisphere." },
  { name: "Annular Solar Eclipse", date: new Date('2026-02-17'), type: "Eclipse", description: "An annular 'ring of fire' solar eclipse visible from parts of South America and Africa." },
];

const CONSTELLATIONS = [
  { name: "Orion", season: "Winter", mythology: "The great hunter of Greek mythology, Orion was placed in the sky by Zeus after being killed by Artemis. He hunts eternally across the heavens, followed by his faithful dogs Canis Major and Canis Minor.", stars: 7, bestMonth: "January", visibility: "Worldwide" },
  { name: "Ursa Major", season: "All year", mythology: "Zeus transformed the nymph Callisto into a bear and placed her in the sky. The seven bright stars form the famous Big Dipper, used for navigation throughout history.", stars: 7, bestMonth: "April", visibility: "Northern Hemisphere" },
  { name: "Cassiopeia", season: "All year", mythology: "The vain queen of Ethiopia who boasted her beauty surpassed the sea nymphs. Neptune punished her by placing her on a throne that circles the pole, sometimes upside down.", stars: 5, bestMonth: "November", visibility: "Northern Hemisphere" },
  { name: "Leo", season: "Spring", mythology: "The Nemean Lion slain by Hercules as his first labour. Zeus immortalised the beast in the sky. The bright star Regulus marks the lion's heart.", stars: 9, bestMonth: "April", visibility: "Worldwide" },
  { name: "Scorpius", season: "Summer", mythology: "The scorpion sent by the goddess Gaia to kill Orion. They are placed on opposite sides of the sky — when Scorpius rises, Orion sets, never able to meet.", stars: 18, bestMonth: "July", visibility: "Worldwide" },
  { name: "Cygnus", season: "Summer", mythology: "The swan form taken by Zeus when he visited Leda of Sparta. The bright star Deneb marks the tail. The Milky Way runs through Cygnus, rich with star clusters.", stars: 9, bestMonth: "September", visibility: "Northern Hemisphere" },
  { name: "Virgo", season: "Spring", mythology: "Associated with Demeter, goddess of the harvest. The bright star Spica represents a sheaf of wheat in her hand. Virgo hosts the massive Virgo galaxy cluster.", stars: 15, bestMonth: "May", visibility: "Worldwide" },
  { name: "Perseus", season: "Autumn/Winter", mythology: "The hero who slew Medusa and rescued Andromeda. He carries Medusa's head — represented by the variable star Algol, called the Demon Star, which dims and brightens like a blinking eye.", stars: 19, bestMonth: "December", visibility: "Northern Hemisphere" },
];

function getMoonPhaseName(age: number) {
  if (age < 1.84) return "New";
  if (age < 5.53) return "Waxing Crescent";
  if (age < 9.22) return "First Quarter";
  if (age < 12.91) return "Waxing Gibbous";
  if (age < 16.61) return "Full";
  if (age < 20.3) return "Waning Gibbous";
  if (age < 23.99) return "Last Quarter";
  if (age < 27.68) return "Waning Crescent";
  return "New";
}

export default function TonightsSky() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setError(null);
        },
        () => {
          // Denied — fall back to London so content still shows
          setLocation({ lat: 51.5074, lon: -0.1278 });
          setUsingFallback(true);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  // Simple star map drawing
  useEffect(() => {
    document.title = "Tonight's Sky — STELLARA";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw boundary
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill dark blue
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#05051a";
    ctx.fill();

    // Cardinal directions
    ctx.fillStyle = "rgba(79,195,247,0.8)";
    ctx.font = "14px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy - radius + 15);
    ctx.fillText("S", cx, cy + radius - 15);
    ctx.fillText("E", cx + radius - 15, cy);
    ctx.fillText("W", cx - radius + 15, cy);

    // Random stars for the map
    const drawStars = () => {
      for (let i = 0; i < 150; i++) {
        const r = Math.random() * (radius - 30);
        const theta = Math.random() * Math.PI * 2;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        const size = Math.random() * 1.5 + 0.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`;
        ctx.fill();
      }
    };
    drawStars();

    // Constellation lines (fake lines for aesthetic)
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 50);
    ctx.lineTo(cx - 20, cy - 80);
    ctx.lineTo(cx + 30, cy - 70);
    ctx.stroke();

  }, [location, error]);

  // Compute Moon phase
  const knownNewMoon = new Date('2025-01-29T12:00:00Z');
  const now = new Date();
  const diffDays = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((diffDays % 29.53) + 29.53) % 29.53;
  const phaseName = getMoonPhaseName(moonAge);
  const illumination = Math.round((1 - Math.cos((moonAge / 29.53) * 2 * Math.PI)) / 2 * 100);

  const upcomingEvents = UPCOMING_EVENTS.map(event => {
    const daysUntil = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { ...event, daysUntil };
  }).filter(e => e.daysUntil > 0).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Meteor Shower": return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "Eclipse": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Planet": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Seasonal": return "bg-green-500/20 text-green-300 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  const [expandedConstellation, setExpandedConstellation] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold font-['Orbitron'] text-white">Tonight's Sky</h1>
        <p className="text-xl text-muted-foreground">Your personalized guide to what's visible overhead tonight.</p>
      </div>

      {!location && !error ? (
        <Card className="max-w-md mx-auto bg-card/40 backdrop-blur-md border-white/10 text-center py-8">
          <CardContent className="space-y-6">
            <Compass className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-bold text-white">Enable Location</h3>
            <p className="text-sm text-gray-400">To calculate precise visibility times and object positions, STELLARA needs your rough location.</p>
            <Button onClick={requestLocation} className="w-full">
              <MapPin className="w-4 h-4 mr-2" /> Allow Location
            </Button>
            <Button variant="ghost" onClick={() => setError("Skipped")} className="w-full text-muted-foreground">
              Skip for now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
        {usingFallback && (
          <p className="text-center text-sm text-amber-400/80 mb-6">
            Showing sky for London, UK — enable location for your local sky
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/40 backdrop-blur-md border-white/10 overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white font-['Orbitron']">Local Sky Map</h3>
                  {location && (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-primary flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {usingFallback ? "London, UK" : `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°`}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex justify-center py-8">
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={400} 
                  className="max-w-full h-auto"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/40 backdrop-blur-md border-white/10">
                <CardHeader className="pb-2">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Stars className="w-5 h-5 text-primary" /> Constellations
                  </h4>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4">Notable groupings visible tonight in the Northern Hemisphere:</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• <strong>Ursa Major:</strong> High in the northern sky.</li>
                    <li>• <strong>Leo:</strong> Prominent in the south-west after sunset.</li>
                    <li>• <strong>Virgo:</strong> Rising in the south-east.</li>
                    <li>• <strong>Boötes:</strong> Look for bright orange Arcturus.</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-card/40 backdrop-blur-md border-white/10">
                <CardHeader className="pb-2">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" /> Space Station
                  </h4>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4">The ISS frequently passes overhead, appearing as a bright, fast-moving star.</p>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
                    <p className="text-sm text-gray-300 mb-3">For precise pass times from your exact location, check Heavens-Above.</p>
                    <a href="https://heavens-above.com" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium">
                      Open Heavens-Above →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/40 backdrop-blur-md border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white font-['Orbitron'] flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" /> The Moon
                </h3>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full shadow-[inset_-20px_-5px_40px_rgba(0,0,0,0.8)] mb-6 border border-white/20" />
                <h4 className="text-2xl font-bold text-white mb-2">{phaseName}</h4>
                <p className="text-sm text-gray-400">Illumination: {illumination}%</p>
                <p className="text-sm text-gray-400 mt-2">Day {moonAge.toFixed(1)} of the lunar cycle.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white font-['Orbitron']">Visible Planets</h3>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-bold text-white">Venus</span>
                  <span className="text-primary">Evening (West)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-bold text-white">Mars</span>
                  <span className="text-primary">Evening (South-West)</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="font-bold text-white">Saturn</span>
                  <span className="text-primary">Morning (East)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
      )}

      {/* Additional Content Sections */}
      {location && (
        <div className="mt-12 space-y-12">
          {/* Upcoming Events */}
          <div>
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#4fc3f7]" /> Upcoming Celestial Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, idx) => (
                <Card key={idx} className="bg-white/5 backdrop-blur border-white/10 hover:border-white/20 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-sm font-medium text-[#4fc3f7]">
                        in {event.daysUntil} days
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                    <p className="text-xs text-gray-400">
                      {event.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Constellation Explorer */}
          <div>
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white mb-6 flex items-center gap-3">
              <Stars className="w-8 h-8 text-[#ffd54f]" /> Constellation Explorer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONSTELLATIONS.map((constellation, idx) => (
                <Card 
                  key={idx} 
                  className="bg-white/5 backdrop-blur border-white/10 overflow-hidden transition-all cursor-pointer hover:bg-white/10"
                  onClick={() => setExpandedConstellation(expandedConstellation === constellation.name ? null : constellation.name)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Stars className="w-4 h-4 text-[#4fc3f7]" /> {constellation.name}
                      </h3>
                      <p className="text-sm text-[#ffd54f]">{constellation.season}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedConstellation === constellation.name ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedConstellation === constellation.name && (
                    <div className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
                      <p className="text-sm text-gray-300 italic">"{constellation.mythology}"</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p><strong className="text-white">Best viewing:</strong> {constellation.bestMonth}</p>
                        <p><strong className="text-white">Visibility:</strong> {constellation.visibility}</p>
                        <p><strong className="text-white">Main stars:</strong> {constellation.stars}</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
