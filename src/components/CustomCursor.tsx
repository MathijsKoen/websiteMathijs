"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Hide custom cursor on touch devices and when reduced motion is preferred
    if (prefersReducedMotion || "ontouchstart" in window) {
      return;
    }

    const dot = dotRef.current;
    const outline = outlineRef.current;

    if (!dot || !outline) return;

    // Show cursors
    dot.style.opacity = "1";
    outline.style.opacity = "0.5";

    const moveCursor = (e: MouseEvent) => {
      gsap.to(dot, {
        x: e.clientX - 4,
        y: e.clientY - 4,
        duration: 0.1,
        ease: "power2.out",
      });

      gsap.to(outline, {
        x: e.clientX - 20,
        y: e.clientY - 20,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseEnter = () => {
      outline.classList.add("hover");
    };

    const handleMouseLeave = () => {
      outline.classList.remove("hover");
    };

    // Add event listeners
    window.addEventListener("mousemove", moveCursor);

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, [data-cursor-hover]"
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot hidden md:block"
        style={{ opacity: 0 }}
      />
      <div
        ref={outlineRef}
        className="cursor-outline hidden md:block"
        style={{ opacity: 0 }}
      />
    </>
  );
}
