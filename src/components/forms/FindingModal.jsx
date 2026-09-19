import { useState } from "react";
import { X, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { CONTROLS } from "../../constants/iso27001.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

const FINDING_TYPES = ["Non-Conformity", "Observation", "Opportunity for Improvement", "Positive Finding"];
const SEVERITIES = ["Critical", "High", "Medium", "Low", "Observation"];

export function FindingModal({ isOpen, onClose, onSave, defaultControlId = "" }) {
  const { currentUser, role, audits } = useApp();

  const [form, setForm] = useState({
    title: "",
    controlId: defaultControlId || "A.8.7",
    auditId: audits?.[0]?.id || "AUD-2026-01",
    type: "Non-Conformity",
    severity: "High",
    description: "",
    objectiveEvidence: "",
    risk: "",
    impact: "",
    rootCause: "",
    recommendation: "",
    owner: "",
    targetDate: daysFromNow(30),
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Finding title is required";
    if (!form.controlId) errs.controlId = "Control ID is required";
    if (!form.owner.trim()) errs.owner = "Remediation owner is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    onSave({
      ...form,
      status: "Open",
      createdDate: new Date().toISOString(),
      closedDate: null,
      createdBy: currentUser?.name || role,
      reviewer: "David Kim",
      comments: [],
      history: [
        { date: new Date().toISOString(), user: currentUser?.name || role, action: `Raised ${form.severity} ${form.type}` },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Raise Audit Finding</h3>
              <p className="text-xs text-slate-500">Record a non-conformity, gap, or observation against ISO 27001 requirements</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="Finding Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Endpoint protection agent is not deployed to laptops"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="ISO 27001 Control" required error={errors.controlId}>
              <select
                value={form.controlId}
                onChange={(e) => setForm({ ...form, controlId: e.target.value })}
                className={inputCls}
              >
                {CONTROLS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Audit Reference">
              <select
                value={form.auditId}
                onChange={(e) => setForm({ ...form, auditId: e.target.value })}
                className={inputCls}
              >
                {(audits || []).map((a) => (
                  <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category / Finding Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                {FINDING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Severity Rating">
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className={inputCls}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Audit Description & Condition Observed">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what was observed during the audit inspection..."
              className={inputCls}
            />
          </Field>

          <Field label="Objective Evidence Reviewed">
            <input
              type="text"
              value={form.objectiveEvidence}
              onChange={(e) => setForm({ ...form, objectiveEvidence: e.target.value })}
              placeholder="Reference specific file, ticket, screenshot, or configuration export"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Underlying Root Cause">
              <input
                type="text"
                value={form.rootCause}
                onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                placeholder="e.g. Standard image omitted during expedited hiring"
                className={inputCls}
              />
            </Field>

            <Field label="Business Impact">
              <input
                type="text"
                value={form.impact}
                onChange={(e) => setForm({ ...form, impact: e.target.value })}
                placeholder="e.g. Potential ransomware spread on internal network"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Auditor Recommendation">
            <textarea
              rows={2}
              value={form.recommendation}
              onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
              placeholder="Recommended corrective actions to satisfy ISO requirements..."
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Remediation Owner" required error={errors.owner}>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Name or team responsible"
                className={inputCls}
              />
            </Field>

            <Field label="Target Remediation Date">
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              <AlertTriangle size={13} />
              <span>Raise Finding</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
