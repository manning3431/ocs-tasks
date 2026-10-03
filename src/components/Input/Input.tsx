import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = "", ...rest }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-slate-400">{icon}</span>}
        <input
          ref={ref}
          className={[
            "w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900",
            "px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            "placeholder:text-slate-400",
            icon ? "pl-9" : "",
            className,
          ].join(" ")}
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = "Input";