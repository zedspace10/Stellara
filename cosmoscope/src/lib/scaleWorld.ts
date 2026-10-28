// The things you meet zooming from the Planck length to the edge of the observable universe.
// Every size is real. Positions are in metres, measured from your feet, with y pointing up.

export const AU = 1.496e11;
export const LY = 9.461e15;
export const EARTH_R = 6.371e6;

export const EARTH_C: [number, number] = [0, -EARTH_R];
export const SUN_C: [number, number] = [-AU, -EARTH_R];
const MOON_ANGLE = (25 * Math.PI) / 180;
export const MOON_C: [number, number] = [EARTH_C[0] + 3.844e8 * Math.cos(MOON_ANGLE), EARTH_C[1] + 3.844e8 * Math.sin(MOON_ANGLE)];
export const GC: [number, number] = [SUN_C[0] + 26000 * LY * Math.cos(-0.35), SUN_C[1] + 26000 * LY * Math.sin(-0.35)];
const ANDROMEDA_ANGLE = 0.75;
export const ANDROMEDA_C: [number, number] = [GC[0] + 2.5e6 * LY * Math.cos(ANDROMEDA_ANGLE), GC[1] + 2.5e6 * LY * Math.sin(ANDROMEDA_ANGLE)];
export const GREAT_ATTRACTOR: [number, number] = [GC[0] - 2.2e8 * LY, GC[1] - 0.6e8 * LY];
// The point we zoom in on, at about hand height.
export const MICRO_C: [number, number] = [0.32, 0.98];

export interface ScaleThing {
  id: string;
  name: string;
  /** Size in metres used to decide when it is on screen (its width, height or diameter). */
  size: number;
  sizeLabel: string;
  fact: string;
  /** Short name for the track at the bottom. */
  tick?: string;
  /** Leave this tick off on narrow screens, where there is not room for every name. */
  wideOnly?: boolean;
}

// In order from smallest to largest.
export const THINGS: ScaleThing[] = [
  { id: "planck", name: "The Planck length", size: 1.6e-35, sizeLabel: "1.6 × 10⁻³⁵ m", tick: "Planck",
    fact: "The smallest length physics can describe. Below it, our ideas of space and distance stop making sense." },
  { id: "quark", name: "A quark", size: 1e-19, sizeLabel: "Smaller than 10⁻¹⁹ m",
    fact: "No experiment has ever measured a size for a quark. If they have one at all, it is less than a ten thousandth of a proton." },
  { id: "proton", name: "A proton", size: 1.7e-15, sizeLabel: "1.7 × 10⁻¹⁵ m", tick: "Proton",
    fact: "Three quarks held together by the strong force. Almost all of the mass of everything you can touch is in particles like this." },
  { id: "nucleus", name: "A carbon nucleus", size: 5.5e-15, sizeLabel: "About 5 × 10⁻¹⁵ m",
    fact: "Six protons and six neutrons. Every carbon atom in your body has one of these at its centre." },
  { id: "atom", name: "A carbon atom", size: 1.5e-10, sizeLabel: "About 0.15 nanometres",
    fact: "The nucleus is about 100,000 times smaller than the atom around it. If the nucleus were a marble, the atom would be a kilometre across." },
  { id: "water", name: "A water molecule", size: 2.8e-10, sizeLabel: "About 0.28 nanometres",
    fact: "Two hydrogen atoms and one oxygen, joined at an angle of about 104.5 degrees. That bent shape is why water dissolves so much." },
  { id: "dna", name: "DNA", size: 2e-9, sizeLabel: "2 nanometres wide", tick: "DNA", wideOnly: true,
    fact: "A twisted ladder of four chemical letters. The order of those letters is the instruction book for building you." },
  { id: "virus", name: "A flu virus", size: 1e-7, sizeLabel: "About 100 nanometres",
    fact: "About 700 of them would fit side by side across the width of a human hair." },
  { id: "bacterium", name: "A bacterium", size: 2e-6, sizeLabel: "About 2 micrometres long",
    fact: "Bacteria live all over your skin. Your body carries roughly as many bacteria as it has cells of its own." },
  { id: "nucleus-cell", name: "A cell's nucleus", size: 6e-6, sizeLabel: "About 6 micrometres",
    fact: "Your DNA is packed in here. Unwound, the DNA in this one nucleus would stretch about 2 metres." },
  { id: "cell", name: "A skin cell", size: 3e-5, sizeLabel: "About 30 micrometres", tick: "Cell", wideOnly: true,
    fact: "You shed tens of thousands of skin cells every minute, and your outer skin replaces itself about once a month." },
  { id: "hair", name: "A human hair", size: 7e-5, sizeLabel: "About 70 micrometres across",
    fact: "About the smallest thing you can see without help." },
  { id: "human", name: "You", size: 1.7, sizeLabel: "About 1.7 metres", tick: "You",
    fact: "On this scale you are a little closer to the size of the whole observable universe than to the smallest length physics can describe." },
  { id: "tower", name: "The Eiffel Tower", size: 330, sizeLabel: "330 metres tall",
    fact: "It grows by up to 15 centimetres in summer, as its iron expands in the heat." },
  { id: "everest", name: "Mount Everest", size: 8849, sizeLabel: "8,849 metres above sea level",
    fact: "It is still being pushed up a few millimetres a year, as India presses into Asia." },
  { id: "earth", name: "Earth", size: 1.2742e7, sizeLabel: "12,742 km across", tick: "Earth",
    fact: "If Earth were the size of a football, the air you could breathe would be about as thick as a sheet of paper." },
  { id: "moon", name: "Earth and the Moon", size: 7.7e8, sizeLabel: "384,400 km apart",
    fact: "Every other planet in the solar system would fit, side by side, in the gap between Earth and the Moon." },
  { id: "inner", name: "The Sun and the inner planets", size: 4.6e11, sizeLabel: "Earth is 150 million km from the Sun", tick: "Sun", wideOnly: true,
    fact: "Sunlight takes 8 minutes 20 seconds to reach you. The planets here are where they really are today." },
  { id: "solar", name: "The solar system", size: 9e12, sizeLabel: "About 9 billion km across, out to Neptune",
    fact: "Light takes about 8 hours to cross from one side of Neptune's orbit to the other." },
  { id: "voyager", name: "Voyager 1", size: 5.2e13, sizeLabel: "About 172 au from the Sun",
    fact: "The furthest thing people have ever made. In November 2026 it becomes one light day from Earth." },
  { id: "oort", name: "The Oort cloud", size: 3e16, sizeLabel: "Up to about 100,000 au across",
    fact: "A vast shell of icy bodies around the Sun. It has never been seen directly. We know it is there from the comets that fall in from it." },
  { id: "neighbours", name: "Our nearest stars", size: 2.4e17, sizeLabel: "About 25 light years across",
    fact: "The nearest star, Proxima Centauri, is 4.24 light years away. At Voyager 1's speed, the trip would take about 75,000 years." , tick: "Stars", wideOnly: true },
  { id: "milkyway", name: "The Milky Way", size: 9.5e20, sizeLabel: "About 100,000 light years across", tick: "Galaxy", wideOnly: true,
    fact: "Between 100 and 400 billion stars. The Sun, 26,000 light years from the centre, takes about 230 million years to go round once." },
  { id: "localgroup", name: "The Local Group", size: 9.5e22, sizeLabel: "About 10 million light years across",
    fact: "More than 80 galaxies, held together by gravity. Andromeda, 2.5 million light years away, is the biggest." },
  { id: "laniakea", name: "Laniakea", size: 4.9e24, sizeLabel: "About 520 million light years across",
    fact: "Our supercluster, home to about 100,000 galaxies all flowing towards one region of space. Its name is Hawaiian for immense heaven." },
  { id: "universe", name: "The observable universe", size: 8.8e26, sizeLabel: "About 93 billion light years across", tick: "Universe",
    fact: "Everything whose light has had time to reach us. Every observer is at the centre of their own, so this one is centred on you." },
];

/** Where the view is centred at each zoom, as log10 of the screen width in metres. Between these it glides. */
export const FOCUS: [number, number, number][] = [
  [-36, MICRO_C[0], MICRO_C[1]],
  [-1.6, MICRO_C[0], MICRO_C[1]],
  [0.15, 0.2, 0.92],
  [0.7, 0.15, 0.8],
  // On the ground the view rises as it widens, so things stand on a horizon near the bottom.
  [1.6, 2, 6],
  [2.6, 35, 60],
  [3.4, 200, 380],
  [4.5, 7000, 4800],
  [5.3, 8000, 25000],
  [6.0, 0, 1.5e5],
  [6.6, 0, 6e5],
  [7.4, EARTH_C[0], EARTH_C[1]],
  [8.0, EARTH_C[0], EARTH_C[1]],
  [9.0, (EARTH_C[0] + MOON_C[0]) / 2, (EARTH_C[1] + MOON_C[1]) / 2],
  [9.8, (EARTH_C[0] + MOON_C[0]) / 2, (EARTH_C[1] + MOON_C[1]) / 2],
  [11.7, SUN_C[0], SUN_C[1]],
  [19.9, SUN_C[0], SUN_C[1]],
  [21.0, GC[0], GC[1]],
  [21.9, GC[0], GC[1]],
  [23.0, (GC[0] + ANDROMEDA_C[0]) / 2, (GC[1] + ANDROMEDA_C[1]) / 2],
  [23.5, (GC[0] + ANDROMEDA_C[0]) / 2, (GC[1] + ANDROMEDA_C[1]) / 2],
  [24.7, (GC[0] + GREAT_ATTRACTOR[0]) / 2, (GC[1] + GREAT_ATTRACTOR[1]) / 2],
  [25.5, (GC[0] + GREAT_ATTRACTOR[0]) / 2, (GC[1] + GREAT_ATTRACTOR[1]) / 2],
  [26.4, 0, 0],
  [28, 0, 0],
];

export const Z_MIN = -35.3;
export const Z_MAX = 27.3;
export const Z_START = 0.55;

export function focusAt(z: number): [number, number] {
  if (z <= FOCUS[0][0]) return [FOCUS[0][1], FOCUS[0][2]];
  for (let i = 1; i < FOCUS.length; i++) {
    const [z1, x1, y1] = FOCUS[i];
    if (z <= z1) {
      const [z0, x0, y0] = FOCUS[i - 1];
      let t = (z - z0) / (z1 - z0);
      t = t * t * (3 - 2 * t);
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  const last = FOCUS[FOCUS.length - 1];
  return [last[1], last[2]];
}

const SUPER: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export function pow10Label(n: number) {
  return `10${String(n).split("").map((c) => SUPER[c] ?? c).join("")}`;
}

/** A tidy length for the scale bar, and its label, close to the target length in metres. */
export function niceLength(target: number): { metres: number; label: string } {
  const p = Math.floor(Math.log10(target));
  const base = Math.pow(10, p);
  const m = target / base;
  const step = m >= 5 ? 5 : m >= 2 ? 2 : 1;
  const metres = step * base;
  return { metres, label: lengthLabel(metres) };
}

export function lengthLabel(metres: number): string {
  const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString("en-GB") : String(Number(v.toPrecision(2))));
  if (metres >= 0.5 * LY) return `${fmt(metres / LY)} light year${metres / LY === 1 ? "" : "s"}`;
  if (metres >= 0.5 * AU * 10) return `${fmt(metres / AU)} au`;
  if (metres >= 1000) return `${fmt(metres / 1000)} km`;
  if (metres >= 1) return `${fmt(metres)} m`;
  if (metres >= 1e-3) return `${fmt(metres * 1e3)} mm`;
  if (metres >= 1e-6) return `${fmt(metres * 1e6)} micrometres`;
  if (metres >= 1e-9) return `${fmt(metres * 1e9)} nanometres`;
  if (metres >= 1e-12) return `${fmt(metres * 1e12)} picometres`;
  if (metres >= 1e-15) return `${fmt(metres * 1e15)} femtometres`;
  const p = Math.floor(Math.log10(metres));
  const lead = metres / Math.pow(10, p);
  return `${lead === 1 ? "" : `${Number(lead.toPrecision(2))} × `}${pow10Label(p)} m`;
}
