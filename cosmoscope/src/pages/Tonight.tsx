import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { moon, planetsTonight, nextSeason, showers } from "@/lib/sky";

const C = {
  card: "#0D1520",
  border: "#1D3040",
  text: "#F5FAFF",
  muted: "#A7B6C6",
  faint: "#7C8C9C",
  tint: "#8DEBFF",
  warm: "#F3DDB0",
};

const PLANET_COLOURS: Record<string, string> = {
  mercury: "#B9B2A8",
  venus: "#F3DDB0",
  mars: "#E08A6A",
  jupiter: "#E3B98C",
  saturn: "#E9D9A6",
};

function formatDay(t: number, withTime = false) {
  return new Date(t).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function daysUntil(t: number, now: number) {
  const d = Math.round((t - now) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "tomorrow";
  return `in ${d} days`;
}

function MoonDisc({ fraction, size = 120 }: { fraction: number; size?: number }) {
  const r = size / 2 - 2;
  const c = size / 2;
  const waxing = fraction < 0.5;
  const lit = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const rx = r * Math.abs(Math.cos(2 * Math.PI * fraction));
  const gibbous = lit > 0.5;
  const d = `M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${rx} ${r} 0 0 ${gibbous ? 1 : 0} ${c} ${c - r} Z`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id="moonlit" cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#F4F1E8" />
          <stop offset="100%" stopColor="#C9C4B8" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="#141C27" stroke="#1D3040" />
      {lit > 0.01 && (
        <path d={d} fill="url(#moonlit)" transform={waxing ? undefined : `translate(${size} 0) scale(-1 1)`} />
      )}
    </svg>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-[20px] p-6"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <h2 className="m-0 mb-4 text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: C.muted }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Tonight() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = "Tonight · PALE";
    const id = setInterval(() => setNow(Date.now()), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const m = useMemo(() => moon(now), [now]);
  const planets = useMemo(() => planetsTonight(now), [now]);
  const season = useMemo(() => nextSeason(now), [now]);
  const meteorShowers = useMemo(() => showers(now), [now]);

  const visible = planets.filter((p) => p.visible);
  const hidden = planets.filter((p) => !p.visible);

  const moonNote =
    m.illumination > 75
      ? "A bright Moon tonight. It washes out faint stars, but the Moon itself is beautiful through binoculars."
      : m.illumination < 25
      ? "A dark sky tonight. A good night to look for the Milky Way away from city lights."
      : "Half lit. Look along the line between light and dark for long shadows on crater walls.";

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C", color: C.text }}>
      <PageHeader
        title="Tonight"
        lede={`${formatDay(now)}. Step outside and look up. Here is what is above you.`}
      />

      <div className="max-w-[1100px] mx-auto px-6 pb-8 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))" }}>
        <Card title="The Moon">
          <div className="flex items-center gap-6 flex-wrap">
            <MoonDisc fraction={m.fraction} />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-2xl font-semibold">{m.name}</p>
              <p className="mt-1 mb-0 text-[15px]" style={{ color: C.muted }}>{m.illumination}% lit</p>
              <p className="mt-3 mb-0 text-sm" style={{ color: C.muted }}>
                Next full Moon: <span style={{ color: C.text }}>{formatDay(m.nextFull)}</span> ({daysUntil(m.nextFull, now)})
                <br />
                Next new Moon: <span style={{ color: C.text }}>{formatDay(m.nextNew)}</span> ({daysUntil(m.nextNew, now)})
              </p>
            </div>
          </div>
          <p className="mt-4 mb-0 text-[15px] leading-relaxed" style={{ color: C.muted }}>{moonNote}</p>
        </Card>

        <Card title="Planets you can see">
          {visible.length === 0 ? (
            <p className="m-0 text-[15px]" style={{ color: C.muted }}>
              All five bright planets are too close to the Sun right now. Check back in a few weeks.
            </p>
          ) : (
            <ul className="m-0 p-0 list-none space-y-4">
              {visible.map((p) => (
                <li key={p.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 shrink-0 rounded-full"
                    style={{ width: 12, height: 12, background: PLANET_COLOURS[p.id], boxShadow: `0 0 10px ${PLANET_COLOURS[p.id]}` }}
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-[17px] font-semibold">{p.name}</p>
                    <p className="mt-0.5 mb-0 text-[15px]" style={{ color: C.text }}>{p.when}</p>
                    <p className="mt-0.5 mb-0 text-sm" style={{ color: C.muted }}>{p.brightness}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hidden.length > 0 && (
            <p className="mt-5 mb-0 text-sm" style={{ color: C.faint }}>
              Hidden in the Sun's glare: {hidden.map((p) => p.name).join(", ")}.
            </p>
          )}
          <Link href="/" className="inline-block mt-4 text-[15px] font-semibold no-underline" style={{ color: C.tint }}>
            See where they are in 3D
          </Link>
        </Card>

        <Card title="Meteor showers">
          <ul className="m-0 p-0 list-none space-y-4">
            {meteorShowers.map((s) => (
              <li key={s.name + s.peakTime}>
                <p className="m-0 text-[17px] font-semibold">
                  {s.name}
                  {s.activeNow && (
                    <span className="ml-2 align-middle text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: "rgba(141,235,255,0.12)", color: C.tint }}>
                      Active now
                    </span>
                  )}
                </p>
                <p className="mt-0.5 mb-0 text-[15px]" style={{ color: C.text }}>
                  {s.activeNow && s.peakTime < now ? "Peaked around " : "Peaks around "}
                  {new Date(s.peakTime).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                  {s.peakTime > now ? ` (${daysUntil(s.peakTime, now)})` : ""}
                </p>
                <p className="mt-0.5 mb-0 text-sm" style={{ color: C.muted }}>
                  Up to about {s.rate} an hour in a dark sky, appearing to come from {s.radiant}.{s.note ? ` ${s.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {season && (
          <Card title="The turning year">
            <p className="m-0 text-[17px] font-semibold">{season.name}</p>
            <p className="mt-0.5 mb-0 text-[15px]" style={{ color: C.text }}>
              {formatDay(season.time, true)} ({daysUntil(season.time, now)})
            </p>
            <p className="mt-0.5 mb-0 text-sm" style={{ color: C.muted }}>
              {season.northern}. The moment Earth reaches this point in its orbit around the Sun.
            </p>
          </Card>
        )}
      </div>

      <section aria-label="More to look at" className="max-w-[1100px] mx-auto px-6 pb-6 flex flex-wrap gap-4">
        <Link
          href="/constellations"
          className="flex-1 min-w-[260px] rounded-[20px] p-6 no-underline"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <span className="block text-[17px] font-semibold" style={{ color: C.text }}>Constellation guide</span>
          <span className="block mt-1 text-[15px]" style={{ color: C.muted }}>The shapes in the sky and the stories behind them.</span>
        </Link>
        <Link
          href="/apod"
          className="flex-1 min-w-[260px] rounded-[20px] p-6 no-underline"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <span className="block text-[17px] font-semibold" style={{ color: C.text }}>Picture of the day</span>
          <span className="block mt-1 text-[15px]" style={{ color: C.muted }}>A new view of the universe from NASA, every day.</span>
        </Link>
      </section>

      <p className="max-w-[1100px] mx-auto px-6 m-0 text-xs" style={{ color: C.faint }}>
        Worked out on your device from NASA JPL orbital data. No location needed. Planets low in the sky near the Sun can be hard to spot from the UK.
      </p>

      <Footer />
    </div>
  );
}
