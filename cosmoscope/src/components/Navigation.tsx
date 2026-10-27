import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, X } from "lucide-react";
import { APP_STORE_URL } from "@/lib/links";

const TINT = "#A9C3E0";
const TEXT = "#E8ECF1";
const MUTED = "#A3AFBC";
const RULE = "#1C2533";

// The five main places, the same on every screen size. Notes comes first: it is the reason to come back.
const MAIN = [
  { path: "/note", label: "Notes" },
  { path: "/", label: "Universe" },
  { path: "/tonight", label: "Tonight" },
  { path: "/scale", label: "Scale" },
  { path: "/simulations", label: "Simulations" },
];

// Everything else, behind More.
const MORE = [
  { path: "/discoveries", label: "This week in the universe" },
  { path: "/exoplanets", label: "Other worlds" },
  { path: "/constellations", label: "Constellation guide" },
  { path: "/apod", label: "Picture of the day" },
  { path: "/about", label: "About" },
  { path: "/credits", label: "Sources and credits" },
];

// On phones the bar has room for four places and More. Simulations moves into More there.
const PHONE_BAR = MAIN.filter((m) => m.path !== "/simulations");
const PHONE_MORE = [MAIN.find((m) => m.path === "/simulations")!, ...MORE];

function isActive(location: string, path: string) {
  if (path === "/") return location === "/";
  return location === path || location.startsWith(path + "/");
}

function Wordmark({ size = 20 }: { size?: number }) {
  return <span className="font-serif" style={{ fontSize: size + 2, fontWeight: 500, letterSpacing: "0.26em", color: TEXT }}>PALE</span>;
}

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close either menu with Escape, on a click outside, or when the page changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    setSheetOpen(false);
  }, [location]);

  const moreActive = MORE.some((l) => isActive(location, l.path));
  const phoneMoreActive = PHONE_MORE.some((l) => isActive(location, l.path));

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes paleMenuIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pale-anim { animation: none !important; } }
      `}</style>

      {/* Desktop header: name on the left, the five places in the middle, More and the app on the right */}
      <header
        className="hidden md:grid fixed top-0 left-0 right-0 z-50 h-16 items-center px-6 grid-cols-[1fr_auto_1fr]"
        style={{
          background: "rgba(5,7,12,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <Link href="/" aria-label="PALE home" className="justify-self-start no-underline">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-5 lg:gap-8">
          {MAIN.map((item) => {
            const active = isActive(location, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? "page" : undefined}
                className="relative py-2 no-underline transition-colors duration-150 hover:text-white"
                style={{ fontSize: 15, fontWeight: 500, color: active ? TEXT : MUTED }}
              >
                {item.label}
                {active && <span className="absolute left-0 right-0 -bottom-[1px] h-px" style={{ background: TINT }} />}
              </Link>
            );
          })}
        </nav>

        <div className="justify-self-end flex items-center gap-3">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors hover:text-white hover:bg-white/5"
              style={{ fontSize: 15, fontWeight: 500, color: moreActive || menuOpen ? TEXT : MUTED }}
            >
              More
              <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: menuOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="pale-anim absolute right-0 top-[calc(100%+10px)] w-56 rounded-lg py-1.5"
                style={{ background: "#0A0F17", border: `1px solid ${RULE}`, boxShadow: "0 12px 32px rgba(0,0,0,0.45)", animation: "paleMenuIn 140ms ease-out" }}
              >
                {MORE.map((link) => {
                  const active = isActive(location, link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      className="block px-4 py-2 no-underline transition-colors hover:bg-white/5"
                      style={{ fontSize: 15, color: active ? TINT : TEXT }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          {APP_STORE_URL && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline rounded-md px-3.5 py-1.5 transition-colors hover:bg-white/5 whitespace-nowrap"
              style={{ fontSize: 14, fontWeight: 500, border: "1px solid #2A3546", color: TEXT }}
            >
              Get the app
            </a>
          )}
        </div>
      </header>

      {/* Phone header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: "rgba(5,7,12,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${RULE}`,
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

      {/* Phone tab bar: five equal places */}
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5"
        style={{
          background: "rgba(5,7,12,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${RULE}`,
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
              className="relative min-w-0 flex items-center justify-center py-3.5 no-underline"
              style={{ fontSize: 13, fontWeight: 500, color: active ? TEXT : MUTED }}
            >
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: TINT }} />}
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen((o) => !o)}
          className="relative min-w-0 flex items-center justify-center py-3.5"
          style={{ fontSize: 13, fontWeight: 500, color: phoneMoreActive || sheetOpen ? TEXT : MUTED }}
        >
          {phoneMoreActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full" style={{ background: TINT }} />}
          More
        </button>
      </nav>

      {sheetOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSheetOpen(false)} />
          <div
            role="dialog"
            aria-label="More"
            className="pale-anim relative rounded-t-xl p-6 pb-10"
            style={{
              background: "#0A0F17",
              border: `1px solid ${RULE}`,
              borderBottom: "none",
              animation: "slideUp 250ms ease-out",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="m-0 text-[22px]" style={{ color: TEXT, fontWeight: 400 }}>More</h2>
              <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="p-2 rounded-full hover:bg-white/10">
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
                      setSheetOpen(false);
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
