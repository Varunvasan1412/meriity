"use client";
import { useRef } from "react";
import { shift, touchpoints } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import ScrubText from "@/components/motion/ScrubText";
import Photo from "@/components/ui/Photo";

export default function Shift() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".tp", {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: { trigger: ".tp-list", start: "top 85%", toggleActions: "play none none none" },
        });
        gsap.from(".tp-rule", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.6,
          ease: EASE,
          scrollTrigger: { trigger: ".tp-list", start: "top 85%", toggleActions: "play none none none" },
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-ground py-28 md:py-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <BlurReveal className="display max-w-[16ch] text-[clamp(3rem,9vw,8.125rem)] text-ink">
          {shift.title[0]} <em className="text-coral not-italic">{shift.title[1]}</em> {shift.title[2]}
        </BlurReveal>

        <Photo
          className="shift-photo mt-14 aspect-[16/9] w-full rounded-[16px] md:mt-20 md:aspect-[21/9]"
          alt="A customer checking a business on their phone"
          need="Wide black-and-white photo: a customer researching a local business on their phone or laptop."
        />

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[1fr_1.6fr]">
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft">{shift.body[1]}</p>
          <ScrubText
            text={shift.body[0]}
            className="display text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.15]! tracking-[-0.025em]! text-ink"
          />
        </div>

        <div className="tp-list relative mt-24 md:mt-32">
          <div className="tp-rule h-px w-full bg-ink/15" />
          <ol className="grid gap-x-6 gap-y-10 pt-8 sm:grid-cols-2 lg:grid-cols-5">
            {touchpoints.map((t) => (
              <li key={t.name} className="tp group">
                <h3 className="display text-[clamp(1.8rem,2.4vw,2.25rem)] text-ink transition-colors duration-300 group-hover:text-ink-soft">
                  {t.name}
                </h3>
                <p className="mt-2 max-w-[26ch] text-[15px] leading-snug text-ink-soft">{t.question}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
