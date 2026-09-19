import { useState } from "react";
import { Plus } from "lucide-react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

const BLANK = {
  type: "Non-Conformity",
  title: "",
  description: "",
  objectiveEvidence: "",
  risk: "",
  impact: "",
  rootCause: "",
  recommendation: "",
  severity: "Medium",
  owner: "",
  targetDate: daysFromNow(30),
};

export function NewFindingForm({ controlId }) {
  const { createFinding, role } = useApp();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...BLANK, requirement: controlId });

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const isValid = f.title.trim() && f.owner.trim();

  const handleSubmit = () => {
    createFinding({ ...f, controlId });
    setF({ ...BLANK, requirement: controlId });
    setOpen(false);
  };

  if (!open) {
    return (
      <Btn size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Create Finding
      </Btn>
    );
  }

  return (
    <SlideOver title="Create Finding" subtitle={`Linked to control ${controlId}`} onClose={() => setOpen(false)}>
      <Field label="Finding type" required>
        <select className={inputCls} value={f.type} onChange={(e) => set("type", e.target.value)}>
          {["Non-Conformity", "Observation", "Opportunity for Improvement", "Positive Finding"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Title" required>
        <input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)}
          placeholder="Brief, descriptive title for this finding" />
      </Field>

      <Field label="Description">
        <textarea className={inputCls} rows={3} value={f.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe what was observed during the audit…" />
      </Field>

      <Field label="Objective evidence">
        <textarea className={inputCls} rows={2} value={f.objectiveEvidence}
          onChange={(e) => set("objectiveEvidence", e.target.value)}
          placeholder="Reference to the specific evidence reviewed" />
      </Field>

      <Field label="Risk statement">
        <input className={inputCls} value={f.risk} onChange={(e) => set("risk", e.target.value)}
          placeholder="Risk to the organisation if not remediated" />
      </Field>

      <Field label="Business impact">
        <input className={inputCls} value={f.impact} onChange={(e) => set("impact", e.target.value)} />
      </Field>

      <Field label="Root cause">
        <input className={inputCls} value={f.rootCause} onChange={(e) => set("rootCause", e.target.value)} />
      </Field>

      <Field label="Recommendation">
        <input className={inputCls} value={f.recommendation} onChange={(e) => set("recommendation", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Severity" required>
          <select className={inputCls} value={f.severity} onChange={(e) => set("severity", e.target.value)}>
            {["Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Target remediation date">
          <input type="date" className={inputCls} value={f.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
        </Field>
      </div>

      <Field label="Owner" required
        hint={["Critical", "High"].includes(f.severity) ? "Required for Critical/High severity." : undefined}>
        <input className={inputCls} value={f.owner} onChange={(e) => set("owner", e.target.value)}
          placeholder="Name or team responsible for remediation" />
      </Field>

      <div className="pt-2 flex gap-2">
        <Btn disabled={!isValid} onClick={handleSubmit}>Create Finding</Btn>
        <Btn variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
      </div>
    </SlideOver>
  );
}
