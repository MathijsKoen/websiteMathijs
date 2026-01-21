"use client";

import { useRef, useEffect, ReactNode, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Seeded random for consistent SSR/client values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface GeometricRevealTransitionProps {
  children?: ReactNode;
  id?: string;
  height?: number;
  colors?: string[];
  shapeCount?: number;
}

type ShapeType = "circle" | "hexagon" | "triangle" | "diamond";

interface Shape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
}

export default function GeometricRevealTransition({
  children,
  id = "geometric-reveal-transition",
  height = 100,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"],
  shapeCount = 12,
}: GeometricRevealTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate shapes with seeded random for SSR consistency
  const shapes: Shape[] = useMemo(() => Array.from({ length: shapeCount }, (_, i) => {
    const types: ShapeType[] = ["circle", "hexagon", "triangle", "diamond"];
    const gridCols = 4;
    const gridRows = Math.ceil(shapeCount / gridCols);
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const seed = i * 1000;
    
    return {
      id: i,
      type: types[i % types.length],
      x: (col / (gridCols - 1)) * 100,
      y: (row / (gridRows - 1)) * 100,
      size: 80 + seededRandom(seed + 1) * 60,
      rotation: seededRandom(seed + 2) * 360,
      color: colors[i % colors.length],
      delay: (col + row) * 0.08,
    };
  }), [shapeCount, colors]);


  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // Animate shapes in
      shapesRef.current.forEach((shape, i) => {
        if (!shape) return;
        
        const shapeData = shapes[i];
        const startX = shapeData.x < 50 ? -200 : 200;
        const startY = shapeData.y < 50 ? -200 : 200;
        
        tl.fromTo(
          shape,
          {
            x: startX,
            y: startY,
            scale: 0,
            rotation: shapeData.rotation - 180,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: shapeData.rotation,
            opacity: 0.7,
            duration: 1,
            ease: "back.out(1.2)",
          },
          shapeData.delay
        );
      });

      // Content reveal
      if (content) {
        tl.fromTo(
          content,
          {
            opacity: 0,
            scale: 0.8,
            y: 50,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          0.3
        );
      }

      // Shapes expand and fade out
      shapesRef.current.forEach((shape, i) => {
        if (!shape) return;
        
        const shapeData = shapes[i];
        
        tl.to(
          shape,
          {
            scale: 2.5,
            opacity: 0,
            rotation: shapeData.rotation + 90,
            duration: 1,
            ease: "power2.in",
          },
          0.8 + shapeData.delay
        );
      });
    }, container);

    return () => ctx.revert();
  }, [shapes]);

  const getShapeClipPath = (type: ShapeType): string => {
    switch (type) {
      case "circle":
        return "circle(50% at 50% 50%)";
      case "hexagon":
        return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
      case "triangle":
        return "polygon(50% 0%, 100% 100%, 0% 100%)";
      case "diamond":
        return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
      default:
        return "circle(50% at 50% 50%)";
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Geometric shapes */}
      {shapes.map((shape, i) => (
        <div
          key={shape.id}
          ref={(el) => {
            shapesRef.current[i] = el;
          }}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              clipPath: getShapeClipPath(shape.type),
              background: `linear-gradient(135deg, ${shape.color}40 0%, ${shape.color}20 100%)`,
              backdropFilter: "blur(8px)",
              border: `2px solid ${shape.color}60`,
              boxShadow: `0 0 30px ${shape.color}30`,
            }}
          />
        </div>
      ))}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors[1]} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {shapes.slice(0, -1).map((shape, i) => {
          const nextShape = shapes[i + 1];
          return (
            <line
              key={`line-${i}`}
              x1={`${shape.x}%`}
              y1={`${shape.y}%`}
              x2={`${nextShape.x}%`}
              y2={`${nextShape.y}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              strokeDasharray="5,5"
              className="opacity-30"
            />
          );
        })}
      </svg>

      {/* Content */}
      {children && (
        <div
          ref={contentRef}
          className="relative z-10 flex items-center justify-center min-h-full py-20"
        >
          {children}
        </div>
      )}

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, ${colors[0]}10 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, ${colors[1]}10 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
