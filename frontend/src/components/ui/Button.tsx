import type { ReactNode } from "react";
import { ArrowRight } from "./Icons";
import RollText from "@/components/motion/RollText";

type Variant = "coral" | "ghost-light" | "ghost-dark" | "ink";

const styles: Record<Variant, string> = {
  coral: "bg-coral text-white hover:bg-coral-deep",
  "ghost-light": "text-on-violet ring-1 ring-inset ring-on-violet/40 hover:ring-on-violet hover:bg-white/5",
  "ghost-dark": "text-ink ring-1 ring-inset ring-ink/25 hover:ring-ink",
  ink: "bg-ink text-white hover:bg-black",
};

/**
 * Pill button with the arrow-swap hover: the arrow exits right while a twin enters from the left.
 */
export default function Button({
  href,
  children,
  variant = "coral",
  arrow = true,
  className = "",
  type,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  const cls = `group/btn group/roll inline-flex items-center gap-3 rounded-[10px] px-6 py-3.5 text-[15px] font-semibold transition-[background-color,box-shadow,color] duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`;
  const inner = (
    <>
      {typeof children === "string" ? <RollText text={children} /> : <span>{children}</span>}
      {arrow && (
        <span className="relative size-4 overflow-hidden">
          <ArrowRight className="absolute inset-0 size-4 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-[130%]" />
          <ArrowRight className="absolute inset-0 size-4 -translate-x-[130%] transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0" />
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
