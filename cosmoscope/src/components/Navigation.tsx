import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { APP_STORE_URL } from "@/lib/links";

const TINT = "#A9C3E0";
const TEXT = "#E8ECF1";
const MUTED = "#A3AFBC";

const MAIN = [
  { path: "/", label: "Universe" },
  { path: "/tonight", label: "Tonight" },
  { path: "/scale", label: "Scale" },
  { path: "/simulations", label: "Simulations" },
  { path: "/note", label: "Send a note" },
  { path: "/exoplanets", label: "Other worlds" },
  { path: "/about", label: "About" },
];

// On phones the bar holds four places; the rest sit behind More.
const PHONE_BAR = MAIN.slice(0, 4);
const PHONE_MORE = [
  { path: "/note", label: "Send a note to the universe" },
  { path: "/exoplanets", label: "Other worlds" },
  { path: "/constellations", label: "Constellation guide" },
  { path: "/apod", label: "Picture of the day" },
  { path: "/about", label: "About" },
];

function isActive(location: string, path: string) {
  if (path === "/") return location === "/";
  return location === path || location.startsWith(path + "/");
}

function Wordmark({ size = 20 }: { size?: number }) {
  return <span className="font-serif" style={{ fontSize: size + 2, fontWeight: 500, letterSpacing: "0.26em", color: TEXT }}>PALE</span>;
}

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const moreActive = PHONE_MORE.some((l) => isActive(location, l.path));

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .pale-anim { animation: none !important; } }
      `}</style>

      {/* Desktop header */}
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6"
        style={{
          background: "rgba(5,7,12,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #1C2533",
        }}
      >
        <Link href="/" aria-label="PALE home" className="shrink-0 no-underline">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-7">
          {MAIN.map((item) => {
            const active = isActive(location, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? "page" : undefined}
                className="py-2 no-underline transition-colors duration-150 hover:text-white underline-offset-[6px] decoration-1"
                style={{ fontSize: 15, fontWeight: 500, color: active ? TEXT : MUTED, textDecorationLine: active ? "underline" : "none", textDecorationColor: TINT }}
              >
                {item.label}
              </Link>
            );
          })}
          {APP_STORE_URL && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline rounded-md px-3.5 py-1.5 transition-colors hover:bg-white/5"
              style={{ fontSize: 14, fontWeight: 500, border: "1px solid #2A3546", color: TEXT }}
            >
              Get the app
            </a>
          )}
        </nav>
      </header>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: "rgba(5,7,12,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #1C2533",
        }}
      >
        <Link href="/" aria-label="PALE home" className="no-underline">
          <Wordmark size={18} />
        </Link>
        {APP_STORE_URL && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline rounded-md px-3 py-1.5"
            style={{ fontSize: 13, fontWeight: 500, border: "1px solid #2A3546", color: TEXT }}
          >
            Get the app
          </a>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: "rgba(5,7,12,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid #1C2533",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {PHONE_BAR.map((item) => {
          const active = isActive(location, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex items-center justify-center py-3.5 no-underline"
              style={{ fontSize: 13, fontWeight: 500, color: active ? TINT : MUTED }}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((o) => !o)}
          className="flex-1 flex items-center justify-center py-3.5"
          style={{ fontSize: 13, fontWeight: 500, color: moreActive || moreOpen ? TINT : MUTED }}
        >
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} />
          <div
            role="dialog"
            aria-label="More"
            className="pale-anim relative rounded-t-xl p-6 pb-10"
            style={{
              background: "#0A0F17",
              border: "1px solid #1C2533",
              borderBottom: "none",
              animation: "slideUp 250ms ease-out",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="m-0 text-[22px]" style={{ color: TEXT, fontWeight: 400 }}>More</h2>
              <button type="button" aria-label="Close" onClick={() => setMoreOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" style={{ color: MUTED }} />
              </button>
            </div>
            <div className="space-y-1">
              {PHONE_MORE.map((link) => {
                const active = isActive(location, link.path);
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      navigate(link.path);
                    }}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center w-full px-3 py-3 rounded-md text-base text-left"
                    style={{ color: active ? TINT : TEXT, background: active ? "rgba(169,195,224,0.06)" : "transparent" }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
