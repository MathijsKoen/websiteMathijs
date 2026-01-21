"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextExplosionTransitionProps {
  id?: string;
  height?: number;
  title: string;
  subtitle?: string;
  colors?: string[];
}

export default function TextExplosionTransition({
  id = "text-explosion-transition",
  height = 100,
  title,
  subtitle,
  colors = ["#3b82f6", "#60a5fa", "#8b5cf6", "#06b6d4"],
}: TextExplosionTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [charStates, setCharStates] = useState<{ opacity: number; y: number; rotateX: number }[]>([]);

  // Memoize colors to prevent unnecessary re-renders that reset the animation
  const stableColors = useMemo(() => colors, [colors.join(",")]);

  useEffect(() => {
    setMounted(true);
    // Initialize char states
    setCharStates(title.split("").map(() => ({ opacity: 0, y: 100, rotateX: -90 })));
  }, [title]);

  useEffect(() => {
    if (!mounted) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const currentColors = stableColors;

    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      startX: number;
      startY: number;
      size: number;
      color: string;
      angle: number;
      spin: number;
      trail: { x: number; y: number }[];
    }

    let particles: Particle[] = [];
    let animationId: number;

    // Use a mutable object for progress so GSAP can tween it
    const progressRef = { value: 0 };

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const createParticles = () => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      particles = [];

      for (let i = 0; i < 200; i++) {
        const seed = i * 1000;
        const angle = (i / 200) * Math.PI * 2;
        const moveAngle = angle + (seededRandom(seed + 1) - 0.5); // Slight randomness to direction
        
        // Swap: Start near center (Inside), Target far away (Outside)
        const startRad = 50 + seededRandom(seed + 3) * 100;
        
        // REDUCED: Target is now just outside the visible text area, but not totally off-screen
        const maxDimension = Math.max(rect.width, rect.height);
        const endRad = maxDimension * (0.35 + seededRandom(seed + 2) * 0.25); // ~35% - 60% of screen

        const startX = centerX + Math.cos(angle) * startRad;
        const startY = centerY + Math.sin(angle) * (startRad * 0.6); // Oval shape
        
        const targetX = centerX + Math.cos(moveAngle) * endRad;
        const targetY = centerY + Math.sin(moveAngle) * (endRad * 0.8); // Slightly oval explosion

        particles.push({
          x: startX,
          y: startY,
          targetX: targetX,
          targetY: targetY,
          startX: startX,
          startY: startY,
          size: 2 + seededRandom(seed + 5) * 6,
          color: currentColors[Math.floor(seededRandom(seed + 6) * currentColors.length)],
          angle: angle,
          spin: (seededRandom(seed + 8) - 0.5) * 0.2,
          trail: [],
        });
      }

      for (let ring = 0; ring < 3; ring++) {
        // Dispersed rings - no longer perfect circles
        const baseRadius = 150 + ring * 80;
        const particlesInRing = 30 + ring * 10;
        
        for (let i = 0; i < particlesInRing; i++) {
          const angle = (i / particlesInRing) * Math.PI * 2;
          // Fix: Ensure random seed isn't zero for first ring (ring=0)
          // Increased randomness for more dispersion
          const randomOffset = seededRandom(i * (ring + 1) * 123 + i) * 100 - 50; 
          const randomAngleOffset = (seededRandom(i * (ring + 1) * 456 + i) - 0.5) * 0.6; 

          const r = baseRadius + randomOffset;
          const a = angle + randomAngleOffset;
          
          particles.push({
            x: centerX,
            y: centerY,
            targetX: centerX + Math.cos(a) * r,
            targetY: centerY + Math.sin(a) * r,
            startX: centerX,
            startY: centerY,
            size: 3 + ring,
            color: currentColors[ring % currentColors.length],
            angle: angle,
            spin: 0.05,
            trail: [],
          });
        }
      }
    };

    createParticles();

    const easeOutExpo = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Read current progress from the tweened object
      const currentProgress = progressRef.value;
      
      ctx.clearRect(0, 0, width, height);

      if (currentProgress > 0.3) {
        // Dynamic pulsing lines
        const time = Date.now();
        const pulse = (Math.sin(time * 0.005) + 1) * 0.5; // 0 to 1
        const lineOpacity = (currentProgress - 0.3) * (0.1 + pulse * 0.15); // Dynamic opacity
        
        ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, lineOpacity)})`;
        ctx.lineWidth = 0.5 + pulse * 0.5; // Breathing line width
        
        particles.forEach((p, i) => {
          particles.slice(i + 1, i + 5).forEach((p2) => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 + pulse * 20) { // Dynamic connection distance
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        });
      }

      particles.forEach((p) => {
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.pop();

        // Smooth particle movement from Start to Target
        // Start almost immediately (0.05) to avoid static begin state, spread over full duration
        const moveProgress = Math.max(0, (currentProgress - 0.05) / 0.95);
        const easeVal = easeOutExpo(moveProgress);
        
        // Linear interpolation from Start to Target
        const baseX = p.startX + (p.targetX - p.startX) * easeVal;
        const baseY = p.startY + (p.targetY - p.startY) * easeVal;
        
        p.x = baseX;
        p.y = baseY;

        // Idle animation / "Living" start state
        // When progress is low, we want the formation to feel alive (breathe, rotate)
        const idleIntensity = Math.max(0, 1 - moveProgress * 4); // Fade out by 25% progress
        
        if (idleIntensity > 0) {
           const time = Date.now();
           // Gentle rotation
           const angle = time * 0.0003;
           const centerX = width / 2;
           const centerY = height / 2;
           
           const dx = p.startX - centerX;
           const dy = p.startY - centerY;
           
           // Rotate
           const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
           const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
           
           // Breathe
           const breathe = 1 + Math.sin(time * 0.0015) * 0.05;
           
           const targetIdleX = centerX + rotatedX * breathe;
           const targetIdleY = centerY + rotatedY * breathe;
           
           // Apply drift relative to the static start pos
           p.x += (targetIdleX - p.startX) * idleIntensity;
           p.y += (targetIdleY - p.startY) * idleIntensity;
        }

        // Add wobble when they are close to formed/target state
        if (moveProgress > 0.8) {
          const wobbleStrength = (moveProgress - 0.8) / 0.2; // 0 to 1
          const time = Date.now();
          const wobbleAmount = 3 * wobbleStrength;
          const wobbleX = Math.sin(time * 0.003 + p.angle * 10) * wobbleAmount;
          const wobbleY = Math.cos(time * 0.002 + p.angle * 8) * (wobbleAmount * 0.6);
          
          p.x += wobbleX;
          p.y += wobbleY;
        }

        // Show trails during movement phase
        if (currentProgress > 0.1 && currentProgress < 0.9) {
          p.trail.forEach((t, i) => {
            const alpha = (1 - i / p.trail.length) * 0.3 * (1 - Math.abs(currentProgress - 0.5) * 2 * 0.5); 
            // Fade trails at start and end
            if (alpha <= 0) return;
            
            ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, p.size * (1 - i / p.trail.length) * 0.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        const time = Date.now();
        const glowSize = p.size * (1 + Math.sin(time * 0.01 + p.angle) * 0.3);
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize * 3);
        gradient.addColorStop(0, `${p.color}60`);
        gradient.addColorStop(0.5, `${p.color}20`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Show central glow during animation phase only
      if (currentProgress > 0.3 && currentProgress < 0.8) {
        const glowIntensity = Math.sin((currentProgress - 0.3) / 0.5 * Math.PI);
        const centerX = width / 2;
        const centerY = height / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${glowIntensity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${glowIntensity * 0.2})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 75%", // Start later (was top bottom)
      end: "bottom 10%", // End much later (was center 30%) to make the explosion slower/longer
      scrub: 1.5, // Increased from 1 for smoother, weightier feel
      animation: gsap.fromTo(progressRef, { value: 0 }, { 
        value: 1, 
        ease: "none",
        onUpdate: () => {
          // Sync React state with GSAP tween progress for smoother text
          const p = progressRef.value;
          // Faster text appearance: Complete text animation in first 35% of scroll (was 60%)
          const textProgress = Math.max(0, p / 0.35);
          const chars = title.split("");
          
          // Only update state if needed to avoid excessive renders, 
          // though React batches well usually.
          const newStates = chars.map((_, i) => {
            const charProgress = Math.max(0, Math.min(1, (textProgress * chars.length - i) / 1.2));
            const eased = charProgress < 1 ? 1 - Math.pow(1 - charProgress, 3) : 1;
            return { opacity: eased, y: 100 * (1 - eased), rotateX: -90 * (1 - eased) };
          });
          setCharStates(newStates);
        }
      })
    });

    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: container, start: "top 50%", end: "center center", scrub: 1 } }
      );
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
    };
  }, [mounted, title, stableColors]);

  const chars = title.split("");

  return (
    <div ref={containerRef} id={id} className="relative overflow-hidden bg-gradient-to-b from-transparent via-accent/5 to-transparent" style={{ minHeight: `${height}vh` }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-20 px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center" style={{ perspective: "1000px" }}>
          {chars.map((char, i) => (
            <span
              key={i}
              ref={(el) => { charsRef.current[i] = el; }}
              className="inline-block"
              style={{
                opacity: mounted ? charStates[i]?.opacity ?? 0 : 0,
                transform: mounted ? `translateY(${charStates[i]?.y ?? 100}px) rotateX(${charStates[i]?.rotateX ?? -90}deg)` : "translateY(100px) rotateX(-90deg)",
                background: "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 50%, var(--accent-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>
        {subtitle && <p ref={subtitleRef} className="mt-6 text-xl md:text-2xl text-muted max-w-2xl text-center opacity-0">{subtitle}</p>}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 0%, var(--background) 80%)" }} />
    </div>
  );
}
