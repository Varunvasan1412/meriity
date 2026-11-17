"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import { onStingerLift } from "@/lib/stinger";

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Play when the page loads (after the logo stinger lifts) instead of on scroll. For the first viewport. */
  immediate?: boolean;
  delay?: number;
};

/**
 * Display type that resolves word by word out of blur, the page's headline grammar.
 * Text is visible by default; the animation only runs once JS and motion are allowed.
 */
export default function BlurReveal({ as: Tag = "h2", className, children, immediate, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const split = SplitText.create(el, { type: "words", wordsClass: "inline-block will-change-[filter,transform]" });
        if (!split.words?.length) return () => split.revert();

        const vars: gsap.TweenVars = {
          opacity: 0,
          yPercent: 40,
          filter: "blur(14px)",
          duration: 1.3,
          ease: EASE,
          stagger: 0.07,
          delay,
        };
        // Not `once: true`: a once-trigger that is already past its start (e.g. loading at /#contact)
        // kills itself mid-refresh and ScrollTrigger then reads `.end` of a removed trigger.
        // "play none none none" still plays a single time and never reverses.
        if (!immediate) vars.scrollTrigger = { trigger: el, start: "top 85%", toggleActions: "play none none none" };

        if (immediate) vars.paused = true;
        const tween = gsap.from(split.words, vars);
        const off = immediate ? onStingerLift(() => tween.restart(true)) : () => {};
        return () => {
          off();
          split.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
