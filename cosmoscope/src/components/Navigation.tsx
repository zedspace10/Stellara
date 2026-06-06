import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";

const NAV_ITEMS = [
  {
    id: "explore",
    label: "EXPLORE",
    items: [
      { id: "universe", label: "Interactive Universe", path: "/" },
      { id: "scale", label: "Scale of the Universe", path: "/scale" },
      { id: "exoplanets", label: "Exoplanet Explorer", path: "/exoplanets" },
    ],
  },
  {
    id: "discover",
    label: "DISCOVER",
    items: [
      { id: "tonight", label: "Tonight's Sky", path: "/tonight" },
      { id: "apod", label: "Picture of the Day", path: "/apod" },
      { id: "news", label: "Space News", path: "/news" },
      { id: "launches", label: "Launch Tracker", path: "/launches" },
      { id: "history", label: "This Week in Space History", path: "/history" },
    ],
  },
  {
    id: "learn",
    label: "LEARN",
    items: [
      { id: "simulations", label: "Simulations", path: "/simulations" },
      { id: "build-universe", label: "Build Your Own Universe", path: "/build-universe" },
      { id: "blackholes", label: "Black Holes & Relativity", path: "/blackholes" },
      { id: "education", label: "Education Centre", path: "/education" },
      { id: "blog", label: "Blog", path: "/blog" },
      { id: "constellations", label: "Constellation Guide", path: "/constellations" },
      { id: "glossary", label: "Space Glossary", path: "/glossary" },
    ],
  },
];

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
      if (!navRef.current?.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
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
      `}</style>

      {/* Desktop header */}
      <header
        ref={navRef}
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6"
        style={{
          background: "rgba(5,5,15,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#4fc3f7" strokeWidth="8" />
            <circle cx="85" cy="50" r="12" fill="#4fc3f7" />
          </svg>
          <span className="text-xl font-bold tracking-wider" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <span className="text-white">STELLAR</span>
            <span style={{ color: "#ffd54f" }}>A</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.items?.some((l) => l.path && location === l.path);
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
                  closeTimer.current = setTimeout(() => setActiveDropdown(null), 100);
                }}
              >
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                  className="flex items-center gap-1 py-1 px-1 transition-colors duration-150"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    color: isActive ? "#ffd54f" : isOpen ? "#4fc3f7" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {item.label}
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", opacity: 0.6 }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 z-[100]"
                    style={{
                      background: "rgba(10,10,26,0.97)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(79,195,247,0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      padding: "8px",
                      minWidth: "220px",
                      animation: "dropdownIn 150ms ease-out",
                    }}
                  >
                    {item.items?.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveDropdown(null);
                          navigate(link.path);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-left transition-all duration-150"
                        style={{
                          fontSize: "14px",
                          fontFamily: "Inter, sans-serif",
                          color: location === link.path ? "#ffd54f" : "#e0e0e0",
                          background: location === link.path ? "rgba(255,213,79,0.06)" : "transparent",
                          borderLeft: location === link.path ? "2px solid rgba(255,213,79,0.5)" : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (location !== link.path) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(79,195,247,0.1)";
                            (e.currentTarget as HTMLElement).style.color = "#4fc3f7";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (location !== link.path) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#e0e0e0";
                          }
                        }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ABOUT direct link */}
          <Link
            href="/about"
            className="py-1 px-1 transition-colors duration-150"
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              fontWeight: 700,
              color: location === "/about" ? "#ffd54f" : "rgba(255,255,255,0.75)",
            }}
          >
            ABOUT
          </Link>

          {/* ASK pill */}
          <Link
            href="/ask"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold transition-all duration-150"
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              background: location === "/ask" ? "rgba(255,213,79,0.18)" : "rgba(255,213,79,0.1)",
              border: "1px solid rgba(255,213,79,0.4)",
              color: "#ffd54f",
            }}
          >
            ASK
          </Link>
        </nav>
      </header>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
        style={{
          background: "rgba(5,5,15,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-7 h-7">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#4fc3f7" strokeWidth="8" />
            <circle cx="85" cy="50" r="12" fill="#4fc3f7" />
          </svg>
          <span className="text-lg font-bold" style={{ fontFamily: "Orbitron, sans-serif" }}>
            <span className="text-white">STELLAR</span>
            <span style={{ color: "#ffd54f" }}>A</span>
          </span>
        </Link>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: "rgba(5,5,15,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(79,195,247,0.1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.items?.some((l) => l.path && location === l.path);
          return (
            <button
              key={item.id}
              onClick={() => setMobileDrawer(mobileDrawer === item.id ? null : item.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
              style={{ color: isActive ? "#4fc3f7" : "rgba(255,255,255,0.4)" }}
            >
              <span
                className="text-[10px] font-bold tracking-widest"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        <Link
          href="/about"
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
          style={{ color: location === "/about" ? "#4fc3f7" : "rgba(255,255,255,0.4)" }}
        >
          <span className="text-[10px] font-bold tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
            ABOUT
          </span>
        </Link>
        <Link
          href="/ask"
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5"
          style={{ color: location === "/ask" ? "#ffd54f" : "rgba(255,213,79,0.55)" }}
        >
          <span className="text-[10px] font-bold tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
            ASK
          </span>
        </Link>
      </nav>

      {/* Mobile drawer */}
      {mobileDrawer && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileDrawer(null)}
          />
          <div
            className="relative rounded-t-2xl p-6 pb-10"
            style={{
              background: "rgba(10,10,26,0.99)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(79,195,247,0.15)",
              borderBottom: "none",
              animation: "slideUp 250ms ease-out",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-sm font-bold tracking-widest"
                style={{ fontFamily: "Orbitron, sans-serif", color: "#4fc3f7" }}
              >
                {NAV_ITEMS.find((i) => i.id === mobileDrawer)?.label}
              </h2>
              <button onClick={() => setMobileDrawer(null)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="space-y-1">
              {NAV_ITEMS.find((i) => i.id === mobileDrawer)?.items?.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileDrawer(null);
                    navigate(link.path);
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-base transition-colors text-left"
                  style={{
                    color: location === link.path ? "#ffd54f" : "#e0e0e0",
                    background: location === link.path ? "rgba(255,213,79,0.06)" : "transparent",
                    borderLeft: location === link.path ? "2px solid rgba(255,213,79,0.5)" : "2px solid transparent",
                  }}
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
