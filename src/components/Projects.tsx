"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with real-time inventory management and AI-powered recommendations.",
    tags: ["Next.js", "TypeScript", "Prisma", "Stripe"],
    color: "#3b82f6",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80",
  },
  {
    id: 2,
    title: "Analytics Dashboard",
    description: "Real-time data visualization platform with customizable widgets and automated reporting.",
    tags: ["React", "D3.js", "Node.js", "PostgreSQL"],
    color: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    id: 3,
    title: "Mobile Banking App",
    description: "Secure and intuitive mobile banking experience with biometric authentication.",
    tags: ["React Native", "TypeScript", "Firebase"],
    color: "#06b6d4",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
  },
  {
    id: 4,
    title: "AI Content Generator",
    description: "Machine learning powered content creation tool for marketing teams.",
    tags: ["Python", "TensorFlow", "FastAPI", "React"],
    color: "#f59e0b",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const section = sectionRef.current;
    const trigger = triggerRef.current;
    if (!section || !trigger) return;

    const scrollWidth = section.scrollWidth - window.innerWidth;

    const tween = gsap.to(section, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    if (activeCard !== cardId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const handleMouseEnter = (cardId: number) => {
    setActiveCard(cardId);
  };

  const handleMouseLeave = () => {
    setActiveCard(null);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  const getCardTransform = (cardId: number) => {
    if (activeCard !== cardId) {
      return "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
    const rotateX = (mousePos.y - 0.5) * -20;
    const rotateY = (mousePos.x - 0.5) * 20;
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const getShinePosition = () => {
    return {
      background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
    };
  };

  return (
    <div ref={triggerRef} className="overflow-hidden">
      <section
        ref={sectionRef}
        id="projects"
        className="flex items-center gap-8 px-[10vw] py-20 min-h-screen"
        style={{ width: "fit-content" }}
      >
        {/* Section Title */}
        <div className="flex-shrink-0 w-[40vw] pr-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">Featured</span>
            <br />
            Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-md">
            A selection of projects that showcase my expertise in building
            scalable, user-centric digital solutions.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm text-gray-500">Scroll horizontally</span>
            <svg
              className="w-6 h-6 text-[var(--accent)] animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>

        {/* Project Cards */}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex-shrink-0 w-[500px] h-[600px] rounded-3xl overflow-hidden relative group"
            style={{
              transform: getCardTransform(project.id),
              transition: activeCard === project.id ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
              transformStyle: "preserve-3d",
            }}
            onMouseMove={(e) => handleMouseMove(e, project.id)}
            onMouseEnter={() => handleMouseEnter(project.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${project.image})` }}
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${project.color}dd 100%)`,
              }}
            />

            {/* Shine Effect */}
            {activeCard === project.id && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={getShinePosition()}
              />
            )}

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-20">
              <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{ backgroundColor: `${project.color}` }}
                >
                  Project {project.id}
                </span>
                <h3 className="text-3xl font-bold mb-3">{project.title}</h3>
                <p className="text-white/80 mb-6 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* View Project Button */}
              <button className="mt-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <span>View Project</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>

            {/* Border Glow on Hover */}
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 2px ${project.color}, 0 0 40px ${project.color}40`,
              }}
            />
          </div>
        ))}

        {/* End Spacer */}
        <div className="flex-shrink-0 w-[20vw]" />
      </section>
    </div>
  );
}
