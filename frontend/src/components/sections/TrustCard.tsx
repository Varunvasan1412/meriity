import { clients } from "@/content/home";
import ScrubText from "@/components/motion/ScrubText";
import Marquee from "@/components/motion/Marquee";

/**
 * The hero hands off to a white card framed by the dark band: its statement
 * fills word by word as you scroll, then the client marquee runs along its base.
 */
export default function TrustCard() {
  return (
    <section aria-label="Why trust matters" className="bg-night pt-6 pb-12 md:pt-[50px] md:pb-[50px]">
      <div className="mx-auto max-w-[1340px] px-4">
      <div data-trust-card className="overflow-hidden rounded-[16px] bg-ground px-6 pt-8 pb-6 md:px-[30px] md:pt-10">
        <ScrubText
          text="Every touchpoint tells the same consistent story."
          className="display max-w-[22ch] text-[clamp(2.25rem,5vw,4.625rem)] leading-[0.98]! tracking-[-0.035em]! text-ink"
        />

        <p className="display mt-24 text-[clamp(2.75rem,5vw,4.625rem)] text-ink md:mt-40">Trusted by</p>

        <Marquee duration={30} label="Clients" className="mt-6 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          {clients.map((c) => (
            <span key={c} className="display px-10 text-[clamp(1.25rem,2vw,1.75rem)] whitespace-nowrap text-ink/80">
              {c}
            </span>
          ))}
        </Marquee>
      </div>
      </div>
    </section>
  );
}
