import { useEffect, useState } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { PINS, Pin, pinDistance, pinDate, isThisWeek } from "@/data/pins";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const TINT = "#A9C3E0";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

// The picture, with its credit right beneath it as the image's owners ask. If it cannot be
// loaded, a quiet panel takes its place rather than a broken image.
export function PinImage({ pin, className = "" }: { pin: Pin; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`m-0 ${className}`}>
      {failed ? (
        <div className="w-full aspect-[4/3] rounded-lg flex items-center justify-center text-center px-6" style={{ background: "radial-gradient(circle at 50% 45%, #1a2232, #070a10 70%)", border: `1px solid ${RULE}` }}>
          <span className="font-serif text-[22px]" style={{ color: BODY }}>{pin.object}</span>
        </div>
      ) : (
        <img
          src={pin.image.src}
          alt={pin.image.alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-auto rounded-lg block"
          style={{ border: `1px solid ${RULE}`, background: "#070a10" }}
        />
      )}
      <figcaption className="mt-2 text-[12px] leading-snug" style={{ color: MUTED }}>
        Image: {pin.image.credit}
        {pin.image.licence ? ` (${pin.image.licence})` : ""}
      </figcaption>
    </figure>
  );
}

function PinArticle({ pin, latest }: { pin: Pin; latest: boolean }) {
  return (
    <article id={pin.id} className="scroll-mt-24 pt-12 pb-12" style={{ borderTop: `1px solid ${RULE}` }}>
      <p className="m-0 text-[14px]" style={{ color: latest ? WARM : MUTED }}>{latest ? `${isThisWeek(pin) ? "New this week" : "Latest"}, ${pinDate(pin)}` : pinDate(pin)}</p>
      <h2 className="m-0 mt-2 text-[32px] md:text-[40px] leading-tight font-normal" style={{ color: TEXT }}>{pin.title}</h2>
      <p className="m-0 mt-2 text-[15px]" style={{ color: BODY }}>
        {pin.object}, {pinDistance(pin)}, in {pin.constellation}
      </p>

      <PinImage pin={pin} className="mt-6" />

      <div className="mt-6 space-y-4 text-[17px] leading-[1.7]" style={{ color: BODY }}>
        {pin.body.map((p, i) => <p key={i} className="m-0">{p}</p>)}
      </div>
      {pin.reflection && (
        <p className="m-0 mt-6 pl-4 font-serif italic text-[20px] leading-snug" style={{ color: TEXT, borderLeft: `1px solid ${WARM}` }}>
          {pin.reflection}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/?pin=${pin.id}`} className="rounded-md px-4 py-2 text-[15px] no-underline" style={{ background: TEXT, color: "#05070C" }}>
          See where it is
        </Link>
        {pin.simulation && (
          <Link href={`/simulations/${pin.simulation.id}`} className="rounded-md px-4 py-2 text-[15px] no-underline" style={{ border: "1px solid #2A3546", color: TEXT }}>
            {pin.simulation.label}
          </Link>
        )}
        <a href={pin.source.href} target="_blank" rel="noopener noreferrer" className="px-1 py-2 text-[15px] underline underline-offset-4" style={{ color: TINT }}>
          {pin.source.label}
        </a>
      </div>
    </article>
  );
}

export default function Discoveries() {
  useEffect(() => {
    document.title = "This week in the universe | PALE";
  }, []);
  const pins = [...PINS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C" }}>
      <div className="max-w-[44rem] mx-auto px-5 md:px-0 pt-14">
        <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>This week in the universe</h1>
        <p className="mt-4 mb-10 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Every week, a new picture from Hubble or Webb, and what it shows. Each one is placed in the 3D universe
          where it really is, so over time they build into a map of what we have seen.
        </p>
        {pins.map((p, i) => <PinArticle key={p.id} pin={p} latest={i === 0} />)}
      </div>
      <Footer />
    </div>
  );
}
