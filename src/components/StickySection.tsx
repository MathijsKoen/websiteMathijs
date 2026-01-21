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
        },
      });

      // Content "Focus" effects
      if (contentRef.current) {
        // Create a sequence: Enter -> Hold -> Exit
        // Removed blur filter for performance optimization
        
        // 1. Fade In / Focus (15% of scroll)
        tl.fromTo(contentRef.current,
          { scale: 0.9, opacity: 0.6 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.15,
            ease: "power2.out" 
          },
          0
        )
        // 2. Hold Focus (70% of scroll)
        .to(contentRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: "none"
        }, ">")
        // 3. Fade Out / Defocus (15% of scroll)
        .to(contentRef.current,
          { 
            scale: 0.9, 
            opacity: 0.6, 
            duration: 0.15,
            ease: "power2.in"
          },
          ">"
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
    </div>
  );
}
