"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Text paragraphs animation with stagger
      textRefs.current.forEach((text, index) => {
        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: text,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // Image parallax effect
      gsap.fromTo(
        imageRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Parallax on image while scrolling
      gsap.to(imageRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Stats counter animation
      const stats = statsRef.current?.querySelectorAll(".stat-number");
      stats?.forEach((stat) => {
        const target = parseInt(stat.getAttribute("data-value") || "0", 10);
        gsap.fromTo(
          stat,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: stat,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-32 px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <h2
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8"
              style={{ opacity: 0 }}
            >
              About{" "}
              <span className="text-gradient">Me</span>
            </h2>

            <div className="space-y-6 text-muted text-lg">
              <p
                ref={(el) => { textRefs.current[0] = el; }}
                style={{ opacity: 0 }}
              >
                With over 5 years of experience in web development, I&apos;ve
                had the privilege of working with startups and established
                companies alike, helping them bring their digital visions to
                life.
              </p>

              <p
                ref={(el) => { textRefs.current[1] = el; }}
                style={{ opacity: 0 }}
              >
                My passion lies in creating seamless user experiences that
                combine beautiful design with robust functionality. I believe
                that great software should feel invisible—it should just work.
              </p>

              <p
                ref={(el) => { textRefs.current[2] = el; }}
                style={{ opacity: 0 }}
              >
                When I&apos;m not coding, you&apos;ll find me exploring new
                technologies, contributing to open-source projects, or sharing
                knowledge with the developer community.
              </p>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border"
            >
              <div>
                <span
                  className="stat-number text-4xl md:text-5xl font-bold text-gradient"
                  data-value="5"
                >
                  0
                </span>
                <span className="text-4xl md:text-5xl font-bold text-gradient">
                  +
                </span>
                <p className="text-muted text-sm mt-2">Years Experience</p>
              </div>
              <div>
                <span
                  className="stat-number text-4xl md:text-5xl font-bold text-gradient"
                  data-value="50"
                >
                  0
                </span>
                <span className="text-4xl md:text-5xl font-bold text-gradient">
                  +
                </span>
                <p className="text-muted text-sm mt-2">Projects Completed</p>
              </div>
              <div>
                <span
                  className="stat-number text-4xl md:text-5xl font-bold text-gradient"
                  data-value="30"
                >
                  0
                </span>
                <span className="text-4xl md:text-5xl font-bold text-gradient">
                  +
                </span>
                <p className="text-muted text-sm mt-2">Happy Clients</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            ref={imageRef}
            className="relative"
            style={{ opacity: 0 }}
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-surface to-white shadow-xl shadow-accent/10">
              {/* Placeholder image with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent-light/5 to-transparent" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%233b82f6%22 fill-opacity=%220.08%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

              {/* Profile placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-accent"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border border-accent/30 rounded-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-accent-light/20 rounded-2xl" />

            {/* Floating badge */}
            <div className="absolute -right-6 top-1/4 glass px-4 py-3 rounded-xl">
              <p className="text-sm font-medium">Available for work</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted">Remote / Hybrid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
