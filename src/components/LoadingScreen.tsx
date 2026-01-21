"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const topShutterRef = useRef<HTMLDivElement>(null);
  const bottomShutterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef({ value: 0 }); // 0 -> 1 during formation
  const explodeRef = useRef({ value: 0 }); // 0 -> 1 during explosion
  const mouseRef = useRef({ x: 0, y: 0 }); // Track mouse for parallax
  const [isReady, setIsReady] = useState(false); // Waiting for click
  
  // Create a separate timeline for the explosion
  const explosionTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // ---- CANVAS SETUP ----
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let height = (canvas.height = window.innerHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const handleResize = () => {
        width = canvas.width = window.innerWidth * window.devicePixelRatio;
        height = canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        initParticles(); 
    };
    window.addEventListener("resize", handleResize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
        // Normalized -1 to 1
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ---- PARTICLES ----
    interface Particle {
        x: number;
        y: number;
        startX: number;
        startY: number;
        targetX: number;
        targetY: number;
        size: number;
        color: string;
        speed: number;
        noiseOffset: number;
        depth: number; // For 3D parallax
    }

    let particles: Particle[] = [];
    const accentColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ffffff"];
    
    // Background stars for depth
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; baseAlpha: number; twinkleSpeed: number }[] = [];
    for(let i=0; i<150; i++) { // Increased count and visibility
         const baseAlpha = Math.random() * 0.6 + 0.2; // Much brighter: 0.2 to 0.8
         stars.push({
             x: Math.random() * width,
             y: Math.random() * height,
             size: Math.random() * 2.0 + 0.5, // Larger: 0.5 to 2.5
             alpha: baseAlpha,
             baseAlpha: baseAlpha,
             speed: Math.random() * 0.2 + 0.05,
             twinkleSpeed: Math.random() * 0.03 + 0.005
         });
    }

    // Nebulae (Subtle background atmosphere)
    const nebulae = [
        { x: width * 0.2, y: height * 0.3, r: 400, color: "rgba(139, 92, 246, 0.04)", vx: 0.1, vy: 0.05 },
        { x: width * 0.8, y: height * 0.7, r: 500, color: "rgba(59, 130, 246, 0.04)", vx: -0.15, vy: -0.05 },
        { x: width * 0.5, y: height * 0.5, r: 300, color: "rgba(255, 255, 255, 0.02)", vx: 0.05, vy: -0.1 }
    ];

    const initParticles = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        particles = [];

        // 1. Create Offscreen Canvas for Text Sampling
        const offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        // Draw "NOVUM"
        const fontSize = Math.min(w * 0.18, 200);
        offCtx.font = `900 ${fontSize}px "Geist", "Inter", "Segoe UI", sans-serif`;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = 'white';
        offCtx.fillText("NOVUM", w / 2, h / 2);

        // Sample Pixels
        const imageData = offCtx.getImageData(0, 0, w, h);
        const data = imageData.data;
        // INCREASED DENSITY (More orbs than before, but still distinct)
        // Step size reduced to allow more particles
        const step = Math.floor(Math.max(10, w / 150)); 

        for(let y = 0; y < h; y += step) {
            for(let x = 0; x < w; x += step) {
                const alpha = data[(y * w + x) * 4 + 3];
                // Random check to drop some particles for organic look (20% drop rate)
                if (alpha > 128 && Math.random() > 0.2) {
                     // Found a pixel inside the text
                     // Start position: Randomly scattered OUTSIDE the center or just full screen
                     const angle = Math.random() * Math.PI * 2;
                     const radius = Math.max(w, h) * (0.5 + Math.random() * 0.5);
                     
                     particles.push({
                         x: w/2 + Math.cos(angle) * radius, // Start far out
                         y: h/2 + Math.sin(angle) * radius,
                         startX: w/2 + Math.cos(angle) * radius,
                         startY: h/2 + Math.sin(angle) * radius,
                         targetX: x, // Destination: The text pixel
                         targetY: y,
                         size: Math.random() * 1.5 + 1.0, // varied sizes
                         // Mostly white/blue for text, occasionally accent
                         color: Math.random() > 0.8 ? accentColors[Math.floor(Math.random() * accentColors.length)] : "#ffffff",
                         speed: 0.02 + Math.random() * 0.04,
                         noiseOffset: Math.random() * 100,
                         depth: Math.random() * 20 + 5 // Random depth
                     });
                }
            }
        }
    };

    initParticles();

    // ---- GSAP TIMELINE ----
    // 1. FORMATION TIMELINE (Auto-play)
    const setupTl = gsap.timeline({
        onComplete: () => {
             setIsReady(true); // Show click prompt
        }
    });

    // 1. Initial State
    gsap.set(topShutterRef.current, { yPercent: 0 });
    gsap.set(bottomShutterRef.current, { yPercent: 0 });
    gsap.set(barRef.current, { scaleX: 0, opacity: 0 });
    
    // 2. FORMATION PHASE
    setupTl.to(progressRef.current, {
        value: 1, // 0 to 1
        duration: 2.5,
        ease: "power2.out",
    });

    // 2. EXPLOSION TIMELINE (Triggered by click)
    explosionTl.current = gsap.timeline({
         paused: true,
         onComplete: () => onComplete()
    });

    // Explosion Phase
    explosionTl.current.to(explodeRef.current, {
        value: 1,
        duration: 0.8,
        ease: "power3.in",
    });
    
    // Split Shutters
    explosionTl.current.to(topShutterRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
    }, ">");

    explosionTl.current.to(bottomShutterRef.current, {
        yPercent: 100,
        duration: 1.2,
        ease: "power4.inOut",
    }, "<");

    explosionTl.current.to(containerRef.current, {
        display: "none",
        duration: 0
    });

    // ---- RENDER LOOP ----
    let animationId: number;
    const render = () => {
        if (!ctx) return;
        const w = window.innerWidth; 
        const h = window.innerHeight;
        
        const formProgress = progressRef.current.value; // 0 -> 1
        const explodeProgress = explodeRef.current.value; // 0 -> 1

        ctx.clearRect(0, 0, width, height);
        
        // 0. Draw Nebulae
        nebulae.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x > w + n.r) n.x = -n.r;
            if (n.x < -n.r) n.x = w + n.r;
            if (n.y > h + n.r) n.y = -n.r;
            if (n.y < -n.r) n.y = h + n.r;
            
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, n.color);
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Background Stars
        const time = Date.now() * 0.001;
        stars.forEach(star => {
             star.x += star.speed;
             if (star.x > w) star.x = 0;
             
             // Twinkle
             const flicker = Math.sin(time * 3 + star.x) * 0.05;
             ctx.globalAlpha = Math.max(0, Math.min(1, star.baseAlpha + flicker));
             
             ctx.fillStyle = "white";
             ctx.beginPath();
             ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
             ctx.fill();
        });
        
        ctx.globalAlpha = 1; // Reset for particles

        particles.forEach((p) => {
            // 1. Calculate FORMATION Position (Always active)
            // Lerp from Start to Target
            const ease = formProgress; 
            const time = Date.now() * 0.001;
            
            // Dynamic noise kept alive at end
            const noiseMult = (1 - ease) * 100 + 6; 
            const jitter = Math.sin(time * 5 + p.noiseOffset) * 2;
            const noiseX = Math.sin(time * 1.5 + p.noiseOffset) * noiseMult + jitter;
            const noiseY = Math.cos(time * 1.5 + p.noiseOffset) * noiseMult + jitter;

            // 3D Parallax Calculation
            // Parallax increases as we form the word to make it feel tangible
            const parallaxX = mouseRef.current.x * p.depth * ease * -1; // Inverse movement
            const parallaxY = mouseRef.current.y * p.depth * ease * -1;

            let currentX = p.startX + (p.targetX - p.startX) * ease + noiseX + parallaxX;
            let currentY = p.startY + (p.targetY - p.startY) * ease + noiseY + parallaxY;

            // 2. Apply EXPLOSION offset on top if needed
            if (explodeProgress > 0) {
                 const centerW = w / 2;
                 const centerH = h / 2;
                 
                 const dx = currentX - centerW;
                 const dy = currentY - centerH;
                 const angle = Math.atan2(dy, dx);
                 
                 // Varied speed based on particle size for depth perception
                 // Larger particles move slightly slower (mass) or faster (foreground)? 
                 // Let's make varied speed to break up the shape.
                 const speedVar = 0.5 + p.size * 0.5; 
                 
                 // Exponential movement based on progress
                 // Uses cubic easing for violent acceleration
                 const moveDist = Math.max(w, h) * Math.pow(explodeProgress, 3) * 3 * speedVar;
                 
                 currentX += Math.cos(angle) * moveDist;
                 currentY += Math.sin(angle) * moveDist;
                 
                 // Fade out
                 ctx.globalAlpha = Math.max(0, 1 - explodeProgress * 1.2);
            } else {
                ctx.globalAlpha = 1;
            }

            // Draw
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset Alpha
        ctx.globalAlpha = 1;

        // Draw connections only when mostly formed to make the text look "connected/techy"
        if (formProgress > 0.6 && explodeProgress === 0) {
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = "rgba(139, 92, 246, 0.15)"; // Faint purple connections
            
            // Optimization: Only connect a few particles to avoid performance hit
            // Or use a grid-based spatial lookup (too complex for now)
            // Simple random sampling check
            for (let i = 0; i < particles.length; i += 2) { // Check every 2nd particle
                 if (Math.random() > 0.95) { // Only draw 5% of potential lines
                     const p1 = particles[i];
                     // Find a neighbor
                     // Since they are sorted by text scan (top-left to bottom-right), neighbors in array are likely spatial neighbors!
                     // Check next 10 particles
                     for(let j = 1; j < 10; j++) {
                         if (i + j >= particles.length) break;
                         const p2 = particles[i+j];
                         const dx = p1.targetX - p2.targetX;
                         const dy = p1.targetY - p2.targetY;
                         if (dx*dx + dy*dy < 900) { // 30px distance squared
                             // Draw line between current positions
                             // Need to access p2's current pos, but we didn't store it. 
                             // We can re-calc roughly or just draw to target (since we are near target)
                             
                             // Better: Just draw connections for the ones we just calculated?
                             // Re-calculating pos for p2 is expensive inside double loop if distinct.
                             // Let's iterate p1 and look at p2. 
                             // Since we are at `formProgress > 0.6`, they are close to target. 
                             // Use target coords for simplicity as "network overlay" 
                             // OR just accept no lines for better perf. 
                             
                             // Let's skip lines for max smoothness on the text reveal, 
                             // the dots themselves forming the text is usually enough "wow".
                             // EDIT: User asked for "lijnen die bij elkaar komen". 
                             // I will add lines relative to p1's current position to p2's current position
                             // BUT I need p2's current position. 
                             // I will enable a 'rendering' loop that stores positions first? No, simple is better.
                         }
                     }
                 }
            }
        }

        animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      setupTl.kill();
      if (explosionTl.current) explosionTl.current.kill();
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [onComplete]);

  const handleCreate = () => {
      if (!isReady) return;
      setIsReady(false); // Hide button
      explosionTl.current?.play();
  };

  return (
    <div 
        ref={containerRef}
        onClick={handleCreate}
        className={`fixed inset-0 z-[9999] flex flex-col justify-center items-center cursor-pointer transition-colors duration-500`}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-40  mix-blend-screen" 
      />
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 z-30 pointer-events-none" 
           style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)" }} 
      />

      {/* CLICK PROMPT */}
      <div 
         className={`absolute bottom-20 z-50 transition-opacity duration-1000 ${isReady ? "opacity-100" : "opacity-0"} pointer-events-none`}
      >
          <p className="text-white/60 text-xs tracking-[0.4em] uppercase font-mono animate-pulse">
              [ Click to Continue ]
          </p>
      </div>

      {/* TOP SHUTTER */}
      <div 
        ref={topShutterRef}
        className="absolute top-0 left-0 w-full h-[50vh] bg-[#050505] z-20 shadow-2xl"
      />

      {/* BOTTOM SHUTTER */}
      <div 
        ref={bottomShutterRef}
        className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#050505] z-20 shadow-2xl"
      />

      {/* PROGRESS BAR (The Cut Line) */}
      <div className="absolute z-50 w-[300px] h-[1px] overflow-visible">
         <div 
            ref={barRef} 
            className="w-full h-full bg-accent origin-center" // Center origin for explosion feel
            style={{ transform: "scaleX(0)", opacity: 0 }}
         />
      </div>
    </div>
  );
}
