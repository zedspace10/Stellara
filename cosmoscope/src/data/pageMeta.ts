// What a shared link shows before anyone opens it: the title and the line underneath, in
// WhatsApp, iMessage, Instagram and search results. Apps that make these previews do not run the
// site's code, so the server writes these into the page for each address. Plain JSON-like data
// with no imports, so the build can read it too.

export interface PageMeta {
  title: string;
  description: string;
}

export const SITE_META: PageMeta = {
  title: "PALE: see where you are in the universe",
  description:
    "A 3D map of the universe, what is in your sky tonight, and notes that travel at the speed of light.",
};

export const PAGE_META: Record<string, PageMeta> = {
  "/": SITE_META,
  "/note": {
    title: "Send a note | PALE",
    description: "Write a line and send it towards a star. PALE follows it at the speed of light.",
  },
  "/discoveries": {
    title: "This week in the universe | PALE",
    description: "A new Hubble or Webb picture every week, placed where it really is.",
  },
  "/tonight": {
    title: "Tonight | PALE",
    description: "The Moon, the planets and what else is in your sky tonight.",
  },
  "/scale": {
    title: "Scale of the universe | PALE",
    description: "Zoom from the Planck length out to the whole observable universe.",
  },
  "/simulations": {
    title: "Simulations | PALE",
    description: "The Big Bang, the birth of stars, a black hole and the making of Earth, step by step.",
  },
  "/simulations/big-bang": {
    title: "The Big Bang | PALE",
    description: "The first moments of the universe, step by step.",
  },
  "/simulations/earth": {
    title: "The story of Earth | PALE",
    description: "From a cloud of dust to a world with oceans, step by step.",
  },
  "/simulations/star-birth": {
    title: "Birth of a star | PALE",
    description: "A cloud of gas collapses and a star switches on, step by step.",
  },
  "/simulations/black-hole": {
    title: "Black holes | PALE",
    description: "How a black hole bends light and time around it.",
  },
  "/exoplanets": {
    title: "Other worlds | PALE",
    description: "More than 6,000 planets found around other stars.",
  },
  "/constellations": {
    title: "Constellation guide | PALE",
    description: "The shapes in the sky, how to find them, and their stories.",
  },
  "/apod": {
    title: "Picture of the day | PALE",
    description: "NASA's astronomy picture of the day.",
  },
  "/about": {
    title: "About PALE",
    description: "What PALE is, who makes it, and where the science comes from.",
  },
  "/credits": {
    title: "Sources and credits | PALE",
    description: "Where every fact, image and dataset on PALE comes from.",
  },
  "/privacy": {
    title: "Privacy | PALE",
    description: "PALE collects no personal data.",
  },
};
