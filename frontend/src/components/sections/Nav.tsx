"use client";
import { useEffect, useRef, useState } from "react";
import { menu, CTA, footer, withBase } from "@/content/home";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import RollText from "@/components/motion/RollText";

/**
 * Minimal header (logo, call-to-action, round menu button) and a full-screen
 * menu, timed to the reference:
 *   0–720ms   panel slides in from the left (ease in-out)
 *   740ms+    links rise 40px and fade in, 90ms apart, long soft settle
 *   ~1.5s     contact details rise 20px and fade in
 * Closing replays it in reverse at double speed.
 */
export default function Nav({ base = "" }: { base?: string }) {
  const link = (h: string) => withBase(base, h);
  const [open, setOpen] = useState(false);
  // Past the hero, the header draws in to a compact centred glass pill.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scope = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      gsap.set(".menu-panel", { xPercent: -100 });
      tl.current = gsap
        .timeline({ paused: true })
        .set(".menu-panel", { visibility: "visible" })
        .fromTo(".menu-panel", { xPercent: -100 }, { xPercent: 0, duration: 0.72, ease: "power3.inOut" })
        .fromTo(".menu-link", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "power4.out", stagger: 0.09 }, 0.74)
        .fromTo(".menu-meta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "power4.out", stagger: 0.1 }, 1.5);
    },
    { scope },
  );

  const closing = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (open) {
      closing.current?.kill();
      t.timeScale(1).play(0);
    } else if (t.progress() > 0) {
      // Dedicated close: content fades fast while the panel glides out to the left at the
      // same time (no waiting for the opening sequence to rewind). Then everything resets.
      t.pause();
      closing.current = gsap
        .timeline({
          onComplete: () => {
            t.pause(0);
            gsap.set(".menu-panel", { visibility: "hidden", xPercent: -100 });
          },
        })
        .to([".menu-link", ".menu-meta"], { opacity: 0, y: -12, duration: 0.25, ease: "power2.in", stagger: 0.015 }, 0)
        .to(".menu-panel", { xPercent: -100, duration: 0.65, ease: "power3.inOut" }, 0.08);
    }

    const lenis = getLenis();
    if (lenis) {
      if (open) lenis.stop();
      else lenis.start();
    } else {
      document.documentElement.style.overflow = open ? "hidden" : "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const roundBtn =
    "grid size-11 place-items-center rounded-full bg-night-raised text-on-dark ring-1 ring-white/10 transition-[background-color,transform] duration-500 ease-out-expo hover:scale-105 hover:bg-[#2c2c2c]";

  return (
    <header ref={scope}>
      {/* Page header */}
      <div className="fixed inset-x-0 top-0 z-[45] px-4 pt-4">
        <div
          className={`mx-auto flex items-center justify-between rounded-full transition-[max-width,padding,background-color,box-shadow,backdrop-filter] duration-700 ease-out-expo ${
            compact
              ? "max-w-[460px] bg-[rgba(18,18,18,0.62)] py-1.5 pr-1.5 pl-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-xl backdrop-saturate-150"
              : "max-w-[1340px] bg-transparent py-0 pr-0 pl-0 backdrop-blur-0"
          }`}
        >
          <Logo href={base ? "/" : "#top"} />
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <Button href={link(CTA.growthCall.href)} className="py-3!">
                {CTA.growthCall.label}
              </Button>
            </span>
            <button type="button" aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" onClick={() => setOpen(true)} className={`group ${roundBtn}`}>
              <span className="relative block h-3 w-[18px]">
                <span className="absolute top-0 left-0 h-[1.5px] w-full rounded bg-current" />
                <span className="absolute top-[5.5px] left-0 h-[1.5px] w-full rounded bg-current transition-[width] duration-500 ease-out-expo group-hover:w-2/3" />
                <span className="absolute top-[11px] left-0 h-[1.5px] w-full rounded bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen menu: brings its own logo and close button with it */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        data-lenis-prevent
        className="menu-panel invisible fixed inset-0 z-50 will-change-transform overflow-y-auto overscroll-contain bg-night text-on-dark"
      >
        <div className="mx-auto flex min-h-full max-w-[1340px] flex-col px-4 lg:px-0">
          <div className="flex items-center justify-between pt-4">
            <Logo href={base ? "/" : "#top"} />
            <button type="button" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className={roundBtn}>
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>

          <div className="grid flex-1 content-start gap-14 pt-14 pb-12 lg:grid-cols-[67.5%_1fr] lg:items-end lg:gap-0 lg:pt-[54px]">
            <nav aria-label="Main" className="lg:order-2">
              <ul>
                {menu.map((l) => (
                  <li key={l.label}>
                    <a
                      href={link(l.href)}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className="menu-link group/roll display block text-[clamp(3rem,5.6vw,5.375rem)] leading-[0.9] tracking-[-0.02em] uppercase"
                    >
                      <RollText text={l.label} hoverClass="text-coral" stagger={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <dl className="space-y-6 lg:order-1">
              <div className="menu-meta">
                <dt className="label text-on-dark-soft">Head office</dt>
                <dd className="mt-1.5 text-[18px] font-semibold">{footer.address.join(", ")}</dd>
              </div>
              <div className="menu-meta">
                <dt className="label text-on-dark-soft">Phone</dt>
                <dd className="mt-1.5 text-[18px] font-semibold">
                  <a href={footer.phone.href} tabIndex={open ? 0 : -1} className="hover:text-coral">{footer.phone.label}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </header>
  );
}
