import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { moon, planetsTonight, nextSeason, showers } from "@/lib/sky";
import { LATEST_PIN, isThisWeek, pinDistance, pinImage } from "@/data/pins";
import { shapeFor, type MonthShape } from "@/data/monthShapes";
import { darknessTonight, ninePmTonight, ukTime, lightTimeWords, planetSlot, type Darkness, type PlanetSlot } from "@/lib/skyChart";
import SkyChart from "@/components/SkyChart";
import type { MoonInfo, PlanetTonight, ShowerTonight } from "@/lib/sky";
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

// The night in one sentence: the Moon, the planets worth seeing, and this month's shape.
type Planet = PlanetTonight & { slot?: PlanetSlot };

function summary(m: MoonInfo, planets: Planet[], shape: MonthShape) {
  const moonPart =
    m.illumination > 75 ? "a bright Moon"
    : m.illumination < 25 ? "a dark, nearly moonless sky"
    : `a ${m.waxing ? "growing" : "shrinking"} half Moon`;
  const seen = planets.filter((p) => p.visible && p.id !== "mercury");
  const evening = seen.filter((p) => p.slot === "evening" || p.slot === "all-night").map((p) => p.name);
  const late = seen.filter((p) => p.slot === "late").map((p) => p.name);
  const morning = seen.filter((p) => p.slot === "dawn").map((p) => p.name);
  const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  const parts = [moonPart];
  if (evening.length) parts.push(`${list(evening)} in the evening`);
  parts.push(shape.short);
  let text = `Tonight: ${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
  if (late.length) text += ` Later in the night, ${list(late)}.`;
  if (morning.length) text += ` Before dawn, ${list(morning)}.`;
  return text;
}

/** A calendar reminder for a meteor shower's best night: the evening before its peak, into the early hours. */
function showerReminder(s: ShowerTonight) {
  const peak = new Date(s.peakTime);
  const start = Date.UTC(peak.getUTCFullYear(), peak.getUTCMonth(), peak.getUTCDate() - 1, 21);
  const end = start + 7 * 3600000;
  const stamp = (x: number) => new Date(x).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const text = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PALE//Tonight//EN", "BEGIN:VEVENT",
    `UID:${s.name.toLowerCase()}-${peak.getUTCFullYear()}@pale`,
    `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:The ${s.name} meteor shower`,
    `DESCRIPTION:Best after midnight, away from streetlights. Up to about ${s.rate} an hour in a dark sky.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  a.download = `pale-${s.name.toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function darkWords(d: Darkness, now: number) {
  // Already dark: say so, and say how long it lasts.
  if (d.dark && d.darkEnds && now >= d.dark && now < d.darkEnds) {
    return {
      main: "It is dark now",
      detail: `The sky stays dark until ${ukTime(d.darkEnds)}, and the Sun rises at ${d.sunrise ? ukTime(d.sunrise) : "dawn"}.`,
    };
  }
  if (d.dark) {
    return {
      main: `Properly dark from ${ukTime(d.dark)}`,
      detail: `Sunset is at ${d.sunset ? ukTime(d.sunset) : "the usual time"}. The sky stays dark until ${d.darkEnds ? ukTime(d.darkEnds) : "dawn"}, and the Sun rises at ${d.sunrise ? ukTime(d.sunrise) : "dawn"}.`,
    };
  }
  return {
    main: "It never gets fully dark tonight",
    detail: `Near midsummer the Sun never sinks far enough below the horizon for a fully dark UK sky. Sunset is at ${d.sunset ? ukTime(d.sunset) : "late evening"}, and the darkest point is around ${ukTime(d.darkest)}.`,
  };
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
  const planetsAnywhere = useMemo(() => planetsTonight(now), [now]);
  const season = useMemo(() => nextSeason(now), [now]);
  const meteorShowers = useMemo(() => showers(now), [now]);

  const note = useMemo(() => noteProgress(now), [now]);
  const shape = useMemo(() => shapeFor(new Date(now)), [now]);
  const darkness = useMemo(() => darknessTonight(now), [now]);
  // The sky at 9pm, or the sky right now if it is later than that and still night.
  const ninePm = useMemo(() => ninePmTonight(now), [now]);
  const showNow = now > ninePm && now < (darkness.sunrise ?? ninePm);
  const chartTime = showNow ? now : ninePm;
  const dark = darkWords(darkness, now);
  // Each planet's best time from the UK tonight, from its real height in the sky.
  const planets: Planet[] = useMemo(
    () => planetsAnywhere.map((p) => (p.visible ? { ...p, ...planetSlot(p.id, darkness, ninePm) } : p)),
    [planetsAnywhere, darkness, ninePm],
  );
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
            {formatDay(now)}. Step outside and look up. This is what is above you, from anywhere in the UK.
          </p>
          <p className="mt-6 mb-0 font-serif text-[24px] md:text-[28px] leading-snug max-w-[36rem]" style={{ color: C.text }}>
            {summary(m, planets, shape)}
          </p>
        </header>

        <Entry title="When to look">
          <p className="m-0 font-serif text-[22px] leading-tight">{dark.main}</p>
          <p className="mt-2 mb-0 text-[15px] leading-relaxed" style={{ color: C.muted }}>{dark.detail}</p>
          <p className="mt-2 mb-0 text-[13px]" style={{ color: C.faint }}>
            Times are for London. Elsewhere in the UK they shift by a few minutes.
          </p>
        </Entry>

        <Entry title={showNow ? "The sky now" : "The sky at 9pm"}>
          <SkyChart time={chartTime} shape={shape} moonLit={m.illumination / 100} />
          <p className="mt-3 mb-0 text-[14px] leading-relaxed max-w-[34rem]" style={{ color: C.muted }}>
            The edge of the circle is the horizon, and the middle is straight overhead. Face south and S is in front of
            you, with E on your left. This month's shape is drawn in gold.
          </p>
        </Entry>

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
                    <span className="block mt-1 text-[14px]" style={{ color: C.tint }}>
                      The light you see left it {lightTimeWords(p.au)} ago.
                    </span>
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

        <Entry title="One shape to find">
          <p className="m-0 font-serif text-[22px] leading-tight" style={{ color: C.text }}>{shape.name}</p>
          <p className="mt-2 mb-0 text-[15px] leading-relaxed" style={{ color: C.text }}>{shape.where}</p>
          <p className="mt-2 mb-0 text-[14px] leading-relaxed" style={{ color: C.muted }}>{shape.fact}</p>
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
                  {s.peakTime > now && (
                    <>
                      {" "}
                      <button type="button" onClick={() => showerReminder(s)} className="underline underline-offset-4" style={{ color: C.tint }}>
                        Add to my calendar
                      </button>
                    </>
                  )}
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
              {season.northern}.
            </p>
          </Entry>
        )}

        <Entry title="Further out">
          <div className="flex items-start gap-5">
            <Thumb src={pinImage(pin)} alt={pin.image.alt} />
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
            Want more? See how far away it all is on the{" "}
            <Link href="/scale" className="underline underline-offset-4" style={{ color: C.tint }}>scale of the universe</Link>, or look back at{" "}
            <Link href="/discoveries" className="underline underline-offset-4" style={{ color: C.tint }}>the latest pictures</Link>.
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
