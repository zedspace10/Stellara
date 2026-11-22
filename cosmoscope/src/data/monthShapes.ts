// One shape in the sky to find each month, for Tonight. Written for the UK on an evening around
// 9pm in the middle of the month. Plain directions and one real fact each: no myths, nothing that
// reads like a sign or a reading. Months count from 0 (January).

export interface MonthShape {
  name: string;
  where: string;
  fact: string;
}

export const MONTH_SHAPES: MonthShape[] = [
  {
    name: "Orion",
    where: "Look south after dark for three stars in a short, straight line: Orion's Belt. Above them on the left is orange Betelgeuse, and below on the right is blue white Rigel.",
    fact: "Just below the belt, a faint smudge is the Orion Nebula, a cloud about 1,300 light years away where new stars are being born.",
  },
  {
    name: "Castor and Pollux",
    where: "High in the south, two bright stars sit side by side, a little apart from everything around them. They are the heads of Gemini.",
    fact: "Castor looks like one star, but it is really six: three pairs of stars, all circling each other.",
  },
  {
    name: "Leo's Sickle",
    where: "Look south east after dark for a backwards question mark of stars. The bright star at the bottom of it is Regulus.",
    fact: "Regulus spins so fast, once every 16 hours or so, that it bulges out at its middle.",
  },
  {
    name: "The Plough",
    where: "Seven bright stars shaped like a saucepan, very high up, almost overhead late in the evening.",
    fact: "Follow the two stars at the end of the pan upwards, about five times the gap between them, and you reach Polaris, the North Star.",
  },
  {
    name: "Arcturus",
    where: "Follow the curve of the Plough's handle away from the pan and keep going. The bright orange star you reach, in the south east, is Arcturus.",
    fact: "Arcturus is an old star, about 25 times wider than the Sun, and its light takes about 37 years to reach us.",
  },
  {
    name: "Vega",
    where: "Late in the evening, high in the east, look for the brightest star in that part of the sky. It shines a clear blue white.",
    fact: "Earth's axis slowly wobbles. Vega was the North Star around 14,000 years ago, and in about 12,000 years it will be again.",
  },
  {
    name: "The Summer Triangle",
    where: "Three bright stars high in the south east make a large triangle: Vega at the top, Deneb to the left and Altair lower down.",
    fact: "Deneb looks a little fainter than the other two, but it is far, far further away. To look this bright from there, it must be tens of thousands of times brighter than the Sun.",
  },
  {
    name: "Cygnus, the Northern Cross",
    where: "Almost overhead, a large cross of stars lies along the Milky Way, with Deneb at its top. On a dark night the Milky Way runs right through it.",
    fact: "Partway along the long arm of the cross, towards its foot, lies Cygnus X-1, the first object widely accepted to be a black hole.",
  },
  {
    name: "The Square of Pegasus",
    where: "Rising in the east, four fairly bright stars make a large, almost perfect square.",
    fact: "Very few stars show inside the Square to the eye alone. Count how many you can see: it is a good test of how dark your sky is.",
  },
  {
    name: "The Andromeda Galaxy",
    where: "From the top left star of the Square of Pegasus, follow a line of stars to the left, then two stars up. On a dark night a faint, soft smudge sits there.",
    fact: "That smudge is a whole galaxy, about 2.5 million light years away. It is usually called the most distant thing you can see with your own eyes.",
  },
  {
    name: "The Pleiades",
    where: "Look east after dark for a small, tight group of stars, like a tiny saucepan. It is easier to see if you look just to one side of it.",
    fact: "Most people can see six stars. Binoculars show dozens. They are young stars, around 100 million years old, about 440 light years away.",
  },
  {
    name: "Cassiopeia",
    where: "High overhead, five stars make a large W, or an M, depending on the time of night.",
    fact: "From the UK, Cassiopeia never sets. It circles the North Star all night, every night of the year.",
  },
];

/** This month's shape, by the date of the visit. */
export function shapeFor(date = new Date()): MonthShape {
  return MONTH_SHAPES[date.getMonth()];
}
