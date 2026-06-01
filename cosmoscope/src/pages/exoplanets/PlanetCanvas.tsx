import { useEffect, useRef } from "react";
import type { ExoplanetData } from "./types";
import { drawPlanet } from "./planetRenderer";

interface Props {
  planet: ExoplanetData;
  size: number;
  className?: string;
  animated?: boolean;
}

export default function PlanetCanvas({ planet, size, className, animated = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    if (!animated) {
      ctx.clearRect(0, 0, size, size);
      drawPlanet(ctx, size / 2, size / 2, size * 0.4, planet);
      return;
    }

    let t = 0;
    const tick = () => {
      ctx.clearRect(0, 0, size, size);
      // Very subtle rotation effect via shadow offset drift
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(Math.sin(t * 0.1) * 0.02);
      ctx.translate(-size / 2, -size / 2);
      drawPlanet(ctx, size / 2, size / 2, size * 0.4, planet);
      ctx.restore();
      t += 0.016;
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(rafRef.current);
  }, [planet, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
