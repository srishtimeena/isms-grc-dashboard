import { useState } from "react";
import { X, Send, ClipboardList, HelpCircle } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { CONTROLS } from "../../constants/iso27001.js";
import { DEMO_PERSONAS } from "../../constants/permissions.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function EvidenceRequestModal({ isOpen, onClose, onRequest, defaultControlId = "" }) {
  const { currentUser, role } = useApp();

  const [form, setForm] = useState({
    controlId: defaultControlId || "A.5.23",
    requirement: "",
    requestedFrom: "Rahul Sharma",
    dueDate: daysFromNow(7),
    priority: "High",
    comment: "",
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.controlId) errs.controlId = "Control is required";
    if (!form.requirement.trim()) errs.requirement = "Requirement title is required";
    if (!form.comment.trim()) errs.comment = "Please provide testing instructions";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    onRequest({
      ...form,
      requestedBy: currentUser?.name || role,
      status: "Pending",
      createdDate: new Date().toISOString(),
      responses: [],
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
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Request Audit Evidence</h3>
              <p className="text-xs text-slate-500">Dispatch an evidence inquiry to the assigned control owner</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="ISO 27001 Control" required error={errors.controlId}>
            <select
              value={form.controlId}
              onChange={(e) => setForm({ ...form, controlId: e.target.value })}
              className={inputCls}
            >
              {CONTROLS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Evidence Required / Document Title" required error={errors.requirement}>
            <input
              type="text"
              value={form.requirement}
              onChange={(e) => setForm({ ...form, requirement: e.target.value })}
              placeholder="e.g. Cloud Security & Shared Responsibility Procedure"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Request From (Assignee)">
              <select
                value={form.requestedFrom}
                onChange={(e) => setForm({ ...form, requestedFrom: e.target.value })}
                className={inputCls}
              >
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
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

          <Field label="Due Date for Submission">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Auditor Instructions / Specific Criteria" required error={errors.comment}>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Please provide the latest approved procedure and technical export demonstrating active compliance..."
              className={inputCls}
            />
          </Field>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              <Send size={13} />
              <span>Dispatch Request</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
