import Image from "next/image";

/**
 * Black-and-white photograph slot. With `src` it renders the photo (greyscale,
 * slow zoom on hover). Without one it renders a quiet, clearly labelled frame
 * saying which photo belongs there, so nothing fake ever ships.
 */
export default function Photo({
  src,
  alt,
  need,
  className = "",
  sizes = "100vw",
  dark = false,
}: {
  src?: string;
  alt: string;
  /** What photo this slot needs, shown while it's empty. */
  need: string;
  className?: string;
  sizes?: string;
  dark?: boolean;
}) {
  return (
    <div className={`group/photo relative overflow-hidden ${dark ? "bg-night-raised" : "bg-stone"} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover grayscale transition-transform duration-[1.6s] ease-out-expo group-hover/photo:scale-[1.04]"
        />
      ) : (
        <div className={`absolute inset-0 flex items-end p-5 ${dark ? "text-on-dark-soft" : "text-ink-soft"}`}>
          <p className="max-w-[30ch] text-[13px] leading-snug">
            <span className="label block">Photo needed</span>
            {need}
          </p>
        </div>
      )}
    </div>
  );
}
