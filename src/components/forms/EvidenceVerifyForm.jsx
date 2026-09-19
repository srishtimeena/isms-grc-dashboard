import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";

export function EvidenceVerifyForm({ evidence, onSubmit }) {
  const [status, setStatus] = useState("Verified");
  const [notes,  setNotes]  = useState("");

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Record Verification</div>
      <div className="grid grid-cols-3 gap-2 items-end">
        <Field label="Outcome">
          <select
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["Verified", "Partially Verified", "Not Verified", "Not Available"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Auditor notes">
            <input
              className={inputCls}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what was reviewed and any gaps found…"
            />
          </Field>
        </div>
      </div>
      <Btn size="sm" onClick={() => onSubmit(status, notes)}>
        <ClipboardCheck size={13} /> Save Verification
      </Btn>
    </div>
  );
}
