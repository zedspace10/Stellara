// The PALE blog: a weekly letter about what happened in space, and what to look up for.
//
// HOW TO ADD A POST
// 1. Copy the first block below and paste it at the top of the list (newest first).
// 2. Give it a slug (the end of its web address, lower case words joined with hyphens), the date
//    it goes live as YYYY-MM-DD, the week it covers, a title and one line under the title.
// 3. Body: the post itself, written in Markdown. **Bold** for a heading, a blank line between
//    paragraphs, "- " at the start of a line for a list, and [words](address) for a link.
// 4. Sources: every page a fact came from, so readers can check it.
// No star death content, here or anywhere on the site.
//
// Plain data with no imports, so the build can read it for link previews.

export interface BlogPost {
  slug: string;
  /** The day the post goes live, as YYYY-MM-DD. */
  date: string;
  /** The week the post covers, shown under the title. */
  week: string;
  title: string;
  /** One line under the title, also used for link previews. */
  standfirst: string;
  /** The post, in Markdown. */
  body: string;
  sources: { label: string; href: string }[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "things-passing-through",
    date: "2026-11-11",
    week: "2 to 8 November 2026",
    title: "Things passing through",
    standfirst:
      "A tiny moon that will not stay, a telescope coming home, light from the Ice Age, and two planets meeting before dawn.",
    body: `Before dawn on Monday 16 November, step outside and face south. You'll see two lights sitting close together: bright Jupiter, and a smaller orange point beside it that is Mars. They look like neighbours, but Jupiter is more than twice as far away. Over the next few nights they'll slowly drift apart again.

This was a week of things passing through. A rock the size of a washing machine has been quietly circling the Earth since spring. A telescope that watched the sky for 22 years came home. And Hubble caught starlight that set out when mammoths walked across Europe.

Nothing up there stays still. Here's what moved this week.

**A visitor that stayed a while**

Earth has a second moon, for now. It's a small rock called 2026 QQ8, only a metre or two across, and our planet's gravity caught it around April. Astronomers first spotted it in August, and it has now been confirmed as a natural object rather than a piece of space junk.

It won't stay. By the new year it will slip away and go back to circling the Sun on its own. It passes near us roughly once a decade, but this time it stopped for a while.

**A long watch ends**

On 4 November, NASA's Swift observatory fell back into the atmosphere over Indonesia and burned up. It was built to last two years and worked for nearly 22, turning within minutes to catch the brightest flashes in the universe. Around 7,000 scientific papers rely on what it saw.

A private mission tried to reach it this summer and lift it into a higher orbit, but it did not succeed. Every instrument has its time. What it showed us stays.

**Looking back at a collision**

Four years ago, a NASA spacecraft called DART flew into a small asteroid on purpose, to find out whether we could change an asteroid's path. It worked: the little asteroid's orbit around its larger partner became 33 minutes shorter.

This week, ESA's Hera spacecraft drew in for a closer look. From about 60 km away, it sent back the first detailed pictures of the larger asteroid, Didymos, showing a side no spacecraft had seen before, with boulders, craters and long grooves. Over the coming months, Hera will work out exactly what that one push changed.

**A planet that may still be warm inside**

Mars looks frozen and still, but it may not be. ESA's ExoMars orbiter has picked up faint traces of hydrogen chloride above Alba Mons, a huge old volcano, right over a set of fresh cracks in the ground. On Earth, that gas often escapes from magma below the surface.

The scientists are careful to say it isn't proof yet. Still, it's a lovely thought that something deep under all that red dust might still be warm.

**Light from the Ice Age**

Hubble has a new picture of Messier 30, a glittering ball of ancient stars 27,500 light years away. The light in this image left those stars during the last Ice Age and has been travelling ever since, just to arrive now.

M30 also orbits our galaxy the wrong way round, against the direction the Milky Way spins. Astronomers think it was taken from a smaller galaxy long ago. Even star clusters can end up a long way from where they started.

**Seven hours outside**

On 5 November, Canadian astronaut Joshua Kutryk and NASA's Anil Menon spent seven hours outside the International Space Station. They fitted the last of eight new solar panels, finishing a job that began in 2021. The panel unrolled itself in about ten minutes, with no motor, using only the energy stored in its frame.

Kutryk is only the fifth Canadian ever to walk in space. Four hundred kilometres above us, two people held on to the outside of a spacecraft and quietly finished the work.

**Look up this week**

- **Thursday 12 November:** the Northern Taurids peak. It's a gentle shower, best late at night, with the odd slow, bright fireball.
- **Monday 16 November, around 05:30:** Mars and Jupiter at their closest, in the south. You won't need binoculars, but they'll show you more.
- **Coming up:** the Leonids on the night of 17 November, and a supermoon on 24 November.

The Moon is only a thin sliver this week, so the evenings are dark. It's a good week to find somewhere away from the streetlights and just look.`,
    sources: [
      { label: "NASA: A Farewell to Swift", href: "https://science.nasa.gov/image-article/apod-2026-november-6-a-farewell-to-swift/" },
      { label: "Space.com: Earth has captured a new mini moon", href: "https://www.space.com/astronomy/earth/earth-has-captured-a-new-mini-moon-but-it-wont-stick-around-for-long" },
      { label: "ESA: Hera resolves two asteroids", href: "https://www.esa.int/Safety_Security/Hera/First_light_Hera_resolves_two_asteroids_instead_of_one" },
      { label: "Hints of volcanic activity on Mars (Science Advances)", href: "https://www.eurekalert.org/news-releases/1150079" },
      { label: "NASA: Hubble learns galactic history from stars", href: "https://science.nasa.gov/?p=1508015" },
      { label: "Space.com: the final solar array spacewalk", href: "https://www.space.com/space-exploration/international-space-station/we-got-it-done-spacewalking-astronauts-finish-installing-next-gen-iss-solar-arrays" },
      { label: "Royal Observatory Greenwich: November 2026 night sky", href: "https://www.rmg.co.uk/stories/space-astronomy/astronomy/night-sky-highlights-november-2026" },
    ],
  },
];

/** Newest first. */
export const SORTED_POSTS: BlogPost[] = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A post's date the way people say it, for example 11 November 2026. */
export function postDate(post: BlogPost): string {
  const [y, m, d] = post.date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Posts dated in the future stay hidden until their day. */
export function isLive(post: BlogPost, today = new Date()): boolean {
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return post.date <= iso;
}
