export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string[];
  keyFacts: string[];
  quiz: QuizQuestion[];
}

export const lessons: Lesson[] = [
  // BEGINNER
  {
    id: "b1",
    slug: "what-is-the-solar-system",
    title: "What is the Solar System?",
    level: "Beginner",
    content: [
      "Our solar system consists of our star, the Sun, and everything bound to it by gravity. This includes the eight planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune), dozens of moons, and millions of asteroids, comets, and meteoroids.",
      "The inner four planets are rocky, terrestrial worlds with solid surfaces. The outer four are gas and ice giants, composed mostly of hydrogen, helium, water, ammonia, and methane.",
      "Beyond Neptune lies the Kuiper Belt, a ring of icy bodies, and the Oort Cloud, a vast spherical shell of icy debris that surrounds the entire system."
    ],
    keyFacts: [
      "The Sun contains 99.8% of all mass in the solar system.",
      "There are 8 recognized planets, divided into rocky inner planets and giant outer planets.",
      "The solar system is about 4.6 billion years old."
    ],
    quiz: [
      {
        question: "Which of the following is NOT an inner rocky planet?",
        options: ["Venus", "Earth", "Jupiter", "Mars"],
        correctIndex: 2,
        explanation: "Jupiter is a gas giant located in the outer solar system."
      },
      {
        question: "Where is most of the mass in the solar system located?",
        options: ["Jupiter", "The Asteroid Belt", "The Sun", "Earth"],
        correctIndex: 2,
        explanation: "The Sun accounts for about 99.8% of the solar system's mass."
      }
    ]
  },
  {
    id: "b2",
    slug: "how-do-stars-form",
    title: "How do Stars Form?",
    level: "Beginner",
    content: [
      "Stars are born in massive clouds of dust and gas called nebulas. Over millions of years, gravity pulls this material together into dense clumps. As these clumps grow, they generate immense pressure and heat.",
      "When the core temperature of a protostar reaches roughly 10 million degrees Celsius, nuclear fusion ignites. Hydrogen atoms smash together to form helium, releasing enormous amounts of energy.",
      "This outward energy pushes against the inward pull of gravity. When these two forces balance, a stable star is born, entering the 'main sequence' phase of its life."
    ],
    keyFacts: [
      "Stars form in stellar nurseries known as nebulas.",
      "The process powering stars is nuclear fusion.",
      "A star achieves stability when inward gravity balances outward fusion pressure."
    ],
    quiz: [
      {
        question: "What is the process that powers stars?",
        options: ["Chemical combustion", "Nuclear fission", "Nuclear fusion", "Geothermal activity"],
        correctIndex: 2,
        explanation: "Nuclear fusion of hydrogen into helium powers stars."
      },
      {
        question: "What is the dense cloud of gas and dust where stars are born called?",
        options: ["A black hole", "A quasar", "A nebula", "A pulsar"],
        correctIndex: 2,
        explanation: "Nebulas are stellar nurseries."
      }
    ]
  },
  {
    id: "b3",
    slug: "what-is-a-galaxy",
    title: "What is a Galaxy?",
    level: "Beginner",
    content: [
      "A galaxy is a massive, gravitationally bound system that consists of stars, stellar remnants, interstellar gas, dust, and dark matter. Our own galaxy is the Milky Way, which contains between 100 and 400 billion stars.",
      "Galaxies come in three main types based on their shape: Spiral (like the Milky Way, with sweeping arms), Elliptical (smooth, featureless, egg-shaped structures), and Irregular (lacking a defined shape).",
      "At the center of almost all large galaxies lies a supermassive black hole. The Milky Way's central black hole is called Sagittarius A*."
    ],
    keyFacts: [
      "The Milky Way is a spiral galaxy.",
      "Galaxies contain stars, gas, dust, and dark matter.",
      "Supermassive black holes are found at the center of most large galaxies."
    ],
    quiz: [
      {
        question: "What type of galaxy is the Milky Way?",
        options: ["Elliptical", "Spiral", "Irregular", "Lenticular"],
        correctIndex: 1,
        explanation: "The Milky Way is a barred spiral galaxy."
      },
      {
        question: "What is generally found at the center of large galaxies?",
        options: ["A supermassive black hole", "A giant star", "A dense nebula", "Nothing"],
        correctIndex: 0,
        explanation: "Supermassive black holes reside at the galactic center."
      }
    ]
  },
  {
    id: "b4",
    slug: "the-scale-of-the-universe",
    title: "The Scale of the Universe",
    level: "Beginner",
    content: [
      "The universe is incredibly vast. To measure distances in space, astronomers use 'light-years'—the distance light travels in one Earth year (about 9.46 trillion kilometers).",
      "For closer objects, we use Astronomical Units (AU), where 1 AU is the average distance from the Earth to the Sun (about 150 million kilometers).",
      "Even at the speed of light (300,000 km/s), it takes over 4 years to reach the nearest star system, Alpha Centauri, and 2.5 million years to reach our neighbor galaxy, Andromeda."
    ],
    keyFacts: [
      "1 AU is the distance from Earth to the Sun.",
      "A light-year is a measure of distance, not time.",
      "The observable universe is 93 billion light-years across."
    ],
    quiz: [
      {
        question: "What does a light-year measure?",
        options: ["Time", "Speed", "Distance", "Brightness"],
        correctIndex: 2,
        explanation: "A light-year is the distance light travels in one year."
      },
      {
        question: "What is an Astronomical Unit (AU)?",
        options: ["Distance from Earth to the Moon", "Distance from Earth to the Sun", "Distance across the Solar System", "Distance to the nearest star"],
        correctIndex: 1,
        explanation: "1 AU is the average Earth-Sun distance."
      }
    ]
  },

  // INTERMEDIATE
  {
    id: "i1",
    slug: "orbital-mechanics-explained",
    title: "Orbital Mechanics Explained",
    level: "Intermediate",
    content: [
      "Johannes Kepler formulated three laws of planetary motion in the early 17th century. First, orbits are ellipses with the central body at one focus. Second, a planet sweeps out equal areas in equal times, meaning it moves faster when closer to the star.",
      "Escape velocity is the minimum speed needed for an object to break free from the gravitational attraction of a massive body without further propulsion. For Earth, it is 11.2 km/s.",
      "Lagrange points are positions in space where the gravitational forces of a two-body system (like the Sun and Earth) produce enhanced regions of attraction and repulsion, allowing spacecraft to 'hover' in a stable position."
    ],
    keyFacts: [
      "Planetary orbits are elliptical, not perfectly circular.",
      "Escape velocity from Earth is roughly 11.2 km/s.",
      "Lagrange points (L1 to L5) are useful parking spots for space telescopes like JWST."
    ],
    quiz: [
      {
        question: "According to Kepler's First Law, what is the shape of planetary orbits?",
        options: ["Circular", "Elliptical", "Parabolic", "Hyperbolic"],
        correctIndex: 1,
        explanation: "Planetary orbits are ellipses."
      },
      {
        question: "What is escape velocity?",
        options: ["Speed needed to maintain an orbit", "Speed of light", "Speed needed to break free from gravity", "Speed of a falling object"],
        correctIndex: 2,
        explanation: "It's the speed required to escape a body's gravitational pull."
      }
    ]
  },
  {
    id: "i2",
    slug: "how-telescopes-work",
    title: "How Telescopes Work",
    level: "Intermediate",
    content: [
      "Telescopes collect and focus light. The two main optical designs are refracting (using lenses) and reflecting (using mirrors). Most modern research telescopes use large curved mirrors because they are easier to build perfectly and do not suffer from chromatic aberration.",
      "The most important feature of a telescope is its aperture—the diameter of its primary lens or mirror. A larger aperture gathers more light, allowing astronomers to see fainter objects and resolve finer details.",
      "Space telescopes like Hubble and James Webb are placed above Earth's atmosphere to avoid the blurring and filtering effects of the air, giving them incredibly sharp views."
    ],
    keyFacts: [
      "Reflectors use mirrors; refractors use lenses.",
      "Aperture size determines a telescope's light-gathering power.",
      "Space telescopes avoid atmospheric distortion."
    ],
    quiz: [
      {
        question: "Which type of telescope uses mirrors to focus light?",
        options: ["Refracting", "Reflecting", "Radio", "Interferometer"],
        correctIndex: 1,
        explanation: "Reflecting telescopes use curved mirrors."
      },
      {
        question: "What is the most important property of a telescope for seeing faint objects?",
        options: ["Magnification", "Focal length", "Aperture size", "Eyepiece quality"],
        correctIndex: 2,
        explanation: "Aperture determines how much light is collected."
      }
    ]
  },
  {
    id: "i3",
    slug: "electromagnetic-spectrum",
    title: "The Electromagnetic Spectrum",
    level: "Intermediate",
    content: [
      "Visible light is just a tiny fraction of the electromagnetic spectrum. Astronomical objects emit energy across the entire spectrum: radio waves, microwaves, infrared, visible, ultraviolet, X-rays, and gamma rays.",
      "Cool objects like dust clouds emit primarily in infrared and radio waves. Very hot, energetic events like supernovae or black hole accretion disks emit high-energy X-rays and gamma rays.",
      "Astronomers use different telescopes to observe different wavelengths, building a complete picture. For example, looking at a galaxy in radio reveals gas clouds, while X-rays reveal active black holes."
    ],
    keyFacts: [
      "Visible light is only a small part of the spectrum.",
      "Different temperatures emit different wavelengths.",
      "Multi-wavelength astronomy provides a comprehensive view of the cosmos."
    ],
    quiz: [
      {
        question: "Which wavelength is typically used to observe cool dust clouds?",
        options: ["Gamma rays", "X-rays", "Infrared", "Ultraviolet"],
        correctIndex: 2,
        explanation: "Cool objects radiate primarily in infrared and radio wavelengths."
      },
      {
        question: "Which events produce the highest energy radiation (Gamma rays)?",
        options: ["Planet formation", "Supernovae", "Asteroid collisions", "Lunar eclipses"],
        correctIndex: 1,
        explanation: "Violent events like supernovae produce gamma rays."
      }
    ]
  },
  {
    id: "i4",
    slug: "exoplanets-how-we-find-them",
    title: "Exoplanets: How We Find Them",
    level: "Intermediate",
    content: [
      "Exoplanets are planets orbiting stars outside our solar system. Because they are dim and close to bright stars, they are incredibly hard to see directly.",
      "The Transit Method detects the slight dimming of a star's light when a planet passes in front of it. The Kepler mission used this to find thousands of planets.",
      "The Radial Velocity (or Doppler) Method detects the slight 'wobble' in a star's motion caused by the gravitational tug of an orbiting planet. This wobble shifts the star's light spectrum."
    ],
    keyFacts: [
      "Direct imaging of exoplanets is very difficult.",
      "The Transit method measures dips in a star's brightness.",
      "The Radial Velocity method measures a star's wobble."
    ],
    quiz: [
      {
        question: "What does the Transit Method look for?",
        options: ["Radio signals", "A star wobbling", "A dip in a star's brightness", "Infrared heat from the planet"],
        correctIndex: 2,
        explanation: "It measures the dimming when a planet blocks starlight."
      },
      {
        question: "Which method relies on the Doppler shift of a star's light?",
        options: ["Transit method", "Radial Velocity method", "Direct Imaging", "Gravitational microlensing"],
        correctIndex: 1,
        explanation: "The Radial velocity method detects wobbling via Doppler shifts."
      }
    ]
  },

  // ADVANCED
  {
    id: "a1",
    slug: "general-relativity",
    title: "General Relativity and Gravity",
    level: "Advanced",
    content: [
      "In 1915, Albert Einstein published the General Theory of Relativity, redefining gravity. Instead of a mysterious pulling force, gravity is the curvature of spacetime caused by mass and energy.",
      "Imagine a heavy bowling ball on a trampoline; it creates a dip. A marble rolling past will curve toward the ball—not because of a pull, but because it follows the curved surface. This explains why planets orbit stars.",
      "Extreme mass concentrations, like black holes, curve spacetime infinitely. General relativity also predicts gravitational lensing, where massive clusters bend the light from galaxies far behind them."
    ],
    keyFacts: [
      "Gravity is the curvature of spacetime.",
      "Mass dictates how spacetime curves.",
      "Gravitational lensing bends light around massive objects."
    ],
    quiz: [
      {
        question: "How does General Relativity describe gravity?",
        options: ["An invisible magnetic force", "The curvature of spacetime", "Quantum entanglement", "Friction between planets"],
        correctIndex: 1,
        explanation: "Gravity is the curvature of the spacetime fabric."
      },
      {
        question: "What phenomenon occurs when a massive object bends light from a distant source?",
        options: ["Hawking radiation", "Redshift", "Gravitational lensing", "Time dilation"],
        correctIndex: 2,
        explanation: "Gravitational lensing acts as a cosmic magnifying glass."
      }
    ]
  },
  {
    id: "a2",
    slug: "stellar-evolution-hr-diagram",
    title: "Stellar Evolution and the H-R Diagram",
    level: "Advanced",
    content: [
      "The Hertzsprung-Russell (H-R) diagram plots stars according to their luminosity and surface temperature (color). It is the most vital tool for understanding stellar evolution.",
      "Stars spend about 90% of their lives on the 'Main Sequence' (a diagonal band on the diagram), fusing hydrogen. When hydrogen is depleted, they move off the sequence into the giant or supergiant branches.",
      "High-mass stars burn fuel rapidly, living short lives before exploding and leaving remnants. Low-mass stars (red dwarfs) burn fuel slowly and can live for trillions of years."
    ],
    keyFacts: [
      "The H-R diagram plots luminosity vs. temperature.",
      "Stars on the Main Sequence are fusing hydrogen.",
      "Mass determines a star's lifespan and fate."
    ],
    quiz: [
      {
        question: "What two properties are plotted on the H-R diagram?",
        options: ["Mass and Radius", "Age and Distance", "Luminosity and Temperature", "Velocity and Composition"],
        correctIndex: 2,
        explanation: "The H-R diagram plots luminosity (brightness) against temperature (color)."
      },
      {
        question: "Which stars live the longest?",
        options: ["Blue supergiants", "Yellow dwarfs", "Red dwarfs", "White dwarfs"],
        correctIndex: 2,
        explanation: "Low-mass red dwarfs burn fuel very slowly and live the longest."
      }
    ]
  },
  {
    id: "a3",
    slug: "cosmological-models",
    title: "Cosmological Models",
    level: "Advanced",
    content: [
      "The Big Bang Theory describes the universe expanding from a hot, dense state roughly 13.8 billion years ago. The discovery of the Cosmic Microwave Background (CMB) radiation strongly supported this.",
      "Cosmic Inflation proposes an exponential expansion of space in the first fraction of a second, explaining why the universe appears so uniform in all directions.",
      "The ultimate fate of the universe depends on its density. Current observations of dark energy suggest the universe will expand forever, eventually resulting in the 'Heat Death' or 'Big Freeze'."
    ],
    keyFacts: [
      "The universe began 13.8 billion years ago.",
      "Inflation explains the universe's large-scale uniformity.",
      "Dark energy causes the expansion to accelerate."
    ],
    quiz: [
      {
        question: "What observation strongly confirmed the Big Bang theory?",
        options: ["Black holes", "The Cosmic Microwave Background", "Pulsars", "Exoplanets"],
        correctIndex: 1,
        explanation: "The CMB is the afterglow of the Big Bang."
      },
      {
        question: "What is believed to be causing the universe's expansion to accelerate?",
        options: ["Dark matter", "Supermassive black holes", "Dark energy", "Antimatter"],
        correctIndex: 2,
        explanation: "Dark energy is the mysterious force driving accelerated expansion."
      }
    ]
  },
  {
    id: "a4",
    slug: "search-for-extraterrestrial-life",
    title: "The Search for Extraterrestrial Life",
    level: "Advanced",
    content: [
      "Astrobiology seeks to find life beyond Earth. We look for 'biosignatures'—gases like oxygen and methane out of equilibrium in exoplanet atmospheres that might indicate biological activity.",
      "The Drake Equation is a probabilistic argument used to estimate the number of active, communicative extraterrestrial civilizations in the Milky Way, factoring in star formation rates, planets per star, and the likelihood of life evolving.",
      "The Fermi Paradox highlights the contradiction between the high probability estimates for extraterrestrial life and the lack of evidence for it. Solutions range from 'life is exceedingly rare' to 'advanced civilizations destroy themselves'."
    ],
    keyFacts: [
      "Biosignatures are signs of life in an atmosphere.",
      "The Drake Equation estimates communicative civilizations.",
      "The Fermi Paradox asks 'Where is everybody?'"
    ],
    quiz: [
      {
        question: "What is a biosignature?",
        options: ["A radio message", "An atmospheric sign of biological activity", "A fossilized microbe", "A type of star"],
        correctIndex: 1,
        explanation: "Biosignatures are gases or chemical markers indicating life."
      },
      {
        question: "What does the Fermi Paradox question?",
        options: ["Why the universe is expanding", "Why we haven't found evidence of aliens despite high probabilities", "How black holes evaporate", "The speed of light"],
        correctIndex: 1,
        explanation: "It points out the lack of evidence for aliens despite the vastness of the universe."
      }
    ]
  }
];
