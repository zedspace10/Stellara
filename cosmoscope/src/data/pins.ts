// This week in the universe: one new picture a week, placed where it really is.
//
// HOW TO ADD NEXT WEEK'S PIN
// 1. Copy the first block below and paste it at the top of the list (newest first).
// 2. Give it a short id with no spaces, the date the image was released, and the title.
// 3. Position: right ascension (hours, minutes, seconds) and declination (degrees, minutes,
//    seconds, with a minus sign for south), from the NGC/IC Project or SIMBAD.
// 4. Distance in millions of light years. For something very far, use how long its light has
//    been travelling (for example 5,800 for light that left 5.8 billion years ago).
// 5. Image: the image file's web address from NASA or ESA, and its credit line exactly as they
//    give it. Only use images credited to NASA, ESA, STScI, Hubble or Webb.
// 6. Body: the science, in our own words. Reflection: the PALE line, kept separate.

export interface Pin {
  id: string;
  /** Date the image was released, as YYYY-MM-DD. */
  date: string;
  title: string;
  object: string;
  ra: [number, number, number];
  dec: [number, number, number];
  /** Distance, or light travel time for very distant things, in millions of light years. */
  mly: number;
  constellation: string;
  image: { src: string; alt: string; credit: string; licence?: string };
  source: { label: string; href: string };
  body: string[];
  reflection?: string;
  /** A simulation that explains what is happening here, if there is one. */
  simulation?: { id: string; label: string };
}

export const PINS: Pin[] = [
  {
    id: "ngc-1827",
    date: "2026-10-16",
    title: "Spiral's edge",
    object: "NGC 1827",
    ra: [5, 10, 4.4],
    dec: [-36, 57, 37],
    mly: 37,
    constellation: "Columba, the Dove",
    image: {
      src: "https://assets.science.nasa.gov/content/dam/science/missions/hubble/galaxies/spiral/Hubble_NGC1827_1_flat_FINAL.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
      alt: "The spiral galaxy NGC 1827 seen almost edge on, a thin bright band of stars crossed by dark dust.",
      credit: "NASA, ESA, Michael Jones (California Institute of Technology). Image processing: Gladys Kober (NASA/Catholic University of America)",
    },
    source: { label: "NASA: Hubble spies spiral's edge", href: "https://science.nasa.gov/missions/hubble/nasas-hubble-spies-spirals-edge/" },
    body: [
      "A spiral galaxy seen almost perfectly side on, like a dinner plate held up to your eye. Billions of stars, flattened into a thin line of light.",
      "The light in this picture left it about 37 million years ago, when Antarctica was still largely free of ice and there were no humans for tens of millions of years to come.",
      "Hubble took it while studying 260 small galaxies around 22 galaxies like the Milky Way. Small galaxies are a test of our best ideas about how the universe built itself, and so far those ideas do not quite fit.",
    ],
    reflection: "Somewhere in that thin line of light, someone may be looking back at a small spiral of their own.",
  },
  {
    id: "macs-j0454",
    date: "2026-09-29",
    title: "Cosmic house of mirrors",
    object: "MACS J0454.1-0300",
    ra: [4, 54, 11.04],
    dec: [-3, 0, 51.75],
    mly: 5800,
    constellation: "Orion",
    image: {
      src: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2026/09/galaxies_in_a_cosmic_house_of_mirrors/27538440-1-eng-GB/Galaxies_in_a_cosmic_house_of_mirrors_pillars.jpg",
      alt: "A cluster of golden galaxies, with stretched orange arcs of much more distant galaxies bent around it.",
      credit: "ESA/Webb, NASA & CSA, L. Furtak, S. Fujimoto",
      licence: "CC BY 4.0",
    },
    source: { label: "ESA: Galaxies in a cosmic house of mirrors", href: "https://www.esa.int/ESA_Multimedia/Images/2026/09/Galaxies_in_a_cosmic_house_of_mirrors" },
    body: [
      "The golden galaxies belong to a cluster whose light set out when the universe was about 8 billion years old, before our Sun had formed.",
      "The cluster is so heavy it bends space, and with it the light of galaxies far behind. The stretched orange shapes are much more distant galaxies, magnified and warped as their light passes through.",
      "One shines from just 800 million years after the Big Bang. Its light has been bent along several paths, so we see the same galaxy four or more times at once.",
    ],
    reflection: "What we see always depends on what lies between us and the thing we are looking at.",
    simulation: { id: "black-hole", label: "See how gravity bends light" },
  },
  {
    id: "ngc-4698",
    date: "2026-09-18",
    title: "A chaotic secret",
    object: "NGC 4698",
    ra: [12, 48, 23.0],
    dec: [8, 29, 18],
    mly: 55,
    constellation: "Virgo",
    image: {
      src: "https://science.nasa.gov/wp-content/uploads/2026/09/potm2609a.jpg?w=1280",
      alt: "The spiral galaxy NGC 4698, with a glowing centre and faint dusty arms forming a ring around the edge of its disc.",
      credit: "ESA/Hubble & NASA, D. Thilker, the MAUVE-HST Team",
      licence: "CC BY 4.0",
    },
    source: { label: "NASA: Hubble spots an out of sync galaxy", href: "https://science.nasa.gov/uncategorized/nasas-hubble-spots-an-out-of-sync-galaxy/" },
    body: [
      "A spiral galaxy in the Virgo Cluster. Its arms stay out at the edge of the disc, keeping away from the glowing centre.",
      "The secret is at the core: the stars and gas nearest the centre spin at a right angle to the rest of the galaxy. Astronomers think something from outside caused it, perhaps gas falling in, or a smaller galaxy swallowed long ago.",
      "Its light left it about 55 million years ago, around the time Earth was so warm that palm trees grew near the Arctic.",
    ],
    reflection: "Something can look perfectly still from far away and still be turning in its own direction at its heart.",
  },
];

/** The newest pin. */
export const LATEST_PIN = [...PINS].sort((a, b) => b.date.localeCompare(a.date))[0];

/** Right ascension in hours and declination in degrees, as plain numbers. */
export function pinRaDec(p: Pin) {
  const [h, m, s] = p.ra;
  const [d, dm, ds] = p.dec;
  const sign = d < 0 || Object.is(d, -0) ? -1 : 1;
  return { ra: h + m / 60 + s / 3600, dec: sign * (Math.abs(d) + dm / 60 + ds / 3600) };
}

/** Plain words for how far away it is. */
export function pinDistance(p: Pin) {
  if (p.mly >= 1000) return `light that left ${(p.mly / 1000).toFixed(1)} billion years ago`;
  return `${p.mly < 10 ? p.mly.toFixed(1) : Math.round(p.mly)} million light years away`;
}

export function pinDate(p: Pin) {
  return new Date(p.date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Released in the last ten days, so it can honestly be called new this week. */
export function isThisWeek(p: Pin, now = Date.now()) {
  return now - Date.parse(p.date + "T12:00:00Z") < 10 * 86400000;
}
