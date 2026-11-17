"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { feedback } from "@/content/about";
import { testimonials } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import RiseHeading from "@/components/motion/RiseHeading";
import { ArrowRight } from "@/components/ui/Icons";

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/**
 * Wordmark grid beside a testimonial carousel. Changing slide lifts the current quote out
 * and lets the next one rise in; it advances on its own every 7s unless hovered.
 */
export default function Feedback() {
  const scope = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);
  const n = testimonials.items.length;
  const t = testimonials.items[i];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".fb-mark", {
          scale: 0.9,
          autoAlpha: 0,
          duration: 1,
          ease: EASE,
          stagger: { each: 0.06, grid: [3, 3], from: "start" },
          scrollTrigger: { trigger: ".fb-grid", start: "top 85%", toggleActions: "play none none none" },
        });
        gsap.from(".fb-card", {
          y: 80,
          autoAlpha: 0,
          filter: "blur(14px)",
          duration: 1.3,
          ease: EASE,
          scrollTrigger: { trigger: ".fb-grid", start: "top 85%", toggleActions: "play none none none" },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const next = (i + dir + n) % n;
      const swap = card.current?.querySelectorAll(".fb-swap");
      if (!swap || window.matchMedia(REDUCED).matches) {
        setI(next);
        return;
      }
      busy.current = true;
      gsap.to(swap, {
        y: -24 * dir,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.in",
        stagger: 0.04,
        onComplete: () => {
          setI(next);
          requestAnimationFrame(() => {
            gsap.fromTo(
              card.current!.querySelectorAll(".fb-swap"),
              { y: 28 * dir, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE, stagger: 0.06, onComplete: () => void (busy.current = false) },
            );
          });
        },
      });
    },
    [i, n],
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => go(1), 7000);
    return () => window.clearTimeout(id);
  }, [go, paused, i]);

  return (
    <section ref={scope} className="bg-ground py-28 md:py-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <p className="label text-ink-soft">{feedback.label}</p>
        <RiseHeading
          lines={[
            { text: feedback.lines[0], className: "mr-[0.22em]", inline: true },
            { text: feedback.lines[1], className: "text-coral", inline: true },
            { text: feedback.lines[2] },
          ]}
          className="display mt-4 text-[clamp(2.75rem,7.4vw,7rem)] leading-[0.9] tracking-[-0.045em] uppercase"
        />

        <div className="fb-grid mt-14 grid gap-3 md:mt-20 lg:grid-cols-[1fr_1.15fr]">
          <ul className="grid grid-cols-3 content-start gap-3 self-start">
            {feedback.marks.map((m) => (
              <li
                key={m}
                className="fb-mark grid aspect-[3/2] place-items-center rounded-[12px] bg-mist px-3 text-center text-[clamp(0.8rem,1.15vw,1rem)] font-semibold tracking-[-0.02em] text-ink/75 transition-colors duration-300 hover:bg-stone hover:text-ink"
              >
                {m}
              </li>
            ))}
          </ul>

          <div
            ref={card}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="fb-card flex min-h-[380px] flex-col justify-between gap-10 rounded-[12px] bg-[#ffe3e2] p-6 md:p-8"
            aria-roledescription="carousel"
          >
            <div className="flex items-center justify-between">
              <span className="tabular text-[13px] font-semibold text-ink-soft">
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous testimonial" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full bg-white text-ink transition-colors duration-300 hover:bg-ink hover:text-white">
                  <ArrowRight className="size-4 rotate-180" />
                </button>
                <button type="button" aria-label="Next testimonial" onClick={() => go(1)} className="grid size-10 place-items-center rounded-full bg-ink text-white transition-colors duration-300 hover:bg-coral">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            <blockquote className="fb-swap text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.25] font-semibold tracking-[-0.02em] text-ink" aria-live="polite">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="fb-swap flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white">{initials(t.name)}</span>
                <span className="leading-tight">
                  <span className="block font-semibold">{t.name}</span>
                  <span className="block text-[14px] text-ink-soft">{t.role.split(",")[0]}</span>
                </span>
              </div>
              <span className="text-right text-[13px] leading-tight font-semibold">{t.role.split(",").slice(1).join(",").trim()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
