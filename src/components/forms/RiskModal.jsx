import { useState } from "react";
import { X, ShieldAlert, AlertTriangle } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { CONTROLS } from "../../constants/iso27001.js";
import { RISK_CATEGORY } from "../../constants/statusStyles.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function RiskModal({ isOpen, onClose, onSave, defaultFinding = null }) {
  const { currentUser, role } = useApp();

  const [form, setForm] = useState({
    title: defaultFinding?.title || "",
    description: defaultFinding?.risk || defaultFinding?.description || "",
    asset: "",
    threat: "",
    vulnerability: "",
    likelihood: 3,
    impact: 3,
    existingControls: "",
    residualScore: 6,
    owner: defaultFinding?.owner || currentUser?.name || "",
    controlId: defaultFinding?.controlId || "A.8.2",
    treatment: "Mitigate",
    treatmentPlan: "",
    targetDate: daysFromNow(30),
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inherentScore = Number(form.likelihood) * Number(form.impact);
  const inherentCat = RISK_CATEGORY(inherentScore);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Risk title is required";
    if (!form.asset.trim()) errs.asset = "Asset at risk is required";
    if (!form.owner.trim()) errs.owner = "Risk owner is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;
    onSave({
      ...form,
      inherentScore,
      status: "Treatment In Progress",
      findingId: defaultFinding?.id || null,
      approver: "",
      comments: [],
      history: [
        { date: new Date().toISOString(), user: currentUser?.name || role, action: "Registered initial risk" },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Register Enterprise Risk</h3>
              <p className="text-xs text-slate-500">Document threat, vulnerability, likelihood, and mitigation plan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <Field label="Risk Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Unprotected endpoints vulnerable to malware"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Asset at Risk" required error={errors.asset}>
              <input
                type="text"
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                placeholder="e.g. Sales Laptops / AWS Infrastructure"
                className={inputCls}
              />
            </Field>

            <Field label="Linked ISO Control">
              <select
                value={form.controlId}
                onChange={(e) => setForm({ ...form, controlId: e.target.value })}
                className={inputCls}
              >
                {CONTROLS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Risk Description & Scenario">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what adverse event could transpire..."
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Threat Source">
              <input
                type="text"
                value={form.threat}
                onChange={(e) => setForm({ ...form, threat: e.target.value })}
                placeholder="e.g. External Ransomware Operator"
                className={inputCls}
              />
            </Field>
            <Field label="Vulnerability Exploited">
              <input
                type="text"
                value={form.vulnerability}
                onChange={(e) => setForm({ ...form, vulnerability: e.target.value })}
                placeholder="e.g. Missing EDR agent on endpoints"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Scoring Grid */}
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Likelihood (1 to 5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.likelihood}
                  onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="Impact (1 to 5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <span className="text-slate-600">Calculated Inherent Risk Score:</span>
              <span className="text-sm font-bold text-purple-900">
                {inherentScore} ({inherentCat})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Treatment Strategy">
              <select
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                className={inputCls}
              >
                {["Mitigate", "Accept", "Transfer", "Avoid"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Risk Owner" required error={errors.owner}>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Treatment Plan / Mitigation Details">
            <textarea
              rows={2}
              value={form.treatmentPlan}
              onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })}
              placeholder="Outline specific controls or corrective actions to reduce residual risk..."
              className={inputCls}
            />
          </Field>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              <ShieldAlert size={13} />
              <span>Register Risk</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
