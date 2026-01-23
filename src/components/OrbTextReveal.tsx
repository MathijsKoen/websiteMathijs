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
  disturbX: number;
  disturbY: number;
  disturbVX: number;
  disturbVY: number;
  looseTimer: number;
  looseAngle: number;
  looseRadius: number;
  looseVX: number;
  looseVY: number;
  lastTime: number;
  hitCount: number;
  
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

    this.disturbX = 0;
    this.disturbY = 0;
    this.disturbVX = 0;
    this.disturbVY = 0;

    this.looseTimer = 0;
    this.looseAngle = Math.random() * Math.PI * 2;
    this.looseRadius = 10 + Math.random() * 18;
    this.looseVX = 0;
    this.looseVY = 0;
    this.lastTime = 0;
    this.hitCount = 0;
  }

  update(
    mouse: { x: number; y: number; radius: number },
    progress: number,
    time: number,
    ripples?: { x: number; y: number; strength: number; radius: number }[]
  ) {
    const dt = this.lastTime ? Math.min(0.05, time - this.lastTime) : 0.016;
    this.lastTime = time;
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

    const baseX = x + (this.originX - x) * ease;
    const baseY = y + (this.originY - y) * ease;

    // Subtle parallax
    const nx = (mouse.x - this.centerX) / this.width;
    const ny = (mouse.y - this.centerY) / this.height;
    const parallax = 8 * this.depth * ease;
    const parallaxX = nx * parallax;
    const parallaxY = ny * parallax;

    // Mouse interaction (repel)
    const mdx = baseX + parallaxX - mouse.x;
    const mdy = baseY + parallaxY - mouse.y;
    // Optimization: Use squared distance to avoid expensive sqrt on every frame
    const distSq = mdx * mdx + mdy * mdy;
    const radiusSq = mouse.radius * mouse.radius;

    if (distSq < radiusSq && ease > 0.5) {
      const distance = Math.sqrt(distSq) || 1;
      const force = (mouse.radius - distance) / mouse.radius;
      const strength = 3 * force * ease;
      this.disturbVX += (mdx / distance) * strength * 0.6;
      this.disturbVY += (mdy / distance) * strength * 0.6;
    }

    // Ripple disturbance (impulse + spring back)
    if (ripples && ease > 0.4) {
      ripples.forEach((ripple) => {
        const rdx = baseX + parallaxX - ripple.x;
        const rdy = baseY + parallaxY - ripple.y;
        const rDist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        const band = Math.abs(rDist - ripple.radius);
        if (band < 80) {
          const impulse = (1 - band / 80) * ripple.strength * 2.4 * ease;
          this.disturbVX += (rdx / rDist) * impulse;
          this.disturbVY += (rdy / rDist) * impulse;

          // Detach and float when hit
          if (this.hitCount < 1) {
            // First hit - tiny vibration
            this.hitCount++;
            this.looseTimer = 1.8;
            this.looseVX += (rdx / rDist) * impulse * 0.08;
            this.looseVY += (rdy / rDist) * impulse * 0.08;
          } else if (this.hitCount < 2) {
            // Second hit - gentle nudge
            this.hitCount++;
            this.looseTimer = 2.2;
            this.looseVX += (rdx / rDist) * impulse * 0.15;
            this.looseVY += (rdy / rDist) * impulse * 0.15;
          } else if (this.hitCount < 3) {
            // Third hit - starting to feel it
            this.hitCount++;
            this.looseTimer = 3.0;
            this.looseVX += (rdx / rDist) * impulse * 0.35;
            this.looseVY += (rdy / rDist) * impulse * 0.35;
          } else if (this.hitCount < 4) {
            // Fourth hit - visible disruption
            this.hitCount++;
            this.looseTimer = 4.5;
            this.looseVX += (rdx / rDist) * impulse * 0.8;
            this.looseVY += (rdy / rDist) * impulse * 0.8;
          } else if (this.hitCount < 6) {
            // Fifth/sixth hit - moderate chaos
            this.hitCount++;
            this.looseTimer = 7.0;
            this.looseVX += (rdx / rDist) * impulse * 2.0;
            this.looseVY += (rdy / rDist) * impulse * 2.0;
            this.looseRadius += 5;
          } else {
            // Many hits - complete destruction
            this.hitCount++;
            this.looseTimer = 12.0;
            this.looseVX += (rdx / rDist) * impulse * 5.0;
            this.looseVY += (rdy / rDist) * impulse * 5.0;
            this.looseRadius += 18;
          }
        }
      });
    }

    // Spring back to base position
    const spring = 0.12;
    const damping = 0.86;
    this.disturbVX += -this.disturbX * spring;
    this.disturbVY += -this.disturbY * spring;
    this.disturbVX *= damping;
    this.disturbVY *= damping;
    this.disturbX += this.disturbVX;
    this.disturbY += this.disturbVY;

    // Loose float motion when hit
    const inFocus = ease > 0.85; // More lenient focus range
    
    // Reset hit count when fully leaving focus (even if looseTimer is 0)
    if (ease < 0.5 && this.hitCount > 0) {
      this.hitCount = 0;
      this.looseTimer = 0;
      this.looseVX = 0;
      this.looseVY = 0;
      this.looseRadius = 10 + Math.random() * 18;
    }
    
    if (this.looseTimer > 0) {
      // While in focus, keep the broken state; allow decay when leaving focus
      if (!inFocus) {
        this.looseTimer = Math.max(0, this.looseTimer - dt * 4);
      }
      this.looseAngle += dt * (0.8 + this.depth * 0.4);
      const wobble = Math.sin(time * 1.4 + this.offset) * 0.6;
      const looseRadius = this.looseRadius + wobble * 6;
      this.looseVX *= inFocus ? 0.988 : 0.90;
      this.looseVY *= inFocus ? 0.988 : 0.90;

      const looseX = this.originX + Math.cos(this.looseAngle) * looseRadius + this.looseVX;
      const looseY = this.originY + Math.sin(this.looseAngle) * looseRadius + this.looseVY;
      const looseMix = Math.min(1, this.looseTimer / 0.4);
      
      // Full loose movement - more chaos with more hits
      const chaosThreshold = Math.max(0.3, 0.7 - this.hitCount * 0.15);
      if (inFocus && looseMix > chaosThreshold) {
        this.x = looseX;
        this.y = looseY;
      } else {
        this.x = baseX + parallaxX + this.disturbX + (looseX - baseX) * looseMix;
        this.y = baseY + parallaxY + this.disturbY + (looseY - baseY) * looseMix;
      }
    } else {
      this.x = baseX + parallaxX + this.disturbX;
      this.y = baseY + parallaxY + this.disturbY;
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
  const [isMobile, setIsMobile] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const inFocusRef = useRef(false);
  const clickPulseRef = useRef(0);
  const rippleRef = useRef<{ x: number; y: number; radius: number; strength: number }[]>([]);
  const clickCountRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Skip canvas animation on mobile
    if (isMobile) return;
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

      // Decay click pulse
      if (clickPulseRef.current > 0) {
        clickPulseRef.current = Math.max(0, clickPulseRef.current - 0.03);
      }

      // Advance ripples
      rippleRef.current = rippleRef.current
        .map((r) => ({
          ...r,
          radius: r.radius + 18,
          strength: Math.max(0, r.strength - 0.03),
        }))
        .filter((r) => r.strength > 0.02);

      const activeRipples = rippleRef.current;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse, progress, time, activeRipples);
        particles[i].draw(ctx, time, progress + clickPulseRef.current * 0.4);
      }

      // Render ripples - minimal and professional
      rippleRef.current.forEach((r) => {
        const ringAlpha = r.strength * 0.18;
        const ringWidth = 0.8;

        ctx.save();
        ctx.strokeStyle = `rgba(59,130,246,${ringAlpha})`;
        ctx.lineWidth = ringWidth;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle inner glow
        const innerRadius = Math.max(0, r.radius - 20);
        const innerGlow = ctx.createRadialGradient(r.x, r.y, innerRadius, r.x, r.y, r.radius + 20);
        innerGlow.addColorStop(0, "rgba(0,0,0,0)");
        innerGlow.addColorStop(0.5, `rgba(59,130,246,${ringAlpha * 0.15})`);
        innerGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius + 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

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

        const isInFocus = p >= 0.45 && p <= 0.75;
        if (inFocusRef.current !== isInFocus) {
          inFocusRef.current = isInFocus;
          setShowPrompt(isInFocus);
          if (!isInFocus) {
            clickCountRef.current = 0;
          }
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inFocusRef.current) return;
    clickCountRef.current++;
    clickPulseRef.current = 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rippleRef.current = [{ x, y, radius: 0, strength: 1 }];
  };

  // Simple mobile version - after all hooks
  if (isMobile && isMounted) {
    return (
      <div className={`relative w-full flex items-center justify-center py-16 ${className}`}>
        <h2 className="text-4xl font-black tracking-tight text-gradient text-center">
          {text}
        </h2>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-center justify-center ${height} ${className}`}
      style={{ backgroundColor: "var(--background)" }}
      onClick={handleClick}
    >
      {/* Background is transparent as requested */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      <div
        className={`absolute bottom-14 z-20 text-xs tracking-[0.35em] uppercase font-mono text-muted transition-opacity duration-500 ${showPrompt ? "opacity-70" : "opacity-0"}`}
      >
        Hover to explore
      </div>
    </div>
  );
}
