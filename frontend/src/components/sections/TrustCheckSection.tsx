"use client";
import { useRef, useState } from "react";
import { touchpoints, ratingLabels, CTA, type Rating } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import Button from "@/components/ui/Button";

const verdictFor = (score: number) =>
  score >= 9
    ? { title: "Strong across the board", body: "Customers find a consistent, credible business everywhere they look." }
    : score >= 6
      ? { title: "Leaking trust in places", body: "Some touchpoints tell a weaker story than others. That's where people drop off." }
      : { title: "Losing people before they call", body: "Customers are checking you out and quietly choosing someone else." };

/**
 * The Trust Check as an instrument: five touchpoints as large typographic rows, each rated
 * with a three-bar signal meter; a sticky dark panel reads out the live score out of 10.
 */
export default function TrustCheckSection() {
  const scope = useRef<HTMLElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const [ratings, setRatings] = useState<Rating[]>(touchpoints.map((t) => t.example));
  const [touched, setTouched] = useState(false);
  const score = ratings.reduce<number>((a, b) => a + b, 0);
  const shown = useRef(score);
  const verdict = verdictFor(score);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".tc-row", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: ".tc-list", start: "top 82%", toggleActions: "play none none none" },
        });
        gsap.from(".tc-panel", { y: 50, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: ".tc-list", start: "top 82%", toggleActions: "play none none none" } });
      });
    },
    { scope },
  );

  // Count the big number to the new score.
  useGSAP(
    () => {
      const o = { v: shown.current };
      gsap.to(o, {
        v: score,
        duration: 0.7,
        ease: "power3.out",
        onUpdate: () => {
          shown.current = o.v;
          if (scoreEl.current) scoreEl.current.textContent = String(Math.round(o.v));
        },
      });
    },
    { dependencies: [score], scope },
  );

  const rate = (i: number, v: Rating) => {
    setTouched(true);
    setRatings((r) => r.map((x, j) => (j === i ? v : x)));
  };

  return (
    <section id="trust-check" ref={scope} aria-labelledby="tc-title" className="bg-ground pt-24 md:pt-28">
      <div className="mx-auto max-w-[1340px] px-4">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <BlurReveal as="h2" className="display text-[clamp(2.75rem,6vw,5.375rem)] text-ink">
            <span id="tc-title">
              How does your business <span className="text-coral">score?</span>
            </span>
          </BlurReveal>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft lg:justify-self-end">
            Rate the five places customers check you out before they ever call. Your score updates as you go.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[1fr_380px] lg:gap-16">
          <ol className="tc-list border-t border-ink/15">
            {touchpoints.map((t, i) => {
              const r = ratings[i];
              return (
                <li key={t.name} className="tc-row border-b border-ink/15">
                  <fieldset className="group relative grid grid-cols-[2.5rem_1fr] items-center gap-x-4 gap-y-4 overflow-hidden rounded-2xl px-2 py-7 transition-[padding] duration-500 ease-out-expo hover:px-6 sm:grid-cols-[3rem_1fr_auto] md:py-8">
                    <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 rounded-2xl bg-[#093160] transition-transform duration-500 ease-out-expo group-hover:scale-y-100" />
                    <legend className="sr-only">
                      {t.check}: {t.question}
                    </legend>
                    <span className="tabular relative z-10 self-start pt-2 text-[14px] font-semibold text-ink-soft transition-colors duration-500 group-hover:text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative z-10">
                      <p className="display text-[clamp(1.6rem,2.6vw,2.4rem)] text-ink transition-colors duration-500 group-hover:text-white">
                        {t.check}
                      </p>
                      <p className="mt-1.5 text-[16px] text-ink-soft transition-colors duration-500 group-hover:text-white/80">
                        {t.question}
                      </p>
                    </div>

                    {/* Signal meter: three ascending bars; click a bar to set that level. */}
                    <div className="relative z-10 col-start-2 flex items-end gap-4 sm:col-start-3">
                      <div className="flex items-end gap-1.5" role="radiogroup" aria-label={`${t.check} rating`}>
                        {ratingLabels.map((label, v) => {
                          const filled = v <= r;
                          return (
                            <button
                              key={label}
                              type="button"
                              role="radio"
                              aria-checked={r === v}
                              aria-label={label}
                              onClick={() => rate(i, v as Rating)}
                              className="group/bar grid h-12 w-5 cursor-pointer items-end"
                            >
                              <span
                                className={`block w-full rounded-[3px] transition-[background-color,transform] duration-500 ease-out-expo group-hover/bar:scale-y-110 ${
                                  filled ? "bg-coral" : "bg-stone group-hover:bg-white/25 group-hover/bar:bg-white/40"
                                }`}
                                style={{ height: `${14 + v * 15}px`, transformOrigin: "bottom" }}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-[5.5rem] pb-0.5 text-[14px] font-semibold text-ink transition-colors duration-500 group-hover:text-white" aria-hidden>
                        {ratingLabels[r]}
                      </span>
                    </div>
                  </fieldset>
                </li>
              );
            })}
          </ol>

          {/* Live read-out */}
          <aside className="tc-panel self-start rounded-[16px] bg-night p-6 text-on-dark sm:p-8 lg:sticky lg:top-28">
            <p className="display tabular flex items-baseline leading-none" aria-live="polite">
              <span ref={scoreEl} className="text-[clamp(5rem,10vw,9rem)]">
                {score}
              </span>
              <span className="ml-2 text-[2rem] text-on-dark-soft">/10</span>
              <span className="sr-only"> Trust score {score} out of 10</span>
            </p>

            {/* Ten segments, one per point */}
            <div className="mt-6 grid grid-cols-10 gap-1" aria-hidden>
              {Array.from({ length: 10 }, (_, k) => (
                <span
                  key={k}
                  className={`h-2 rounded-[2px] transition-colors duration-500 ${k < score ? "bg-coral" : "bg-white/12"}`}
                  style={{ transitionDelay: `${k * 30}ms` }}
                />
              ))}
            </div>

            <p className="display mt-8 text-[1.75rem] leading-tight">{verdict.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-on-dark-soft">
              {touched ? verdict.body : "Showing an example business. Rate your own on the left."}
            </p>
            <Button href={CTA.trustCheck.href} className="mt-8 w-full justify-between">
              {CTA.trustCheck.label}
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
