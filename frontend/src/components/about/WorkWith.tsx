"use client";
import { useRef } from "react";
import { workWith } from "@/content/about";
import { gsap, useGSAP, REDUCED } from "@/lib/gsap";
import Marquee from "@/components/motion/Marquee";
import { ArrowUpRight } from "@/components/ui/Icons";

/** A huge looping "Work with Meriity" line in a soft panel; the whole panel is the link. */
export default function WorkWith() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.fromTo(
          ".ww-text",
          { opacity: 0.18 },
          { opacity: 1, ease: "none", scrollTrigger: { trigger: scope.current, start: "top bottom", end: "top 45%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="bg-ground px-3 pb-3 md:px-5 md:pb-5">
      <a
        href={workWith.href}
        className="group relative block overflow-hidden rounded-[16px] bg-mist py-10 md:rounded-[20px] md:py-16"
        aria-label={workWith.text}
      >
        <Marquee duration={26}>
          {[0, 1].map((k) => (
            <span
              key={k}
              className="ww-text display flex items-center gap-[0.3em] pr-[0.3em] text-[clamp(4rem,13vw,12.5rem)] leading-[0.95] tracking-[-0.05em] whitespace-nowrap text-violet-900 uppercase transition-colors duration-500 group-hover:text-coral"
            >
              {workWith.text}
              <ArrowUpRight className="size-[0.55em] shrink-0 transition-transform duration-700 ease-out-expo group-hover:rotate-45" />
            </span>
          ))}
        </Marquee>
      </a>
    </section>
  );
}
