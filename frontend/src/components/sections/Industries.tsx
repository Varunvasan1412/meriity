"use client";
import { useRef } from "react";
import { industries } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import { ArrowRight } from "@/components/ui/Icons";

/** Industries as a two-column index; each row floods violet on hover. */
export default function Industries() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".ind", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: EASE,
          stagger: { each: 0.05, grid: "auto" },
          scrollTrigger: { trigger: ".ind-list", start: "top 85%", toggleActions: "play none none none" },
        });
      });
    },
    { scope },
  );

  return (
    <section id="industries" ref={scope} className="bg-ground py-28 md:py-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <BlurReveal className="display text-[clamp(2.75rem,6vw,5.375rem)] text-ink">
            {industries.title[0]} <span className="text-coral">{industries.title[1]}</span> {industries.title[2]}
          </BlurReveal>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft">{industries.intro}</p>
        </div>

        <ul className="ind-list mt-16 grid border-t border-ink/12 md:mt-24 md:grid-cols-2 md:gap-x-10">
          {industries.items.map((it) => (
            <li key={it.name} className="ind border-b border-ink/12">
              <a
                href="#contact"
                className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-2xl px-2 py-6 transition-[padding] duration-500 ease-out-expo hover:px-6"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 rounded-2xl bg-[#093160] transition-transform duration-500 ease-out-expo group-hover:scale-y-100" />
                <span className="relative">
                  <span className="display block text-[clamp(1.5rem,2.2vw,2rem)] text-ink transition-colors duration-500 group-hover:text-white">
                    {it.name}
                  </span>
                  <span className="mt-1 block text-[15px] text-ink-soft transition-colors duration-500 group-hover:text-white/80">
                    {it.body}
                  </span>
                </span>
                <ArrowRight className="relative size-5 shrink-0 -translate-x-2 text-coral opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100" />
              </a>
            </li>
          ))}
          <li className="ind border-b border-ink/12">
            <a href="#contact" className="group flex items-center justify-between gap-6 rounded-2xl bg-coral px-6 py-6 text-white transition-colors duration-300 hover:bg-coral-deep">
              <span>
                <span className="display block text-[clamp(1.5rem,2.2vw,2rem)]">More industries</span>
                <span className="mt-1 block text-[15px] text-white/85">See everyone we help</span>
              </span>
              <ArrowRight className="size-5 shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
