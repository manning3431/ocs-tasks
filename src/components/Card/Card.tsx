import { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className = "", ...rest }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        padded ? "p-4" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}