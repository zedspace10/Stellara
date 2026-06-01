// "This Week in Space History" — keyed by MM-DD. Picks the closest event in
// time (within 7 days) for today. Curated set of major space milestones.

export interface HistoryEvent {
  date: string;          // "MM-DD"
  year: number;
  title: string;
  description: string;
}

export const EVENTS: HistoryEvent[] = [
  { date: "01-04", year: 2004, title: "Spirit Lands on Mars",
    description: "NASA's Spirit rover bounces down on Mars in a cocoon of airbags, beginning what becomes a six-year mission of discovery in Gusev Crater." },
  { date: "01-25", year: 2004, title: "Opportunity Lands on Mars",
    description: "Three weeks after Spirit, Opportunity touches down on Meridiani Planum — and goes on to operate for nearly 15 years, far beyond its 90-day design life." },
  { date: "01-28", year: 1986, title: "Challenger Disaster",
    description: "Space Shuttle Challenger breaks apart 73 seconds after launch, killing all seven crew including teacher Christa McAuliffe. A turning point for spaceflight safety." },
  { date: "01-31", year: 1958, title: "Explorer 1 — America's First Satellite",
    description: "The United States enters the Space Age with the launch of Explorer 1, which discovers the Van Allen radiation belts surrounding Earth." },

  { date: "02-01", year: 2003, title: "Columbia Lost on Re-entry",
    description: "Space Shuttle Columbia breaks up during re-entry over Texas, killing all seven crew. The cause: foam damage to the wing during launch sixteen days earlier." },
  { date: "02-06", year: 2018, title: "Starman Launches Aboard Falcon Heavy",
    description: "SpaceX's first Falcon Heavy flight sends a cherry-red Tesla Roadster — with a mannequin named Starman at the wheel — on a billion-year orbit past Mars. Both side boosters land simultaneously." },
  { date: "02-18", year: 2021, title: "Perseverance Lands on Mars",
    description: "NASA's car-sized Perseverance rover lands in Jezero Crater, an ancient lake bed, to search for signs of past microbial life and cache samples for future return to Earth." },
  { date: "02-20", year: 1962, title: "John Glenn Orbits Earth",
    description: "Aboard Friendship 7, John Glenn becomes the first American to orbit the Earth, completing three orbits in just under five hours." },

  { date: "03-02", year: 1972, title: "Pioneer 10 Launched",
    description: "The first spacecraft to traverse the asteroid belt and the first to make direct observations of Jupiter is launched, carrying a plaque depicting humanity for any aliens who find it." },
  { date: "03-13", year: 1781, title: "William Herschel Discovers Uranus",
    description: "Astronomer William Herschel, observing from his garden in Bath, becomes the first person in recorded history to discover a new planet." },
  { date: "03-16", year: 1926, title: "First Liquid-Fueled Rocket Flight",
    description: "Robert Goddard launches the world's first liquid-fueled rocket from a snowy field in Auburn, Massachusetts. It flies for 2.5 seconds and rises 41 feet — the foundation of modern spaceflight." },

  { date: "04-12", year: 1961, title: "Yuri Gagarin — First Human in Space",
    description: "Soviet cosmonaut Yuri Gagarin becomes the first human in space, completing one orbit of the Earth aboard Vostok 1 in 108 minutes." },
  { date: "04-13", year: 1970, title: "Apollo 13: 'Houston, We've Had a Problem'",
    description: "An oxygen tank explodes 200,000 miles from Earth, turning Apollo 13's Moon landing into a desperate fight for survival. All three astronauts return safely four days later." },
  { date: "04-24", year: 1990, title: "Hubble Space Telescope Launched",
    description: "Space Shuttle Discovery carries the Hubble Space Telescope to orbit, beginning what becomes the most scientifically productive observatory in history." },

  { date: "05-05", year: 1961, title: "Alan Shepard — First American in Space",
    description: "Aboard Freedom 7, Alan Shepard becomes the first American in space on a 15-minute suborbital flight that reaches an altitude of 116 miles." },
  { date: "05-14", year: 1973, title: "Skylab Launched",
    description: "America's first space station reaches orbit aboard the final Saturn V rocket ever flown. Three crews live aboard Skylab over the next year." },
  { date: "05-25", year: 1961, title: "JFK Commits to the Moon",
    description: "President Kennedy tells Congress that America should commit itself, before this decade is out, to landing a man on the Moon and returning him safely to Earth." },
  { date: "05-30", year: 2020, title: "First Crewed Launch from US Soil Since 2011",
    description: "SpaceX's Crew Dragon Demo-2 launches NASA astronauts Bob Behnken and Doug Hurley to the ISS — the first crewed orbital launch from US soil in nearly nine years, and the first ever by a private company." },

  { date: "06-03", year: 1965, title: "First American Spacewalk",
    description: "Ed White floats free of Gemini 4 for 20 minutes, becoming the first American to walk in space. He calls returning to the capsule 'the saddest moment of my life'." },
  { date: "06-16", year: 1963, title: "Valentina Tereshkova — First Woman in Space",
    description: "Soviet cosmonaut Valentina Tereshkova becomes the first woman in space, spending three days alone in orbit aboard Vostok 6." },
  { date: "06-18", year: 1983, title: "Sally Ride — First American Woman in Space",
    description: "Sally Ride launches aboard Space Shuttle Challenger STS-7, becoming the first American woman in space, twenty years after Tereshkova." },

  { date: "07-04", year: 1997, title: "Mars Pathfinder Lands",
    description: "Mars Pathfinder bounces to a stop on the Ares Vallis floodplain, releasing the Sojourner rover — the first wheeled vehicle to operate on another planet." },
  { date: "07-14", year: 2015, title: "New Horizons Flies Past Pluto",
    description: "After a nine-year journey, NASA's New Horizons spacecraft makes its closest approach to Pluto, revealing a geologically active world with a heart-shaped nitrogen ice plain." },
  { date: "07-16", year: 1969, title: "Apollo 11 Launches",
    description: "Saturn V lifts Neil Armstrong, Buzz Aldrin and Michael Collins off the pad at Kennedy Space Center, beginning humanity's first crewed mission to the surface of another world." },
  { date: "07-20", year: 1969, title: "First Footsteps on the Moon",
    description: "Neil Armstrong becomes the first human to walk on the Moon. 'That's one small step for man, one giant leap for mankind.' Buzz Aldrin follows twenty minutes later." },
  { date: "07-21", year: 2011, title: "End of the Space Shuttle Era",
    description: "Atlantis touches down at Kennedy Space Center, ending 30 years and 135 missions of NASA's Space Shuttle programme." },

  { date: "08-05", year: 2012, title: "Curiosity's Seven Minutes of Terror",
    description: "After a daring sky-crane landing, NASA's car-sized Curiosity rover begins its mission to determine whether Mars was ever capable of supporting microbial life." },
  { date: "08-12", year: 2018, title: "Parker Solar Probe Launches",
    description: "NASA launches the Parker Solar Probe to fly through the Sun's outer atmosphere — the closest any spacecraft will ever come to a star." },
  { date: "08-25", year: 2012, title: "Voyager 1 Enters Interstellar Space",
    description: "Voyager 1 becomes the first human-made object to cross the heliopause into interstellar space, 35 years after its launch from Florida." },

  { date: "09-05", year: 1977, title: "Voyager 1 Launches",
    description: "Voyager 1 lifts off on a tour of the outer solar system, carrying a Golden Record of sounds and images from Earth — a message for any extraterrestrials who might one day find it." },
  { date: "09-12", year: 1962, title: "'We Choose to Go to the Moon'",
    description: "At Rice University in Houston, President Kennedy delivers his most famous speech on space: 'We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.'" },
  { date: "09-26", year: 2022, title: "DART Strikes Dimorphos",
    description: "NASA's DART spacecraft deliberately crashes into the asteroid Dimorphos at 14,000 mph — the first ever test of humanity's ability to deflect an asteroid on a collision course with Earth." },

  { date: "10-04", year: 1957, title: "Sputnik 1 — The Space Age Begins",
    description: "The Soviet Union launches Sputnik 1, the first artificial satellite. Its beeping radio signal, audible to anyone with a shortwave receiver, shocks the world." },
  { date: "10-15", year: 1997, title: "Cassini-Huygens Launches for Saturn",
    description: "The Cassini-Huygens mission lifts off from Cape Canaveral on a seven-year journey to Saturn, where it will revolutionize our understanding of the ringed planet and its moons." },

  { date: "11-03", year: 1957, title: "Laika — First Animal in Orbit",
    description: "The Soviet Union launches Sputnik 2 carrying Laika, a stray dog from the streets of Moscow. She is the first living creature to orbit Earth, though sadly did not survive." },
  { date: "11-16", year: 2022, title: "Artemis I Launches",
    description: "NASA's Space Launch System — the most powerful rocket ever flown — lifts off on Artemis I, sending an uncrewed Orion capsule on a 25-day journey around the Moon." },
  { date: "11-20", year: 1998, title: "First Module of the ISS Launches",
    description: "A Russian Proton rocket launches Zarya, the first module of the International Space Station. Continuous human presence in orbit begins two years later." },
  { date: "11-26", year: 2011, title: "Curiosity Launched for Mars",
    description: "NASA's Mars Science Laboratory mission begins as an Atlas V rocket sends the Curiosity rover on a 350-million-mile journey to the Red Planet." },

  { date: "12-04", year: 1996, title: "Mars Pathfinder Launches",
    description: "The first NASA mission to Mars in 20 years launches from Cape Canaveral, carrying the small Sojourner rover that will prove rovers can work on the Martian surface." },
  { date: "12-07", year: 1972, title: "Apollo 17 Launches — Last Crewed Moon Mission",
    description: "Apollo 17 begins the final crewed mission to the Moon. Geologist Harrison Schmitt becomes the only scientist to walk on the lunar surface. No human has returned since." },
  { date: "12-21", year: 1968, title: "Apollo 8 — First Humans to Leave Earth",
    description: "Apollo 8 launches on the first crewed mission to the Moon. Borman, Lovell and Anders become the first humans to leave Earth's gravity and see the far side of the Moon with their own eyes." },
  { date: "12-24", year: 1968, title: "Earthrise",
    description: "On Christmas Eve, Apollo 8 enters lunar orbit and astronaut Bill Anders photographs the Earth rising over the Moon's horizon — perhaps the most influential photograph in history." },
  { date: "12-25", year: 2021, title: "James Webb Space Telescope Launches",
    description: "On Christmas morning, the James Webb Space Telescope launches aboard an Ariane 5 rocket on a million-mile journey to the L2 Lagrange point — the start of a new era of astronomy." },
];

function mmdd(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayOfYear(s: string, refYear: number): number {
  const [m, d] = s.split("-").map(Number);
  return Math.floor((new Date(refYear, m - 1, d).getTime() - new Date(refYear, 0, 0).getTime()) / 86400000);
}

export function getEventForToday(now: Date = new Date()): HistoryEvent {
  const today = mmdd(now);
  const exact = EVENTS.find(e => e.date === today);
  if (exact) return exact;

  // Find closest event (forward or backward)
  const year = now.getFullYear();
  const todayDoy = dayOfYear(today, year);
  let best = EVENTS[0];
  let bestDist = Infinity;
  for (const e of EVENTS) {
    const doy = dayOfYear(e.date, year);
    const dist = Math.min(
      Math.abs(doy - todayDoy),
      365 - Math.abs(doy - todayDoy),
    );
    if (dist < bestDist) { best = e; bestDist = dist; }
  }
  return best;
}
