"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParticleTransitionDOMProps {
  /** Aantal particles (max ~80 voor goede performance) */
  particleCount?: number;
  /** Kleuren voor particles */
  colors?: string[];
  /** ID voor de sectie */
  id?: string;
  /** Hoogte van de transitie sectie (in vh) */
  height?: number;
  /** Content die gecentreerd wordt getoond */
  children?: React.ReactNode;
}

/**
 * DOM-gebaseerde particle transitie
 * 
 * VOORDELEN:
 * - Eenvoudiger te implementeren
 * - Native CSS animations
 * - Makkelijk te stylen met Tailwind
 * 
 * NADELEN:
 * - Minder particles mogelijk (max ~80)
 * - Kan janky zijn bij veel elementen
 * 
 * GEBRUIK ALLEEN voor:
 * - Projecten met weinig particles nodig
 * - Wanneer je CSS blur/glow effects wilt
 */
export default function ParticleTransitionDOM({
  particleCount = 60,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"],
  id = "particle-transition-dom",
  height = 150,
  children,
}: ParticleTransitionDOMProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maak particle elementen
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle absolute rounded-full pointer-events-none";

      // Random eigenschappen
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Startpositie aan de rand
      const edge = Math.floor(Math.random() * 4);
      let startX: number, startY: number;
      const overflow = 100;

      switch (edge) {
        case 0:
          startX = Math.random() * rect.width;
          startY = -overflow - Math.random() * 150;
          break;
        case 1:
          startX = rect.width + overflow + Math.random() * 150;
          startY = Math.random() * rect.height;
          break;
        case 2:
          startX = Math.random() * rect.width;
          startY = rect.height + overflow + Math.random() * 150;
          break;
        default:
          startX = -overflow - Math.random() * 150;
          startY = Math.random() * rect.height;
          break;
      }

      // Eindpositie rond centrum
      const endX = centerX + (Math.random() - 0.5) * 200;
      const endY = centerY + (Math.random() - 0.5) * 200;

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size * 2}px ${color}80;
        left: ${startX}px;
        top: ${startY}px;
        opacity: 0;
        will-change: transform, opacity;
      `;

      // Data attributes voor animatie
      particle.dataset.startX = String(startX);
      particle.dataset.startY = String(startY);
      particle.dataset.endX = String(endX);
      particle.dataset.endY = String(endY);
      particle.dataset.delay = String(Math.random() * 0.3);

      container.appendChild(particle);
      particles.push(particle);
    }

    particlesRef.current = particles;

    // GSAP ScrollTrigger animatie
    const ctx = gsap.context(() => {
      particles.forEach((particle) => {
        const startX = parseFloat(particle.dataset.startX || "0");
        const startY = parseFloat(particle.dataset.startY || "0");
        const endX = parseFloat(particle.dataset.endX || "0");
        const endY = parseFloat(particle.dataset.endY || "0");
        const delay = parseFloat(particle.dataset.delay || "0");

        // Timeline voor elke particle
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        tl.fromTo(
          particle,
          {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.5,
          },
          {
            x: endX - startX,
            y: endY - startY,
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: delay,
            ease: "power2.inOut",
          }
        );
      });
    }, container);

    return () => {
      ctx.revert();
      particles.forEach((p) => p.remove());
    };
  }, [particleCount, colors]);

  return (
    <section
      ref={containerRef}
      id={id}
      className="relative overflow-hidden bg-background"
      style={{ minHeight: `${height}vh` }}
    >
      {/* Content */}
      {children && (
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ minHeight: `${height}vh` }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
