"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: "hero", label: "Home" },
  { id: "about", label: "Over ons" },
  { id: "projects", label: "Projecten" },
  { id: "skills", label: "Vaardigheden" },
  { id: "contact", label: "Contact" },
];

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const projectsTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!barRef.current || !containerRef.current) return;

    const totalSections = sections.length;
    const container = containerRef.current;
    const bar = barRef.current;

    // Functie om de Projects ScrollTrigger te vinden
    const findProjectsTrigger = () => {
      const allTriggers = ScrollTrigger.getAll();
      return allTriggers.find(trigger => {
        // De Projects trigger heeft pin: true en bevat de #projects sectie
        if (!trigger.pin) return false;
        const triggerEl = trigger.trigger as HTMLElement;
        if (!triggerEl) return false;
        return triggerEl.querySelector('#projects') !== null;
      }) || null;
    };

    // Show/hide based on scroll position
    const showHideTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "100px top",
      onEnter: () => gsap.to(container, { opacity: 1, duration: 0.3 }),
      onLeaveBack: () => gsap.to(container, { opacity: 0, duration: 0.3 }),
    });

    // Bereken de start en eind scroll posities voor elke sectie
    const calculateSectionRanges = () => {
      const ranges: { start: number; end: number; id: string }[] = [];
      
      // Probeer de Projects trigger te vinden
      if (!projectsTriggerRef.current) {
        projectsTriggerRef.current = findProjectsTrigger();
      }
      
      const projectsTrigger = projectsTriggerRef.current;
      
      sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (!element) return;

        if (section.id === "projects" && projectsTrigger) {
          // Voor de gepinde Projects sectie, gebruik de ScrollTrigger start/end
          ranges.push({
            id: section.id,
            start: projectsTrigger.start,
            end: projectsTrigger.end,
          });
        } else {
          // Voor normale secties, bereken op basis van offsetTop
          // Maar houd rekening met dat secties na projects verschoven zijn door de pin spacer
          const rect = element.getBoundingClientRect();
          const scrollY = window.scrollY;
          
          // Als dit een sectie na projects is en projects een trigger heeft
          if (projectsTrigger && (section.id === "skills" || section.id === "contact")) {
            // Deze secties komen na de pin, dus hun echte positie is na de projects scroll range
            ranges.push({
              id: section.id,
              start: scrollY + rect.top,
              end: scrollY + rect.bottom,
            });
          } else {
            ranges.push({
              id: section.id,
              start: element.offsetTop,
              end: element.offsetTop + element.offsetHeight,
            });
          }
        }
      });

      return ranges;
    };

    // Update functie
    const updateProgressBar = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      // Refresh de trigger referentie indien nodig
      if (!projectsTriggerRef.current) {
        projectsTriggerRef.current = findProjectsTrigger();
      }
      
      const projectsTrigger = projectsTriggerRef.current;
      
      // Bepaal welke sectie actief is
      let currentIndex = 0;
      let sectionProgress = 0;

      // Check eerst of we in de gepinde Projects sectie zijn
      if (projectsTrigger && projectsTrigger.isActive) {
        currentIndex = 2; // Projects index
        sectionProgress = projectsTrigger.progress;
      } else {
        // Check de andere secties
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          const element = document.getElementById(section.id);
          if (!element) continue;

          const rect = element.getBoundingClientRect();
          
          // Voor de laatste sectie (contact), gebruik een speciale detectie
          if (i === sections.length - 1) {
            const scrollBottom = scrollY + vh;
            const docHeight = document.documentElement.scrollHeight;
            
            // Contact is actief als we in de buurt van het einde zijn
            if (scrollBottom >= docHeight - 50 || rect.top <= vh / 2) {
              currentIndex = i;
              // Progress: simpele berekening gebaseerd op positie
              const sectionHeight = rect.height;
              if (sectionHeight > 0 && rect.top <= vh / 2) {
                sectionProgress = Math.max(0, Math.min(1, (vh / 2 - rect.top) / sectionHeight));
              } else if (scrollBottom >= docHeight - 50) {
                // Als we helemaal onderaan zijn, 100% progress
                sectionProgress = 1;
              }
              break;
            }
          }
          
          // Sectie is actief als de bovenkant boven 1/3 van de viewport is
          if (rect.top <= vh / 3) {
            currentIndex = i;
            
            // Bereken progress binnen de sectie
            if (section.id === "projects" && projectsTrigger) {
              sectionProgress = projectsTrigger.progress;
            } else {
              const sectionHeight = rect.height;
              if (sectionHeight > 0) {
                // Progress gebaseerd op hoeveel van de sectie voorbij de top is
                sectionProgress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - vh)));
              }
            }
            break;
          }
        }
      }

      setActiveSection(currentIndex);

      // Bereken totale progress bar hoogte
      // Elke sectie krijgt een gelijk deel
      const sectionWeight = 100 / (totalSections - 1);
      const baseProgress = currentIndex * sectionWeight;
      const contribution = sectionProgress * sectionWeight;
      
      const totalProgress = Math.min(100, Math.max(0, baseProgress + contribution));

      gsap.to(bar, {
        height: `${totalProgress}%`,
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto",
      });
    };

    // Initialiseer na een korte delay zodat andere ScrollTriggers klaar zijn
    const initTimeout = setTimeout(() => {
      projectsTriggerRef.current = findProjectsTrigger();
      updateProgressBar();
    }, 200);

    // Resize handler
    const handleResize = () => {
      projectsTriggerRef.current = null; // Reset zodat we opnieuw zoeken
      setTimeout(() => {
        projectsTriggerRef.current = findProjectsTrigger();
        updateProgressBar();
      }, 100);
    };

    // Event listeners
    ScrollTrigger.addEventListener("refresh", updateProgressBar);
    window.addEventListener("scroll", updateProgressBar, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(initTimeout);
      showHideTrigger.kill();
      ScrollTrigger.removeEventListener("refresh", updateProgressBar);
      window.removeEventListener("scroll", updateProgressBar);
      window.removeEventListener("resize", handleResize);
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