"use client";
import { useEffect, useRef } from "react";
import { onStingerLift } from "@/lib/stinger";

// Hero background: a real night photo given 3D depth (see photoDepthScene.ts).
// The photo and its depth map load after first paint; the effect starts once the stinger has
// cleared, then the city fades in, its lights switch on and the camera starts to breathe.
// The loop pauses offscreen and in hidden tabs; reduced-motion users get one still frame.
type Props = {
  className?: string;
  /** The photo, e.g. /hero/city.jpg */
  src: string;
  /** Its depth map (R = depth, G = water mask), e.g. /hero/city-depth.png */
  depth: string;
  /** Point of the photo kept in frame on narrow screens, 0..1 from the top-left. */
  focal?: [number, number];
};

export default function PhotoDepth({ className, src, depth, focal }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Mobile devices use the static high-res image directly
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    // Fetch the code right away; start once the stinger's curtain has cleared.
    const scene = import("./photoDepthScene");
    const lifted = new Promise<void>((res) => {
      cleanups.push(onStingerLift(() => {
        const id = window.setTimeout(res, 700);
        cleanups.push(() => window.clearTimeout(id));
      }));
    });

    Promise.all([scene, lifted])
      .then(async ([{ createPhotoDepth }]) => {
        if (disposed) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lite = window.innerWidth < 1024 || (navigator.hardwareConcurrency || 8) <= 4;
        let city: Awaited<ReturnType<typeof createPhotoDepth>>;
        try {
          city = await createPhotoDepth(canvas, { src, depth, focal, lite, still });
          if (disposed) return city.dispose();
        } catch {
          // No WebGL2: show the photo as a plain, darkened background instead.
          canvas.style.display = "none";
          const host = canvas.parentElement;
          if (host) {
            host.style.backgroundImage = `linear-gradient(rgba(7,7,7,0.35), rgba(7,7,7,0.35)), url(${src})`;
            host.style.backgroundSize = "cover";
            host.style.backgroundPosition = focal ? `${focal[0] * 100}% ${focal[1] * 100}%` : "center";
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, depth]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ opacity: 0, transition: "opacity 1.4s ease" }}
    />
  );
}
