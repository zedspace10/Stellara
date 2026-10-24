import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaleBlueDotSequenceProps {
  onComplete: () => void;
  onStart?: (goToLevel: (level: number) => void) => void;
}

export default function PaleBlueDotSequence({ onComplete, onStart }: PaleBlueDotSequenceProps) {
  const [step, setStep] = useState(0);

  const texts = [
    "Keep zooming out.",
    "Past the planets. Past the edge of the Sun's wind.",
    "Now look back. That faint point of light is Earth.",
    "Every story there has ever been happened on that point.",
    "Whatever you are carrying today, it is happening there too.",
    "This is home."
  ];

  useEffect(() => {
    if (step === 0 && onStart) {
      // Typically handled from parent, but we can call it if provided
      onStart((level) => console.log("Go to level", level));
    }

    if (step < texts.length - 1) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, step === 4 ? 5000 : 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, texts.length, onStart]);

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-8" style={{ background: "rgba(5,7,12,0.92)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="font-serif font-normal text-[30px] md:text-[48px] text-[#E8ECF1] leading-snug">
            {texts[step]}
          </h2>
          
          {step === 5 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 2 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="rounded-full mb-12" style={{ width: 5, height: 5, background: "#C6DCF5" }} />
              <button
                onClick={onComplete}
                className="rounded-md px-5 py-2 text-[15px] font-medium transition-colors hover:bg-white/5"
                style={{ border: "1px solid #3A4658", color: "#E8ECF1" }}
              >
                Back to the universe
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}