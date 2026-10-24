import { useCallback, useEffect, useRef, useState } from "react";
import { heliocentric } from "@/lib/ephemeris";
import {
  THINGS, Z_MIN, Z_MAX, Z_START, focusAt, niceLength, lengthLabel, pow10Label,
  AU, LY, EARTH_R, EARTH_C, SUN_C, MOON_C, GC, ANDROMEDA_C, GREAT_ATTRACTOR, MICRO_C,
} from "@/lib/scaleWorld";

// ── Seeded randomness, so the drawings are the same every visit ─────────────
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ── Pictures drawn once and reused at any size ─────────────────────────────────
function offscreen(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  return c;
}

function drawSpiral(c: CanvasRenderingContext2D, s: number, seed: number, arms: number, warm: string, cool: string, bar: boolean) {
  const r = rng(seed);
  const h = s / 2;
  c.globalCompositeOperation = "lighter";
  const core = c.createRadialGradient(h, h, 0, h, h, h * 0.32);
  core.addColorStop(0, `rgba(${warm},0.9)`);
  core.addColorStop(0.4, `rgba(${warm},0.28)`);
  core.addColorStop(1, `rgba(${warm},0)`);
  c.fillStyle = core;
  c.fillRect(0, 0, s, s);
  if (bar) {
    c.save();
    c.translate(h, h);
    c.rotate(0.45);
    for (let i = 0; i < 2600; i++) {
      const x = (r() - 0.5) * s * 0.3;
      const y = (r() - 0.5) * s * 0.06 * (1 - Math.abs(x) / (s * 0.15));
      c.fillStyle = `rgba(${warm},0.12)`;
      c.fillRect(x, y, 2, 2);
    }
    c.restore();
  }
  for (let i = 0; i < 26000; i++) {
    const arm = i % arms;
    const t = r() * 3.6;
    const rad = s * 0.07 * Math.exp(0.36 * t) * (0.86 + r() * 0.28);
    if (rad > h * 0.97) continue;
    const a = t + (arm * Math.PI * 2) / arms + (r() - 0.5) * 0.55 + 0.45;
    const x = h + Math.cos(a) * rad;
    const y = h + Math.sin(a) * rad;
    const inner = rad < h * 0.3;
    c.fillStyle = inner ? `rgba(${warm},0.07)` : `rgba(${cool},0.08)`;
    c.fillRect(x, y, 1.6, 1.6);
  }
  // A thin haze of old stars across the whole disc
  for (let i = 0; i < 9000; i++) {
    const rad = Math.pow(r(), 1.6) * h * 0.95;
    const a = r() * Math.PI * 2;
    c.fillStyle = `rgba(${warm},0.03)`;
    c.fillRect(h + Math.cos(a) * rad, h + Math.sin(a) * rad, 1.4, 1.4);
  }
}

function makeUniverse() {
  return offscreen(1400, (c, s) => {
    const r = rng(7);
    const h = s / 2;
    c.save();
    c.beginPath();
    c.arc(h, h, h * 0.985, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = "#04050A";
    c.fillRect(0, 0, s, s);
    // Nodes of the cosmic web, joined by thin filaments of galaxies
    const nodes: [number, number][] = [];
    for (let i = 0; i < 190; i++) nodes.push([r() * s, r() * s]);
    // A faint sprinkle of galaxies everywhere
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = "rgba(200,210,230,0.08)";
      c.fillRect(r() * s, r() * s, 1, 1);
    }
    c.globalCompositeOperation = "lighter";
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1]) })).filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 3);
      near.forEach(({ j }) => {
        const b = nodes[j];
        const bend = (r() - 0.5) * 0.5;
        for (let k = 0; k < 420; k++) {
          const t = r();
          const sw = Math.sin(t * Math.PI) * bend;
          const spread = (r() + r() + r() - 1.5) * 9;
          const x = a[0] + (b[0] - a[0]) * t - (b[1] - a[1]) * sw + spread;
          const y = a[1] + (b[1] - a[1]) * t + (b[0] - a[0]) * sw + (r() + r() + r() - 1.5) * 9;
          c.fillStyle = "rgba(190,205,235,0.07)";
          c.fillRect(x, y, 1.4, 1.4);
        }
      });
      const g = c.createRadialGradient(a[0], a[1], 0, a[0], a[1], 16);
      g.addColorStop(0, "rgba(235,225,205,0.16)");
      g.addColorStop(1, "rgba(235,225,205,0)");
      c.fillStyle = g;
      c.fillRect(a[0] - 16, a[1] - 16, 32, 32);
    });
    c.restore();
    // The edge: light from the young universe, the cosmic microwave background
    c.globalCompositeOperation = "lighter";
    const edge = c.createRadialGradient(h, h, h * 0.9, h, h, h);
    edge.addColorStop(0, "rgba(230,140,90,0)");
    edge.addColorStop(0.85, "rgba(230,140,90,0.28)");
    edge.addColorStop(1, "rgba(230,140,90,0)");
    c.fillStyle = edge;
    c.fillRect(0, 0, s, s);
  });
}

function makeLaniakea() {
  return offscreen(1200, (c, s) => {
    const r = rng(11);
    const h = s / 2;
    c.globalCompositeOperation = "lighter";
    // Galaxies drift along streams that all lead towards one region
    for (let k = 0; k < 160; k++) {
      let a = r() * Math.PI * 2;
      let rad = h * (0.55 + r() * 0.42);
      const curl = (r() - 0.5) * 4;
      for (let i = 0; i < 70; i++) {
        const x = h + Math.cos(a) * rad;
        const y = h + Math.sin(a) * rad;
        c.fillStyle = `rgba(200,212,235,${0.05 + 0.25 * (1 - rad / h)})`;
        c.fillRect(x + (r() - 0.5) * 6, y + (r() - 0.5) * 6, 1.5, 1.5);
        rad *= 0.965;
        a += curl * 0.02;
      }
    }
    const g = c.createRadialGradient(h, h, 0, h, h, h * 0.18);
    g.addColorStop(0, "rgba(240,225,200,0.35)");
    g.addColorStop(1, "rgba(240,225,200,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
  });
}

function makeSkinField() {
  // A patch of skin cells, each about 30 micrometres across, around the point we zoom into.
  const r = rng(3);
  const cells: { x: number; y: number; rad: number; tone: number }[] = [];
  const step = 3e-5;
  for (let i = -26; i <= 26; i++) {
    for (let j = -26; j <= 26; j++) {
      if (i === 0 && j === 0) continue;
      if (i * i + j * j > 26 * 26) continue;
      cells.push({
        x: MICRO_C[0] + i * step + (j % 2 ? step / 2 : 0) + (r() - 0.5) * step * 0.25,
        y: MICRO_C[1] + j * step * 0.87 + (r() - 0.5) * step * 0.25,
        rad: step * (0.43 + r() * 0.07),
        tone: r(),
      });
    }
  }
  return cells;
}

const NEAR_STARS: { name: string; ly: number; ra: number; dec: number; col: string }[] = [
  { name: "Alpha Centauri", ly: 4.37, ra: 14.66, dec: -60.8, col: "#FFF1D6" },
  { name: "Proxima Centauri", ly: 4.24, ra: 14.5, dec: -62.7, col: "#FF9A7A" },
  { name: "Barnard's Star", ly: 5.96, ra: 17.96, dec: 4.7, col: "#FF9A7A" },
  { name: "Wolf 359", ly: 7.9, ra: 10.94, dec: 7.0, col: "#FF9A7A" },
  { name: "Lalande 21185", ly: 8.3, ra: 11.05, dec: 35.97, col: "#FFB08A" },
  { name: "Sirius", ly: 8.6, ra: 6.75, dec: -16.7, col: "#DCE8FF" },
  { name: "Epsilon Eridani", ly: 10.5, ra: 3.55, dec: -9.46, col: "#FFD9A8" },
  { name: "Procyon", ly: 11.5, ra: 7.66, dec: 5.2, col: "#FFF6E6" },
  { name: "61 Cygni", ly: 11.4, ra: 21.12, dec: 38.7, col: "#FFC59A" },
  { name: "Tau Ceti", ly: 11.9, ra: 1.73, dec: -15.9, col: "#FFEBC8" },
];

const PLANET_ROWS: { id: string; name: string; a: number; col: string }[] = [
  { id: "mercury", name: "Mercury", a: 0.387, col: "#B9B2A8" },
  { id: "venus", name: "Venus", a: 0.723, col: "#F3DDB0" },
  { id: "earth", name: "Earth", a: 1.0, col: "#8DB6E6" },
  { id: "mars", name: "Mars", a: 1.524, col: "#E08A6A" },
  { id: "jupiter", name: "Jupiter", a: 5.2, col: "#E3B98C" },
  { id: "saturn", name: "Saturn", a: 9.54, col: "#E9D9A6" },
  { id: "uranus", name: "Uranus", a: 19.2, col: "#BFE6E6" },
  { id: "neptune", name: "Neptune", a: 30.07, col: "#7FA4E8" },
];

function loadImg(src: string) {
  const i = new Image();
  i.src = `${import.meta.env.BASE_URL}textures/${src}`;
  return i;
}

export default function ScaleOfUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zRef = useRef(Z_START);
  const targetRef = useRef(Z_START);
  const [z, setZ] = useState(Z_START);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    document.title = "Scale of the universe | PALE";
  }, []);

  const zoomBy = useCallback((dz: number) => {
    targetRef.current = clamp(targetRef.current + dz, Z_MIN, Z_MAX);
    setTouched(true);
  }, []);
  const flyTo = useCallback((zt: number) => {
    targetRef.current = clamp(zt, Z_MIN, Z_MAX);
    setTouched(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const imgs = { earth: loadImg("earth.webp"), moon: loadImg("moon.webp"), sun: loadImg("sun.webp") };
    const milkyWay = offscreen(1100, (c, s) => drawSpiral(c, s, 21, 2, "255,226,185", "170,195,240", true));
    const andromeda = offscreen(900, (c, s) => drawSpiral(c, s, 33, 2, "255,232,200", "190,205,240", false));
    const triangulum = offscreen(400, (c, s) => drawSpiral(c, s, 41, 2, "240,230,215", "180,200,240", false));
    const universe = makeUniverse();
    const laniakea = makeLaniakea();
    const skin = makeSkinField();
    const r = rng(5);
    const dwarfs = Array.from({ length: 70 }, () => {
      const a = r() * Math.PI * 2;
      const d = (0.2 + r() * 4.2) * 1e6 * LY;
      const near = r() < 0.5 ? GC : ANDROMEDA_C;
      const dd = r() < 0.6 ? d * 0.12 : d;
      return [near[0] + Math.cos(a) * dd, near[1] + Math.sin(a) * dd] as [number, number];
    });
    const oort = Array.from({ length: 2600 }, () => {
      const a = r() * Math.PI * 2;
      const d = (2000 + Math.pow(r(), 0.7) * 98000) * AU;
      return [SUN_C[0] + Math.cos(a) * d, SUN_C[1] + Math.sin(a) * d] as [number, number];
    });
    const electron = Array.from({ length: 900 }, () => {
      const u = r() || 1e-6, v = r();
      const rad = Math.sqrt(-2 * Math.log(u)) * 0.38;
      return [rad * Math.cos(v * Math.PI * 2), rad * Math.sin(v * Math.PI * 2)] as [number, number];
    });
    const ridges = Array.from({ length: 60 }, (_, i) => i);
    const foam = Array.from({ length: 220 }, () => [r() - 0.5, r() - 0.5, 0.01 + r() * 0.06] as [number, number, number]);

    // Planet angles for today, measured from the direction of Earth as seen from the Sun.
    const now = Date.now();
    const earthLon = heliocentric("earth", now)?.lon ?? 0;
    const planetAngle: Record<string, number> = {};
    PLANET_ROWS.forEach((p) => { planetAngle[p.id] = (heliocentric(p.id, now)?.lon ?? 0) - earthLon; });
    // Voyager 1: RA 17h15m, Dec +12, 172 au; shown in the plane, so its distance there is about 141 au.
    const vAngle = (256.5 * Math.PI) / 180 - earthLon;
    const vDist = 141 * AU;
    const VOY: [number, number] = [SUN_C[0] + Math.cos(vAngle) * vDist, SUN_C[1] + Math.sin(vAngle) * vDist];

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const nowT = performance.now();
      const dt = Math.min(0.05, (nowT - last) / 1000);
      last = nowT;
      t += dt;
      // Glide towards the target zoom
      const diff = targetRef.current - zRef.current;
      zRef.current += diff * Math.min(1, dt * 5);
      if (Math.abs(diff) < 1e-4) zRef.current = targetRef.current;
      const zz = zRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
      ctx.lineCap = "butt";
      ctx.fillStyle = "#05070C";
      ctx.fillRect(0, 0, W, H);

      const k = W / Math.pow(10, zz); // pixels per metre
      const [fx, fy] = focusAt(zz);
      const cx = W / 2;
      const cy = H * 0.46;
      const sx = (x: number) => cx + (x - fx) * k;
      const sy = (y: number) => cy - (y - fy) * k;
      const px = (m: number) => m * k;

      // How visible something of this size is: fades in once a few pixels big, out once much bigger than the screen.
      const vis = (size: number, minPx = 3, maxF = 3) => {
        const P = size * k;
        if (P < minPx * 0.5) return 0;
        const a = clamp(Math.log10(P / (minPx * 0.5)) / Math.log10(6));
        const b = clamp(1 - Math.log10(P / (W * maxF)) / Math.log10(4));
        return Math.min(a, b);
      };
      const onScreen = (x: number, y: number, rad: number) => sx(x) + rad * k > -50 && sx(x) - rad * k < W + 50 && sy(y) + rad * k > -50 && sy(y) - rad * k < H + 50;

      const label = (text: string, x: number, y: number, alpha: number, color = "rgba(232,236,241,0.85)", dx = 8, dy = -8) => {
        if (alpha <= 0.02) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.font = "13px 'Instrument Sans', system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(text, x + dx, y + dy);
        ctx.restore();
      };
      const circle = (x: number, y: number, rad: number, stroke: string, width = 1, dash: number[] = []) => {
        ctx.beginPath();
        ctx.setLineDash(dash);
        ctx.arc(sx(x), sy(y), Math.max(0.5, px(rad)), 0, Math.PI * 2);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.setLineDash([]);
      };
      const dot = (x: number, y: number, rpx: number, color: string, glow = 0) => {
        const X = sx(x), Y = sy(y);
        if (glow) {
          const g = ctx.createRadialGradient(X, Y, 0, X, Y, glow);
          g.addColorStop(0, color);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.globalAlpha *= 0.35;
          ctx.fillRect(X - glow, Y - glow, glow * 2, glow * 2);
          ctx.globalAlpha /= 0.35;
        }
        ctx.beginPath();
        ctx.arc(X, Y, rpx, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      };
      const image = (img: HTMLImageElement | HTMLCanvasElement, x: number, y: number, diameter: number, alpha: number, rot = 0, squash = 1) => {
        if (alpha <= 0.01) return;
        const d = px(diameter);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(sx(x), sy(y));
        ctx.rotate(rot);
        ctx.scale(1, squash);
        ctx.drawImage(img, -d / 2, -d / 2, d, d);
        ctx.restore();
      };
      const sphere = (img: HTMLImageElement, x: number, y: number, rad: number, alpha: number, lightAngle: number | null) => {
        if (alpha <= 0.01 || !img.complete) return;
        const X = sx(x), Y = sy(y), R = Math.max(1.5, px(rad));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(X, Y, R, 0, Math.PI * 2);
        ctx.clip();
        // The map is twice as wide as it is tall; show the half facing us.
        ctx.drawImage(img, 0, 0, img.naturalWidth / 2, img.naturalHeight, X - R, Y - R, R * 2, R * 2);
        if (lightAngle !== null) {
          const lx = X + Math.cos(lightAngle) * R * 0.9, ly = Y - Math.sin(lightAngle) * R * 0.9;
          const g = ctx.createRadialGradient(lx, ly, R * 0.2, X - Math.cos(lightAngle) * R * 0.2, Y + Math.sin(lightAngle) * R * 0.2, R * 1.6);
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(0.55, "rgba(0,0,0,0.25)");
          g.addColorStop(1, "rgba(0,0,0,0.92)");
          ctx.fillStyle = g;
          ctx.fillRect(X - R, Y - R, R * 2, R * 2);
        }
        ctx.restore();
      };

      // ── The cosmic scales, largest first ───────────────────────────────────
      let a = vis(8.8e26, 4, 2.2);
      if (a > 0) {
        image(universe, 0, 0, 8.8e26, a);
        label("The edge of what we can see", sx(0) + px(4.4e26) * 0.7, sy(0) - px(4.4e26) * 0.7, a, "rgba(230,170,130,0.9)");
        dot(0, 0, 2.5, "rgba(198,220,245,1)");
        label("You are here", sx(0), sy(0), a * clamp((zz - 25.3) * 2));
      }
      a = vis(4.9e24, 4, 2.5);
      if (a > 0) {
        image(laniakea, GREAT_ATTRACTOR[0], GREAT_ATTRACTOR[1], 4.9e24, a);
        dot(GC[0], GC[1], 2.5, "rgba(198,220,245,1)");
        label("The Milky Way", sx(GC[0]), sy(GC[1]), a * clamp((25.2 - zz) * 2) * clamp((zz - 23.5) * 2));
        label("Great Attractor", sx(GREAT_ATTRACTOR[0]), sy(GREAT_ATTRACTOR[1]), a * clamp((zz - 23.6) * 2) * clamp((25.6 - zz) * 2), "rgba(240,225,200,0.8)");
      }
      a = vis(9.5e22, 4, 2.5);
      if (a > 0) {
        ctx.globalAlpha = a;
        dwarfs.forEach(([x, y]) => { if (onScreen(x, y, 0)) dot(x, y, 1.2, "rgba(220,225,235,0.6)"); });
        ctx.globalAlpha = 1;
        dot(ANDROMEDA_C[0], ANDROMEDA_C[1], 1.8, `rgba(255,236,210,${a})`, 12);
        dot(GC[0], GC[1], 1.8, `rgba(255,236,210,${a})`, 10);
        image(andromeda, ANDROMEDA_C[0], ANDROMEDA_C[1], 2.2e21, a, -0.5, 0.32);
        const tri: [number, number] = [ANDROMEDA_C[0] + 0.75e6 * LY * Math.cos(-1.1), ANDROMEDA_C[1] + 0.75e6 * LY * Math.sin(-1.1)];
        image(triangulum, tri[0], tri[1], 6e20, a, 0.3, 0.7);
        const la = a * clamp((zz - 21.6) * 2) * clamp((24.2 - zz) * 2);
        label("Andromeda", sx(ANDROMEDA_C[0]), sy(ANDROMEDA_C[1]) + 18, la, undefined, -30, 0);
        label("Triangulum", sx(tri[0]), sy(tri[1]) + 14, la, undefined, -30, 0);
        label("The Milky Way", sx(GC[0]), sy(GC[1]) + 18, la, undefined, -40, 0);
      }
      a = vis(9.5e20, 4, 2.4);
      if (a > 0) {
        image(milkyWay, GC[0], GC[1], 1.0e21, a, 0.2);
        const la = a * clamp((zz - 19.8) * 2) * clamp((22.3 - zz) * 2);
        dot(SUN_C[0], SUN_C[1], 2.5, `rgba(198,220,245,${la})`);
        label("You are here", sx(SUN_C[0]), sy(SUN_C[1]), la);
      }

      // ── Our neighbourhood of stars ──────────────────────────────────────────
      a = vis(2.4e17, 6, 2.5);
      if (a > 0) {
        ctx.globalAlpha = a;
        circle(SUN_C[0], SUN_C[1], 10 * LY, "rgba(169,195,224,0.25)", 1, [3, 5]);
        label("10 light years", sx(SUN_C[0]) + px(10 * LY) * 0.71, sy(SUN_C[1]) - px(10 * LY) * 0.71, a * 0.8, "rgba(169,195,224,0.75)", 6, 0);
        NEAR_STARS.forEach((s) => {
          const ra = (s.ra / 24) * Math.PI * 2;
          const d = s.ly * LY * Math.cos((s.dec * Math.PI) / 180);
          const x = SUN_C[0] + Math.cos(ra) * d;
          const y = SUN_C[1] + Math.sin(ra) * d;
          dot(x, y, 2.6, s.col, 10);
          label(s.name, sx(x), sy(y), a * (s.name === "Proxima Centauri" ? 0 : 1) * clamp((18 - zz) * 2), "rgba(232,236,241,0.75)", 7, 4);
        });
        dot(SUN_C[0], SUN_C[1], 2.6, "#FFF4DA", 10);
        label("The Sun", sx(SUN_C[0]), sy(SUN_C[1]), a, "rgba(243,221,176,0.9)", 7, 4);
        ctx.globalAlpha = 1;
      }
      a = vis(3e16, 60, 2.2);
      if (a > 0) {
        ctx.globalAlpha = a * 0.8;
        oort.forEach(([x, y]) => { const X = sx(x), Y = sy(y); if (X > -2 && X < W + 2 && Y > -2 && Y < H + 2) { ctx.fillStyle = "rgba(200,215,235,0.55)"; ctx.fillRect(X, Y, 1.2, 1.2); } });
        ctx.globalAlpha = 1;
        label("The Oort cloud", sx(SUN_C[0]) + px(60000 * AU) * 0.72, sy(SUN_C[1]) - px(60000 * AU) * 0.72, a * clamp((17 - zz) * 2), "rgba(200,215,235,0.8)");
      }
      a = vis(5.2e13, 6, 2.5);
      if (a > 0) {
        ctx.globalAlpha = a;
        circle(SUN_C[0], SUN_C[1], 120 * AU, "rgba(243,221,176,0.28)", 1, [4, 6]);
        label("Edge of the Sun's wind, about 120 au", sx(SUN_C[0]) + px(120 * AU) * 0.62, sy(SUN_C[1]) - px(120 * AU) * 0.82, a * clamp((15.4 - zz) * 2), "rgba(243,221,176,0.7)", 6, 0);
        ctx.beginPath();
        ctx.moveTo(sx(SUN_C[0]), sy(SUN_C[1]));
        ctx.lineTo(sx(VOY[0]), sy(VOY[1]));
        ctx.strokeStyle = "rgba(169,195,224,0.25)";
        ctx.stroke();
        dot(VOY[0], VOY[1], 2.4, "#A9C3E0", 9);
        label("Voyager 1", sx(VOY[0]), sy(VOY[1]), a * clamp((15.6 - zz) * 2), "rgba(169,195,224,0.95)");
        ctx.globalAlpha = 1;
      }

      // ── The Sun and planets, where they are today ─────────────────────────
      const planetsA = vis(9e12, 6, 3);
      if (planetsA > 0) {
        PLANET_ROWS.forEach((p) => {
          const rad = p.a * AU;
          const pa = vis(rad * 2, 10, 3) * planetsA;
          if (pa <= 0 || p.id === "earth") return;
          ctx.globalAlpha = pa;
          circle(SUN_C[0], SUN_C[1], rad, "rgba(169,195,224,0.16)");
          const x = SUN_C[0] + Math.cos(planetAngle[p.id]) * rad;
          const y = SUN_C[1] + Math.sin(planetAngle[p.id]) * rad;
          dot(x, y, 2.6, p.col, 8);
          label(p.name, sx(x), sy(y), pa * clamp((13.6 - zz) * 2.5), "rgba(232,236,241,0.75)", 6, -6);
          ctx.globalAlpha = 1;
        });
        // Earth's orbit, and Earth itself as a point once it is too small to see
        const ea = vis(2 * AU, 10, 3) * planetsA;
        if (ea > 0) {
          ctx.globalAlpha = ea;
          circle(SUN_C[0], SUN_C[1], AU, "rgba(141,182,230,0.28)");
          if (px(EARTH_R) < 2) {
            dot(EARTH_C[0], EARTH_C[1], 2.6, "#8DB6E6", 8);
            label("Earth", sx(EARTH_C[0]), sy(EARTH_C[1]), ea * clamp((13.2 - zz) * 2.5) * clamp((zz - 9.6) * 2.5), "rgba(141,182,230,0.95)");
          }
          ctx.globalAlpha = 1;
        }
        // The Sun: drawn at its true size, with a soft glow so it can be found when tiny
        const sa = clamp(planetsA + vis(1.39e9, 4, 3));
        const R = px(6.96e8);
        if (sa > 0 && onScreen(SUN_C[0], SUN_C[1], 6.96e8 * 4)) {
          ctx.globalAlpha = sa;
          dot(SUN_C[0], SUN_C[1], Math.max(2.4, R), "#FFF4DA", Math.max(14, R * 3));
          if (R > 6) sphere(imgs.sun, SUN_C[0], SUN_C[1], 6.96e8, sa, null);
          label("The Sun", sx(SUN_C[0]), sy(SUN_C[1]), sa * clamp((14 - zz) * 2) * clamp((zz - 9.4) * 2), "rgba(243,221,176,0.9)", Math.max(8, R + 6), 4);
          ctx.globalAlpha = 1;
        }
      }

      // ── Earth and the Moon ─────────────────────────────────────────────────
      a = vis(7.7e8, 10, 3);
      if (a > 0) {
        ctx.globalAlpha = a;
        circle(EARTH_C[0], EARTH_C[1], 3.844e8, "rgba(200,205,215,0.22)");
        ctx.globalAlpha = 1;
        const mr = px(1.737e6);
        if (mr < 2) { ctx.globalAlpha = a; dot(MOON_C[0], MOON_C[1], 2, "#C9C9C9"); ctx.globalAlpha = 1; }
        else sphere(imgs.moon, MOON_C[0], MOON_C[1], 1.737e6, a, Math.PI);
        label("The Moon", sx(MOON_C[0]), sy(MOON_C[1]), a * clamp((10.3 - zz) * 2), undefined, Math.max(8, mr + 6), 4);
      }
      const earthP = px(2 * EARTH_R);
      a = vis(1.2742e7, 4, 1e9);
      if (a > 0 && earthP < W * 6) {
        const tex = clamp(2.2 - earthP / W);
        if (earthP < 3) { ctx.globalAlpha = a; dot(EARTH_C[0], EARTH_C[1], 2.2, "#8DB6E6"); ctx.globalAlpha = 1; }
        else {
          if (tex < 1) {
            // Bigger than the view: show the curve of the planet as a calm limb rather than a stretched map
            const R = px(EARTH_R);
            const g = ctx.createRadialGradient(sx(EARTH_C[0]), sy(EARTH_C[1]), R * 0.8, sx(EARTH_C[0]), sy(EARTH_C[1]), R);
            g.addColorStop(0, "#0B1422");
            g.addColorStop(1, "#1E3550");
            ctx.globalAlpha = a * (1 - tex);
            ctx.beginPath();
            ctx.arc(sx(EARTH_C[0]), sy(EARTH_C[1]), R, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (tex > 0) sphere(imgs.earth, EARTH_C[0], EARTH_C[1], EARTH_R, a * tex, Math.PI);
        }
        label("Earth", sx(EARTH_C[0]), sy(EARTH_C[1]), a * clamp((9.6 - zz) * 2) * clamp((zz - 7.2) * 3), "rgba(141,182,230,0.95)", Math.max(8, earthP / 2 + 6), 4);
        // A thin line of air around the planet
        if (earthP > 40) {
          ctx.globalAlpha = a * 0.6;
          circle(EARTH_C[0], EARTH_C[1], EARTH_R + 3e4, "rgba(140,190,255,0.45)", Math.max(1, px(6e4)));
          ctx.globalAlpha = 1;
        }
      }
      // The ground under your feet, once Earth is far bigger than the screen
      if (earthP >= W * 6) {
        const gy = sy(0);
        if (gy < H) {
          const g = ctx.createLinearGradient(0, gy, 0, H);
          g.addColorStop(0, "#1A222E");
          g.addColorStop(1, "#0B0F16");
          ctx.fillStyle = g;
          ctx.fillRect(0, gy, W, H - gy);
          ctx.fillStyle = "rgba(169,195,224,0.35)";
          ctx.fillRect(0, gy, W, 1);
        }
      }

      // ── Things on the ground ───────────────────────────────────────────────
      a = vis(8849, 6, 4);
      if (a > 0) {
        ctx.globalAlpha = a;
        const pts: [number, number][] = [[1500, 0], [4500, 2600], [6200, 3900], [7600, 5600], [9100, 7100], [10300, 8100], [11000, 8849], [11800, 8350], [13200, 7600], [14600, 6200], [16900, 5300], [19800, 3100], [24000, 0]];
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y))));
        ctx.closePath();
        ctx.fillStyle = "#3A4452";
        ctx.fill();
        ctx.beginPath();
        [[8300, 6400], [9100, 7100], [10300, 8100], [11000, 8849], [11800, 8350], [12900, 7700], [12000, 7300], [10900, 7900], [9800, 7000]].forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y))));
        ctx.closePath();
        ctx.fillStyle = "#DDE5EE";
        ctx.fill();
        ctx.globalAlpha = 1;
        label("Mount Everest", sx(11000), sy(8849), a * clamp((5.6 - zz) * 2) * clamp((zz - 3.3) * 2), undefined, 10, -6);
      }
      a = vis(330, 6, 4);
      if (a > 0) {
        ctx.globalAlpha = a;
        const bx = 140;
        const legs = (side: number) => {
          ctx.beginPath();
          ctx.moveTo(sx(bx + side * 62), sy(0));
          ctx.quadraticCurveTo(sx(bx + side * 30), sy(80), sx(bx + side * 14), sy(190));
          ctx.lineTo(sx(bx + side * 4), sy(300));
          ctx.lineTo(sx(bx), sy(330));
          ctx.lineTo(sx(bx + side * 2), sy(300));
          ctx.lineTo(sx(bx + side * 9), sy(190));
          ctx.quadraticCurveTo(sx(bx + side * 18), sy(80), sx(bx + side * 36), sy(0));
          ctx.closePath();
          ctx.fillStyle = "#9C8664";
          ctx.fill();
        };
        legs(-1); legs(1);
        ctx.fillStyle = "#9C8664";
        [[57, 6], [116, 4], [276, 3]].forEach(([h, th]) => {
          const half = h < 60 ? 45 : h < 120 ? 22 : 6;
          ctx.fillRect(sx(bx - half), sy(h + th / 2), px(half * 2), Math.max(1, px(th)));
        });
        ctx.globalAlpha = 1;
        label("Eiffel Tower", sx(bx), sy(330), a * clamp((4.0 - zz) * 2) * clamp((zz - 1.6) * 2), undefined, 10, 0);
      }
      a = vis(1.7, 6, 6);
      if (a > 0) {
        // A simple figure, standing, with one hand out by the point we zoom into.
        ctx.globalAlpha = a;
        ctx.fillStyle = "#D9C4B6";
        ctx.strokeStyle = "#D9C4B6";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(sx(0), sy(1.58), px(0.11), 0, Math.PI * 2);
        ctx.fill();
        const limb = (pts: [number, number][], w: number) => {
          ctx.beginPath();
          pts.forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y))));
          ctx.lineWidth = Math.max(1, px(w));
          ctx.stroke();
        };
        limb([[0, 1.4], [0, 0.92]], 0.3);
        limb([[-0.08, 0.92], [-0.11, 0.48], [-0.12, 0.04]], 0.13);
        limb([[0.08, 0.92], [0.11, 0.48], [0.12, 0.04]], 0.13);
        limb([[-0.14, 1.36], [-0.24, 1.08], [-0.27, 0.84]], 0.09);
        limb([[0.14, 1.36], [0.24, 1.12], [MICRO_C[0], MICRO_C[1]]], 0.09);
        ctx.globalAlpha = 1;
        label("You, about 1.7 m", sx(0), sy(1.75), a * clamp((2.2 - zz) * 2) * clamp((zz + 0.3) * 2), undefined, -40, -6);
      }

      // ── Into your hand ─────────────────────────────────────────────────────
      // The ridges of a fingertip, about half a millimetre apart
      const ridgeA = clamp((-0.9 - zz) * 2) * clamp((zz + 3.6) * 1.5);
      if (ridgeA > 0) {
        ctx.fillStyle = `rgba(217,196,182,${ridgeA})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(170,128,112,${0.55 * ridgeA})`;
        ctx.lineWidth = Math.max(1, px(1.6e-4));
        ridges.forEach((i) => {
          ctx.beginPath();
          ctx.ellipse(sx(MICRO_C[0] - 2e-3), sy(MICRO_C[1] - 3e-3), px((i + 1) * 4.8e-4 * 1.3), px((i + 1) * 4.8e-4), 0.4, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.lineWidth = 1;
      }
      const skinA = clamp((-3.0 - zz) * 2) * clamp((zz + 5.6) * 1.5);
      if (skinA > 0) {
        ctx.fillStyle = `rgba(214,170,150,${0.85 * skinA})`;
        ctx.fillRect(0, 0, W, H);
        skin.forEach((c) => {
          if (!onScreen(c.x, c.y, c.rad)) return;
          ctx.beginPath();
          ctx.arc(sx(c.x), sy(c.y), Math.max(0.5, px(c.rad)), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${226 + c.tone * 14},${176 + c.tone * 12},${156 + c.tone * 10},${skinA})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(150,95,85,${0.5 * skinA})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          if (px(c.rad) > 6) {
            ctx.beginPath();
            ctx.arc(sx(c.x), sy(c.y), px(c.rad * 0.2), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150,90,110,${0.6 * skinA})`;
            ctx.fill();
          }
        });
      }
      // A hair growing beside the cell
      a = vis(7e-5, 6, 3) * clamp((-1.4 - zz) * 2);
      if (a > 0) {
        const hx = MICRO_C[0] + 1.1e-4, hy = MICRO_C[1] + 0.2e-4;
        ctx.globalAlpha = a;
        const R = px(3.5e-5);
        const g = ctx.createRadialGradient(sx(hx) - R * 0.3, sy(hy) - R * 0.3, R * 0.1, sx(hx), sy(hy), R);
        g.addColorStop(0, "#8A6A48");
        g.addColorStop(1, "#4A3626");
        ctx.beginPath();
        ctx.arc(sx(hx), sy(hy), R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.globalAlpha = 1;
        label("A hair", sx(hx), sy(hy), a * clamp((-2.9 - zz) * 2) * clamp((zz + 4.6) * 2), "rgba(40,25,20,0.9)", R + 6, 4);
      }
      // The cell we zoom into
      const cellA = clamp((-2.0 - zz) * 1.5) * vis(3e-5, 4, 2.6);
      if (cellA > 0) {
        ctx.globalAlpha = cellA;
        const R = px(1.5e-5);
        const g = ctx.createRadialGradient(sx(MICRO_C[0]), sy(MICRO_C[1]), R * 0.2, sx(MICRO_C[0]), sy(MICRO_C[1]), R);
        g.addColorStop(0, "#F1C9B8");
        g.addColorStop(1, "#DDA894");
        ctx.beginPath();
        ctx.arc(sx(MICRO_C[0]), sy(MICRO_C[1]), R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(150,95,85,0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        // A bacterium resting on the cell
        const bx = MICRO_C[0] + 1.25e-5, by = MICRO_C[1] + 0.75e-5;
        const ba = vis(2e-6, 5, 3);
        if (ba > 0) {
          ctx.save();
          ctx.globalAlpha = ba * cellA;
          ctx.translate(sx(bx), sy(by));
          ctx.rotate(-0.5);
          const L = px(2e-6), Wd = px(0.5e-6);
          ctx.beginPath();
          ctx.roundRect(-L / 2, -Wd / 2, L, Wd, Wd / 2);
          ctx.fillStyle = "#7FA36A";
          ctx.fill();
          ctx.restore();
          label("A bacterium", sx(bx), sy(by), ba * cellA * clamp((-3.9 - zz) * 2) * clamp((zz + 5.8) * 2), "rgba(40,25,20,0.9)", 10, -6);
        }
      }
      // The nucleus, with a virus that has found its way in
      const nucA = clamp((-3.4 - zz) * 1.5) * vis(6e-6, 5, 2.6);
      if (nucA > 0) {
        ctx.globalAlpha = nucA;
        const R = px(3e-6);
        const g = ctx.createRadialGradient(sx(MICRO_C[0]), sy(MICRO_C[1]), 0, sx(MICRO_C[0]), sy(MICRO_C[1]), R);
        g.addColorStop(0, "#B07A9A");
        g.addColorStop(1, "#8E5C7E");
        ctx.beginPath();
        ctx.arc(sx(MICRO_C[0]), sy(MICRO_C[1]), R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        // Coils of DNA packed inside, shown while the whole nucleus is in view
        ctx.strokeStyle = `rgba(240,210,230,${0.35 * clamp(1 - Math.log10(R * 2 / W) / 0.5)})`;
        ctx.lineWidth = 1;
        const rr = rng(9);
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          const ax = MICRO_C[0] + (rr() - 0.5) * 4e-6, ay = MICRO_C[1] + (rr() - 0.5) * 4e-6;
          ctx.arc(sx(ax), sy(ay), px(1.5e-7 + rr() * 3e-7), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        label("The nucleus", sx(MICRO_C[0]) + R * 0.7, sy(MICRO_C[1]) - R * 0.75, nucA * clamp((-4.6 - zz) * 2), "rgba(40,25,30,0.9)");
        const vx = MICRO_C[0] + 2.2e-7, vy = MICRO_C[1] + 1.2e-7;
        const va = vis(1e-7, 5, 3);
        if (va > 0) {
          ctx.globalAlpha = va * nucA;
          const VR = px(5e-8);
          for (let s = 0; s < 18; s++) {
            const an = (s / 18) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(sx(vx) + Math.cos(an) * VR, sy(vy) + Math.sin(an) * VR);
            ctx.lineTo(sx(vx) + Math.cos(an) * VR * 1.25, sy(vy) + Math.sin(an) * VR * 1.25);
            ctx.strokeStyle = "#5B6E8A";
            ctx.lineWidth = Math.max(1, VR * 0.08);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(sx(vx), sy(vy), VR, 0, Math.PI * 2);
          ctx.fillStyle = "#7E93B3";
          ctx.fill();
          ctx.globalAlpha = 1;
          label("A flu virus", sx(vx), sy(vy), va * nucA * clamp((-5.4 - zz) * 2) * clamp((zz + 7.4) * 2), "rgba(30,20,30,0.9)", VR * 1.3 + 6, 4);
        }
      }
      // DNA: two strands, about 2 nanometres apart, with water around it
      const dnaA = clamp((-5.8 - zz) * 1.2) * vis(2e-9, 4, 1.1);
      if (dnaA > 0) {
        if (zz < -6.6) {
          ctx.fillStyle = `rgba(20,24,36,${clamp((-6.6 - zz) * 1.5)})`;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.globalAlpha = dnaA;
        const len = 3.4e-8, rad = 1e-9;
        const x0 = MICRO_C[0] - len / 2;
        for (let s = 0; s < 2; s++) {
          ctx.beginPath();
          for (let i = 0; i <= 200; i++) {
            const u = i / 200;
            const x = x0 + u * len;
            const y = MICRO_C[1] + Math.sin(u * Math.PI * 2 * 10 + s * Math.PI * 0.8) * rad;
            if (i) ctx.lineTo(sx(x), sy(y)); else ctx.moveTo(sx(x), sy(y));
          }
          ctx.strokeStyle = s ? "#8FB8E8" : "#E8B48F";
          ctx.lineWidth = Math.max(1, px(2e-10));
          ctx.stroke();
        }
        for (let i = 0; i < 100; i++) {
          const u = (i + 0.5) / 100;
          const x = x0 + u * len;
          const y1 = MICRO_C[1] + Math.sin(u * Math.PI * 2 * 10) * rad;
          const y2 = MICRO_C[1] + Math.sin(u * Math.PI * 2 * 10 + Math.PI * 0.8) * rad;
          ctx.beginPath();
          ctx.moveTo(sx(x), sy(y1));
          ctx.lineTo(sx(x), sy(y2));
          ctx.strokeStyle = ["#D9C27A", "#9DCB8E", "#C98FA8", "#8FB3CB"][i % 4];
          ctx.lineWidth = Math.max(0.6, px(1e-10));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        label("DNA", sx(x0 + len), sy(MICRO_C[1]), dnaA * clamp((-7.4 - zz) * 2) * clamp((zz + 9.4) * 2), undefined, 8, 4);
      }
      // A water molecule beside the DNA
      const wA = vis(2.8e-10, 6, 3) * clamp((-8.0 - zz) * 1.5);
      if (wA > 0) {
        const wx = MICRO_C[0] + 2.2e-9, wy = MICRO_C[1] + 1.6e-9;
        ctx.globalAlpha = wA;
        const O = px(7.6e-11), Hh = px(5.3e-11);
        [-104.5 / 2, 104.5 / 2].forEach((deg) => {
          const an = ((deg - 90) * Math.PI) / 180;
          dot(wx + Math.cos(an) * 9.6e-11, wy - Math.sin(an) * 9.6e-11, Hh, "#E6EBF1");
        });
        dot(wx, wy, O, "#D9655A");
        ctx.globalAlpha = 1;
        label("Water", sx(wx), sy(wy), wA * clamp((-9.0 - zz) * 2) * clamp((zz + 10.6) * 2), undefined, O + 8, 4);
      }
      // A carbon atom: a cloud where its electrons are likely to be, with a nucleus far too small to see
      const atomA = clamp((-8.6 - zz) * 1.2) * vis(1.5e-10, 6, 3);
      if (atomA > 0) {
        const X = sx(MICRO_C[0]), Y = sy(MICRO_C[1]);
        const R = px(7.5e-11);
        ctx.globalAlpha = atomA;
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, R * 1.3);
        g.addColorStop(0, "rgba(120,160,230,0.4)");
        g.addColorStop(0.35, "rgba(100,140,220,0.16)");
        g.addColorStop(0.75, "rgba(100,140,220,0.04)");
        g.addColorStop(1, "rgba(100,140,220,0)");
        ctx.fillStyle = g;
        ctx.fillRect(X - R * 1.3, Y - R * 1.3, R * 2.6, R * 2.6);
        // Where an electron might be found: denser near the middle, thinning out
        ctx.fillStyle = "rgba(190,210,245,0.55)";
        electron.forEach(([ex, ey]) => ctx.fillRect(X + ex * R, Y + ey * R, 1.5, 1.5));
        dot(MICRO_C[0], MICRO_C[1], 1.5, "#F3DDB0");
        label("Nucleus, far too small to see at this size", X, Y, atomA * clamp((-9.6 - zz) * 2) * clamp((zz + 11.2) * 2), "rgba(243,221,176,0.85)", 8, 4);
        ctx.globalAlpha = 1;
      }
      // Carbon nucleus: six protons and six neutrons
      const nA = vis(5.5e-15, 5, 3) * clamp((-12 - zz) * 1.2) * clamp((zz + 14.25) * 2.5);
      if (nA > 0) {
        ctx.globalAlpha = nA;
        const pr = 0.85e-15;
        const balls: [number, number, string][] = [[0, 0, "#D9655A"], [1.3, 0.4, "#8E9AA8"], [-1.2, 0.6, "#D9655A"], [0.4, -1.3, "#8E9AA8"], [-0.6, -1.0, "#D9655A"], [0.9, 1.4, "#8E9AA8"], [-1.5, -0.5, "#8E9AA8"], [1.5, -0.9, "#D9655A"], [-0.3, 1.5, "#D9655A"], [0.2, 0.2, "#8E9AA8"], [-0.9, 0.0, "#8E9AA8"], [0.8, -0.3, "#D9655A"]];
        balls.forEach(([bx, by, col]) => dot(MICRO_C[0] + bx * pr, MICRO_C[1] + by * pr, px(pr), col));
        ctx.globalAlpha = 1;
        label("A carbon nucleus", sx(MICRO_C[0]) + px(2.6e-15), sy(MICRO_C[1]), nA * clamp((-13.6 - zz) * 2) * clamp((zz + 15.0) * 2));
      }
      // A proton up close: three quarks
      const pA = clamp((-13.9 - zz) * 1.5) * vis(1.7e-15, 6, 3);
      if (pA > 0) {
        const X = sx(MICRO_C[0]), Y = sy(MICRO_C[1]);
        const R = px(0.85e-15);
        ctx.globalAlpha = pA;
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, R);
        g.addColorStop(0, "rgba(217,101,90,0.45)");
        g.addColorStop(1, "rgba(217,101,90,0.05)");
        ctx.beginPath();
        ctx.arc(X, Y, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        [["#E06B6B", 0], ["#7FCB8E", 2.1], ["#7FA8E6", 4.2]].forEach(([col, an]) => {
          const ang = Number(an) + t * 0.6;
          dot(MICRO_C[0] + Math.cos(ang) * 0.4e-15, MICRO_C[1] + Math.sin(ang) * 0.4e-15, Math.max(2, Math.min(6, R * 0.06)), String(col));
        });
        ctx.globalAlpha = 1;
      }

      // The Planck scale: space itself may churn and bubble
      const foamA = clamp((-33.2 - zz) * 1.2);
      if (foamA > 0) {
        ctx.globalAlpha = foamA;
        foam.forEach(([fx2, fy2, fr]) => {
          const wob = 1 + 0.35 * Math.sin(t * 2 + fx2 * 40);
          ctx.beginPath();
          ctx.arc(W / 2 + fx2 * W * 1.2, H * 0.46 + fy2 * H * 1.2, fr * W * wob, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(200,215,240,0.25)";
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // Centre marker on the zoom point, faint, so you know where you are heading
      if (zz < -0.5 && zz > -33) {
        ctx.strokeStyle = "rgba(232,236,241,0.18)";
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
        ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
        ctx.stroke();
      }

      setZ((prev) => (Math.abs(prev - zz) > 0.002 ? zz : prev));
    };
    raf = requestAnimationFrame(frame);

    // ── Input: scroll, drag, pinch, keys ────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dz = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * 0.0016;
      targetRef.current = clamp(targetRef.current + dz, Z_MIN, Z_MAX);
      setTouched(true);
    };
    let dragY: number | null = null;
    let pinch: number | null = null;
    const onPointerDown = (e: PointerEvent) => { dragY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onPointerMove = (e: PointerEvent) => {
      if (dragY === null || pinch !== null) return;
      const dy = e.clientY - dragY;
      dragY = e.clientY;
      targetRef.current = clamp(targetRef.current - dy * 0.012, Z_MIN, Z_MAX);
      setTouched(true);
    };
    const onPointerUp = () => { dragY = null; };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinch !== null) targetRef.current = clamp(targetRef.current - Math.log10(d / pinch) * 2, Z_MIN, Z_MAX);
      pinch = d;
      e.preventDefault();
    };
    const onTouchEnd = () => { pinch = null; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "-") { targetRef.current = clamp(targetRef.current + 0.5, Z_MIN, Z_MAX); setTouched(true); }
      if (e.key === "ArrowDown" || e.key === "+" || e.key === "=") { targetRef.current = clamp(targetRef.current - 0.5, Z_MIN, Z_MAX); setTouched(true); }
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // What is on screen now: the thing whose size is closest to the width of the view.
  const fits = THINGS.filter((th) => {
    const l = Math.log10(th.size);
    return l <= z + 0.05 && l >= z - 2.0;
  });
  const inGap = z < -19.6 && z > -33.4;
  const shown = !inGap && fits.length ? fits[fits.length - 1] : null;

  const scaleBar = niceLength(Math.pow(10, z) * 0.18);
  const barPct = (scaleBar.metres / Math.pow(10, z)) * 100;
  const widthLabel = lengthLabel(Math.pow(10, z));
  const ticks = THINGS.filter((th) => th.tick);

  return (
    <div className="fixed inset-x-0 top-14 md:top-16 bottom-12 md:bottom-0" style={{ background: "#05070C" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none cursor-ns-resize" aria-label="A zoomable view of the universe, from the smallest scales to the largest" />

      {/* What you are looking at */}
      <div className="absolute top-3 left-3 right-3 md:right-auto md:max-w-[25rem] pointer-events-none rounded-lg px-3 py-2.5" style={{ background: "rgba(5,7,12,0.62)" }}>
        {shown ? (
          <div key={shown.id}>
            <h1 className="m-0 text-[28px] md:text-[36px] leading-tight" style={{ color: "#E8ECF1" }}>{shown.name}</h1>
            <p className="m-0 mt-1 text-[14px]" style={{ color: "#A9C3E0" }}>{shown.sizeLabel}</p>
            <p className="m-0 mt-2 sm:mt-3 text-[13px] sm:text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>{shown.fact}</p>
          </div>
        ) : inGap ? (
          <div>
            <h1 className="m-0 text-[28px] md:text-[36px] leading-tight" style={{ color: "#E8ECF1" }}>The unknown</h1>
            <p className="m-0 mt-3 text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>
              Between the smallest things ever measured and the Planck length lie about fifteen powers of ten that no
              experiment has reached. Keep going.
            </p>
          </div>
        ) : (
          <h1 className="m-0 text-[28px] md:text-[36px] leading-tight" style={{ color: "#E8ECF1" }}>Scale of the universe</h1>
        )}
        {!touched && <p className="m-0 mt-2 text-[13px] md:hidden" style={{ color: "#A3AFBC" }}>Drag up to zoom out, down to zoom in.</p>}
      </div>

      {!touched && (
        <p className="absolute right-4 top-4 m-0 text-[14px] text-right pointer-events-none max-w-[16rem] hidden md:block" style={{ color: "#A3AFBC" }}>
          Scroll to zoom out, or the other way to zoom in.<span className="sm:hidden"> On a phone, drag up or down.</span>
        </p>
      )}

      {/* Scale bar and the track of powers of ten */}
      <div className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-6" style={{ background: "linear-gradient(to top, rgba(5,7,12,0.95), rgba(5,7,12,0))" }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div className="min-w-0">
              <div style={{ width: `${barPct}vw`, maxWidth: "40vw", height: 6, borderLeft: "1px solid #E8ECF1", borderRight: "1px solid #E8ECF1", borderBottom: "1px solid #E8ECF1" }} />
              <div className="mt-1 text-[13px] tabular-nums whitespace-nowrap" style={{ color: "#E8ECF1" }}>{scaleBar.label}</div>
            </div>
            <div className="hidden sm:block text-right text-[13px] tabular-nums" style={{ color: "#8E9AA8" }}>
              The view is {widthLabel} wide, about {pow10Label(Math.round(z))} metres
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => zoomBy(-1)} className="rounded-md px-3 py-1.5 text-[14px] transition-colors hover:bg-white/5" style={{ border: "1px solid #2A3546", color: "#E8ECF1" }}>Zoom in</button>
              <button onClick={() => zoomBy(1)} className="rounded-md px-3 py-1.5 text-[14px] transition-colors hover:bg-white/5" style={{ border: "1px solid #2A3546", color: "#E8ECF1" }}>Zoom out</button>
            </div>
          </div>
          <div className="relative h-9">
            <div className="absolute left-0 right-0 top-3 h-px" style={{ background: "#2A3546" }} />
            <div className="absolute top-1.5 w-[2px] h-4 -translate-x-1/2" style={{ left: `${((z - Z_MIN) / (Z_MAX - Z_MIN)) * 100}%`, background: "#E8ECF1" }} />
            {ticks.map((th) => {
              const tz = Math.log10(th.size) + 0.45;
              return (
                <button
                  key={th.id}
                  onClick={() => flyTo(tz)}
                  className={`absolute -translate-x-1/2 top-4 text-[12px] whitespace-nowrap transition-colors hover:text-white ${th.wideOnly ? "hidden sm:block" : ""}`}
                  style={{ left: `${((tz - Z_MIN) / (Z_MAX - Z_MIN)) * 100}%`, color: "#8E9AA8" }}
                >
                  {th.tick}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
