import type { ExoplanetData } from "./types";

// Deterministic pseudo-random from a string seed
function seedRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
}

interface PlanetColors {
  core: string;
  mid: string;
  edge: string;
  atmos: string;
  atmosAlpha: number;
  hasBands: boolean;
  bandColors: string[];
  hasRings: boolean;
  isIcy: boolean;
}

function getPlanetColors(planet: ExoplanetData, rng: () => number): PlanetColors {
  const { planetType, temp, inHabitableZone } = planet;

  switch (planetType) {
    case "hot-jupiter": {
      const t = Math.min(1, ((temp ?? 1500) - 800) / 1500);
      return {
        core: "#ffffff",
        mid: t > 0.7 ? "#ff8844" : "#cc4400",
        edge: "#661100",
        atmos: "#ff6600",
        atmosAlpha: 0.4,
        hasBands: true,
        bandColors: ["#ff9944", "#cc3300", "#ff6622", "#993300"],
        hasRings: false,
        isIcy: false,
      };
    }
    case "gas-giant": {
      const hot = (temp ?? 500) > 600;
      return {
        core: hot ? "#ffe0a0" : "#d4d8e8",
        mid: hot ? "#cc7700" : "#8899bb",
        edge: hot ? "#662200" : "#334466",
        atmos: hot ? "#ff9900" : "#6688aa",
        atmosAlpha: 0.25,
        hasBands: true,
        bandColors: hot
          ? ["#cc6600", "#ffaa44", "#884400", "#ffcc88"]
          : ["#8899bb", "#aabbcc", "#667788", "#99aabb"],
        hasRings: rng() > 0.6,
        isIcy: !hot,
      };
    }
    case "neptune-like": {
      return {
        core: "#aaeeff",
        mid: "#2255cc",
        edge: "#001144",
        atmos: "#44aaff",
        atmosAlpha: 0.3,
        hasBands: true,
        bandColors: ["#3366cc", "#2244aa", "#5588ee", "#1133aa"],
        hasRings: rng() > 0.5,
        isIcy: true,
      };
    }
    case "mini-neptune": {
      return {
        core: "#ccffee",
        mid: "#2288aa",
        edge: "#003344",
        atmos: "#22aacc",
        atmosAlpha: 0.3,
        hasBands: true,
        bandColors: ["#336699", "#44aacc", "#224455", "#55bbdd"],
        hasRings: false,
        isIcy: false,
      };
    }
    case "super-earth": {
      if (inHabitableZone) {
        return {
          core: "#88ddff",
          mid: "#2255aa",
          edge: "#112244",
          atmos: "#4499ff",
          atmosAlpha: 0.35,
          hasBands: false,
          bandColors: [],
          hasRings: false,
          isIcy: false,
        };
      }
      const t = temp ?? 400;
      if (t > 700) {
        return { core: "#ffee88", mid: "#cc4400", edge: "#440000", atmos: "#ff6600", atmosAlpha: 0.35, hasBands: false, bandColors: [], hasRings: false, isIcy: false };
      }
      return { core: "#ddbbaa", mid: "#774433", edge: "#332211", atmos: "#aa7755", atmosAlpha: 0.2, hasBands: false, bandColors: [], hasRings: false, isIcy: false };
    }
    case "earth-sized": {
      if (inHabitableZone) {
        return { core: "#aadeee", mid: "#1166aa", edge: "#002244", atmos: "#44aaff", atmosAlpha: 0.4, hasBands: false, bandColors: [], hasRings: false, isIcy: false };
      }
      const t = temp ?? 300;
      if (t > 500) {
        return { core: "#ffcc66", mid: "#aa3300", edge: "#330000", atmos: "#ff8800", atmosAlpha: 0.3, hasBands: false, bandColors: [], hasRings: false, isIcy: false };
      }
      return { core: "#eef4ff", mid: "#aabbdd", edge: "#334455", atmos: "#aaccff", atmosAlpha: 0.3, hasBands: false, bandColors: [], hasRings: false, isIcy: true };
    }
    default: {
      const col = ["#667788", "#446655", "#556644"][Math.floor(rng() * 3)];
      return { core: col, mid: "#334455", edge: "#111122", atmos: "#556677", atmosAlpha: 0.2, hasBands: false, bandColors: [], hasRings: false, isIcy: false };
    }
  }
}

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  planet: ExoplanetData
): void {
  if (r < 2) return;
  const rng = seedRng(planet.id);
  const colors = getPlanetColors(planet, rng);

  ctx.save();

  // Rings (behind planet)
  if (colors.hasRings && r > 12) {
    const rw = r * (1.8 + rng() * 0.6);
    const rh = r * 0.18;
    const ringGrad = ctx.createLinearGradient(cx - rw, cy, cx + rw, cy);
    ringGrad.addColorStop(0, "rgba(200,180,140,0)");
    ringGrad.addColorStop(0.25, `rgba(200,180,140,0.35)`);
    ringGrad.addColorStop(0.45, `rgba(210,190,150,0.5)`);
    ringGrad.addColorStop(0.55, `rgba(210,190,150,0.5)`);
    ringGrad.addColorStop(0.75, `rgba(200,180,140,0.35)`);
    ringGrad.addColorStop(1, "rgba(200,180,140,0)");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atmosphere glow
  if (colors.atmosAlpha > 0 && r > 6) {
    const ag = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.35);
    ag.addColorStop(0, `rgba(${hexToRgb(colors.atmos)},${colors.atmosAlpha})`);
    ag.addColorStop(1, `rgba(${hexToRgb(colors.atmos)},0)`);
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Planet sphere
  const sg = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.32, r * 0.05, cx, cy, r);
  sg.addColorStop(0, colors.core);
  sg.addColorStop(0.55, colors.mid);
  sg.addColorStop(0.88, colors.edge);
  sg.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Cloud bands (gas/ice giants)
  if (colors.hasBands && r > 10) {
    const numBands = Math.floor(3 + rng() * 4);
    for (let i = 0; i < numBands; i++) {
      const bandY = cy - r + ((i + 0.5) / numBands) * r * 2;
      const bandH = (r * 0.22) * (0.5 + rng() * 0.8);
      const col = colors.bandColors[i % colors.bandColors.length];
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = col + "44";
      ctx.beginPath();
      ctx.ellipse(cx, bandY, r * 0.98, bandH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Storm oval for gas giants
    if ((planet.planetType === "gas-giant" || planet.planetType === "hot-jupiter") && r > 20) {
      const sx = cx + (rng() - 0.5) * r * 0.6;
      const sy = cy + (rng() - 0.5) * r * 0.4;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(160,60,30,0.35)";
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.18, r * 0.12, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Rocky surface features (earth-sized / super-earth)
  if (!colors.hasBands && r > 14) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    // Continent-like patches
    if (planet.inHabitableZone || planet.planetType === "earth-sized") {
      ctx.fillStyle = "rgba(46,120,50,0.5)";
      for (let i = 0; i < 4; i++) {
        const px = cx + (rng() - 0.5) * r * 1.4;
        const py = cy + (rng() - 0.5) * r * 1.4;
        ctx.beginPath();
        ctx.ellipse(px, py, r * (0.2 + rng() * 0.25), r * (0.1 + rng() * 0.2), rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Ice patches
    if (colors.isIcy) {
      ctx.fillStyle = "rgba(230,240,255,0.4)";
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.75, r * 0.45, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.75, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud wisps
    if (planet.inHabitableZone && r > 18) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      for (let i = 0; i < 3; i++) {
        const px = cx + (rng() - 0.5) * r;
        const py = cy + (rng() - 0.5) * r * 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py, r * (0.18 + rng() * 0.15), r * 0.06, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Day/night terminator shadow
  const shadow = ctx.createRadialGradient(cx + r * 0.3, cy, 0, cx + r * 0.3, cy, r * 1.4);
  shadow.addColorStop(0, "rgba(0,0,0,0)");
  shadow.addColorStop(0.55, "rgba(0,0,0,0)");
  shadow.addColorStop(0.75, "rgba(0,0,0,0.5)");
  shadow.addColorStop(1, "rgba(0,0,0,0.75)");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // Specular highlight
  const hl = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.38, 0, cx - r * 0.38, cy - r * 0.38, r * 0.7);
  hl.addColorStop(0, "rgba(255,255,255,0.18)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = hl;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.restore();
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "128,128,128";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
