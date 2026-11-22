import { useEffect, useMemo, useState } from "react";
import { fromHoursDegrees, fromSceneAxes, moonPosition, planetPosition, toAltAz, type RaDec } from "@/lib/skyChart";
import type { MonthShape } from "@/data/monthShapes";

// The whole sky at one moment, as a round chart: the edge is the horizon and the middle is
// straight overhead. North is at the top and east on the left, as it is when you hold a chart up
// above your head. Stars from the Yale Bright Star Catalogue, planets and the Moon worked out live.

const SIZE = 400;
const C = SIZE / 2;
const R = 176;
const FAINTEST = 4.6;

const PLANETS: { id: string; name: string; colour: string }[] = [
  { id: "mercury", name: "Mercury", colour: "#B9B2A8" },
  { id: "venus", name: "Venus", colour: "#F3DDB0" },
  { id: "mars", name: "Mars", colour: "#E08A6A" },
  { id: "jupiter", name: "Jupiter", colour: "#E3B98C" },
  { id: "saturn", name: "Saturn", colour: "#E9D9A6" },
];

type Star = [number, number, number, number, number];
let starsCache: Promise<Star[]> | null = null;
function loadStars() {
  starsCache ??= fetch(`${import.meta.env.BASE_URL}data/bright-stars.json`)
    .then((r) => (r.ok ? r.json() : { stars: [] }))
    .then((d: { stars: Star[] }) => d.stars.filter((s) => s[3] <= FAINTEST))
    .catch(() => []);
  return starsCache;
}

/** Height and direction to a point on the chart. */
function place(p: RaDec, t: number) {
  const { alt, az } = toAltAz(p, t);
  if (alt < 0) return null;
  const r = ((90 - alt) / 90) * R;
  const a = (az * Math.PI) / 180;
  return { x: C - r * Math.sin(a), y: C - r * Math.cos(a) };
}

interface Props {
  time: number;
  shape: MonthShape;
  /** Fraction of the Moon lit, 0 to 1, for its size and brightness. */
  moonLit: number;
}

export default function SkyChart({ time, shape, moonLit }: Props) {
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    let live = true;
    loadStars().then((s) => { if (live) setStars(s); });
    return () => { live = false; };
  }, []);

  const drawn = useMemo(() => {
    const starDots = stars
      .map((s) => ({ p: place(fromSceneAxes(s[0], s[1], s[2]), time), mag: s[3] }))
      .filter((s) => s.p) as { p: { x: number; y: number }; mag: number }[];
    const figure = shape.stars.map(([ra, dec]) => place(fromHoursDegrees(ra, dec), time));
    const planets = PLANETS.map((pl) => ({ ...pl, p: place(planetPosition(pl.id, time).pos, time) })).filter((pl) => pl.p);
    const moon = place(moonPosition(time), time);
    return { starDots, figure, planets, moon };
  }, [stars, time, shape]);

  const figurePts = drawn.figure.filter(Boolean) as { x: number; y: number }[];
  const label = figurePts.length
    ? { x: figurePts.reduce((a, p) => a + p.x, 0) / figurePts.length, y: Math.min(...figurePts.map((p) => p.y)) - 12 }
    : null;

  // Names for the Moon and planets, nudged so none sits on another; near the right edge they go left.
  const names = useMemo(() => {
    const items = [
      ...(drawn.moon ? [{ key: "moon", text: "Moon", x: drawn.moon.x, y: drawn.moon.y, gap: 10, colour: "#EDE6D6" }] : []),
      ...drawn.planets.map((pl) => ({ key: pl.id, text: pl.name, x: pl.p!.x, y: pl.p!.y, gap: 6, colour: pl.colour })),
    ];
    // Boxes already taken: every dot, then each name as it is placed. A box is x0, y0, x1, y1.
    const taken: [number, number, number, number][] = items.map((it) => {
      const r = it.key === "moon" ? 8 : 4.5;
      return [it.x - r, it.y - r, it.x + r, it.y + r];
    });
    if (label) {
      const w = shape.name.length * 6.2;
      taken.push([label.x - w / 2, label.y - 9, label.x + w / 2, label.y + 3]);
    }
    const free = (b: [number, number, number, number]) => !taken.some((t) => b[0] < t[2] && b[2] > t[0] && b[1] < t[3] && b[3] > t[1]);
    return items.map((it) => {
      const w = it.text.length * 6.2;
      const right = (dy: number) => [it.x + it.gap, it.y + dy - 8, it.x + it.gap + w, it.y + dy + 3] as [number, number, number, number];
      const left = (dy: number) => [it.x - it.gap - w, it.y + dy - 8, it.x - it.gap, it.y + dy + 3] as [number, number, number, number];
      const tries: { box: [number, number, number, number]; end: boolean; dy: number }[] = [];
      for (const dy of [4, 16, -8, 28, -20]) {
        tries.push({ box: right(dy), end: false, dy }, { box: left(dy), end: true, dy });
      }
      const fits = tries.filter((t) => t.box[0] > 2 && t.box[2] < SIZE - 2);
      const pick = fits.find((t) => free(t.box)) ?? fits[0] ?? tries[0];
      taken.push(pick.box);
      return {
        ...it,
        tx: pick.end ? it.x - it.gap : it.x + it.gap,
        ty: it.y + pick.dy,
        anchor: (pick.end ? "end" : "start") as "end" | "start",
      };
    });
  }, [drawn, label, shape]);


  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[420px] h-auto block" role="img"
        aria-label={`The sky from the UK, with ${shape.name}${drawn.planets.length ? `, ${drawn.planets.map((p) => p.name).join(", ")}` : ""}${drawn.moon ? " and the Moon" : ""} marked.`}>
        <defs>
          <radialGradient id="sky-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B1220" />
            <stop offset="100%" stopColor="#070B13" />
          </radialGradient>
          <radialGradient id="smudge" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(232,236,241,0.55)" />
            <stop offset="100%" stopColor="rgba(232,236,241,0)" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="url(#sky-bg)" stroke="#2A3546" strokeWidth="1" />
        <circle cx={C} cy={C} r={R * (2 / 3)} fill="none" stroke="#141B26" strokeWidth="0.8" />
        <circle cx={C} cy={C} r={R / 3} fill="none" stroke="#141B26" strokeWidth="0.8" />

        {drawn.starDots.map((s, i) => (
          <circle key={i} cx={s.p.x} cy={s.p.y} r={Math.max(0.55, 2.3 - s.mag * 0.4)}
            fill="#E8ECF1" opacity={Math.max(0.35, Math.min(1, 1.1 - s.mag * 0.15))} />
        ))}

        {/* This month's shape */}
        {shape.lines.map(([a, b], i) => {
          const pa = drawn.figure[a], pb = drawn.figure[b];
          return pa && pb ? <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#F3DDB0" strokeOpacity="0.55" strokeWidth="1" /> : null;
        })}
        {drawn.figure.map((p, i) =>
          p ? (i === shape.smudge
            ? <ellipse key={i} cx={p.x} cy={p.y} rx="7" ry="3.5" fill="url(#smudge)" transform={`rotate(-35 ${p.x} ${p.y})`} />
            : <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#F3DDB0" />) : null,
        )}
        {label && (
          <text x={label.x} y={label.y} textAnchor="middle" fontSize="11" fill="#F3DDB0" fontFamily="'Instrument Sans', sans-serif">{shape.name}</text>
        )}

        {drawn.moon && <circle cx={drawn.moon.x} cy={drawn.moon.y} r="7" fill="#EDE6D6" opacity={0.35 + 0.65 * moonLit} />}
        {drawn.planets.map((pl) => <circle key={pl.id} cx={pl.p!.x} cy={pl.p!.y} r="3.4" fill={pl.colour} />)}
        {names.map((n) => (
          <text key={n.key} x={n.tx} y={n.ty} textAnchor={n.anchor} fontSize="11" fill={n.colour} fontFamily="'Instrument Sans', sans-serif">{n.text}</text>
        ))}

        {[["N", C, C - R - 8], ["S", C, C + R + 16], ["E", C - R - 12, C + 4], ["W", C + R + 12, C + 4]].map(([t, x, y]) => (
          <text key={t as string} x={x as number} y={y as number} textAnchor="middle" fontSize="12" fill="#8E9AA8" fontFamily="'Instrument Sans', sans-serif">{t}</text>
        ))}
      </svg>
    </figure>
  );
}
