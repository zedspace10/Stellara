import { useEffect, useRef, useCallback, useMemo } from "react";
import type { ExoplanetData } from "./types";
import { getStarColor, NOTABLE_SYSTEMS } from "./utils";

interface StarSystem {
  starName: string;
  ra: number;
  dec: number;
  count: number;
  spectralType: string | null;
  planets: ExoplanetData[];
}

interface Props {
  planets: ExoplanetData[];
  onSelectStar: (system: StarSystem) => void;
  highlightIds?: Set<string>;
}

function buildSystems(planets: ExoplanetData[]): StarSystem[] {
  const map = new Map<string, StarSystem>();
  planets.forEach(p => {
    if (p.ra == null || p.dec == null) return;
    if (!map.has(p.starName)) {
      map.set(p.starName, { starName: p.starName, ra: p.ra, dec: p.dec, count: 0, spectralType: p.spectralType, planets: [] });
    }
    const s = map.get(p.starName)!;
    s.count++;
    s.planets.push(p);
  });
  return Array.from(map.values());
}

export default function SkyMap({ planets, onSelectStar, highlightIds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const systems = useMemo(() => buildSystems(planets), [planets]);
  const systemsRef = useRef(systems);
  useEffect(() => { systemsRef.current = systems; }, [systems]);
  const hoveredRef = useRef<StarSystem | null>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  const project = useCallback((ra: number, dec: number, W: number, H: number) => {
    const { x: px, y: py } = panRef.current;
    const z = zoomRef.current;
    const x = ((ra / 360) * W * z) + px;
    const y = ((1 - (dec + 90) / 180) * H * z) + py;
    return { x, y };
  }, []);

  const unproject = useCallback((sx: number, sy: number, W: number, H: number) => {
    const { x: px, y: py } = panRef.current;
    const z = zoomRef.current;
    const ra = ((sx - px) / (W * z)) * 360;
    const dec = (1 - (sy - py) / (H * z)) * 180 - 90;
    return { ra, dec };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    tRef.current += 0.015;
    const t = tRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#020209";
    ctx.fillRect(0, 0, W, H);

    // Grid lines (RA/Dec)
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let ra = 0; ra <= 360; ra += 30) {
      const x = ((ra / 360) * W * zoomRef.current) + panRef.current.x;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let dec = -90; dec <= 90; dec += 30) {
      const y = ((1 - (dec + 90) / 180) * H * zoomRef.current) + panRef.current.y;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const hovered = hoveredRef.current;
    const activeHighlight = highlightIds && highlightIds.size > 0;

    systemsRef.current.forEach(sys => {
      const { x, y } = project(sys.ra, sys.dec, W, H);
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) return;

      const col = getStarColor(sys.spectralType);
      const isHovered = hovered?.starName === sys.starName;
      const isHighlighted = !activeHighlight || sys.planets.some(p => highlightIds!.has(p.id));
      const baseR = Math.min(4, 1.5 + sys.count * 0.35);
      const r = isHovered ? baseR * 2.2 : baseR;

      // Dim non-highlighted
      ctx.globalAlpha = isHighlighted ? 1 : 0.2;

      if (isHovered) {
        const glowG = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        glowG.addColorStop(0, col + "80");
        glowG.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowG;
        ctx.beginPath(); ctx.arc(x, y, r * 5, 0, Math.PI * 2); ctx.fill();
      }

      // Twinkling
      const twinkle = 0.75 + 0.25 * Math.sin(t * (2 + (sys.ra % 3)) + sys.dec);
      ctx.globalAlpha *= twinkle * (isHighlighted ? 1 : 0.25);

      const sg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
      sg.addColorStop(0, "#ffffff");
      sg.addColorStop(0.3, col);
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();

      ctx.globalAlpha = 1;
    });

    // Notable system labels
    Object.entries(NOTABLE_SYSTEMS).forEach(([key, info]) => {
      const sys = systemsRef.current.find(s => s.starName.startsWith(key));
      if (!sys) return;
      const { x, y } = project(sys.ra, sys.dec, W, H);
      if (x < 0 || x > W || y < 0 || y > H) return;
      ctx.font = "bold 10px Orbitron, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,213,79,0.85)";
      ctx.fillText(info.label, x + 8, y - 5);
      ctx.font = "9px Space Grotesk, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(info.note, x + 8, y + 7);
    });

    // Hover tooltip
    if (hovered) {
      const { x, y } = project(hovered.ra, hovered.dec, W, H);
      ctx.save();
      const tw = 180;
      const tx = Math.min(W - tw - 10, Math.max(10, x - tw / 2));
      const ty = y > H * 0.7 ? y - 75 : y + 20;
      ctx.fillStyle = "rgba(6,6,20,0.9)";
      ctx.strokeStyle = "rgba(79,195,247,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 58, 8);
      ctx.fill(); ctx.stroke();
      ctx.textAlign = "left";
      ctx.font = "bold 11px Orbitron, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(hovered.starName, tx + 10, ty + 18);
      ctx.font = "10px Space Grotesk, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${hovered.count} confirmed planet${hovered.count > 1 ? "s" : ""}`, tx + 10, ty + 34);
      if (hovered.planets[0]?.distanceLY) {
        ctx.fillText(`${hovered.planets[0].distanceLY.toFixed(1)} light years`, tx + 10, ty + 48);
      }
      ctx.restore();
    }

    // Bottom label
    ctx.font = "11px Space Grotesk, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("Every point is a star with at least one confirmed planet · Drag to pan · Scroll to zoom", W / 2, H - 14);
  }, [project, highlightIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => { draw(); rafRef.current = requestAnimationFrame(tick); };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => { dragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { dragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (dragging.current) {
        panRef.current.x += e.clientX - lastMouse.current.x;
        panRef.current.y += e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        hoveredRef.current = null;
        return;
      }

      // Hit test
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      let closest: StarSystem | null = null;
      let bestD = 20;
      systemsRef.current.forEach(sys => {
        const { x, y } = project(sys.ra, sys.dec, W, H);
        const d = Math.hypot(mx - x, my - y);
        if (d < bestD) { bestD = d; closest = sys; }
      });
      hoveredRef.current = closest;
      canvas.style.cursor = closest ? "pointer" : "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      const newZ = Math.max(0.5, Math.min(20, zoomRef.current * factor));
      panRef.current.x = mx - (mx - panRef.current.x) * (newZ / zoomRef.current);
      panRef.current.y = my - (my - panRef.current.y) * (newZ / zoomRef.current);
      zoomRef.current = newZ;
      void W; void H; // suppress unused warnings
    };

    const onClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.offsetWidth; const H = canvas.offsetHeight;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let closest: StarSystem | null = null;
      let bestD = 24;
      systemsRef.current.forEach(sys => {
        const { x, y } = project(sys.ra, sys.dec, W, H);
        const d = Math.hypot(mx - x, my - y);
        if (d < bestD) { bestD = d; closest = sys; }
      });
      if (closest) onSelectStar(closest);
    };

    // Touch
    let lastTouchY = 0;
    let lastPinchDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) { lastTouchY = e.touches[0].clientY; lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
      if (e.touches.length === 2) { lastPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
      void lastTouchY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        panRef.current.x += e.touches[0].clientX - lastMouse.current.x;
        panRef.current.y += e.touches[0].clientY - lastMouse.current.y;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const factor = d / lastPinchDist;
        zoomRef.current = Math.max(0.5, Math.min(20, zoomRef.current * factor));
        lastPinchDist = d;
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [project, onSelectStar]);

  // Expose project/unproject for external use if needed
  void unproject;

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: "grab", touchAction: "none" }}
    />
  );
}
