import { useState } from "react";
import { Plus } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { useApp } from "../../context/AppContext.jsx";

export function TicketInlineForm({ action }) {
  const { createTicket, findings, role } = useApp();
  const finding = findings.find((f) => f.id === action.findingId);
  const [open, setOpen] = useState(false);
  const [t, setT] = useState({
    type:            "Incident",
    title:           action.description.slice(0, 60),
    description:     action.description,
    priority:        action.priority,
    impact:          "Medium",
    urgency:         action.priority,
    assignmentGroup: "IT Operations",
    assignedTo:      "",
    requester:       role,
    slaHours:        72,
    implementationPlan: "",
    rollbackPlan:    "",
    testingPlan:     "",
  });

  const set = (k, v) => setT((prev) => ({ ...prev, [k]: v }));

  if (!open) {
    return (
      <Btn size="sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> Create ITSM Remediation Ticket
      </Btn>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
      <div className="text-xs font-semibold text-slate-600 mb-2">New ITSM Ticket</div>

      <Field label="Ticket type (ITIL workflow)" required>
        <select className={inputCls} value={t.type} onChange={(e) => set("type", e.target.value)}>
          {["Incident", "Service Request", "Change"].map((x) => <option key={x}>{x}</option>)}
        </select>
      </Field>

      <Field label="Title" required>
        <input className={inputCls} value={t.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="Description">
        <textarea className={inputCls} rows={2} value={t.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Priority">
          <select className={inputCls} value={t.priority} onChange={(e) => set("priority", e.target.value)}>
            {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Assignment group" required>
          <input className={inputCls} value={t.assignmentGroup} onChange={(e) => set("assignmentGroup", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Assigned technician" required>
          <input className={inputCls} value={t.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} />
        </Field>
        <Field label="SLA (hours)">
          <input type="number" className={inputCls} value={t.slaHours} onChange={(e) => set("slaHours", Number(e.target.value))} />
        </Field>
      </div>

      {t.type === "Change" && (
        <>
          <Field label="Implementation plan">
            <textarea className={inputCls} rows={2} value={t.implementationPlan} onChange={(e) => set("implementationPlan", e.target.value)} />
          </Field>
          <Field label="Rollback plan">
            <textarea className={inputCls} rows={2} value={t.rollbackPlan} onChange={(e) => set("rollbackPlan", e.target.value)} />
          </Field>
          <Field label="Testing plan">
            <textarea className={inputCls} rows={2} value={t.testingPlan} onChange={(e) => set("testingPlan", e.target.value)} />
          </Field>
        </>
      )}

      <div className="flex gap-2 pt-1">
        <Btn size="sm"
          disabled={!t.assignedTo.trim() || !t.title.trim()}
          onClick={() => {
            createTicket({
              ...t,
              actionId:  action.id,
              findingId: action.findingId,
              controlId: finding?.controlId,
            });
            setOpen(false);
          }}>
          Create Ticket
        </Btn>
        <Btn size="sm" variant="secondary" onClick={() => setOpen(false)}>Cancel</Btn>
      </div>
    </div>
  );
}
