"use client";

import { useRef, useEffect, useState } from "react";

interface GlobalOrbsProps {
  colors?: string[];
  orbCount?: number;
}

export default function GlobalOrbs({
  colors = ["#3b82f6", "#8b5cf6", "#60a5fa", "#06b6d4"],
  orbCount = 80,
}: GlobalOrbsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect mobile and reduce orb count for better performance
    const isMobile = window.innerWidth < 768;
    const actualOrbCount = isMobile ? Math.min(orbCount, 30) : orbCount;
    const pixelRatio = isMobile ? 1 : window.devicePixelRatio;

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
      floatRadius: number;
    }

    const orbs: Orb[] = [];
    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      // Fixed position full screen canvas - massive performance boost compared to full scrollHeight
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.style.pointerEvents = 'none'; // Ensure clicks pass through
      canvas.style.zIndex = '-1'; // Behind everything
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(pixelRatio, pixelRatio);
    };

    const createOrbs = () => {
      orbs.length = 0;
      // Distribute orbs across the viewport height
      const height = window.innerHeight;
      
      for (let i = 0; i < actualOrbCount; i++) {
        const baseX = Math.random() * window.innerWidth;
        const baseY = Math.random() * height;
        
        orbs.push({
          x: baseX,
          y: baseY,
          baseX,
          baseY,
          size: Math.random() * (isMobile ? 2 : 3) + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: 0.0002 + Math.random() * 0.0006,
          angle: Math.random() * Math.PI * 2,
          noiseOffset: Math.random() * 100,
          depth: Math.random() * (isMobile ? 15 : 30) + 10,
          floatRadius: Math.random() * (isMobile ? 30 : 60) + (isMobile ? 20 : 40),
        });
      }
    };

    resize();
    createOrbs();

    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouse);

    // Removed scroll height check - no longer needed for fixed background

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      orbs.forEach((orb) => {
        // Gentle orbital motion
        orb.angle += orb.speed;

        // Add noise/jitter
        const noiseMult = 6;
        const noiseX = Math.sin(time * 1.2 + orb.noiseOffset) * noiseMult;
        const noiseY = Math.cos(time * 1.2 + orb.noiseOffset) * noiseMult;

        // Mouse parallax (relative to viewport)
        const parallaxX = mouseX * orb.depth * -0.3;
        const parallaxY = mouseY * orb.depth * -0.3;

        // Float around base position with larger radius
        const floatX = Math.sin(orb.angle) * orb.floatRadius;
        const floatY = Math.cos(orb.angle * 0.7) * (orb.floatRadius * 0.7);

        const drawX = orb.baseX + floatX + noiseX + parallaxX;
        const drawY = orb.baseY + floatY + noiseY + parallaxY;

        // Wrap around screen if they float too far (optional, but good for staying in view)
        // Actually, let's just let them float freely as they are background.

        // Breathing effect
        const breathe = 1 + Math.sin(time * 2 + orb.noiseOffset) * 0.25;
        const size = orb.size * breathe;

        // Glow
        const gradient = ctx.createRadialGradient(
          drawX,
          drawY,
          0,
          drawX,
          drawY,
          size * 5
        );
        gradient.addColorStop(0, `${orb.color}40`);
        gradient.addColorStop(0.5, `${orb.color}15`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = orb.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(drawX, drawY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      // Draw subtle connections between nearby orbs - skip on mobile for performance
      if (!isMobile) {
        ctx.strokeStyle = "rgba(139, 92, 246, 0.08)";
        ctx.lineWidth = 0.5;

        for (let i = 0; i < orbs.length; i += 3) {
          for (let j = i + 1; j < Math.min(i + 5, orbs.length); j++) {
            const o1 = orbs[i];
            const o2 = orbs[j];
            const dx = o1.baseX - o2.baseX;
            const dy = o1.baseY - o2.baseY;
            const distSq = dx * dx + dy * dy;
            if (distSq < 22500) {
              // 150px squared
              ctx.globalAlpha = 0.1 * (1 - distSq / 22500);
              ctx.beginPath();
              ctx.moveTo(o1.baseX, o1.baseY);
              ctx.lineTo(o2.baseX, o2.baseY);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [mounted, colors, orbCount]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
