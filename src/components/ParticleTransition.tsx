"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  // Start positie (aan de rand van het scherm)
  startX: number;
  startY: number;
  // Eind positie (centrum)
  endX: number;
  endY: number;
  // Huidige positie
  x: number;
  y: number;
  // Visuele eigenschappen
  size: number;
  opacity: number;
  color: string;
  // Bewegingseigenschappen
  speed: number;
  angle: number;
  // Offset voor variatie in timing
  progressOffset: number;
  // Trail voor motion blur effect
  trail: { x: number; y: number }[];
}

interface ParticleTransitionProps {
  /** Aantal particles (default: 150) */
  particleCount?: number;
  /** Kleuren voor particles */
  colors?: string[];
  /** ID voor de sectie */
  id?: string;
  /** Hoogte van de transitie sectie (in vh) */
  height?: number;
  /** Content die gecentreerd wordt getoond */
  children?: React.ReactNode;
  /** Achtergrondkleur */
  backgroundColor?: string;
}

export default function ParticleTransition({
  particleCount = 150,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8", "#dbeafe"],
  id = "particle-transition",
  height = 150,
  children,
  backgroundColor = "#ffffff",
}: ParticleTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Easing functie voor smooth beweging
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Custom ease voor meer dramatisch effect
  const customEase = (t: number): number => {
    // Particles beginnen langzaam, versnellen, en komen smooth aan
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Initialiseer particles
  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = [];
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particleCount; i++) {
        // Bepaal startpositie aan de rand van het scherm - meer verspreid
        const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = Math.max(width, height) * 0.8 + Math.random() * 300;
        
        const startX = centerX + Math.cos(angle) * distance;
        const startY = centerY + Math.sin(angle) * distance;

        // Eindpositie rond het centrum met spiraal effect
        const endAngle = angle + Math.PI * 0.5; // Spiraal beweging
        const endDistance = Math.random() * 100 + 10;
        const endX = centerX + Math.cos(endAngle) * endDistance;
        const endY = centerY + Math.sin(endAngle) * endDistance;

        particles.push({
          startX,
          startY,
          endX,
          endY,
          x: startX,
          y: startY,
          size: Math.random() * 5 + 2, // 2-7 pixels
          opacity: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 0.4 + 0.6, // Variatie in snelheid
          angle,
          progressOffset: Math.random() * 0.4, // 0-0.4 offset voor staggered effect
          trail: [],
        });
      }

      particlesRef.current = particles;
    },
    [particleCount, colors]
  );

  // Update particle posities op basis van scroll progress
  const updateParticles = useCallback((progress: number) => {
    particlesRef.current.forEach((particle) => {
      // Bewaar vorige positie voor trail
      if (particle.trail.length > 8) {
        particle.trail.shift();
      }
      particle.trail.push({ x: particle.x, y: particle.y });

      // Pas progress aan met offset voor staggered effect
      let adjustedProgress =
        (progress - particle.progressOffset) / (1 - particle.progressOffset);
      adjustedProgress = Math.max(0, Math.min(1, adjustedProgress));

      // Apply easing met spiraal beweging
      const easedProgress = customEase(adjustedProgress);

      // Spiraal interpolatie - particles draaien naar binnen
      const spiralFactor = 1 - easedProgress;
      const currentAngle = particle.angle + spiralFactor * Math.PI * 2;
      const currentDistance = 
        (1 - easedProgress) * Math.hypot(
          particle.startX - particle.endX,
          particle.startY - particle.endY
        );

      // Combineer lineaire beweging met spiraal
      const linearX = particle.startX + (particle.endX - particle.startX) * easedProgress;
      const linearY = particle.startY + (particle.endY - particle.startY) * easedProgress;
      
      const spiralX = particle.endX + Math.cos(currentAngle) * currentDistance * 0.3;
      const spiralY = particle.endY + Math.sin(currentAngle) * currentDistance * 0.3;

      // Mix lineair en spiraal
      particle.x = linearX * 0.7 + spiralX * 0.3;
      particle.y = linearY * 0.7 + spiralY * 0.3;

      // Fade in/out effect
      if (adjustedProgress < 0.15) {
        particle.opacity = (adjustedProgress / 0.15) * 0.9;
      } else if (adjustedProgress > 0.85) {
        particle.opacity = ((1 - adjustedProgress) / 0.15) * 0.9;
      } else {
        particle.opacity = 0.9;
      }
    });
  }, []);

  // Render particles op canvas
  const renderParticles = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Teken centrale glow wanneer particles samenkomen
    const progress = progressRef.current;
    if (progress > 0.4) {
      const glowIntensity = (progress - 0.4) / 0.6;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const centralGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 200 * glowIntensity
      );
      centralGlow.addColorStop(0, `rgba(59, 130, 246, ${0.3 * glowIntensity})`);
      centralGlow.addColorStop(0.5, `rgba(96, 165, 250, ${0.15 * glowIntensity})`);
      centralGlow.addColorStop(1, "transparent");
      
      ctx.fillStyle = centralGlow;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    // Teken verbindingslijnen eerst (achter particles)
    if (progress > 0.5) {
      const lineOpacity = (progress - 0.5) / 0.5;
      ctx.lineWidth = 0.5;
      
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1, i + 10).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.2 * lineOpacity * particle.opacity;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.stroke();
          }
        });
      });
    }

    // Teken particles met trail en glow
    particlesRef.current.forEach((particle) => {
      // Teken trail (motion blur effect)
      if (particle.trail.length > 1 && progress < 0.8) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        ctx.lineTo(particle.x, particle.y);
        
        const trailGradient = ctx.createLinearGradient(
          particle.trail[0].x, particle.trail[0].y,
          particle.x, particle.y
        );
        trailGradient.addColorStop(0, "transparent");
        trailGradient.addColorStop(1, particle.color + "60");
        
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = particle.size * 0.8;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 4
      );
      glowGradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 200).toString(16).padStart(2, "0"));
      glowGradient.addColorStop(0.4, particle.color + "40");
      glowGradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles(progressRef.current);
    renderParticles();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateParticles, renderParticles]);

  // Setup canvas en ScrollTrigger
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    // Setup canvas
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        contextRef.current = ctx;
      }

      initParticles(rect.width, rect.height);
    };

    setupCanvas();

    // Start animation loop
    animate();

    // Setup ScrollTrigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top bottom", // Start wanneer de bovenkant van de container de onderkant van de viewport bereikt
      end: "bottom top",   // Eindig wanneer de onderkant van de container de bovenkant bereikt
      scrub: 0.5,          // Smooth scrubbing met kleine vertraging
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // Resize handler
    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      scrollTrigger.kill();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initParticles, animate]);

  return (
    <section
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{
        minHeight: `${height}vh`,
        backgroundColor,
      }}
    >
      {/* Canvas voor particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Gradient overlays voor smooth edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, ${backgroundColor} 0%, transparent 15%),
            linear-gradient(to top, ${backgroundColor} 0%, transparent 15%)
          `,
          zIndex: 2,
        }}
      />

      {/* Centraal content gebied */}
      {children && (
        <div
          className="relative z-10 flex items-center justify-center min-h-full px-6"
          style={{ minHeight: `${height}vh` }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
