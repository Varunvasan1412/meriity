import { team } from "@/content/about";
import RiseHeading from "@/components/motion/RiseHeading";
import Photo from "@/components/ui/Photo";

const LinkedIn = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
  </svg>
);
const Instagram = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);

type Member = (typeof team.members)[number];

function Card({ m }: { m: Member }) {
  return (
    <article className="w-full bg-white">
      <Photo className="aspect-[323/340] w-full" alt={m.placeholder ? "" : m.name} need={m.need} sizes="(min-width: 768px) 26vw, 44vw" />
      <div className="flex h-14 items-center justify-between gap-3 bg-mist px-3 md:h-[68px] md:px-3.5">
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[12px] font-semibold italic md:text-[14px]">{m.name}</span>
          <span className="block truncate text-[11px] text-ink-soft italic md:text-[13px]">{m.role}</span>
        </span>
        <span className="flex shrink-0 gap-1.5">
          <a href="#" aria-label={`${m.name} on LinkedIn`} className="grid size-6 place-items-center rounded-full bg-white transition-colors duration-300 hover:bg-ink hover:text-white md:size-8">
            <LinkedIn />
          </a>
          <a href="#" aria-label={`${m.name} on Instagram`} className="hidden size-8 place-items-center rounded-full bg-white transition-colors duration-300 hover:bg-ink hover:text-white md:grid">
            <Instagram />
          </a>
        </span>
      </div>
    </article>
  );
}

/** Split members into `n` columns, left to right, row by row. */
const columns = (n: number) => Array.from({ length: n }, (_, c) => team.members.filter((_, i) => i % n === c));

/**
 * Measured from the reference:
 *  - "Meet the powerhouse" is sticky, 100px from the top, underneath the cards.
 *  - The team is one grid on a single plane tilted back in 3D:
 *    perspective(1200px) rotateX(20deg), origin at the grid's centre. Nothing animates per card;
 *    the depth comes from scrolling that tilted plane up over the pinned title, so each row
 *    grows and spreads past the screen edges as it comes towards you.
 *  - Desktop grid: 3 columns of 323 x 408 cards (photo 340 + name bar 68), 132px column gaps,
 *    260px row gaps, the middle column dropped 216px. Sizes scale down with the viewport.
 */
export default function Team() {
  const three = columns(3);
  const two = columns(2);

  return (
    <section className="relative bg-ground pb-28 md:pb-40">
      {/* Pinned title, below the cards */}
      <div className="sticky top-[72px] z-[1] text-center md:top-[100px]">
        <p className="text-[13px] font-semibold text-ink uppercase">{team.label}</p>
        <RiseHeading
          lines={[{ text: team.lines[0] }, { text: team.lines[1], className: "text-coral" }]}
          className="display mt-3 text-[clamp(2.75rem,7.4vw,7rem)] leading-[0.9] tracking-[-0.045em] uppercase"
        />
      </div>

      {/* Tilted plane of cards, above the title */}
      <div className="relative z-[2] mt-[clamp(140px,19vw,240px)] [perspective:900px] md:[perspective:1200px]">
        {/* Tablet and up: 3 columns */}
        <div
          className="mx-auto hidden w-[min(1233px,96vw)] grid-cols-3 gap-x-[10.7%] md:grid"
          style={{ transform: "rotateX(20deg)", transformOrigin: "50% 50%" }}
        >
          {three.map((col, c) => (
            <div key={c} className={`flex flex-col gap-[min(260px,20vw)] ${c === 1 ? "pt-[min(216px,17vw)]" : ""}`}>
              {col.map((m, k) => (
                <Card key={k} m={m} />
              ))}
            </div>
          ))}
        </div>

        {/* Phones: 2 columns, same idea with a gentler tilt */}
        <div
          className="mx-auto grid w-[92vw] grid-cols-2 gap-x-[8%] md:hidden"
          style={{ transform: "rotateX(14deg)", transformOrigin: "50% 50%" }}
        >
          {two.map((col, c) => (
            <div key={c} className={`flex flex-col gap-24 ${c === 1 ? "pt-28" : ""}`}>
              {col.map((m, k) => (
                <Card key={k} m={m} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
