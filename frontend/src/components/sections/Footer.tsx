"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { footer, nav, services, CTA, withBase } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ArrowRight, ArrowUpRight } from "@/components/ui/Icons";
import Logo from "@/components/ui/Logo";

/** Live Melbourne time, rendered after mount so server and client markup match. */
function useMelbourneTime() {
  const [now, setNow] = useState<{ time: string; open: boolean } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const time = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true })
        .format(d)
        .replace(" ", "")
        .toLowerCase();
      const parts = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", weekday: "short", hour: "numeric", hour12: false }).formatToParts(d);
      const day = parts.find((p) => p.type === "weekday")?.value ?? "";
      const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
      const open = !["Sat", "Sun"].includes(day) && hour >= 9 && hour < 17;
      setNow({ time, open });
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Link with a coral underline that draws in from the left and an arrow that slides in. */
function FootLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group/fl inline-flex items-center gap-2 text-ink-soft transition-colors duration-300 hover:text-ink"
    >
      <span className="bg-[linear-gradient(var(--coral),var(--coral))] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/fl:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight className="size-3.5 -translate-x-2 text-coral opacity-0 transition-[transform,opacity] duration-500 ease-out-expo group-hover/fl:translate-x-0 group-hover/fl:opacity-100" />
    </a>
  );
}

const colHead = "text-[14px] font-semibold text-ink";

export default function Footer({ base = "" }: { base?: string }) {
  const link = (h: string) => withBase(base, h);
  const scope = useRef<HTMLElement>(null);
  const clock = useMelbourneTime();
  // Read the year after mount: Next.js may not call `new Date()` during prerender.
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        const panel = scope.current?.querySelector(".ft-panel");
        if (!panel) return;
        const play = { trigger: panel, start: "top 80%", toggleActions: "play none none none" };

        gsap.from(".ft-up", { y: 40, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.06, scrollTrigger: play });

      });
    },
    { scope },
  );

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={scope} className="bg-ground px-3 pb-3 md:px-5 md:pb-5">
      <div className="ft-panel relative isolate overflow-hidden rounded-[16px] bg-mist text-ink md:rounded-[20px]">
        {/* Ambient depth: a soft blue bloom and the chevron watermark */}
        <div aria-hidden className="pointer-events-none absolute -top-1/3 right-[-10%] -z-10 h-[70vh] w-[60vw] rounded-full bg-[#093160]/[0.07] blur-[140px]" />

        <div className="mx-auto max-w-[1340px] px-5 pt-12 md:px-10 md:pt-16">
          {/* Middle: columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-10 md:grid-cols-4 md:pb-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="ft-up col-span-2 md:col-span-4 lg:col-span-1">
              <Logo href={base ? "/" : "#top"} />
              <p className="mt-5 max-w-[30ch] text-[15px] leading-relaxed text-ink-soft">{footer.tagline} Strategy-first, senior-led growth from Melbourne.</p>

              <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white py-2 pr-4 pl-3 text-[13px] sm:text-[14px] ring-1 ring-inset ring-ink/10">
                <span className="relative flex size-2.5">
                  {clock?.open && <span className="absolute inset-0 animate-ping rounded-full bg-mint/70" />}
                  <span className={`relative size-2.5 rounded-full ${clock?.open ? "bg-mint" : "bg-ink-soft/50"}`} />
                </span>
                <span className="text-ink">
                  Melbourne <span className="tabular text-ink-soft">{clock ? clock.time : "--:--"}</span>
                </span>
                <span className="text-ink-soft">· {clock ? (clock.open ? "We're in" : "Back 9am weekdays") : " "}</span>
              </div>
            </div>

            <nav aria-label="Services" className="ft-up">
              <p className={colHead}>Services</p>
              <ul className="mt-4 space-y-2 text-[15px]">
                {services.items.map((s) => (
                  <li key={s.name}>
                    <FootLink href={link("#services")}>{s.name}</FootLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Footer" className="ft-up">
              <p className={colHead}>Explore</p>
              <ul className="mt-4 space-y-2 text-[15px]">
                {nav.map((l) => (
                  <li key={l.label}>
                    <FootLink href={link(l.href)}>{l.label}</FootLink>
                  </li>
                ))}
                <li>
                  <FootLink href={link(CTA.trustCheck.href)}>Free Trust Check</FootLink>
                </li>
              </ul>
            </nav>

            <div className="ft-up col-span-2 md:col-span-1">
              <p className={colHead}>Visit &amp; talk</p>
              <address className="mt-4 space-y-2 text-[15px] not-italic">
                <p className="leading-relaxed text-ink-soft">
                  {footer.address[0]}
                  <br />
                  {footer.address[1]}
                </p>
                <p>
                  <FootLink href={footer.phone.href}>{footer.phone.label}</FootLink>
                </p>
                <p>
                  <FootLink href={footer.email.href}>{footer.email.label}</FootLink>
                </p>
              </address>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social">
                {footer.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/s inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink ring-1 ring-inset ring-ink/15 transition-[background-color,box-shadow,color] duration-300 hover:bg-ink hover:text-white hover:ring-ink"
                    >
                      {s.label}
                      <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover/s:translate-x-0.5 group-hover/s:-translate-y-0.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-ink/10">
          <div className="mx-auto flex max-w-[1340px] flex-col gap-4 px-5 py-5 text-[13px] text-ink-soft md:flex-row md:items-center md:justify-between md:px-10">
            <p>© {year} Meriity Pty Ltd. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#" className="transition-colors hover:text-ink">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-ink">Terms</a>
              <button
                type="button"
                onClick={toTop}
                className="group/top inline-flex items-center gap-2 font-semibold text-ink"
                aria-label="Back to top"
              >
                Back to top
                <span className="grid size-8 place-items-center rounded-full bg-ink/[0.07] transition-colors duration-300 group-hover/top:bg-coral group-hover/top:text-white">
                  <ArrowRight className="size-3.5 -rotate-90 transition-transform duration-500 ease-out-expo group-hover/top:-translate-y-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
