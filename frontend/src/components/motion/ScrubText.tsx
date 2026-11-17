"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, REDUCED } from "@/lib/gsap";

/**
 * Text that fills letter by letter from a faint grey to full ink as it scrolls
 * through the viewport. Letters (not words) and a smoothed scrub make the fill
 * read as one continuous sweep.
 */
export default function ScrubText({
  text,
  className,
  from = "#cfcfcf",
}: {
  text: string;
  className?: string;
  /** Starting colour of unfilled letters. */
  from?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const split = SplitText.create(ref.current!, { type: "words,chars" });
        gsap.fromTo(
          split.chars,
          { color: from },
          {
            color: () => getComputedStyle(ref.current!).color,
            ease: "none",
            stagger: 0.04,
            scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 50%", scrub: 1.2 },
          },
        );
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}
