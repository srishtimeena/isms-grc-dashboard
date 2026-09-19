import { useState, useEffect, useRef } from "react";
import { Search, X, ShieldCheck, FileText, AlertTriangle, ShieldAlert, FileSearch, ClipboardList, ListChecks, Users, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { CONTROLS } from "../../constants/iso27001.js";

export function GlobalSearch({ isOpen, onClose }) {
  const {
    policies,
    findings,
    risks,
    evidence,
    audits,
    actions,
    users,
    setPage,
    setSelectedControlId,
    openFinding,
    openRisk,
    openAction,
  } = useApp();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle handled by parent
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter entities across entire GRC platform
  const matchedControls = q
    ? CONTROLS.filter((c) => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)).slice(0, 5)
    : [];

  const matchedPolicies = q
    ? (policies || []).filter((p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedFindings = q
    ? (findings || []).filter((f) => f.id.toLowerCase().includes(q) || f.title.toLowerCase().includes(q) || f.controlId.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedRisks = q
    ? (risks || []).filter((r) => r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || (r.asset && r.asset.toLowerCase().includes(q))).slice(0, 4)
    : [];

  const matchedEvidence = q
    ? (evidence || []).filter((e) => e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.controlId.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedAudits = q
    ? (audits || []).filter((a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults =
    matchedControls.length > 0 ||
    matchedPolicies.length > 0 ||
    matchedFindings.length > 0 ||
    matchedRisks.length > 0 ||
    matchedEvidence.length > 0 ||
    matchedAudits.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden fade-in">
        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ISO controls (e.g. A.5.23), policies, risks, findings, evidence..."
            className="w-full py-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-500 mb-1">Quick Universal Search across ISMS Platform</p>
              <p>Type a control number (e.g. <span className="font-mono text-indigo-600 font-semibold">A.5.23</span>), policy name, risk keyword, or evidence record ID.</p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No GRC records matching &ldquo;<span className="text-slate-700 font-medium">{query}</span>&rdquo;.
            </div>
          ) : (
            <>
              {/* Controls */}
              {matchedControls.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-indigo-600" />
                    <span>ISO 27001 Controls</span>
                  </div>
                  <div className="space-y-1">
                    {matchedControls.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedControlId(c.id);
                          setPage("controls");
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50/60 transition-colors border border-transparent hover:border-indigo-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-indigo-600">{c.id}</span>
                          <span className="text-slate-700 truncate">{c.title}</span>
                        </div>
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {matchedPolicies.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <FileText size={12} className="text-teal-600" />
                    <span>Policies</span>
                  </div>
                  <div className="space-y-1">
                    {matchedPolicies.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPage("policies");
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-teal-50/60 transition-colors border border-transparent hover:border-teal-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-teal-700">{p.id}</span>
                          <span className="text-slate-800 font-medium truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">v{p.version}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{p.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              {matchedFindings.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-orange-500" />
                    <span>Findings</span>
                  </div>
                  <div className="space-y-1">
                    {matchedFindings.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onClose();
                          openFinding(f.id);
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-50/60 transition-colors border border-transparent hover:border-orange-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-orange-600">{f.id}</span>
                          <span className="text-slate-700 truncate">{f.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${f.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                          {f.severity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {matchedRisks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-purple-600" />
                    <span>Risk Register</span>
                  </div>
                  <div className="space-y-1">
                    {matchedRisks.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onClose();
                          openRisk(r.id);
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-purple-50/60 transition-colors border border-transparent hover:border-purple-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-purple-600">{r.id}</span>
                          <span className="text-slate-700 truncate">{r.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Score: {r.inherentScore}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {matchedEvidence.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <FileSearch size={12} className="text-sky-600" />
                    <span>Evidence Repository</span>
                  </div>
                  <div className="space-y-1">
                    {matchedEvidence.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setPage("evidence");
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sky-50/60 transition-colors border border-transparent hover:border-sky-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-sky-600">{e.id}</span>
                          <span className="text-slate-700 truncate">{e.name || e.description}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{e.controlId}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audits */}
              {matchedAudits.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                    <ClipboardList size={12} className="text-indigo-600" />
                    <span>Audits</span>
                  </div>
                  <div className="space-y-1">
                    {matchedAudits.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setPage("audits");
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-indigo-50/60 transition-colors border border-transparent hover:border-indigo-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-indigo-600">{a.id}</span>
                          <span className="text-slate-800 font-medium truncate">{a.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{a.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Enter</kbd> to select</span>
            <span>Close: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Esc</kbd></span>
          </div>
          <span className="text-indigo-600 font-medium">ISMS-GRC Omnisearch</span>
        </div>
      </div>
    </div>
  );
}
