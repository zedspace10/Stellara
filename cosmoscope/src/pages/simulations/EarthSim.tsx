import ShaderSim from "./ShaderSim";
import type { SimPhase } from "./SimulationLayout";

const PHASES: SimPhase[] = [
  {
    id: "disc",
    label: "A disc around a young Sun",
    short: "Disc",
    timecode: "4.6 billion years ago",
    description: "The Sun has just formed from a collapsing cloud. Around it spins a flat disc of gas and dust: the raw material of every planet.",
    scienceDetail: "Grains of dust stick together, then pebbles, then rocks a kilometre or more across. Some meteorites that fall to Earth today are leftovers from this disc, and they let us date this moment to about 4.57 billion years ago.",
    color: "#F3DDB0",
  },
  {
    id: "molten",
    label: "A world of molten rock",
    short: "Molten",
    timecode: "4.54 billion years ago",
    description: "Rocks crash together and Earth grows. The energy of all those impacts melts the young planet, covering it in an ocean of magma.",
    scienceDetail: "Earth took tens of millions of years to grow to roughly its full size. Heavy iron sank to the middle to form the core, which is why Earth still has a hot iron heart and a magnetic field today.",
    color: "#ff7a3d",
  },
  {
    id: "moon",
    label: "The impact that made the Moon",
    short: "Moon",
    timecode: "About 4.5 billion years ago",
    description: "A world about the size of Mars slams into the young Earth. The debris thrown out forms a ring, and the ring comes together as the Moon.",
    scienceDetail: "This is the leading explanation, called the giant impact hypothesis, and the colliding world is often named Theia. It explains why the Moon's rocks are so like Earth's, and why the Moon has only a small iron core.",
    color: "#C9CDD4",
  },
  {
    id: "oceans",
    label: "The first oceans",
    short: "Oceans",
    timecode: "About 4.4 billion years ago",
    description: "The surface cools and a crust forms. Water vapour condenses, and oceans fill the low ground. The Moon is much closer than it is today, and looks far bigger in the sky.",
    scienceDetail: "Tiny crystals called zircons from Western Australia, about 4.4 billion years old, carry chemical signs of liquid water. The Moon has been drifting away ever since, and still moves about 3.8 centimetres further from us every year.",
    color: "#5B8FD6",
  },
  {
    id: "life",
    label: "Life begins",
    short: "Life",
    timecode: "At least 3.5 billion years ago",
    description: "In shallow seas the first living things appear: single cells, far too small to see. Some build mounds layer by layer, and those mounds survive today as fossils.",
    scienceDetail: "Fossil mounds called stromatolites, built by mats of microbes, are found in rocks about 3.5 billion years old. Life may have begun earlier still. Nobody yet knows exactly how it started.",
    color: "#6FCB8E",
  },
  {
    id: "oxygen",
    label: "The air fills with oxygen",
    short: "Oxygen",
    timecode: "About 2.4 billion years ago",
    description: "Microbes have learned to make food from sunlight, giving off oxygen as they do. Slowly it builds up in the air, and changes the planet for good.",
    scienceDetail: "This is called the Great Oxidation Event, and the oxygen came from cyanobacteria. It turned iron in the oceans to rust, leaving bands of red rock found around the world. Some scientists think the early sky was hazy and orange with methane, and that oxygen helped clear it.",
    color: "#A9C3E0",
  },
  {
    id: "land",
    label: "Life moves onto land",
    short: "Land",
    timecode: "About 500 million years ago",
    description: "After billions of years of single cells, life grows bigger and more complex. Plants creep out of the water and turn the bare continents green.",
    scienceDetail: "Around 540 million years ago, many new kinds of animals appear quickly in the fossil record, an event called the Cambrian explosion. Simple plants were living on land by about 470 million years ago, and forests followed.",
    color: "#7DBE6A",
  },
  {
    id: "asteroid",
    label: "The end of the dinosaurs",
    short: "Asteroid",
    timecode: "66 million years ago",
    description: "After more than 160 million years, the age of the dinosaurs ends when an asteroid about 10 kilometres wide strikes the planet. Dust and smoke darken the sky for years.",
    scienceDetail: "The crater, called Chicxulub, lies buried under Mexico's Yucatán Peninsula and is about 180 kilometres across. Around three quarters of all species died out. Birds are the dinosaurs that survived, and small mammals went on to fill the world.",
    color: "#E0864F",
  },
  {
    id: "us",
    label: "Us, and a pale blue dot",
    short: "Today",
    timecode: "The last 300,000 years",
    description: "Our species appears in Africa about 300,000 years ago. Today the lights of our cities glow on the night side. Seen from far enough away, all of it is a single point of light.",
    scienceDetail: "In 1990 Voyager 1 turned its camera back from about 6 billion kilometres away and photographed Earth as a dot smaller than a single pixel, caught in a ray of scattered sunlight.",
    color: "#A9C3E0",
  },
];

// Drawn entirely on the graphics card. Planets are lit spheres with surfaces made of noise; sizes
// and distances are chosen to be seen, not to scale.
const FRAG = /* glsl */ `
vec3 sunDir() { return normalize(vec3(-0.62, 0.3, 0.72)); }

// A sphere centred at c: its surface normal, and m, how much of this pixel it covers.
vec3 sphereN(vec2 q, vec2 c, float R, out float m) {
  vec2 d = (q - c) / R;
  float r2 = dot(d, d);
  m = smoothstep(1.0, 0.965, r2);
  return vec3(d, sqrt(max(0.0, 1.0 - r2)));
}
vec3 spinY(vec3 n, float a) { float c = cos(a), s = sin(a); return vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z); }
// Noise laid over a sphere, so it turns with the planet.
float sfbm(vec3 n, float k, float o) { return fbm(n.xy * k + n.z * k * 0.6 + o); }
// The same, looked at from three directions and blended, so the main features never smear.
float tfbm(vec3 n, float k, float o) {
  vec3 w = n * n;
  w /= (w.x + w.y + w.z);
  return fbm(n.yz * k + o) * w.x + fbm(n.xz * k + o + 3.7) * w.y + fbm(n.xy * k + o + 7.3) * w.z;
}

vec3 moonBody(vec2 q, vec2 c, float R, out float m) {
  vec3 n = sphereN(q, c, R, m);
  float d = max(dot(n, sunDir()), 0.0);
  return mix(vec3(0.32), vec3(0.72), sfbm(n, 3.0, 11.0)) * (0.04 + 1.1 * d);
}

vec3 molten(vec2 q, vec2 c, float R, float rot, float cool, out float m) {
  vec3 n = sphereN(q, c, R, m);
  vec3 nr = spinY(n, rot);
  float f = tfbm(nr, 2.6, 1.0);
  float crack = 1.0 - smoothstep(0.0, 0.05 + 0.04 * cool, abs(f - 0.5));
  float crust = smoothstep(0.35, 0.65, tfbm(nr, 4.0, 4.0) + cool * 0.45);
  float diff = max(dot(n, sunDir()), 0.0);
  vec3 lava = mix(vec3(1.0, 0.33, 0.05), vec3(1.0, 0.75, 0.3), sfbm(nr, 9.0, 8.0)) * 1.5;
  vec3 col = mix(lava * (1.0 - 0.6 * cool), vec3(0.16, 0.12, 0.1) * (0.1 + diff), crust);
  col += lava * crack * (1.0 - 0.6 * cool);
  return col + vec3(1.0, 0.4, 0.1) * pow(1.0 - n.z, 3.0) * 0.35;
}

// Earth at some age: how high the sea is, how green the land, how blue and clear the air,
// how cloudy, and whether city lights shine on the night side.
vec3 earth(vec2 q, vec2 c, float R, float rot, float sea, float green, float blue, float cloud, float lights, out float m) {
  vec3 n = sphereN(q, c, R, m);
  vec3 L = sunDir();
  vec3 nr = spinY(n, rot);
  float h = tfbm(nr, 2.0, 7.0);
  float land = smoothstep(sea, sea + 0.025, h);
  vec3 ocean = mix(vec3(0.02, 0.07, 0.2), vec3(0.04, 0.17, 0.38), smoothstep(sea - 0.15, sea, h));
  vec3 rock = mix(vec3(0.32, 0.27, 0.21), vec3(0.5, 0.42, 0.33), sfbm(nr, 7.0, 2.0));
  float g = clamp(green * (0.4 + smoothstep(0.25, 0.6, sfbm(nr, 4.0, 5.0)) * 1.2), 0.0, 1.0);
  vec3 ground = mix(rock, vec3(0.1, 0.3, 0.1), g);
  float ice = smoothstep(0.82, 0.92, abs(nr.y)) * smoothstep(0.5, 1.0, blue);
  ground = mix(ground, vec3(0.9), ice);
  vec3 surf = mix(ocean, ground, land);
  float diff = max(dot(n, L), 0.0);
  vec3 col = surf * (0.03 + 1.15 * diff);
  vec3 rf = reflect(-L, n);
  col += vec3(1.0, 0.95, 0.85) * pow(max(rf.z, 0.0), 40.0) * 0.5 * (1.0 - land) * diff;
  float cl = smoothstep(0.5, 0.75, sfbm(spinY(n, rot * 1.3 + uTime * 0.01), 3.2, 19.0)) * cloud;
  col = mix(col, vec3(0.95) * (0.04 + diff), cl * 0.85);
  float night = 1.0 - smoothstep(-0.1, 0.12, dot(n, L));
  float city = step(0.93, hash(floor(nr.xy * 90.0 + nr.z * 31.0))) * land * (1.0 - ice) * (1.0 - cl);
  col += vec3(1.0, 0.75, 0.4) * city * night * lights;
  vec3 air = mix(vec3(0.85, 0.55, 0.3), vec3(0.35, 0.6, 1.0), blue);
  col = mix(col, air * (0.15 + diff), pow(1.0 - n.z, 2.5) * 0.6);
  col = mix(col, air * 0.55 * (0.15 + diff), (1.0 - blue) * 0.3);
  return col;
}
// A thin glow of air just outside a planet's edge, brightest on the sunlit side.
vec3 halo(vec2 q, vec2 c, float R, vec3 air) {
  float r = length(q - c);
  if (r < R) return vec3(0.0);
  float lit = 0.3 + 0.7 * max(dot(normalize(q - c), normalize(sunDir().xy)), 0.0);
  return air * exp(-(r - R) / R * 14.0) * 0.55 * lit;
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float r = length(q);
  float T = uTime;
  vec3 col = vec3(0.0);
  float m, mm;

  // 0. A disc of gas and dust around the young Sun
  float w = ph(0.0);
  if (w > 0.001) {
    float t = lp(0.0);
    vec3 c = stars(q, 26.0) * 0.7;
    vec2 e = vec2(q.x, q.y / 0.3);
    float re = length(e);
    float a = atan(e.y, e.x);
    float sw = a - T * 0.25 / (re * 3.0 + 0.3);
    float dust = fbm(vec2(cos(sw), sin(sw)) * 2.0 + vec2(re * 9.0, 0.0));
    float disc = smoothstep(0.85, 0.1, re) * smoothstep(0.03, 0.09, re);
    float rings = 0.8 + 0.2 * cos(re * 70.0 + dust * 3.0);
    vec3 dc = mix(vec3(0.55, 0.32, 0.18), vec3(0.95, 0.75, 0.5), smoothstep(0.5, 0.05, re));
    c += dc * disc * (0.25 + 0.9 * dust) * rings * 0.9;
    c *= 1.0 - 0.6 * exp(-pow(q.y / 0.012, 2.0)) * smoothstep(0.35, 0.05, abs(q.x));
    c += vec3(1.0, 0.85, 0.6) * (exp(-r * 40.0) * 2.5 + exp(-r * 9.0) * 0.4);
    // Clumps gathering into the first planets
    vec2 g = floor(e * 26.0);
    float k = step(1.0 - 0.06 * t, hash(g)) * disc;
    c += vec3(1.0, 0.85, 0.65) * k * smoothstep(0.25, 0.0, length(fract(e * 26.0) - 0.5)) * 0.9;
    col += c * w;
  }

  // 1. A world of molten rock, still being hit
  w = ph(1.0);
  if (w > 0.001) {
    float t = lp(1.0);
    vec3 c = stars(q, 26.0) * 0.6;
    float R = mix(0.2, 0.3, smoothstep(0.0, 0.6, t));
    vec3 p = molten(q, vec2(0.0), R, T * 0.05, t * 0.3, m);
    c += vec3(1.0, 0.45, 0.15) * exp(-max(r - R, 0.0) / R * 10.0) * 0.35;
    c = mix(c, p, m);
    float k = floor(T * 1.3);
    vec2 hit = (hash2(vec2(k, 3.0)) - 0.5) * R * 1.2;
    float age = fract(T * 1.3);
    c += vec3(1.0, 0.9, 0.7) * exp(-length(q - hit) * 90.0) * (1.0 - age) * 2.0 * m;
    col += c * w;
  }

  // 2. A world the size of Mars strikes, and the Moon forms from the debris
  w = ph(2.0);
  if (w > 0.001) {
    float t = lp(2.0);
    vec3 c = stars(q, 26.0) * 0.6;
    float R = 0.24, Rt = 0.13, hitT = 0.32;
    vec2 contact = normalize(vec2(0.86, 0.51)) * (R + Rt);
    float after = smoothstep(hitT, hitT + 0.08, t);
    // The debris ring, tilted so its near side passes in front of Earth
    vec2 e = vec2(q.x, q.y / 0.26);
    float re = length(e);
    float ringR = mix(0.36, 0.5, smoothstep(hitT, 0.7, t));
    float streak = 0.5 + 0.8 * fbm(vec2(atan(e.y, e.x) * 5.0 - T * 0.6, re * 18.0));
    float ring = exp(-pow((re - ringR) / 0.07, 2.0)) * streak * after * (1.0 - smoothstep(0.7, 0.98, t));
    vec3 ringCol = vec3(1.0, 0.6, 0.3) * ring * 0.9;
    // The Moon gathers on its orbit
    float ang = 2.4 + t * 4.0;
    vec2 mc = vec2(cos(ang), sin(ang) * 0.26) * 0.5;
    float mR = 0.065 * smoothstep(0.6, 0.95, t);
    bool moonBehind = sin(ang) > 0.0;
    c += ringCol * step(0.0, q.y);
    if (moonBehind && mR > 0.001) { vec3 mo = moonBody(q, mc, mR, mm); c = mix(c, mo, mm); }
    vec3 p = molten(q, vec2(0.0), R, T * 0.05, 0.35 - 0.3 * after + 0.4 * smoothstep(0.7, 1.0, t), m);
    c += vec3(1.0, 0.45, 0.15) * exp(-max(r - R, 0.0) / R * 10.0) * 0.3 * (0.5 + after);
    c = mix(c, p, m);
    c += ringCol * step(q.y, 0.0);
    if (!moonBehind && mR > 0.001) { vec3 mo = moonBody(q, mc, mR, mm); c = mix(c, mo, mm); }
    // Theia, on its way in
    if (t < hitT + 0.02) {
      vec2 tc = mix(vec2(1.3, 0.75), contact, pow(clamp(t / hitT, 0.0, 1.0), 1.6));
      vec3 th = molten(q, tc, Rt, 1.0, 0.8, mm);
      c = mix(c, th * 0.8, mm);
    }
    float flash = smoothstep(hitT - 0.01, hitT + 0.01, t) * (1.0 - smoothstep(hitT + 0.01, hitT + 0.2, t));
    c += vec3(1.0, 0.92, 0.8) * flash * (exp(-length(q - contact * 0.8) * 6.0) * 3.0 + 0.3);
    col += c * w;
  }

  // 3. The crust cools and oceans fill; the Moon hangs close
  w = ph(3.0);
  if (w > 0.001) {
    float t = lp(3.0);
    vec3 c = stars(q, 26.0) * 0.6;
    vec2 ec = vec2(-0.08, -0.02);
    float R = 0.3;
    float sea = mix(0.26, 0.58, smoothstep(0.05, 0.9, t));
    c += halo(q, ec, R, vec3(0.85, 0.55, 0.3));
    vec3 p = earth(q, ec, R, T * 0.04, sea, 0.0, 0.0, 0.2 + 0.35 * t, 0.0, m);
    // The last of the heat, glowing through the new crust
    p += vec3(1.0, 0.35, 0.08) * (1.0 - smoothstep(0.0, 0.35, t)) * 0.25 * m;
    c = mix(c, p, m);
    vec3 mo = moonBody(q, vec2(0.56, 0.27), 0.075, mm);
    c = mix(c, mo, mm);
    col += c * w;
  }

  // 4. Life begins in a shallow sea
  w = ph(4.0);
  if (w > 0.001) {
    float t = lp(4.0);
    float up = q.y + 0.5;
    vec3 c = mix(vec3(0.0, 0.04, 0.06), vec3(0.03, 0.28, 0.33), smoothstep(0.0, 1.0, up));
    c += vec3(0.25, 0.5, 0.5) * smoothstep(0.55, 0.85, fbm(vec2(q.x * 6.0 + q.y * 1.5, T * 0.15))) * smoothstep(-0.2, 0.5, q.y) * 0.35;
    c += vec3(0.4, 0.7, 0.7) * smoothstep(0.62, 0.9, fbm(q * 12.0 + T * 0.3)) * smoothstep(0.3, 0.5, q.y) * 0.4;
    // Mounds built by microbes, layer by layer
    float grow = smoothstep(0.1, 0.8, t);
    float bed = -0.34 + 0.03 * fbm(vec2(q.x * 4.0, 1.0)) + 0.09 * pow(max(0.0, sin(q.x * 9.0 + 1.0)), 2.0) * grow;
    float below = smoothstep(bed + 0.004, bed - 0.004, q.y);
    vec3 rock = mix(vec3(0.18, 0.16, 0.12), vec3(0.3, 0.27, 0.2), 0.5 + 0.5 * sin(q.y * 140.0 + fbm(q * 8.0) * 4.0));
    rock += vec3(0.05, 0.22, 0.1) * exp(-(bed - q.y) * 40.0) * grow;
    c = mix(c, rock * 0.8, below);
    // Single cells drifting, more of them as time goes on
    vec2 p = q + vec2(T * 0.01, sin(T * 0.2) * 0.01);
    vec2 g = floor(p * 38.0), f = fract(p * 38.0);
    if (hash(g + 4.2) < 0.02 + 0.3 * t) {
      float d = length(f - (0.25 + 0.5 * hash2(g)));
      c += vec3(0.3, 0.8, 0.5) * smoothstep(0.17, 0.12, d) * (0.45 + 0.55 * smoothstep(0.06, 0.13, d)) * (1.0 - below) * 0.7;
    }
    col += c * w;
  }

  // 5. Oxygen builds up in the air
  w = ph(5.0);
  if (w > 0.001) {
    float t = lp(5.0);
    vec3 c = stars(q, 26.0) * 0.6;
    vec2 ec = vec2(0.0, -0.01);
    float R = 0.32;
    float blue = smoothstep(0.1, 0.85, t);
    vec3 air = mix(vec3(0.85, 0.55, 0.3), vec3(0.35, 0.6, 1.0), blue);
    c += halo(q, ec, R, air);
    vec3 p = earth(q, ec, R, T * 0.04 + 2.0, 0.53, 0.0, blue, 0.45, 0.0, m);
    c = mix(c, p, m);
    col += c * w;
  }

  // 6. Plants turn the continents green
  w = ph(6.0);
  if (w > 0.001) {
    float t = lp(6.0);
    vec3 c = stars(q, 26.0) * 0.6;
    vec2 ec = vec2(0.0, -0.01);
    float R = 0.33;
    c += halo(q, ec, R, vec3(0.35, 0.6, 1.0));
    vec3 p = earth(q, ec, R, T * 0.04 + 4.0, 0.5, smoothstep(0.15, 0.85, t), 1.0, 0.5, 0.0, m);
    c = mix(c, p, m);
    col += c * w;
  }

  // 7. An asteroid strikes, and dust darkens the world
  w = ph(7.0);
  if (w > 0.001) {
    float t = lp(7.0);
    vec3 c = stars(q, 26.0) * 0.6;
    vec2 ec = vec2(0.14, -0.12);
    float R = 0.42;
    float hitT = 0.28;
    vec2 I = ec + R * vec2(-0.45, 0.4);
    c += halo(q, ec, R, vec3(0.35, 0.6, 1.0));
    vec3 p = earth(q, ec, R, 5.2 + T * 0.01, 0.5, 1.0, 1.0, 0.45, 0.0, m);
    // Dust spreading from the impact, then slowly settling
    float spread = clamp((t - hitT) * 1.4, 0.0, 1.2);
    float dust = smoothstep(spread * 0.9, spread * 0.9 - 0.15, length(q - I)) * step(hitT, t);
    dust = max(dust, smoothstep(0.45, 0.75, t) * 0.85);
    dust *= 1.0 - smoothstep(0.78, 1.0, t);
    dust *= 0.6 + 0.4 * fbm(q * 9.0 + T * 0.05);
    p = mix(p, vec3(0.12, 0.09, 0.07) * (0.2 + 0.8 * max(dot(sphereN(q, ec, R, mm), sunDir()), 0.0)), clamp(dust, 0.0, 0.92));
    c = mix(c, p, m);
    if (t < hitT) {
      vec2 start = vec2(-1.1, 0.75);
      float k = pow(t / hitT, 1.4);
      vec2 a = mix(start, I, k);
      vec2 dir = normalize(I - start);
      float along = dot(q - a, -dir);
      float across = length((q - a) + dir * along);
      c += vec3(1.0, 0.8, 0.55) * exp(-across * 260.0) * exp(-max(along, 0.0) * 8.0) * step(0.0, along) * 1.2;
      c += vec3(1.0, 0.9, 0.75) * exp(-length(q - a) * 160.0) * 2.0;
    }
    float flash = smoothstep(hitT - 0.005, hitT + 0.005, t) * (1.0 - smoothstep(hitT + 0.005, hitT + 0.12, t));
    c += vec3(1.0, 0.85, 0.6) * flash * exp(-length(q - I) * 12.0) * 3.0;
    col += c * w;
  }

  // 8. Us: city lights on the night side, then the whole world becomes a pale blue dot
  w = ph(8.0);
  if (w > 0.001) {
    float t = lp(8.0);
    vec3 c = stars(q, 26.0) * 0.6;
    float zoom = smoothstep(0.35, 0.95, t);
    float R = 0.3 * exp(log(0.006) * zoom);
    vec2 ec = mix(vec2(0.0, -0.01), vec2(0.3, 0.15), zoom);
    // A ray of scattered sunlight across the frame, as in Voyager's photograph
    vec2 nrm = normalize(vec2(1.0, 0.35));
    float band = exp(-pow(dot(q - ec, nrm) / 0.045, 2.0)) * smoothstep(0.5, 0.9, t);
    c += vec3(0.42, 0.33, 0.24) * band * 0.45;
    c += halo(q, ec, R, vec3(0.35, 0.6, 1.0)) * (1.0 - zoom);
    vec3 p = earth(q, ec, max(R, 0.004), 0.6 + T * 0.03, 0.5, 1.0, 1.0, 0.45, 1.0 - zoom * 0.8, m);
    c = mix(c, p, m * (1.0 - smoothstep(0.012, 0.005, R)));
    // Once it is smaller than a pixel or two, all that is left is a point of pale blue light
    c += vec3(0.55, 0.72, 1.0) * smoothstep(0.03, 0.006, R) * (exp(-pow(length(q - ec) / 0.0035, 2.0)) * 2.2 + exp(-length(q - ec) / 0.012) * 0.25);
    col += c * w;
  }

  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

export default function EarthSim() {
  return (
    <ShaderSim
      title="The story of Earth"
      phases={PHASES}
      fragment={FRAG}
      closing="It took 4.6 billion years to make the world you are standing on."
    />
  );
}
