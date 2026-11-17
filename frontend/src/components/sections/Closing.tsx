"use client";
import { useRef, useState } from "react";
import { closing, CTA, footer } from "@/content/home";
import { api, ApiError } from "@/lib/api";
import { gsap, useGSAP, EASE, REDUCED } from "@/lib/gsap";
import BlurReveal from "@/components/motion/BlurReveal";
import Marquee from "@/components/motion/Marquee";
import Button from "@/components/ui/Button";
import { ChevronMark } from "@/components/ui/Icons";

type Status = { ok: boolean; msg: string } | null;

const field =
  "w-full rounded-2xl bg-white/[0.06] px-5 py-4 text-[16px] text-on-violet ring-1 ring-inset ring-white/15 placeholder:text-on-violet-soft/70 transition-[box-shadow,background-color] duration-300 hover:ring-white/30 focus:bg-white/[0.09] focus:ring-2 focus:ring-coral focus:outline-none aria-[invalid=true]:ring-coral";

export default function Closing() {
  const scope = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`not ${REDUCED}`, () => {
        gsap.from(".cl-panel", {
          clipPath: "inset(12% 6% 12% 6% round 48px)",
          duration: 1.6,
          ease: EASE,
          scrollTrigger: { trigger: ".cl-panel", start: "top 85%", toggleActions: "play none none none" },
        });
        gsap.from(".cl-form > *", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: EASE,
          stagger: 0.06,
          scrollTrigger: { trigger: ".cl-form", start: "top 85%", toggleActions: "play none none none" },
        });
      });
    },
    { scope },
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setLoading(true);
    setStatus(null);
    setErrors({});
    try {
      const res = await api.submitContact({
        name: fd.name,
        email: fd.email,
        message: fd.message,
        phone: fd.phone || undefined,
        company: fd.company || undefined,
      });
      setStatus({ ok: true, msg: res.message });
      form.reset();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
        setStatus({ ok: false, msg: "Please check the highlighted fields." });
      } else {
        setStatus({
          ok: false,
          msg: `We couldn't send that just now. Try again, or email ${footer.email.label}.`,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1.5 pl-2 text-[13px] text-coral-soft">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section id="contact" ref={scope} className="bg-ground px-3 pb-3 md:px-5 md:pb-5">
      <div className="cl-panel relative overflow-hidden rounded-[16px] bg-[#093160] text-on-violet md:rounded-[20px]">
        <ChevronMark className="pointer-events-none absolute -bottom-[20%] -left-[10%] w-[55vw] max-w-[760px] text-white/[0.035]" />

        <Marquee duration={28} className="border-b border-white/10 py-6 md:py-10">
          {[0, 1].map((k) => (
            <span key={k} className="display flex items-center gap-6 pr-6 text-[clamp(2.5rem,10vw,9.5rem)] md:gap-10 md:pr-10 whitespace-nowrap">
              <span>Make trust visible</span>
              <ChevronMark className="size-[0.6em] text-coral" />
              <span className="text-on-violet/35">Make trust visible</span>
              <ChevronMark className="size-[0.6em] text-coral" />
            </span>
          ))}
        </Marquee>

        <div className="relative mx-auto grid max-w-[1340px] gap-14 px-5 py-12 sm:py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <BlurReveal className="display text-[clamp(2.75rem,6vw,5.375rem)]">
              {closing.title[0]} <span className="text-on-violet-soft">{closing.title[1]}</span>
            </BlurReveal>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-on-violet-soft">{closing.body}</p>

            <dl className="mt-12 grid gap-6 text-[15px] sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-on-violet">Visit</dt>
                <dd className="mt-1 text-on-violet-soft">
                  {footer.address[0]}
                  <br />
                  {footer.address[1]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-on-violet">Talk</dt>
                <dd className="mt-1 text-on-violet-soft">
                  <a className="underline decoration-white/25 hover:text-on-violet hover:decoration-coral" href={footer.phone.href}>
                    {footer.phone.label}
                  </a>
                  <br />
                  <a className="underline decoration-white/25 hover:text-on-violet hover:decoration-coral" href={footer.email.href}>
                    {footer.email.label}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <form onSubmit={onSubmit} noValidate className="cl-form grid gap-3 sm:grid-cols-2" aria-describedby="form-status">
            <p className="display text-2xl sm:col-span-2">{CTA.trustCheck.label}</p>
            <div>
              <label htmlFor="name" className="sr-only">Name</label>
              <input id="name" name="name" required autoComplete="name" placeholder="Your name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="Work email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
              {err("email")}
            </div>
            <div>
              <label htmlFor="company" className="sr-only">Business name</label>
              <input id="company" name="company" autoComplete="organization" placeholder="Business name" className={field} />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Phone</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone (optional)" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="sr-only">What would you like help with?</label>
              <textarea id="message" name="message" required rows={4} placeholder="Your website, and what you'd like help with" className={`${field} resize-none`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-err" : undefined} />
              {err("message")}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Sending…" : "Request my Trust Check"}
              </Button>
              <p id="form-status" role="status" className={`text-[14px] ${status?.ok ? "text-on-violet" : "text-coral-soft"}`}>
                {status?.msg}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
