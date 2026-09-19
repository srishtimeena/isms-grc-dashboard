import { useState } from "react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { Field, inputCls } from "../ui/Field.jsx";
import { CommentsSection } from "../ui/CommentsSection.jsx";
import { ActionInlineForm } from "../forms/ActionInlineForm.jsx";
import { RISK_CATEGORY } from "../../constants/statusStyles.js";
import { fmtDate } from "../../utils/date.js";
import { hasPermission } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";
import { ShieldAlert, Plus, CheckCircle2, RotateCcw, Edit3, ArrowRight } from "lucide-react";

const TREATMENT_LABEL = {
  Mitigate: "Mitigation plan (corrective action required)",
  Accept:   "Acceptance justification",
  Transfer: "Third-party / insurance transfer details",
  Avoid:    "Risk avoidance strategy",
};

export function RiskPanel({ id, onClose }) {
  const {
    role,
    currentUser,
    risks,
    actions,
    findings,
    openAction,
    openFinding,
    updateRisk,
    addComment,
  } = useApp();

  const r = risks?.find((x) => x.id === id);
  if (!r) return null;

  const action  = r.actionId  ? actions?.find((a) => a.id === r.actionId)  : null;
  const finding = r.findingId ? findings?.find((f) => f.id === r.findingId): null;

  const [isEditing, setIsEditing] = useState(false);
  const [likelihood, setLikelihood] = useState(r.likelihood || 3);
  const [impact, setImpact] = useState(r.impact || 3);
  const [residualScore, setResidualScore] = useState(r.residualScore || 6);
  const [owner, setOwner] = useState(r.owner || "");
  const [treatment, setTreatment] = useState(r.treatment || "Mitigate");
  const [treatmentPlan, setTreatmentPlan] = useState(r.treatmentPlan || r.treatmentDetail || "");
  const [approver, setApprover] = useState(r.approver || "");

  const canManage = hasPermission(role, "risk", "edit") || hasPermission(role, "risk", "treat");
  const canClose = hasPermission(role, "risk", "close");

  const inherentScore = Number(likelihood) * Number(impact);
  const inherentCat = RISK_CATEGORY(inherentScore);

  const handleSaveRisk = () => {
    updateRisk(r.id, {
      likelihood: Number(likelihood),
      impact: Number(impact),
      inherentScore,
      residualScore: Number(residualScore),
      owner,
      treatment,
      treatmentPlan,
      approver,
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    updateRisk(r.id, {
      status: newStatus,
      ...(newStatus === "Closed" ? { closedDate: new Date().toISOString() } : {}),
    });
  };

  return (
    <SlideOver
      title={`Risk ${r.id}`}
      subtitle={r.title}
      onClose={onClose}
      width="max-w-xl"
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        <Badge tone={inherentCat}>{inherentCat}</Badge>
        <Badge tone={r.status === "Closed" ? "Closed" : r.status === "Treatment Overdue" ? "Overdue" : "In Progress"}>
          {r.status}
        </Badge>
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          Inherent: {inherentScore}
        </span>
        {r.residualScore != null && (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Residual: {r.residualScore} ({RISK_CATEGORY(r.residualScore)})
          </span>
        )}
        {canManage && !isEditing && (
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
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
            <div className="font-semibold text-purple-900">Edit Risk Scoring (5×5)</div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Likelihood (1–5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={likelihood}
                  onChange={(e) => setLikelihood(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Impact (1–5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Target Residual Score">
              <input
                type="number"
                min={1}
                max={25}
                value={residualScore}
                onChange={(e) => setResidualScore(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Risk Owner">
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Treatment Strategy">
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className={inputCls}
            >
              {["Mitigate", "Accept", "Transfer", "Avoid"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label={TREATMENT_LABEL[treatment] || "Treatment Plan"}>
            <textarea
              rows={2}
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className={inputCls}
            />
          </Field>

          {treatment === "Accept" && (
            <Field label="Management Sign-off / Approver">
              <input
                type="text"
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                placeholder="Name of approving executive"
                className={inputCls}
              />
            </Field>
          )}

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
            <Btn size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Btn>
            <Btn size="sm" variant="primary" onClick={handleSaveRisk}>
              Save Changes
            </Btn>
          </div>
        </div>
      ) : (
        <div className="pt-2 space-y-0 text-xs">
          <Detail label="Description" value={r.description} />
          <div className="grid grid-cols-2 gap-2">
            <Detail label="Asset at Risk" value={r.asset} />
            <Detail label="Risk Owner" value={r.owner} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Detail label="Threat Source" value={r.threat} />
            <Detail label="Vulnerability" value={r.vulnerability} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Detail label="Likelihood" value={r.likelihood} />
            <Detail label="Impact" value={r.impact} />
            <Detail label="Inherent Score" value={`${inherentScore} (${inherentCat})`} />
          </div>
          <Detail label="Existing Controls" value={r.existingControls || "Standard baseline security policies"} />
          <Detail label="Target Date" value={fmtDate(r.targetDate)} />
        </div>
      )}

      {/* Linked Finding Card */}
      {finding && (
        <div className="border-t border-slate-100 pt-3 mt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Originating Audit Finding
          </div>
          <button
            onClick={() => {
              onClose();
              openFinding(finding.id);
            }}
            className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-orange-50/50 hover:border-orange-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-orange-600">{finding.id}</span>
              <span className="text-xs font-semibold text-slate-800 ml-1.5">{finding.title}</span>
            </div>
            <ArrowRight size={13} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Risk Treatment & CAPA Linkage */}
      <div className="border-t border-slate-100 pt-3 mt-2 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Treatment & Corrective Action
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Strategy: {r.treatment}</span>
            <Badge tone="Not Applicable">{r.treatment}</Badge>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {r.treatmentPlan || r.treatmentDetail || "No specific treatment plan recorded yet."}
          </p>
          {r.approver && (
            <div className="text-[10px] text-slate-400 pt-1">
              Management Sign-off: <strong className="text-slate-600">{r.approver}</strong>
            </div>
          )}
        </div>

        {/* Linked Action */}
        {action ? (
          <button
            onClick={() => {
              onClose();
              openAction(action.id);
            }}
            className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600">{action.id}</span>
              <div className="text-xs text-slate-700 line-clamp-1">{action.description}</div>
            </div>
            <Badge tone={action.status}>{action.status}</Badge>
          </button>
        ) : r.treatment === "Mitigate" && canManage ? (
          <ActionInlineForm finding={finding} risk={r} />
        ) : null}
      </div>

      {/* Risk Closure & Reopen Actions */}
      <div className="border-t border-slate-100 pt-3 mt-2 flex items-center gap-2">
        {r.status !== "Closed" ? (
          canClose && (
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange("Closed")}
            >
              <CheckCircle2 size={13} />
              <span>Close Risk Record</span>
            </Btn>
          )
        ) : (
          canClose && (
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => handleStatusChange("Treatment In Progress")}
            >
              <RotateCcw size={13} />
              <span>Reopen Risk</span>
            </Btn>
          )
        )}
      </div>

      {/* Embedded Collaboration Comments */}
      <CommentsSection
        comments={r.comments || []}
        onAddComment={(txt) => addComment("risk", r.id, txt)}
        title="Risk Assessment Discussion"
      />
    </SlideOver>
  );
}
