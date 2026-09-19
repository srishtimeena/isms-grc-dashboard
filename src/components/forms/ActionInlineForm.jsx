import { useState } from "react";
import { Plus } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function ActionInlineForm({ finding, risk }) {
  const { createAction } = useApp();
  const [open, setOpen] = useState(false);
  const [a, setA] = useState({
    description: finding?.recommendation || "",
    rootCause:   finding?.rootCause || "",
    owner:       finding?.owner || "",
    priority:    finding?.severity || "Medium",
    targetDate:  daysFromNow(21),
  });

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }));

  if (!open) {
    return (
      <Btn size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Create Corrective Action
      </Btn>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
      <div className="text-xs font-semibold text-slate-600 mb-2">New Corrective Action</div>

      <Field label="Action description" required>
        <textarea className={inputCls} rows={2} value={a.description}
          onChange={(e) => set("description", e.target.value)} />
      </Field>

      <Field label="Root cause">
        <input className={inputCls} value={a.rootCause} onChange={(e) => set("rootCause", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Owner" required>
          <input className={inputCls} value={a.owner} onChange={(e) => set("owner", e.target.value)} />
        </Field>
        <Field label="Priority">
          <select className={inputCls} value={a.priority} onChange={(e) => set("priority", e.target.value)}>
            {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Target date">
        <input type="date" className={inputCls} value={a.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
      </Field>

      <div className="flex gap-2 pt-1">
        <Btn size="sm"
          disabled={!a.description.trim() || !a.owner.trim()}
          onClick={() => {
            createAction({ ...a, findingId: finding?.id, riskId: risk?.id ?? null });
            setOpen(false);
          }}>
          Create Action
        </Btn>
        <Btn size="sm" variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
      </div>
    </div>
  );
}
