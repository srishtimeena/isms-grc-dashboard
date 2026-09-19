/** SectionTitle — page/card section heading with optional subtitle */
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-slate-900 leading-snug">{children}</h2>
      {sub && (
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
      )}
    </div>
  );
}
