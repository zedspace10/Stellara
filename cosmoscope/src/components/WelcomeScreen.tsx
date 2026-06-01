import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
    let shootingStars: Array<{ x: number; y: number; length: number; speedX: number; speedY: number; opacity: number; active: boolean }> = [];
    let lastShootingStarTime = 0;

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

      // Shooting stars
      if (time - lastShootingStarTime > Math.random() * 240 + 180) { // 3-7 seconds approx at 60fps
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 80 + 40,
          speedX: Math.random() * 5 + 5,
          speedY: Math.random() * 5 + 5,
          opacity: 1,
          active: true
        });
        lastShootingStarTime = time;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        if (!ss.active) continue;

        ss.x += ss.speedX;
        ss.y += ss.speedY;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0) {
          ss.active = false;
          shootingStars.splice(i, 1);
          continue;
        }

        const gradient = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.length * (ss.speedX / Math.sqrt(ss.speedX*ss.speedX + ss.speedY*ss.speedY)), ss.y - ss.length * (ss.speedY / Math.sqrt(ss.speedX*ss.speedX + ss.speedY*ss.speedY)));
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.length * (ss.speedX / Math.sqrt(ss.speedX*ss.speedX + ss.speedY*ss.speedY)), ss.y - ss.length * (ss.speedY / Math.sqrt(ss.speedX*ss.speedX + ss.speedY*ss.speedY)));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

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
      className="fixed inset-0 z-[100] bg-[#0a0a1a] flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Nebula Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-[#4a0080]/10 rounded-full blur-[100px] animate-[nebula1_20s_infinite_alternate_ease-in-out]" />
        <div className="absolute bottom-0 left-0 w-[70vw] h-[70vw] bg-[#004080]/10 rounded-full blur-[120px] animate-[nebula2_25s_infinite_alternate_ease-in-out]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] bg-[#200060]/10 rounded-full blur-[150px] animate-[nebula3_30s_infinite_alternate_ease-in-out]" />
      </div>

      <style>{`
        @keyframes nebula1 {
          0% { transform: translate(10%, -10%) scale(1); }
          100% { transform: translate(-30%, 30%) scale(1.2); }
        }
        @keyframes nebula2 {
          0% { transform: translate(-10%, 10%) scale(1); }
          100% { transform: translate(30%, -30%) scale(1.1); }
        }
        @keyframes nebula3 {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>

      {/* Skip Intro */}
      <button 
        onClick={onComplete}
        className="absolute top-6 right-8 z-30 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-medium"
      >
        Skip Intro
      </button>

      {/* Central Content */}
      <div className="relative z-20 flex flex-col items-center text-center">
        <AnimatePresence>
          <motion.div
            key="logo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative flex items-center justify-center w-24 h-24 mb-6"
          >
            {/* Animated Ring */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#4fc3f7" strokeWidth="1" strokeDasharray="10 20" opacity="0.5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ffd54f" strokeWidth="1" strokeDasharray="30 10" opacity="0.3" className="animate-[spin_15s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }} />
            </svg>
            
            {/* Static Inner Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 relative z-10">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#4fc3f7" strokeWidth="8" />
              <circle cx="85" cy="50" r="12" fill="#4fc3f7" />
            </svg>
          </motion.div>

          <motion.h1
            key="wordmark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold font-['Orbitron'] tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <span className="text-white">STELLAR</span><span className="text-[#ffd54f]">A</span>
          </motion.h1>

          <motion.p
            key="tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="text-lg md:text-xl text-[#e0e0e0]/70 font-['Inter'] mb-12 max-w-md mx-auto"
          >
            Explore the Universe, One Star at a Time
          </motion.p>

          <motion.button
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            onClick={onComplete}
            className="bg-[#4fc3f7] hover:bg-[#29b6f6] text-[#0a0a1a] font-bold text-lg px-8 py-3 rounded-full animate-pulse transition-colors shadow-[0_0_20px_rgba(79,195,247,0.4)] hover:shadow-[0_0_30px_rgba(79,195,247,0.6)]"
          >
            Begin Exploration
          </motion.button>

          <motion.div
            key="scroll-arrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="mt-16 absolute -bottom-24"
          >
            <ChevronDown className="w-8 h-8 text-white/30 animate-bounce" />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}