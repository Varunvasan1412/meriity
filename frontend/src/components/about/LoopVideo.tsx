"use client";
import { useEffect, useRef } from "react";
import { onStingerLift } from "@/lib/stinger";

/**
 * Muted looping film. It only starts after the page's stinger has lifted (a large video
 * starting to decode mid-transition makes it stutter) and pauses whenever it is off screen.
 */
export default function LoopVideo({ mp4, webm, poster }: { mp4?: string; webm?: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let lifted = false;
    let inView = false;
    let wait: number | undefined;
    const tryPlay = () => {
      if (lifted && inView) v.play().catch(() => {});
    };
    const off = onStingerLift(() => {
      // Let the curtain finish moving before the decoder spins up.
      wait = window.setTimeout(() => {
        lifted = true;
        tryPlay();
      }, 1100);
    });
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) tryPlay();
        else v.pause();
      },
      { rootMargin: "120px" },
    );
    io.observe(v);
    return () => {
      off();
      io.disconnect();
      window.clearTimeout(wait);
    };
  }, []);

  return (
    <video ref={ref} className="size-full object-cover" muted loop playsInline preload="metadata" poster={poster || undefined}>
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
