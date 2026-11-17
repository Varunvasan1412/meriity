"use client";
import { useEffect, useRef } from "react";
import { markStingerLifted } from "@/lib/stinger";

/** Resolves once the page has loaded and the main thread has gone quiet. */
function pageSettled() {
  const loaded = new Promise<void>((r) =>
    document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }),
  );
  const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  const idle = () =>
    new Promise<void>((r) => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(() => r(), { timeout: 450 });
      else window.setTimeout(r, 60);
    });
  return Promise.all([loaded, fonts]).then(idle);
}

/**
 * Stinger styles live here (not in globals.css) so they ship inside the page HTML and apply
 * on the very first paint. Only transform/opacity are animated, so everything runs on the
 * compositor. Easings are the GSAP ones: back.out(2.2), power3.out, expo.inOut, expo.out,
 * power2.inOut, power3.in. The mark starts centred on its own (half of wordmark 235 + gap 27
 * = 131px) and then makes room for the wordmark. The `.stinger` safety animation hides it
 * after 6s if JavaScript never runs.
 */
const STINGER_CSS = `
.stinger {
  animation: st-safety 0s linear 6s forwards;
}
@keyframes st-safety { to { visibility: hidden; } }
.st-night, .st-coral, .st-logo, .st-mark, .st-wm-window, .st-wm-img, .st-glint, .st-glint-img { will-change: transform; }
.st-piece {
  will-change: transform, opacity;
  transform-origin: 50% 50%;
  animation: st-piece 0.55s cubic-bezier(0.34, 1.8, 0.64, 1) both;
}
.st-piece-3 { animation-delay: 0.05s; }
.st-piece-2 { animation-delay: 0.16s; }
.st-piece-1 { animation-delay: 0.27s; }
@keyframes st-piece {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: none; }
}
/* The mark starts centred on its own (half of wordmark 235 + gap 27 = 131px), then makes room. */
.st-mark {
  transform-origin: 50% 50%;
  animation: st-mark 1.35s linear 0.05s both;
}
@keyframes st-mark {
  0% { transform: translateX(131px) scale(0.86); animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
  41% { transform: translateX(131px) scale(1); animation-timing-function: cubic-bezier(0.87, 0, 0.13, 1); }
  100% { transform: translateX(0) scale(1); }
}
.st-wm-window { animation: st-wm-window 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.78s both; }
@keyframes st-wm-window { from { transform: translateX(-101%); } to { transform: none; } }
.st-wm-img { animation: st-wm-img 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.78s both; }
@keyframes st-wm-img { from { transform: translateX(calc(101% - 26px)); } to { transform: none; } }
.st-glint { opacity: 0; animation: st-glint 0.75s cubic-bezier(0.45, 0, 0.55, 1) 1.35s both; }
@keyframes st-glint {
  0% { opacity: 1; transform: translateX(-94px); }
  99% { opacity: 1; }
  100% { opacity: 0; transform: translateX(235px); }
}
.st-glint-img { animation: st-glint-img 0.75s cubic-bezier(0.45, 0, 0.55, 1) 1.35s both; }
@keyframes st-glint-img { from { transform: translateX(94px); } to { transform: translateX(-235px); } }
/* Lift, triggered by JS once the page has loaded and gone idle. */
.st-lift .st-logo { animation: st-logo-out 0.45s cubic-bezier(0.55, 0.055, 0.675, 0.19) both; }
@keyframes st-logo-out { to { opacity: 0; transform: translateY(-28px) scale(0.94); } }
.st-lift .st-night { animation: st-up 1.05s cubic-bezier(0.87, 0, 0.13, 1) 0.1s both; }
.st-lift .st-coral { animation: st-up 1.05s cubic-bezier(0.87, 0, 0.13, 1) 0.22s both; }
@keyframes st-up { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(0, -100%, 0); } }
@media (prefers-reduced-motion: reduce) { .stinger { display: none; } }
`;

const GLINT_MASK = "linear-gradient(100deg, transparent, #000 40%, #000 60%, transparent)";

const PIECES = [
  "M12.8 45.5 12.8 66 56.75 41.2 100.7 66 100.7 45.5 56.75 20Z",
  "M12.8 75.4 12.8 87.5 19.6 91.6 56.75 70.6 93.9 91.6 100.7 87.5 100.7 75.4 56.75 49.4Z",
  "M27.8 96.3 44.5 105.9 47.4 105.9 56.75 100.6 66.1 105.9 69 105.9 85.7 96.3 56.75 79.4Z",
];

/** When the CSS build sequence has finished, measured from navigation start. */
const BUILD_MS = 2150;

/**
 * Logo stinger shown on every full page load. The whole thing is CSS keyframes on
 * transform/opacity only, so it runs on the compositor and starts on the very first paint:
 * a busy main thread while the page hydrates can't make it stutter, and the finished logo
 * never flashes before the build (the start states are applied by CSS, not JavaScript).
 *
 *   0.00s  the three pieces of the Meriity mark snap up into place, bottom piece first
 *   0.60s  the mark slides left while the "meriity" wordmark wipes in beside it
 *   1.35s  a glint runs across the wordmark
 *   lift   once the build is done AND the page has loaded and gone idle, JS adds `.st-lift`:
 *          the logo lifts away, the night curtain wipes up and a coral sheet follows it.
 * Pages start their own entrance from `onStingerLift`.
 */
export default function Stinger() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (getComputedStyle(el).display === "none") {
      markStingerLifted(); // reduced motion
      return;
    }
    let alive = true;
    const timers: number[] = [];
    const buildDone = new Promise<void>((r) => timers.push(window.setTimeout(r, Math.max(0, BUILD_MS - performance.now()))));
    Promise.all([buildDone, pageSettled()]).then(() => {
      if (!alive) return;
      el.classList.add("st-lift");
      timers.push(window.setTimeout(markStingerLifted, 120));
      // Night 0.1s delay + 1.05s, coral 0.22s delay + 1.05s.
      timers.push(window.setTimeout(() => (el.style.display = "none"), 1400));
    });
    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="stinger">
      <style dangerouslySetInnerHTML={{ __html: STINGER_CSS }} />
      <div className="st-coral fixed inset-0 bg-coral" style={{ zIndex: 89 }} />
      <div className="st-night fixed inset-0 grid place-items-center bg-night" style={{ zIndex: 90 }}>
        {/* Sizes from the logo file: mark 88x86, gap 27, wordmark 235x73 (at 1x). */}
        <div className="scale-[0.8] md:scale-[1.2]">
          <div className="st-logo flex items-center gap-[27px]">
            {/* The real Meriity mark, traced from the logo file: three pieces that form a hexagon.
                Each piece is its own element so the browser animates it on the compositor
                (transforms on shapes inside one SVG are animated on the main thread). */}
            <div className="st-mark relative h-[86px] w-[88px]">
              {PIECES.map((d, i) => (
                <div key={i} className={`st-piece st-piece-${i + 1} absolute inset-0`}>
                  <svg className="size-full overflow-visible" viewBox="12.8 20 87.9 86" fill="#fb4b51">
                    <path d={d} />
                  </svg>
                </div>
              ))}
            </div>
            {/* Wordmark wipe without clip-path: the window slides right while the image slides
                back the same distance, so the letters stay put and an edge sweeps across them. */}
            <div className="relative h-[73px] w-[235px] overflow-hidden">
              <div className="st-wm-window absolute inset-0 overflow-hidden">
                <div className="st-wm-img absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/meriity-logo.png" alt="" className="absolute top-[-27px] left-[-128px] h-[126px] w-[374px] max-w-none" />
                </div>
              </div>
              {/* Glint: a soft-edged window slides across a brightened copy of the wordmark while
                  the copy slides back the same distance, so only the light appears to move. */}
              <div
                className="st-glint absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: 94, WebkitMaskImage: GLINT_MASK, maskImage: GLINT_MASK }}
              >
                <div className="st-glint-img absolute inset-y-0 left-0" style={{ width: 235 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/meriity-logo.png"
                    alt=""
                    className="absolute top-[-27px] left-[-128px] h-[126px] w-[374px] max-w-none"
                    style={{ filter: "brightness(1.9) saturate(0.35)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
