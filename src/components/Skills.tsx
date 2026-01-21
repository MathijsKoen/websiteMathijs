"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    category: "Frontend",
    items: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 95 },
      { name: "Vue.js", level: 80 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", level: 90 },
      { name: "Python", level: 85 },
      { name: "PostgreSQL", level: 85 },
      { name: "GraphQL", level: 80 },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      { name: "Git / GitHub", level: 95 },
      { name: "Docker", level: 85 },
      { name: "AWS / Vercel", level: 80 },
      { name: "CI/CD", level: 85 },
    ],
  },
];

const technologies = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST APIs",
  "Docker",
  "Kubernetes",
  "AWS",
  "Vercel",
  "Git",
  "Figma",
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Skills cards stagger animation - MORE WOW
      const skillCards = skillsRef.current?.querySelectorAll(".skill-category");
      if (skillCards) {
        gsap.fromTo(
          skillCards,
          { 
            opacity: 0, 
            y: 150, 
            rotationX: 45, 
            transformOrigin: "center top", 
            scale: 0.5,
            rotationY: (i) => i % 2 === 0 ? -15 : 15, // Alternating tilt
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 1.4,
            stagger: 0.15,
            ease: "elastic.out(0.8, 0.5)", // More bouncy/elastic
            scrollTrigger: {
              trigger: skillsRef.current,
              start: "top 75%",
              end: "bottom top", 
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }

      // Skill bars animation - MORE DYNAMIC
      const skillBars = sectionRef.current?.querySelectorAll(".skill-bar-fill");
      skillBars?.forEach((bar) => {
        const level = bar.getAttribute("data-level");
        
        // Reset scale first
        gsap.set(bar, { scaleX: 0 });
        
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: parseInt(level || "0", 10) / 100,
            duration: 2,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: bar,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
            onComplete: () => {
              // Add a subtle shimmer/pulse after loading
              gsap.to(bar, {
                filter: "brightness(1.2)",
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
              });
            }
          }
        );
      });

      // Infinite marquee animation
      const marquee = marqueeRef.current;
      if (marquee) {
        const marqueeContent = marquee.querySelector(".marquee-content");
        if (marqueeContent) {
          // Clone content for seamless loop
          const clone = marqueeContent.cloneNode(true);
          marquee.appendChild(clone);

          gsap.to([marqueeContent, clone], {
            xPercent: -100,
            repeat: -1,
            duration: 30,
            ease: "none",
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative py-12 px-6 overflow-hidden bg-surface"
    >
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-light/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />

      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16" style={{ opacity: 0 }}>
          <p className="text-accent font-mono text-sm mb-4 tracking-wider">
            EXPERTISE
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Skills &{" "}
            <span className="text-gradient">Technologies</span>
          </h2>
          <p className="text-muted text-lg mt-4 max-w-2xl mx-auto">
            I&apos;m constantly learning and staying up-to-date with the latest
            technologies to deliver the best solutions.
          </p>
        </div>

        {/* Skills Grid */}
        <div
          ref={skillsRef}
          className="grid md:grid-cols-3 gap-8 mb-20"
          style={{ perspective: "1000px" }}
        >
          {skills.map((category, categoryIndex) => (
            <div
              key={category.category}
              className="skill-category glass rounded-2xl p-6 md:p-8"
              style={{ opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-sm">
                  {categoryIndex + 1}
                </span>
                {category.category}
              </h3>

              <div className="space-y-5">
                {category.items.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-bar-fill"
                        data-level={skill.level}
                        style={{ transform: "scaleX(0)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Technology Marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <div
            ref={marqueeRef}
            className="flex overflow-hidden py-8"
          >
            <div className="marquee-content flex gap-8 items-center">
              {technologies.map((tech, index) => (
                <div
                  key={`${tech}-${index}`}
                  className="flex items-center gap-2 px-6 py-3 glass rounded-full whitespace-nowrap"
                >
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-sm font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <div className="glass rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Always Learning
            </h3>
            <p className="text-muted">
              I dedicate time every week to learning new technologies and
              improving my skills. Currently exploring AI/ML integration and
              Web3 technologies.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Team Player
            </h3>
            <p className="text-muted">
              I thrive in collaborative environments and have experience leading
              teams, conducting code reviews, and mentoring junior developers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
