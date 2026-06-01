import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PaleBlueDotSequenceProps {
  onComplete: () => void;
  onStart?: (goToLevel: (level: number) => void) => void;
}

export default function PaleBlueDotSequence({ onComplete, onStart }: PaleBlueDotSequenceProps) {
  const [step, setStep] = useState(0);

  const texts = [
    "Zoom out... zoom out...",
    "Somewhere in that vast, cosmic arena...",
    "There is a pale blue dot.",
    "That dot is home. That is us. That is every human being who ever lived.",
    "On it, everyone you love, everyone you know, everyone you have ever heard of...",
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
    <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-3xl md:text-5xl font-light text-white leading-relaxed tracking-wide font-['Orbitron']">
            {texts[step]}
          </h2>
          
          {step === 5 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 2 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="w-2 h-2 bg-[#4fc3f7] rounded-full shadow-[0_0_15px_#4fc3f7] mb-12 animate-pulse" />
              <Button 
                variant="outline" 
                onClick={onComplete}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}