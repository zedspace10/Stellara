import ShaderSim from "./ShaderSim";
import type { SimPhase } from "./SimulationLayout";

const PHASES: SimPhase[] = [
  { id: "collapse", label: "Core collapse", short: "Collapse", timecode: "The first second", description: "The iron core of a massive star collapses. If enough mass falls in, nothing can stop it, and a black hole is born.", scienceDetail: "When the core passes about 1.4 times the Sun's mass, it collapses to the density of an atomic nucleus. If what is left is heavier than about 2 to 3 times the Sun's mass, even neutron pressure cannot hold it up, and it becomes a black hole.", color: "#A995FF" },
  { id: "singularity", label: "The event horizon", short: "Horizon", timecode: "Milliseconds later", description: "The event horizon forms: the boundary beyond which not even light can escape. At the centre, general relativity predicts a point of infinite density.", scienceDetail: "The horizon's radius is 2GM/c², about 30 km for a black hole ten times the Sun's mass. Most physicists expect a theory of quantum gravity to replace the infinite density at the centre with something finite.", color: "#4a0080" },
  { id: "accretion", label: "Accretion disc", short: "Disc", timecode: "Later", description: "Gas pulled from a companion star spirals inward and forms a disc. Friction heats its inner edge to millions of degrees, glowing in X rays.", scienceDetail: "Gas can orbit stably only down to three times the horizon's radius. Inside that it plunges in. The inner disc of a black hole a few times the Sun's mass reaches around 10 million degrees.", color: "#ff6b35" },
  { id: "lensing", label: "Bent light", short: "Lensing", timecode: "Near the black hole", description: "Gravity bends light around the black hole. Stars behind it appear stretched and doubled, and can form rings.", scienceDetail: "At one and a half times the horizon's radius is the photon sphere, where light can travel in circles, though only unstably. When a background star, the black hole and the viewer line up exactly, the star appears as a ring, called an Einstein ring.", color: "#A9C3E0" },
  { id: "merger", label: "Black holes merge", short: "Merger", timecode: "When two meet", description: "Two black holes spiral together, sending out gravitational waves that stretch and squeeze space itself.", scienceDetail: "The first merger was detected by LIGO on 14 September 2015. Black holes of about 36 and 29 times the Sun's mass, 1.3 billion light years away, merged and turned three Suns' worth of mass into gravitational waves in a fraction of a second.", color: "#a78bfa" },
];
// Drawn entirely on the graphics card. Light from the stars behind is bent by each black hole's
// gravity using the lens equation for a point mass, which is what makes the rings and double images.
const FRAG = /* glsl */ `
vec3 sky(vec2 p) {
  vec3 neb = vec3(0.07, 0.09, 0.18) * smoothstep(0.35, 0.95, fbm(p * 1.4 + vec2(3.0, 1.0)))
           + vec3(0.13, 0.06, 0.05) * smoothstep(0.5, 1.0, fbm(p * 2.2 - vec2(7.0, 2.0)));
  return stars(p + vec2(uTime * 0.002, 0.0), 26.0) + 0.7 * stars(p * 1.7 + 3.0, 42.0)
    + 0.45 * stars(p * 3.1 + 7.0, 70.0) + neb;
}
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
// Where a ray seen at q came from, bent by a lens at c with Einstein radius e.
vec2 bend(vec2 q, vec2 c, float e) { vec2 d = q - c; return q - e * e * d / max(dot(d, d), 1e-5); }
vec3 heat(float x) {
  return mix(vec3(1.0, 0.96, 0.88), mix(vec3(1.0, 0.62, 0.25), vec3(0.75, 0.18, 0.06), smoothstep(0.5, 1.0, x)), smoothstep(0.0, 0.55, x));
}
float discBand(vec2 p, float k, float rin, float rout, out float dop, out float x) {
  vec2 e = vec2(p.x, p.y / k);
  float re = length(e);
  float ang = atan(e.y, e.x);
  float streak = 0.5 + 0.5 * fbm(vec2(ang * 3.0 - uTime * 0.9 / (re * 3.0 + 0.15), re * 22.0));
  dop = 1.0 - 0.7 * e.x / max(re, 1e-3);
  x = smoothstep(rin, rout, re);
  return smoothstep(rin, rin * 1.06, re) * pow(1.0 - x, 1.3) * streak;
}

void main() {
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float r = length(q);
  vec3 col = vec3(0.0);

  // 0. A giant star's core gives way
  float w = ph(0.0);
  if (w > 0.001) {
    float t = lp(0.0);
    vec3 c = sky(q) * 0.8;
    float R = mix(0.24, 0.0, smoothstep(0.2, 0.6, t));
    if (R > 0.002) {
      float n = fbm(q * 9.0 / R + uTime * 0.25);
      float limb = sqrt(max(0.0, 1.0 - (r * r) / (R * R)));
      vec3 sc = mix(vec3(0.55, 0.68, 1.0), vec3(1.0, 0.98, 0.95), 0.35 + 0.5 * n) * (0.4 + 0.9 * limb) * 1.5;
      c = mix(c, sc, smoothstep(R, R * 0.97, r));
      c += vec3(0.45, 0.6, 1.0) * 0.35 * exp(-max(r - R, 0.0) * 10.0 / max(R, 0.05));
    }
    float flash = smoothstep(0.56, 0.6, t) * (1.0 - smoothstep(0.6, 0.85, t));
    c += vec3(1.0, 0.92, 0.85) * flash * 3.0 * exp(-r * 4.0);
    float sh = (t - 0.58) * 1.5;
    if (sh > 0.0) {
      float fil = 0.5 + 0.8 * fbm(vec2(atan(q.y, q.x) * 5.0, r * 9.0));
      c += vec3(1.0, 0.55, 0.28) * exp(-pow((r - sh) / 0.03, 2.0)) * fil * 1.6 * (1.0 - smoothstep(0.75, 1.0, t));
      c += vec3(0.5, 0.65, 1.0) * 0.18 * exp(-pow((r - sh * 0.8) / 0.09, 2.0)) * (1.0 - t);
    }
    c *= 1.0 - smoothstep(0.62, 0.85, t) * smoothstep(0.04, 0.03, r);
    col += c * w;
  }

  // 1. The event horizon: a black disc, with starlight bent around it
  w = ph(1.0);
  if (w > 0.001) {
    float sh = 0.12;
    vec3 c = sky(bend(q, vec2(0.0), 0.2));
    c *= smoothstep(sh * 0.985, sh * 1.015, r);
    c += vec3(0.95, 0.9, 1.0) * 0.35 * exp(-pow((r - sh * 1.03) / 0.006, 2.0));
    col += c * w;
  }

  // 2. A disc of hot gas, fed by a companion star
  w = ph(2.0);
  if (w > 0.001) {
    float t = lp(2.0);
    float grow = smoothstep(0.0, 0.5, t);
    float sh = 0.12, k = 0.17, rin = 0.19, rout = mix(0.25, 0.62, grow);
    vec3 c = sky(bend(q, vec2(0.0), 0.22)) * 0.6;
    // Light from the far side of the disc, bent up over the top of the black hole and under it
    float halo = smoothstep(sh, sh * 1.07, r) * (1.0 - smoothstep(sh * 1.12, sh * 1.8, r));
    float hn = 0.55 + 0.45 * fbm(vec2(atan(q.y, q.x) * 4.0 + uTime * 0.6, r * 24.0));
    c += heat(0.25) * halo * (0.5 + 0.5 * q.y / max(r, 1e-3)) * hn * 1.4 * grow;
    c *= smoothstep(sh * 0.97, sh, r);
    float dop, x;
    float d = discBand(q, k, rin, rout, dop, x);
    if (q.y > 0.0 && r < sh * 1.02) d = 0.0;
    c += heat(x) * d * dop * 1.9 * grow;
    // The companion star and the stream of gas it loses
    vec2 cs = vec2(0.78, 0.26);
    float cr = length(q - cs);
    c += mix(vec3(0.6, 0.72, 1.0), vec3(1.0), smoothstep(0.06, 0.0, cr)) * smoothstep(0.065, 0.055, cr) * 1.2;
    c += vec3(0.5, 0.62, 1.0) * 0.25 * exp(-cr * 12.0);
    float best = 1.0;
    vec2 prev = cs;
    for (int i = 1; i <= 24; i++) {
      float s = float(i) / 24.0;
      vec2 a = mix(cs, vec2(0.42, 0.2), s);
      vec2 b = mix(vec2(0.42, 0.2), vec2(-0.05, rout * k), s);
      vec2 pt = mix(a, b, s);
      best = min(best, seg(q, prev, pt));
      prev = pt;
    }
    c += vec3(1.0, 0.72, 0.48) * exp(-best * 110.0) * 0.55 * smoothstep(0.1, 0.4, t);
    col += c * w;
  }

  // 3. Bent light: a galaxy far behind lines up, and becomes a ring
  w = ph(3.0);
  if (w > 0.001) {
    float t = lp(3.0);
    float sh = 0.12, e = 0.24;
    vec2 b = bend(q, vec2(0.0), e);
    vec3 c = sky(b);
    vec2 s = vec2(mix(-0.5, 0.5, smoothstep(0.0, 1.0, t)), 0.015);
    float g = exp(-dot(b - s, b - s) / 0.0016);
    float core = exp(-dot(b - s, b - s) / 0.0003);
    c += vec3(0.85, 0.8, 1.0) * g * 1.4 + vec3(1.0, 0.9, 0.75) * core * 1.2;
    c *= smoothstep(sh * 0.985, sh * 1.015, r);
    col += c * w;
  }

  // 4. Two black holes spiral together, and the waves they send out
  w = ph(4.0);
  if (w > 0.001) {
    float t = lp(4.0);
    float tm = 0.7;
    float u = clamp(1.0 - t / tm, 0.0, 1.0);
    float sep = 0.34 * pow(u, 0.25);
    float phi = 26.0 * (1.0 - pow(u, 0.62));
    float amp = t < tm ? 0.014 * pow(t / tm, 3.0) : 0.014 * exp(-(t - tm) * 18.0);
    float wphase = 2.0 * phi + (t > tm ? (t - tm) * 140.0 : 0.0);
    // Space itself stretches and squeezes as the waves pass
    vec2 qq = q + (r > 1e-3 ? q / r : vec2(0.0)) * amp * sin(r * 38.0 - wphase);
    vec3 c;
    float sh;
    if (t < tm) {
      vec2 c1 = 0.5 * sep * vec2(cos(phi), sin(phi));
      vec2 c2 = -c1;
      vec2 b = bend(bend(qq, c1, 0.13), c2, 0.13);
      c = sky(b);
      sh = 0.075;
      float d1 = length(q - c1), d2 = length(q - c2);
      c *= smoothstep(sh * 0.97, sh * 1.03, d1) * smoothstep(sh * 0.97, sh * 1.03, d2);
      c += vec3(0.95, 0.9, 1.0) * 0.4 * (exp(-pow((d1 - sh * 1.05) / 0.004, 2.0)) + exp(-pow((d2 - sh * 1.05) / 0.004, 2.0)));
    } else {
      vec2 b = bend(qq, vec2(0.0), 0.19);
      c = sky(b);
      sh = 0.1 * (1.0 + 0.04 * exp(-(t - tm) * 10.0) * sin((t - tm) * 90.0));
      c *= smoothstep(sh * 0.97, sh * 1.03, r);
      c += vec3(0.95, 0.9, 1.0) * 0.4 * exp(-pow((r - sh * 1.05) / 0.005, 2.0));
    }
    // A faint grid, so the ripples in space can be seen
    vec2 gq = qq * 9.0;
    vec2 gd = abs(fract(gq) - 0.5);
    c += vec3(0.45, 0.55, 0.75) * 0.06 * smoothstep(0.47, 0.5, max(gd.x, gd.y));
    // The signal a detector on Earth would record: the chirp
    float aspect = uRes.x / uRes.y;
    float x0 = -0.45 * aspect, x1 = 0.45 * aspect;
    float s = (q.x - x0) / (x1 - x0);
    if (s > 0.0 && s < 1.0 && s <= t) {
      float uu = clamp(1.0 - s / tm, 0.0, 1.0);
      float ps = 2.0 * 26.0 * (1.0 - pow(uu, 0.62)) + (s > tm ? (s - tm) * 140.0 : 0.0);
      float as = s < tm ? pow(s / tm, 3.0) : exp(-(s - tm) * 18.0);
      float hy = -0.4 + 0.045 * as * sin(ps * 2.0);
      c += vec3(0.66, 0.76, 0.88) * smoothstep(0.004, 0.0, abs(q.y - hy)) * 0.9;
    }
    col += c * w;
  }

  gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

export default function BlackHoleSim() {
  return (
    <ShaderSim
      title="Black holes"
      phases={PHASES}
      fragment={FRAG}
      closing="We first heard two black holes collide in 2015. The waves had been travelling for 1.3 billion years."
    />
  );
}
