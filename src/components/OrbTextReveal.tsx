"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface OrbTextRevealProps {
  text?: string;
  className?: string;
  height?: string;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  baseSize: number;
  size: number;
  hue: number;
  color: string;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  offset: number;
  depth: number;
  
  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number, hue: number) {
    this.originX = x;
    this.originY = y;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;
    
    this.hue = hue;
    this.color = `hsla(${this.hue}, 90%, 70%, 0.9)`;

    this.angle = Math.random() * Math.PI * 2;
    const maxDim = Math.max(canvasWidth, canvasHeight);
    this.orbitRadius = maxDim * (0.18 + Math.random() * 0.25);
    this.orbitSpeed = (0.08 + Math.random() * 0.18) * (Math.random() > 0.5 ? 1 : -1);
    this.offset = Math.random() * 100;
    this.depth = 0.3 + Math.random() * 0.4;

    this.baseSize = Math.random() * 1.8 + 1.4;
    this.size = this.baseSize;
    this.x = this.centerX;
    this.y = this.centerY;
  }

  update(mouse: { x: number; y: number; radius: number }, progress: number, time: number) {
    const t = Math.max(0, Math.min(1, progress));
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const orbitAngle = this.angle + time * this.orbitSpeed;
    const orbitX = this.centerX + Math.cos(orbitAngle) * this.orbitRadius;
    const orbitY = this.centerY + Math.sin(orbitAngle) * this.orbitRadius * 0.7;

    const drift = (1 - ease) * 6;
    const driftX = Math.sin(time * 0.7 + this.offset) * drift;
    const driftY = Math.cos(time * 0.9 + this.offset) * drift;

    let x = orbitX + driftX;
    let y = orbitY + driftY;

    this.x = x + (this.originX - x) * ease;
    this.y = y + (this.originY - y) * ease;

    // Subtle parallax
    const nx = (mouse.x - this.centerX) / this.width;
    const ny = (mouse.y - this.centerY) / this.height;
    const parallax = 8 * this.depth * ease;
    this.x += nx * parallax;
    this.y += ny * parallax;

    // Mouse interaction (repel)
    const mdx = this.x - mouse.x;
    const mdy = this.y - mouse.y;
    // Optimization: Use squared distance to avoid expensive sqrt on every frame
    const distSq = mdx * mdx + mdy * mdy;
    const radiusSq = mouse.radius * mouse.radius;

    if (distSq < radiusSq && ease > 0.5) {
      const distance = Math.sqrt(distSq) || 1;
      const force = (mouse.radius - distance) / mouse.radius;
      const strength = 3 * force * ease;
      this.x += (mdx / distance) * strength;
      this.y += (mdy / distance) * strength;
    }

    const pulse = 0.85 + Math.sin(time * 1.2 + this.offset) * 0.15;
    this.size = this.baseSize * (0.7 + ease * 0.8) * pulse;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, progress: number) {
    const edgeX = Math.abs(this.x - this.centerX) / (this.width * 0.5);
    const edgeY = Math.abs(this.y - this.centerY) / (this.height * 0.5);
    const edge = Math.min(1, Math.max(edgeX, edgeY));
    const edgeFade = Math.max(0, 1 - Math.pow(edge, 1.7));
    const alpha = edgeFade * (0.55 + progress * 0.35);

    const glowStrength = (0.06 + progress * 0.12) * edgeFade;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5);
    glow.addColorStop(0, `hsla(${this.hue}, 90%, 70%, ${glowStrength})`);
    glow.addColorStop(0.4, `hsla(${this.hue}, 90%, 70%, ${glowStrength * 0.4})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = `hsla(${this.hue}, 90%, 70%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${0.45 * edgeFade})`;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function OrbTextReveal({ text = "PORTFOLIO", className = "", height = "h-[60vh]" }: OrbTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;
    let progress = 0;
    let width = 0;
    let height = 0;
    
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 80
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const init = () => {
      // Set canvas size to parent container
      const rect = containerRef.current!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = Math.min(width / (text.length * 0.7), 140);
      
      // Offscreen sampling canvas to avoid DPR artifacts
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = width;
      sampleCanvas.height = height;
      const sampleCtx = sampleCanvas.getContext("2d");
      if (!sampleCtx) return;
      
      sampleCtx.fillStyle = "white";
      sampleCtx.font = `900 ${fontSize}px "Inter", "system-ui", sans-serif`; 
      sampleCtx.textAlign = "center";
      sampleCtx.textBaseline = "middle";
      sampleCtx.fillText(text, width / 2, height / 2);
      
      const textCoordinates = sampleCtx.getImageData(0, 0, width, height);
      
      particles = [];
      const step = 7; // Density

      for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
             const alpha = textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3];
          if (alpha > 128) {
            const hue = 210 + (x / Math.max(1, width)) * 70;
            particles.push(new Particle(x, y, width, height, hue));
          }
        }
      }

    };

    const animate = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse, progress, time);
        particles[i].draw(ctx, time, progress);
      }

      animationId = requestAnimationFrame(animate);
    };

    // Initialize logic
    init();
    animate();

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 85%", // Starts slightly later as requested
      end: "bottom top",   
      scrub: 1, 
      onUpdate: (self) => {
        const p = self.progress;
        const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Assemble (0 -> 45%)
        if (p < 0.45) {
          progress = easeInOut(p / 0.45);
        } 
        // Disperse in the last 25%
        else if (p > 0.75) {
          progress = 1 - easeInOut((p - 0.75) / 0.25);
        } 
        // Hold assembled in the middle (45% -> 75%)
        else {
          progress = 1;
        }
      },
      // markers: true
    });

    const handleResize = () => {
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      st.kill();
    };
  }, [isMounted, text]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-center justify-center ${height} ${className}`}
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Background is transparent as requested */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  );
}
