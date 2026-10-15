"use client";

import React, { useEffect, useRef, useState } from "react";

interface CircumferenceBeamProps {
  /** If false, disables the animation loop to save resources (e.g. when drawer is expanded) */
  active?: boolean;
  className?: string;
}

export function CircumferenceBeam({ active = true, className = "" }: CircumferenceBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Track active theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // Finalized Specs:
    // Dark: #ffffff, Head: 1.5px, Needle: 0.35px, Glow: 22px, Len: 55%, Speed: 6.0s
    // Light: #cfb8a5, Head: 1.5px, Needle: 0.35px, Glow: 22px, Len: 55%, Speed: 6.0s
    const beamColor = theme === "dark" ? "#ffffff" : "#cfb8a5";
    const headWidth = 1.5;
    const glowRadius = 22;
    const lenPct = 55;
    const speedSeconds = 6.0;

    const rgb = hexToRgb(beamColor);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const w = parent.offsetWidth + 2;
      const h = parent.offsetHeight + 2;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = (timestamp: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = parent.offsetWidth + 2;
      const H = parent.offsetHeight + 2;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      const r = (H - 1) / 2;
      const straightW = Math.max(0, W - 1 - 2 * r);
      const perimeter = 2 * straightW + 2 * Math.PI * r;
      const beamLength = perimeter * (lenPct / 100);

      const loopMs = speedSeconds * 1000;
      const progress = (timestamp % loopMs) / loopMs;
      const headDist = (progress * perimeter) % perimeter;

      const STEPS = 64;

      // Draw continuous smooth comet from tail to head
      for (let i = STEPS - 1; i >= 0; i--) {
        const tNorm1 = i / STEPS; // 0 at head, 1 at tail
        const tNorm2 = (i + 1) / STEPS;

        const s1 = tNorm1 * beamLength;
        const s2 = tNorm2 * beamLength;

        const d1 = (headDist - s1 + perimeter * 2) % perimeter;
        const d2 = (headDist - s2 + perimeter * 2) % perimeter;

        const p1 = getPillPoint(d1, W, H, r, straightW);
        const p2 = getPillPoint(d2, W, H, r, straightW);

        // Continuous smooth width taper: 1.5px head -> 0.35px needle point
        const width = Math.max(0.35, headWidth * Math.pow(1 - tNorm1, 1.15));

        // Continuous smooth intensity fade: 1.0 at head -> 0.0 at tail
        const alpha = Math.pow(1 - tNorm1, 1.45);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(3)})`;

        // Radiant glow near head
        if (tNorm1 < 0.28 && glowRadius > 0) {
          ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.9 * (1 - tNorm1 / 0.28)).toFixed(3)})`;
          ctx.shadowBlur = glowRadius * (1 - tNorm1 / 0.28);
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
      }

      // Draw curvy rounded head cap with specular tip highlight
      const headPoint = getPillPoint(headDist, W, H, r, straightW);
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, headWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
      if (glowRadius > 0) {
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
        ctx.shadowBlur = glowRadius * 1.1;
      }
      ctx.fill();

      // Specular highlight at leading tip
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, Math.max(0.45, headWidth * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      if (glowRadius > 0) {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = Math.min(6, glowRadius * 0.35);
      }
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [active, theme]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-[1px] z-20 overflow-visible rounded-full ${className}`}
    />
  );
}

function hexToRgb(hex: string) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getPillPoint(d: number, W: number, H: number, r: number, straightW: number) {
  const startX = 0.5 + r;
  const topY = 0.5;
  const botY = H - 0.5;

  // Segment 1: Top straight edge (left -> right)
  if (d < straightW) {
    return { x: startX + d, y: topY };
  }

  // Segment 2: Right arc (clockwise)
  const dArcR = d - straightW;
  const arcLen = Math.PI * r;
  if (dArcR < arcLen) {
    const angle = -Math.PI / 2 + dArcR / r;
    return {
      x: 0.5 + r + straightW + r * Math.cos(angle),
      y: 0.5 + r + r * Math.sin(angle),
    };
  }

  // Segment 3: Bottom straight edge (right -> left)
  const dBot = dArcR - arcLen;
  if (dBot < straightW) {
    return {
      x: 0.5 + r + straightW - dBot,
      y: botY,
    };
  }

  // Segment 4: Left arc (clockwise)
  const dArcL = dBot - straightW;
  const angle = Math.PI / 2 + dArcL / r;
  return {
    x: 0.5 + r + r * Math.cos(angle),
    y: 0.5 + r + r * Math.sin(angle),
  };
}
