"use client";
import { useRef } from "react";
import { metrics } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";

/** Headline results (from meriity.com) as giant numbers that count up on arrival. */
export default function Metrics() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".mx-num").forEach((el, i) => {
          const end = Number(el.dataset.value);
          const o = { v: 0 };
          gsap.to(o, {
            v: end,
            duration: 1.8,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: scope.current, start: "top 75%", toggleActions: "play none none none" },
            onUpdate: () => (el.textContent = String(Math.round(o.v))),
          });
        });
        gsap.from(".mx-rule", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.4,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: scope.current, start: "top 75%", toggleActions: "play none none none" },
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} aria-label="Results in numbers" className="bg-night py-24 text-on-dark md:py-32">
      <ul className="mx-auto grid max-w-[1340px] gap-x-6 gap-y-14 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <li key={m.label}>
            <span aria-hidden className={`block size-4 ${i % 2 ? "bg-coral" : "bg-night-raised"}`} />
            <p className="display tabular mt-10 text-[clamp(3.5rem,12vw,5.5rem)] leading-none lg:text-[clamp(4rem,7vw,7rem)]">
              <span className="mx-num" data-value={m.value}>
                {m.value}
              </span>
              <span className="text-coral">{m.suffix}</span>
            </p>
            <p className="mt-5 text-[18px] font-semibold text-on-dark-soft">{m.label}</p>
            <div className="mx-rule mt-6 h-px w-full bg-white/20" />
          </li>
        ))}
      </ul>
    </section>
  );
}
