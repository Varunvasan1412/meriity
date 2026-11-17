import type { ReactNode } from "react";

/** Infinite horizontal marquee. Children are rendered twice for a seamless loop. */
export default function Marquee({
  children,
  duration = 40,
  className = "",
  label,
  reverse = false,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
  label?: string;
  /** Run left-to-right instead. */
  reverse?: boolean;
}) {
  return (
    <div className={`marquee overflow-hidden ${className}`} aria-label={label} role={label ? "region" : undefined}>
      <div
        className="marquee-track flex w-max"
        style={{ ["--marquee-duration" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : undefined }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
