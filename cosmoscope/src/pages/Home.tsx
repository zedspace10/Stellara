import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useReducedMotion } from "framer-motion";
import Footer from "@/components/Footer";
import { APP_STORE_URL } from "@/lib/links";

const C = {
  bg: "#05070C",
  stage: "#070A12",
  card: "#0D1520",
  text: "#F5FAFF",
  muted: "#A7B6C6",
  faint: "#7C8C9C",
  tint: "#8DEBFF",
  warm: "#F3DDB0",
  border: "#1D3040",
  luminous: "#35637A",
};

type Stage = { name: string; eyebrow: string; title: string; body: string };

const STAGES: Stage[] = [
  { name: "Earth", eyebrow: "Earth", title: "Everything you know is here.", body: "Every city, every ocean, every person you have ever met. Now step back." },
  { name: "Earth and the Moon", eyebrow: "Earth and the Moon", title: "384,400 km.", body: "Every journey any human has ever made has stayed within about this distance. Light crosses it in 1.3 seconds." },
  { name: "Inner solar system", eyebrow: "The inner solar system", title: "Sunlight takes about 8 minutes to reach us.", body: "Mercury, Venus, Earth and Mars: four rocky worlds circling one ordinary star." },
  { name: "Solar system", eyebrow: "The solar system", title: "About four hours of light, out to Neptune.", body: "Four giant worlds of gas and ice. Earth is now too small to draw." },
  { name: "Nearby stars", eyebrow: "Our neighbourhood", title: "The Sun becomes a star among stars.", body: "Light from the nearest one, Proxima Centauri, takes more than four years to reach us." },
  { name: "The Milky Way", eyebrow: "The Milky Way", title: "One galaxy, hundreds of billions of stars.", body: "About 100,000 light years across. Our Sun is one quiet point around 26,000 light years from the centre." },
  { name: "Looking back", eyebrow: "Looking back", title: "In 1990, Voyager 1 turned around.", body: "From about 6 billion km away, it photographed Earth. Our whole world filled less than a single pixel." },
];

// Opacity and scale of each layer at each of the seven stages.
const LAYERS = {
  earth: { o: [1, 1, 0, 0, 0, 0, 0], s: [1, 0.12, 0.04, 0.02, 0.02, 0.02, 0.02] },
  moon: { o: [0, 1, 0, 0, 0, 0, 0], s: [5, 1, 0.12, 0.05, 0.05, 0.05, 0.05] },
  inner: { o: [0, 0, 1, 1, 0, 0, 0], s: [12, 4, 1, 0.14, 0.04, 0.04, 0.04] },
  outer: { o: [0, 0, 0, 1, 0, 0, 0], s: [20, 12, 6, 1, 0.08, 0.08, 0.08] },
  stars: { o: [0, 0, 0, 0, 1, 0, 0], s: [3, 3, 3, 2.4, 1, 0.5, 0.5] },
  galaxy: { o: [0, 0, 0, 0, 0, 1, 0], s: [4, 4, 4, 4, 3, 1, 0.8] },
  final: { o: [0, 0, 0, 0, 0, 0, 1], s: [1, 1, 1, 1, 1, 1, 1] },
};

type LayerName = keyof typeof LAYERS;

function makeStars() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 90 }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 1.8,
    a: 0.3 + rand() * 0.6,
  }));
}

function Ring({ size, rotate, dot, dotColor, border = "rgba(167,182,198,0.26)", glow }: {
  size: number; rotate: number; dot: number; dotColor: string; border?: string; glow?: boolean;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: "50%", top: "50%", width: `${size}%`, aspectRatio: "1",
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        border: `1px solid ${border}`,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: "50%", top: 0, width: dot, height: dot, marginLeft: -dot / 2, marginTop: -dot / 2,
          background: dotColor,
          boxShadow: glow ? "0 0 8px 2px rgba(141,235,255,0.6)" : undefined,
        }}
      />
    </div>
  );
}

function ZoomOut() {
  const [stage, setStage] = useState(0);
  const reduceMotion = useReducedMotion();
  const stars = useMemo(makeStars, []);
  const last = STAGES.length - 1;
  const current = STAGES[stage];

  const layer = (name: LayerName): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: LAYERS[name].o[stage],
    transform: `scale(${LAYERS[name].s[stage]})`,
    transition: reduceMotion ? "none" : "opacity 900ms ease, transform 1300ms cubic-bezier(0.22,0.7,0.2,1)",
  });

  const next = () => setStage((s) => (s === last ? 0 : s + 1));
  const back = () => setStage((s) => Math.max(0, s - 1));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setStage((s) => Math.min(last, s + 1)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); back(); }
  };

  return (
    <section
      aria-label="Zoom out from Earth"
      className="max-w-[1240px] mx-auto px-6 pt-6 pb-24 flex flex-wrap items-center gap-12"
    >
      <div className="flex justify-center min-w-0" style={{ flex: "1 1 440px" }}>
        <div
          tabIndex={0}
          role="img"
          aria-label={`Illustration: ${current.name}. Use the arrow keys to zoom in and out.`}
          onKeyDown={onKeyDown}
          className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-[#B9F3FF]"
          style={{ aspectRatio: "1", background: C.stage, border: `1px solid ${C.border}` }}
        >
          <div style={layer("stars")}>
            {stars.map((st, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.size, height: st.size, background: C.text, opacity: st.a }}
              />
            ))}
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 10, height: 10, margin: "-5px 0 0 -5px", background: "#FFE7A8", boxShadow: "0 0 14px 4px rgba(255,214,120,0.55)" }} />
            <div className="absolute text-xs" style={{ left: "50%", top: "50%", margin: "12px 0 0 12px", color: C.warm }}>The Sun</div>
            <div className="absolute rounded-full" style={{ left: "63%", top: "61%", width: 6, height: 6, background: "#FFB3A0" }} />
            <div className="absolute text-xs" style={{ left: "63%", top: "61%", margin: "10px 0 0 10px", color: C.muted }}>Proxima Centauri</div>
          </div>

          <div style={layer("galaxy")}>
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: "92%", height: "36%", transform: "translate(-50%, -50%) rotate(-18deg)", background: "radial-gradient(ellipse at center, rgba(243,221,176,0.30), rgba(169,149,255,0.14) 45%, rgba(7,10,18,0) 72%)" }} />
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: "64%", height: "20%", transform: "translate(-50%, -50%) rotate(-18deg)", background: "radial-gradient(ellipse at center, rgba(255,236,196,0.55), rgba(243,221,176,0.18) 50%, rgba(7,10,18,0) 75%)" }} />
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: "22%", height: "12%", transform: "translate(-50%, -50%) rotate(-18deg)", background: "radial-gradient(ellipse at center, rgba(255,246,228,0.95), rgba(255,236,196,0.5) 35%, rgba(255,236,196,0) 70%)" }} />
            <div className="absolute rounded-full" style={{ left: "69%", top: "44%", width: 8, height: 8, background: C.tint, boxShadow: "0 0 10px 3px rgba(141,235,255,0.7)" }} />
            <div className="absolute text-xs" style={{ left: "69%", top: "44%", margin: "-30px 0 0 -20px", color: C.tint }}>You are here</div>
          </div>

          <div style={layer("outer")}>
            <Ring size={30} rotate={40} dot={12} dotColor="#E3B98C" />
            <Ring size={50} rotate={160} dot={10} dotColor={C.warm} />
            <Ring size={72} rotate={260} dot={8} dotColor="#A9E6EE" />
            <Ring size={92} rotate={320} dot={8} dotColor="#7FA7FF" />
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 6, height: 6, margin: "-3px 0 0 -3px", background: "#FFE7A8", boxShadow: "0 0 10px 3px rgba(255,214,120,0.5)" }} />
          </div>

          <div style={layer("inner")}>
            <Ring size={22} rotate={110} dot={6} dotColor="#B9B2A8" />
            <Ring size={38} rotate={220} dot={9} dotColor={C.warm} />
            <Ring size={54} rotate={35} dot={10} dotColor="#5BC2F0" border="rgba(141,235,255,0.45)" glow />
            <Ring size={76} rotate={300} dot={7} dotColor="#E08A6A" />
            <div className="absolute rounded-full" style={{ left: "50%", top: "50%", width: 22, height: 22, margin: "-11px 0 0 -11px", background: "#FFE7A8", boxShadow: "0 0 30px 10px rgba(255,214,120,0.45)" }} />
          </div>

          <div style={layer("moon")}>
            <Ring size={70} rotate={48} dot={12} dotColor="#CFD6DE" border="rgba(167,182,198,0.3)" />
          </div>

          <div
            className="absolute rounded-full"
            style={{
              left: "50%", top: "50%", width: "30%", aspectRatio: "1", marginLeft: "-15%", marginTop: "-15%",
              background: "radial-gradient(circle at 35% 30%, #CFF6FF, #4AA8DE 42%, #164A78 78%, #0B2440)",
              boxShadow: "0 0 60px 6px rgba(141,235,255,0.25)",
              pointerEvents: "none",
              opacity: LAYERS.earth.o[stage],
              transform: `scale(${LAYERS.earth.s[stage]})`,
              transition: reduceMotion ? "none" : "opacity 900ms ease, transform 1300ms cubic-bezier(0.22,0.7,0.2,1)",
            }}
          />

          <div style={layer("final")}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(7,10,18,0) 40%, rgba(243,221,176,0.07) 48%, rgba(7,10,18,0) 56%)" }} />
            <div className="absolute rounded-full" style={{ left: "57%", top: "52%", width: 4, height: 4, background: "#A9E9FF", boxShadow: "0 0 6px 2px rgba(141,235,255,0.6)" }} />
          </div>

          <div className="absolute left-5 top-4 text-xs uppercase tracking-[0.12em]" style={{ color: C.faint }}>
            {stage + 1} of {STAGES.length}
          </div>
          <div className="absolute right-5 bottom-4 text-[11px]" style={{ color: C.faint }}>
            Not to scale
          </div>
        </div>
      </div>

      <div className="min-w-0 max-w-[520px]" style={{ flex: "1 1 360px" }}>
        <p className="m-0 text-sm uppercase tracking-[0.2em]" style={{ color: C.tint }}>A calm space to think</p>
        <div aria-live="polite" className="mt-5" style={{ minHeight: 230 }}>
          <p className="m-0 text-sm" style={{ color: C.muted }}>{current.eyebrow}</p>
          <h1 className="mt-2 mb-0 text-4xl md:text-[46px] font-bold leading-[1.12] tracking-[-0.02em]" style={{ color: C.text }}>
            {current.title}
          </h1>
          <p className="mt-4 mb-0 text-lg leading-relaxed" style={{ color: C.muted }}>{current.body}</p>
          {stage === last && (
            <p className="mt-4 mb-0 text-lg leading-relaxed" style={{ color: C.text }}>
              Whatever you are carrying tonight, it is happening on that small blue point.
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stage === 0}
            className="rounded-full px-5 py-3 text-[15px] transition-opacity disabled:opacity-40 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B9F3FF]"
            style={{ color: C.text, background: "transparent", border: `1px solid ${C.border}` }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-full px-6 py-3 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B9F3FF]"
            style={{ color: C.bg, background: C.tint }}
          >
            {stage === last ? "Start again" : "Zoom out"}
          </button>
          {stage === last && (
            <Link href="/tonight" className="px-1 py-3 text-[15px] font-semibold no-underline" style={{ color: C.warm }}>
              Look up tonight
            </Link>
          )}
        </div>

        <div role="group" aria-label="Zoom level" className="mt-4 flex gap-0.5">
          {STAGES.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setStage(i)}
              aria-label={`Go to ${s.name}`}
              aria-pressed={i === stage}
              className="flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer"
              style={{ width: 30, height: 44 }}
            >
              <span
                className="block rounded-full transition-all"
                style={{ width: i === stage ? 22 : 6, height: 6, background: i === stage ? C.tint : i < stage ? C.luminous : C.border }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Door({ title, body, detail, href, cta, color, icon }: {
  title: string; body: string; detail: string; href: string; cta: string; color: string; icon: React.ReactNode;
}) {
  return (
    <article
      className="min-w-0 p-7 rounded-[22px] flex flex-col gap-3.5"
      style={{ flex: "1 1 300px", background: C.card, border: `1px solid ${C.border}` }}
    >
      {icon}
      <h3 className="m-0 text-[22px] font-semibold" style={{ color: C.text }}>{title}</h3>
      <p className="m-0 text-base leading-relaxed" style={{ color: C.muted }}>{body}</p>
      <p className="m-0 text-sm" style={{ color: C.faint }}>{detail}</p>
      <Link href={href} className="mt-auto pt-2 text-[15px] font-semibold no-underline" style={{ color }}>
        {cta}
      </Link>
    </article>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "PALE: a calm space to think";
  }, []);

  return (
    <div className="min-h-screen pt-16" style={{ background: C.bg, color: C.text }}>
      <ZoomOut />

      <section aria-labelledby="doors-title" className="max-w-[1240px] mx-auto px-6 py-16">
        <h2 id="doors-title" className="m-0 text-[34px] font-bold leading-tight tracking-[-0.01em]">Two ways in</h2>
        <p className="mt-2.5 mb-0 text-[17px] max-w-[560px]" style={{ color: C.muted }}>
          Explore the universe from your screen, or step outside and look up.
        </p>
        <div className="mt-9 flex flex-wrap gap-5">
          <Door
            title="Explore"
            body="Fly through the solar system, watch a star being born, and feel the true scale of everything."
            detail="Interactive universe · Our galaxy · Simulations · Scale of the universe"
            href="/explore"
            cta="Start exploring"
            color={C.tint}
            icon={
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={C.tint} strokeWidth="1.6" aria-hidden="true">
                <circle cx="16" cy="16" r="5" />
                <ellipse cx="16" cy="16" rx="13" ry="5.5" transform="rotate(-25 16 16)" />
              </svg>
            }
          />
          <Door
            title="Tonight"
            body="What is in your sky tonight, from the Moon's phase to the planets you can see without a telescope."
            detail="Tonight's sky · The Observatory"
            href="/tonight"
            cta="Look up tonight"
            color={C.warm}
            icon={
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={C.warm} strokeWidth="1.6" aria-hidden="true">
                <path d="M20 6 A10 10 0 1 0 26 20 A8 8 0 0 1 20 6 Z" />
                <path d="M8 7 v3 M6.5 8.5 h3" />
              </svg>
            }
          />
        </div>
      </section>

      <section aria-labelledby="app-title" className="max-w-[1240px] mx-auto px-6 pt-12 pb-16">
        <div
          className="px-6 md:px-10 py-11 rounded-[28px] flex flex-wrap items-center justify-between gap-7"
          style={{ background: C.card, border: `1px solid ${C.luminous}` }}
        >
          <div className="min-w-0" style={{ flex: "1 1 420px" }}>
            <h2 id="app-title" className="m-0 text-[30px] font-bold leading-tight">PALE on your phone</h2>
            <p className="mt-3 mb-0 text-[17px] max-w-[520px]" style={{ color: C.muted }}>
              The same calm space, in your pocket. Zoom out with Shift, check tonight's sky, and get a quiet reminder at dusk when there is something worth looking up for.
            </p>
          </div>
          {APP_STORE_URL ? (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[15px] font-semibold no-underline"
              style={{ background: C.text, color: C.bg }}
            >
              Download on the App Store
            </a>
          ) : (
            <p className="m-0 text-[15px] font-semibold" style={{ color: C.text }}>Search for PALE on the App Store</p>
          )}
        </div>
      </section>

      <section aria-labelledby="about-title" className="max-w-[1240px] mx-auto px-6 pt-6 pb-10 flex flex-wrap gap-10">
        <div className="min-w-0" style={{ flex: "1 1 380px" }}>
          <h2 id="about-title" className="m-0 text-[30px] font-bold leading-tight">Why PALE</h2>
          <p className="mt-3.5 mb-0 text-[17px] leading-relaxed" style={{ color: C.muted }}>
            Seeing how vast the universe is can make a hard day feel a little lighter. PALE is built to give people that moment, on purpose, whenever they need it.
          </p>
        </div>
        <div className="min-w-0" style={{ flex: "1 1 380px" }}>
          <p className="m-0 text-[17px] leading-relaxed" style={{ color: C.muted }}>
            PALE is made by Stellara, a not for profit space education project in the UK. Every fact is checked against its source, and anything poetic is clearly reflection, not science.
          </p>
          <Link href="/about" className="inline-block mt-3.5 text-[15px] font-semibold no-underline" style={{ color: C.tint }}>
            Read our story
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
