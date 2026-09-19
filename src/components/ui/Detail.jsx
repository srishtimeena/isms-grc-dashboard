/** Detail — label/value pair for SlideOver and detail views */
export function Detail({ label, value, mono }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className={`text-sm text-slate-800 leading-snug ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
