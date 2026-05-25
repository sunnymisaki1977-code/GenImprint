import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "danger" }>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-cinnabar text-white hover:bg-red-800 disabled:bg-stone-300",
      secondary: "bg-stone-900 text-white hover:bg-black disabled:bg-stone-300",
      outline: "border border-stone-300 bg-transparent hover:bg-stone-50 text-stone-900",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 rounded-md font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center gap-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn("animate-pulse rounded-md bg-ink-100", className)} />;
};
