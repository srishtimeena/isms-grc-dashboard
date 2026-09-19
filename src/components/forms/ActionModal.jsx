import { useState } from "react";
import { X, ListChecks } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function ActionModal({ isOpen, onClose, onSave }) {
  const { findings, risks, currentUser, role } = useApp();

  const [form, setForm] = useState({
    description: "",
    rootCause: "",
    findingId: findings?.[0]?.id || "",
    riskId: risks?.[0]?.id || "",
    owner: currentUser?.name || "",
    priority: "High",
    targetDate: daysFromNow(21),
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = "Action description is required";
    if (!form.owner.trim()) errs.owner = "Owner is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    onSave({
      ...form,
      status: "In Progress",
      progress: 0,
      completionDate: null,
      completionEvidence: "",
      ticketId: null,
      verificationStatus: "Not Verified",
      auditorApproval: false,
      comments: [],
      history: [
        { date: new Date().toISOString(), user: currentUser?.name || role, action: "Created corrective action" },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ListChecks size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create Corrective Action (CAPA)</h3>
              <p className="text-xs text-slate-500">Plan remediation task to resolve audit findings and mitigate risk</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="Action Plan Description" required error={errors.description}>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detail specific remediation steps, configuration changes, or process updates..."
              className={inputCls}
            />
          </Field>

          <Field label="Underlying Root Cause">
            <input
              type="text"
              value={form.rootCause}
              onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
              placeholder="e.g. Configuration drift; lack of automated scanning"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Link Finding">
              <select
                value={form.findingId}
                onChange={(e) => setForm({ ...form, findingId: e.target.value })}
                className={inputCls}
              >
                <option value="">None (Independent)</option>
                {(findings || []).map((f) => (
                  <option key={f.id} value={f.id}>{f.id} — {f.title.slice(0, 30)}...</option>
                ))}
              </select>
            </Field>

            <Field label="Link Risk">
              <select
                value={form.riskId}
                onChange={(e) => setForm({ ...form, riskId: e.target.value })}
                className={inputCls}
              >
                <option value="">None</option>
                {(risks || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.id} — {r.title.slice(0, 30)}...</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned Action Owner" required error={errors.owner}>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Name or team"
                className={inputCls}
              />
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={inputCls}
              >
                {["Critical", "High", "Medium", "Low"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Target Remediation Date">
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className={inputCls}
            />
          </Field>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              <ListChecks size={13} />
              <span>Create Action</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
