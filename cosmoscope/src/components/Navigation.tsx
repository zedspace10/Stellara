import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, X } from "lucide-react";
import { APP_STORE_URL } from "@/lib/links";
import { LATEST_PIN, isThisWeek } from "@/data/pins";

const TINT = "#A9C3E0";
const TEXT = "#E8ECF1";
const MUTED = "#A3AFBC";
const FAINT = "#7C8794";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

interface Place {
  path: string;
  label: string;
  /** A longer name for menus, where there is room. */
  long?: string;
  /** One line on what is there, shown in menus. */
  blurb?: string;
  /** "md": a tab on any computer screen. "xl": a tab only on wide screens, in More otherwise. */
  tab?: "md" | "xl";
}

// Every place on the site, in the order they appear. The universe first, then Notes.
const PLACES: Place[] = [
  { path: "/", label: "Universe", tab: "md" },
  { path: "/note", label: "Notes", tab: "md" },
  { path: "/discoveries", label: "This week", long: "This week in the universe", blurb: "A new Hubble or Webb picture every week", tab: "xl" },
  { path: "/tonight", label: "Tonight", tab: "md" },
  { path: "/scale", label: "Scale", tab: "md" },
  { path: "/simulations", label: "Simulations", blurb: "The biggest events in the universe, step by step", tab: "md" },
  { path: "/exoplanets", label: "Other worlds", blurb: "More than 6,000 planets around other stars", tab: "xl" },
  { path: "/constellations", label: "Constellation guide", blurb: "The shapes in the sky, and their stories" },
  { path: "/apod", label: "Picture of the day", blurb: "NASA's astronomy picture, new every day" },
];
// Quieter links, at the bottom of the menus.
const SMALL: Place[] = [
  { path: "/about", label: "About" },
  { path: "/credits", label: "Sources and credits" },
];

const TABS = PLACES.filter((p) => p.tab);
// In the computer menu: everything that is not always a tab. Wide-screen tabs only appear here below that width.
const MENU = PLACES.filter((p) => p.tab !== "md");

// On phones the bar has room for four places and More.
const PHONE_BAR_PATHS = ["/", "/note", "/tonight", "/scale"];
const PHONE_BAR = PLACES.filter((p) => PHONE_BAR_PATHS.includes(p.path));
const PHONE_MORE = PLACES.filter((p) => !PHONE_BAR_PATHS.includes(p.path));

const PIN_SEEN_KEY = "pale_pin_seen";

function isActive(location: string, path: string) {
  if (path === "/") return location === "/";
  return location === path || location.startsWith(path + "/");
}

function Wordmark({ size = 20 }: { size?: number }) {
  return <span className="font-serif" style={{ fontSize: size + 2, fontWeight: 500, letterSpacing: "0.26em", color: TEXT }}>PALE</span>;
}

function NewDot({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 rounded-full ${className}`} style={{ background: WARM }} />;
}

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // A small warm dot on This week until the newest picture has been looked at.
  const [pinSeen, setPinSeen] = useState(() => {
    try {
      return localStorage.getItem(PIN_SEEN_KEY) === LATEST_PIN.id;
    } catch {
      return true;
    }
  });
  const pinIsNew = !pinSeen && isThisWeek(LATEST_PIN);

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
    if (location === "/discoveries") {
      try {
        localStorage.setItem(PIN_SEEN_KEY, LATEST_PIN.id);
      } catch {
        /* storage blocked */
      }
      setPinSeen(true);
    }
  }, [location]);

  const menuActive = MENU.some((l) => isActive(location, l.path)) || SMALL.some((l) => isActive(location, l.path));
  const phoneMoreActive = PHONE_MORE.some((l) => isActive(location, l.path)) || SMALL.some((l) => isActive(location, l.path));

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes paleMenuIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pale-anim { animation: none !important; } }
      `}</style>

      {/* Computer header: name on the left, the main places in the middle, More and the app on the right */}
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
          {TABS.map((item) => {
            const active = isActive(location, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 no-underline transition-colors duration-150 hover:text-white whitespace-nowrap ${item.tab === "xl" ? "hidden xl:block" : ""}`}
                style={{ fontSize: 15, fontWeight: 500, color: active ? TEXT : MUTED }}
              >
                {item.label}
                {item.path === "/discoveries" && pinIsNew && <NewDot className="absolute -right-2.5 top-2" />}
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
              className="relative flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors hover:text-white hover:bg-white/5"
              style={{ fontSize: 15, fontWeight: 500, color: menuActive || menuOpen ? TEXT : MUTED }}
            >
              More
              <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: menuOpen ? "rotate(180deg)" : "none" }} />
              {pinIsNew && <NewDot className="absolute right-1 top-1 xl:hidden" />}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="pale-anim absolute right-0 top-[calc(100%+10px)] w-80 rounded-lg py-2"
                style={{ background: "#0A0F17", border: `1px solid ${RULE}`, boxShadow: "0 12px 32px rgba(0,0,0,0.45)", animation: "paleMenuIn 140ms ease-out" }}
              >
                {MENU.map((link) => {
                  const active = isActive(location, link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      className={`block px-4 py-2.5 no-underline transition-colors hover:bg-white/5 ${link.tab === "xl" ? "xl:hidden" : ""}`}
                    >
                      <span className="flex items-center gap-2 text-[15px]" style={{ color: active ? TINT : TEXT }}>
                        {link.long ?? link.label}
                        {link.path === "/discoveries" && pinIsNew && <span className="text-[12px]" style={{ color: WARM }}>New</span>}
                      </span>
                      {link.blurb && <span className="block mt-0.5 text-[13px] leading-snug" style={{ color: FAINT }}>{link.blurb}</span>}
                    </Link>
                  );
                })}
                <div className="mt-2 pt-2 px-4 pb-1 flex gap-5" style={{ borderTop: `1px solid ${RULE}` }}>
                  {SMALL.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      className="py-1.5 text-[14px] no-underline transition-colors hover:text-white"
                      style={{ color: isActive(location, link.path) ? TINT : MUTED }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
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
          <span className="relative">
            More
            {pinIsNew && <NewDot className="absolute -right-2.5 top-0" />}
          </span>
        </button>
      </nav>

      {sheetOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSheetOpen(false)} />
          <div
            role="dialog"
            aria-label="More"
            className="pale-anim relative rounded-t-xl px-4 pt-5 max-h-[85vh] overflow-y-auto"
            style={{
              background: "#0A0F17",
              border: `1px solid ${RULE}`,
              borderBottom: "none",
              animation: "slideUp 250ms ease-out",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="m-0 text-[22px]" style={{ color: TEXT, fontWeight: 400 }}>More</h2>
              <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" style={{ color: MUTED }} />
              </button>
            </div>
            <div>
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
                    className="block w-full px-3 py-3 rounded-md text-left"
                    style={{ background: active ? "rgba(169,195,224,0.06)" : "transparent" }}
                  >
                    <span className="flex items-center gap-2 text-[16px]" style={{ color: active ? TINT : TEXT }}>
                      {link.long ?? link.label}
                      {link.path === "/discoveries" && pinIsNew && <span className="text-[12px]" style={{ color: WARM }}>New</span>}
                    </span>
                    {link.blurb && <span className="block mt-0.5 text-[13px] leading-snug" style={{ color: FAINT }}>{link.blurb}</span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 pt-3 px-3 flex gap-6" style={{ borderTop: `1px solid ${RULE}` }}>
              {SMALL.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => {
                    setSheetOpen(false);
                    navigate(link.path);
                  }}
                  className="py-2 text-[15px] text-left"
                  style={{ color: isActive(location, link.path) ? TINT : MUTED }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
