import { useEffect } from "react";
import { Link } from "wouter";

// In the order they happen, from the beginning of time onward.
const SIMS = [
  {
    id: "big-bang",
    when: "13.8 billion years ago",
    title: "The Big Bang",
    description: "From a hot, dense first instant to the light we still see today, and the first stars and galaxies.",
    minutes: 3,
  },
  {
    id: "earth",
    when: "4.6 billion years ago",
    title: "The story of Earth",
    description: "From a disc of dust to a pale blue dot: the impact that made the Moon, the first oceans, the first life, the dinosaurs, and us.",
    minutes: 3,
  },
  {
    id: "star-birth",
    when: "Happening now",
    title: "Birth of a star",
    description: "A dark cloud collapses, spins up a disc, fires jets from its poles and switches on.",
    minutes: 2,
  },
  {
    id: "star-death",
    when: "Billions of years from now",
    title: "Life and death of a star",
    description: "The Sun grows into a red giant that reaches past Venus, then fades to a white dwarf the size of Earth.",
    minutes: 2,
  },
  {
    id: "black-hole",
    when: "When a giant star dies",
    title: "Black holes",
    description: "A collapsing core, light bent into rings, a glowing disc of gas, and two black holes merging.",
    minutes: 2,
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
