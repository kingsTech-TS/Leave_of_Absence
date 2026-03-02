import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-800 text-white hover:bg-blue-900": variant === "primary",
            "bg-slate-100 text-slate-900 hover:bg-slate-200":
              variant === "secondary",
            "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-900":
              variant === "outline",
            "hover:bg-slate-100 hover:text-slate-900 text-slate-700":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "h-9 px-3 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-11 px-8 text-lg": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
