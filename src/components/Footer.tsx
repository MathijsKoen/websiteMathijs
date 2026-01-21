"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative py-12 px-6 border-t border-border"
      style={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#hero" className="text-2xl font-bold text-gradient">
            Novum
          </a>

          {/* Copyright */}
          <p className="text-muted text-sm text-center">
            © {currentYear} Novum Digital. All rights reserved.
          </p>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to top
            <svg
              className="w-4 h-4 group-hover:-translate-y-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>

        {/* Large text decoration */}
        <div className="mt-12 pt-12 border-t border-border/50 overflow-hidden">
          <p className="text-[8vw] md:text-[6vw] font-bold text-center text-accent/10 whitespace-nowrap select-none">
            LET&apos;S CREATE SOMETHING AMAZING
          </p>
        </div>
      </div>
    </footer>
  );
}
