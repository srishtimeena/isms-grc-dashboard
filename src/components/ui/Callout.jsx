import { Info, AlertTriangle, AlertCircle } from "lucide-react";

const toneMap = {
  slate: {
    cls: "bg-slate-50 border-slate-200 text-slate-600",
    Icon: Info,
  },
  amber: {
    cls: "bg-amber-50 border-amber-200 text-amber-800",
    Icon: AlertTriangle,
  },
  red: {
    cls: "bg-red-50 border-red-200 text-red-800",
    Icon: AlertCircle,
  },
  indigo: {
    cls: "bg-indigo-50 border-indigo-200 text-indigo-800",
    Icon: Info,
  },
};

/** Callout — inline contextual message with icon and tone */
export function Callout({ children, tone = "slate" }) {
  const { cls, Icon } = toneMap[tone] ?? toneMap.slate;
  return (
    <div className={`border rounded-md px-3 py-2.5 text-xs flex items-start gap-2 ${cls}`}>
      <Icon size={13} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
