"use client";
import { useRef } from "react";
import { aboutHero, aboutVideo } from "@/content/about";
import { gsap, SplitText, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import MediaFrame from "./MediaFrame";
import { onStingerLift } from "@/lib/stinger";

/**
 * Hero entrance, started the moment the site-wide logo stinger lifts (see Stinger.tsx):
 *   +0.50s  "TRUST / BUILDERS" letters rise out of their masks, line after line
 *   +0.95s  label and the "Let's work" pill settle in
 * The film below opens from an inset, rounded frame to full bleed as it scrolls in.
 */
export default function AboutHero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const splits = gsap.utils.toArray<HTMLElement>(".ah-word").map((n) => SplitText.create(n, { type: "chars", charsClass: "inline-block" }));
        const tl = gsap.timeline({ paused: true });
        splits.forEach((sp, i) => tl.from(sp.chars, { yPercent: 115, duration: 1.3, ease: EASE, stagger: 0.035 }, 0.5 + i * 0.14));
        tl.from(".ah-fade", { y: 24, autoAlpha: 0, duration: 1.1, ease: EASE, stagger: 0.08 }, 0.95);
        const offLift = onStingerLift(() => tl.play());

        // Film: inset rounded frame -> full bleed, with a slow counter-zoom inside.
        gsap.fromTo(
          ".ah-film",
          { clipPath: "inset(5% 4% 5% 4% round 24px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: ".ah-film", start: "top bottom", end: "top 25%", scrub: true },
          },
        );
        gsap.fromTo(
          ".ah-film-inner",
          { scale: 1.06 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: ".ah-film", start: "top bottom", end: "bottom top", scrub: true } },
        );
        return () => {
          offLift();
          splits.forEach((sp) => sp.revert());
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} id="top" className="relative bg-ground">
      <div className="mx-auto max-w-[1340px] px-4 pt-32 pb-14 md:pt-44 md:pb-20">
        <p className="ah-fade label text-ink-soft">{aboutHero.label}</p>
        <h1 className="display mt-6 text-[clamp(4.25rem,15.5vw,14.5rem)] leading-[0.84] tracking-[-0.05em] uppercase md:mt-8">
          <span className="flex items-center justify-between gap-6">
            <span className="block overflow-hidden pb-[0.04em] md:pl-[17%]">
              <span className="ah-word inline-block">{aboutHero.lines[0]}</span>
            </span>
            <span className="ah-fade hidden text-[16px] leading-normal normal-case tracking-normal lg:block">
              <Button href={aboutHero.cta.href} className="text-[16px]">
                {aboutHero.cta.label}
              </Button>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="ah-word inline-block">{aboutHero.lines[1]}</span>
          </span>
        </h1>
        <div className="ah-fade mt-10 lg:hidden">
          <Button href={aboutHero.cta.href}>{aboutHero.cta.label}</Button>
        </div>
      </div>

      <MediaFrame
        className="ah-film aspect-[16/9] w-full"
        innerClassName="ah-film-inner"
        mp4={aboutVideo.mp4}
        webm={aboutVideo.webm}
        poster={aboutVideo.poster}
        need={aboutVideo.need}
      />
    </section>
  );
}
