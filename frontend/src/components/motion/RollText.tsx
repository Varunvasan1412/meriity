/**
 * Letter-by-letter roll on hover. Each letter sits in its own clipped cell with
 * two copies: on hover the resting copy slides up out of view while its twin
 * rises from below, one letter after another. Pure CSS (transform only), so it
 * stays on the compositor and never janks.
 *
 * The parent must carry the `group/roll` class; Button and the menu links do.
 */
export default function RollText({
  text,
  hoverClass = "",
  stagger = 16,
  className = "",
}: {
  text: string;
  /** Classes for the incoming copy, e.g. a hover colour. */
  hoverClass?: string;
  /** Delay between letters, ms. */
  stagger?: number;
  className?: string;
}) {
  const letters = Array.from(text);
  return (
    <span className={`inline-flex whitespace-pre ${className}`} aria-label={text} role="text">
      {letters.map((ch, i) => {
        const delay = { transitionDelay: `${i * stagger}ms` };
        const c = ch === " " ? " " : ch;
        return (
          <span key={i} aria-hidden className="relative inline-flex overflow-hidden">
            <span className="invisible">{c}</span>
            <span
              style={delay}
              className="absolute inset-0 flex justify-center transition-transform duration-[650ms] ease-out-expo will-change-transform group-hover/roll:-translate-y-[120%] group-focus-visible/roll:-translate-y-[120%]"
            >
              {c}
            </span>
            <span
              style={delay}
              className={`absolute inset-0 flex translate-y-[120%] justify-center transition-transform duration-[650ms] ease-out-expo will-change-transform group-hover/roll:translate-y-0 group-focus-visible/roll:translate-y-0 ${hoverClass}`}
            >
              {c}
            </span>
          </span>
        );
      })}
    </span>
  );
}
