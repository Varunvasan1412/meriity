"use client";
import { useEffect, useRef } from "react";
import { onStingerLift } from "@/lib/stinger";

// Hero background: a real 3D night city (see nightCityScene.ts).
// three.js loads after first paint; the scene is built once the stinger has cleared, then the
// city fades in, lights up and the camera starts its drift. The loop pauses offscreen and in
// hidden tabs; reduced-motion users get one finished still frame.
export default function NightCity3D({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    // Download three.js right away, but build the scene (shader compiling is a main-thread
    // spike) only once the stinger's curtain has fully cleared, so neither stutters.
    const scene = import("./nightCityScene");
    const lifted = new Promise<void>((res) => {
      cleanups.push(onStingerLift(() => {
        const id = window.setTimeout(res, 1300);
        cleanups.push(() => window.clearTimeout(id));
      }));
    });

    Promise.all([scene, lifted])
      .then(([{ createNightCity }]) => {
        if (disposed) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lite = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
        let city: ReturnType<typeof createNightCity>;
        try {
          city = createNightCity(canvas, { lite, still });
        } catch {
          canvas.style.display = "none"; // no WebGL: the hero's dark background stays
          return;
        }
        cleanups.push(() => city.dispose());
        city.start();
        requestAnimationFrame(() => (canvas.style.opacity = "1"));

        const section = canvas.parentElement ?? canvas;
        const onScroll = () => {
          const r = section.getBoundingClientRect();
          city.setScroll(-r.top / Math.max(1, r.height));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          city.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onMove));

        let onScreen = true;
        const sync = () => city.setActive(onScreen && document.visibilityState === "visible");
        const io = new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting;
          sync();
        });
        io.observe(canvas);
        document.addEventListener("visibilitychange", sync);
        cleanups.push(() => {
          io.disconnect();
          document.removeEventListener("visibilitychange", sync);
        });

        const ro = new ResizeObserver(() => city.resize());
        ro.observe(canvas);
        cleanups.push(() => ro.disconnect());
      })
      .catch(() => {
        if (ref.current) ref.current.style.display = "none";
      });

    return () => {
      disposed = true;
      cleanups.reverse().forEach((fn) => fn());
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ opacity: 0, transition: "opacity 1.4s ease", display: "block" }}
    />
  );
}
