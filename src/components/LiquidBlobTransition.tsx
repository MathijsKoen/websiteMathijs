"use client";

import { useRef, useEffect, ReactNode, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LiquidBlobTransitionProps {
  children?: ReactNode;
  id?: string;
  height?: number;
  colors?: string[];
}

// Seeded random number generator for consistent values
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate organic blob path with seed for consistency
function generateBlobPath(variance: number, seed: number): string {
  const random = seededRandom(seed);
  const points = 8;
  const angleStep = (Math.PI * 2) / points;
  const radius = 150;
  
  let path = "";
  const controlPoints: { x: number; y: number }[] = [];
  
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const r = radius * (1 + (random() - 0.5) * variance);
    controlPoints.push({
      x: 200 + Math.cos(angle) * r,
      y: 200 + Math.sin(angle) * r,
    });
  }
  
  path = `M ${controlPoints[0].x} ${controlPoints[0].y}`;
  
  for (let i = 0; i < points; i++) {
    const curr = controlPoints[i];
    const next = controlPoints[(i + 1) % points];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    path += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
  }
  
  path += " Z";
  return path;
}

// Pre-computed deterministic paths
const INITIAL_PATHS = [
  generateBlobPath(0.3, 12345),
  generateBlobPath(0.4, 67890),
  generateBlobPath(0.35, 11111),
];

export default function LiquidBlobTransition({
  children,
  id = "liquid-blob-transition",
  height = 100,
  colors = ["#3b82f6", "#60a5fa", "#8b5cf6"],
}: LiquidBlobTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const blobsRef = useRef<SVGPathElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    // Animate blobs based on scroll
    const ctx = gsap.context(() => {
      // Main timeline for the transition
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // Animate each blob with different timing
      blobsRef.current.forEach((blob, i) => {
        if (!blob) return;
        
        const delay = i * 0.1;
        
        tl.fromTo(
          blob,
          {
            scale: 0,
            opacity: 0,
            transformOrigin: "center center",
          },
          {
            scale: 1.2 + i * 0.3,
            opacity: 0.6 - i * 0.15,
            duration: 1,
            ease: "power2.out",
          },
          delay
        ).to(
          blob,
          {
            scale: 2 + i * 0.5,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
          },
          0.5 + delay
        );
      });

      // Continuous morphing animation with seeded randomness
      blobsRef.current.forEach((blob, i) => {
        if (!blob) return;
        
        // Create organic movement with deterministic target
        gsap.to(blob, {
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          attr: {
            d: generateBlobPath(0.3 + i * 0.05, 22222 + i * 1000),
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* SVG Blobs */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="blob-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {colors.map((color, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`blob-gradient-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors[(i + 1) % colors.length]} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>
        
        {INITIAL_PATHS.map((path, i) => (
          <path
            key={i}
            ref={(el) => {
              if (el) blobsRef.current[i] = el;
            }}
            d={path}
            fill={`url(#blob-gradient-${i})`}
            filter="url(#blob-glow)"
            className="origin-center"
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
      </svg>

      {/* Content */}
      {children && (
        <div className="relative z-10 flex items-center justify-center min-h-full py-20">
          {children}
        </div>
      )}

      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 70%)",
        }}
      />
    </div>
  );
}
