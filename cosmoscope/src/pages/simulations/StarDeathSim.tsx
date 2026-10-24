import ShaderSim from "./ShaderSim";
import type { SimPhase } from "./SimulationLayout";

const PHASES: SimPhase[] = [
  { id: "main", label: "A steady star", short: "Steady", timecode: "Today", description: "Like the Sun now: a stable, middle aged star fusing hydrogen at its centre, its gravity balanced by the pressure of hot gas.", scienceDetail: "The Sun is 4.6 billion years old and has about 5 billion years of core hydrogen left. Every second it turns about 600 million tonnes of hydrogen into helium and gives out 3.8 × 10²⁶ watts.", color: "#F3DDB0" },
  { id: "subgiant", label: "The core runs out", short: "Subgiant", timecode: "In about 5 billion years", description: "The hydrogen at the centre runs out. The core shrinks while hydrogen keeps burning in a shell around it, and the star swells and brightens.", scienceDetail: "As the core contracts it heats up, and the shell of hydrogen around it burns faster. The Sun will slowly grow and brighten over the next billion years or so.", color: "#ffb74d" },
  { id: "red-giant", label: "Red giant", short: "Red giant", timecode: "About 7 billion years from now", description: "The outer layers swell enormously. Mercury is swallowed, then Venus. Earth may be too. The Sun becomes a red giant around 200 times its present size.", scienceDetail: "At its largest, the Sun's radius may reach about 1 au. Whether Earth survives depends on how much mass the Sun loses as it grows. Either way, in about a billion years from now the Sun will already be bright enough to boil Earth's oceans away.", color: "#e53935" },
  { id: "helium", label: "Helium flash", short: "Flash", timecode: "About 7.6 billion years from now", description: "The helium core ignites all at once. For a few seconds it produces about as much power as a whole galaxy, all of it hidden deep inside the star.", scienceDetail: "The core is so dense that its pressure no longer depends on temperature, a quantum effect. When helium starts to fuse, the core heats without expanding to cool itself, and the burning runs away until it settles down.", color: "#ff9f43" },
  { id: "pn", label: "Planetary nebula", short: "Nebula", timecode: "About 8 billion years from now", description: "The outer layers drift away in shells of glowing gas, lit by the hot core left behind. These are some of the most beautiful sights in the sky.", scienceDetail: "A planetary nebula glows for only around 10,000 to 20,000 years. Some are round like rings, such as the Helix, some have two lobes like the Butterfly, and some have many shells, like the Cat's Eye.", color: "#60a5fa" },
  { id: "white-dwarf", label: "White dwarf", short: "White dwarf", timecode: "For trillions of years", description: "What remains is a white dwarf: about the size of Earth, made of carbon and oxygen, with no fusion left. It slowly cools.", scienceDetail: "White dwarfs are held up by electron degeneracy pressure, a quantum effect that stops electrons being squeezed together. They cannot be heavier than about 1.4 times the Sun's mass. Cooling all the way to a cold black dwarf would take far longer than the universe has existed.", color: "#a5f3fc" },
  { id: "supernova", label: "How bigger stars die", short: "Supernova", timecode: "Stars over 8 times the Sun's mass", description: "Stars more than eight times the Sun's mass end differently. Their iron cores collapse in less than a second, rebound, and blast the star apart as a supernova.", scienceDetail: "Fusing iron takes energy rather than giving it out, so once the core is iron nothing can hold it up. Above about 1.4 times the Sun's mass it collapses at a quarter of the speed of light in a fraction of a second. The rebound and a flood of neutrinos throw the outer layers off at 10,000 to 30,000 km per second.", color: "#ff6b35" },
];
// Sizes here are real. The view zooms out from the Sun's surface to the orbits of the inner
// planets, so you can see the red giant reach Mercury, Venus and very nearly Earth.
const FRAG = /* glsl */ `
vec3 sunSurface(vec2 p, float R, vec3 hot, vec3 cool, float cell) {
  float r = length(p);
  float n = fbm(p * cell / R + uTime * 0.12) * 0.7 + fbm(p * cell * 3.0 / R - uTime * 0.2) * 0.3;
  float limb = sqrt(max(0.0, 1.0 - r * r / (R * R)));
  return mix(cool, hot, 0.25 + 0.75 * n) * (0.35 + 0.85 * pow(limb, 0.6));
}
float ring(float r, float R, float w) { return exp(-pow((r - R) / w, 2.0)); }
vec3 sky(vec2 q) { return stars(q, 26.0) * 0.8 + 0.5 * stars(q * 1.9 + 3.0, 44.0); }

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float r = length(q);
  float T = uTime;
  vec3 col = vec3(0.0);

  // 0. A steady star, like the Sun today, seen close up
  float w = ph(0.0);
  if (w > 0.001) {
    float R = 0.27;
    vec3 c = sky(q);
    vec3 s = sunSurface(q, R, vec3(1.0, 0.88, 0.6) * 1.35, vec3(1.0, 0.45, 0.1) * 0.95, 22.0);
    c = mix(c, s, smoothstep(R, R * 0.985, r));
    c += vec3(1.0, 0.85, 0.6) * 0.35 * exp(-(r - R) * 14.0) * step(R, r);
    col += c * w;
  }
  // 1. The core runs out of hydrogen; the star swells and brightens
  w = ph(1.0);
  if (w > 0.001) {
    float t = lp(1.0);
    float R = mix(0.27, 0.36, t);
    vec3 c = sky(q);
    vec3 s = sunSurface(q, R, mix(vec3(1.0, 0.97, 0.88), vec3(1.0, 0.85, 0.6), t) * 1.8, vec3(1.0, 0.5, 0.2) * 1.2, mix(22.0, 16.0, t));
    c = mix(c, s, smoothstep(R, R * 0.985, r));
    c += vec3(1.0, 0.75, 0.45) * 0.4 * exp(-(r - R) * 12.0) * step(R, r);
    col += c * w;
  }
  // 2. Red giant: zooming out to the inner planets as the Sun grows to about 1 au
  w = ph(2.0);
  if (w > 0.001) {
    float t = lp(2.0);
    float zoom = exp(mix(log(48.0), log(0.4), smoothstep(0.0, 0.45, t)));
    float Rau = exp(mix(log(0.0075), log(0.93), smoothstep(0.08, 0.92, t)));
    float R = Rau * zoom;
    vec3 c = sky(q);
    float aus[3]; aus[0] = 0.387; aus[1] = 0.723; aus[2] = 1.0;
    float angs[3]; angs[0] = 2.2; angs[1] = 4.1; angs[2] = 0.6;
    for (int i = 0; i < 3; i++) {
      float a = aus[i];
      c += vec3(0.45, 0.55, 0.7) * 0.22 * ring(r, a * zoom, 0.0022) * step(Rau, a * 0.98);
      vec2 pp = vec2(cos(angs[i] + T * 0.05 / a), sin(angs[i] + T * 0.05 / a)) * a * zoom;
      vec3 pc = i == 0 ? vec3(0.75, 0.72, 0.68) : (i == 1 ? vec3(1.0, 0.9, 0.7) : mix(vec3(0.5, 0.7, 1.0), vec3(0.8, 0.45, 0.3), smoothstep(0.6, 1.0, t)));
      c += pc * smoothstep(0.009, 0.006, length(q - pp)) * step(Rau, a * 0.99) * 1.2;
    }
    vec3 hot = mix(vec3(1.0, 0.85, 0.6), vec3(1.0, 0.42, 0.18), smoothstep(0.1, 0.7, t)) * 1.6;
    vec3 cool = mix(vec3(1.0, 0.5, 0.2), vec3(0.6, 0.1, 0.04), smoothstep(0.1, 0.7, t)) * 1.1;
    vec3 s = sunSurface(q, R, hot, cool, mix(16.0, 4.5, t));
    float edge = mix(0.985, 0.9, t);
    c = mix(c, s, smoothstep(R, R * edge, r));
    c += cool * 0.35 * exp(-(r - R) * 6.0 / max(R, 0.05)) * step(R, r);
    col += c * w;
  }
  // 3. Helium flash: the core flares deep inside, then the star settles smaller
  w = ph(3.0);
  if (w > 0.001) {
    float t = lp(3.0);
    float zoom = 0.4;
    float Rau = exp(mix(log(0.93), log(0.05), smoothstep(0.35, 0.85, t)));
    float R = Rau * zoom;
    vec3 c = sky(q);
    vec2 pp = vec2(cos(0.6 + T * 0.05), sin(0.6 + T * 0.05)) * zoom;
    c += vec3(0.45, 0.55, 0.7) * 0.22 * ring(r, zoom, 0.0022);
    c += vec3(0.8, 0.45, 0.3) * smoothstep(0.009, 0.006, length(q - pp)) * 1.1;
    vec3 s = sunSurface(q, R, mix(vec3(1.0, 0.42, 0.18), vec3(1.0, 0.8, 0.5), smoothstep(0.4, 0.9, t)) * 1.6, vec3(0.6, 0.1, 0.04) * 1.1, mix(4.5, 12.0, t));
    c = mix(c, s, smoothstep(R, R * 0.92, r));
    float flash = smoothstep(0.12, 0.2, t) * (1.0 - smoothstep(0.2, 0.36, t));
    c += vec3(1.0, 0.95, 0.85) * flash * 1.6 * exp(-r * 18.0);
    c += vec3(1.0, 0.6, 0.3) * 0.3 * exp(-(r - R) * 6.0 / max(R, 0.02)) * step(R, r);
    col += c * w;
  }
  // 4. Planetary nebula: the outer layers drift off in glowing shells
  w = ph(4.0);
  if (w > 0.001) {
    float t = lp(4.0);
    float Rn = mix(0.12, 0.4, smoothstep(0.0, 1.0, t));
    vec3 c = sky(q);
    float a = atan(q.y, q.x);
    float n1 = fbm(vec2(a * 3.0, r * 8.0) + 3.0);
    float n2 = fbm(q * 9.0 / Rn + 7.0);
    vec2 e = vec2(q.x, q.y * 1.15);
    float re = length(e);
    float inner = smoothstep(Rn * 0.95, Rn * 0.2, re) * (0.4 + 0.6 * n2);
    float shell = ring(re, Rn, Rn * 0.16) * (0.5 + 0.8 * n1);
    float halo = ring(re, Rn * 1.45, Rn * 0.2) * 0.25 * n2;
    c += vec3(0.25, 0.75, 0.75) * inner * 0.8 + vec3(1.0, 0.32, 0.25) * shell * 1.1 + vec3(0.8, 0.3, 0.35) * halo;
    c += vec3(0.85, 0.92, 1.0) * (exp(-r * 140.0) * 2.5 + exp(-r * 30.0) * 0.2);
    col += c * w;
  }
  // 5. White dwarf: what remains is about the size of Earth, and slowly cools
  w = ph(5.0);
  if (w > 0.001) {
    float t = lp(5.0);
    vec3 c = sky(q);
    float neb = 1.0 - smoothstep(0.0, 0.5, t);
    float Rn = 0.4 + 0.2 * t;
    c += vec3(1.0, 0.32, 0.25) * ring(length(vec2(q.x, q.y * 1.15)), Rn, Rn * 0.2) * 0.5 * neb * fbm(q * 6.0);
    vec2 wd = vec2(-0.12, 0.0), ea = vec2(0.14, 0.0);
    float R = 0.07;
    vec3 wdc = mix(vec3(0.85, 0.92, 1.0) * 2.0, vec3(1.0, 0.85, 0.65) * 0.9, smoothstep(0.3, 1.0, t));
    float dw = length(q - wd);
    c = mix(c, wdc * (0.6 + 0.4 * sqrt(max(0.0, 1.0 - dw * dw / (R * R)))), smoothstep(R, R * 0.97, dw));
    c += wdc * 0.25 * exp(-(dw - R) * 25.0) * step(R, dw);
    // Earth beside it, at the same scale
    float de = length(q - ea);
    vec2 ep = (q - ea) / R;
    float land = smoothstep(0.55, 0.6, fbm(ep * 2.5 + 4.0));
    vec3 earth = mix(vec3(0.12, 0.3, 0.6), vec3(0.3, 0.45, 0.25), land) * (0.35 + 0.75 * max(0.0, dot(normalize(vec3(ep, sqrt(max(0.0, 1.0 - dot(ep, ep))))), normalize(vec3(-0.7, 0.3, 0.6)))));
    c = mix(c, earth, smoothstep(R, R * 0.97, de) * smoothstep(0.0, 0.25, t));
    col += c * w;
  }
  // 6. How bigger stars end: collapse, then a supernova
  w = ph(6.0);
  if (w > 0.001) {
    float t = lp(6.0);
    vec3 c = sky(q);
    float R = mix(0.24, 0.0, smoothstep(0.22, 0.32, t));
    if (R > 0.002) {
      vec3 s = sunSurface(q, R, vec3(0.85, 0.92, 1.0) * 1.9, vec3(0.45, 0.55, 1.0) * 1.2, 10.0);
      c = mix(c, s, smoothstep(R, R * 0.98, r));
      c += vec3(0.5, 0.65, 1.0) * 0.35 * exp(-(r - R) * 10.0 / R) * step(R, r);
    }
    float flash = smoothstep(0.3, 0.33, t) * (1.0 - smoothstep(0.33, 0.6, t));
    c += vec3(1.0, 0.95, 0.9) * flash * 4.0 * exp(-r * 3.0);
    float Rs = max(0.0, t - 0.32) * 0.75;
    if (Rs > 0.0) {
      float a = atan(q.y, q.x);
      float fil = fbm(vec2(a * 6.0, r * 14.0 - t * 4.0)) ;
      float shell = smoothstep(Rs, Rs * 0.55, r) * smoothstep(0.0, Rs * 0.3, r);
      c += mix(vec3(1.0, 0.45, 0.2), vec3(0.4, 0.85, 0.8), smoothstep(0.4, 0.75, fil)) * shell * smoothstep(0.45, 0.8, fil) * 1.4;
      c += vec3(0.5, 0.6, 1.0) * 0.2 * ring(r, Rs, 0.02);
      // The neutron star left at the centre, sweeping beams around like a lighthouse
      float beamA = T * 3.0;
      vec2 dir = vec2(cos(beamA), sin(beamA));
      float along = abs(dot(q, dir));
      float across = abs(q.x * dir.y - q.y * dir.x);
      c += vec3(0.7, 0.8, 1.0) * exp(-across / (0.004 + along * 0.05)) * exp(-along * 4.0) * 0.8 * smoothstep(0.4, 0.55, t);
      c += vec3(0.85, 0.9, 1.0) * exp(-r * 160.0) * 2.0 * smoothstep(0.35, 0.45, t);
    }
    col += c * w;
  }

  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

export default function StarDeathSim() {
  return (
    <ShaderSim
      title="Life and death of a star"
      phases={PHASES}
      fragment={FRAG}
      closing="Much of the carbon in you was made in stars like this one."
    />
  );
}
