import { useState, useEffect } from "react";
import { X, Shield, FileText, Check } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { CONTROLS } from "../../constants/iso27001.js";
import { daysFromNow } from "../../utils/date.js";

const POLICY_TYPES = [
  "Master Policy",
  "Governance Policy",
  "Operational Policy",
  "Technical Standard",
  "Standard Operating Procedure",
  "Guideline",
];

const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"];

export function PolicyModal({ isOpen, onClose, onSave, policy = null }) {
  const isEdit = !!policy;

  const [form, setForm] = useState({
    name: "",
    type: "Operational Policy",
    version: "1.0",
    owner: "",
    department: "Information Security",
    effectiveDate: daysFromNow(0),
    reviewDate: daysFromNow(365),
    status: "Draft",
    classification: "Internal",
    applicableFramework: "ISO/IEC 27001:2022",
    relatedControlIds: [],
    content: "",
    documentName: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (policy) {
      setForm({
        name: policy.name || "",
        type: policy.type || "Operational Policy",
        version: policy.version || "1.0",
        owner: policy.owner || "",
        department: policy.department || "Information Security",
        effectiveDate: policy.effectiveDate || daysFromNow(0),
        reviewDate: policy.reviewDate || daysFromNow(365),
        status: policy.status || "Draft",
        classification: policy.classification || "Internal",
        applicableFramework: policy.applicableFramework || "ISO/IEC 27001:2022",
        relatedControlIds: policy.relatedControlIds || [],
        content: policy.content || "",
        documentName: policy.documentName || "",
      });
    } else {
      setForm({
        name: "",
        type: "Operational Policy",
        version: "1.0",
        owner: "",
        department: "Information Security",
        effectiveDate: daysFromNow(0),
        reviewDate: daysFromNow(365),
        status: "Draft",
        classification: "Internal",
        applicableFramework: "ISO/IEC 27001:2022",
        relatedControlIds: [],
        content: "",
        documentName: "",
      });
    }
    setErrors({});
  }, [policy, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Policy name is required";
    if (!form.owner.trim()) errs.owner = "Policy owner is required";
    if (!form.department.trim()) errs.department = "Department is required";
    if (form.reviewDate && form.effectiveDate && form.reviewDate <= form.effectiveDate) {
      errs.reviewDate = "Review date must be after effective date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;
    onSave({
      ...form,
      documentName: form.documentName || `${form.name.replace(/\s+/g, "_")}_v${form.version}.pdf`,
    });
    onClose();
  };

  const toggleControl = (controlId) => {
    setForm((prev) => {
      const exists = prev.relatedControlIds.includes(controlId);
      return {
        ...prev,
        relatedControlIds: exists
          ? prev.relatedControlIds.filter((id) => id !== controlId)
          : [...prev.relatedControlIds, controlId],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEdit ? `Edit Policy ${policy.id}` : "Draft New ISMS Policy"}
              </h3>
              <p className="text-xs text-slate-500">
                Define policy governance, ownership, lifecycle dates, and ISO 27001 mappings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="Policy Name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cryptographic Controls & Key Management Standard"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Policy Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                {POLICY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Classification">
              <select
                value={form.classification}
                onChange={(e) => setForm({ ...form, classification: e.target.value })}
                className={inputCls}
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Policy Owner" required error={errors.owner}>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className={inputCls}
              />
            </Field>

            <Field label="Department" required error={errors.department}>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Cloud Platform"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Version">
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="1.0"
                className={inputCls}
              />
            </Field>

            <Field label="Effective Date">
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Review Due Date" error={errors.reviewDate}>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Applicable Framework / Standard Reference">
            <input
              type="text"
              value={form.applicableFramework}
              onChange={(e) => setForm({ ...form, applicableFramework: e.target.value })}
              placeholder="e.g. ISO/IEC 27001:2022 Clause 5.2, A.5.1"
              className={inputCls}
            />
          </Field>

          <Field label="Policy Summary / Purpose">
            <textarea
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="State the core objective, organizational scope, and enforcement guidelines..."
              className={inputCls}
            />
          </Field>

          {/* Related Controls Multi-Select Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Related ISO 27001 Annex A Controls (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {CONTROLS.slice(0, 30).map((c) => {
                const isSelected = form.relatedControlIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleControl(c.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span>{c.id}</span>
                    {isSelected && <Check size={10} />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {form.relatedControlIds.length} control{form.relatedControlIds.length === 1 ? "" : "s"} linked
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              {isEdit ? "Save Policy Changes" : "Create Policy Record"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
