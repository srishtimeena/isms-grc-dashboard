/**
 * Btn — consistent button component.
 * Variants: primary | secondary | danger | ghost
 * Sizes: sm | md
 */
export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  className = "",
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
    lg: "px-5 py-2 text-sm",
  };

  const variants = {
    primary:   "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100",
    danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    ghost:     "text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
