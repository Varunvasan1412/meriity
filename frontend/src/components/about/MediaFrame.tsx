import { ChevronMark } from "@/components/ui/Icons";
import LoopVideo from "./LoopVideo";

const chevron = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 40 40'><path fill='#ffffff' fill-opacity='0.07' d='M20 3 37 12v6L20 9 3 18v-6zM20 13 37 22v6L20 19 3 28v-6zM20 23 37 32v6L20 29 3 38v-6z'/></svg>",
);

/**
 * Looping video slot. With a source it plays muted and inline; without one it shows a
 * slow, living field of Meriity chevrons with a label saying which footage belongs here.
 */
export default function MediaFrame({
  mp4,
  webm,
  poster,
  need,
  className = "",
  innerClassName = "",
}: {
  mp4?: string;
  webm?: string;
  poster?: string;
  need: string;
  className?: string;
  innerClassName?: string;
}) {
  const hasVideo = Boolean(mp4 || webm);
  return (
    <div className={`relative overflow-hidden bg-night ${className}`}>
      <div className={`absolute inset-0 ${innerClassName}`}>
        {hasVideo ? (
          <LoopVideo mp4={mp4} webm={webm} poster={poster} />
        ) : (
          <>
            <div
              aria-hidden
              className="chev-field absolute -inset-[20%]"
              style={{ backgroundImage: `url("data:image/svg+xml,${chevron}")`, backgroundSize: "120px 120px" }}
            />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,16,16,0.55)_55%,#101010_100%)]" />
            <ChevronMark className="chev-float absolute top-1/2 left-1/2 w-[18%] max-w-[220px] min-w-[72px] -translate-x-1/2 -translate-y-1/2 text-coral" />
            <div aria-hidden className="hero-grain pointer-events-none absolute -inset-[10%]" />
          </>
        )}
      </div>
      {!hasVideo && (
        <p className="absolute bottom-4 left-4 max-w-[34ch] text-[12px] leading-snug text-on-dark-soft md:bottom-6 md:left-6">
          <span className="label block text-on-dark">Video needed</span>
          {need}
        </p>
      )}
    </div>
  );
}
