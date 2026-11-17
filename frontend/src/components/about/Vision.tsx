"use client";
import { useRef } from "react";
import { vision } from "@/content/about";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import RiseHeading from "@/components/motion/RiseHeading";
import Photo from "@/components/ui/Photo";

/**
 * Three milestones. As the row scrolls in, each marker drops its line down to a photo card
 * that swings up from a tilt and settles straight; the pill label slides in last.
 */
export default function Vision() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".vs-col").forEach((col, i) => {
          const tilt = [-7, 5, -4][i % 3];
          const tl = gsap.timeline({
            scrollTrigger: { trigger: col, start: "top 85%", end: "top 30%", scrub: 0.8 },
          });
          tl.from(col.querySelector(".vs-line"), { scaleY: 0, transformOrigin: "top", ease: "none", duration: 0.5 })
            .from(col.querySelector(".vs-card"), { yPercent: 35, rotate: tilt, autoAlpha: 0, ease: "power2.out", duration: 0.8 }, 0.1)
            .from(col.querySelector(".vs-pill"), { xPercent: 40, autoAlpha: 0, ease: "power2.out", duration: 0.4 }, 0.55);
          gsap.from(col.querySelector(".vs-tag"), {
            y: 30,
            autoAlpha: 0,
            duration: 1.1,
            ease: EASE,
            delay: i * 0.08,
            scrollTrigger: { trigger: col, start: "top 90%", toggleActions: "play none none none" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="bg-ground pb-28 md:pb-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <RiseHeading
          lines={vision.lines.map((t) => ({ text: t }))}
          className="display text-center text-[clamp(2.75rem,7.4vw,7rem)] leading-[0.9] tracking-[-0.045em] uppercase"
        />

        <ol className="mt-16 grid gap-14 sm:grid-cols-3 sm:gap-6 md:mt-24">
          {vision.milestones.map((m) => (
            <li key={m.tag} className="vs-col">
              <p className="vs-tag display text-[clamp(1.75rem,2.6vw,2.25rem)] tracking-[-0.03em]">{m.tag}</p>
              <span aria-hidden className="mt-4 block size-3 rounded-[2px] bg-coral" />
              <span aria-hidden className="vs-line ml-[5.5px] block h-16 w-px bg-gradient-to-b from-ink/50 to-ink/0 md:h-24" />
              <div className="vs-card relative -mt-4 w-[86%] md:ml-4 md:w-[80%]">
                <Photo className="aspect-[4/4.6] w-full rounded-[10px]" alt="" need={m.need} sizes="(min-width: 640px) 28vw, 86vw" />
                <span className="vs-pill absolute -right-4 bottom-5 rounded-[6px] bg-coral px-3.5 py-2 text-[12px] font-semibold tracking-[0.02em] text-white uppercase shadow-[0_12px_30px_-10px_rgba(251,75,81,0.6)]">
                  {m.pill}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
