import { X } from "lucide-react";

/**
 * SlideOver — right-anchored slide-in panel for detail views.
 * Backdrop click closes the panel.
 */
export function SlideOver({ title, subtitle, onClose, children, width = "max-w-xl" }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div className={`relative w-full ${width} bg-white h-full shadow-2xl flex flex-col slide-in-right`}>
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded p-0.5 transition-colors"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
