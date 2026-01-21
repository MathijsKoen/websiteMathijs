"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface EnergyFieldTransitionProps {
  id?: string;
  height?: number;
  title: string;
  subtitle?: string;
  colors?: string[];
}

export default function EnergyFieldTransition({
  id = "energy-field-transition",
  height = 100,
  title,
  subtitle,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4"],
}: EnergyFieldTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [wordStates, setWordStates] = useState<{ y: number; opacity: number; scale: number }[]>([]);

  const words = useMemo(() => title.split(" "), [title]);

  useEffect(() => {
    setMounted(true);
    setWordStates(words.map(() => ({ y: 80, opacity: 0, scale: 0.8 })));
  }, [words]);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let progress = 0;
    let animationId: number;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Energy lines configuration
    interface EnergyLine {
      points: { x: number; y: number }[];
      color: string;
      width: number;
      speed: number;
      amplitude: number;
      frequency: number;
      phase: number;
    }

    const lines: EnergyLine[] = [];
    const numLines = 12;

    for (let i = 0; i < numLines; i++) {
      const isHorizontal = i < numLines / 2;
      const points: { x: number; y: number }[] = [];
      const numPoints = 50;

      for (let j = 0; j < numPoints; j++) {
        points.push({
          x: isHorizontal ? (j / numPoints) : (i - numLines / 2) / (numLines / 2) * 0.3 + 0.5,
          y: isHorizontal ? (i / (numLines / 2)) * 0.6 + 0.2 : (j / numPoints),
        });
      }

      lines.push({
        points,
        color: colors[i % colors.length],
        width: 1 + (i % 3),
        speed: 0.5 + (i % 4) * 0.3,
        amplitude: 20 + (i % 5) * 10,
        frequency: 2 + (i % 3),
        phase: (i / numLines) * Math.PI * 2,
      });
    }

    // Pulse rings
    interface PulseRing {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      color: string;
      birth: number;
    }

    const pulseRings: PulseRing[] = [];
    let lastPulse = 0;

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw energy field gradient background
      if (progress > 0.1) {
        const fieldGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, Math.max(width, height) * 0.6 * progress
        );
        fieldGradient.addColorStop(0, `${colors[0]}15`);
        fieldGradient.addColorStop(0.5, `${colors[1]}08`);
        fieldGradient.addColorStop(1, "transparent");
        ctx.fillStyle = fieldGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Create pulse rings
      if (progress > 0.2 && time - lastPulse > 0.8) {
        lastPulse = time;
        pulseRings.push({
          x: centerX,
          y: centerY,
          radius: 10,
          maxRadius: Math.max(width, height) * 0.4,
          color: colors[Math.floor(time * 2) % colors.length],
          birth: time,
        });
      }

      // Draw and update pulse rings
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        const age = time - ring.birth;
        ring.radius = 10 + age * 150 * progress;
        
        const opacity = Math.max(0, 1 - ring.radius / ring.maxRadius) * progress * 0.6;
        
        if (ring.radius > ring.maxRadius) {
          pulseRings.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `${ring.color}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw energy lines with scroll-based flow effect
      lines.forEach((line, lineIdx) => {
        if (progress < 0.05) return;

        // Lines flow in based on scroll progress
        const lineDelay = lineIdx * 0.03;
        const lineProgress = Math.max(0, Math.min(1, (progress - lineDelay) * 2));
        const isHorizontal = lineIdx < numLines / 2;

        // Fade in with scroll
        const opacity = Math.min(lineProgress * 200, 180);
        ctx.strokeStyle = `${line.color}${Math.floor(opacity).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = line.width * Math.min(lineProgress * 1.5, 1);
        ctx.lineCap = "round";
        ctx.beginPath();

        // Points reveal based on scroll - lines "draw in" from edges
        const visiblePoints = Math.floor(line.points.length * lineProgress);
        const scrollOffset = (1 - progress) * 200; // Lines shift with scroll

        line.points.slice(0, visiblePoints).forEach((point, i) => {
          // Wave amplitude increases with scroll progress
          const waveStrength = progress * line.amplitude;
          const wave = Math.sin(time * line.speed + i * 0.2 + line.phase) * waveStrength;
          
          let px, py;
          if (isHorizontal) {
            // Horizontal lines slide in from left/right
            const slideIn = lineIdx % 2 === 0 ? -scrollOffset : scrollOffset;
            px = point.x * width + slideIn * (1 - lineProgress);
            py = point.y * height + wave;
          } else {
            // Vertical lines slide in from top/bottom
            const slideIn = lineIdx % 2 === 0 ? -scrollOffset : scrollOffset;
            px = point.x * width + wave;
            py = point.y * height + slideIn * (1 - lineProgress);
          }

          // Magnetic pull towards center increases with scroll
          const dx = centerX - px;
          const dy = centerY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pullStrength = progress * 80; // Stronger pull as you scroll
          const pull = Math.max(0, 1 - dist / (Math.max(width, height) * 0.4)) * pullStrength;
          
          px += (dx / dist) * pull;
          py += (dy / dist) * pull;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });

        ctx.stroke();

        // Draw glow points at intersections - appear after line is mostly drawn
        if (lineProgress > 0.7) {
          const glowIntensity = (lineProgress - 0.7) / 0.3;
          const glowPoint = line.points[Math.floor(line.points.length * 0.5)];
          const wave = Math.sin(time * line.speed + line.phase) * line.amplitude * progress;
          
          let gx, gy;
          if (isHorizontal) {
            gx = glowPoint.x * width;
            gy = glowPoint.y * height + wave;
          } else {
            gx = glowPoint.x * width + wave;
            gy = glowPoint.y * height;
          }

          // Pull glow point to center too
          const dx = centerX - gx;
          const dy = centerY - gy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / (Math.max(width, height) * 0.4)) * progress * 80;
          gx += (dx / dist) * pull;
          gy += (dy / dist) * pull;

          const glowGradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, 15 * glowIntensity);
          glowGradient.addColorStop(0, `${line.color}${Math.floor(glowIntensity * 128).toString(16).padStart(2, "0")}`);
          glowGradient.addColorStop(1, "transparent");
          ctx.fillStyle = glowGradient;
          ctx.fillRect(gx - 15, gy - 15, 30, 30);
        }
      });

      // Central energy core
      if (progress > 0.3) {
        const coreSize = 30 + Math.sin(time * 3) * 10 * progress;
        const coreGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, coreSize * 2
        );
        coreGradient.addColorStop(0, `${colors[0]}90`);
        coreGradient.addColorStop(0.3, `${colors[1]}50`);
        coreGradient.addColorStop(0.6, `${colors[2]}20`);
        coreGradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core inner
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 80%",
      end: "bottom bottom", // Extended end for full scroll range
      scrub: 1, // Increased scrub for smoother heavy feel
      onUpdate: (self) => {
        progress = self.progress;
        
        const textProgress = Math.max(0, (progress - 0.2) / 0.5);
        const newStates = words.map((_, i) => {
          const wordProgress = Math.max(0, Math.min(1, (textProgress * words.length - i * 0.8) / 1.2));
          const eased = 1 - Math.pow(1 - wordProgress, 4);
          return {
            y: 80 * (1 - eased),
            opacity: eased,
            scale: 0.8 + 0.2 * eased,
          };
        });
        setWordStates(newStates);
      },
    });

    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, scrollTrigger: { trigger: container, start: "top 50%", end: "center center", scrub: 1 } }
      );
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
    };
  }, [mounted, words, colors]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Canvas for energy field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-20 px-6">
        {/* Background blur for text readability */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "radial-gradient(ellipse 60% 40% at center, var(--background) 0%, transparent 70%)",
          }}
        />
        <h2
          className="relative text-5xl md:text-7xl lg:text-8xl font-bold text-center leading-tight flex flex-wrap justify-center gap-x-4"
          style={{
            color: "var(--foreground)",
            textShadow: `0 0 40px var(--background), 0 0 80px var(--background), 0 2px 4px rgba(0,0,0,0.1)`,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: mounted && wordStates[i] ? wordStates[i].opacity : 0,
                transform: mounted && wordStates[i]
                  ? `translateY(${wordStates[i].y}px) scale(${wordStates[i].scale})`
                  : "translateY(80px) scale(0.8)",
                background: `linear-gradient(135deg, var(--foreground) 0%, ${colors[0]} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-8 text-xl md:text-2xl text-muted max-w-2xl text-center opacity-0"
          >
            {subtitle}
          </p>
        )}

        {/* Animated underline */}
        <div
          className="mt-10 h-0.5 rounded-full"
          style={{
            width: mounted ? `${Math.min(wordStates[0]?.opacity || 0, 1) * 200}px` : "0px",
            background: `linear-gradient(90deg, transparent, ${colors[0]}, ${colors[1]}, transparent)`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
