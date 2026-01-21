"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Vignette() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    // Fade out based on scroll
    gsap.to(el, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "500px top", // Fade out over first 500px of scroll
        scrub: true,
      },
    });
  }, []);

  return (
    <div 
        ref={overlayRef}
        className="fixed inset-0 z-[40] pointer-events-none" // z-40 to sit above most content but below modals/nav if needed
        style={{ 
            background: "radial-gradient(circle at center, transparent 30%, rgba(5,5,5,0.8) 100%)",
            height: "100vh",
            width: "100vw"
        }} 
    />
  );
}
