import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';

interface SagittariusPanelProps {
  open: boolean;
  onClose: () => void;
}

const SAGITTARIUS_DATA = {
  name: 'Sagittarius A*',
  category: 'Supermassive Black Hole',
  stats: [
    { label: 'Mass', value: '4 million solar masses' },
    { label: 'Event horizon diameter', value: 'About 25 million km' },
    { label: 'Distance from Earth', value: '26,000 light years' },
    { label: 'Location', value: 'Centre of the Milky Way' },
    { label: 'First imaged', value: '12 May 2022' },
    { label: 'Radio source discovery', value: '1974' },
  ],
  about: `Sagittarius A* is the supermassive black hole at the very centre of our Milky Way galaxy. With a mass 4 million times that of our Sun compressed into a region smaller than our Solar System, it is one of the most extreme objects in the known universe. Despite its immense mass it is relatively quiet, consuming very little material compared to active galactic nuclei in other galaxies.`,
  facts: [
    `In 2022 the Event Horizon Telescope captured the first direct image of Sagittarius A*, humanity's first look at our own galaxy's central black hole.`,
    `At its closest, the star S2 races past Sagittarius A* at about 2.5% of the speed of light, one of the fastest stellar orbits known.`,
    `Despite being 4 million solar masses, Sagittarius A* is unusually dim and quiet for a black hole of its size.`,
  ],
  ehtNote: `The 2022 EHT image showed a glowing ring of hot gas around a dark central shadow, the black hole's silhouette. The image required radio telescopes on multiple continents working simultaneously as an Earth-sized instrument.`,
};

function BlackHoleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 280;
    const H = 160;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 120; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 251.3) % H;
      const r = Math.hypot(x - cx, y - cy);
      if (r < 80) continue;
      const opacity = 0.2 + (i % 8) * 0.04;
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 1 : 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fill();
    }

    const shadowR = 32;

    const discLayers = [
      { rx: 80, ry: 18, opacity: 0.55, colorTop: '#ff6a00', colorBot: '#ff9100' },
      { rx: 65, ry: 14, opacity: 0.70, colorTop: '#ff4500', colorBot: '#ffbe00' },
      { rx: 50, ry: 10, opacity: 0.85, colorTop: '#ffcc00', colorBot: '#ffffff' },
    ];

    discLayers.forEach(({ rx, ry, opacity, colorTop, colorBot }) => {
      ctx.save();
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.ellipse(cx, cy - 6, rx, ry, 0, Math.PI, Math.PI * 2);
      const gradTop = ctx.createLinearGradient(cx - rx, cy - 6, cx + rx, cy - 6);
      gradTop.addColorStop(0, 'transparent');
      gradTop.addColorStop(0.3, colorTop + 'cc');
      gradTop.addColorStop(0.5, colorBot);
      gradTop.addColorStop(0.7, colorTop + 'cc');
      gradTop.addColorStop(1, 'transparent');
      ctx.fillStyle = gradTop;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, rx, ry, 0, 0, Math.PI);
      const gradBot = ctx.createLinearGradient(cx - rx, cy + 8, cx + rx, cy + 8);
      gradBot.addColorStop(0, 'transparent');
      gradBot.addColorStop(0.3, colorTop + '88');
      gradBot.addColorStop(0.5, colorTop + 'aa');
      gradBot.addColorStop(0.7, colorTop + '88');
      gradBot.addColorStop(1, 'transparent');
      ctx.fillStyle = gradBot;
      ctx.fill();

      ctx.restore();
    });

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, shadowR + 7, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffe08080';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, shadowR, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.save();
    const lensGrad = ctx.createRadialGradient(cx, cy, shadowR - 1, cx, cy, shadowR + 3);
    lensGrad.addColorStop(0, 'rgba(255,210,100,0.7)');
    lensGrad.addColorStop(1, 'rgba(255,160,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, shadowR + 3, 0, Math.PI * 2);
    ctx.fillStyle = lensGrad;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, shadowR, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 280, height: 160, borderRadius: 8, display: 'block', margin: '0 auto' }}
    />
  );
}

export default function SagittariusPanel({ open, onClose }: SagittariusPanelProps) {
  const [, navigate] = useLocation();
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[39]" onClick={onClose} />
      <div
        className="fixed right-4 z-40 flex flex-col rounded-xl overflow-y-auto"
        style={{ top: "220px", width: 352, maxWidth: "calc(100vw - 2rem)", maxHeight: "calc(100vh - 240px)", background: "#0A0F17", border: "1px solid #1C2533" }}
      >
        <div className="sticky top-0 z-10 px-5 pt-4 pb-4 flex items-start justify-between gap-3" style={{ background: "#0A0F17", borderBottom: "1px solid #1C2533" }}>
          <div className="min-w-0">
            <h2 className="m-0 text-[26px] leading-tight" style={{ color: "#F3DDB0", fontWeight: 400 }}>Sagittarius A*</h2>
            <p className="m-0 mt-0.5 text-[13px]" style={{ color: "#8E9AA8" }}>The black hole at the centre of our galaxy</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-white/5 transition-colors shrink-0" aria-label="Close" style={{ color: "#8E9AA8" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-6">
          <figure className="m-0">
            <BlackHoleCanvas />
            <figcaption className="mt-2 text-[12px] text-center" style={{ color: "#6E7A88" }}>
              A simulation, based on the 2022 Event Horizon Telescope image
            </figcaption>
          </figure>

          <p className="m-0 mt-5 text-[15px] leading-relaxed" style={{ color: "#C9D2DC" }}>{SAGITTARIUS_DATA.about}</p>

          <dl className="m-0 mt-6">
            {SAGITTARIUS_DATA.stats.map((st) => (
              <div key={st.label} className="flex items-baseline justify-between gap-4 py-2" style={{ borderTop: "1px solid #161E2A" }}>
                <dt className="text-[14px] shrink-0" style={{ color: "#8E9AA8" }}>{st.label}</dt>
                <dd className="m-0 text-[14px] text-right tabular-nums" style={{ color: "#E8ECF1" }}>{st.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="m-0 mt-6 p-0 list-none space-y-3">
            {SAGITTARIUS_DATA.facts.map((fact) => (
              <li key={fact} className="text-[14px] leading-relaxed pl-3" style={{ color: "#C9D2DC", borderLeft: "1px solid #2A3546" }}>{fact}</li>
            ))}
          </ul>

          <p className="m-0 mt-6 font-serif text-[17px] leading-snug" style={{ color: "#E8ECF1" }}>{SAGITTARIUS_DATA.ehtNote}</p>

          <button
            onClick={() => { navigate("/simulations/black-hole"); onClose(); }}
            className="mt-6 w-full rounded-md py-2 text-[14px] font-medium transition-colors hover:bg-white/5"
            style={{ border: "1px solid #2A3546", color: "#E8ECF1" }}
          >
            See how a black hole bends light
          </button>
        </div>
      </div>
    </>
  );
}
