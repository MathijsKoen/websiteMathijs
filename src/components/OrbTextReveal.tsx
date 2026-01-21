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
  startX: number;
  startY: number;
  size: number;
  color: string;
  // New properties for dynamic movement
  angle: number;
  speed: number;
  offset: number;
  
  constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    this.originX = x;
    this.originY = y;
    
    // Start from a more chaotic, explosive distribution
    const angle = Math.random() * Math.PI * 2;
    // Reduced scatter distance (was canvasWidth) to keep it calmer and closer
    const distance = Math.random() * 150 + 50; 
    this.startX = canvasWidth / 2 + Math.cos(angle) * distance;
    this.startY = canvasHeight / 2 + Math.sin(angle) * distance;
    
    // Initialize current position to start position to fix TypeScript error
    this.x = this.startX;
    this.y = this.startY;

    this.size = Math.random() * 2.5 + 1.5;
    const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#ffffff"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.02 + Math.random() * 0.03;
    this.offset = Math.random() * 100;
  }

  update(mouse: { x: number; y: number; radius: number }, progress: number) {
    // Basic progression
    // Add swirl/tangential movement based on remaining distance
    const dx = this.originX - this.startX;
    const dy = this.originY - this.startY;
    
    // Easing: enhance the entry
    const t = progress;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    
    // Spiral effect calculation
    // Particles spiral in towards their target
    const spiralRadius = (1 - ease) * 200; // Radius shrinks as we get closer
    // Increased rotation to Math.PI * 3 so the spinning effect lasts "longer"/is more pronounced
    const spiralAngle = this.angle + (ease * Math.PI * 3); 
    
    const spiralX = Math.cos(spiralAngle + this.offset) * spiralRadius;
    const spiralY = Math.sin(spiralAngle + this.offset) * spiralRadius;

    // Target position interpolation
    let targetX = this.startX + dx * ease;
    let targetY = this.startY + dy * ease;
    
    // Add spiral offset - removed the < 0.9 check so it spirals all the way in
    targetX += spiralX;
    targetY += spiralY;

    this.x = targetX;
    this.y = targetY;

    // Mouse interaction (repel)
    const mdx = mouse.x - this.x;
    const mdy = mouse.y - this.y;
    // Optimization: Use squared distance to avoid expensive sqrt on every frame
    const distSq = mdx * mdx + mdy * mdy;
    const radiusSq = mouse.radius * mouse.radius;

    if (distSq < radiusSq) {
      const distance = Math.sqrt(distSq);
      const forceDirectionX = mdx / distance;
      const forceDirectionY = mdy / distance;
      const force = (mouse.radius - distance) / mouse.radius;
      // Repel force stronger when assembled
      const strength = 5 * Math.max(0.2, progress); 
      
      this.x -= forceDirectionX * force * strength;
      this.y -= forceDirectionY * force * strength;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
      canvas.width = rect.width;
      canvas.height = rect.height;

      const fontSize = Math.min(canvas.width / (text.length * 0.7), 120);
      
      ctx.fillStyle = "white";
      ctx.font = `900 ${fontSize}px "Inter", "system-ui", sans-serif`; 
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles = [];
      const step = 5; // Density

      for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
             const alpha = textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3];
          if (alpha > 128) {
            particles.push(new Particle(x, y, canvas.width, canvas.height));
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse, progress);
        particles[i].draw(ctx);
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
        // Modified to hold the "assembled" state longer
        const p = self.progress;
        
        // Assemble slowly (0 -> 40%) - Delays the "lock"
        if (p < 0.4) {
          progress = gsap.utils.interpolate(0, 1, p / 0.4);
        } 
        // Disperse in the last 20%
        else if (p > 0.8) {
          progress = gsap.utils.interpolate(1, 0, (p - 0.8) / 0.2);
        } 
        // Hold assembled in the middle (40% -> 80%)
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
    <div ref={containerRef} className={`relative w-full overflow-hidden flex items-center justify-center ${height} ${className}`}>
      {/* Background is transparent as requested */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  );
}
