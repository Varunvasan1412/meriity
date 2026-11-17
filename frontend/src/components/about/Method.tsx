"use client";
import { useRef } from "react";
import { method } from "@/content/about";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import RiseHeading from "@/components/motion/RiseHeading";
import { ArrowRight } from "@/components/ui/Icons";
import MediaFrame from "./MediaFrame";

/** Film tile beside three step cards; the tiles resolve out of a blur one after another. */
export default function Method() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".meth-tile", {
          y: 70,
          autoAlpha: 0,
          filter: "blur(16px)",
          duration: 1.3,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: ".meth-grid", start: "top 80%", toggleActions: "play none none none" },
        });
        gsap.from(".meth-label", { y: 16, autoAlpha: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: scope.current, start: "top 80%", toggleActions: "play none none none" } });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="bg-ground pb-28 md:pb-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <div className="text-center">
          <p className="meth-label label text-ink">{method.label}</p>
          <RiseHeading
            lines={[{ text: method.lines[0] }, { text: method.lines[1], className: "text-coral" }]}
            className="display mt-4 text-[clamp(2.75rem,7.4vw,7rem)] leading-[0.9] tracking-[-0.045em] uppercase"
          />
        </div>

        <div className="meth-grid mt-16 grid gap-3 md:mt-24 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr] lg:grid-rows-[minmax(260px,auto)_minmax(240px,auto)]">
          <MediaFrame
            className="meth-tile aspect-[9/10] rounded-[12px] md:row-span-2 md:aspect-auto"
            mp4={method.video.mp4}
            poster={method.video.poster}
            need={method.need}
          />
          {method.steps.map((s, i) => (
            <article
              key={s.name}
              className={`meth-tile group flex min-h-[230px] flex-col justify-between rounded-[12px] bg-mist p-6 transition-colors duration-500 hover:bg-stone ${
                i === 2 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[clamp(1.25rem,1.7vw,1.5rem)] font-semibold tracking-[-0.02em]">{s.name}</h3>
                <span className="tabular text-[13px] text-ink-soft">0{i + 1}</span>
              </div>
              <div className="flex items-end justify-between gap-6">
                <p className="max-w-[30ch] text-[15px] leading-snug text-ink-soft">{s.body}</p>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-[transform,background-color] duration-500 ease-out-expo group-hover:-rotate-45 group-hover:bg-coral">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
