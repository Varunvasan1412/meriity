"use client";
import { useRef } from "react";
import { shift, touchpoints } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import ScrubText from "@/components/motion/ScrubText";
import Photo from "@/components/ui/Photo";
// JOURNEY: the pinned horizontal version, switched off. Kept in Journey.tsx for reference.
// import Journey from "@/components/sections/Journey";

// "That's the gap Meriity closes." becomes a heading; the rest of the sentence stays as body.
const [gapLead, ...gapTail] = shift.body[1].split(/(?<=\.)\s+/);
const gapRest = gapTail.join(" ");

// The customer's path, step by step: icon circles joined by dashed curves.
// Styles live here so they apply even when the global CSS pipeline is stale.
const STEPS_CSS = `
.st-list { display: grid; grid-template-columns: 1fr; gap: 56px; }
.st-item { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
.st-ring { position: relative; width: 104px; height: 104px; border-radius: 999px; display: grid; place-items: center;
  background: transparent; transition: background-color .5s, box-shadow .6s, transform .6s cubic-bezier(.16,1,.3,1); }
/* The dashed ring turns slowly, like it's waiting for the next step. */
.st-ring::before { content: ""; position: absolute; inset: 0; border-radius: inherit; border: 1.5px dashed rgba(16,16,16,.24);
  animation: st-spin 28s linear infinite; transition: opacity .4s; }
.st-item:nth-child(even) .st-ring::before { animation-direction: reverse; }
@keyframes st-spin { to { transform: rotate(360deg); } }
.st-item:hover .st-ring { transform: translateY(-4px); background: #093160; box-shadow: 0 18px 40px -16px rgba(9,49,96,.55); }
.st-item:hover .st-ring::before { opacity: 0; }
/* The dashes flow forward along each connector, towards the next step. */
.st-link path { animation: st-flow 1.4s linear infinite; }
@keyframes st-flow { to { stroke-dashoffset: -12; } }
@media (prefers-reduced-motion: reduce) { .st-ring::before, .st-link path { animation: none; } }
.st-icon { color: #FB4B51; --st-check: #fff; transition: color .4s; }
.st-item:hover .st-icon { color: #fff; --st-check: #093160; }
.st-icon { width: 46px; height: 46px; display: block; }
.st-title { margin-top: 26px; font-size: 21px; font-weight: 600; letter-spacing: -.02em; color: #101010; }
.st-text { margin-top: 10px; max-width: 24ch; font-size: 14.5px; line-height: 1.6; color: rgba(16,16,16,.55); }
/* connectors */
.st-link { position: absolute; pointer-events: none; color: rgba(16,16,16,.55); }
.st-link svg { display: block; width: 100%; height: 100%; overflow: visible; }
/* mobile: a short dashed line down to the next step */
.st-link { left: 50%; top: calc(100% + 10px); width: 2px; height: 36px; margin-left: -1px;
  background-image: linear-gradient(rgba(16,16,16,.4) 50%, transparent 0); background-size: 2px 8px; }
.st-link svg { display: none; }
@media (min-width: 1024px) {
  .st-list { grid-template-columns: repeat(5, 1fr); gap: 24px; }
  .st-link { left: calc(50% + 52px + 12px); top: 52px; width: calc(100% + 24px - 104px - 24px); height: 34px; margin: 0;
    transform: translateY(-50%); background: none; }
  .st-link svg { display: block; }
}
`;

// Two-tone icons in currentColor: coral normally, white on the blue hover state.
const ICONS = [
  // Searched: magnifier
  <svg key="s" className="st-icon" viewBox="0 0 48 48" aria-hidden>
    <circle cx="21" cy="21" r="14" fill="currentColor" opacity=".2" />
    <circle cx="21" cy="21" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M28 28l9 9" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
  </svg>,
  // Reviewed: star
  <svg key="r" className="st-icon" viewBox="0 0 48 48" aria-hidden>
    <circle cx="24" cy="24" r="18" fill="currentColor" opacity=".2" />
    <path d="M24 12l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L24 30.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill="currentColor" />
  </svg>,
  // Followed: person with a plus
  <svg key="f" className="st-icon" viewBox="0 0 48 48" aria-hidden>
    <circle cx="22" cy="24" r="18" fill="currentColor" opacity=".2" />
    <circle cx="21" cy="19" r="6" fill="currentColor" />
    <path d="M10 35c1.5-6 6-9 11-9s9.5 3 11 9z" fill="currentColor" />
    <path d="M37 14v10M32 19h10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>,
  // Visited: browser window with a cursor
  <svg key="v" className="st-icon" viewBox="0 0 48 48" aria-hidden>
    <rect x="6" y="9" width="36" height="28" rx="6" fill="currentColor" opacity=".2" />
    <path d="M6 16h36" stroke="currentColor" strokeWidth="3" opacity=".55" />
    <path d="M23 21l13 6-6 1.6-2.4 5.9z" fill="currentColor" />
  </svg>,
  // Recognised: verified seal
  <svg key="c" className="st-icon" viewBox="0 0 48 48" aria-hidden>
    <path
      d="M24 5l5 3.6 6.1-.3 1.9 5.8 5 3.6-1.9 5.8 1.9 5.8-5 3.6-1.9 5.8-6.1-.3L24 43l-5-3.6-6.1.3-1.9-5.8-5-3.6 1.9-5.8-1.9-5.8 5-3.6 1.9-5.8 6.1.3z"
      fill="currentColor"
      opacity=".2"
    />
    <circle cx="24" cy="24" r="11" fill="currentColor" />
    <path d="M19 24.5l3.4 3.4L29.5 21" fill="none" style={{ stroke: "var(--st-check)" }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function Shift() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const trigger = { trigger: ".st-list", start: "top 78%", toggleActions: "play none none none" };
        // Steps arrive one after another: the ring pops in, the icon springs into it, the words
        // rise, and the dashed curve draws on towards the next step.
        const tl = gsap.timeline({ scrollTrigger: trigger });
        document.querySelectorAll<HTMLElement>(".st-item").forEach((item, i) => {
          const at = i * 0.28;
          tl.from(item.querySelector(".st-ring"), { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.7)", clearProps: "transform,opacity" }, at);
          tl.from(item.querySelector(".st-icon"), { scale: 0, rotate: -25, duration: 0.8, ease: "back.out(2.2)", clearProps: "transform" }, at + 0.15);
          tl.from(item.querySelectorAll(".st-title, .st-text"), { y: 16, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.07, clearProps: "transform,opacity" }, at + 0.12);
          const link = item.querySelector(".st-link");
          if (link) tl.fromTo(link, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power1.inOut" }, at + 0.3);
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-ground py-28 md:py-40">
      <style dangerouslySetInnerHTML={{ __html: STEPS_CSS }} />
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
          {/* The first sentence ("That's the gap Meriity closes.") is set as a heading. */}
          <div className="max-w-[40ch]">
            <h3 className="display text-[clamp(1.8rem,2.4vw,2.25rem)] text-ink">{gapLead}</h3>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{gapRest}</p>
          </div>
          <ScrubText
            text={shift.body[0]}
            className="display text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.15]! tracking-[-0.025em]! text-ink"
          />
        </div>

        {/* The customer's path, in order. */}
        <div style={{ marginTop: "clamp(96px, 10vw, 136px)" }}>
          <ol className="st-list">
            {touchpoints.map((t, i) => (
              <li key={t.name} className="st-item">
                <div className="st-ring">
                  {ICONS[i]}
                </div>
                <h3 className="st-title">{t.name}</h3>
                <p className="st-text">{t.question}</p>
                {i < touchpoints.length - 1 && (
                  <span className="st-link" aria-hidden>
                    <svg viewBox="0 0 100 34" preserveAspectRatio="none">
                      <path
                        d={i % 2 === 0 ? "M1 8 C 30 34, 70 34, 99 8" : "M1 26 C 30 0, 70 0, 99 26"}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
