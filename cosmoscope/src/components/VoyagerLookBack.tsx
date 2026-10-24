import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SPACECRAFT, spacecraftPosition, AU_KM } from "@/lib/smallbodies";

// NASA's 2020 reprocessing of the Pale Blue Dot photograph (PIA23645). Public domain.
const PHOTO_URL = "https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia23/pia23645/PIA23645.jpg";
const PHOTO_CREDIT = "Pale Blue Dot, 14 February 1990. NASA/JPL-Caltech, processed by Kevin M. Gill.";
const ILLUSTRATION_CREDIT = "Illustration based on the Pale Blue Dot photograph, NASA/JPL, 1990.";

// Voyager 1 was about 6 billion km from Earth when it took the photograph.
const KM_AT_PHOTO = 6.0e9;

interface Props {
  onClose: () => void;
}

export default function VoyagerLookBack({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);

  const todayKm = useMemo(() => {
    const p = spacecraftPosition(SPACECRAFT[0], Date.now());
    return p ? p.r * AU_KM : 0;
  }, []);
  const billions = (todayKm / 1e9).toFixed(1);
  const times = Math.floor(todayKm / KM_AT_PHOTO);
  const timesWord = ["", "", "twice", "three times", "four times", "five times", "six times"][times] ?? `${times} times`;

  const lines = [
    "14 February 1990.",
    "Voyager 1 had finished its tour of the planets. Before its cameras were switched off for good, it turned around and looked back.",
    "From 6 billion km away, Earth was smaller than a single pixel. A speck in a ray of sunlight.",
    `Today Voyager 1 is ${billions} billion km away, more than ${timesWord} as far.`,
    "Every story there has ever been happened on that point of light. Yours too.",
  ];

  useEffect(() => {
    if (step >= lines.length - 1) return undefined;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 2600 : 5200);
    return () => clearTimeout(t);
  }, [step, lines.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const showPicture = step >= 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "#020305" }}
      role="dialog"
      aria-modal="true"
      aria-label="Looking back at Earth from Voyager 1"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full p-2"
        style={{ color: "#A3AFBC", background: "rgba(255,255,255,0.06)" }}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showPicture ? 1 : 0 }}
        transition={{ duration: 2.5 }}
        className="w-full max-w-[420px] aspect-square rounded-lg overflow-hidden mb-8"
        style={{ background: "#000" }}
      >
        {photoFailed ? (
          <Illustration />
        ) : (
          <img
            src={PHOTO_URL}
            alt="The Pale Blue Dot: Earth as a tiny point of light in a band of scattered sunlight, photographed by Voyager 1"
            className="w-full h-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        )}
      </motion.div>

      <div className="min-h-[7rem] max-w-xl text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 1.2 }}
            className="m-0 text-xl md:text-2xl font-light leading-relaxed"
            style={{ color: "#E8ECF1" }}
          >
            {lines[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {step >= lines.length - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          onClick={onClose}
          className="mt-6 rounded-full px-6 py-2.5 text-[15px] font-semibold"
          style={{ background: "#A9C3E0", color: "#05070C" }}
        >
          Back to the universe
        </motion.button>
      )}

      <p className="absolute bottom-4 left-0 right-0 m-0 px-6 text-center text-[11px]" style={{ color: "#5D6B79" }}>
        {photoFailed ? ILLUSTRATION_CREDIT : PHOTO_CREDIT}
      </p>
    </div>,
    document.body,
  );
}

// Used only if NASA's photograph cannot load: a dark frame with rays of scattered sunlight
// and one faint blue point, after the composition of the original.
function Illustration() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const size = 600;
    c.width = size; c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    const rays: [number, number, string, number][] = [
      [0.18, 0.09, "150,120,100", 0.16],
      [0.47, 0.07, "120,140,170", 0.12],
      [0.74, 0.11, "170,130,95", 0.2],
    ];
    rays.forEach(([cx, w, rgb, a]) => {
      const g = ctx.createLinearGradient((cx - w) * size, 0, (cx + w) * size, 0);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(0.5, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-0.08);
      ctx.translate(-size / 2, -size / 2);
      ctx.fillStyle = g;
      ctx.fillRect(0, -size * 0.1, size, size * 1.2);
      ctx.restore();
    });
    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    const dot = ctx.createRadialGradient(size * 0.745, size * 0.6, 0, size * 0.745, size * 0.6, 4);
    dot.addColorStop(0, "rgba(200,230,255,1)");
    dot.addColorStop(1, "rgba(160,200,255,0)");
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(size * 0.745, size * 0.6, 4, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  return <canvas ref={ref} className="w-full h-full" aria-hidden="true" />;
}
