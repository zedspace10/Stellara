import { useEffect, useRef, useState, useCallback } from 'react';

const SCALE_OBJECTS = [
  {
    id: 'planck',
    name: 'Planck Length',
    size: 1.6e-35,
    sizeLabel: '1.6 × 10⁻³⁵ metres',
    category: 'Quantum',
    colour: '#ffffff',
    renderStyle: 'quantum',
    displayRadius: 4,
    description: 'The smallest meaningful unit of space. Below this our understanding of physics breaks down completely.',
    fact: 'At this scale space itself becomes uncertain — foamy and undefined.',
    comparison: '10²⁰ times smaller than a proton',
  },
  {
    id: 'proton',
    name: 'Proton',
    size: 1e-15,
    sizeLabel: '10⁻¹⁵ metres',
    category: 'Quantum',
    colour: '#ff8833',
    renderStyle: 'particle',
    displayRadius: 18,
    description: 'The nucleus of a hydrogen atom. Made of three quarks held together by the strong nuclear force.',
    fact: 'If a proton were the size of a football stadium, an electron orbit would extend 30 kilometres.',
    comparison: '100,000 times smaller than an atom',
  },
  {
    id: 'atom',
    name: 'Hydrogen Atom',
    size: 5.3e-11,
    sizeLabel: '5.3 × 10⁻¹¹ metres',
    category: 'Atomic',
    colour: '#4488ff',
    renderStyle: 'atom',
    displayRadius: 35,
    description: 'The simplest atom — one proton, one electron. The most abundant element in the universe.',
    fact: 'Atoms are 99.9999% empty space. If an atom were a football stadium the nucleus would be a marble at the centre.',
    comparison: '1 million times smaller than a human hair',
  },
  {
    id: 'dna',
    name: 'DNA Double Helix',
    size: 2e-9,
    sizeLabel: '2 nanometres wide',
    category: 'Molecular',
    colour: '#44ffaa',
    renderStyle: 'molecular',
    displayRadius: 55,
    description: 'The molecule that carries the genetic instructions for all known life.',
    fact: 'If your DNA were uncoiled it would stretch from Earth to the Sun and back 600 times.',
    comparison: '50,000 times thinner than a human hair',
  },
  {
    id: 'redbloodcell',
    name: 'Red Blood Cell',
    size: 8e-6,
    sizeLabel: '8 micrometres',
    category: 'Cellular',
    colour: '#cc2200',
    renderStyle: 'cell',
    displayRadius: 75,
    description: 'The cell that carries oxygen through your blood. Its biconcave shape maximises surface area.',
    fact: 'Your blood contains 25 trillion red blood cells. Each lives for about 120 days.',
    comparison: '10 times smaller than a human hair width',
  },
  {
    id: 'hair',
    name: 'Human Hair',
    size: 7e-5,
    sizeLabel: '70 micrometres',
    category: 'Human',
    colour: '#c8a060',
    renderStyle: 'standard',
    displayRadius: 95,
    description: 'The traditional unit of barely visible. About 70 micrometres across.',
    fact: 'A human hair is roughly 1,000 times wider than a wavelength of visible light.',
    comparison: '25,000 hairs side by side = 1 metre',
  },
  {
    id: 'human',
    name: 'A Human Being',
    size: 1.7,
    sizeLabel: '1.7 metres',
    category: 'Human',
    colour: '#ffffff',
    renderStyle: 'anchor',
    displayRadius: 120,
    description: 'You. Roughly halfway between the Planck length and the observable universe on a logarithmic scale.',
    fact: 'You are made of approximately 7 × 10²⁷ atoms — each one mostly empty space.',
    comparison: 'You are here',
    isAnchor: true,
  },
  {
    id: 'eiffeltower',
    name: 'Eiffel Tower',
    size: 330,
    sizeLabel: '330 metres',
    category: 'Geographical',
    colour: '#c8a040',
    renderStyle: 'standard',
    displayRadius: 150,
    description: 'Built in 1889, it was the tallest structure in the world for 41 years.',
    fact: 'The Eiffel Tower grows by up to 15cm in summer as the iron expands in heat.',
    comparison: '194 humans stacked',
  },
  {
    id: 'everest',
    name: 'Mount Everest',
    size: 8849,
    sizeLabel: '8,849 metres',
    category: 'Geographical',
    colour: '#aaccdd',
    renderStyle: 'standard',
    displayRadius: 175,
    description: 'The highest point on Earth above sea level. Its summit is in the jet stream.',
    fact: 'Everest grows about 4mm per year as the Indian tectonic plate pushes into Asia.',
    comparison: '5,205 humans stacked',
  },
  {
    id: 'earth',
    name: 'Earth',
    size: 1.27e7,
    sizeLabel: '12,742 km diameter',
    category: 'Solar System',
    colour: '#1a6bb5',
    renderStyle: 'planet',
    displayRadius: 210,
    description: 'Our home. The only known planet with life. A pale blue dot in the vastness of space.',
    fact: 'The atmosphere that makes all life possible is proportionally thinner than the skin of an apple.',
    comparison: '7.5 million humans stacked',
  },
  {
    id: 'moon',
    name: 'The Moon',
    size: 3.47e6,
    sizeLabel: '3,474 km diameter',
    category: 'Solar System',
    colour: '#888888',
    renderStyle: 'moon',
    displayRadius: 185,
    description: "Earth's only natural satellite. The furthest humans have ever travelled.",
    fact: 'The Moon is moving away from Earth at 3.8cm per year. It was 15x closer when it formed.',
    comparison: 'All 7 planets fit between Earth and Moon',
  },
  {
    id: 'sun',
    name: 'The Sun',
    size: 1.39e9,
    sizeLabel: '1,392,700 km diameter',
    category: 'Solar System',
    colour: '#fff3b0',
    renderStyle: 'star',
    displayRadius: 240,
    description: 'Our star. A nearly perfect sphere of hot plasma, 4.6 billion years old.',
    fact: "1.3 million Earths could fit inside the Sun. It contains 99.8% of our solar system's mass.",
    comparison: '109 Earths side by side',
  },
  {
    id: 'solarsystem',
    name: 'Solar System',
    size: 9e12,
    sizeLabel: '~60 billion km across',
    category: 'Solar System',
    colour: '#ffdd88',
    renderStyle: 'system',
    displayRadius: 260,
    description: 'Our cosmic neighbourhood — the Sun and everything bound to it by gravity.',
    fact: "Voyager 1, launched in 1977, is only just beyond the solar system's edge after 47 years.",
    comparison: '107 light minutes across',
  },
  {
    id: 'lightyear',
    name: 'One Light Year',
    size: 9.46e15,
    sizeLabel: '9.46 trillion km',
    category: 'Stellar',
    colour: '#ffffff',
    renderStyle: 'lightspeed',
    displayRadius: 270,
    description: 'The distance light travels in one year at 300,000 km per second.',
    fact: 'The nearest star, Proxima Centauri, is 4.24 light years away. At Voyager speed: 73,000 years.',
    comparison: '63,241 times the Earth-Sun distance',
  },
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    size: 4e16,
    sizeLabel: '4.24 light years away',
    category: 'Stellar',
    colour: '#ff6644',
    renderStyle: 'star',
    displayRadius: 265,
    description: 'The nearest star to our Sun. A red dwarf with at least one rocky planet in its habitable zone.',
    fact: 'Even at the speed of light it would take 4.24 years to reach Proxima Centauri.',
    comparison: '268,000 times Earth-Sun distance',
  },
  {
    id: 'milkyway',
    name: 'The Milky Way',
    size: 9.46e20,
    sizeLabel: '100,000 light years across',
    category: 'Galactic',
    colour: '#9966ff',
    renderStyle: 'galaxy',
    displayRadius: 285,
    description: 'Our galaxy. A barred spiral containing 200–400 billion stars.',
    fact: 'The Milky Way has been rotating for 13 billion years. Our Sun orbits it every 225 million years.',
    comparison: '100,000 light years — light takes that long to cross it',
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    size: 2.2e22,
    sizeLabel: '2.5 million light years away',
    category: 'Galactic',
    colour: '#aabbff',
    renderStyle: 'galaxy',
    displayRadius: 290,
    description: 'The nearest large galaxy. On a collision course with the Milky Way.',
    fact: 'In 4.5 billion years Andromeda will merge with the Milky Way. Stars are so spread out virtually none will collide.',
    comparison: '25 times wider than the Milky Way',
  },
  {
    id: 'universe',
    name: 'Observable Universe',
    size: 8.8e26,
    sizeLabel: '93 billion light years across',
    category: 'Cosmic',
    colour: '#ffd54f',
    renderStyle: 'universe',
    displayRadius: 300,
    description: 'Everything we can see. The universe continues beyond this — we simply cannot observe it yet.',
    fact: 'Contains approximately 2 trillion galaxies. You are made of the same stuff as all of it.',
    comparison: '2 trillion galaxies, each with billions of stars',
  },
];

type ScaleObject = (typeof SCALE_OBJECTS)[0] & { isAnchor?: boolean };

// Background colour per scale zone (by object index)
function getZoneBg(idx: number): [number, number, number] {
  if (idx <= 1) return [0, 0, 0];          // quantum: pure black
  if (idx <= 5) return [0, 0, 5];          // atomic/molecular: deep navy tint
  if (idx <= 7) return [10, 10, 26];       // human scale: STELLARA dark
  if (idx <= 12) return [5, 5, 16];        // geographical/solar: deep space
  return [0, 0, 0];                        // stellar/galactic/cosmic: pure black
}

function lerpBg(a: [number,number,number], b: [number,number,number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function renderObject(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  obj: ScaleObject,
  w: number,
  h: number,
  t: number,
) {
  const r = obj.displayRadius;
  const col = obj.colour;

  switch (obj.renderStyle) {
    case 'quantum': {
      const flicker = 0.4 + 0.6 * Math.sin(t * 0.008);
      // Vast uncertainty halo — the emptiness IS the visual
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.35);
      halo.addColorStop(0, `rgba(180,210,255,${flicker * 0.18})`);
      halo.addColorStop(0.5, `rgba(100,140,220,${flicker * 0.06})`);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      // Soft inner glow
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 12);
      inner.addColorStop(0, `rgba(220,235,255,${flicker * 0.4})`);
      inner.addColorStop(1, 'transparent');
      ctx.fillStyle = inner;
      ctx.fillRect(0, 0, w, h);
      // The point itself
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${flicker})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#aaccff';
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }

    case 'particle': {
      // Warm orange-gold sphere with quark suggestion
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.5);
      glow.addColorStop(0, '#ff883344');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#ffcc88');
      grad.addColorStop(1, '#cc5500');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 3 quarks inside (red, green, blue)
      const quarkCols = ['#ff4444', '#44ff44', '#4488ff'];
      const quarkR = r * 0.22;
      const qAngles = [Math.PI * 0.5, Math.PI * 1.17, Math.PI * 1.83];
      const qDist = r * 0.48;
      const quarkPos = qAngles.map(a => ({ x: cx + Math.cos(a) * qDist, y: cy + Math.sin(a) * qDist }));

      // Gluon lines
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        const a = quarkPos[i];
        const b = quarkPos[(i + 1) % 3];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      quarkPos.forEach((qp, i) => {
        ctx.beginPath();
        ctx.arc(qp.x, qp.y, quarkR, 0, Math.PI * 2);
        ctx.fillStyle = quarkCols[i];
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      break;
    }

    case 'atom': {
      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
      glow.addColorStop(0, '#4488ff33');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Nucleus
      const nucR = r * 0.28;
      const nucGrad = ctx.createRadialGradient(cx - nucR * 0.3, cy - nucR * 0.3, 0, cx, cy, nucR);
      nucGrad.addColorStop(0, '#ffffff');
      nucGrad.addColorStop(0.4, '#88aaff');
      nucGrad.addColorStop(1, '#2244cc');
      ctx.beginPath();
      ctx.arc(cx, cy, nucR, 0, Math.PI * 2);
      ctx.fillStyle = nucGrad;
      ctx.fill();

      // Orbital rings
      const orbits = [{ rx: r * 0.92, ry: r * 0.35, angle: 0 }, { rx: r * 0.92, ry: r * 0.35, angle: Math.PI / 3 }, { rx: r * 0.92, ry: r * 0.35, angle: -Math.PI / 3 }];
      orbits.forEach(orb => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(orb.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100,160,255,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // Electron dot (animated position)
      const eAngle = (t * 0.004) % (Math.PI * 2);
      const ex = cx + Math.cos(eAngle) * r * 0.92;
      const ey = cy + Math.sin(eAngle) * r * 0.35;
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#88ccff';
      ctx.fill();
      break;
    }

    case 'molecular': {
      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      glow.addColorStop(0, '#44ffaa33');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Main sphere
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      grad.addColorStop(0, '#aaffdd');
      grad.addColorStop(0.4, col);
      grad.addColorStop(1, '#116644');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Double helix suggestion on surface (pairs of dots)
      const helixSteps = 8;
      for (let i = 0; i < helixSteps; i++) {
        const frac = i / helixSteps;
        const yOff = (frac - 0.5) * r * 1.6;
        const xAmp = Math.sqrt(Math.max(0, r * r - yOff * yOff)) * 0.75;
        const phase = frac * Math.PI * 3;
        const x1 = cx + Math.cos(phase) * xAmp;
        const x2 = cx + Math.cos(phase + Math.PI) * xAmp;
        const y = cy + yOff;
        ctx.beginPath(); ctx.arc(x1, y, 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,220,0.7)'; ctx.fill();
        ctx.beginPath(); ctx.arc(x2, y, 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,255,200,0.7)'; ctx.fill();
      }
      break;
    }

    case 'cell': {
      // Biconcave disc (ellipse, squashed)
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
      glow.addColorStop(0, '#cc220033');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.62);
      const cGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
      cGrad.addColorStop(0, '#ff9977');
      cGrad.addColorStop(0.3, col);
      cGrad.addColorStop(0.75, '#770000');
      cGrad.addColorStop(1, '#330000');
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = cGrad;
      ctx.fill();
      // Biconcave indent
      const indent = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.42);
      indent.addColorStop(0, 'rgba(0,0,0,0.45)');
      indent.addColorStop(1, 'transparent');
      ctx.fillStyle = indent;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'anchor': {
      // Standard sphere + gold dashed ring
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      glow.addColorStop(0, 'rgba(255,255,255,0.12)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#dddddd');
      grad.addColorStop(1, '#888888');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Gold dashed ring
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // "You are here" text beneath
      ctx.fillStyle = 'rgba(255,213,79,0.85)';
      ctx.font = 'italic 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('You are here', cx, cy + r + 34);
      break;
    }

    case 'planet': {
      // Earth: blue with patches + atmosphere glow
      const atmR = r * 1.12;
      const atm = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, atmR);
      atm.addColorStop(0, 'rgba(80,160,255,0.25)');
      atm.addColorStop(1, 'transparent');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, atmR, 0, Math.PI * 2);
      ctx.fill();

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      glow.addColorStop(0, '#1a6bb544');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r);
      grad.addColorStop(0, '#5599ee');
      grad.addColorStop(0.3, col);
      grad.addColorStop(0.7, '#0a3a7a');
      grad.addColorStop(1, '#041a40');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Green-brown land patches
      ctx.save();
      ctx.clip();
      [
        { x: cx + r * 0.1, y: cy - r * 0.3, rx: r * 0.32, ry: r * 0.22 },
        { x: cx - r * 0.35, y: cy + r * 0.15, rx: r * 0.28, ry: r * 0.18 },
        { x: cx + r * 0.5, y: cy + r * 0.35, rx: r * 0.2, ry: r * 0.14 },
      ].forEach(patch => {
        ctx.beginPath();
        ctx.ellipse(patch.x, patch.y, patch.rx, patch.ry, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50,120,50,0.55)';
        ctx.fill();
      });
      // Cloud wisps
      [
        { x: cx - r * 0.2, y: cy - r * 0.5, rx: r * 0.35, ry: r * 0.07 },
        { x: cx + r * 0.3, y: cy + 0, rx: r * 0.28, ry: r * 0.06 },
      ].forEach(cloud => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      });
      ctx.restore();
      break;
    }

    case 'moon': {
      // Grey cratered sphere, no atmosphere
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
      glow.addColorStop(0, 'rgba(180,180,180,0.1)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r);
      grad.addColorStop(0, '#cccccc');
      grad.addColorStop(0.4, col);
      grad.addColorStop(1, '#333333');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Craters
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      [
        { x: cx + r * 0.3, y: cy - r * 0.25, cr: r * 0.14 },
        { x: cx - r * 0.4, y: cy + r * 0.3, cr: r * 0.11 },
        { x: cx + r * 0.1, y: cy + r * 0.45, cr: r * 0.08 },
        { x: cx - r * 0.15, y: cy - r * 0.5, cr: r * 0.09 },
      ].forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.cr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,200,200,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();
      break;
    }

    case 'star': {
      // Multiple glow passes + corona
      [[3.5, 0.03], [2.5, 0.07], [1.8, 0.14], [1.2, 0.35], [1.0, 1.0]].forEach(([mult, alpha]) => {
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * mult);
        grd.addColorStop(0, '#ffffff');
        grd.addColorStop(0.2, col);
        grd.addColorStop(0.6, col + '99');
        grd.addColorStop(1, 'transparent');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r * mult, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Corona spikes
      const spikeCount = 12;
      for (let i = 0; i < spikeCount; i++) {
        const ang = (i / spikeCount) * Math.PI * 2 + t * 0.0003;
        const len = r * (1.3 + 0.2 * Math.sin(t * 0.001 + i));
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r * 1.0, cy + Math.sin(ang) * r * 1.0);
        ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        ctx.strokeStyle = col + '55';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }

    case 'system': {
      // Central sun + orbit rings + planet dots
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
      glow.addColorStop(0, '#ffdd8822');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Orbit rings
      const orbitRadii = [0.15, 0.24, 0.35, 0.48, 0.63, 0.76, 0.88, 0.97].map(f => f * r);
      const planetCols = ['#aaaaaa','#ffcc88','#4488ff','#ff6644','#ffaa44','#c8a080','#aabbff','#88aacc'];
      orbitRadii.forEach((or, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, or, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,220,120,0.15)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Planet dot
        const pAngle = (i * 2.4 + t * 0.0004 * (1 / (i + 1)));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(pAngle) * or, cy + Math.sin(pAngle) * or, Math.max(2, r * 0.03), 0, Math.PI * 2);
        ctx.fillStyle = planetCols[i];
        ctx.fill();
      });

      // Central sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.1);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(1, '#ffdd88');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();
      break;
    }

    case 'lightspeed': {
      // Horizontal line + animated light pulse
      const lineY = cy;
      const lineX1 = w * 0.05;
      const lineX2 = w * 0.95;

      // Background glow along line
      const lineGlow = ctx.createLinearGradient(lineX1, lineY, lineX2, lineY);
      lineGlow.addColorStop(0, 'transparent');
      lineGlow.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      lineGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lineGlow;
      ctx.fillRect(lineX1, lineY - 20, lineX2 - lineX1, 40);

      // The line itself
      ctx.beginPath();
      ctx.moveTo(lineX1, lineY);
      ctx.lineTo(lineX2, lineY);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Endpoint markers
      [lineX1, lineX2].forEach(lx => {
        ctx.beginPath();
        ctx.arc(lx, lineY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      });

      // Animated light pulse
      const pulseT = (t * 0.00035) % 1;
      const px = lineX1 + (lineX2 - lineX1) * pulseT;
      const pulseGlow = ctx.createRadialGradient(px, lineY, 0, px, lineY, 40);
      pulseGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
      pulseGlow.addColorStop(0.3, 'rgba(180,210,255,0.5)');
      pulseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = pulseGlow;
      ctx.fillRect(px - 40, lineY - 40, 80, 80);

      // Distance label
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('0', lineX1 + 4, lineY + 18);
      ctx.textAlign = 'right';
      ctx.fillText('9.46 trillion km →', lineX2 - 4, lineY + 18);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Speed of light: 299,792 km/s', cx, lineY - 14);
      break;
    }

    case 'galaxy': {
      // Flattened disc + central core + star scatter
      const isAndromeda = obj.id === 'andromeda';
      const discAngle = isAndromeda ? 0.55 : 0;

      // Outer disc glow
      const discGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
      discGlow.addColorStop(0, col + '33');
      discGlow.addColorStop(0.5, col + '11');
      discGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = discGlow;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(discAngle);
      ctx.scale(1, 0.38);

      const disc = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      disc.addColorStop(0, col + 'cc');
      disc.addColorStop(0.35, col + '66');
      disc.addColorStop(0.7, col + '22');
      disc.addColorStop(1, 'transparent');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms (simple suggestion)
      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();
        const armOff = arm * Math.PI;
        for (let s = 0; s <= 60; s++) {
          const frac = s / 60;
          const angle = frac * Math.PI * 2.5 + armOff;
          const ar = frac * r * 0.95;
          const ax = Math.cos(angle) * ar;
          const ay = Math.sin(angle) * ar * 0.38;
          if (s === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        }
        ctx.strokeStyle = col + '55';
        ctx.lineWidth = r * 0.12;
        ctx.stroke();
      }

      ctx.restore();

      // Central bright core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.22);
      core.addColorStop(0, '#fffbe8');
      core.addColorStop(0.5, col + 'cc');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Star scatter
      for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * Math.PI * 2 + (i * 0.618);
        const dist = ((i * 0.382) % 1) * r * 0.92;
        const sx = cx + Math.cos(ang) * dist;
        const sy = cy + Math.sin(ang) * dist * 0.38;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.07})`;
        ctx.fill();
      }
      break;
    }

    case 'universe': {
      // Cosmic web filaments + "You" pulse at centre
      const bigGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
      bigGlow.addColorStop(0, col + '22');
      bigGlow.addColorStop(0.5, col + '0a');
      bigGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bigGlow;
      ctx.fillRect(0, 0, w, h);

      // Web filaments
      const nodes: {x: number, y: number}[] = [];
      const nodeCount = 22;
      for (let i = 0; i < nodeCount; i++) {
        const ang = (i / nodeCount) * Math.PI * 2 + (i * 0.41);
        const dist = (0.3 + ((i * 0.618) % 0.65)) * r;
        nodes.push({ x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist });
      }
      // Draw connections between nearby nodes
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < r * 0.55) {
            const alpha = (1 - d / (r * 0.55)) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // Node dots
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = col + 'aa';
        ctx.fill();
      });

      // Central "You" pulse
      const pulseFrac = (Math.sin(t * 0.002) + 1) / 2;
      const pulseR = 6 + pulseFrac * 8;
      const pulseGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 3);
      pulseGlow.addColorStop(0, `rgba(255,213,79,${0.6 + pulseFrac * 0.4})`);
      pulseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = pulseGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = col;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('You', cx, cy - pulseR * 3 - 4);
      break;
    }

    default: {
      // Standard sphere with lighting + glow
      const glowGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
      glowGrd.addColorStop(0, col + '33');
      glowGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrd;
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.32, 0, cx, cy, r);
      grad.addColorStop(0, '#ffffff99');
      grad.addColorStop(0.15, col + 'ee');
      grad.addColorStop(0.7, col);
      grad.addColorStop(1, col + '66');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

export default function ScaleOfUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(6);
  const [selectedObject, setSelectedObject] = useState<ScaleObject | null>(null);
  const [showCard, setShowCard] = useState(false);
  const currentIndexRef = useRef(6);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, idx: number, t: number) => {
      const obj = SCALE_OBJECTS[idx] as ScaleObject;

      // Background: lerp between zone colours
      const bgA = getZoneBg(idx);
      const bgB = getZoneBg(Math.min(idx + 1, SCALE_OBJECTS.length - 1));
      ctx.fillStyle = lerpBg(bgA, bgB, 0.5);
      ctx.fillRect(0, 0, w, h);

      // Stars — sparser for non-cosmic scales, skip for quantum
      ctx.save();
      const starCount = idx <= 1 ? 0 : idx <= 5 ? 60 : 200;
      for (let i = 0; i < starCount; i++) {
        const sx = ((i * 137.508) % 1) * w;
        const sy = ((i * 251.317) % 1) * h;
        const ss = i % 3 === 0 ? 1.5 : i % 3 === 1 ? 1 : 0.5;
        const op = 0.2 + (i % 10) * 0.05;
        ctx.beginPath();
        ctx.arc(sx, sy, ss, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
      ctx.restore();

      const cx = w / 2;
      const cy = h / 2;

      // Progress bar
      const barW = w * 0.7;
      const barX = (w - barW) / 2;
      const barY = h - 80;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(barX, barY - 8, barW, 16, 8);
      ctx.fill();

      const progress = idx / (SCALE_OBJECTS.length - 1);
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.roundRect(barX, barY - 8, barW * progress, 16, 8);
      ctx.fill();

      SCALE_OBJECTS.forEach((_, i) => {
        const x = barX + (i / (SCALE_OBJECTS.length - 1)) * barW;
        ctx.beginPath();
        ctx.arc(x, barY, i === idx ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i === idx ? '#ffd54f' : 'rgba(255,255,255,0.3)';
        ctx.fill();
      });

      // Draw the object
      renderObject(ctx, cx, cy, obj, w, h, t);

      // Category badge
      ctx.fillStyle = 'rgba(10,10,26,0.8)';
      const badgeW = 130;
      ctx.beginPath();
      ctx.roundRect(cx - badgeW / 2, 40, badgeW, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#4fc3f7';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.category.toUpperCase(), cx, 59);

      // Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, cx, h * 0.13);

      // Size label
      ctx.fillStyle = '#ffd54f';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(obj.sizeLabel, cx, h * 0.13 + 30);

      // Description (word-wrapped)
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '14px Inter, sans-serif';
      const words = obj.description.split(' ');
      let line = '';
      let lineY = h * 0.82;
      const maxLineWidth = w * 0.68;
      words.forEach(word => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxLineWidth && line !== '') {
          ctx.fillText(line.trim(), cx, lineY);
          line = word + ' ';
          lineY += 22;
        } else {
          line = test;
        }
      });
      ctx.fillText(line.trim(), cx, lineY);

      // Nav hints
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.font = '12px Inter, sans-serif';
      if (idx > 0) ctx.fillText('← Scroll down to go smaller', cx, h - 30);
      if (idx < SCALE_OBJECTS.length - 1) ctx.fillText('Scroll up to go larger →', cx, h - 12);

      // Anchor extra message
      if (obj.isAnchor) {
        ctx.fillStyle = 'rgba(255,213,79,0.55)';
        ctx.font = 'italic 13px Inter, sans-serif';
        ctx.fillText(
          'Roughly halfway between the smallest and largest things that exist.',
          cx, h * 0.72,
        );
      }
    },
    [],
  );

  const initCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const getCtx = () => {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const r = canvas.getBoundingClientRect();
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w: r.width, h: r.height };
      };

      // Animation loop
      let rafId: number;
      const startTime = performance.now();
      const loop = () => {
        const { ctx, w, h } = getCtx();
        if (ctx && w > 0 && h > 0) {
          drawFrame(ctx, w, h, currentIndexRef.current, performance.now() - startTime);
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -1 : 1;
        const next = Math.max(0, Math.min(SCALE_OBJECTS.length - 1, currentIndexRef.current + dir));
        if (next !== currentIndexRef.current) {
          currentIndexRef.current = next;
          setCurrentIndex(next);
        }
      };

      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const diff = touchStartY - e.touches[0].clientY;
        if (Math.abs(diff) < 30) return;
        const dir = diff > 0 ? 1 : -1;
        const next = Math.max(0, Math.min(SCALE_OBJECTS.length - 1, currentIndexRef.current + dir));
        touchStartY = e.touches[0].clientY;
        if (next !== currentIndexRef.current) {
          currentIndexRef.current = next;
          setCurrentIndex(next);
        }
      };

      const handleClick = () => {
        setSelectedObject(SCALE_OBJECTS[currentIndexRef.current] as ScaleObject);
        setShowCard(true);
      };

      const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const r = canvas.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          canvas.width = r.width * dpr;
          canvas.height = r.height * dpr;
        }
      };

      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('click', handleClick);
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(rafId);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
      };
    },
    [drawFrame],
  );

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let innerCleanup: (() => void) | undefined;
    let initialised = false;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = entry.contentRect.width * dpr;
        canvas.height = entry.contentRect.height * dpr;
        if (!initialised) {
          initialised = true;
          innerCleanup = initCanvas(canvas) || undefined;
        }
      }
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      innerCleanup?.();
    };
  }, [started, initCanvas]);

  if (!started) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#000000',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 150 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 137.5) % 100}%`,
              top: `${(i * 251.3) % 100}%`,
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: 0.3 + (i % 5) * 0.1,
            }} />
          ))}
        </div>

        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(24px, 5vw, 48px)',
          color: '#ffffff',
          letterSpacing: '0.15em',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          SCALE OF THE UNIVERSE
        </h1>

        <p style={{
          color: '#ffd54f', letterSpacing: '0.3em', fontSize: 12,
          marginBottom: 16, textTransform: 'uppercase',
        }}>
          FROM THE PLANCK LENGTH TO THE OBSERVABLE UNIVERSE
        </p>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 48,
          textAlign: 'center', maxWidth: 400, lineHeight: 1.6,
        }}>
          62 orders of magnitude. Scroll or swipe to travel through the scales of existence.
          Tap any object to learn more.
        </p>

        <button
          onClick={() => setStarted(true)}
          style={{
            padding: '16px 48px', background: 'transparent',
            border: '1px solid #ffd54f', borderRadius: 8, color: '#ffd54f',
            fontFamily: 'Orbitron, monospace', fontSize: 14,
            letterSpacing: '0.2em', cursor: 'pointer', transition: 'all 300ms',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,213,79,0.1)'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; }}
        >
          BEGIN EXPLORATION
        </button>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 32 }}>
          Starts at human scale · 18 objects across 62 orders of magnitude
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
      />

      <div style={{
        position: 'absolute', top: 16, right: 16,
        color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: 12,
      }}>
        {currentIndex + 1} / {SCALE_OBJECTS.length}
      </div>

      <button
        onClick={() => setStarted(false)}
        style={{
          position: 'absolute', top: 16, left: 16,
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '8px 16px',
          fontFamily: 'Inter, sans-serif', fontSize: 12, cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      {showCard && selectedObject && (
        <div
          onClick={() => setShowCard(false)}
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(79,195,247,0.2)', borderRadius: 16,
              padding: 24, maxWidth: 480, width: '100%', maxHeight: '70vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{
                  fontSize: 10, color: '#4fc3f7', letterSpacing: '0.2em',
                  textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
                }}>
                  {selectedObject.category}
                </span>
                <h2 style={{
                  fontFamily: 'Orbitron, monospace',
                  color: selectedObject.colour, fontSize: 22, margin: '4px 0',
                }}>
                  {selectedObject.name}
                </h2>
                <p style={{ color: '#ffd54f', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                  {selectedObject.sizeLabel}
                </p>
              </div>
              <button
                onClick={() => setShowCard(false)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', padding: 4,
                }}
              >
                ×
              </button>
            </div>

            <p style={{
              color: '#e0e0e0', fontSize: 14, lineHeight: 1.7,
              fontFamily: 'Inter, sans-serif', marginBottom: 16,
            }}>
              {selectedObject.description}
            </p>

            <div style={{
              background: 'rgba(255,213,79,0.08)', border: '1px solid rgba(255,213,79,0.2)',
              borderRadius: 8, padding: 12, marginBottom: 16,
            }}>
              <p style={{
                color: '#ffd54f', fontSize: 13, fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6, margin: 0,
              }}>
                ✦ {selectedObject.fact}
              </p>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif', margin: 0 }}>
              {selectedObject.comparison}
            </p>

            <button
              onClick={() => setShowCard(false)}
              style={{
                marginTop: 16, padding: '10px 20px', background: 'transparent',
                border: '1px solid rgba(79,195,247,0.3)', borderRadius: 8, color: '#4fc3f7',
                fontFamily: 'Inter, sans-serif', fontSize: 13, cursor: 'pointer', width: '100%',
              }}
            >
              Ask about {selectedObject.name} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
