"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: "Order Fulfillment Platform",
    description: "Een volledig geïntegreerd order fulfillment platform voor Ksyos dat via API's communiceert met verzend- en CRM-systemen voor naadloze orderverwerking.",
    tags: ["Next.js", "TypeScript", "REST API", "CRM Integratie"],
    color: "#3b82f6",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  },
  {
    id: 2,
    title: "Neonatologie Dashboard",
    description: "Een real-time dashboard voor de Neonatologie IC van het AMC met directe API-connectie tot het research data platform voor betere patiëntenzorg.",
    tags: ["React", "API Integratie", "Data Visualisatie", "Healthcare"],
    color: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // New Canvas Ref
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Canvas Effect - Dynamic Orbs (matching OrbTransition/Expertise style)
  useEffect(() => {
      const canvas = canvasRef.current;
      const container = triggerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = window.innerWidth;
      let height = window.innerHeight;
      
      const resize = () => {
          width = canvas.width = window.innerWidth * window.devicePixelRatio;
          height = canvas.height = window.innerHeight * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      resize();
      window.addEventListener('resize', resize);

      // Orb Particles - EXACT same style as OrbTransition
      interface Orb {
          x: number;
          y: number;
          baseX: number;
          baseY: number;
          size: number;
          color: string;
          speed: number;
          angle: number;
          noiseOffset: number;
          depth: number;
      }
      
      const orbs: Orb[] = [];
      const orbCount = 50;
      const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ffffff"];
      
      for(let i=0; i<orbCount; i++) {
          const baseX = Math.random() * window.innerWidth;
          const baseY = Math.random() * window.innerHeight;
          orbs.push({
              x: baseX,
              y: baseY,
              baseX,
              baseY,
              size: Math.random() * 2.5 + 1.5,
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: 0.0003 + Math.random() * 0.0008,
              angle: Math.random() * Math.PI * 2,
              noiseOffset: Math.random() * 100,
              depth: Math.random() * 25 + 10
          });
      }

      // Track mouse for parallax
      let mouseX = 0;
      let mouseY = 0;
      const handleMouse = (e: MouseEvent) => {
          mouseX = (e.clientX / window.innerWidth) * 2 - 1;
          mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('mousemove', handleMouse);

      let animId: number;
      const render = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          ctx.clearRect(0, 0, w, h);
          
          const time = Date.now() * 0.001;

          orbs.forEach(orb => {
              // Gentle orbital motion (same as OrbTransition)
              orb.angle += orb.speed;
              
              // Add noise/jitter
              const noiseMult = 4;
              const noiseX = Math.sin(time * 1.5 + orb.noiseOffset) * noiseMult;
              const noiseY = Math.cos(time * 1.5 + orb.noiseOffset) * noiseMult;

              // Mouse parallax
              const parallaxX = mouseX * orb.depth * -0.5;
              const parallaxY = mouseY * orb.depth * -0.5;

              // Float around base position
              const floatX = Math.sin(orb.angle) * 30;
              const floatY = Math.cos(orb.angle * 0.7) * 20;

              const drawX = orb.baseX + floatX + noiseX + parallaxX;
              const drawY = orb.baseY + floatY + noiseY + parallaxY;

              // Breathing
              const breathe = 1 + Math.sin(time * 2 + orb.noiseOffset) * 0.2;
              const size = orb.size * breathe;

              // Glow - EXACT same as OrbTransition
              const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size * 4);
              gradient.addColorStop(0, `${orb.color}50`);
              gradient.addColorStop(0.5, `${orb.color}18`);
              gradient.addColorStop(1, "transparent");
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(drawX, drawY, size * 4, 0, Math.PI * 2);
              ctx.fill();

              // Core
              ctx.fillStyle = orb.color;
              ctx.globalAlpha = 0.85;
              ctx.beginPath();
              ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
              ctx.fill();

              // Highlight
              ctx.fillStyle = "#ffffff";
              ctx.globalAlpha = 0.9;
              ctx.beginPath();
              ctx.arc(drawX, drawY, size * 0.3, 0, Math.PI * 2);
              ctx.fill();

              ctx.globalAlpha = 1;
          });

          // Draw connections when nearby (same as OrbTransition)
          ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
          ctx.lineWidth = 0.5;

          for (let i = 0; i < orbs.length; i += 2) {
            for (let j = i + 1; j < Math.min(i + 6, orbs.length); j++) {
              const o1 = orbs[i];
              const o2 = orbs[j];
              const dx = o1.baseX - o2.baseX;
              const dy = o1.baseY - o2.baseY;
              if (dx * dx + dy * dy < 10000) { // 100px squared
                ctx.globalAlpha = 0.15;
                ctx.beginPath();
                ctx.moveTo(o1.baseX, o1.baseY);
                ctx.lineTo(o2.baseX, o2.baseY);
                ctx.stroke();
              }
            }
          }
          ctx.globalAlpha = 1;

          animId = requestAnimationFrame(render);
      };
      render();

      return () => {
          window.removeEventListener('resize', resize);
          window.removeEventListener('mousemove', handleMouse);
          cancelAnimationFrame(animId);
      }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const trigger = triggerRef.current;
    if (!section || !trigger) return;

    // Disable horizontal scroll effect on mobile - use vertical scroll instead
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

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
    // Disable 3D effects on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return "none";
    }
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
    <div ref={triggerRef} className="relative">
      {/* Background elements removed for seamless integration */}
      
      <section
        ref={sectionRef}
        id="projects"
        className="flex flex-col items-center gap-6 px-4 py-12 relative z-10 md:flex-row md:gap-8 md:px-[10vw] md:py-20 md:min-h-screen"
      >
        {/* Section Title */}
        <div className="flex-shrink-0 w-full md:w-[40vw] pr-4 md:pr-20 mb-8 md:mb-0">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground">
            <span className="text-gradient">Uitgelichte</span>
            <br />
            Projecten
          </h2>
          <p className="text-base md:text-lg text-muted max-w-md">
            Een selectie van projecten die onze expertise tonen in het bouwen
            van schaalbare, gebruikersgerichte digitale oplossingen.
          </p>
          <div className="mt-8 hidden md:flex items-center gap-4">
            <span className="text-sm text-muted">Scroll horizontaal</span>
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
            className="flex-shrink-0 w-[85vw] md:w-[500px] h-[450px] md:h-[600px] rounded-3xl overflow-hidden relative group"
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
                <span>Bekijk Project</span>
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
