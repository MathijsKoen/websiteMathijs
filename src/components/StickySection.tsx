"use client";

import { useRef, useEffect, ReactNode, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
    
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    
    // On mobile, skip all sticky/zoom animations - just render children normally
    if (checkMobile()) {
      return () => window.removeEventListener('resize', handleResize);
    }

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

      // Content "Focus" effects - only on desktop with subtle scale
      if (contentRef.current) {
        tl.fromTo(contentRef.current,
          { scale: 0.98, opacity: 0.9 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.15,
            ease: "power2.out" 
          },
          0
        )
        .to(contentRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: "none"
        }, ">")
        .to(contentRef.current,
          { 
            scale: 0.98, 
            opacity: 0.9, 
            duration: 0.15,
            ease: "power2.in"
          },
          ">"
        );
      }

    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, [pinDistance]);

  // On mobile, just render children directly without any wrapper effects
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <div ref={contentRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
