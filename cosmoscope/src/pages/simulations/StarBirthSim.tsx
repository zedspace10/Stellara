import ShaderSim from "./ShaderSim";
import type { SimPhase } from "./SimulationLayout";

const PHASES: SimPhase[] = [
  { id: "cloud", label: "A cold cloud", short: "Cloud", timecode: "The beginning", description: "A vast, cold cloud of gas and dust floats in space, mostly hydrogen. It is dark and almost invisible.", scienceDetail: "Clouds like this can be tens to hundreds of light years across and hold up to millions of times the Sun's mass. They are only about 10 to 20 degrees above absolute zero. Turbulence and magnetic fields hold them up against gravity, for a while.", color: "#2d3a4a" },
  { id: "shockwave", label: "Something gives it a push", short: "Push", timecode: "Year 0", description: "A disturbance, such as the shockwave from a nearby supernova or a collision with another cloud, squeezes part of the cloud until gravity wins. Collapse begins.", scienceDetail: "Collapse starts when a clump is too massive for its own pressure to hold it up. That limit is called the Jeans mass, and it is smaller in colder, denser gas, so compressing a cloud makes collapse easier and breaks it into many collapsing cores.", color: "#e53935" },
  { id: "collapse", label: "The core collapses", short: "Collapse", timecode: "The first 100,000 years", description: "The core falls inward and spins faster, flattening into a disc. Heat builds at the centre.", scienceDetail: "Collapse takes around 100,000 years. As the gas becomes too dense for heat to escape, the centre warms and pressure briefly halts the fall, forming a protostar that keeps growing from the disc around it.", color: "#ff9f43" },
  { id: "jets", label: "Jets", short: "Jets", timecode: "100,000 to 500,000 years", description: "Jets of gas shoot out from both poles, stretching for light years, while the disc feeds material inward.", scienceDetail: "Magnetic fields threading the disc fling gas out along the spin axis at 100 to 1,000 km per second. The jets carry away spin, which lets more material fall onto the young star.", color: "#60a5fa" },
  { id: "ttauri", label: "A young star", short: "Young star", timecode: "Up to about 10 million years", description: "The young star blows away the leftover gas with strong winds. The disc thins, and planets are forming inside it.", scienceDetail: "Young Sun like stars in this stage are called T Tauri stars. They are restless and bright, with strong winds and flares. Their discs usually clear within about 10 million years, so planets have to form quickly.", color: "#F3DDB0" },
  { id: "mainseq", label: "A star is born", short: "Born", timecode: "About 50 million years", description: "At around 10 million degrees, hydrogen fusion takes over at the centre. The star settles into a steady life that will last billions of years.", scienceDetail: "In the Sun, four hydrogen nuclei fuse into one helium nucleus through the proton proton chain, releasing energy that keeps the star hot. The pressure of the hot gas balances gravity. A Sun like star stays like this for about 10 billion years.", color: "#F3DDB0" },
];
const FRAG = /* glsl */ `
// Dark dust blots out the stars behind it; glowing hydrogen shows faintly red.
vec3 nebula(vec2 q, float dust, out float d) {
  vec2 p = q + vec2(uTime * 0.004, 0.0);
  d = smoothstep(0.32, 0.78, fbm(p * 2.0 + 1.7)) * dust;
  float glow = smoothstep(0.3, 0.85, fbm(p * 1.3 - 3.0));
  vec3 sky = 1.2 * stars(q, 24.0) + 0.9 * stars(q * 1.8 + 4.0, 40.0) + 0.6 * stars(q * 3.3 + 9.0, 70.0);
  // A bright glowing nebula behind, so the dark cloud shows up as a silhouette against it
  vec3 back = vec3(0.55, 0.16, 0.14) * glow + vec3(0.18, 0.22, 0.42) * smoothstep(0.45, 0.95, fbm(p * 2.6 + 8.0));
  vec3 c = (sky + back * 0.95) * (1.0 - 0.96 * d);
  c += vec3(0.16, 0.11, 0.08) * d * smoothstep(0.4, 0.9, fbm(p * 6.0)) * 0.35;
  return c;
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float r = length(q);
  float T = uTime;
  vec3 col = vec3(0.0);
  float d;

  // 0. A cold, dark cloud
  float w = ph(0.0);
  if (w > 0.001) col += nebula(q, 1.0, d) * w;

  // 1. A shockwave sweeps through and squeezes the cloud
  w = ph(1.0);
  if (w > 0.001) {
    float t = lp(1.0);
    float front = mix(-1.0, 0.35, t) + 0.6 * q.y * q.y;
    float behind = smoothstep(0.02, -0.25, q.x - front);
    vec3 c = nebula(q * (1.0 + 0.15 * behind), 1.0 + 0.5 * behind, d);
    float band = exp(-pow((q.x - front) / 0.018, 2.0));
    float fil = 0.5 + 0.7 * fbm(vec2(q.y * 9.0, T * 0.4));
    c += mix(vec3(1.0, 0.55, 0.3), vec3(0.6, 0.75, 1.0), 0.4) * band * fil * 1.4;
    c += vec3(0.5, 0.25, 0.18) * behind * d * 0.35;
    col += c * w;
  }

  // 2. The densest knot collapses, spinning faster as it shrinks
  w = ph(2.0);
  if (w > 0.001) {
    float t = lp(2.0);
    float a = atan(q.y, q.x);
    float sw = a + (1.5 + 2.5 * t) / (r * 6.0 + 0.4) + T * 0.15;
    float rr = r * (1.0 + 1.6 * t);
    float dens = fbm(vec2(cos(sw), sin(sw)) * 1.8 + vec2(rr * 5.0, 0.0)) * smoothstep(0.95, 0.05, rr);
    vec3 c = nebula(q, 1.0, d) * (1.0 - dens * 0.8);
    c += vec3(0.42, 0.22, 0.14) * dens * dens * 1.2;
    float core = exp(-r * mix(22.0, 13.0, t));
    c += mix(vec3(0.6, 0.12, 0.05), vec3(1.0, 0.55, 0.25), t) * core * (0.4 + 1.6 * t);
    col += c * w;
  }

  // 3. A disc forms, seen edge on, and jets blast out from the poles
  w = ph(3.0);
  if (w > 0.001) {
    float t = lp(3.0);
    vec3 c = nebula(q, 0.7, d) * 0.7;
    // Light from the young star lights up the gas above and below the disc
    c += vec3(0.45, 0.55, 0.85) * exp(-r * 5.5) * smoothstep(0.0, 0.12, abs(q.y)) * 0.55;
    c += vec3(1.0, 0.75, 0.45) * exp(-r * 30.0) * 1.4;
    float thick = 0.028 + 0.035 * smoothstep(0.0, 0.45, abs(q.x));
    float lane = exp(-pow(q.y / thick, 2.0)) * smoothstep(0.5, 0.3, abs(q.x));
    c *= 1.0 - 0.92 * lane;
    c += vec3(0.25, 0.12, 0.08) * lane * smoothstep(0.0, 0.03, abs(q.y)) * 0.25;
    float len = mix(0.15, 0.48, smoothstep(0.0, 0.8, t));
    float ay = abs(q.y);
    float jet = exp(-pow(q.x / (0.004 + 0.03 * ay), 2.0)) * smoothstep(0.03, 0.09, ay) * smoothstep(len, len - 0.05, ay);
    float knots = 0.55 + 0.45 * sin(ay * 70.0 - T * 5.0);
    c += vec3(0.72, 0.82, 1.0) * jet * knots * 1.5;
    vec2 tip = vec2(0.0, len * sign(q.y + 1e-4));
    c += vec3(1.0, 0.45, 0.3) * exp(-dot(q - tip, q - tip) / 0.0012) * 0.9;
    col += c * w;
  }

  // 4. The young star clears its disc; rings and gaps show where planets are forming
  w = ph(4.0);
  if (w > 0.001) {
    float t = lp(4.0);
    vec3 c = nebula(q, mix(0.6, 0.3, t), d) * 0.8;
    vec2 e = vec2(q.x, q.y / 0.55);
    float re = length(e);
    float disc = smoothstep(0.36, 0.0, re) * smoothstep(0.012, 0.03, re);
    float gaps = (1.0 - exp(-pow((re - 0.085) / 0.006, 2.0))) * (1.0 - exp(-pow((re - 0.14) / 0.007, 2.0)))
               * (1.0 - exp(-pow((re - 0.2) / 0.008, 2.0))) * (1.0 - 0.8 * exp(-pow((re - 0.27) / 0.01, 2.0)));
    float rings = 0.75 + 0.25 * cos(re * 140.0);
    c += vec3(1.0, 0.62, 0.32) * disc * gaps * rings * 1.1 * (0.8 + 0.2 * fbm(e * 30.0));
    c += vec3(1.0, 0.86, 0.6) * (exp(-r * 45.0) * 2.2 + exp(-r * 9.0) * 0.25);
    // Wind blowing the leftover gas away
    c += vec3(0.4, 0.45, 0.6) * 0.06 * fbm(vec2(atan(q.y, q.x) * 4.0, r * 8.0 - T * 0.8)) * smoothstep(0.1, 0.5, r) * (1.0 - t);
    col += c * w;
  }

  // 5. A star is born: fusion has switched on, and the sky around it is clear
  w = ph(5.0);
  if (w > 0.001) {
    float t = lp(5.0);
    vec3 c = stars(q, 24.0) + 0.6 * stars(q * 1.8 + 4.0, 40.0);
    float R = 0.055;
    float n = fbm(q * 90.0 + T * 0.4);
    float limb = sqrt(max(0.0, 1.0 - r * r / (R * R)));
    vec3 star = mix(vec3(1.0, 0.86, 0.6), vec3(1.0, 0.98, 0.92), 0.4 + 0.4 * n) * (0.55 + 0.75 * limb) * 2.0;
    c = mix(c, star, smoothstep(R, R * 0.96, r));
    c += vec3(1.0, 0.9, 0.7) * (exp(-(r - R) * 18.0) * 0.35 + exp(-(r - R) * 5.0) * 0.08) * step(R, r);
    vec2 e = vec2(q.x, q.y / 0.35);
    c += vec3(0.6, 0.5, 0.4) * 0.12 * exp(-pow((length(e) - 0.32) / 0.02, 2.0)) * (1.0 - 0.5 * t);
    col += c * w;
  }

  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

export default function StarBirthSim() {
  return (
    <ShaderSim
      title="Birth of a star"
      phases={PHASES}
      fragment={FRAG}
      closing="Every star in the night sky was born this way. So was ours."
    />
  );
}
