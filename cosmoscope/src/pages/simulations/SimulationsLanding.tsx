import { useEffect } from "react";
import { Link } from "wouter";

// In the order they happen, from the beginning of time onward.
const SIMS = [
  {
    id: "big-bang",
    when: "13.8 billion years ago",
    title: "The Big Bang",
    description: "Space itself begins, hot and dense, and grows into the universe we see today.",
    minutes: 4,
  },
  {
    id: "milky-way-birth",
    when: "From 13.5 billion years ago",
    title: "Birth of the Milky Way",
    description: "Our galaxy builds up from dark matter, gas and the small galaxies it swallowed.",
    minutes: 3,
  },
  {
    id: "solar-system-formation",
    when: "4.6 billion years ago",
    title: "Formation of the solar system",
    description: "A cold cloud of gas and dust becomes the Sun, the planets and the world you stand on.",
    minutes: 4,
  },
  {
    id: "star-birth",
    when: "Happening now",
    title: "Birth of a star",
    description: "A cold cloud collapses under its own gravity until fusion switches on at its centre.",
    minutes: 3,
  },
  {
    id: "star-death",
    when: "Billions of years from now",
    title: "Life and death of a star",
    description: "The Sun's future as a red giant and a white dwarf, and how bigger stars end as supernovae.",
    minutes: 4,
  },
  {
    id: "black-hole",
    when: "When a giant star dies",
    title: "Black hole formation",
    description: "A collapsing core, the event horizon, glowing discs of gas and two black holes merging.",
    minutes: 4,
  },
  {
    id: "inside-black-hole",
    when: "Past the event horizon",
    title: "Inside a black hole",
    description: "Fall in and see what physics predicts, all the way to the point where it stops working.",
    minutes: 3,
  },
];

export default function SimulationsLanding() {
  useEffect(() => {
    document.title = "Simulations | PALE";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-5 md:px-8" style={{ background: "#05070C" }}>
      <div className="max-w-[960px] mx-auto">
        <header className="pt-6 pb-10">
          <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: "#E8ECF1" }}>Simulations</h1>
          <p className="mt-4 mb-0 text-[17px] leading-relaxed max-w-[34rem]" style={{ color: "#A3AFBC" }}>
            The biggest events in the history of the universe, in the order they happen. Start at the top if you are new.
          </p>
        </header>

        <ol className="m-0 p-0 list-none" style={{ borderTop: "1px solid #1C2533" }}>
          {SIMS.map((sim) => (
            <li key={sim.id} style={{ borderBottom: "1px solid #1C2533" }}>
              <Link
                href={`/simulations/${sim.id}`}
                className="group grid grid-cols-1 md:grid-cols-[13rem_1fr_auto] gap-x-8 gap-y-1 py-6 no-underline transition-colors hover:bg-white/[0.02] -mx-3 px-3 rounded-md"
              >
                <span className="text-[14px] md:pt-2" style={{ color: "#8E9AA8" }}>{sim.when}</span>
                <span>
                  <span className="block font-serif text-[26px] leading-tight" style={{ color: "#E8ECF1" }}>{sim.title}</span>
                  <span className="block mt-1.5 text-[15px] leading-relaxed max-w-[32rem]" style={{ color: "#A3AFBC" }}>{sim.description}</span>
                </span>
                <span className="text-[14px] md:pt-2 md:text-right whitespace-nowrap" style={{ color: "#8E9AA8" }}>
                  {sim.minutes} min{" "}
                  <span className="ml-2 underline underline-offset-4 decoration-1 group-hover:decoration-2" style={{ color: "#A9C3E0" }}>Watch</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
