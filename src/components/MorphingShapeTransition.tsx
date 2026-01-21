"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MorphingShapeTransitionProps {
  id?: string;
  height?: number;
  title: string;
  subtitle?: string;
  colors?: string[];
}

export default function MorphingShapeTransition({
  id = "morphing-shape-transition",
  height = 100,
  title,
  subtitle,
  colors = ["#3b82f6", "#8b5cf6", "#06b6d4"],
}: MorphingShapeTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);
  const [wordStates, setWordStates] = useState<{ y: number; opacity: number }[]>([]);

  const words = useMemo(() => title.split(" "), [title]);

  useEffect(() => {
    setMounted(true);
    setWordStates(words.map(() => ({ y: 120, opacity: 0 })));
  }, [words]);

  // Pre-defined shape paths for morphing
  const shapes = useMemo(() => ({
    circle: "M 200,50 C 283,50 350,117 350,200 C 350,283 283,350 200,350 C 117,350 50,283 50,200 C 50,117 117,50 200,50 Z",
    star: "M 200,30 L 230,140 L 350,140 L 255,200 L 290,320 L 200,250 L 110,320 L 145,200 L 50,140 L 170,140 Z",
    blob1: "M 200,50 C 300,80 350,150 340,220 C 330,290 280,340 200,350 C 120,360 60,300 55,220 C 50,140 100,70 200,50 Z",
    blob2: "M 180,40 C 280,30 370,120 350,200 C 330,280 240,360 160,340 C 80,320 30,240 50,160 C 70,80 120,50 180,40 Z",
    square: "M 80,80 L 320,80 L 320,320 L 80,320 Z",
    diamond: "M 200,40 L 360,200 L 200,360 L 40,200 Z",
  }), []);

  const interpolatePath = (path1: string, path2: string, t: number): string => {
    const coords1 = path1.match(/-?\d+\.?\d*/g)?.map(Number) || [];
    const coords2 = path2.match(/-?\d+\.?\d*/g)?.map(Number) || [];
    
    if (coords1.length !== coords2.length) return path1;
    
    const interpolated = coords1.map((c1, i) => {
      const c2 = coords2[i];
      return c1 + (c2 - c1) * t;
    });
    
    let result = path1;
    let idx = 0;
    result = result.replace(/-?\d+\.?\d*/g, () => interpolated[idx++].toFixed(1));
    
    return result;
  };

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const shapePaths = svg.querySelectorAll(".morph-shape");
    
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 0.5,
      onUpdate: (self) => {
        setMorphProgress(self.progress);
        
        // Update word animations
        const textProgress = Math.max(0, (self.progress - 0.2) / 0.5);
        const newStates = words.map((_, i) => {
          const wordProgress = Math.max(0, Math.min(1, (textProgress * words.length - i * 0.5) / 1.5));
          const eased = 1 - Math.pow(1 - wordProgress, 4);
          return { y: 120 * (1 - eased), opacity: eased };
        });
        setWordStates(newStates);
      },
    });

    const ctx = gsap.context(() => {
      gsap.to(shapePaths, {
        scale: 1.5,
        rotation: 360,
        opacity: 0.6,
        scrollTrigger: { trigger: container, start: "top 80%", end: "bottom 20%", scrub: 1 },
      });

      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: container, start: "top 50%", end: "center center", scrub: 1 } }
        );
      }
    }, container);

    return () => {
      trigger.kill();
      ctx.revert();
    };
  }, [mounted, words]);

  const getCurrentShape = (index: number) => {
    const shapeKeys = Object.keys(shapes) as (keyof typeof shapes)[];
    const totalShapes = shapeKeys.length;
    const cycleProgress = (morphProgress * 2 + index * 0.3) % 1;
    
    const currentIdx = Math.floor(cycleProgress * (totalShapes - 1));
    const nextIdx = (currentIdx + 1) % totalShapes;
    const localProgress = (cycleProgress * (totalShapes - 1)) % 1;

    return interpolatePath(
      shapes[shapeKeys[currentIdx]],
      shapes[shapeKeys[nextIdx]],
      localProgress
    );
  };

  // Pre-computed orb positions - reduced for performance
  const orbPositions = useMemo(() => 
    [...Array(4)].map((_, i) => ({
      size: 80 + i * 40,
      x: ((i * 137.5) % 100),
      y: ((i * 73.2) % 100),
    })), []
  );

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${30 + morphProgress * 40}% ${30 + morphProgress * 40}%, ${colors[0]}15 0%, transparent 50%),
                       radial-gradient(ellipse at ${70 - morphProgress * 40}% ${70 - morphProgress * 40}%, ${colors[1]}15 0%, transparent 50%)`,
        }}
      />

      {/* Morphing SVG shapes */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {colors.map((color, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`morph-gradient-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors[(i + 1) % colors.length]} stopOpacity="0.2" />
            </linearGradient>
          ))}
          <filter id="morph-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="morph-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Multiple morphing shapes - reduced to 2 for performance */}
        {[0, 1].map((i) => (
          <g
            key={i}
            className="morph-shape"
            style={{
              transformOrigin: "center",
              transform: `scale(${0.7 + i * 0.4}) rotate(${morphProgress * 90 * (i % 2 === 0 ? 1 : -1)}deg)`,
              opacity: 0.35 - i * 0.1,
            }}
          >
            <path
              d={getCurrentShape(i)}
              fill={`url(#morph-gradient-${i})`}
            />
          </g>
        ))}
      </svg>

      {/* Floating orbs - reduced for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbPositions.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              background: `radial-gradient(circle, ${colors[i % colors.length]}25 0%, transparent 70%)`,
              transform: `translate(-50%, -50%) scale(${1 + morphProgress * 0.3})`,
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-20 px-6">
        <h2
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-center leading-tight flex flex-wrap justify-center gap-x-4"
          style={{
            background: `linear-gradient(135deg, var(--foreground) 0%, ${colors[0]} 50%, ${colors[1]} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: mounted && wordStates[i] ? wordStates[i].opacity : 0,
                transform: mounted && wordStates[i] 
                  ? `translateY(${wordStates[i].y}px) rotateX(${wordStates[i].y * 0.5}deg)`
                  : "translateY(100px) rotateX(50deg)",
                transition: "none",
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-8 text-xl md:text-2xl text-muted max-w-2xl text-center"
          >
            {subtitle}
          </p>
        )}

        {/* Animated line */}
        <div
          className="mt-12 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{
            width: `${20 + morphProgress * 30}%`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
