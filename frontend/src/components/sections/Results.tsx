"use client";
import { useRef } from "react";
import { results } from "@/content/home";
import { gsap, useGSAP, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import { ArrowUpRight } from "@/components/ui/Icons";
import Photo from "@/components/ui/Photo";

const tones = [
  "bg-mist text-ink",
  "bg-night text-on-dark",
  "bg-[#093160] text-on-violet",
  "bg-stone text-ink",
];

/** Case studies as a sticky stack: each card pins and recedes as the next slides over it. */
export default function Results() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 768px) and (not ${REDUCED})`, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".rs-card");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          gsap.to(card, {
            scale: 0.9 + i * 0.02,
            filter: "brightness(0.85)", startAt: { filter: "brightness(1)" },
            ease: "none",
            scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 15%", scrub: true },
          });
        });
      });
    },
    { scope },
  );

  return (
    <section id="results" ref={scope} className="bg-ground pb-28 md:pb-40">
      <div className="mx-auto max-w-[1340px] px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <BlurReveal className="display text-[clamp(3rem,9vw,8.125rem)] text-ink">
            {results.title[0]} <span className="text-coral">{results.title[1]}</span>
          </BlurReveal>
          <a href="#contact" className="group flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-ink/25 hover:decoration-coral">
            All case studies
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <ol className="mt-14 md:mt-20">
          {results.items.map((r, i) => (
            <li key={r.client} className="rs-card mb-5 origin-top md:sticky md:mb-6" style={{ top: `calc(96px + ${i * 18}px)` }}>
              <article
                className={`grid gap-6 rounded-[16px] p-6 shadow-[0_30px_60px_-30px_rgba(28,10,63,0.35)] sm:p-7 md:grid-cols-2 md:gap-8 md:p-10 lg:min-h-[56vh] lg:grid-cols-[1fr_1fr_0.9fr] ${tones[i % tones.length]}`}
              >
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <h3 className="display text-[clamp(2.2rem,4vw,3.75rem)]">{r.client}</h3>
                    <p className="mt-2 text-[15px] font-semibold opacity-75">{r.sector}</p>
                  </div>
                  <p className="max-w-[38ch] text-[17px] leading-relaxed opacity-85">{r.summary}</p>
                </div>
                <div className="flex flex-col items-start justify-end gap-4 md:items-end">
                  {r.placeholder && (
                    <span className="rounded-full border border-dashed border-current px-3 py-1 text-[12px] font-semibold opacity-80">
                      Placeholder: awaiting client result
                    </span>
                  )}
                  <p className="display text-[clamp(2.6rem,5vw,4.5rem)] md:text-right">{r.result}</p>
                </div>
                <Photo
                  className="aspect-[4/3] w-full rounded-[20px] md:col-span-2 md:aspect-[16/7] lg:col-span-1 lg:aspect-auto lg:h-full"
                  alt={`${r.client} project`}
                  need={`Photo from the ${r.client} project: their team, office or work.`}
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  dark={i === 1 || i === 2}
                />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
