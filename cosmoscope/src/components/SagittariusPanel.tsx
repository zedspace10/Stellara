import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface SagittariusPanelProps {
  open: boolean;
  onClose: () => void;
}

const SAGITTARIUS_DATA = {
  name: 'Sagittarius A*',
  category: 'Supermassive Black Hole',
  stats: [
    { label: 'Mass', value: '4 million solar masses' },
    { label: 'Event horizon diameter', value: '~24 million km' },
    { label: 'Distance from Earth', value: '26,000 light years' },
    { label: 'Location', value: 'Centre of Milky Way' },
    { label: 'First imaged', value: 'May 12, 2022' },
    { label: 'Radio source discovery', value: '1974' },
  ],
  about: `Sagittarius A* is the supermassive black hole at the very centre of our Milky Way galaxy. With a mass 4 million times that of our Sun compressed into a region smaller than our Solar System, it is one of the most extreme objects in the known universe. Despite its immense mass it is relatively quiet — consuming very little material compared to active galactic nuclei in other galaxies.`,
  facts: [
    `In 2022 the Event Horizon Telescope captured the first direct image of Sagittarius A* — humanity's first look at our own galaxy's central black hole.`,
    `The star S2 orbits Sagittarius A* at up to 3% the speed of light — among the fastest known stellar orbits.`,
    `Despite being 4 million solar masses, Sagittarius A* is unusually dim and quiet for a black hole of its size.`,
  ],
  ehtNote: `The 2022 EHT image showed a glowing ring of hot gas with a dark central shadow — the black hole's silhouette. The image required radio telescopes on multiple continents working simultaneously as an Earth-sized instrument.`,
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
      <div
        className="fixed inset-0 z-[39]"
        onClick={onClose}
      />
      <div
        className="fixed right-4 z-40 flex flex-col"
        style={{
          top: '220px',
          width: 360,
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: '85vh',
          background: 'rgba(10,10,26,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(79,195,247,0.2)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(10,10,26,0.97)',
            borderBottom: '1px solid rgba(79,195,247,0.08)',
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#ffd54f',
              margin: 0,
              letterSpacing: '0.06em',
            }}>
              Sagittarius A*
            </h2>
            <span style={{
              display: 'inline-block',
              marginTop: 6,
              padding: '3px 10px',
              background: 'rgba(220,80,0,0.15)',
              border: '1px solid rgba(220,80,0,0.3)',
              borderRadius: 20,
              color: '#ff7722',
              fontSize: 11,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>
              SUPERMASSIVE BLACK HOLE
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 20,
            border: '1px solid rgba(255,140,0,0.15)',
          }}>
            <BlackHoleCanvas />
            <p style={{
              textAlign: 'center',
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              padding: '6px 0',
              margin: 0,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.06em',
            }}>
              SIMULATED · BASED ON 2022 EHT IMAGE
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 12px',
              marginBottom: 20,
            }}
          >
            {SAGITTARIUS_DATA.stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 3, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.06em' }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: '#e0e0e0', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 20,
            fontFamily: 'Inter, sans-serif',
          }}>
            {SAGITTARIUS_DATA.about}
          </p>

          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SAGITTARIUS_DATA.facts.map((fact, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(79,195,247,0.04)',
                  border: '1px solid rgba(79,195,247,0.1)',
                  borderRadius: 8,
                }}
              >
                <div style={{ color: '#4fc3f7', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  {fact}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px 16px',
            background: 'rgba(255,140,0,0.05)',
            border: '1px solid rgba(255,140,0,0.25)',
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                padding: '2px 8px',
                background: 'rgba(255,140,0,0.2)',
                border: '1px solid rgba(255,140,0,0.4)',
                borderRadius: 12,
                color: '#ff9933',
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '0.08em',
              }}>
                FIRST IMAGE 2022
              </span>
            </div>
            <p style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: 'rgba(255,220,150,0.8)',
              margin: 0,
              fontFamily: 'Inter, sans-serif',
            }}>
              {SAGITTARIUS_DATA.ehtNote}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => { navigate('/ask'); onClose(); }}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: 'rgba(255,213,79,0.08)',
                border: '1px solid rgba(255,213,79,0.25)',
                borderRadius: 10,
                color: '#ffd54f',
                fontSize: 13,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '0.02em',
              }}
            >
              Ask about Sagittarius A* →
            </button>
            <button
              onClick={() => { navigate('/blackholes'); onClose(); }}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: 'rgba(255,80,0,0.06)',
                border: '1px solid rgba(255,80,0,0.2)',
                borderRadius: 10,
                color: 'rgba(255,150,80,0.85)',
                fontSize: 13,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '0.02em',
              }}
            >
              View Black Holes &amp; Relativity →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
