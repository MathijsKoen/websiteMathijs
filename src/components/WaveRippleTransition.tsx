"use client";

import { useRef, useEffect, ReactNode, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Seeded random for consistent SSR/client values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface WaveRippleTransitionProps {
  children?: ReactNode;
  id?: string;
  height?: number;
  colors?: string[];
  rippleCount?: number;
}

export default function WaveRippleTransition({
  children,
  id = "wave-ripple-transition",
  height = 100,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd"],
  rippleCount = 5,
}: WaveRippleTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Wave parameters
    interface Wave {
      amplitude: number;
      frequency: number;
      speed: number;
      phase: number;
      color: string;
      opacity: number;
    }

    const waves: Wave[] = Array.from({ length: 4 }, (_, i) => ({
      amplitude: 30 + i * 15,
      frequency: 0.008 - i * 0.001,
      speed: 0.02 + i * 0.01,
      phase: i * Math.PI * 0.5,
      color: colors[i % colors.length],
      opacity: 0.3 - i * 0.05,
    }));

    // Ripple parameters
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      color: string;
      speed: number;
    }

    const ripples: Ripple[] = [];
    let lastRippleTime = 0;

    // Animation
    let time = 0;

    const drawWave = (wave: Wave, yOffset: number, progress: number) => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 2) {
        const normalizedX = x / width;
        const distFromCenter = Math.abs(normalizedX - 0.5) * 2;
        const amplitudeModifier = 1 - distFromCenter * (1 - progress);
        
        const y =
          yOffset +
          Math.sin(x * wave.frequency + time * wave.speed + wave.phase) *
            wave.amplitude *
            amplitudeModifier *
            progress;
        
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, yOffset - wave.amplitude, 0, height);
      gradient.addColorStop(0, `${wave.color}${Math.floor(wave.opacity * progress * 255).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawRipple = (ripple: Ripple) => {
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${ripple.color}${Math.floor(ripple.opacity * 255).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const gradient = ctx.createRadialGradient(
        ripple.x,
        ripple.y,
        ripple.radius * 0.8,
        ripple.x,
        ripple.y,
        ripple.radius
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, `${ripple.color}${Math.floor(ripple.opacity * 0.3 * 255).toString(16).padStart(2, "0")}`);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);

      const progress = progressRef.current;

      // Draw waves
      waves.forEach((wave, i) => {
        const yOffset = height * 0.3 + i * height * 0.15;
        drawWave(wave, yOffset, progress);
      });

      // Add new ripples based on progress
      const now = Date.now();
      if (progress > 0.2 && progress < 0.9 && now - lastRippleTime > 300) {
        if (ripples.length < rippleCount) {
          ripples.push({
            x: width * (0.3 + Math.random() * 0.4),
            y: height * (0.3 + Math.random() * 0.4),
            radius: 0,
            maxRadius: 100 + Math.random() * 150,
            opacity: 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 1 + Math.random() * 2,
          });
          lastRippleTime = now;
        }
      }

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        ripple.opacity = 0.6 * (1 - ripple.radius / ripple.maxRadius);

        if (ripple.radius >= ripple.maxRadius) {
          ripples.splice(i, 1);
        } else {
          drawRipple(ripple);
        }
      }

      // Center glow
      if (progress > 0.3) {
        const glowProgress = (progress - 0.3) / 0.7;
        const centerX = width / 2;
        const centerY = height / 2;
        const glowRadius = Math.min(width, height) * 0.4 * glowProgress;

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          glowRadius
        );
        gradient.addColorStop(0, `${colors[0]}${Math.floor(glowProgress * 0.3 * 255).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(0.5, `${colors[1]}${Math.floor(glowProgress * 0.15 * 255).toString(16).padStart(2, "0")}`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Scroll trigger for progress
    const gsapCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      // Content animation
      if (content) {
        gsap.fromTo(
          content,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 60%",
              end: "center center",
              scrub: 1,
            },
          }
        );
      }
    }, container);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      gsapCtx.revert();
    };
  }, [colors, rippleCount]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Canvas for waves and ripples */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Floating particles - using seeded positions for hydration consistency */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const seed = i * 1000;
          const left = seededRandom(seed + 1) * 100;
          const top = seededRandom(seed + 2) * 100;
          const size = 4 + seededRandom(seed + 3) * 8;
          const opacity = 0.3 + seededRandom(seed + 4) * 0.3;
          const delay = seededRandom(seed + 5) * 5;
          const duration = 3 + seededRandom(seed + 6) * 4;
          
          return (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: colors[i % colors.length],
                opacity: opacity,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      {children && (
        <div
          ref={contentRef}
          className="relative z-10 flex items-center justify-center min-h-full py-20"
        >
          {children}
        </div>
      )}

      {/* Top and bottom fade */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, var(--background), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </div>
  );
}
