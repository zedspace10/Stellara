import { X } from "lucide-react";
import { Link } from "wouter";
import type { NearbyGalaxy } from "@/data/localVolume";
import { timesSun } from "@/lib/universeMap";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const RULE = "#1C2533";

// A line in our own words for the best known galaxies.
const NOTES: Record<string, string> = {
  lmc: "A small galaxy in orbit around the Milky Way, easy to see without a telescope from the southern hemisphere.",
  smc: "The Large Magellanic Cloud's smaller companion, also visible to the naked eye from the southern hemisphere.",
  m33: "The smallest of the three big spiral galaxies in our Local Group.",
  ic342: "A big, bright spiral that we see only dimly, because the dust of our own galaxy's disc lies in front of it.",
  maffei1: "Hidden behind the Milky Way's dust, it was only found in 1968, by looking in infrared light.",
  maffei2: "Found in 1968 alongside Maffei 1, behind the dust of the Milky Way's disc.",
  ngc253: "One of the brightest galaxies in our sky, and forming new stars at a furious rate.",
  m81: "Its pull on the nearby Cigar Galaxy is what set off that galaxy's burst of new stars.",
  m82: "Forming stars around ten times faster than the Milky Way, after a close pass by Bode's Galaxy.",
  "cen-a": "A giant galaxy whose central black hole fires jets of matter thousands of light years long.",
  circinus: "It sits just behind the plane of the Milky Way, and went unnoticed until 1977.",
  sombrero: "Named for its bright bulge and the dark lane of dust around it, which we see almost edge on.",
  m101: "A spiral nearly twice as wide as the Milky Way.",
  m83: "One of the closest and brightest barred spirals, with arms full of young stars.",
  m64: "A dark band of dust across its centre gives it its name.",
  whale: "A spiral seen edge on, long and slightly bent like a whale.",
  needle: "Seen exactly edge on, it is one of the thinnest looking galaxies in the sky.",
  fireworks: "Ten supernovas have been seen in it in the last century, more than in any other galaxy known.",
};

export default function NearbyGalaxyPanel({ galaxy, onClose }: { galaxy: NearbyGalaxy | null; onClose: () => void }) {
  if (!galaxy) return null;
  const mly = galaxy.mly;
  const dist = mly < 1 ? `${Math.round(mly * 1000).toLocaleString("en-GB")},000 light years` : `${mly < 10 ? mly.toFixed(1) : Math.round(mly)} million light years`;
  const left = mly < 1 ? `${Math.round(mly * 1000).toLocaleString("en-GB")},000 years ago` : `${mly < 10 ? mly.toFixed(1) : Math.round(mly)} million years ago`;
  const rows: [string, string][] = [
    ["Distance", dist],
    ["Its light left", left],
    ...(galaxy.mv !== undefined ? [["Brightness", timesSun(galaxy.mv)] as [string, string]] : []),
    ...(galaxy.alias ? [["Catalogue name", galaxy.alias] as [string, string]] : []),
  ];
  return (
    <div
      className="absolute right-4 w-[22rem] max-w-[calc(100vw-2rem)] z-40 rounded-xl overflow-hidden"
      style={{ top: "220px", background: "#0A0F17", border: `1px solid ${RULE}` }}
    >
      <div className="px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className="min-w-0">
          <h2 className="m-0 text-[26px] leading-tight" style={{ color: TEXT, fontWeight: 400 }}>{galaxy.name}</h2>
          <p className="m-0 mt-0.5 text-[13px]" style={{ color: MUTED }}>A real galaxy in our neighbourhood</p>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>
      <div className="px-5 pt-4 pb-5">
        {NOTES[galaxy.id] && <p className="m-0 mb-4 text-[15px] leading-relaxed" style={{ color: BODY }}>{NOTES[galaxy.id]}</p>}
        <dl className="m-0" style={{ borderTop: `1px solid ${RULE}` }}>
          {rows.map(([k, v]) => (
            <div key={k} className="py-2 grid grid-cols-[7.5rem_1fr] gap-3 text-[14px]" style={{ borderBottom: `1px solid ${RULE}` }}>
              <dt style={{ color: MUTED }}>{k}</dt>
              <dd className="m-0" style={{ color: TEXT }}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="m-0 mt-4 text-[12px] leading-relaxed" style={{ color: MUTED }}>
          Position and distance from the Local Volume Database.{" "}
          <Link href="/credits" className="underline underline-offset-4" style={{ color: "#A9C3E0" }}>Sources</Link>
        </p>
      </div>
    </div>
  );
}
