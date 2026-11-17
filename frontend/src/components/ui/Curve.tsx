/**
 * Organic notch that joins two sections. Sits at the bottom of a section and is
 * filled with the NEXT section's colour, so the edge reads as a soft shoulder.
 */
export default function Curve({ fill, flip = false, className = "" }: { fill: string; flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -bottom-px block h-10 w-full md:h-16 ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <path d="M0 64V0h1000c80 0 120 18 170 40s90 24 150 24h120z" fill={fill} />
    </svg>
  );
}
