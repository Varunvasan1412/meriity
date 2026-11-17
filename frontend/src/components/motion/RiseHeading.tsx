"use client";
import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP, EASE, REDUCED } from "@/lib/gsap";

type Line = { text: string; className?: string; /** Sit on the same row as the next line. */ inline?: boolean };

/**
 * Display heading whose letters rise out of a mask, line after line.
 * On scroll by default; pass `delay` + `onLoad` to play it on page load instead.
 */
export default function RiseHeading({
  as: Tag = "h2",
  lines,
  className = "",
  lineClassName = "",
  onLoad = false,
  delay = 0,
}: {
  as?: ElementType;
  lines: Line[];
  className?: string;
  lineClassName?: string;
  onLoad?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const splits = gsap.utils.toArray<HTMLElement>(".rh-inner", el).map((n) => SplitText.create(n, { type: "chars", charsClass: "inline-block" }));
        const tl = gsap.timeline({
          delay,
          ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }),
        });
        splits.forEach((s, i) => tl.from(s.chars, { yPercent: 115, duration: 1.15, ease: EASE, stagger: 0.028 }, i * 0.12));
        return () => splits.forEach((s) => s.revert());
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className={`${l.inline ? "inline-block align-top" : "block"} overflow-hidden pb-[0.04em] ${lineClassName}`}>
          <span className={`rh-inner inline-block ${l.className ?? ""}`}>{l.text}</span>
        </span>
      ))}
    </Tag>
  );
}
