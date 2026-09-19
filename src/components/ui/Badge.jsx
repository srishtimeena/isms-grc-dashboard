import { STATUS_STYLE } from "../../constants/statusStyles.js";

/**
 * Badge — semantic status indicator.
 * Uses the STATUS_STYLE map to derive colors from the tone prop.
 */
export function Badge({ children, tone }) {
  const cls = STATUS_STYLE[tone] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  );
}
