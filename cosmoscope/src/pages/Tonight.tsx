import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { moon, planetsTonight, nextSeason, showers } from "@/lib/sky";
import { LATEST_PIN, isThisWeek, pinDistance } from "@/data/pins";
import { loadNotes, milestonesFor, kmTravelled, whenReached, bigKm, duration, inSentence } from "@/lib/notes";

const C = {
  border: "#1C2533",
  rule: "#141B26",
  text: "#E8ECF1",
  muted: "#A3AFBC",
  faint: "#7C8794",
  tint: "#A9C3E0",
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
      <circle cx={c} cy={c} r={r} fill="#121925" />
      {lit > 0.01 && (
        <path d={d} fill="url(#moonlit)" transform={waxing ? undefined : `translate(${size} 0) scale(-1 1)`} />
      )}
    </svg>
  );
}

// Where the person's newest note has got to, in a sentence.
function noteProgress(now: number) {
  try {
    const n = loadNotes().sort((a, b) => b.sentAt - a.sentAt)[0];
    if (!n) return null;
    const km = kmTravelled(n.sentAt, now);
    const marks = milestonesFor(n.sentAt);
    const passed = [...marks].reverse().find((m) => m.km <= km);
    const next = marks.find((m) => m.km > km);
    return {
      km,
      passed: passed ? inSentence(passed.name) : null,
      next: next ? { name: inSentence(next.name), in: duration(whenReached(next, n.sentAt) - now) } : null,
    };
  } catch {
    return null;
  }
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="block w-24 h-24 rounded-md object-cover shrink-0"
      style={{ border: `1px solid ${C.border}`, background: "#070a10" }}
    />
  );
}

// One entry in tonight's log: what it is on the left, the details on the right.
function Entry({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="grid grid-cols-1 md:grid-cols-[11rem_1fr] gap-x-10 gap-y-3 py-8" style={{ borderTop: `1px solid ${C.border}` }}>
      <h2 className="m-0 text-[22px] leading-tight" style={{ color: C.text, fontWeight: 400 }}>{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function Tonight() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = "Tonight | PALE";
    const id = setInterval(() => setNow(Date.now()), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const m = useMemo(() => moon(now), [now]);
  const planets = useMemo(() => planetsTonight(now), [now]);
  const season = useMemo(() => nextSeason(now), [now]);
  const meteorShowers = useMemo(() => showers(now), [now]);

  const note = useMemo(() => noteProgress(now), [now]);
  const pin = LATEST_PIN;

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
      <div className="max-w-[920px] mx-auto px-5 md:px-8">
        <header className="pt-14 pb-10">
          <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: C.text }}>Tonight</h1>
          <p className="mt-4 mb-0 text-[17px] leading-relaxed max-w-[34rem]" style={{ color: C.muted }}>
            {formatDay(now)}. Step outside and look up. This is what is above you.
          </p>
        </header>

        <Entry title="The Moon">
          <div className="flex items-center gap-6 flex-wrap">
            <MoonDisc fraction={m.fraction} size={96} />
            <div className="min-w-0 flex-1">
              <p className="m-0 font-serif text-[26px] leading-tight">{m.name}, {m.illumination}% lit</p>
              <p className="mt-2 mb-0 text-[15px] leading-relaxed" style={{ color: C.muted }}>
                Full Moon {formatDay(m.nextFull)} ({daysUntil(m.nextFull, now)}).
                <br />
                New Moon {formatDay(m.nextNew)} ({daysUntil(m.nextNew, now)}).
              </p>
            </div>
          </div>
          <p className="mt-5 mb-0 text-[16px] leading-relaxed max-w-[34rem]" style={{ color: C.text }}>{moonNote}</p>
        </Entry>

        <Entry title="Planets">
          {visible.length === 0 ? (
            <p className="m-0 text-[16px]" style={{ color: C.muted }}>
              All five bright planets are too close to the Sun right now. Check back in a few weeks.
            </p>
          ) : (
            <dl className="m-0">
              {visible.map((p, i) => (
                <div key={p.id} className="grid grid-cols-[6.5rem_1fr] gap-x-4 py-3" style={i ? { borderTop: `1px solid ${C.rule}` } : undefined}>
                  <dt className="flex items-center gap-2 text-[16px]" style={{ color: C.text }}>
                    <span aria-hidden="true" className="shrink-0 rounded-full" style={{ width: 8, height: 8, background: PLANET_COLOURS[p.id] }} />
                    {p.name}
                  </dt>
                  <dd className="m-0">
                    <span className="block text-[16px]" style={{ color: C.text }}>{p.when}</span>
                    <span className="block mt-0.5 text-[14px]" style={{ color: C.muted }}>{p.brightness}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 mb-0 text-[14px]" style={{ color: C.faint }}>
            {hidden.length > 0 && <>Hidden in the Sun's glare: {hidden.map((p) => p.name).join(", ")}. </>}
            <Link href="/" className="underline underline-offset-4" style={{ color: C.tint }}>See where they are in 3D</Link>
          </p>
        </Entry>

        <Entry title="Meteors">
          <dl className="m-0">
            {meteorShowers.map((s, i) => (
              <div key={s.name + s.peakTime} className="py-3" style={i ? { borderTop: `1px solid ${C.rule}` } : undefined}>
                <dt className="text-[16px]" style={{ color: C.text }}>
                  {s.name}
                  {s.activeNow && <span className="ml-2 text-[14px]" style={{ color: C.tint }}>active now</span>}
                </dt>
                <dd className="m-0 mt-0.5 text-[14px] leading-relaxed" style={{ color: C.muted }}>
                  {s.activeNow && s.peakTime < now ? "Peaked around " : "Peaks around "}
                  {new Date(s.peakTime).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                  {s.peakTime > now ? ` (${daysUntil(s.peakTime, now)})` : ""}. Up to about {s.rate} an hour in a dark sky, coming from {s.radiant}.{s.note ? ` ${s.note}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        </Entry>

        {season && (
          <Entry title="The year">
            <p className="m-0 font-serif text-[22px] leading-tight">{season.name}</p>
            <p className="mt-1 mb-0 text-[15px]" style={{ color: C.text }}>
              {formatDay(season.time, true)} ({daysUntil(season.time, now)})
            </p>
            <p className="mt-1 mb-0 text-[14px] leading-relaxed" style={{ color: C.muted }}>
              {season.northern}. The moment Earth reaches this point in its orbit around the Sun.
            </p>
          </Entry>
        )}

        <Entry title="Further out">
          <div className="flex items-start gap-5">
            <Thumb src={pin.image.src} alt={pin.image.alt} />
            <div className="min-w-0">
              <p className="m-0 text-[13px]" style={{ color: isThisWeek(pin, now) ? C.warm : C.faint }}>
                {isThisWeek(pin, now) ? "New this week" : "The latest picture"}
              </p>
              <p className="mt-1 mb-0 font-serif text-[22px] leading-tight">{pin.title}</p>
              <p className="mt-1 mb-0 text-[14px]" style={{ color: C.muted }}>{pin.object}, {pinDistance(pin)}</p>
              <p className="mt-2 mb-0 text-[14px]">
                <Link href={`/discoveries#${pin.id}`} className="underline underline-offset-4" style={{ color: C.tint }}>Read about it</Link>
                <span style={{ color: C.faint }}> or </span>
                <Link href={`/?pin=${pin.id}`} className="underline underline-offset-4" style={{ color: C.tint }}>see where it is</Link>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${C.rule}` }}>
            {note ? (
              <>
                <p className="m-0 text-[16px] leading-relaxed" style={{ color: C.text }}>
                  Your note has travelled {bigKm(note.km)}
                  {note.passed ? `, past ${note.passed}` : ""}.
                </p>
                {note.next && (
                  <p className="mt-1 mb-0 text-[14px]" style={{ color: C.muted }}>
                    It reaches {note.next.name} in {note.next.in}.
                  </p>
                )}
                <p className="mt-2 mb-0 text-[14px]">
                  <Link href="/note" className="underline underline-offset-4" style={{ color: C.tint }}>Follow it</Link>
                </p>
              </>
            ) : (
              <p className="m-0 text-[15px] leading-relaxed" style={{ color: C.muted }}>
                Light leaving Earth tonight will pass the Moon in just over a second.{" "}
                <Link href="/note" className="underline underline-offset-4" style={{ color: C.tint }}>Send a note with it</Link>, and follow it out among the stars.
              </p>
            )}
          </div>
        </Entry>

        <div className="py-8 text-[15px] leading-relaxed" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>
          <p className="m-0">
            Want more? Learn the shapes in the sky with the{" "}
            <Link href="/constellations" className="underline underline-offset-4" style={{ color: C.tint }}>constellation guide</Link>, or see NASA's{" "}
            <Link href="/apod" className="underline underline-offset-4" style={{ color: C.tint }}>picture of the day</Link>.
          </p>
          <p className="mt-4 mb-0 text-[13px]" style={{ color: C.faint }}>
            Worked out on your device from NASA JPL orbital data. No location needed. Planets low in the sky near the Sun can be hard to spot from the UK.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
