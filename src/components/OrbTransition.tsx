"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface OrbTransitionProps {
  id?: string;
  height?: number;
  title: string;
  subtitle?: string;
  colors?: string[];
}

export default function OrbTransition({
  id = "orb-transition",
  height = 100,
  title,
  subtitle,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ffffff"],
}: OrbTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);

  const stableColors = useMemo(() => colors, [colors.join(",")]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Orbs that will form the text
    interface Orb {
      x: number;
      y: number;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      size: number;
      color: string;
      noiseOffset: number;
      depth: number;
    }

    let orbs: Orb[] = [];
    let animationId: number;
    const progressRef = { value: 0 };

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouse);

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initOrbs();
    };

    const initOrbs = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      orbs = [];

      // Sample text to get target positions
      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      const fontSize = Math.min(w * 0.12, 140);
      offCtx.font = `900 ${fontSize}px "Geist", "Inter", "Segoe UI", sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "white";
      offCtx.fillText(title, w / 2, h / 2);

      const imageData = offCtx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const step = Math.floor(Math.max(12, w / 100));

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const alpha = data[(y * w + x) * 4 + 3];
          if (alpha > 128 && Math.random() > 0.3) {
            // Start from edges
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.max(w, h) * 0.8;
            const startX = w / 2 + Math.cos(angle) * radius;
            const startY = h / 2 + Math.sin(angle) * radius;

            orbs.push({
              x: startX,
              y: startY,
              startX,
              startY,
              targetX: x,
              targetY: y,
              size: Math.random() * 2.5 + 1.5,
              color: stableColors[Math.floor(Math.random() * stableColors.length)],
              noiseOffset: Math.random() * 100,
              depth: Math.random() * 25 + 10,
            });
          }
        }
      }

      // Add ambient orbs
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        orbs.push({
          x,
          y,
          startX: x,
          startY: y,
          targetX: x + (Math.random() - 0.5) * 100,
          targetY: y + (Math.random() - 0.5) * 100,
          size: Math.random() * 2 + 0.5,
          color: stableColors[Math.floor(Math.random() * stableColors.length)],
          noiseOffset: Math.random() * 100,
          depth: Math.random() * 15 + 5,
        });
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const progress = progressRef.value;
      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, w, h);

      // Easing
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      orbs.forEach((orb) => {
        // Lerp position based on progress
        const lerpX = orb.startX + (orb.targetX - orb.startX) * ease;
        const lerpY = orb.startY + (orb.targetY - orb.startY) * ease;

        // Add noise/jitter
        const noiseMult = (1 - ease) * 50 + 4;
        const noiseX = Math.sin(time * 1.5 + orb.noiseOffset) * noiseMult;
        const noiseY = Math.cos(time * 1.5 + orb.noiseOffset) * noiseMult;

        // Mouse parallax
        const parallaxX = mouseX * orb.depth * ease * -0.5;
        const parallaxY = mouseY * orb.depth * ease * -0.5;

        const drawX = lerpX + noiseX + parallaxX;
        const drawY = lerpY + noiseY + parallaxY;

        // Breathing
        const breathe = 1 + Math.sin(time * 2 + orb.noiseOffset) * 0.2;
        const size = orb.size * breathe;

        // Glow
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size * 4);
        gradient.addColorStop(0, `${orb.color}50`);
        gradient.addColorStop(0.5, `${orb.color}18`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = orb.color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      // Draw connections when formed
      if (progress > 0.5) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${(progress - 0.5) * 0.15})`;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < orbs.length; i += 3) {
          for (let j = i + 1; j < Math.min(i + 8, orbs.length); j++) {
            const dx = orbs[i].targetX - orbs[j].targetX;
            const dy = orbs[i].targetY - orbs[j].targetY;
            if (dx * dx + dy * dy < 900) {
              ctx.beginPath();
              ctx.moveTo(
                orbs[i].startX + (orbs[i].targetX - orbs[i].startX) * ease,
                orbs[i].startY + (orbs[i].targetY - orbs[i].startY) * ease
              );
              ctx.lineTo(
                orbs[j].startX + (orbs[j].targetX - orbs[j].startX) * ease,
                orbs[j].startY + (orbs[j].targetY - orbs[j].startY) * ease
              );
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 1.2,
      animation: gsap.to(progressRef, { value: 1, ease: "none" }),
    });

    // Text animations
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 60%",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }

    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 50%",
            end: "center 40%",
            scrub: 1,
          },
        }
      );
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouse);
      trigger.kill();
    };
  }, [mounted, title, stableColors]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <h2
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight"
          style={{ 
            opacity: 0,
            background: "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 50%, var(--accent-light) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-6 text-lg md:text-xl text-muted max-w-md text-center"
            style={{ opacity: 0 }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
