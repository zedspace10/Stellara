import { useEffect } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

const GROUPS = [
  {
    title: "The universe",
    items: [
      { href: "/", name: "Interactive universe", body: "Fly from the planets out to the cosmic web in 3D." },
      { href: "/galaxy", name: "Our galaxy", body: "The Milky Way and the things that live in it." },
      { href: "/scale", name: "Scale of the universe", body: "From the Planck length to everything we can see." },
      { href: "/exoplanets", name: "Exoplanet explorer", body: "Thousands of worlds orbiting other stars." },
    ],
  },
  {
    title: "Watch it happen",
    items: [
      { href: "/simulations", name: "Simulations", body: "The Big Bang, a star's birth and death, black holes." },
      { href: "/build-universe", name: "Build your own universe", body: "Change the rules of physics and see what forms." },
      { href: "/blackholes", name: "Black holes and relativity", body: "What happens where gravity wins." },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/constellations", name: "Constellation guide", body: "The shapes in the sky and the stories behind them." },
      { href: "/glossary", name: "Space glossary", body: "Every term explained in plain language." },
      { href: "/education", name: "Education centre", body: "Lessons for curious minds of every age." },
      { href: "/blog", name: "Blog", body: "Longer reads about the cosmos." },
    ],
  },
];

export default function Explore() {
  useEffect(() => {
    document.title = "Explore: PALE";
  }, []);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C", color: "#F5FAFF" }}>
      <div className="max-w-[1240px] mx-auto px-6 pt-14 pb-10">
        <h1 className="m-0 text-4xl md:text-5xl font-bold tracking-[-0.02em]">Explore</h1>
        <p className="mt-3 mb-0 text-lg max-w-[560px]" style={{ color: "#A7B6C6" }}>
          Take your time. Everything here is checked against its source.
        </p>

        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`g-${group.title}`} className="mt-12">
            <h2 id={`g-${group.title}`} className="m-0 text-sm uppercase tracking-[0.16em]" style={{ color: "#8DEBFF" }}>
              {group.title}
            </h2>
            <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block p-6 rounded-[20px] no-underline transition-colors hover:border-[#35637A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B9F3FF]"
                  style={{ background: "#0D1520", border: "1px solid #1D3040" }}
                >
                  <span className="block text-lg font-semibold" style={{ color: "#F5FAFF" }}>{item.name}</span>
                  <span className="block mt-1.5 text-[15px] leading-relaxed" style={{ color: "#A7B6C6" }}>{item.body}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </div>
  );
}
