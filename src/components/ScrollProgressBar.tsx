"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (!barRef.current || !containerRef.current) return;

    // Calculate total progress excluding pinned horizontal scroll
    let totalSections = 5; // hero, about, projects, skills, contact
    let currentSection = 0;

    // Update progress bar based on active section (not raw scroll)
    const updateProgress = (sectionIndex: number) => {
      currentSection = sectionIndex;
      const progressPercent = (sectionIndex / (totalSections - 1)) * 100;
      gsap.to(barRef.current, {
        height: `${progressPercent}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    // Show/hide based on scroll position
    gsap.to(containerRef.current, {
      opacity: 1,
      scrollTrigger: {
        trigger: "body",
        start: "100px top",
        toggleActions: "play none none reverse",
      },
    });

    // Track active section and update progress
    sections.forEach((section, index) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      const progressStart = index * 25; // 0, 25, 50, 75
      const progressEnd = (index + 1) * 25; // 25, 50, 75, 100

      // Use a simpler ScrollTrigger for the progress bar itself
      ScrollTrigger.create({
        trigger: element,
        start: "top top", 
        // For the projects section (index 2), we want it to span the entire pinned duration
        end: section.id === "projects" ? "bottom top" : "bottom top", 
        scrub: true, // Smooth scrubbing
        onUpdate: (self) => {
          // self.progress is 0 to 1 based on the section's scroll duration
          // Map this to the bar segment
          const currentProgress = progressStart + (self.progress * 25);
          
          // Only update if this section is actually active/scrolling to prevent conflicts?
          // Actually, since triggers are sequential, this is fine.
          // However, we want to ensure we don't overwrite if another trigger is more relevant.
          // BUT - simply setting height here is the most robust way.
          if (self.isActive || (self.progress > 0 && self.progress < 1)) {
              gsap.set(barRef.current, { height: `${currentProgress}%` });
          }
        },
        onEnter: () => setActiveSection(index),
        onEnterBack: () => setActiveSection(index),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] opacity-0 transition-opacity duration-300"
    >
      {/* Container bar */}
      <div className="relative w-1 h-[40vh] bg-border/30 rounded-full overflow-hidden backdrop-blur-sm">
        {/* Progress fill */}
        <div
          ref={barRef}
          className="absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-accent via-accent-light to-accent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        />
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full blur-sm opacity-80" />
      </div>

      {/* Section indicators */}
      <div className="absolute right-4 top-0 h-full flex flex-col justify-between py-[2px]">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative cursor-pointer"
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === index
                  ? "bg-accent scale-150 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                  : "bg-border/50 group-hover:bg-accent group-hover:scale-125"
              }`}
            />
            <span
              className={`absolute right-5 top-1/2 -translate-y-1/2 text-xs font-mono whitespace-nowrap transition-all duration-300 ${
                activeSection === index
                  ? "text-accent font-semibold"
                  : "text-muted/80 group-hover:text-muted"
              }`}
            >
              {section.label}
            </span>
          </button>
        ))}
      </div>

      {/* Click me hint */}
      <div className="absolute -bottom-12 right-0 flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-accent/90 animate-pulse">
            Navigate
          </span>
          <svg 
            className="w-3 h-3 text-accent/70 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 15l7-7 7 7" 
            />
          </svg>
        </div>
        <div className="text-[9px] font-mono text-muted/50 uppercase tracking-wider">
          Click sections
        </div>
      </div>
    </div>
  );
}
