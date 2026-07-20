import React, { useEffect, useRef } from "react";

interface HiggsFieldProps {
  className?: string;
  /** Base particle color (the quantized field excitations). */
  particleColor?: string;
  /** Color of the lattice lines that couple neighbouring particles. */
  lineColor?: string;
  /** Rough particle count on a 1080p viewport; auto-scales with area. */
  density?: number;
  /** Max distance (px) at which two particles couple with a lattice line. */
  linkDistance?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
}

/**
 * HiggsField — an interactive particle-field background inspired by the
 * "Particles" family of React Bits effects. Particles drift like excitations
 * across a quantum field and couple to their neighbours (and the cursor) via a
 * faint lattice, evoking the ripple of a Higgs field. Pure canvas, no external
 * dependencies, DPR-aware, and disabled for users who prefer reduced motion.
 */
export default function HiggsField({
  className = "",
  particleColor = "#A370FF",
  lineColor = "108, 0, 255",
  density = 70,
  linkDistance = 130,
}: HiggsFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let animationId = 0;

    // Pointer as a phantom excitation that repels and brightens nearby field nodes
    const pointer = { x: -9999, y: -9999, active: false };
    const POINTER_RADIUS = 160;

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const buildParticles = () => {
      // Scale the count with viewport area, but keep the O(n^2) link pass cheap
      const area = width * height;
      const target = Math.round((density * area) / (1920 * 1080));
      const count = Math.max(24, Math.min(target, 110));

      particles = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.25, 0.25),
        radius: rand(0.8, 2.2),
        phase: rand(0, Math.PI * 2),
      }));
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Advance + integrate the field nodes
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.02;

          // Gentle repulsion away from the pointer excitation
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < POINTER_RADIUS && dist > 0.01) {
              const force = (1 - dist / POINTER_RADIUS) * 0.6;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          // Wrap around the edges for a seamless, boundless field
          if (p.x < -20) p.x = width + 20;
          else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          else if (p.y > height + 20) p.y = -20;
        }
      }

      // Couple neighbouring nodes with a distance-faded lattice line
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.35;
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Bright coupling from the pointer to the nodes it perturbs
        if (pointer.active) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS) {
            const alpha = (1 - dist / POINTER_RADIUS) * 0.5;
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // Draw the glowing field nodes with a soft twinkle
      ctx.shadowColor = particleColor;
      for (const p of particles) {
        const twinkle = reduceMotion ? 1 : 0.7 + Math.sin(p.phase) * 0.3;
        ctx.shadowBlur = 8 * twinkle;
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = Math.min(1, 0.5 + twinkle * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (!reduceMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [particleColor, lineColor, density, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
