export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  coverImageUrl: string;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "what-is-a-black-hole",
    title: "What is a Black Hole?",
    category: "Cosmology",
    excerpt: "Exploring the mysterious objects where gravity is so strong that not even light can escape.",
    content: `
A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape it. The boundary of no return is called the event horizon.

> "Black holes are where God divided by zero." — Albert Einstein (apocryphal)

### The Schwarzschild Radius
The size of a black hole is determined by the Schwarzschild radius, the distance from the center of a black hole to its event horizon. For a black hole with the mass of our Sun, the Schwarzschild radius would be about 3 kilometers.

### Hawking Radiation
In 1974, Stephen Hawking proposed that black holes are not entirely black. Because of quantum effects near the event horizon, black holes emit a faint radiation, known as Hawking radiation, which means they can slowly evaporate over billions of years.
    `,
    readTime: "5 min",
    date: "2025-01-15",
    coverImageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "2",
    slug: "life-cycle-of-a-star",
    title: "The Life Cycle of a Star",
    category: "Deep Space",
    excerpt: "From vast nebulas to supernova explosions, trace the multi-billion-year journey of stars.",
    content: `
Stars are born in vast clouds of gas and dust called nebulas. Gravity pulls the material together, and when it gets hot enough, nuclear fusion begins.

> "We are made of star-stuff." — Carl Sagan

### Main Sequence
Most of a star's life is spent in the main sequence phase, fusing hydrogen into helium. Our Sun is currently in this stable phase and will remain there for another 5 billion years.

### The End of the Line
When hydrogen is depleted, stars expand into red giants. For medium stars like our Sun, they eventually shed their outer layers, leaving a dense white dwarf. Massive stars undergo a violent supernova explosion, leaving behind either a neutron star or a black hole.
    `,
    readTime: "6 min",
    date: "2025-02-10",
    coverImageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    slug: "exploring-moons-of-jupiter",
    title: "Exploring the Moons of Jupiter",
    category: "Planets",
    excerpt: "Jupiter has 95 known moons. The four largest, the Galilean moons, are fascinating worlds of their own.",
    content: `
Jupiter is a mini solar system in its own right. The four largest moons—Io, Europa, Ganymede, and Callisto—were discovered by Galileo Galilei in 1610.

> "The discovery of Jupiter's moons changed our understanding of the universe forever, proving that not everything revolves around Earth."

### Io
Io is the most volcanically active body in the solar system, with hundreds of volcanoes erupting continuously due to tidal heating from Jupiter's immense gravity.

### Europa
Europa has a smooth, icy surface with a massive liquid water ocean beneath. It is considered one of the most promising places to look for extraterrestrial life.

### Ganymede and Callisto
Ganymede is the largest moon in the solar system (bigger than the planet Mercury) and the only moon with its own magnetic field. Callisto is heavily cratered and ancient, serving as a record of the early solar system's history.
    `,
    readTime: "7 min",
    date: "2025-03-05",
    coverImageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "4",
    slug: "james-webb-discoveries",
    title: "The James Webb Space Telescope: What We've Discovered",
    category: "Space Missions",
    excerpt: "JWST has peered deeper into the universe than ever before, revealing stunning new details.",
    content: `
Since launching in December 2021, the James Webb Space Telescope (JWST) has transformed astronomy with its powerful infrared vision.

> "JWST isn't just looking at the stars; it's looking back in time to the very dawn of the universe."

### Early Galaxies
JWST has found galaxies that formed just a few hundred million years after the Big Bang, much earlier and more fully formed than theoretical models predicted.

### Exoplanet Atmospheres
The telescope has successfully detected water, carbon dioxide, and sulfur dioxide in the atmospheres of distant exoplanets, bringing us closer to finding potentially habitable worlds.
    `,
    readTime: "8 min",
    date: "2025-03-20",
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "5",
    slug: "beginners-guide-stargazing-uk",
    title: "A Beginner's Guide to Stargazing",
    category: "Stargazing",
    excerpt: "Everything you need to know to start exploring the night sky from your own backyard.",
    content: `
You don't need a massive telescope to enjoy astronomy. Stargazing starts with just your eyes and a dark sky.

> "The night sky is a grand, free show, available to anyone willing to look up."

### Finding Dark Skies
Light pollution hides the stars. Look for certified Dark Sky Reserves or simply drive away from city lights on a clear, moonless night.

### What to Look For
Start by learning the major constellations like Orion, Ursa Major, and Cassiopeia. Use a star map app to identify bright planets like Jupiter, Saturn, and Venus, which often look like non-twinkling bright stars.

### Equipment
Binoculars are the best first investment for stargazing. They offer a wide field of view, are portable, and can reveal craters on the Moon and the moons of Jupiter.
    `,
    readTime: "4 min",
    date: "2025-04-12",
    coverImageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "6",
    slug: "dark-matter-dark-energy",
    title: "Dark Matter and Dark Energy: The Universe's Greatest Mystery",
    category: "Cosmology",
    excerpt: "Everything we can see makes up only 5% of the universe. What is the rest?",
    content: `
The stars, planets, gas clouds, and galaxies—everything made of normal matter—accounts for just 5% of the universe's total mass-energy.

> "The universe is not only stranger than we imagine, it is stranger than we can imagine."

### Dark Matter (27%)
We know dark matter exists because of its gravitational effects on visible matter. Galaxies spin too fast to be held together only by the gravity of their visible stars; dark matter provides the extra 'glue'.

### Dark Energy (68%)
In 1998, astronomers discovered that the universe's expansion is accelerating. The mysterious force driving this acceleration is called dark energy. Unlike gravity, which pulls things together, dark energy pushes space apart.
    `,
    readTime: "9 min",
    date: "2025-04-28",
    coverImageUrl: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&q=80&w=800"
  }
];
