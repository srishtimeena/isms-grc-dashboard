import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { ticketSLA } from "../../utils/sla.js";
import { fmtDate } from "../../utils/date.js";
import { can } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";

export function TicketPanel({ id, onClose }) {
  const { role, tickets, updateTicket } = useApp();
  const t = tickets.find((x) => x.id === id);
  if (!t) return null;

  const sla = ticketSLA(t);
  const [resolution,    setResolution]    = useState(t.resolution    || "");
  const [closureNotes,  setClosureNotes]  = useState(t.closureNotes  || "");
  const canManage = can(role, "manageTicket");
  const isClosed  = ["Resolved", "Closed"].includes(t.status);

  return (
    <SlideOver title={`Ticket ${t.id}`} subtitle={t.title} onClose={onClose}>
      <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
        <Badge tone="Not Applicable">{t.type}</Badge>
        <Badge tone={t.priority}>{t.priority}</Badge>
        <Badge tone={t.status}>{t.status}</Badge>
        <Badge tone={sla.status}>SLA: {sla.status}</Badge>
      </div>

      <div className="pt-2 space-y-0">
        <Detail label="Description" value={t.description} />
        <div className="grid grid-cols-2 gap-2">
          <Detail label="Assignment group" value={t.assignmentGroup} />
          <Detail label="Assigned technician" value={t.assignedTo} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Detail label="Requester" value={t.requester} />
          <Detail label="Impact / Urgency" value={`${t.impact} / ${t.urgency}`} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Detail label="Created" value={fmtDate(t.createdDate)} />
          <Detail label="SLA due" value={fmtDate(sla.due)} />
        </div>
        {sla.status === "Breached" && (
          <Callout tone="red">
            SLA breached — ticket is {Math.abs(sla.hoursLeft)}h overdue. Escalation required.
          </Callout>
        )}
        {t.implementationPlan && <Detail label="Implementation plan" value={t.implementationPlan} />}
        {t.rollbackPlan && <Detail label="Rollback plan" value={t.rollbackPlan} />}
      </div>

      {/* Workflow actions */}
      {canManage && !isClosed && (
        <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ITIL Workflow</div>

          {t.status === "Open" && (
            <Btn size="sm" onClick={() => updateTicket(t.id, { status: "In Progress" })}>
              <ArrowRight size={13} /> Start Work
            </Btn>
          )}

          {t.status === "In Progress" && (
            <>
              <Field label="Resolution notes" required>
                <textarea className={inputCls} rows={3} value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe what was done to resolve the issue…" />
              </Field>
              <Btn size="sm" disabled={!resolution.trim()}
                onClick={() => updateTicket(t.id, { status: "Pending Verification", resolution })}>
                Submit Resolution
              </Btn>
            </>
          )}

          {t.status === "Pending Verification" && can(role, "closeFinding") && (
            <>
              <Callout tone="indigo">Resolution submitted — awaiting auditor verification before closure.</Callout>
              <Detail label="Resolution" value={t.resolution} />
              <Field label="Closure notes (auditor)" required>
                <input className={inputCls} value={closureNotes} onChange={(e) => setClosureNotes(e.target.value)}
                  placeholder="Confirm evidence of resolution was reviewed…" />
              </Field>
              <Btn size="sm" disabled={!closureNotes.trim()}
                onClick={() => updateTicket(t.id, { status: "Closed", closureNotes })}>
                Auditor Verify & Close
              </Btn>
            </>
          )}

          {t.status === "Pending Verification" && !can(role, "closeFinding") && (
            <Callout tone="slate">Awaiting auditor verification. Only Lead Auditor or Administrator can close.</Callout>
          )}
        </div>
      )}

      {isClosed && (
        <div className="border-t border-slate-100 pt-4 mt-2">
          <Detail label="Resolution" value={t.resolution} />
          <Detail label="Closure notes" value={t.closureNotes} />
        </div>
      )}
    </SlideOver>
  );
}
