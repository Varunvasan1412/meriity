"use client";
import { useRef } from "react";
import { testimonials } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";

// Alternating sides, like the reference: each card ~59% wide.
const sides = ["md:mr-auto", "md:ml-auto"];
const tones = ["bg-mist text-ink", "bg-night text-on-dark", "bg-[#093160] text-on-violet"];

/**
 * Testimonials, laid out like the reference: a centred heading block sticks 100px from the
 * top at z-index 1, and the quote cards (higher layer) scroll up over it, alternating left
 * and right, so the heading peeks out around them as you read.
 */
export default function Testimonials() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.utils.toArray<HTMLElement>(".tm").forEach((el) => {
          gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} aria-labelledby="tm-title" className="bg-ground py-28 md:py-40">
      <div className="relative mx-auto max-w-[1340px] px-4">
        {/* Sticky heading, under the cards */}
        <div className="sticky top-[100px] z-[1] flex flex-col items-center text-center">
          <p className="label text-ink">Testimonials</p>
          <BlurReveal as="h2" className="display mt-5 text-[clamp(2.75rem,6vw,5.375rem)] leading-[0.92] uppercase">
            <span id="tm-title" className="block text-ink">What our</span>
            <span className="block text-coral">clients are saying</span>
          </BlurReveal>
        </div>

        {/* Cards scroll up over the heading */}
        <div className="relative z-[2] mt-16 flex flex-col gap-12 md:mt-24 md:gap-[120px]">
          {testimonials.items.map((t, i) => (
            <figure
              key={t.name}
              className={`tm relative flex min-h-[300px] w-full flex-col justify-between rounded-[16px] p-7 md:min-h-[440px] md:w-[59%] md:p-[30px] ${sides[i % 2]} ${tones[i % 3]}`}
            >
              <blockquote className="display max-w-[34ch] text-[clamp(1.4rem,2vw,1.85rem)] leading-[1.12]! font-bold! tracking-[-0.025em]!">
                &ldquo;{t.quote.replace(/^"|"$/g, "")}&rdquo;
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4">
                <span className="display grid size-[60px] place-items-center rounded-full text-lg ring-1 ring-current" aria-hidden>
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-[20px] font-semibold">{t.name}</span>
                  <span className="block text-[16px] opacity-70">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
