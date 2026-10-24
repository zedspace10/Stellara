import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number; y: number; size: number; speed: number; opacity: number; opacitySpeed: number; layer: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      // Layer 1 (far)
      for (let i = 0; i < 600; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 0.3 + 0.3,
          speed: Math.random() * 0.02 + 0.01,
          opacity: Math.random(),
          opacitySpeed: Math.random() * 0.01 + 0.005,
          layer: 1
        });
      }
      // Layer 2 (mid)
      for (let i = 0; i < 300; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.05 + 0.02,
          opacity: Math.random(),
          opacitySpeed: Math.random() * 0.02 + 0.01,
          layer: 2
        });
      }
      // Layer 3 (near)
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1 + 1,
          speed: Math.random() * 0.1 + 0.05,
          opacity: Math.random(),
          opacitySpeed: Math.random() * 0.03 + 0.02,
          layer: 3
        });
      }
    };

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - canvas.width / 2);
      mouseY = (e.clientY - canvas.height / 2);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();

    let time = 0;

    const draw = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star) => {
        // Drift
        star.y += star.speed;
        star.x += star.speed * 0.5;

        // Twinkle
        const twinkle = (Math.sin(time * star.opacitySpeed) + 1) / 2;
        let baseOpacity = 0;
        if (star.layer === 1) baseOpacity = 0.3 + twinkle * 0.2;
        if (star.layer === 2) baseOpacity = 0.5 + twinkle * 0.2;
        if (star.layer === 3) baseOpacity = 0.7 + twinkle * 0.3;

        // Parallax
        let parallaxFactor = 0;
        if (star.layer === 1) parallaxFactor = 0.005;
        if (star.layer === 2) parallaxFactor = 0.015;
        if (star.layer === 3) parallaxFactor = 0.03;

        let drawX = star.x - mouseX * parallaxFactor;
        let drawY = star.y - mouseY * parallaxFactor;

        // Wrap around
        if (drawX < 0) drawX = (drawX % canvas.width) + canvas.width;
        if (drawX > canvas.width) drawX = drawX % canvas.width;
        if (drawY < 0) drawY = (drawY % canvas.height) + canvas.height;
        if (drawY > canvas.height) drawY = drawY % canvas.height;

        ctx.fillStyle = `rgba(255, 255, 255, ${baseOpacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#05070C" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" aria-hidden="true" />

      <button
        onClick={onComplete}
        className="absolute top-5 right-6 z-30 text-[15px] transition-colors hover:text-white"
        style={{ color: "#8E9AA8" }}
      >
        Skip
      </button>

      <div className="relative z-20 flex flex-col items-center text-center px-6">
        {/* The one moment: a single point of light, then what it is. */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.6 }}
          className="block rounded-full"
          style={{ width: 5, height: 5, background: "#C6DCF5" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2 }}
          className="mt-4 mb-0 text-[14px]"
          style={{ color: "#8E9AA8" }}
        >
          Earth, seen from six billion kilometres away
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1.2 }}
          className="mt-20 flex flex-col items-center"
        >
          <h1 className="m-0 font-serif text-[56px] md:text-[80px] leading-none pl-[0.26em]" style={{ color: "#E8ECF1", fontWeight: 400, letterSpacing: "0.26em" }}>
            PALE
          </h1>
          <p className="mt-5 mb-0 font-serif text-[20px] md:text-[22px]" style={{ color: "#A3AFBC" }}>
            A calm space to think.
          </p>
          <button
            onClick={onComplete}
            className="mt-10 rounded-md px-6 py-2.5 text-[16px] font-medium transition-colors hover:bg-white/5"
            style={{ border: "1px solid #3A4658", color: "#E8ECF1" }}
          >
            Enter the universe
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
