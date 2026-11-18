"use client";
import { useRef } from "react";
import Image from "next/image";
import { hero, heroVideo, footer } from "@/content/home";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import { onStingerLift } from "@/lib/stinger";
import BlurReveal from "@/components/motion/BlurReveal";
import RollText from "@/components/motion/RollText";
import { ArrowUpRight } from "@/components/ui/Icons";
import PhotoDepth from "@/components/hero/PhotoDepth";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        // Starts once the logo stinger lifts, after the headline has begun to resolve.
        const fades = gsap.from(".hero-fade", { y: 24, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.08, delay: 0.9, paused: true });
        const offLift = onStingerLift(() => fades.restart(true));
        return () => offLift();
      });
    },
    { scope },
  );

  return (
    <section id="top" ref={scope} className="relative z-40 flex h-[max(560px,100svh)] flex-col overflow-hidden bg-[#070707] text-on-dark md:h-[max(680px,100svh)]">
      {heroVideo.mp4 || heroVideo.webm ? (
        <video
          className="absolute inset-0 -z-10 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroVideo.poster || undefined}
          aria-hidden
        >
          {heroVideo.webm && <source src={heroVideo.webm} type="video/webm" />}
          {heroVideo.mp4 && <source src={heroVideo.mp4} type="video/mp4" />}
        </video>
      ) : (
        <>
          {/* Mobile: crisp static 9:16 vertical night cityscape with zero low-poly distortion */}
          <Image
            src="/hero/city-mobile.jpg"
            alt="Melbourne skyline at night"
            fill
            priority
            unoptimized
            aria-hidden
            className="absolute inset-0 -z-10 size-full object-cover object-center md:hidden"
          />
          {/* Tablet & Desktop: interactive 3D depth scene */}
          <PhotoDepth
            className="absolute inset-0 -z-10 size-full hidden md:block"
            src="/hero/city.jpg"
            depth="/hero/city-depth.png"
            focal={[0.55, 0.35]}
          />
        </>
      )}
      {/* Legibility: darken behind the headline and links without crushing the city */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.45)_0%,rgba(7,7,7,0.15)_35%,rgba(7,7,7,0.75)_100%)] md:bg-[linear-gradient(90deg,rgba(7,7,7,0.72)_0%,rgba(7,7,7,0.38)_38%,rgba(7,7,7,0)_64%),linear-gradient(0deg,rgba(7,7,7,0.85)_0%,rgba(7,7,7,0)_32%)]"
      />
      {/* Cinematic finish over the scene: soft vignette and film grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block bg-[radial-gradient(130%_100%_at_60%_45%,transparent_60%,rgba(0,0,0,0.6)_100%)]" />
      <div aria-hidden className="hero-grain pointer-events-none absolute -inset-[10%]" />

      <div className="hero-copy relative mx-auto flex w-full max-w-[1340px] flex-1 flex-col px-4 pt-24 pb-6 sm:px-6 md:pt-[63px] md:pb-[clamp(32px,5svh,64px)]">
        {/* The headline sits in the vertical middle of the space between the header and the statement. */}
        <div className="flex flex-1 flex-col justify-end pb-8 sm:pb-10 lg:justify-center lg:pb-0">
          <h1 className="display hero-title uppercase">
            <BlurReveal as="span" immediate className="block text-[clamp(0.95rem,2.2vw,2rem)] font-bold tracking-[-0.01em] text-on-dark-soft">
              {hero.lead}
            </BlurReveal>
            <BlurReveal
              as="span"
              immediate
              delay={0.25}
              className="hero-giant mt-3 block text-[clamp(2.75rem,min(13.5vw,11svh),4.75rem)] sm:text-[clamp(3.4rem,min(11vw,13svh),6.5rem)] lg:text-[clamp(3.4rem,min(9vw,15svh),8.125rem)]"
            >
              {hero.punch[0]} <span className="text-coral">{hero.punch[1]}</span>
            </BlurReveal>
          </h1>
        </div>

        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
          <p className="hero-fade max-w-[30ch] text-[clamp(0.9rem,1.4vw,1.25rem)] leading-[1.25] font-bold uppercase">{hero.statement}</p>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-2 md:mt-9 md:grid-cols-4">
          {[...footer.socials, { label: footer.phone.label, href: footer.phone.href }].map((l) => (
            <li key={l.label} className="hero-fade">
              <a
                href={l.href}
                className="group group/roll flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#161616]/90 px-2 text-[12px] sm:text-[13px] md:h-14 md:text-[14px] font-bold uppercase ring-1 ring-white/10 transition-colors duration-300 hover:bg-[#1f1f1f]"
              >
                <RollText text={l.label} hoverClass="text-coral" />
                <ArrowUpRight className="size-4 text-on-dark-soft transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
