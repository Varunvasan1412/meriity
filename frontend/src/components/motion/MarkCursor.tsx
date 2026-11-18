"use client";
import { useEffect, useRef } from "react";
import { getHandoff, getHeading } from "@/lib/handoff";

// The Meriity mark as a solid vector: three nested chevrons (same proportions as the
// hero mosaic). Tip at (0,0), pointing up; y grows downward.
const R = 0.48, T = 0.48;
const BANDS = [
  { oy: 0, w: 1 },
  { oy: 0.58, w: 1 },
  { oy: 1.16, w: 0.7 },
];
const band = ({ oy, w }: { oy: number; w: number }) =>
  [
    [-w, oy + R * w],
    [0, oy],
    [w, oy + R * w],
    [w, oy + R * w + T],
    [0, oy + T],
    [-w, oy + R * w + T],
  ]
    .map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`)
    .join(" ");
const HEIGHT = BANDS[2].oy + R * BANDS[2].w + T;
const POINTS = BANDS.map(band);

/** Small solid mark, used for the trail ghosts and the click sparks. */
const solidMark = (width: number, fill: string) =>
  `<svg width="${width}" height="${(width * HEIGHT) / 2}" viewBox="-1 0 2 ${HEIGHT}" style="display:block;overflow:visible">${POINTS.map(
    (p) => `<polygon points="${p}" fill="${fill}"/>`,
  ).join("")}</svg>`;

const TRAIL = 5;
const INTERACTIVE = "a, button, [role='button'], label, summary, input, textarea, select";

/**
 * After the hero, the Meriity mark becomes the mouse pointer. It arrives with the 3D arrow's
 * heading, then follows with a slight lag and turns to point the way the mouse travels.
 * Super powers (once fully handed off):
 *   - Hover: over a link or button the three chevrons spring apart along the arrow and pulse
 *     forward in sequence, back to tip, until you leave.
 *   - Click burst: a click fires tiny Meriity chevrons outward from the tip.
 *   - Speed trail: moving the mouse leaves a short fading trail of ghost marks.
 * Fine pointers only; fades in as the shared hand-off rises, taking over from the 3D mark.
 */
export default function MarkCursor() {
  const el = useRef<HTMLDivElement>(null);
  const ghosts = useRef<(HTMLDivElement | null)[]>([]);
  const sparks = useRef<HTMLDivElement>(null);
  const bands = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const node = el.current!;
    const root = document.documentElement;
    for (const g of ghosts.current) if (g) g.innerHTML = solidMark(30, "#fb4b51");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    // Until the hand-off completes it mirrors the 3D arrow's heading; then the user steers it.
    let angle = 0, angleTarget = 0, scale = 1, speed = 0;
    let prev = { ...target };
    let hovering = false, spread = 0;
    let hasMoved = false;
    let isInside = true;
    const history: { x: number; y: number; a: number }[] = [];

    const onMove = (e: PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        pos.x = target.x = e.clientX;
        pos.y = target.y = e.clientY;
        prev = { x: e.clientX, y: e.clientY };
      }
      isInside = true;
      target.x = e.clientX;
      target.y = e.clientY;
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      if (dx * dx + dy * dy > 9) {
        // Point the tip along the direction of travel (the mark points up at 0deg).
        if (getHandoff() >= 1) angleTarget = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        prev = { x: e.clientX, y: e.clientY };
      }
      hovering = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
    };

    const onLeave = () => {
      isInside = false;
      node.style.opacity = "0";
      root.classList.remove("mark-cursor");
    };

    const onEnter = () => {
      isInside = true;
    };

    // Click burst: tiny chevrons fly outward from the tip, each pointing the way it flies.
    const onDown = (e: PointerEvent) => {
      if (getHandoff() < 1 || reduced || !sparks.current) return;
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 38 + Math.random() * 34;
        const s = document.createElement("div");
        s.innerHTML = solidMark(9 + Math.random() * 5, i % 3 ? "#fb4b51" : "#ff9a9d");
        s.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;transform-origin:0 0`;
        sparks.current.appendChild(s);
        const deg = (a * 180) / Math.PI + 90;
        const x0 = e.clientX, y0 = e.clientY;
        s.animate(
          [
            { transform: `translate3d(${x0}px,${y0}px,0) rotate(${deg}deg) translate(-50%,0) scale(1)`, opacity: 1 },
            {
              transform: `translate3d(${x0 + Math.cos(a) * dist}px,${y0 + Math.sin(a) * dist}px,0) rotate(${deg}deg) translate(-50%,0) scale(0.4)`,
              opacity: 0,
            },
          ],
          { duration: 620 + Math.random() * 200, easing: "cubic-bezier(0.16,1,0.3,1)" },
        ).onfinish = () => s.remove();
      }
      // The cursor itself gives a quick recoil.
      scale = 0.78;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!hasMoved || !isInside) return;
      const mix = getHandoff();
      // Swap the system arrow out only once the mark is mostly visible.
      root.classList.toggle("mark-cursor", mix > 0.5);

      const k = reduced ? 1 : 0.32;
      const lastX = pos.x, lastY = pos.y;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      speed += (Math.hypot(pos.x - lastX, pos.y - lastY) - speed) * 0.25;

      const drawX = pos.x, drawY = pos.y;
      let aim = angleTarget;

      // Still blending (or not yet arrived): match the 3D arrow exactly.
      if (mix < 1) angle = angleTarget = aim = getHeading();
      const d = ((aim - angle + 540) % 360) - 180; // shortest way round
      angle += d * (reduced ? 1 : 0.16);

      // Fade in at full size (the 3D mark fades out at the same size and spot): no pop.
      scale += (1 - scale) * 0.18;

      // Hover power: chevrons spring apart along the arrow and pulse forward, back to tip.
      spread += ((mix >= 1 && hovering && !reduced ? 1 : 0) - spread) * 0.16;
      const now = performance.now() / 1000;
      bands.current.forEach((g, i) => {
        if (!g) return;
        const gap = (i - 1) * 0.32 * spread; // band 0 (tip) moves ahead, band 2 falls back
        const pulse = Math.max(0, Math.sin(now * 6 - (2 - i) * 0.9)) * 0.16 * spread; // ripples toward the tip
        g.setAttribute("transform", `translate(0 ${(gap - pulse).toFixed(4)})`);
      });
      node.style.opacity = String(mix);
      // The tip is the hotspot: translate to the pointer, rotate and scale around the tip.
      node.style.transform = `translate3d(${drawX}px, ${drawY}px, 0) rotate(${angle}deg) scale(${scale})`;

      // Speed trail: ghosts follow older positions, visible only when moving fast.
      history.unshift({ x: drawX, y: drawY, a: angle });
      if (history.length > TRAIL * 4 + 1) history.pop();
      const strength = mix >= 1 && !reduced ? Math.min(Math.max((speed - 1.5) / 8, 0), 1) : 0;
      ghosts.current.forEach((g, i) => {
        if (!g) return;
        const h = history[Math.min((i + 1) * 4, history.length - 1)];
        g.style.opacity = String(strength * 0.75 * (1 - i / (TRAIL + 1)));
        g.style.transform = `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.a}deg) scale(${1 - (i + 1) * 0.1}) translate(-15px, 0)`;
      });
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      root.classList.remove("mark-cursor");
    };
  }, []);

  return (
    <>
      {/* Trail ghosts (behind the cursor) and click sparks */}
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={(n) => {
            ghosts.current[i] = n;
          }}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[89] opacity-0 will-change-transform"
          style={{ transformOrigin: "0 0" }}
        />
      ))}
      <div ref={sparks} aria-hidden className="pointer-events-none fixed inset-0 z-[89]" />

      <div
        ref={el}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[90] opacity-0 will-change-transform"
        style={{ transformOrigin: "0 0" }}
      >
        {/* Drawn centred on the tip so rotation/scale pivot on the hotspot. */}
        <svg width="30" height={30 * (HEIGHT / 2)} viewBox={`-1 0 2 ${HEIGHT}`} style={{ transform: "translate(-15px, 0)", overflow: "visible" }}>
          <defs>
            {/* Glossy metallic coral: bright upper sheen, deep lower edge, thin highlight. */}
            <linearGradient id="mc-metal" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0" stopColor="#ff9a9d" />
              <stop offset="0.28" stopColor="#fb4b51" />
              <stop offset="0.62" stopColor="#c8262d" />
              <stop offset="1" stopColor="#ff6a70" />
            </linearGradient>
            <filter id="mc-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0.06" stdDeviation="0.05" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#mc-shadow)">
            {POINTS.map((p, i) => (
              <g
                key={p}
                ref={(n) => {
                  bands.current[i] = n;
                }}
              >
                <polygon points={p} fill="url(#mc-metal)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.035" strokeLinejoin="round" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}
