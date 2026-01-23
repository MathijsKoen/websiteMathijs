"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  {
    category: "Webdevelopment",
    description: "Moderne websites en webapplicaties gebouwd met de nieuwste technologieën zoals React, Next.js en TypeScript.",
    icon: "🌐",
  },
  {
    category: "API Integratie",
    description: "Naadloze koppelingen tussen systemen via REST API's, webhooks en real-time data synchronisatie.",
    icon: "🔗",
  },
  {
    category: "Hosting",
    description: "Betrouwbare hosting en deployment oplossingen met focus op snelheid, veiligheid en schaalbaarheid.",
    icon: "☁️",
  },
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Orb Background (matching site style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        w = window.innerWidth;
        h = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    // Orbs
    interface Orb {
        x: number;
        y: number;
        baseX: number;
        baseY: number;
        size: number;
        color: string;
        speed: number;
        angle: number;
        depth: number;
    }
    
    const orbs: Orb[] = [];
    const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ffffff"];
    
    for(let i=0; i<40; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        orbs.push({
            x, y,
            baseX: x,
            baseY: y,
            size: Math.random() * 2.5 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 0.0003 + Math.random() * 0.0007,
            angle: Math.random() * Math.PI * 2,
            depth: Math.random() * 20 + 5
        });
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
        mouseX = (e.clientX / w) * 2 - 1;
        mouseY = (e.clientY / h) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouse);

    let animId: number;
    const render = () => {
        ctx.clearRect(0, 0, w, h);
        
        const time = Date.now() * 0.001;

        orbs.forEach(orb => {
            orb.angle += orb.speed;
            
            // Gentle orbital motion
            const floatX = Math.sin(orb.angle) * 30;
            const floatY = Math.cos(orb.angle * 0.8) * 20;
            
            // Mouse parallax
            const parallaxX = mouseX * orb.depth * -0.5;
            const parallaxY = mouseY * orb.depth * -0.5;
            
            const drawX = orb.baseX + floatX + parallaxX;
            const drawY = orb.baseY + floatY + parallaxY;
            
            // Breathing
            const breathe = 1 + Math.sin(time * 2 + orb.angle) * 0.15;
            const size = orb.size * breathe;

            // Glow
            const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size * 4);
            gradient.addColorStop(0, `${orb.color}40`);
            gradient.addColorStop(0.5, `${orb.color}10`);
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(drawX, drawY, size * 4, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = orb.color;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fill();

            // Center
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(drawX, drawY, size * 0.25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1;
        });

        animId = requestAnimationFrame(render);
    };
    render();

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouse);
        cancelAnimationFrame(animId);
    };
  }, []);

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

      // Skills cards stagger animation
      const skillCards = skillsRef.current?.querySelectorAll(".skill-category");
      if (skillCards) {
        gsap.fromTo(
          skillCards,
          { 
            opacity: 0, 
            y: 80, 
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: skillsRef.current,
              start: "top 75%",
              end: "bottom top", 
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative py-12 md:py-8 px-4 md:px-6 overflow-hidden flex flex-col justify-center min-h-[80vh]"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-8" style={{ opacity: 0 }}>
          <p className="text-accent font-mono text-xs mb-2 tracking-wider">
            EXPERTISE
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Onze{" "}
            <span className="text-gradient">Diensten</span>
          </h2>
        </div>

        {/* Skills Grid */}
        <div
          ref={skillsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          style={{ perspective: "1000px" }}
        >
          {skills.map((skill) => (
            <div
              key={skill.category}
              className="skill-category glass rounded-xl p-6 md:p-8 text-center hover:bg-accent/5 transition-colors duration-300"
              style={{ opacity: 0 }}
            >
              <div className="text-4xl md:text-5xl mb-4">{skill.icon}</div>
              <h3 className="text-lg md:text-xl font-bold mb-3">
                {skill.category}
              </h3>
              <p className="text-sm md:text-base text-muted">
                {skill.description}
              </p>
            </div>
          ))}
        </div>

        {/* Core Services Grid - Replaces Skills Marquee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="glass rounded-xl p-6 hover:bg-accent/5 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Probleemoplossend
            </h3>
            <p className="text-sm text-muted">
              Wij breken complexe uitdagingen af tot beheersbare, schaalbare technische oplossingen. Van architectuur tot implementatie, elke stap is doordacht.
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:bg-accent/5 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
               <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Hoge Prestaties
            </h3>
            <p className="text-sm text-muted">
              Applicaties bouwen die snel, responsief en geoptimaliseerd zijn voor de beste gebruikerservaring en SEO-rankings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
