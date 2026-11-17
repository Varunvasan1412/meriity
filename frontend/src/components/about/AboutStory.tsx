"use client";
import { useRef } from "react";
import { aboutStory } from "@/content/about";
import { gsap, SplitText, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import Button from "@/components/ui/Button";

/**
 * The statement pins near the top while its words fill from pale grey to ink, one after
 * another, as you scroll. Then three cards rise out of a blur, and their figures count up.
 */
export default function AboutStory() {
  const scope = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const split = SplitText.create(text.current!, { type: "words" });
        const [first, ...rest] = split.words;
        gsap.set(first, { color: "var(--ink)" });
        gsap.fromTo(
          rest,
          { color: "#d2d2d2" },
          {
            color: "#101010",
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: ".as-pin", start: "top top", end: "bottom bottom", scrub: 0.6 },
          },
        );

        gsap.from(".as-card", {
          y: 90,
          autoAlpha: 0,
          filter: "blur(14px)",
          duration: 1.3,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: ".as-cards", start: "top 85%", toggleActions: "play none none none" },
        });
        gsap.utils.toArray<HTMLElement>(".as-num").forEach((el, i) => {
          const end = Number(el.dataset.value);
          const o = { v: 0 };
          el.textContent = "0".repeat(String(end).length);
          gsap.to(o, {
            v: end,
            duration: 2,
            delay: 0.3 + i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: ".as-cards", start: "top 85%", toggleActions: "play none none none" },
            onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(String(end).length, "0")),
          });
        });
        gsap.from(".as-founder > *", { y: 30, autoAlpha: 0, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: ".as-cards", start: "top 80%", toggleActions: "play none none none" } });
        gsap.from(".as-tag", { y: 16, autoAlpha: 0, duration: 1, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: ".as-cards", start: "top 85%", toggleActions: "play none none none" } });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-ground">
      {/* Pinned statement */}
      <div className="as-pin relative h-[190vh] md:h-[210vh]">
        <div className="sticky top-0 mx-auto h-svh max-w-[1340px] px-4 pt-28 md:pt-40">
          <p className="label text-ink-soft">{aboutStory.label}</p>
          <p
            ref={text}
            className="display mt-5 max-w-[30ch] text-[clamp(1.85rem,3.6vw,3.25rem)] leading-[1.08] tracking-[-0.03em] text-ink [text-wrap:pretty]"
          >
            {aboutStory.text}
          </p>
        </div>
      </div>

      {/* Tags + cards */}
      <div className="as-cards relative z-10 mx-auto -mt-[40vh] grid max-w-[1340px] gap-8 px-4 pb-28 md:pb-40 lg:grid-cols-[1fr_63%]">
        <div className="flex flex-col justify-between gap-12">
          <div className="flex gap-6 font-mono text-[13px] uppercase">
            <span className="as-tag text-ink-soft">{aboutStory.tags[0]}</span>
            <span className="as-tag text-ink">{aboutStory.tags[1]}</span>
          </div>

          {/* Founder note: fills the column beside the cards and lines up with their bottom edge */}
          <div className="as-founder max-w-[38ch] lg:pr-8">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-[17px] font-semibold text-white">{aboutStory.founder.initials}</span>
              <span className="leading-tight">
                <span className="block text-[17px] font-semibold">{aboutStory.founder.name}</span>
                <span className="block text-[15px] text-ink-soft">{aboutStory.founder.role}</span>
              </span>
            </div>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">{aboutStory.founder.line}</p>
            <div className="mt-8 border-t border-ink/12 pt-5">
              <p className="label text-ink-soft">{aboutStory.founder.partnersLabel}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {aboutStory.founder.partners.map((p) => (
                  <li key={p} className="rounded-full bg-mist px-3.5 py-1.5 text-[14px] font-semibold text-ink">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {aboutStory.cards.map((c, i) => (
            <article
              key={c.title}
              className={`as-card flex min-h-[340px] flex-col justify-between rounded-[12px] p-6 md:min-h-[380px] ${i === 0 ? "bg-[#ffe3e2]" : "bg-mist"}`}
            >
              <div className="text-[15px] leading-tight">
                <p className="font-semibold text-ink">{c.title}</p>
                <p className="text-ink-soft">{c.sub}</p>
              </div>
              <div>
                <p className="display tabular flex items-start text-[clamp(3.5rem,6vw,5.5rem)] leading-none tracking-[-0.04em]">
                  <span className="as-num" data-value={c.value}>
                    {c.value}
                  </span>
                  <span>{c.suffix}</span>
                </p>
                <p className="mt-4 max-w-[22ch] text-[14px] leading-snug text-ink-soft">{c.body}</p>
              </div>
            </article>
          ))}

          <article className="as-card flex min-h-[340px] flex-col justify-between rounded-[12px] bg-violet-900 p-6 text-on-violet md:min-h-[380px]">
            <div className="text-[15px] leading-tight">
              <p className="font-semibold">{aboutStory.feature.title}</p>
              <p className="text-on-violet-soft">{aboutStory.feature.sub}</p>
            </div>
            <div>
              <p className="display max-w-[14ch] text-[24px] leading-[1.05] tracking-[-0.02em]">{aboutStory.feature.heading}</p>
              <Button href={aboutStory.feature.cta.href} variant="ink" className="mt-6 w-full justify-between bg-white! text-ink! hover:bg-mist!">
                {aboutStory.feature.cta.label}
              </Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
