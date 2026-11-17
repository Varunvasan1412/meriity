"use client";
import { useRef } from "react";
import { services } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import Curve from "@/components/ui/Curve";
import { ArrowUpRight } from "@/components/ui/Icons";

/** Services as giant set type on a violet field; each row opens its line on hover. */
export default function Services() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".svc").forEach((row) => {
          gsap.from(row, {
            yPercent: 60,
            opacity: 0,
            filter: "blur(10px)",
            duration: 1.2,
            ease: EASE,
            scrollTrigger: { trigger: row, start: "top 92%", toggleActions: "play none none none" },
          });
        });
      });
    },
    { scope },
  );

  return (
    <section id="services" ref={scope} className="relative bg-[#093160] pt-28 pb-32 text-on-violet md:pt-36 md:pb-44">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden className="absolute inset-x-0 -top-px block h-10 w-full -scale-y-100 md:h-16">
        <path d="M0 64V0h1000c80 0 120 18 170 40s90 24 150 24h120z" fill="var(--mist)" />
      </svg>

      <div className="mx-auto max-w-[1340px] px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <BlurReveal className="display max-w-[14ch] text-[clamp(2.75rem,6vw,5.375rem)]">
            {services.title[0]} <span className="text-on-violet-soft">{services.title[1]}</span>
          </BlurReveal>
          <a href="#contact" className="group flex items-center gap-2 text-[15px] font-semibold text-on-violet underline decoration-on-violet/30 hover:decoration-coral">
            Explore all services
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <ul className="mt-16 border-t border-white/12 md:mt-24">
          {services.items.map((s) => (
            <li key={s.name} className="svc group border-b border-white/12">
              <a
                href="#contact"
                className="grid items-baseline gap-x-10 gap-y-2 py-7 md:grid-cols-[1.6fr_1fr] md:py-9"
              >
                <span className="display text-[clamp(2rem,4.6vw,4.25rem)] text-on-violet md:text-on-violet/55 transition-[color,transform] duration-500 ease-out-expo group-hover:translate-x-3 group-hover:text-on-violet">
                  {s.name}
                </span>
                <span className="flex items-baseline justify-between gap-6 text-[16px] leading-relaxed text-on-violet-soft transition-colors duration-500 group-hover:text-on-violet">
                  {s.body}
                  <ArrowUpRight className="hidden size-6 shrink-0 text-coral opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100 md:block" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Curve fill="var(--ground)" flip />
    </section>
  );
}
