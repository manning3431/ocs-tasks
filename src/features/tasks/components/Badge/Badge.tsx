import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "brand" | "coral" | "amber" | "neutral" | "success";
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  brand: "bg-brand-100 text-brand-700",
  coral: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
};

export function Badge({ tone = "neutral", className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}