import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Most pages paint their own solid background or fill the screen with a picture, so the stars
// would never be seen there. Only draw them where they show.
const SHOWN = (path: string) => path === "/apod" || path.startsWith("/exoplanets");

const LAYERS = 3;

// The stars are drawn once, split across three layers. Each layer fades in and out on its own
// slow cycle, so the sky twinkles, and the browser does that without any work from the page.
export default function StarField() {
  const [path] = useLocation();
  const covered = !SHOWN(path);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (covered || !wrap) return;
    const canvases = Array.from(wrap.querySelectorAll("canvas"));

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      const count = Math.floor((W * H) / 3000);
      let seed = 7;
      const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
      canvases.forEach((c, layer) => {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (let i = layer; i < count; i += LAYERS) {
          const size = rnd() * 1.5 + 0.5;
          ctx.fillStyle = `rgba(255,255,255,${(0.25 + rnd() * 0.75).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(rnd() * W, rnd() * H, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };
    draw();
    let resizeTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(draw, 150); };
    window.addEventListener("resize", onResize);

    // A gentle drift with the mouse, nearer layers moving further
    let raf = 0, mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX - window.innerWidth / 2) * 0.005;
      my = (e.clientY - window.innerHeight / 2) * 0.005;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        canvases.forEach((c, i) => { c.style.transform = `translate3d(${-mx * (i + 1) * 0.6}px, ${-my * (i + 1) * 0.6}px, 0)`; });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [covered]);

  if (covered) return null;
  return (
    <div ref={wrapRef} className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
      {Array.from({ length: LAYERS }, (_, i) => (
        <canvas
          key={i}
          className="absolute inset-0 w-full h-full"
          style={{ animation: `pale-twinkle ${5 + i * 2.3}s ease-in-out ${-i * 1.7}s infinite alternate` }}
        />
      ))}
      <style>{`@keyframes pale-twinkle { from { opacity: 1 } to { opacity: 0.35 } } @media (prefers-reduced-motion: reduce) { [style*="pale-twinkle"] { animation: none !important } }`}</style>
    </div>
  );
}
