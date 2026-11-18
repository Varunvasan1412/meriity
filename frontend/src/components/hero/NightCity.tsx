"use client";
import { useEffect, useRef } from "react";
import { onStingerLift } from "@/lib/stinger";

/**
 * "The city lights up": a stylised Melbourne skyline at night, drawn on one canvas.
 *
 *  - Before the logo stinger lifts the city is dark. Once it lifts, office windows switch on
 *    a few at a time (some flicker), and red aviation lights blink on the tallest towers.
 *  - As the visitor scrolls through the hero, more windows turn coral and pulse: the trusted
 *    businesses becoming visible. The city drifts a little slower than the page for depth.
 *  - The lit city reflects, rippling, in the Yarra along the bottom.
 *
 * Landmarks (stylised silhouettes): the Arts Centre spire, the Rialto twins, 120 Collins (mast),
 * 101 Collins (pyramid roof), Australia 108 (with its "starburst" bulge) and Eureka (gold crown).
 * Everything is procedural: no images, sharp at any size. Rendering is capped at 30 fps and
 * stops entirely while the hero is off screen or the tab is hidden.
 */

type Kind = "box" | "slant" | "pyramid" | "mast" | "a108" | "eureka" | "spire";
type Spec = [x: number, w: number, h: number, kind?: Kind];

// Front row, in a 1000-unit wide virtual skyline. h is relative to the tallest tower (A108 = 1).
const FRONT: Spec[] = [
  // Low-rise on the left, under the headline.
  [0, 40, 0.16], [38, 34, 0.2], [70, 44, 0.15], [112, 36, 0.22, "slant"], [146, 42, 0.17],
  [186, 46, 0.5, "spire"], // Arts Centre
  [236, 40, 0.24], [274, 30, 0.3, "slant"], [302, 44, 0.21], [344, 36, 0.27], [378, 40, 0.2],
  [416, 34, 0.32, "pyramid"], [448, 40, 0.28],
  // The landmark cluster, right of the headline.
  [486, 34, 0.5], [518, 30, 0.44], // Rialto twins
  [552, 40, 0.34],
  [590, 44, 0.56, "mast"], // 120 Collins
  [638, 34, 0.52, "pyramid"], // 101 Collins
  [674, 30, 0.4, "slant"],
  [706, 44, 1.0, "a108"], // Australia 108
  [754, 30, 0.42],
  [786, 44, 0.9, "eureka"], // Eureka Tower
  [834, 38, 0.5], [870, 30, 0.6], [898, 40, 0.36], [936, 34, 0.44, "slant"], [968, 32, 0.28],
];

/** Small deterministic random generator, so the city is the same on every visit. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TINTS = ["#ffdca6", "#fff1d6", "#ffe8c2", "#d9e6ff"];
const CORAL = "251,75,81";

export default function NightCity({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Offscreen layers (device pixels): static sky, static silhouettes, per-frame lit city.
    const sky = document.createElement("canvas");
    const sil = document.createElement("canvas");
    const city = document.createElement("canvas");

    let W = 0, H = 0, dpr = 1, horizon = 0, mobile = false;
    // Window data (CSS px), filled by build().
    let n = 0;
    let wx = new Float32Array(0), wy = new Float32Array(0), ww = new Float32Array(0), wh = new Float32Array(0);
    let onAt = new Float32Array(0), alpha = new Float32Array(0), coralTh = new Float32Array(0), phase = new Float32Array(0);
    let tint = new Uint8Array(0), flick = new Float32Array(0);
    let beacons: { x: number; y: number; ph: number }[] = [];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      mobile = W < 768;
      for (const c of [canvas, sky, city, sil]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }

      // Skyline geometry. Desktop: the full skyline across the width, tall towers on the right,
      // clear of the headline. Phones: zoom on the landmark cluster above the copy.
      horizon = mobile ? H * 0.57 : H * 0.83;
      const S = mobile ? H * 0.38 : Math.min(H * 0.6, W * 0.42); // height of A108 in px
      const sx = mobile ? 0.95 : W / 1000; // px per virtual unit
      const ox = mobile ? W / 2 - 700 * sx : 0;
      const X = (v: number) => ox + v * sx;

      // ---------- sky ----------
      const sk = sky.getContext("2d")!;
      sk.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = sk.createLinearGradient(0, 0, 0, horizon);
      g.addColorStop(0, "#04060a");
      g.addColorStop(0.6, "#070b13");
      g.addColorStop(1, "#0d1626");
      sk.fillStyle = g;
      sk.fillRect(0, 0, W, H);
      // Horizon glow: city light pollution, Meriity blue with a faint warm core.
      const glow = sk.createRadialGradient(W * 0.62, horizon, 0, W * 0.62, horizon, Math.max(W, H) * 0.7);
      glow.addColorStop(0, "rgba(9,49,96,0.55)");
      glow.addColorStop(0.35, "rgba(9,49,96,0.18)");
      glow.addColorStop(1, "rgba(9,49,96,0)");
      sk.fillStyle = glow;
      sk.fillRect(0, 0, W, H);
      const warm = sk.createRadialGradient(W * 0.66, horizon, 0, W * 0.66, horizon, S * 0.9);
      warm.addColorStop(0, "rgba(255,170,120,0.07)");
      warm.addColorStop(1, "rgba(255,170,120,0)");
      sk.fillStyle = warm;
      sk.fillRect(0, 0, W, H);
      // A few faint stars, high up.
      const sr = rng(7);
      for (let i = 0; i < 70; i++) {
        const y = sr() * horizon * 0.55;
        sk.fillStyle = `rgba(255,255,255,${0.08 + sr() * 0.25})`;
        sk.fillRect(sr() * W, y, sr() < 0.85 ? 1 : 1.6, sr() < 0.85 ? 1 : 1.6);
      }

      // ---------- silhouettes + window grid ----------
      const sc = sil.getContext("2d")!;
      sc.setTransform(dpr, 0, 0, dpr, 0, 0);
      sc.clearRect(0, 0, W, H);
      const cell = Math.max(4.2, Math.min(8, S * 0.0165));
      const rowH = cell * 1.5;
      const r = rng(1412);
      const xs: number[] = [], ys: number[] = [], wsz: number[] = [], hsz: number[] = [];
      const on: number[] = [], al: number[] = [], th: number[] = [], ph: number[] = [], tn: number[] = [];
      beacons = [];

      const addWindows = (
        left: number, right: number, base: number, topY: number,
        inside: (cx: number, y: number) => boolean, back: boolean,
      ) => {
        const ww0 = cell * (back ? 0.36 : 0.44);
        const wh0 = rowH * (back ? 0.3 : 0.38);
        for (let y = base - rowH * 0.9; y > topY + rowH * 0.4; y -= rowH) {
          for (let x = left + cell * 0.55; x < right - cell * 0.5; x += cell) {
            if (!inside(x + ww0 / 2, y)) continue;
            const lit = r() < (back ? 0.28 : 0.44);
            xs.push(x); ys.push(y); wsz.push(ww0); hsz.push(wh0);
            on.push(lit ? 0.25 + 3.6 * Math.pow(r(), 1.5) : Infinity);
            al.push(back ? 0.18 + r() * 0.22 : 0.45 + r() * 0.5);
            // ~6% of lit front windows can turn coral; thresholds spread across the scroll.
            th.push(!back && lit && r() < 0.075 ? Math.pow(r(), 1.2) : -1);
            ph.push(r());
            tn.push(Math.floor(r() * (r() < 0.2 ? 4 : 3)));
          }
        }
      };

      // Back row: distant, hazier blocks for depth.
      const rb = rng(99);
      for (let v = -20; v < 1020; ) {
        const w = 18 + rb() * 26, h = 0.1 + rb() * 0.34;
        const L = X(v), R = X(v + w), top = horizon - h * S * 0.92;
        sc.fillStyle = "#0e1420";
        sc.fillRect(L, top, R - L, horizon - top);
        addWindows(L, R, horizon, top, () => true, true);
        v += w + 2 + rb() * 10;
      }

      // Front row: the landmarks.
      FRONT.forEach(([v, w, h, kind = "box"], i) => {
        const L = X(v), R = X(v + w), cx = (L + R) / 2, hw = (R - L) / 2;
        const top = horizon - h * S;
        sc.fillStyle = i % 2 ? "#0a0e15" : "#0c111a";
        const tAt = (y: number) => (horizon - y) / (h * S); // 0 at base, 1 at top
        let inside: (x: number, y: number) => boolean = (_x, y) => tAt(y) < 0.97;

        if (kind === "box") {
          sc.fillRect(L, top, R - L, horizon - top);
        } else if (kind === "slant") {
          sc.beginPath();
          sc.moveTo(L, horizon); sc.lineTo(L, top); sc.lineTo(R, top + h * S * 0.12); sc.lineTo(R, horizon); sc.closePath(); sc.fill();
          inside = (_x, y) => tAt(y) < 0.85;
        } else if (kind === "pyramid" || kind === "mast") {
          const bodyTop = horizon - h * S * 0.86;
          sc.fillRect(L, bodyTop, R - L, horizon - bodyTop);
          if (kind === "pyramid") {
            sc.beginPath(); sc.moveTo(L, bodyTop); sc.lineTo(cx, top); sc.lineTo(R, bodyTop); sc.closePath(); sc.fill();
          } else {
            sc.fillRect(L + hw * 0.4, bodyTop - h * S * 0.03, hw * 1.2, h * S * 0.03);
            sc.fillRect(cx - 1, top, 2, bodyTop - top);
            beacons.push({ x: cx, y: top, ph: 0.3 });
          }
          inside = (_x, y) => tAt(y) < 0.84;
        } else if (kind === "eureka") {
          sc.fillRect(L, top, R - L, horizon - top);
          // Gold crown.
          const crown = sc.createLinearGradient(0, top, 0, top + h * S * 0.09);
          crown.addColorStop(0, "rgba(201,160,80,0.55)");
          crown.addColorStop(1, "rgba(120,90,40,0.25)");
          sc.fillStyle = crown;
          sc.fillRect(L, top, R - L, h * S * 0.09);
          beacons.push({ x: cx, y: top - 2, ph: 0.75 });
          inside = (_x, y) => tAt(y) < 0.89;
        } else if (kind === "a108") {
          // Slender, gently tapering, with the cantilevered "starburst" at ~2/3 height.
          const half = (t: number) => {
            let k = hw * (1 - 0.2 * t);
            if (t > 0.6 && t < 0.7) k += hw * 0.38 * Math.sin((Math.PI * (t - 0.6)) / 0.1);
            if (t > 0.95) k *= 1 - ((t - 0.95) / 0.05) * 0.55;
            return k;
          };
          sc.beginPath();
          const steps = 80;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const y = horizon - t * h * S;
            if (s === 0) sc.moveTo(cx - half(t), y);
            else sc.lineTo(cx - half(t), y);
          }
          for (let s = steps; s >= 0; s--) {
            const t = s / steps;
            sc.lineTo(cx + half(t), horizon - t * h * S);
          }
          sc.closePath();
          sc.fill();
          beacons.push({ x: cx, y: top - 2, ph: 0 });
          inside = (x, y) => {
            const t = tAt(y);
            return t < 0.93 && Math.abs(x - cx) < half(t) - cell * 0.35;
          };
        } else if (kind === "spire") {
          // Arts Centre: low pavilion with the lattice spire rising from it.
          const pav = horizon - h * S * 0.12;
          sc.fillRect(L, pav, R - L, horizon - pav);
          const baseHW = hw * 0.55;
          sc.beginPath(); sc.moveTo(cx - baseHW, pav); sc.lineTo(cx, top); sc.lineTo(cx + baseHW, pav); sc.closePath();
          sc.fillStyle = "rgba(12,16,24,0.9)";
          sc.fill();
          sc.strokeStyle = "rgba(190,180,255,0.32)";
          sc.lineWidth = 1;
          sc.stroke();
          // Lattice.
          sc.beginPath();
          const rungs = 14;
          for (let k = 0; k < rungs; k++) {
            const t0 = k / rungs, t1 = (k + 1) / rungs;
            const y0 = pav - (pav - top) * t0, y1 = pav - (pav - top) * t1;
            const a0 = baseHW * (1 - t0), a1 = baseHW * (1 - t1);
            sc.moveTo(cx - a0, y0); sc.lineTo(cx + a1, y1);
            sc.moveTo(cx + a0, y0); sc.lineTo(cx - a1, y1);
          }
          sc.strokeStyle = "rgba(190,180,255,0.16)";
          sc.stroke();
          beacons.push({ x: cx, y: top, ph: 0.5 });
          inside = (_x, y) => y > pav;
        }
        // Faint rim light on the roofline.
        sc.fillStyle = "rgba(255,255,255,0.035)";
        sc.fillRect(L, top, R - L, 1);
        if (kind !== "spire") addWindows(L, R, horizon, top, inside, false);
      });

      n = xs.length;
      wx = Float32Array.from(xs); wy = Float32Array.from(ys); ww = Float32Array.from(wsz); wh = Float32Array.from(hsz);
      onAt = Float32Array.from(on); alpha = Float32Array.from(al); coralTh = Float32Array.from(th); phase = Float32Array.from(ph);
      tint = Uint8Array.from(tn); flick = new Float32Array(n);
    };

    // ---------- per-frame ----------
    let start = -1; // time (s) the stinger lifted; -1 = still dark
    let scrollY = window.scrollY;
    const onScroll = () => (scrollY = window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    const draw = (now: number) => {
      const t = reduced ? 99 : start < 0 ? -1 : now - start;
      const heroH = canvas.parentElement?.getBoundingClientRect().height || H;
      const p = Math.min(1, Math.max(0, scrollY / (heroH * 0.85)));
      const coralP = t > 4 ? Math.max(p, 0.12) : p; // a few coral windows show above the fold
      const drift = reduced ? 0 : Math.min(scrollY, heroH) * 0.22; // city lags behind the page

      // Lit city layer = silhouettes + windows + beacons.
      const cc = city.getContext("2d")!;
      cc.setTransform(1, 0, 0, 1, 0, 0);
      cc.clearRect(0, 0, city.width, city.height);
      cc.drawImage(sil, 0, 0);
      cc.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (t > 0) {
        // Occasional flicker: a few lit windows dip for a moment.
        if (!reduced && Math.random() < 0.35) {
          const i = (Math.random() * n) | 0;
          if (onAt[i] < t) flick[i] = t + 0.08 + Math.random() * 0.5;
        }
        for (let i = 0; i < n; i++) {
          const o = onAt[i];
          if (o > t) continue;
          let a = Math.min(1, (t - o) / 0.3) * alpha[i];
          if (flick[i] > t) a *= 0.12;
          const th = coralTh[i];
          if (th >= 0 && coralP >= th && t > o + 0.6) {
            const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(Math.PI * 2 * (t * 0.32 + phase[i])));
            cc.fillStyle = `rgba(${CORAL},${0.12 * pulse})`;
            cc.fillRect(wx[i] - ww[i] * 2, wy[i] - wh[i] * 2, ww[i] * 5, wh[i] * 5);
            cc.fillStyle = `rgba(${CORAL},${0.22 * pulse})`;
            cc.fillRect(wx[i] - ww[i] * 0.8, wy[i] - wh[i] * 0.8, ww[i] * 2.6, wh[i] * 2.6);
            cc.fillStyle = `rgba(${CORAL},${0.75 + 0.25 * pulse})`;
          } else {
            cc.globalAlpha = a;
            cc.fillStyle = TINTS[tint[i]];
          }
          cc.fillRect(wx[i], wy[i], ww[i], wh[i]);
          cc.globalAlpha = 1;
        }
        // Red aviation lights on the tallest towers.
        for (const b of beacons) {
          const on = ((t + b.ph) % 1.7) < 0.18;
          if (!on) continue;
          cc.fillStyle = "rgba(255,40,40,0.25)";
          cc.beginPath(); cc.arc(b.x, b.y, 5, 0, Math.PI * 2); cc.fill();
          cc.fillStyle = "#ff3b3b";
          cc.beginPath(); cc.arc(b.x, b.y, 1.6, 0, Math.PI * 2); cc.fill();
        }
      }

      // ---------- compose ----------
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#04060a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sky, 0, Math.round(drift * 0.4 * dpr));
      const dy = Math.round(drift * dpr);
      ctx.drawImage(city, 0, dy);

      // River: dark water with a rippling reflection of the lit city.
      const hz = Math.round((horizon + drift) * dpr);
      const riverH = city.height - hz;
      ctx.fillStyle = "#04060a";
      ctx.fillRect(0, hz, city.width, riverH);
      const strip = Math.max(2, Math.round(2 * dpr));
      for (let y = 0; y < riverH; y += strip) {
        const k = y / riverH;
        ctx.globalAlpha = 0.34 * Math.pow(1 - k, 1.6);
        const xo = Math.sin(y / (6 * dpr) + (t > 0 ? t * 1.6 : 0)) * (1.5 + 3 * k) * dpr;
        const srcY = Math.round(horizon * dpr) - y - strip; // mirror around the waterline
        if (srcY < 0) break;
        ctx.drawImage(city, 0, srcY, city.width, strip, xo, hz + y, city.width, strip);
      }
      ctx.globalAlpha = 1;
      // Waterline highlight.
      ctx.fillStyle = "rgba(160,190,255,0.07)";
      ctx.fillRect(0, hz, city.width, Math.max(1, dpr));

      // Legibility: darken behind the headline (left on desktop, lower half on phones) and the nav.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mobile) {
        const m = ctx.createLinearGradient(0, horizon * 0.95, 0, H);
        m.addColorStop(0, "rgba(7,7,7,0)");
        m.addColorStop(0.35, "rgba(7,7,7,0.72)");
        m.addColorStop(1, "rgba(7,7,7,0.92)");
        ctx.fillStyle = m;
        ctx.fillRect(0, 0, W, H);
      } else {
        const l = ctx.createLinearGradient(0, 0, W * 0.62, 0);
        l.addColorStop(0, "rgba(7,7,7,0.82)");
        l.addColorStop(0.55, "rgba(7,7,7,0.45)");
        l.addColorStop(1, "rgba(7,7,7,0)");
        ctx.fillStyle = l;
        ctx.fillRect(0, 0, W, H);
      }
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.22);
      topFade.addColorStop(0, "rgba(7,7,7,0.7)");
      topFade.addColorStop(1, "rgba(7,7,7,0)");
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, H * 0.22);
    };

    build();
    draw(0);

    // Loop: 30 fps cap, only while visible and after the stinger lifts.
    let raf = 0, last = 0, visible = true, running = false;
    const fps = window.innerWidth < 768 ? 24 : 30;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (ms - last < 1000 / fps - 1) return;
      last = ms;
      draw(ms / 1000);
    };
    const run = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const offLift = onStingerLift(() => {
      start = performance.now() / 1000;
      run();
    });
    if (reduced) draw(0);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    let rt = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        build();
        draw(performance.now() / 1000);
      }, 120);
    });
    ro.observe(canvas);

    return () => {
      offLift();
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(rt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
