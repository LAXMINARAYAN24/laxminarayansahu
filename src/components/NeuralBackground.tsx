import { useEffect, useRef } from "react";

/**
 * Animated neural-network background.
 * Uses currentColor + CSS variables so it themes automatically
 * (works simultaneously for light and dark).
 */
export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    type Pulse = { a: number; b: number; t: number; speed: number };

    let nodes: Node[] = [];
    let pulses: Pulse[] = [];

    const cssVar = (name: string) => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || "oklch(0.6 0.16 200)";
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.floor((width * height) / 16000);
      const count = Math.max(40, Math.min(110, target));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.4,
      }));
      pulses = [];
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const MAX_DIST = 140;

    const draw = () => {
      const primary = cssVar("--primary");
      const accent = cssVar("--accent");

      ctx.clearRect(0, 0, width, height);

      // move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // gentle attraction toward cursor
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 200 * 200) {
          const f = 0.0009;
          n.vx += dx * f * 0.02;
          n.vy += dy * f * 0.02;
        }
        // damping
        n.vx = Math.max(-0.6, Math.min(0.6, n.vx * 0.995));
        n.vy = Math.max(-0.6, Math.min(0.6, n.vy * 0.995));
      }

      // edges
      const edges: { a: number; b: number; dist: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;
            ctx.strokeStyle = `color-mix(in oklab, ${primary} ${Math.round(
              alpha * 100,
            )}%, transparent)`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            edges.push({ a: i, b: j, dist });
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = `color-mix(in oklab, ${primary} 75%, transparent)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // spawn pulses occasionally
      if (edges.length && Math.random() < 0.08 && pulses.length < 18) {
        const e = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({ a: e.a, b: e.b, t: 0, speed: 0.008 + Math.random() * 0.012 });
      }

      // draw + advance pulses
      pulses = pulses.filter((p) => {
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) return false;
        p.t += p.speed;
        if (p.t >= 1) return false;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        ctx.fillStyle = `color-mix(in oklab, ${accent} ${Math.round(
          fade * 90,
        )}%, transparent)`;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* soft theme-aware glow wash */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-glow)", opacity: 0.6 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70 dark:opacity-90"
      />
      {/* vignette so foreground text stays crisp */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, color-mix(in oklab, var(--background) 55%, transparent) 80%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
