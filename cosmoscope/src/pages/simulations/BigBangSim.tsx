import ShaderSim from "./ShaderSim";
import type { SimPhase } from "./SimulationLayout";

const PHASES: SimPhase[] = [
  { id: "planck", label: "Planck epoch", short: "Planck", timecode: "The first 10⁻⁴³ seconds", description: "All the forces may have been one. The universe is unimaginably hot, around 10³² degrees. Our physics cannot yet describe this moment.", scienceDetail: "The Planck epoch runs from the start to about 10⁻⁴³ seconds, the Planck time. At these scales gravity should behave quantum mechanically, and we have no tested theory for that, so this era is still a mystery.", color: "#ffffff" },
  { id: "inflation", label: "Cosmic inflation", short: "Inflation", timecode: "Around 10⁻³⁶ seconds", description: "Space expands faster than light. This is not matter moving through space; space itself is growing.", scienceDetail: "Inflation is thought to have been driven by a field called the inflaton. In a tiny fraction of a second the universe grew by a factor of at least 10²⁶, smoothing it out and stretching tiny quantum ripples into the seeds of future galaxies.", color: "#a78bfa" },
  { id: "plasma", label: "Quark and gluon plasma", short: "Plasma", timecode: "Up to about a millionth of a second", description: "Energy becomes matter. The universe is an opaque, seething soup of quarks and gluons, hotter than the centre of any star.", scienceDetail: "As inflation ended, its energy turned into a hot, dense plasma of quarks, gluons, electrons, neutrinos and their antimatter partners. At about a millionth of a second it had cooled enough for quarks to bind into protons and neutrons.", color: "#ff6b35" },
  { id: "nucleosynthesis", label: "The first nuclei", short: "Nuclei", timecode: "1 to 3 minutes", description: "Protons and neutrons fuse into the first atomic nuclei: helium, and a trace of lithium. Most protons are left alone, as hydrogen.", scienceDetail: "Big Bang nucleosynthesis left the universe about 75% hydrogen and 25% helium by mass, with traces of deuterium and lithium. These proportions match what we measure today, one of the strongest pieces of evidence for the Big Bang.", color: "#ff9f43" },
  { id: "cmb", label: "The universe becomes clear", short: "Light", timecode: "380,000 years", description: "The fog lifts. Electrons settle onto nuclei to make atoms, and light travels freely for the first time. That light still reaches us as the cosmic microwave background.", scienceDetail: "At about 3,000 degrees, electrons and protons combined into hydrogen atoms, and light stopped bouncing off free electrons. That light has been travelling ever since, stretched by expansion into microwaves at 2.7 degrees above absolute zero.", color: "#F3DDB0" },
  { id: "dark-ages", label: "The dark ages", short: "Dark ages", timecode: "380,000 to about 100 million years", description: "Darkness. No stars yet, only hydrogen and helium gas slowly gathering along threads of dark matter.", scienceDetail: "Dark matter clumped under gravity and pulled gas in with it, building the first threads of the cosmic web. Nothing yet shone.", color: "#4a3f6b" },
  { id: "first-stars", label: "First stars ignite", short: "Stars", timecode: "About 100 to 200 million years", description: "The first stars switch on, huge, hot and blue, in the densest knots of gas. The universe lights up.", scienceDetail: "The first stars, called Population III, contained no heavy elements and were probably tens to hundreds of times the Sun's mass. None has been seen directly yet. Their light, with that of the first galaxies, began to reionise the gas between them.", color: "#93c5fd" },
  { id: "galaxies", label: "The first galaxies", short: "Galaxies", timecode: "A few hundred million years", description: "Stars gather into small galaxies that merge and grow. The James Webb Space Telescope has seen galaxies already shining less than 300 million years after the Big Bang.", scienceDetail: "Galaxies grew from the bottom up, small ones merging into larger ones inside haloes of dark matter. Black holes were already growing at the centres of some of them, earlier than many astronomers expected.", color: "#818cf8" },
  { id: "now", label: "Today", short: "Today", timecode: "13.8 billion years", description: "Hundreds of billions of galaxies. Trillions upon trillions of stars. And one pale blue dot, where you are reading this.", scienceDetail: "The observable universe is about 93 billion light years across. It is about 68% dark energy, 27% dark matter and 5% ordinary matter. Its expansion is speeding up, and star formation peaked around 10 billion years ago.", color: "#A9C3E0" },
];
// Everything here that never changes is worked out once when the page loads (BAKE), so each
// frame only has to look it up: the cosmic web, how galaxies clump along it, and the pattern
// in the cosmic microwave background.
const BAKE = /* glsl */ `
vec2 worley(vec2 p) {
  vec2 g = floor(p), f = fract(p);
  float f1 = 8.0, f2 = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 o = vec2(float(i), float(j));
    vec2 r = o + hash2(g + o) - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
  }
  return sqrt(vec2(f1, f2));
}
// The cosmic web: thin walls and threads between empty voids.
float web1(vec2 p) { vec2 w = worley(p); return 1.0 - smoothstep(0.0, 0.12, w.y - w.x); }
float web(vec2 p) {
  // Warped and layered so the threads wander, thicken and break like the real thing
  vec2 warp = vec2(fbm(p * 0.7 + 1.3), fbm(p * 0.7 - 4.1)) * 1.1;
  float a = web1(p + warp);
  float b = web1(p * 2.3 + warp * 1.7 + 9.0);
  float knots = smoothstep(0.25, 0.85, fbm(p * 1.3 + 2.0));
  return clamp((0.75 * a + 0.4 * b * a + 0.25 * b) * (0.35 + 0.9 * knots), 0.0, 1.0);
}
vec4 bakeField(vec2 p) {
  return vec4(
    web(p * 3.0),
    fbm(p * 8.0),
    smoothstep(0.42, 0.75, fbm(p * 2.2 + 1.3)),
    fbm(p * 4.0 + 11.0) * 0.62 + fbm(p * 13.0 + 2.0) * 0.38
  );
}
`;

const FRAG = /* glsl */ `
// Colours used for maps of the cosmic microwave background, cold blue to warm red.
vec3 cmbmap(float x) {
  x = clamp(x, 0.0, 1.0);
  vec3 a = vec3(0.02, 0.12, 0.55), b = vec3(0.45, 0.75, 1.0), c = vec3(1.0, 0.97, 0.9), d = vec3(1.0, 0.55, 0.15), e = vec3(0.75, 0.08, 0.03);
  if (x < 0.25) return mix(a, b, x / 0.25);
  if (x < 0.5) return mix(b, c, (x - 0.25) / 0.25);
  if (x < 0.75) return mix(c, d, (x - 0.5) / 0.25);
  return mix(d, e, (x - 0.75) / 0.25);
}

vec3 fog(vec2 q, float t) {
  vec2 w = q * 2.6 + vec2(fbm(q * 1.8 + t * 0.12), fbm(q * 1.8 - t * 0.1 + 4.0)) * 2.2;
  float f = fbm(w + t * 0.05);
  return mix(vec3(0.85, 0.2, 0.04), vec3(1.0, 0.78, 0.4), f) * (0.8 + 0.8 * f);
}

vec3 firstStars(vec2 p, float dens, float t) {
  // One star at most per cell, and only cells that pass the cheap tests look up the web.
  vec2 cell = floor(p * dens);
  if (hash(cell + 1.1) > 0.45 || hash(cell + 7.7) > t) return vec3(0.0);
  vec2 cen = (cell + 0.25 + 0.5 * hash2(cell)) / dens;
  if (hash(cell + 3.9) > baked(cen).r) return vec3(0.0);
  float d = length(p - cen) * dens;
  return vec3(0.72, 0.84, 1.0) * (exp(-d * d * 300.0) * 2.0 + exp(-d * 9.0) * 0.12);
}

// Galaxies scattered along the web. The layer is drawn at p * k + off, but where they clump is
// looked up in the same web, so small and large galaxies trace the same threads.
vec3 galaxies(vec2 p, float k, vec2 off, float dens, float prob, float everywhere) {
  vec3 c = vec3(0.0);
  vec2 lp2 = p * k + off;
  // A galaxy never reaches more than half a cell from its centre, so the four nearest cells are enough.
  vec2 g = floor(lp2 * dens - 0.5);
  for (int j = 0; j <= 1; j++) for (int i = 0; i <= 1; i++) {
    vec2 cell = g + vec2(float(i), float(j));
    vec2 cen = (cell + hash2(cell)) / dens;
    float onweb = mix(baked((cen - off) / k).b, 1.0, everywhere);
    if (hash(cell + 0.37) < prob * (0.1 + 0.9 * onweb)) {
      vec2 d = lp2 - cen;
      float a = hash(cell + 5.1) * 6.283;
      d = vec2(cos(a) * d.x - sin(a) * d.y, sin(a) * d.x + cos(a) * d.y);
      float sz = (0.2 + 0.8 * hash(cell + 2.2)) * 0.32 / dens;
      float e = 0.25 + 0.75 * hash(cell + 8.8);
      float rr = (d.x * d.x + d.y * d.y / (e * e)) / (sz * sz);
      vec3 gc = mix(vec3(1.0, 0.82, 0.58), vec3(0.62, 0.76, 1.0), hash(cell + 3.3));
      c += gc * (exp(-rr * 2.0) * 0.7 + exp(-rr * 14.0) * 0.9) * (0.5 + 0.9 * hash(cell + 4.4));
    }
  }
  return c;
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float T = uTime;
  vec3 col = vec3(0.0);
  // A slow drift across the web, which stops after a few minutes so it never runs off the baked area
  vec2 drift = vec2(min(T, 220.0) * 0.003, 0.0);

  // 0. The first instant: unimaginably hot, with space itself flickering
  float w = ph(0.0);
  if (w > 0.001) {
    float v = noise(q * 90.0 + T * 6.0) + 0.5 * noise(q * 170.0 - T * 9.0);
    col += vec3(1.0, 0.98, 0.94) * (1.7 + 0.35 * v) * w;
  }
  // 1. Inflation: tiny ripples are stretched to enormous size
  w = ph(1.0);
  if (w > 0.001) {
    float t = lp(1.0);
    float s = exp(t * 5.0);
    float pat = fbm(q * 90.0 / s + 3.0) * 0.6 + fbm(q * 260.0 / s - 7.0) * 0.4;
    vec3 c = mix(vec3(1.0, 0.98, 0.94) * 1.7, vec3(1.0, 0.8, 0.45) * 1.25, t);
    col += c * (0.55 + 0.75 * pat) * w;
  }
  // The hot fog of the young universe, shared by the next three steps
  float w2 = ph(2.0), w3 = ph(3.0), w4 = ph(4.0);
  vec3 fg = vec3(0.0);
  if (w2 + w3 + w4 > 0.001) fg = fog(q, T);
  // 2. A seething plasma of quarks and gluons
  if (w2 > 0.001) col += fg * 1.2 * w2;
  // 3. The first nuclei form in the cooling fog
  if (w3 > 0.001) {
    float t = lp(3.0);
    vec3 c = fg * mix(1.1, 0.75, t) * vec3(1.0, 0.85, 0.75);
    vec2 g = floor(q * 140.0);
    float spark = step(1.0 - 0.012 * t, hash(g)) * (0.6 + 0.4 * sin(T * 6.0 + hash(g + 2.0) * 6.28));
    c += vec3(1.0, 0.95, 0.8) * spark * 1.6;
    col += c * w3;
  }
  // 4. The fog lifts: light streams free, and the pattern we still see today is set
  if (w4 > 0.001) {
    float t = lp(4.0);
    vec3 cmb = cmbmap((baked(q).a - 0.25) * 1.9) * 0.85;
    vec3 f = fg * 0.75 * vec3(1.0, 0.85, 0.75);
    float clear = smoothstep(0.05, 0.5, t);
    vec3 c = mix(f, cmb, clear) * mix(1.0, 0.75, smoothstep(0.7, 1.0, t));
    col += c * w4;
  }
  // 5. The dark ages: no stars yet, only threads of dark matter slowly gathering gas
  w = ph(5.0);
  if (w > 0.001) {
    float t = lp(5.0);
    vec4 b = baked(q + drift);
    float wv = b.r * (0.5 + 0.5 * b.g);
    col += (vec3(0.03, 0.05, 0.14) * wv * (0.4 + 1.2 * t) + vec3(0.004, 0.005, 0.01)) * w;
  }
  // 6. The first stars switch on along the threads
  w = ph(6.0);
  if (w > 0.001) {
    float t = lp(6.0);
    vec2 p = q + drift;
    vec4 b = baked(p);
    float wv = b.r * (0.5 + 0.5 * b.g);
    vec3 c = vec3(0.03, 0.05, 0.14) * wv * 1.6;
    c += firstStars(p, 34.0, t);
    c += vec3(0.25, 0.32, 0.55) * 0.12 * wv * t;
    col += c * w;
  }
  // 7. The first galaxies grow and merge
  w = ph(7.0);
  if (w > 0.001) {
    float t = lp(7.0);
    vec2 p = q * (1.0 + 0.5 * t) + drift;
    vec3 c = vec3(0.025, 0.04, 0.1) * baked(p).r;
    c += firstStars(p, 34.0, 1.0) * (1.0 - t) * 0.6;
    c += galaxies(p, 1.0, vec2(0.0), 22.0, 0.25 + 0.5 * t, 0.0) * 0.9;
    col += c * w;
  }
  // 8. Today: hundreds of billions of galaxies
  w = ph(8.0);
  if (w > 0.001) {
    float t = lp(8.0);
    vec2 p = q * (1.5 + 0.6 * t) + drift;
    vec3 c = vec3(0.02, 0.03, 0.07) * baked(p).r;
    c += galaxies(p, 1.0, vec2(0.0), 14.0, 0.7, 0.2) * 1.1;
    c += galaxies(p, 1.9, vec2(5.0), 26.0, 0.55, 0.6) * 0.55;
    c += stars(q, 30.0) * 0.35;
    col += c * w;
  }

  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

export default function BigBangSim() {
  return (
    <ShaderSim
      title="The Big Bang"
      phases={PHASES}
      fragment={FRAG}
      bake={BAKE}
      bakeRange={3.3}
      closing="Most of the hydrogen in your body was made in the first moments of the universe."
    />
  );
}
