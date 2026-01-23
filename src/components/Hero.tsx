"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Split title text into characters
      const title = titleRef.current;
      if (title) {
        const text = title.innerText;
        title.innerHTML = "";
        text.split("").forEach((char, i) => {
          const span = document.createElement("span");
          span.className = "split-char inline-block";
          span.innerText = char === " " ? "\u00A0" : char;
          title.appendChild(span);
        });

        // Animate title characters
        gsap.fromTo(
          title.querySelectorAll(".split-char"),
          {
            opacity: 0,
            y: 100,
            rotateX: -90,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            stagger: 0.03,
            ease: "power4.out",
            delay: 0.3,
          }
        );
      }

      // Animate subtitle
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 1.2,
          ease: "power3.out",
        }
      );

      // Animate CTA buttons
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 1.5,
          ease: "power3.out",
        }
      );

      // Animate scroll indicator
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          delay: 2,
        }
      );

      // Parallax effect on scroll
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onEnterBack: () => {
            gsap.to(titleRef.current, { opacity: 1, duration: 0.3 });
          },
        },
        y: 200,
        opacity: 0,
      });

      gsap.to(subtitleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onEnterBack: () => {
            gsap.to(subtitleRef.current, { opacity: 1, duration: 0.3 });
            gsap.to(ctaRef.current, { opacity: 1, duration: 0.3 });
            gsap.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.3 });
          },
        },
        y: 150,
        opacity: 0,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <p className="text-accent font-mono text-sm mb-4 tracking-wider">
          Digitale Ervaringen Creëren
        </p>

        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 leading-tight"
          style={{ perspective: "1000px" }}
        >
          Hi, Wij zijn <span 
            className="inline-block animate-gradient"
            style={{
              backgroundImage: "linear-gradient(to right, #22d3ee, #3b82f6, #4f46e5)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 35px rgba(59,130,246,0.5))",
            }}
          >Novum</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-12 px-4"
        >
          Wij creëren uitzonderlijke digitale ervaringen door middel van clean code en
          creatieve probleemoplossing. Gespecialiseerd in het bouwen van moderne web
          applicaties waar gebruikers van houden.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: 0 }}
        >
          <a
            href="#projects"
            className="group flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-accent text-white rounded-full font-medium hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 text-sm md:text-base"
          >
            Bekijk Ons Werk
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
          <a
            href="#contact"
            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 border border-border rounded-full font-medium hover:border-accent hover:text-accent transition-colors duration-300 text-sm md:text-base"
          >
            Neem Contact Op
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <span className="text-muted text-xs md:text-sm">Scroll om te ontdekken</span>
        <div className="w-6 h-10 border-2 border-muted rounded-full flex justify-center p-1">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
