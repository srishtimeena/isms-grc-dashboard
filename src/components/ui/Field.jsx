/** Shared input className used across all form inputs, selects, and textareas */
export const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors";

/**
 * Field — form field wrapper with label and optional hint text.
 * Wraps children in a <label> element for accessibility.
 */
export function Field({ label, children, hint, required }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-slate-400 mt-1">{hint}</span>
      )}
    </label>
  );
}
