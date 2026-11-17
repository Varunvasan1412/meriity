import Image from "next/image";

/** Official Meriity logo (coral mark + wordmark), from meriity.com. */
export default function Logo({ className = "", href = "#top" }: { className?: string; href?: string }) {
  return (
    <a href={href} className={`inline-flex items-center ${className}`} aria-label="Meriity home">
      <Image src="/brand/meriity-logo.png" alt="Meriity" width={374} height={126} priority className="h-9 w-auto" />
    </a>
  );
}
