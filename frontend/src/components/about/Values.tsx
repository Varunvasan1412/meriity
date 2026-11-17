"use client";
import { useRef } from "react";
import { values } from "@/content/about";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import RiseHeading from "@/components/motion/RiseHeading";
import Marquee from "@/components/motion/Marquee";

/**
 * A full-bleed blue band of outlined value pills. Rows drift in alternating directions and
 * also shift with scroll; the last row sinks into a soft blur at the bottom edge.
 */
export default function Values() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".vl-row").forEach((row, i) => {
          gsap.fromTo(
            row,
            { xPercent: i % 2 ? -6 : 6 },
            { xPercent: i % 2 ? 6 : -6, ease: "none", scrollTrigger: { trigger: ".vl-band", start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
        gsap.from(".vl-label", { y: 16, autoAlpha: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: scope.current, start: "top 80%", toggleActions: "play none none none" } });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="bg-ground">
      <div className="mx-auto max-w-[1340px] px-4 text-center">
        <p className="vl-label text-[13px] text-ink">{values.label}</p>
        <RiseHeading
          lines={[{ text: values.title }]}
          className="display mt-3 text-[clamp(2.75rem,7.4vw,7rem)] leading-[0.9] tracking-[-0.045em] uppercase"
        />
      </div>

      <div className="vl-band relative mt-12 overflow-hidden bg-violet-900 py-10 md:mt-16 md:py-16">
        <div className="space-y-3 md:space-y-5">
          {values.rows.map((row, i) => (
            <div key={i} className="vl-row -mx-[10vw]">
              <Marquee duration={38 + i * 6} reverse={i % 2 === 1}>
                {[...row, ...row].map((w, k) => (
                  <span
                    key={k}
                    className="display mr-3 rounded-full px-7 py-2.5 text-[clamp(2rem,5.2vw,4.75rem)] leading-none tracking-[-0.03em] whitespace-nowrap text-[#8fa6c9] uppercase ring-1 ring-white/25 ring-inset transition-colors duration-300 hover:text-white md:mr-5 md:px-10 md:py-4"
                  >
                    {w}
                  </span>
                ))}
              </Marquee>
            </div>
          ))}
        </div>
        {/* Soft blur + fade over the last row */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-violet-900/0 to-violet-900 backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,transparent,#000_60%)]" />
      </div>
    </section>
  );
}
