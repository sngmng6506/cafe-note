import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-accent text-white disabled:bg-slate-300",
    secondary: "bg-white text-slate-800 ring-1 ring-slate-200",
    ghost: "bg-transparent text-slate-700",
    danger: "bg-red-600 text-white"
  };
  return (
    <button
      className={`tap rounded-md px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
