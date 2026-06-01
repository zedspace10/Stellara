import { X, Info, Clock, Thermometer, Orbit, Disc, Weight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { galaxyObjects } from "@/data/galaxyObjects";
import { useFavourites } from "@/hooks/useFavourites";

interface GalaxyInfoPanelProps {
  objectId: string | null;
  onClose: () => void;
}

export default function GalaxyInfoPanel({ objectId, onClose }: GalaxyInfoPanelProps) {
  const { isFavourite, toggle } = useFavourites();

  if (!objectId) return null;

  const object = galaxyObjects.find((o) => o.id === objectId);

  if (!object) return null;

  const isFav = isFavourite(`galaxy-${objectId}`);

  return (
    <Card className="absolute right-4 w-80 max-w-[calc(100vw-2rem)] bg-background/80 backdrop-blur-xl border-white/10 text-white z-40 shadow-2xl flex flex-col" style={{ top: '220px', maxHeight: 'calc(100vh - 240px)' }}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold font-['Orbitron'] text-[#4fc3f7] flex items-center gap-2">
            {object.name}
            <Button variant="ghost" size="icon" onClick={() => toggle(`galaxy-${objectId}`)} className="h-8 w-8 ml-2 rounded-full hover:bg-white/10">
              <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{object.type}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <p className="text-sm leading-relaxed text-gray-300 mb-6">
          {object.description}
        </p>

        <div className="space-y-4">
          <InfoRow icon={<Orbit className="w-4 h-4 text-primary" />} label="Distance" value={object.distance} />
          <InfoRow icon={<Disc className="w-4 h-4 text-primary" />} label="Size" value={object.size} />
          <InfoRow icon={<Clock className="w-4 h-4 text-primary" />} label="Discovery" value={object.discovery} />
        </div>
      </ScrollArea>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}