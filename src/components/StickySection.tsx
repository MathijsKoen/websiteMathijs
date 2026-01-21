"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StickySectionProps {
  children: ReactNode;
  className?: string;
  pinDistance?: number;
}

export default function StickySection({ children, className = "", pinDistance = 400 }: StickySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: `+=${pinDistance}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          onUpdate: (self) => {
            if (percentageRef.current) {
              const p = Math.floor(self.progress * 100);
              percentageRef.current.innerText = `${p}%`;
            }
          }
        },
      });

      // Content "Focus" effects
      if (contentRef.current) {
        // Create a sequence: Enter -> Hold -> Exit
        // This ensures the content stays "sharp" (focused) for the majority of the scroll
        
        // 1. Fade In / Focus (15% of scroll)
        tl.fromTo(contentRef.current,
          { scale: 0.9, opacity: 0.6, filter: "blur(0.5px)" },
          { 
            scale: 1, 
            opacity: 1, 
            filter: "blur(0px)", 
            duration: 0.15,
            ease: "power2.out" 
          },
          0
        )
        // 2. Hold Focus (70% of scroll) - The "Sharp" part
        // We use ">" to ensure it starts exactly after the previous tween,
        // ignoring any other timeline duration extensions
        .to(contentRef.current, {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "none"
        }, ">")
        // 3. Fade Out / Defocus (15% of scroll)
        .to(contentRef.current,
          { 
            scale: 0.9, 
            opacity: 0.6, 
            filter: "blur(0.5px)", 
            duration: 0.15,
            ease: "power2.in"
          },
          ">"
        );
      }

      // Progress bar animation - Duration must match total timeline duration (1.0)
      if (progressBarRef.current) {
        tl.fromTo(progressBarRef.current, 
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1, ease: "none" },
          0
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, [pinDistance]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <div ref={contentRef} className="w-full h-full transition-transform">
        {children}
      </div>
      
      {/* Scroll Progress Indicator - increased z-index and fixed coloring */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <span 
          ref={percentageRef} 
          className="font-mono text-xs text-muted font-bold w-8 text-right tabular-nums"
        >
          0%
        </span>
        <div className="w-48 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm relative">
          <div 
            ref={progressBarRef} 
            className="h-full bg-accent origin-left shadow-[0_0_10px_var(--accent)]" 
            style={{ width: "100%", transform: "scaleX(0)" }} 
          />
        </div>
      </div>
    </div>
  );
}
