import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { heliocentric } from "@/lib/ephemeris";
import { SPACECRAFT, spacecraftPosition, Vec3 } from "@/lib/smallbodies";
import {
  Note, Destination, DESTINATIONS, directionOf, notePosition, arrivalOf, headingLabel,
  kmTravelled, bigKm, duration, C_KM_S,
} from "@/lib/notes";

// Following a note on its way to the star it was sent to.
//
// Directions are real: the planets, spacecraft and stars sit where they really are, as seen from
// the note at that moment. Distances are squeezed by powers of ten so the Moon and Andromeda fit in
// one view; things that are close look close, and things that are far look far.

type View = "behind" | "home" | "map";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

const LY_AU = 63241.077;
const YEAR_MS = 365.25 * 86400000;

interface Body {
  id: string;
  name: string;
  kind: "sun" | "planet" | "craft" | "star" | "dest";
  radiusAu: number;
  color: string;
  priority: number;
  pos: (t: number) => Vec3 | null;
}

const PLANETS: [string, string, number, string][] = [
  ["mercury", "Mercury", 1.63e-5, "#B9B2A8"],
  ["venus", "Venus", 4.05e-5, "#F3DDB0"],
  ["earth", "Earth", 4.26e-5, "#8DB6E6"],
  ["mars", "Mars", 2.27e-5, "#E08A6A"],
  ["jupiter", "Jupiter", 4.78e-4, "#E3B98C"],
  ["saturn", "Saturn", 4.03e-4, "#E9D9A6"],
  ["uranus", "Uranus", 1.71e-4, "#BFE6E6"],
  ["neptune", "Neptune", 1.65e-4, "#7FA4E8"],
];

function glowTexture(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.18, `rgba(${rgb},0.85)`);
  gr.addColorStop(0.45, `rgba(${rgb},0.22)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const hexRgb = (h: string) => `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`;

// Heliocentric ecliptic (x, y, z north) to the scene (x, north up, towards the viewer).
const toThree = (v: Vec3) => new THREE.Vector3(v.x, v.z, -v.y);
// Squeeze a distance in au, by powers of ten.
const fromNoteR = (d: number) => Math.max(3, 10 * Math.log10(1 + d / 0.001));
const mapR = (r: number) => 12 * Math.log10(1 + r / 0.05);

export default function NoteFollow({ note, dest }: { note: Note; dest: Destination }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("behind");
  const viewRef = useRef<View>("behind");
  // 0 shows now; up to 1 looks ahead to the day it arrives, spaced by powers of ten.
  const [ahead, setAhead] = useState(0);
  const aheadRef = useRef(0);
  const [now, setNow] = useState(Date.now());

  const arrival = arrivalOf(note, dest);
  const shownAt = (a: number, n: number) => {
    const done = Math.max(1000, n - note.sentAt);
    const total = Math.max(done, arrival - note.sentAt);
    return note.sentAt + done * Math.pow(total / done, a);
  };

  useEffect(() => { aheadRef.current = ahead; }, [ahead]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const bodies = useMemo<Body[]>(() => {
    const list: Body[] = [
      { id: "sun", name: "The Sun", kind: "sun", radiusAu: 0.00465, color: "#FFF1D0", priority: 2, pos: () => ({ x: 0, y: 0, z: 0 }) },
      ...PLANETS.map(([id, name, r, color]) => ({
        id, name, kind: "planet" as const, radiusAu: r, color,
        priority: id === "earth" ? 1 : id === "jupiter" || id === "saturn" ? 4 : 6,
        pos: (t: number) => heliocentric(id, t),
      })),
      ...SPACECRAFT.map((s) => ({
        id: s.id, name: s.name, kind: "craft" as const, radiusAu: 0, color: "#A9C3E0",
        priority: s.id === "voyager-1" ? 3 : 7,
        pos: (t: number) => spacecraftPosition(s, t),
      })),
      ...DESTINATIONS.map((d) => {
        const dir = directionOf(d);
        const r = d.ly * LY_AU;
        return {
          id: d.id, name: d.name, kind: d.id === dest.id ? ("dest" as const) : ("star" as const),
          radiusAu: 0, color: d.id === dest.id ? "#F3DDB0" : "#DCE6F2",
          priority: d.id === dest.id ? 0 : 8,
          pos: () => ({ x: dir.x * r, y: dir.y * r, z: dir.z * r }),
        };
      }),
    ];
    return list;
  }, [dest.id]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const phone = window.innerWidth < 700;
    const renderer = new THREE.WebGLRenderer({ antialias: !phone, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x05070c, 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    const labels = new CSS2DRenderer();
    labels.setSize(el.clientWidth, el.clientHeight);
    labels.domElement.style.cssText = "position:absolute;inset:0;pointer-events:none;";
    el.appendChild(labels.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.01, 3000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;

    // Distant stars all round, for a sense of direction as the view turns.
    {
      const n = 1800;
      const pts = new Float32Array(n * 3);
      let s = 3;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < n; i++) {
        const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, q = Math.sqrt(1 - u * u);
        pts.set([q * Math.cos(a) * 900, u * 900, q * Math.sin(a) * 900], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb0c4, size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.7 })));
    }

    // Every body is a soft point of light, with a label.
    const textures = new Map<string, THREE.Texture>();
    const tex = (c: string) => { if (!textures.has(c)) textures.set(c, glowTexture(hexRgb(c))); return textures.get(c)!; };
    const sprites = bodies.map((b) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(b.color), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      scene.add(sp);
      const div = document.createElement("div");
      div.textContent = b.name;
      div.style.cssText = `font-family:"Instrument Sans",sans-serif;font-size:${b.kind === "dest" ? 13 : 11}px;white-space:nowrap;color:${b.kind === "dest" ? WARM : b.kind === "craft" ? "#A9C3E0" : "rgba(232,236,241,0.8)"};margin-top:-16px;`;
      const label = new CSS2DObject(div);
      sp.add(label);
      return { b, sp, label, div };
    });

    // The note itself.
    const noteSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex("#FFF4DA"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(noteSprite);
    const noteDiv = document.createElement("div");
    noteDiv.textContent = "Your note";
    noteDiv.style.cssText = `font-family:"Instrument Sans",sans-serif;font-size:12px;color:${WARM};white-space:nowrap;margin-top:-18px;`;
    const noteLabel = new CSS2DObject(noteDiv);
    noteSprite.add(noteLabel);

    // The way ahead, from the note to where it is going.
    const pathGeo = new THREE.BufferGeometry();
    const PATH_N = 96;
    pathGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PATH_N * 3), 3));
    const pathDone = new THREE.Line(pathGeo, new THREE.LineBasicMaterial({ color: 0xf3ddb0, transparent: true, opacity: 0.75 }));
    const aheadGeo = new THREE.BufferGeometry();
    aheadGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PATH_N * 3), 3));
    const pathAhead = new THREE.Line(aheadGeo, new THREE.LineDashedMaterial({ color: 0xf3ddb0, transparent: true, opacity: 0.35, dashSize: 0.8, gapSize: 0.8 }));
    scene.add(pathDone, pathAhead);

    // Orbits, for the map.
    const orbits = new THREE.Group();
    PLANETS.forEach(([id]) => {
      const p = heliocentric(id, Date.now());
      if (!p) return;
      const R = mapR(Math.hypot(p.x, p.y, p.z));
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 128; k++) { const a = (k / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R)); }
      orbits.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2a3546, transparent: true, opacity: 0.8 })));
    });
    scene.add(orbits);

    const destDir = toThree(directionOf(dest)).normalize();
    const sideOf = (d: THREE.Vector3) => {
      const up = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      return new THREE.Vector3().crossVectors(d, up).cross(d).normalize();
    };

    let lastView: View | null = null;
    const placeCamera = (v: View, homeDir: THREE.Vector3) => {
      if (v === "map") {
        controls.minDistance = 30;
        controls.maxDistance = 420;
        controls.target.set(0, 0, 0);
        camera.position.set(0, 150, 95);
      } else {
        controls.minDistance = 0.8;
        controls.maxDistance = 10;
        // Look past the note at what it is heading for, or at home, with the note low in the frame.
        const d = v === "behind" ? destDir : homeDir;
        controls.target.copy(d).multiplyScalar(2.2);
        camera.position.copy(d.clone().multiplyScalar(-1.6).add(sideOf(d).multiplyScalar(0.75)));
      }
      controls.update();
    };

    const v3 = new THREE.Vector3();
    const proj = new THREE.Vector3();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const view = viewRef.current;
      const t = shownAt(aheadRef.current, Date.now());
      const N = notePosition(note, dest, t);
      const map = view === "map";

      const homeVec = toThree({ x: -N.x, y: -N.y, z: -N.z });
      const homeDir = homeVec.lengthSq() > 0 ? homeVec.normalize() : destDir.clone().multiplyScalar(-1);
      if (view !== lastView) { placeCamera(view, homeDir); lastView = view; }
      orbits.visible = map;

      // Where each body sits in this view.
      const place = (P: Vec3, out: THREE.Vector3) => {
        if (map) {
          const r = Math.hypot(P.x, P.y, P.z);
          if (r === 0) return out.set(0, 0, 0);
          return out.copy(toThree(P)).normalize().multiplyScalar(mapR(r));
        }
        const rel = { x: P.x - N.x, y: P.y - N.y, z: P.z - N.z };
        const d = Math.hypot(rel.x, rel.y, rel.z);
        return out.copy(toThree(rel)).normalize().multiplyScalar(fromNoteR(d));
      };

      sprites.forEach(({ b, sp }) => {
        const P = b.pos(t);
        sp.visible = !!P;
        if (!P) return;
        place(P, sp.position);
        const d = map ? 0 : Math.hypot(P.x - N.x, P.y - N.y, P.z - N.z);
        let size: number;
        if (map) {
          size = b.kind === "sun" ? 3.2 : b.kind === "dest" ? 2.4 : b.kind === "planet" ? (b.id === "jupiter" || b.id === "saturn" ? 1.5 : 1.1) : 1.0;
        } else {
          // How big it would look from the note, made larger so small things can still be found.
          const R = sp.position.length();
          const real = b.radiusAu > 0 && d > 0 ? (b.radiusAu * 60) / d : 0;
          const least = b.kind === "sun" ? 0.03 : b.kind === "dest" ? 0.035 : b.kind === "planet" ? 0.018 : 0.014;
          size = R * Math.min(0.35, Math.max(least, real));
        }
        sp.scale.setScalar(size);
      });

      if (map) place(N, noteSprite.position); else noteSprite.position.set(0, 0, 0);
      noteSprite.scale.setScalar(map ? 2.2 : 0.3);
      noteLabel.visible = map;

      // The path: travelled so far, then the rest of the way, both spaced by powers of ten.
      const done = kmTravelled(note.sentAt, t) / 149597870.7;
      const total = dest.ly * LY_AU;
      const pa = pathGeo.attributes.position.array as Float32Array;
      const qa = aheadGeo.attributes.position.array as Float32Array;
      const dir = directionOf(dest);
      const E = notePosition(note, dest, note.sentAt);
      for (let k = 0; k < PATH_N; k++) {
        const f = k / (PATH_N - 1);
        const r1 = f === 0 ? 0 : Math.min(done, 1e-4 * Math.pow(Math.max(done, 1e-4) / 1e-4, f));
        const r2 = done + (total - done) * (Math.pow(10, f * 4) - 1) / 9999;
        place({ x: E.x + dir.x * r1, y: E.y + dir.y * r1, z: E.z + dir.z * r1 }, v3);
        pa.set([v3.x, v3.y, v3.z], k * 3);
        place({ x: E.x + dir.x * r2, y: E.y + dir.y * r2, z: E.z + dir.z * r2 }, v3);
        qa.set([v3.x, v3.y, v3.z], k * 3);
      }
      pathGeo.attributes.position.needsUpdate = true;
      aheadGeo.attributes.position.needsUpdate = true;
      pathGeo.computeBoundingSphere();
      aheadGeo.computeBoundingSphere();
      pathAhead.computeLineDistances();
      pathDone.visible = map;

      controls.update();
      renderer.render(scene, camera);

      // Keep labels from piling up: the most important ones win, the rest wait their turn.
      const w = el.clientWidth, h = el.clientHeight;
      // The tracker box in the top corner is off limits.
      const taken: [number, number, number, number][] = [[0, 0, 200, 70]];
      [...sprites].sort((a, b) => a.b.priority - b.b.priority).forEach(({ sp, label, div }) => {
        if (!sp.visible) { label.visible = false; return; }
        proj.copy(sp.position).project(camera);
        if (proj.z > 1 || Math.abs(proj.x) > 1.1 || Math.abs(proj.y) > 1.1) { label.visible = false; return; }
        const x = (proj.x + 1) * w / 2, y = (1 - proj.y) * h / 2;
        const half = (div.textContent!.length * 6.2) / 2 + 4;
        const clash = taken.some((r) => x - half < r[2] && x + half > r[0] && y - 22 < r[3] && y - 6 > r[1]);
        label.visible = !clash;
        if (!clash) taken.push([x - half, y - 22, x + half, y - 6]);
      });
      labels.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      labels.setSize(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      textures.forEach((t) => t.dispose());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
      el.innerHTML = "";
    };
    // shownAt only depends on the note and destination, which are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.sentAt, dest.id, bodies]);

  const switchView = (v: View) => { viewRef.current = v; setView(v); };

  // What a tracker would show.
  const t = shownAt(ahead, now);
  const km = kmTravelled(note.sentAt, t);
  const totalKm = dest.ly * 9460730472580.8;
  const left = Math.max(0, totalKm - km);
  const arrived = t >= arrival;
  const previewing = ahead > 0.001;
  const fmtDate = (x: number) => new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const arrivalText = arrival - now < 2 * YEAR_MS * 50 ? fmtDate(arrival) : `in about ${Math.round((arrival - now) / YEAR_MS).toLocaleString("en-GB")} years`;

  const rows: [string, string][] = [
    ["From Earth", bigKm(km)],
    ["Still to go", arrived ? "It has arrived" : bigKm(left)],
    ["Arrives", arrivalText],
    ["Heading", headingLabel(dest)],
    ["Speed", `${Math.round(C_KM_S).toLocaleString("en-GB")} km every second`],
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {([
          ["behind", "Behind the note"],
          ["home", "Looking back home"],
          ["map", "Map from above"],
        ] as [View, string][]).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => switchView(v)}
            aria-pressed={view === v}
            className="rounded-md px-3 py-1.5 text-[14px] transition-colors"
            style={view === v ? { background: TEXT, color: "#05070C" } : { border: "1px solid #2A3546", color: TEXT }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${RULE}` }}>
        <div ref={mountRef} className="relative w-full h-[360px] md:h-[440px] touch-none cursor-grab active:cursor-grabbing" />
        <div className="absolute left-3 top-3 pointer-events-none rounded-md px-3 py-2 text-[12px] leading-snug" style={{ background: "rgba(5,7,12,0.72)", color: MUTED }}>
          <span style={{ color: TEXT }}>Heading to {dest.name}</span>
          <br />in {dest.constellation}
          {previewing && <><br /><span style={{ color: WARM }}>Showing {fmtDate(t)}</span></>}
        </div>
        <p className="absolute right-3 bottom-2 m-0 text-[11px] pointer-events-none" style={{ color: "#6B7686" }}>
          Drag to look around. Distances squeezed to fit.
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="ahead" className="flex justify-between text-[13px]" style={{ color: MUTED }}>
          <span>{previewing ? `Looking ahead: ${duration(t - now)} from now` : "Now"}</span>
          {previewing ? (
            <button type="button" onClick={() => setAhead(0)} className="underline underline-offset-4" style={{ color: "#A9C3E0" }}>Back to now</button>
          ) : (
            <span>Slide to see ahead to its arrival</span>
          )}
        </label>
        <input
          id="ahead"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={ahead}
          onChange={(e) => setAhead(Number(e.target.value))}
          className="w-full mt-2 accent-[#F3DDB0]"
        />
      </div>

      <dl className="m-0 mt-4" style={{ borderTop: `1px solid ${RULE}` }}>
        {rows.map(([k, v]) => (
          <div key={k} className="py-2 grid grid-cols-[7.5rem_1fr] gap-3 text-[14px]" style={{ borderBottom: `1px solid ${RULE}` }}>
            <dt style={{ color: MUTED }}>{k}</dt>
            <dd className="m-0 tabular-nums" style={{ color: k === "Arrives" ? WARM : BODY }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
