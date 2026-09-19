/**
 * Stat — KPI card with left accent border.
 * accent prop: Tailwind border-color class (e.g. "border-indigo-500")
 */
export function Stat({ label, value, suffix = "", accent = "border-slate-300", sublabel, onClick }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`text-left bg-white border-l-4 ${accent} border-y border-r border-slate-200 rounded-r-lg rounded-l-sm px-4 py-3.5 min-w-0 ${
        onClick ? "hover:bg-slate-50 transition-colors cursor-pointer hover:shadow-sm" : ""
      }`}
    >
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-slate-900 leading-none tabular-nums">
          {value}
        </span>
        {suffix && (
          <span className="text-base font-semibold text-slate-500 ml-0.5">{suffix}</span>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-1.5 font-medium leading-tight">{label}</div>
      {sublabel && (
        <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>
      )}
    </Component>
  );
}
