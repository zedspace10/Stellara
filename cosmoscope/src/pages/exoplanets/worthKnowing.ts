// Six worlds worth knowing, shown at the top of Other worlds. Names match NASA's archive so each
// one opens its own page. Every line is checked against NASA; keep them plain and honest.

export interface WorthKnowing {
  /** The planet's name in the NASA Exoplanet Archive. */
  archive: string;
  name: string;
  where: string;
  text: string;
}

export const WORTH_KNOWING: WorthKnowing[] = [
  {
    archive: "51 Peg b",
    name: "51 Pegasi b",
    where: "50 light years away. A year there lasts about 4 days.",
    text: "In 1995, the first planet found around a star like the Sun. A giant, about half the mass of Jupiter, racing round its star in just over four days. Its discoverers shared the Nobel Prize in Physics in 2019.",
  },
  {
    archive: "Proxima Cen b",
    name: "Proxima Centauri b",
    where: "4.2 light years away. A year there lasts about 11 days.",
    text: "It circles the nearest star to the Sun. It is probably rocky and sits where water could be liquid, but its small red star often flares, which may have stripped its air away.",
  },
  {
    archive: "TRAPPIST-1 e",
    name: "TRAPPIST-1e",
    where: "40 light years away. A year there lasts about 6 days.",
    text: "One of seven Earth sized planets around a small, cool star. All seven would fit inside the orbit of Mercury. Webb is looking to see whether any of them have kept an atmosphere.",
  },
  {
    archive: "Kepler-186 f",
    name: "Kepler-186f",
    where: "About 580 light years away. A year there lasts about 130 days.",
    text: "Found in 2014, the first planet about the size of Earth at the right distance from its star for liquid water. Its star is redder than the Sun, so noon there might look like the hour before sunset here.",
  },
  {
    archive: "55 Cnc e",
    name: "55 Cancri e",
    where: "41 light years away. A year there lasts about 18 hours.",
    text: "Almost twice the width of Earth, and so close to its star that its surface is probably molten rock. A whole year there is shorter than one day here.",
  },
  {
    archive: "Kepler-16 b",
    name: "Kepler-16b",
    where: "245 light years away. A year there lasts about 229 days.",
    text: "A cold world about the size of Saturn that circles two stars at once. From its sky you would see two suns rise and two suns set.",
  },
];
