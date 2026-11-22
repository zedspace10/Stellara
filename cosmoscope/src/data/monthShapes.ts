// One shape in the sky to find each month, for Tonight. Written for the UK on an evening around
// 9pm in the middle of the month. Plain directions and one real fact each: no myths, nothing that
// reads like a sign or a reading. Months count from 0 (January).

export interface MonthShape {
  name: string;
  /** A few words for the summary at the top of Tonight. */
  short: string;
  where: string;
  fact: string;
  /** The stars to draw on the sky picture: right ascension in hours and declination in degrees (J2000). */
  stars: [number, number][];
  /** Lines between those stars, by their place in the list. */
  lines: [number, number][];
  /** A star in the list that is not a star at all, drawn as a soft smudge (the Andromeda Galaxy). */
  smudge?: number;
}

export const MONTH_SHAPES: MonthShape[] = [
  {
    name: "Orion",
    short: "Orion in the south",
    where: "Look south after dark for three stars in a short, straight line: Orion's Belt. Above them on the left is orange Betelgeuse, and below on the right is blue white Rigel.",
    fact: "Just below the belt, a faint smudge is the Orion Nebula, a cloud about 1,300 light years away where new stars are being born.",
    stars: [[5.9195, 7.407], [5.4188, 6.35], [5.5334, -0.299], [5.6036, -1.202], [5.6793, -1.943], [5.7959, -9.67], [5.2423, -8.202]],
    lines: [[0, 1], [0, 4], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6]],
  },
  {
    name: "Castor and Pollux",
    short: "Castor and Pollux high in the south",
    where: "High in the south, two bright stars sit side by side, a little apart from everything around them. They are the heads of Gemini.",
    fact: "Castor looks like one star, but it is really six: three pairs of stars, all circling each other.",
    stars: [[7.5767, 31.888], [7.7553, 28.026]],
    lines: [[0, 1]],
  },
  {
    name: "Leo's Sickle",
    short: "Leo's Sickle in the south east",
    where: "Look south east after dark for a backwards question mark of stars. The bright star at the bottom of it is Regulus.",
    fact: "Regulus spins so fast, once every 16 hours or so, that it bulges out at its middle.",
    stars: [[10.1395, 11.967], [10.1222, 16.763], [10.3329, 19.842], [10.2782, 23.417], [9.8794, 26.007], [9.7641, 23.774]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    name: "The Plough",
    short: "the Plough almost overhead",
    where: "Seven bright stars shaped like a saucepan, very high up, almost overhead late in the evening.",
    fact: "Follow the two stars at the end of the pan upwards, about five times the gap between them, and you reach Polaris, the North Star.",
    stars: [[11.0621, 61.751], [11.0307, 56.382], [11.8972, 53.695], [12.2571, 57.033], [12.9005, 55.96], [13.3988, 54.925], [13.7923, 49.313]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    name: "Arcturus",
    short: "orange Arcturus in the south east",
    where: "Follow the curve of the Plough's handle away from the pan and keep going. The bright orange star you reach, in the south east, is Arcturus.",
    fact: "Arcturus is an old star, about 25 times wider than the Sun, and its light takes about 37 years to reach us.",
    stars: [[12.9005, 55.96], [13.3988, 54.925], [13.7923, 49.313], [14.261, 19.182]],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  {
    name: "Vega",
    short: "Vega high in the east",
    where: "Late in the evening, high in the east, look for the brightest star in that part of the sky. It shines a clear blue white.",
    fact: "Earth's axis slowly wobbles. Vega was the North Star around 14,000 years ago, and in about 12,000 years it will be again.",
    stars: [[18.6156, 38.784]],
    lines: [],
  },
  {
    name: "The Summer Triangle",
    short: "the Summer Triangle high in the south east",
    where: "Three bright stars high in the south east make a large triangle: Vega at the top, Deneb to the left and Altair lower down.",
    fact: "Deneb looks a little fainter than the other two, but it is far, far further away. To look this bright from there, it must be tens of thousands of times brighter than the Sun.",
    stars: [[18.6156, 38.784], [20.6905, 45.28], [19.8464, 8.868]],
    lines: [[0, 1], [1, 2], [2, 0]],
  },
  {
    name: "Cygnus, the Northern Cross",
    short: "the Northern Cross overhead",
    where: "Almost overhead, a large cross of stars lies along the Milky Way, with Deneb at its top. On a dark night the Milky Way runs right through it.",
    fact: "Partway along the long arm of the cross, towards its foot, lies Cygnus X-1, the first object widely accepted to be a black hole.",
    stars: [[20.6905, 45.28], [20.3705, 40.257], [19.5121, 27.96], [20.7702, 33.97], [19.7496, 45.131]],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]],
  },
  {
    name: "The Square of Pegasus",
    short: "the Square of Pegasus rising in the east",
    where: "Rising in the east, four fairly bright stars make a large, almost perfect square.",
    fact: "Very few stars show inside the Square to the eye alone. Count how many you can see: it is a good test of how dark your sky is.",
    stars: [[23.0794, 15.205], [23.0629, 28.083], [0.1398, 29.091], [0.2206, 15.184]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  {
    name: "The Andromeda Galaxy",
    short: "the Andromeda Galaxy high in the east",
    where: "From the top left star of the Square of Pegasus, follow a line of stars to the left, then two stars up. On a dark night a faint, soft smudge sits there.",
    fact: "That smudge is a whole galaxy, about 2.5 million light years away. It is usually called the most distant thing you can see with your own eyes.",
    stars: [[0.1398, 29.091], [0.6555, 30.861], [1.1622, 35.621], [0.9459, 38.499], [0.8302, 41.079], [0.7123, 41.269]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    smudge: 5,
  },
  {
    name: "The Pleiades",
    short: "the Pleiades rising in the east",
    where: "Look east after dark for a small, tight group of stars, like a tiny saucepan. It is easier to see if you look just to one side of it.",
    fact: "Most people can see six stars. Binoculars show dozens. They are young stars, around 100 million years old, about 440 light years away.",
    stars: [[3.7914, 24.105], [3.8192, 24.053], [3.7479, 24.113], [3.7637, 24.368], [3.7724, 23.948], [3.7534, 24.467]],
    lines: [],
  },
  {
    name: "Cassiopeia",
    short: "Cassiopeia high overhead",
    where: "High overhead, five stars make a large W, or an M, depending on the time of night.",
    fact: "From the UK, Cassiopeia never sets. It circles the North Star all night, every night of the year.",
    stars: [[0.153, 59.15], [0.6751, 56.537], [0.9451, 60.717], [1.4303, 60.235], [1.9066, 63.67]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
];

/** This month's shape, by the date of the visit. */
export function shapeFor(date = new Date()): MonthShape {
  return MONTH_SHAPES[date.getMonth()];
}
