"use client";
import { useRef } from "react";
import { why } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import ScrubText from "@/components/motion/ScrubText";

export default function Why() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".why-p").forEach((el, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
          tl.from(el.querySelector(".why-rule"), { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: EASE, delay: (i % 2) * 0.1 })
            .from(el.querySelectorAll(".why-t"), { y: 24, opacity: 0, duration: 1, ease: EASE, stagger: 0.08 }, "-=1.1");
        });
      });
    },
    { scope },
  );

  return (
    <section id="why" ref={scope} className="bg-ground pb-28 md:pb-40">
      <div className="mx-auto grid max-w-[1340px] gap-14 px-4 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <BlurReveal className="display text-[clamp(2.75rem,6vw,5.375rem)] text-ink">
            {why.title[0]} <span className="text-coral">{why.title[1]}</span>
          </BlurReveal>
          <ScrubText text={why.body} className="mt-10 max-w-[34ch] text-[clamp(1.25rem,1.8vw,1.6rem)] leading-snug font-medium text-ink" />
        </div>

        <div>
          <ul className="grid content-start gap-x-8 gap-y-12 sm:grid-cols-2 lg:pt-4">
          {why.pillars.map((p) => (
            <li key={p.name} className="why-p">
              <div className="why-rule h-px w-full bg-ink" />
              <h3 className="why-t display mt-6 text-[clamp(1.5rem,2vw,1.85rem)] text-ink">{p.name}</h3>
              <p className="why-t mt-2 max-w-[32ch] text-[16px] leading-relaxed text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ul>
          </div>
      </div>
    </section>
  );
}
