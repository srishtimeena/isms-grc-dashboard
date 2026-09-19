import { useState } from "react";
import { X, ClipboardList } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { DEMO_PERSONAS } from "../../constants/permissions.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

const AUDIT_TYPES = [
  "Internal Audit",
  "Supplier Audit",
  "Certification Readiness",
  "Technical Audit",
  "Regulatory Compliance",
  "Surveillance Audit",
];

export function AuditModal({ isOpen, onClose, onSave }) {
  const { currentUser, role } = useApp();

  const [form, setForm] = useState({
    name: "",
    type: "Internal Audit",
    scope: "Cloud Infrastructure, Production Databases, and Information Security Governance.",
    objectives: "Evaluate operational effectiveness of ISO 27001:2022 Annex A controls.",
    criteria: "ISO/IEC 27001:2022, corporate security policies POL-001 to POL-012.",
    leadAuditor: currentUser?.name || "Srishti Meena",
    team: "Srishti Meena, Fatima Sheikh",
    department: "Internal Audit",
    startDate: daysFromNow(0),
    endDate: daysFromNow(30),
    status: "Planned",
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Audit name is required";
    if (!form.scope.trim()) errs.scope = "Audit scope is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Plan New Audit Program</h3>
              <p className="text-xs text-slate-500">Define audit charter, lead auditor, objectives, and schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="Audit Plan Title" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Q4 Cloud Supplier & Infrastructure Audit"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Audit Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                {AUDIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Lead Auditor">
              <select
                value={form.leadAuditor}
                onChange={(e) => setForm({ ...form, leadAuditor: e.target.value })}
                className={inputCls}
              >
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} ({p.role})</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Audit Scope" required error={errors.scope}>
            <textarea
              rows={2}
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              placeholder="Detail organizational units, applications, and physical sites in scope..."
              className={inputCls}
            />
          </Field>

          <Field label="Audit Objectives">
            <textarea
              rows={2}
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Audit Criteria & Standards">
            <input
              type="text"
              value={form.criteria}
              onChange={(e) => setForm({ ...form, criteria: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Audit Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Audit End Date">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
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
              <ClipboardList size={13} />
              <span>Create Audit Charter</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
