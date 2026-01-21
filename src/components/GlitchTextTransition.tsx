"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GlitchTextTransitionProps {
  id?: string;
  height?: number;
  title: string;
  subtitle?: string;
  colors?: string[];
}

const GLITCH_CHARS = "@#$%&*01";

// Seeded random for hydration safety
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function GlitchTextTransition({
  id = "glitch-text-transition",
  height = 100,
  title,
  subtitle,
  colors = ["#3b82f6", "#06b6d4", "#8b5cf6"],
}: GlitchTextTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [displayText, setDisplayText] = useState(title);
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const progressRef = useRef(0);

  // Pre-computed bar positions using seeds
  const barPositions = useMemo(() => 
    [...Array(5)].map((_, i) => ({
      baseTop: 20 + i * 15,
      scale: 0.3 + seededRandom(i * 100) * 0.7,
      opacity: seededRandom(i * 200) * 0.5,
      delay: i * 0.05,
    })), []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    let lastUpdate = 0;
    const updateInterval = 50;
    let glitchSeed = 0;

    const decodeText = () => {
      const now = Date.now();
      if (now - lastUpdate < updateInterval) {
        rafId = requestAnimationFrame(decodeText);
        return;
      }
      lastUpdate = now;
      glitchSeed++;

      const progress = progressRef.current;
      // Much faster reveal - complete by 40% scroll progress
      const revealCount = Math.floor(progress * title.length * 3);

      let newText = "";
      for (let i = 0; i < title.length; i++) {
        if (title[i] === " ") {
          newText += " ";
        } else if (i < revealCount) {
          newText += title[i];
        } else if (i < revealCount + 2 && progress > 0.05) {
          const charIndex = Math.floor(seededRandom(glitchSeed * 1000 + i) * GLITCH_CHARS.length);
          newText += GLITCH_CHARS[charIndex];
        } else {
          newText += progress > 0.03 ? "_" : " ";
        }
      }
      setDisplayText(newText);

      // Update glitch offsets
      if (glitchActive) {
        setGlitchOffset({
          x1: seededRandom(glitchSeed * 3000) * 4 - 2,
          y1: seededRandom(glitchSeed * 3001) * 4 - 2,
          x2: seededRandom(glitchSeed * 3002) * 4 - 2,
          y2: seededRandom(glitchSeed * 3003) * 4 - 2,
        });
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(decodeText);
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 70%",
      end: "bottom 30%",
      scrub: 0.3,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setGlitchActive(self.progress > 0.1 && self.progress < 0.9);
      },
      onEnter: () => decodeText(),
    });

    decodeText();

    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, scrollTrigger: { trigger: container, start: "top 70%", end: "top 30%", scrub: 0.5 } }
      );
    }

    return () => {
      cancelAnimationFrame(rafId);
      trigger.kill();
    };
  }, [mounted, title, glitchActive]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative overflow-hidden"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Scan lines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(59, 130, 246, 0.1) 2px,
            rgba(59, 130, 246, 0.1) 4px
          )`,
          animation: glitchActive ? "scanlines 0.1s linear infinite" : "none",
        }}
      />

      {/* Glitch overlay bars */}
      {mounted && glitchActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {barPositions.map((bar, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-1 bg-accent/20"
              style={{
                top: `${bar.baseTop}%`,
                transform: `scaleX(${bar.scale})`,
                opacity: bar.opacity,
                animation: `glitchBar 0.2s ease-in-out infinite`,
                animationDelay: `${bar.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-20 px-6">
        {/* Main title with glitch effect */}
        <div className="relative">
          {/* Glitch layers */}
          {mounted && glitchActive && (
            <>
              <h2
                className="absolute text-5xl md:text-7xl lg:text-8xl font-bold font-mono text-center select-none"
                style={{
                  color: colors[0],
                  transform: `translate(${glitchOffset.x1}px, ${glitchOffset.y1}px)`,
                  clipPath: "inset(0 0 50% 0)",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              >
                {displayText}
              </h2>
              <h2
                className="absolute text-5xl md:text-7xl lg:text-8xl font-bold font-mono text-center select-none"
                style={{
                  color: colors[1],
                  transform: `translate(${glitchOffset.x2}px, ${glitchOffset.y2}px)`,
                  clipPath: "inset(50% 0 0 0)",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              >
                {displayText}
              </h2>
            </>
          )}
          
          {/* Main text */}
          <h2
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-mono text-center relative"
            style={{
              background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: glitchActive ? `0 0 20px ${colors[0]}40` : "none",
            }}
          >
            {displayText}
          </h2>
        </div>

        {/* Cursor blink */}
        <span
          className="inline-block w-1 h-12 md:h-16 bg-accent ml-2 mt-4"
          style={{
            animation: "blink 0.8s step-end infinite",
            opacity: progressRef.current < 0.95 ? 1 : 0,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-8 text-xl md:text-2xl text-muted max-w-2xl text-center font-mono"
          >
            <span className="text-accent">&gt;</span> {subtitle}
          </p>
        )}

        {/* Progress indicator */}
        <div className="mt-12 flex items-center gap-4">
          <div className="w-48 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-100"
              style={{ width: `${progressRef.current * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted">
            {Math.floor(progressRef.current * 100)}%
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-accent/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-accent/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-accent/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-accent/30" />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(var(--accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes glitchBar {
          0%, 100% { transform: scaleX(0.3) translateX(-100%); }
          50% { transform: scaleX(1) translateX(100%); }
        }
      `}</style>
    </div>
  );
}
