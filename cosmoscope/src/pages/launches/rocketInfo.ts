// Plain-language descriptions for the most common rockets. Falls back to a
// generic summary using the provider name when the rocket isn't recognized.
const ROCKETS: { match: RegExp; description: string }[] = [
  {
    match: /falcon\s*heavy/i,
    description: "Falcon Heavy is the most powerful operational rocket in the world, built from three Falcon 9 first stages strapped together. Its side boosters return to land in tandem after launch.",
  },
  {
    match: /falcon\s*9/i,
    description: "Falcon 9 is a reusable two-stage rocket designed by SpaceX. Its first-stage booster lands itself back on a drone ship or landing pad after launch — a feat once thought impossible.",
  },
  {
    match: /starship/i,
    description: "Starship is SpaceX's fully reusable super-heavy launch system, designed to carry crew and cargo to the Moon, Mars and beyond. Combined with its Super Heavy booster it is the tallest and most powerful rocket ever flown.",
  },
  {
    match: /electron/i,
    description: "Electron is a small two-stage rocket from Rocket Lab, optimised for launching small satellites to low Earth orbit. Its carbon-composite structure and electric-pump engines made it the first private orbital rocket from the Southern Hemisphere.",
  },
  {
    match: /atlas\s*v/i,
    description: "Atlas V is a workhorse rocket from United Launch Alliance with one of the most reliable launch records in history. It has carried Mars rovers, Pluto's New Horizons probe and many national-security payloads.",
  },
  {
    match: /vulcan/i,
    description: "Vulcan Centaur is ULA's next-generation rocket, designed to replace the Atlas V and Delta IV. It uses methane-powered BE-4 engines built by Blue Origin.",
  },
  {
    match: /delta\s*iv/i,
    description: "Delta IV is a heavy-lift rocket from ULA, recognisable by the dramatic fireball that licks up its sides at ignition. Its Heavy variant flew the Parker Solar Probe and many classified payloads.",
  },
  {
    match: /ariane\s*6/i,
    description: "Ariane 6 is the European Space Agency's newest heavy-lift rocket, built to launch satellites and interplanetary probes from the equatorial spaceport in French Guiana.",
  },
  {
    match: /ariane\s*5/i,
    description: "Ariane 5 was Europe's heavy-lift workhorse for nearly three decades, carrying everything from communications satellites to the James Webb Space Telescope on its final flagship mission.",
  },
  {
    match: /soyuz/i,
    description: "Soyuz is the longest-serving family of rockets in human spaceflight, in continuous operation since 1966. Variants still launch crew to the International Space Station today.",
  },
  {
    match: /proton/i,
    description: "Proton is a Russian heavy-lift rocket that has launched many of the modules that make up the International Space Station, as well as deep-space probes and commercial satellites.",
  },
  {
    match: /long\s*march/i,
    description: "Long March is China's family of launch vehicles, ranging from small satellite carriers to the heavy-lift Long March 5 used for crewed lunar and Mars missions.",
  },
  {
    match: /new\s*glenn/i,
    description: "New Glenn is Blue Origin's heavy-lift orbital rocket. Named after astronaut John Glenn, its reusable first stage is designed to land on a drone ship downrange.",
  },
  {
    match: /new\s*shepard/i,
    description: "New Shepard is Blue Origin's suborbital rocket, designed to carry tourists and research payloads just past the edge of space before parachuting back to Earth.",
  },
  {
    match: /h-?ii(?:a|b)/i,
    description: "H-IIA is Japan's flagship rocket family, operated by Mitsubishi Heavy Industries and JAXA. It has launched lunar orbiters, Mars probes and asteroid sample-return missions.",
  },
  {
    match: /h3/i,
    description: "H3 is JAXA's next-generation rocket, designed to replace the H-IIA with lower cost and higher flexibility.",
  },
  {
    match: /pslv/i,
    description: "PSLV (Polar Satellite Launch Vehicle) is ISRO's reliable workhorse rocket. It launched India's Mars Orbiter Mission, the Chandrayaan-1 lunar probe and countless Earth-observation satellites.",
  },
  {
    match: /gslv|lvm3/i,
    description: "GSLV / LVM3 is India's heavy-lift rocket. Its most famous flights include Chandrayaan-3, the first mission to soft-land near the lunar south pole.",
  },
  {
    match: /sls|space launch system/i,
    description: "SLS (Space Launch System) is NASA's super-heavy-lift rocket, designed to carry the Artemis programme's crew back to the Moon and onward to Mars. Its first stage is taller than the Statue of Liberty.",
  },
  {
    match: /antares/i,
    description: "Antares is a medium-lift rocket from Northrop Grumman, used to launch Cygnus cargo spacecraft to the International Space Station.",
  },
];

export function getRocketDescription(rocketName: string, providerName: string): string {
  for (const r of ROCKETS) {
    if (r.match.test(rocketName)) return r.description;
  }
  return `${rocketName} is an orbital launch vehicle operated by ${providerName}. It is designed to carry payloads into orbit around Earth or onward to deep space.`;
}
