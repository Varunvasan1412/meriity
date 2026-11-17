"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

/**
 * Inertia scrolling. Lenis eases toward the target a fraction per frame (lerp),
 * which gives the long, weighted glide; GSAP's ticker drives it so every
 * ScrollTrigger animation reads the exact same scroll position each frame.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.075, // lower = longer, silkier glide
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      smoothWheel: true,
      syncTouch: false, // keep native momentum on phones
      anchors: { offset: -16 },
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
