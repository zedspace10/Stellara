import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { APP_STORE_URL } from "@/lib/links";

const NAV_ITEMS = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { id: "explore-all", label: "Everything to explore", path: "/explore" },
      { id: "universe", label: "Interactive universe", path: "/universe" },
      { id: "galaxy", label: "Our galaxy", path: "/galaxy" },
      { id: "scale", label: "Scale of the universe", path: "/scale" },
      { id: "simulations", label: "Simulations", path: "/simulations" },
      { id: "exoplanets", label: "Exoplanet explorer", path: "/exoplanets" },
    ],
  },
  {
    id: "tonight",
    label: "Tonight",
    items: [
      { id: "tonight-sky", label: "Tonight's sky", path: "/tonight" },
      { id: "observatory", label: "The Observatory", path: "/observatory" },
      { id: "apod", label: "Picture of the day", path: "/apod" },
      { id: "launches", label: "Launch tracker", path: "/launches" },
      { id: "news", label: "Space news", path: "/news" },
      { id: "history", label: "This week in space history", path: "/history" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { id: "constellations", label: "Constellation guide", path: "/constellations" },
      { id: "blackholes", label: "Black holes and relativity", path: "/blackholes" },
      { id: "build-universe", label: "Build your own universe", path: "/build-universe" },
      { id: "glossary", label: "Space glossary", path: "/glossary" },
      { id: "education", label: "Education centre", path: "/education" },
      { id: "blog", label: "Blog", path: "/blog" },
    ],
  },
];

const TINT = "#8DEBFF";
const TEXT = "#F5FAFF";
const MUTED = "#A7B6C6";

function Wordmark({ size = 20 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "0.32em", color: TEXT }}>PALE</span>
  );
}

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDrawer, setMobileDrawer] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileDrawer(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (path: string) => {
    setActiveDropdown(null);
    setMobileDrawer(null);
    navigate(path);
  };

  return (
    <>
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pale-anim { animation: none !important; }
        }
      `}</style>

      {/* Desktop header */}
      <header
        ref={navRef}
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6"
        style={{
          background: "rgba(5,7,12,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid #1D3040",
        }}
      >
        <Link href="/" aria-label="PALE home" className="shrink-0 no-underline">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = item.items.some((l) => location === l.path);
            const isOpen = activeDropdown === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => {
                  if (closeTimer.current) clearTimeout(closeTimer.current);
                  setActiveDropdown(item.id);
                }}
                onMouseLeave={() => {
                  closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
                }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                  className="flex items-center gap-1 py-2 px-1 transition-colors duration-150"
                  style={{ fontSize: 15, fontWeight: 500, color: isActive || isOpen ? TINT : MUTED }}
                >
                  {item.label}
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", opacity: 0.6 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    className="pale-anim absolute top-full left-0 mt-1 z-[100]"
                    style={{
                      background: "rgba(13,21,32,0.98)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid #1D3040",
                      borderRadius: 14,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                      padding: 8,
                      minWidth: 240,
                      animation: "dropdownIn 150ms ease-out",
                    }}
                  >
                    {item.items.map((link) => {
                      const current = location === link.path;
                      return (
                        <button
                          key={link.id}
                          type="button"
                          onClick={() => go(link.path)}
                          aria-current={current ? "page" : undefined}
                          className="flex items-center w-full px-4 py-2.5 rounded-lg text-left transition-colors duration-150 hover:bg-[rgba(141,235,255,0.08)]"
                          style={{ fontSize: 14, color: current ? TINT : TEXT }}
                        >
                          {link.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/about"
            className="py-2 px-1 transition-colors duration-150 no-underline"
            style={{ fontSize: 15, fontWeight: 500, color: location === "/about" ? TINT : MUTED }}
          >
            About
          </Link>

          {APP_STORE_URL && (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline rounded-full px-4 py-2"
              style={{ fontSize: 14, fontWeight: 600, background: TINT, color: "#05070C" }}
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
          borderBottom: "1px solid #1D3040",
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
            className="no-underline rounded-full px-3.5 py-1.5"
            style={{ fontSize: 13, fontWeight: 600, background: TINT, color: "#05070C" }}
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
          borderTop: "1px solid #1D3040",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.items.some((l) => location === l.path);
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={mobileDrawer === item.id}
              onClick={() => setMobileDrawer(mobileDrawer === item.id ? null : item.id)}
              className="flex-1 flex items-center justify-center py-3.5 transition-colors"
              style={{ fontSize: 13, fontWeight: 500, color: isActive ? TINT : MUTED }}
            >
              {item.label}
            </button>
          );
        })}
        <Link
          href="/about"
          className="flex-1 flex items-center justify-center py-3.5 transition-colors no-underline"
          style={{ fontSize: 13, fontWeight: 500, color: location === "/about" ? TINT : MUTED }}
        >
          About
        </Link>
      </nav>

      {/* Mobile drawer */}
      {mobileDrawer && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileDrawer(null)} />
          <div
            role="dialog"
            aria-label={NAV_ITEMS.find((i) => i.id === mobileDrawer)?.label}
            className="pale-anim relative rounded-t-2xl p-6 pb-10"
            style={{
              background: "rgba(13,21,32,0.99)",
              backdropFilter: "blur(24px)",
              border: "1px solid #1D3040",
              borderBottom: "none",
              animation: "slideUp 250ms ease-out",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: TINT }}>
                {NAV_ITEMS.find((i) => i.id === mobileDrawer)?.label}
              </h2>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileDrawer(null)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" style={{ color: MUTED }} />
              </button>
            </div>
            <div className="space-y-1">
              {NAV_ITEMS.find((i) => i.id === mobileDrawer)?.items.map((link) => {
                const current = location === link.path;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => go(link.path)}
                    aria-current={current ? "page" : undefined}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-base transition-colors text-left"
                    style={{ color: current ? TINT : TEXT, background: current ? "rgba(141,235,255,0.06)" : "transparent" }}
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
