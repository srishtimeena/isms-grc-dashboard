import { useState } from "react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { CommentsSection } from "../ui/CommentsSection.jsx";
import { TicketInlineForm } from "../forms/TicketInlineForm.jsx";
import { fmtDate, iso, NOW, relDays } from "../../utils/date.js";
import { hasPermission } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";
import { Edit3, CheckCircle2, Sliders, ArrowRight } from "lucide-react";

export function ActionPanel({ id, onClose }) {
  const {
    role,
    currentUser,
    actions,
    tickets,
    openTicket,
    completeAction,
    updateAction,
    addComment,
  } = useApp();

  const a = actions?.find((x) => x.id === id);
  if (!a) return null;

  const ticket = a.ticketId ? tickets?.find((t) => t.id === a.ticketId) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(a.progress ?? (a.status === "Completed" ? 100 : 50));
  const [completionEvidence, setCompletionEvidence] = useState(a.completionEvidence || "");
  const [owner, setOwner] = useState(a.owner || "");
  const [priority, setPriority] = useState(a.priority || "High");
  const [targetDate, setTargetDate] = useState(a.targetDate || "");
  const [status, setStatus] = useState(a.status || "In Progress");

  const canEdit = hasPermission(role, "action", "edit");
  const canVerify = hasPermission(role, "action", "verify");
  const ticketDone = !ticket || ["Resolved", "Closed"].includes(ticket.status);
  const isDone = ["Completed", "Closed"].includes(a.status);

  const handleSaveEdit = () => {
    updateAction(a.id, {
      progress: Number(progress),
      owner,
      priority,
      targetDate,
      status,
      completionEvidence,
    });
    setIsEditing(false);
  };

  const handleComplete = () => {
    completeAction(a.id, {
      status: "Completed",
      progress: 100,
      completionDate: iso(NOW),
      completionEvidence,
      verificationStatus: "Pending",
      auditorApproval: false,
    });
  };

  const handleVerify = () => {
    updateAction(a.id, {
      verificationStatus: "Verified",
      auditorApproval: true,
      status: "Closed",
      closureDate: iso(NOW),
      verifier: currentUser?.name || role,
    });
  };

  return (
    <SlideOver
      title={`Corrective Action ${a.id}`}
      subtitle={a.description.slice(0, 50)}
      onClose={onClose}
      width="max-w-xl"
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        <Badge tone={a.status}>{a.status}</Badge>
        <Badge tone={a.priority}>{a.priority}</Badge>
        <Badge tone={a.verificationStatus}>{a.verificationStatus}</Badge>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
          Progress: {a.progress ?? (isDone ? 100 : 50)}%
        </span>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Edit Form OR View Details */}
      {isEditing ? (
        <div className="pt-3 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Remediation Progress:</span>
              <span className="font-bold text-indigo-600 text-sm">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputCls}
              >
                {["Critical", "High", "Medium", "Low"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Date">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                {["Open", "In Progress", "Blocked", "Pending Verification", "Completed", "Closed", "Overdue"].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Completion Evidence / Notes">
            <textarea
              rows={2}
              value={completionEvidence}
              onChange={(e) => setCompletionEvidence(e.target.value)}
              placeholder="Describe evidence or artifacts validating completion..."
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Btn size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Btn>
            <Btn size="sm" variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Btn>
          </div>
        </div>
      ) : (
        <div className="pt-2 space-y-0 text-xs">
          <Detail label="Action Description" value={a.description} />
          <Detail label="Root Cause Addressed" value={a.rootCause} />
          <div className="grid grid-cols-2 gap-2">
            <Detail label="Owner" value={a.owner} />
            <Detail label="Target Date" value={fmtDate(a.targetDate)} />
          </div>
          <Detail label="Timeline Status" value={relDays(a.targetDate)} />
          {a.completionEvidence && <Detail label="Completion Evidence" value={a.completionEvidence} />}
          {a.completionDate && <Detail label="Completed On" value={fmtDate(a.completionDate)} />}
          {a.verifier && <Detail label="Verified By" value={a.verifier} />}
        </div>
      )}

      {/* ITSM ticket linkage */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Linked ITSM Remediation Ticket
        </div>
        {ticket ? (
          <button
            onClick={() => {
              onClose();
              openTicket(ticket.id);
            }}
            className="w-full text-left border border-slate-200 rounded-lg p-2.5 hover:bg-indigo-50 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600">{ticket.id}</span>
              <div className="text-xs text-slate-800 font-medium truncate">{ticket.title}</div>
            </div>
            <Badge tone={ticket.status}>{ticket.status}</Badge>
          </button>
        ) : hasPermission(role, "ticket", "create") ? (
          <TicketInlineForm action={a} />
        ) : (
          <span className="text-xs text-slate-400">No linked ITSM ticket.</span>
        )}
      </div>

      {/* Completion & Verification Workflow */}
      <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
        {!isDone && canEdit && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Submit Remediation for Auditor Review
            </div>
            <Field label="Completion Evidence Reference (Required)">
              <input
                className={inputCls}
                value={completionEvidence}
                onChange={(e) => setCompletionEvidence(e.target.value)}
                placeholder="e.g. Countersigned contract EV-007 on file in registry"
              />
            </Field>
            {!ticketDone && (
              <Callout tone="amber">
                Linked ITSM ticket must be resolved before closing this corrective action.
              </Callout>
            )}
            <Btn
              size="sm"
              disabled={!completionEvidence.trim() || !ticketDone}
              onClick={handleComplete}
            >
              <CheckCircle2 size={13} />
              <span>Submit for Verification</span>
            </Btn>
          </div>
        )}

        {a.status === "Completed" && a.verificationStatus !== "Verified" && canVerify && (
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 space-y-2">
            <div className="font-semibold text-indigo-900 text-xs">Auditor Verification & Sign-off</div>
            <p className="text-slate-600 text-xs">
              Remediation submitted by {a.owner}. Confirm evidence meets audit objectives and authorize closure.
            </p>
            <Btn size="sm" variant="primary" onClick={handleVerify}>
              <CheckCircle2 size={13} />
              <span>Verify & Close Corrective Action</span>
            </Btn>
          </div>
        )}
      </div>

      {/* Embedded Collaboration Comments */}
      <CommentsSection
        comments={a.comments || []}
        onAddComment={(txt) => addComment("action", a.id, txt)}
        title="Action Remediation Thread"
      />
    </SlideOver>
  );
}
