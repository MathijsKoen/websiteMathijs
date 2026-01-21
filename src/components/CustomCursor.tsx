"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  
  // Ref for velocity calculation
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(0);
  
  // Ref for cleanup
  const tickerRef = useRef<gsap.TickerCallback | null>(null);

  useEffect(() => {
    // Check if device is touch or reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    if (!cursor || !follower) return;

    // Initial setup
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
    gsap.set(follower, { xPercent: -50, yPercent: -50, scale: 0 });

    // Movement Setters (Performance optimized)
    const xToCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yToCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
    
    // Follower has physics (elasticity) - Increased lag for "floatier" feel
    const xToFollower = gsap.quickTo(follower, "x", { duration: 0.8, ease: "power4.out" });
    const yToFollower = gsap.quickTo(follower, "y", { duration: 0.8, ease: "power4.out" });

    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        gsap.to([cursor, follower], { scale: 1, duration: 0.3 });
        isVisible = true;
      }

      // Update Cursor Position immediately
      xToCursor(e.clientX);
      yToCursor(e.clientY);
      
      // Update Follower Target
      xToFollower(e.clientX);
      yToFollower(e.clientY);

      // Calculate velocity for squash/stretch
      const dt = 1.0; 
      const dx = e.clientX - positionRef.current.x;
      const dy = e.clientY - positionRef.current.y;
      
      velocityRef.current = { x: dx, y: dy };
      positionRef.current = { x: e.clientX, y: e.clientY };
    };

    // Ticker for smooth velocity decay and shape animation
    const onTick = () => {
      // Calculate speed
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);

      // Smoothly interpolate speed for jitter-free animation
      speedRef.current = gsap.utils.interpolate(speedRef.current, speed, 0.1);
      
      // 3D Tilt calculation (More dramatic)
      const rotationMax = 60; // Increased from 45
      const tiltX = gsap.utils.clamp(-rotationMax, rotationMax, vy * -2.5); // More sensitive
      const tiltY = gsap.utils.clamp(-rotationMax, rotationMax, vx * 2.5);  // More sensitive
      
      // Squash and stretch based on speed - Much more elastic
      const stretch = gsap.utils.clamp(1, 2.5, 1 + speedRef.current / 50); // Increased max stretch and sensitivity
      const squash = 1 / stretch;

      gsap.to(follower, {
        scaleX: stretch,
        scaleY: squash,
        rotate: angle, // 2D rotation for direction
        rotationX: tiltX, // 3D rotation
        rotationY: tiltY, // 3D rotation
        duration: 0.2, // Slightly slower tween for the shape to feel "heavy"
        overwrite: "auto"
      });

      // Decay velocity
      velocityRef.current.x *= 0.8;
      velocityRef.current.y *= 0.8;
    };

    gsap.ticker.add(onTick);
    tickerRef.current = onTick;

    // Hover Effects
    const onMouseEnterLink = (e: Event) => {
      // Scale up inner dot slightly (3D sphere pulse)
      gsap.to(cursor, { 
        scale: 1.5, 
        backgroundColor: "#60a5fa", // Lighter blue
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
        duration: 0.3 
      }); 
      
      // Ring interaction: Tighten and "Spin" slightly
      gsap.to(follower, { 
        width: 60, 
        height: 60, 
        backgroundColor: "transparent", 
        borderWidth: "2px",
        borderColor: "rgba(59, 130, 246, 1)",
        backdropFilter: "none",
        scaleX: 1, // Reset squash
        scaleY: 1,
        rotate: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // We Keep the ticker partially active? No, let's pause physics on hover for stability
      gsap.ticker.remove(onTick);
    };

    const onMouseLeaveLink = () => {
      gsap.to(cursor, { 
        scale: 1, 
        backgroundColor: "rgb(59, 130, 246)",
        boxShadow: "0 0 15px rgba(59, 130, 246, 0.8)",
        duration: 0.2 
      });
      
      gsap.to(follower, { 
        width: 48, 
        height: 48, 
        backgroundColor: "transparent", 
        borderWidth: "1px",
        borderColor: "rgba(59, 130, 246, 0.5)",
        backdropFilter: "none",
        duration: 0.3
      });

      // Resume ticker
      gsap.ticker.add(onTick);
    };
    
    // Click Effects
    const onMouseDown = () => {
      gsap.to(cursor, { scale: 0.5, duration: 0.1 });
      gsap.to(follower, { scale: 0.8, duration: 0.1 });
    };
    
    const onMouseUp = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" });
      gsap.to(follower, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    const links = document.querySelectorAll("a, button, input, textarea, [role='button']");
    links.forEach((link) => {
      link.addEventListener("mouseenter", onMouseEnterLink);
      link.addEventListener("mouseleave", onMouseLeaveLink);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
      });
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current);
    };
  }, []);

  return (
    <>
      <div 
        ref={followerRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full border border-blue-500/50 pointer-events-none z-[9998]"
        style={{ 
          willChange: "transform, width, height",
          transformStyle: "preserve-3d", // Crucial for 3D effect
          perspective: "1000px" 
        }}
      />
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full pointer-events-none z-[9999] shadow-[0_0_15px_rgba(59,130,246,0.8)]"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
