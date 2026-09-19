import { useState } from "react";
import { CheckCircle2, Plus, Edit3, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { CommentsSection } from "../ui/CommentsSection.jsx";
import { RiskInlineForm } from "../forms/RiskInlineForm.jsx";
import { ActionInlineForm } from "../forms/ActionInlineForm.jsx";
import { fmtDate } from "../../utils/date.js";
import { hasPermission, checkSegregationOfDuties } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Observation"];
const STATUSES = ["Open", "Assigned", "In Progress", "Pending Verification", "Resolved", "Closed", "Rejected", "Overdue"];

export function FindingPanel({ id, onClose }) {
  const {
    role,
    currentUser,
    findings,
    risks,
    actions,
    openRisk,
    openAction,
    closeFinding,
    updateFinding,
    addComment,
  } = useApp();

  const f = findings?.find((x) => x.id === id);
  if (!f) return null;

  const risk   = f.riskId   ? risks?.find((r) => r.id === f.riskId)     : null;
  const action = f.actionId ? actions?.find((a) => a.id === f.actionId) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(f.title || "");
  const [severity, setSeverity] = useState(f.severity || "High");
  const [status, setStatus] = useState(f.status || "Open");
  const [owner, setOwner] = useState(f.owner || "");
  const [targetDate, setTargetDate] = useState(f.targetDate || "");
  const [description, setDescription] = useState(f.description || "");
  const [rootCause, setRootCause] = useState(f.rootCause || "");
  const [impact, setImpact] = useState(f.impact || "");
  const [recommendation, setRecommendation] = useState(f.recommendation || "");

  const canEdit = hasPermission(role, "finding", "edit");
  const canClose = hasPermission(role, "finding", "close");
  const canRisk = hasPermission(role, "risk", "create");

  // Segregation of Duties check: Creator cannot close or verify own finding
  const sodCheck = checkSegregationOfDuties(role, "close", f, currentUser?.name);

  const readyToClose = action && ["Completed", "Closed"].includes(action.status);

  const handleSaveEdit = () => {
    updateFinding(f.id, {
      title,
      severity,
      status,
      owner,
      targetDate,
      description,
      rootCause,
      impact,
      recommendation,
    });
    setIsEditing(false);
  };

  const handleReopen = () => {
    updateFinding(f.id, {
      status: "In Progress",
      closedDate: null,
    });
  };

  return (
    <SlideOver
      title={`Finding ${f.id}`}
      subtitle={`${f.type} · Control ${f.controlId}`}
      onClose={onClose}
      width="max-w-xl"
    >
      {/* Header Status Row */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        <Badge tone={f.severity}>{f.severity}</Badge>
        <Badge tone={f.status}>{f.status}</Badge>
        <Badge tone="Not Applicable">{f.type}</Badge>
        <span className="text-[11px] text-slate-400 font-mono">Control: {f.controlId}</span>
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
          <Field label="Finding Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Severity Rating">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={inputCls}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Remediation Owner">
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Target Remediation Date">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Root Cause">
              <input
                type="text"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Business Impact">
              <input
                type="text"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Auditor Recommendation">
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
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
          <Detail label="Title" value={f.title} />
          <Detail label="ISO Control" value={`${f.controlId} — ${f.requirement || ""}`} />
          <Detail label="Description" value={f.description} />
          <Detail label="Objective evidence" value={f.objectiveEvidence || "—"} />
          <Detail label="Risk statement" value={f.risk || "—"} />
          <Detail label="Business impact" value={f.impact || "—"} />
          <Detail label="Root cause" value={f.rootCause || "—"} />
          <Detail label="Recommendation" value={f.recommendation || "—"} />
          <div className="grid grid-cols-2 gap-2">
            <Detail label="Owner" value={f.owner} />
            <Detail label="Target date" value={fmtDate(f.targetDate)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Detail label="Created By" value={`${f.createdBy || "Auditor"} on ${fmtDate(f.createdDate)}`} />
            {f.closedDate && <Detail label="Closed Date" value={fmtDate(f.closedDate)} />}
          </div>
        </div>
      )}

      {/* Linked Risk Record */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Linked Risk Record
        </div>
        {risk ? (
          <button
            onClick={() => {
              onClose();
              openRisk(risk.id);
            }}
            className="w-full text-left border border-slate-200 rounded-lg p-2.5 hover:bg-purple-50/50 hover:border-purple-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-purple-700">{risk.id}</span>
              <span className="text-xs font-semibold text-slate-800 ml-1.5">{risk.title}</span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Score: {risk.inherentScore} · Treatment: {risk.treatment}
              </div>
            </div>
            <ArrowRight size={13} className="text-slate-400" />
          </button>
        ) : canRisk ? (
          showRiskForm ? (
            <RiskInlineForm finding={f} onDone={() => setShowRiskForm(false)} />
          ) : (
            <Btn size="sm" variant="secondary" onClick={() => setShowRiskForm(true)}>
              <Plus size={12} />
              <span>Convert to Risk</span>
            </Btn>
          )
        ) : (
          <span className="text-xs text-slate-400">No linked risk record.</span>
        )}
      </div>

      {/* Corrective Action (CAPA) linkage */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Corrective Action (CAPA)
        </div>
        {action ? (
          <button
            onClick={() => {
              onClose();
              openAction(action.id);
            }}
            className="w-full text-left border border-slate-200 rounded-lg p-2.5 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-indigo-700">{action.id}</span>
              <div className="text-xs text-slate-700 mt-0.5 line-clamp-1">{action.description}</div>
              <div className="text-[11px] text-slate-400">Progress: {action.progress || 0}%</div>
            </div>
            <Badge tone={action.status}>{action.status}</Badge>
          </button>
        ) : risk ? (
          <ActionInlineForm finding={f} risk={risk} />
        ) : (
          <span className="text-xs text-slate-400">Convert to risk first or create CAPA in actions page.</span>
        )}
      </div>

      {/* Closure / Verification Box with Segregation of Duties Check */}
      <div className="border-t border-slate-100 pt-4 mt-2">
        {f.status !== "Closed" && f.status !== "Resolved" ? (
          !sodCheck.allowed ? (
            <Callout tone="amber">{sodCheck.reason}</Callout>
          ) : canClose ? (
            <Btn
              disabled={!readyToClose}
              onClick={() => {
                closeFinding(f.id);
                onClose();
              }}
            >
              <CheckCircle2 size={14} />
              <span>
                {readyToClose
                  ? "Verify Remediation & Authorize Closure"
                  : "Awaiting Action Completion Before Closure"}
              </span>
            </Btn>
          ) : (
            <Callout tone="slate">
              Authorizing finding closure requires Lead Auditor or GRC Administrator role.
            </Callout>
          )
        ) : (
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600">Finding formally closed on {fmtDate(f.closedDate)}.</span>
            {canClose && (
              <Btn size="sm" variant="secondary" onClick={handleReopen}>
                <RotateCcw size={12} />
                <span>Reopen Finding</span>
              </Btn>
            )}
          </div>
        )}
      </div>

      {/* Embedded Collaboration Comments */}
      <CommentsSection
        comments={f.comments || []}
        onAddComment={(txt) => addComment("finding", f.id, txt)}
        title="Audit Finding Discussion"
      />
    </SlideOver>
  );
}
