type P = { className?: string };

export const ArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

export const ArrowUpRight = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M6 14 14 6M7 6h7v7" />
  </svg>
);

export const Check = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </svg>
);

/** Meriity chevron mark, redrawn from the logo for crisp scaling. */
export const ChevronMark = ({ className }: P) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden fill="currentColor">
    <path d="M20 3 37 12v6L20 9 3 18v-6z" />
    <path d="M20 13 37 22v6L20 19 3 28v-6z" opacity=".9" />
    <path d="M20 23 37 32v6L20 29 3 38v-6z" opacity=".8" />
  </svg>
);
