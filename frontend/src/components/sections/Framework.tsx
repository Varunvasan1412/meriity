"use client";
import { useRef } from "react";
import { framework } from "@/content/home";
import { gsap, ScrollTrigger, useGSAP, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";

/**
 * Six stages on a sticky horizontal track (desktop): the page holds still while
 * the stages travel past, with a progress rule filling as you go.
 */
export default function Framework() {
  const scope = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 1024px) and (not ${REDUCED})`, () => {
        const el = track.current!;
        const section = scope.current!;
        const distance = () => el.scrollWidth - el.clientWidth;
        // CSS-sticky hold instead of a GSAP pin: the section is made tall enough for the
        // horizontal travel, the inner block sticks, and GSAP only reads scroll progress.
        const setHeight = () => {
          section.style.height = `${window.innerHeight * 1.4 + distance()}px`;
        };
        setHeight();
        ScrollTrigger.addEventListener("refreshInit", setHeight);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        tl.to(el, { x: () => -distance(), ease: "none" }, 0).fromTo(".fw-progress", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
        gsap.utils.toArray<HTMLElement>(".fw-card").forEach((card) => {
          gsap.from(card.querySelector(".fw-num"), {
            yPercent: 100,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tl, start: "left 100%", end: "left 75%", scrub: true },
          });
        });
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setHeight);
          section.style.height = "";
        };
      });
    },
    { scope },
  );

  return (
    <section id="framework" ref={scope} className="relative bg-mist">
      <div className="fw-pin flex min-h-screen flex-col justify-center overflow-hidden py-24 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        <div className="mx-auto grid w-full max-w-[1340px] gap-8 px-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <BlurReveal className="display text-[clamp(2.75rem,6vw,5.375rem)] text-ink">
            {framework.title[0]} <span className="text-coral">{framework.title[1]}</span>
          </BlurReveal>
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">{framework.intro}</p>
        </div>

        <div className="mx-auto mt-12 w-full max-w-[1340px] px-4 lg:mt-16">
          <div className="hidden h-px w-full bg-ink/10 lg:block">
            <div className="fw-progress h-px origin-left bg-coral" />
          </div>
        </div>

        <ol
          ref={track}
          className="mt-8 grid gap-4 px-4 sm:grid-cols-2 lg:mt-10 lg:flex lg:w-full lg:gap-5 lg:pl-[max(1rem,calc((100vw-1340px)/2+1rem))] lg:pr-[12vw]"
        >
          {framework.stages.map((s, i) => {
            const last = i === framework.stages.length - 1;
            return (
              <li
                key={s.name}
                className={`fw-card flex min-h-[300px] flex-col justify-between rounded-[16px] p-7 lg:h-[54vh] lg:max-h-[460px] lg:w-[min(30vw,420px)] lg:shrink-0 lg:p-9 ${
                  last ? "bg-night text-on-dark" : "bg-ground text-ink"
                }`}
              >
                <div className="overflow-hidden">
                  <span className={`fw-num display tabular block text-[clamp(4rem,7vw,7rem)] ${last ? "text-coral" : "text-stone"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="display text-[clamp(1.75rem,2.4vw,2.4rem)]">{s.name}</h3>
                  <p className={`mt-3 max-w-[34ch] text-[16px] leading-relaxed ${last ? "text-on-dark-soft" : "text-ink-soft"}`}>{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
