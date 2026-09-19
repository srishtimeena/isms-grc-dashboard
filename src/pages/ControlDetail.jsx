import { useState } from "react";
import { ArrowLeft, CheckCircle2, UploadCloud, Send, ShieldCheck, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { AUDIT_QUESTIONS } from "../constants/iso27001.js";
import { hasPermission, checkSegregationOfDuties } from "../constants/permissions.js";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Detail } from "../components/ui/Detail.jsx";
import { Field, inputCls } from "../components/ui/Field.jsx";
import { CommentsSection } from "../components/ui/CommentsSection.jsx";
import { EvidenceVerifyForm } from "../components/forms/EvidenceVerifyForm.jsx";
import { NewFindingForm } from "../components/forms/NewFindingForm.jsx";
import { EvidenceUploadModal } from "../components/forms/EvidenceUploadModal.jsx";
import { EvidenceRequestModal } from "../components/forms/EvidenceRequestModal.jsx";
import { fmtDate } from "../utils/date.js";

const SUGGESTED_SCORE = {
  Compliant: 100,
  "Partially Compliant": 50,
  "Non-Compliant": 0,
  "Not Applicable": null,
};

const MATURITY_LEVELS = [
  { level: 1, name: "Level 1: Initial (Ad-hoc)" },
  { level: 2, name: "Level 2: Repeatable (Informal)" },
  { level: 3, name: "Level 3: Defined (Documented SOPs)" },
  { level: 4, name: "Level 4: Managed & Measured (Metrics)" },
  { level: 5, name: "Level 5: Optimizing (Continuous Improvement)" },
];

export function ControlDetail({ control, onBack }) {
  const {
    role,
    currentUser,
    assessments,
    evidence,
    findings,
    openFinding,
    verifyEvidence,
    assessControl,
    uploadEvidence,
    createEvidenceRequest,
    addComment,
  } = useApp();

  const a   = assessments[control.id];
  const ev  = evidence.filter((e) => e.controlId === control.id);
  const rel = findings.filter((f) => f.controlId === control.id);

  const [form, setForm] = useState({
    status:                a?.status || "Not Assessed",
    implementationStatus:  a?.implementationStatus || "Implemented",
    maturityLevel:         a?.maturityLevel ?? 3,
    assessmentStatus:      a?.assessmentStatus || "Draft",
    effectiveness:         a?.effectiveness || "Effective",
    scoreOverride:         false,
    score:                 a?.score ?? 100,
    comments:              a?.comments || "",
    overrideJustification: a?.overrideJustification || "",
    observations:          a?.observations || "",
    gaps:                  a?.gaps || "",
    recommendations:       a?.recommendations || "",
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canAssess  = hasPermission(role, "control", "assess");
  const canFinding = hasPermission(role, "finding", "create");
  const canVerify  = hasPermission(role, "evidence", "verify");
  const canRequest = hasPermission(role, "evidence", "request");
  const canUpload  = hasPermission(role, "evidence", "upload");

  // SoD: Assessor cannot approve their own assessment
  const sodCheck = checkSegregationOfDuties(role, "approveAssessment", a, currentUser?.name);

  const handleAssess = () => {
    const score = form.status === "Not Applicable"
      ? null
      : form.scoreOverride ? Number(form.score) : SUGGESTED_SCORE[form.status];

    assessControl(control.id, {
      status: form.status,
      score,
      implementationStatus: form.implementationStatus,
      maturityLevel: Number(form.maturityLevel),
      assessmentStatus: form.assessmentStatus,
      effectiveness: form.effectiveness,
      comments: form.comments,
      overrideJustification: form.scoreOverride ? form.overrideJustification : "",
      observations: form.observations,
      gaps: form.gaps,
      recommendations: form.recommendations,
      assessor: currentUser?.name || role,
    });
  };

  return (
    <div className="max-w-[1000px] space-y-5 fade-in pb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
      >
        <ArrowLeft size={15} /> Back to control library
      </button>

      {/* Header */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{control.domainName}</div>
        <h1 className="text-xl font-bold text-slate-900">{control.id} — {control.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge tone={a?.status ?? "Not Assessed"}>{a?.status ?? "Not Assessed"}</Badge>
          <Badge tone={a?.implementationStatus ?? "Implemented"}>{a?.implementationStatus ?? "Implemented"}</Badge>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Maturity: Level {a?.maturityLevel ?? 3}
          </span>
          {a?.score != null && (
            <span className="text-xs font-semibold text-slate-600">Score: <strong>{a.score}%</strong></span>
          )}
          {a?.auditor && (
            <span className="text-xs text-slate-400">· Assessed by {a.auditor} on {fmtDate(a.date)}</span>
          )}
        </div>
      </div>

      {/* Audit information */}
      <Card className="p-4 space-y-2">
        <SectionTitle>Audit Information & Standard Objective</SectionTitle>
        <Detail
          label="Audit Objective"
          value={`Confirm that ${control.title.toLowerCase()} is established, operating effectively, and supported by objective evidence in accordance with ISO/IEC 27001:2022.`}
        />
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 mt-2">Core Audit Questions</div>
        <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mb-2">
          {AUDIT_QUESTIONS(control).map((q, i) => <li key={i}>{q}</li>)}
        </ul>
        <Detail
          label="Expected Evidence"
          value="Policy/procedure documentation, technical configuration exports, SIEM logs, review minutes, or automated tickets."
        />
      </Card>

      {/* Evidence Section with Upload & Request triggers */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle sub="Objective evidence records verifying the operational effectiveness of this control.">
            Objective Evidence Records ({ev.length})
          </SectionTitle>
          <div className="flex items-center gap-2">
            {canRequest && (
              <Btn size="sm" variant="secondary" onClick={() => setIsRequestOpen(true)}>
                <Send size={12} />
                <span>Request Evidence</span>
              </Btn>
            )}
            {canUpload && (
              <Btn size="sm" variant="primary" onClick={() => setIsUploadOpen(true)}>
                <UploadCloud size={12} />
                <span>Upload Evidence</span>
              </Btn>
            )}
          </div>
        </div>

        {ev.length === 0 ? (
          <Callout>No evidence submitted yet for this control. Click &ldquo;Request Evidence&rdquo; to notify the control owner.</Callout>
        ) : (
          <div className="space-y-2.5">
            {ev.map((e) => (
              <div key={e.id} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700">{e.id}</span>
                      <span className="text-xs font-semibold text-slate-800">{e.name || e.description}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {e.type} · Submitted by {e.uploadedBy || e.owner} on {fmtDate(e.uploadDate || e.submissionDate)}
                    </div>
                  </div>
                  <Badge tone={e.status || e.verificationStatus}>{e.status || e.verificationStatus}</Badge>
                </div>
                {e.verificationNotes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong>Auditor Notes:</strong> {e.verificationNotes}
                  </div>
                )}
                {canVerify && e.verificationStatus !== "Verified" && e.status !== "Accepted" && (
                  <EvidenceVerifyForm evidence={e} onSubmit={(status, notes) => verifyEvidence(e.id, status, notes)} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Formal Assessment & Evaluation Form */}
      <Card className="p-4 space-y-3">
        <SectionTitle sub="Assess control effectiveness, assign maturity rating, and document observations.">
          Control Assessment & Evaluation
        </SectionTitle>

        {!canAssess ? (
          <Callout tone="amber">Your current role ({role}) has read-only access to control assessments.</Callout>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Assessment Status" required>
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {["Compliant", "Partially Compliant", "Non-Compliant", "Not Applicable"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Implementation Status">
                <select className={inputCls} value={form.implementationStatus} onChange={(e) => set("implementationStatus", e.target.value)}>
                  {["Implemented", "Partially Implemented", "Not Implemented", "Needs Improvement", "Not Applicable"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Maturity Level (1–5)">
                <select className={inputCls} value={form.maturityLevel} onChange={(e) => set("maturityLevel", Number(e.target.value))}>
                  {MATURITY_LEVELS.map((m) => (
                    <option key={m.level} value={m.level}>{m.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Operating Effectiveness">
                <select className={inputCls} value={form.effectiveness} onChange={(e) => set("effectiveness", e.target.value)}>
                  {["Effective", "Partially Effective", "Ineffective", "N/A"].map((eff) => (
                    <option key={eff} value={eff}>{eff}</option>
                  ))}
                </select>
              </Field>

              <Field label="Assessment Lifecycle Workflow">
                <select className={inputCls} value={form.assessmentStatus} onChange={(e) => set("assessmentStatus", e.target.value)}>
                  {["Draft", "Submitted", "Under Review", "Approved"].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Audit Observations & Testing Notes">
              <textarea
                className={inputCls}
                rows={2}
                value={form.observations}
                onChange={(e) => set("observations", e.target.value)}
                placeholder="Describe testing methodology, sample size, and observations..."
              />
            </Field>

            {(form.status === "Partially Compliant" || form.status === "Non-Compliant") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Identified Gaps">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.gaps}
                    onChange={(e) => set("gaps", e.target.value)}
                    placeholder="Specific control gaps identified..."
                  />
                </Field>
                <Field label="Audit Recommendations">
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={form.recommendations}
                    onChange={(e) => set("recommendations", e.target.value)}
                    placeholder="Recommended remediation actions..."
                  />
                </Field>
              </div>
            )}

            {!sodCheck.allowed && form.assessmentStatus === "Approved" && (
              <Callout tone="amber">{sodCheck.reason}</Callout>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <Btn onClick={handleAssess} variant="primary">
                <CheckCircle2 size={14} />
                <span>Save Assessment Record</span>
              </Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Findings Section */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle sub="Non-conformities and observations raised against this control.">
            Linked Findings ({rel.length})
          </SectionTitle>
          {canFinding && (
            <NewFindingForm controlId={control.id} />
          )}
        </div>

        {rel.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">No findings raised for this control.</div>
        ) : (
          <div className="space-y-2">
            {rel.map((f) => (
              <button
                key={f.id}
                onClick={() => openFinding(f.id)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{f.id} — {f.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{f.type} · Target: {fmtDate(f.targetDate)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={f.severity}>{f.severity}</Badge>
                  <Badge tone={f.status}>{f.status}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <EvidenceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultControlId={control.id}
        onUpload={(data) => uploadEvidence(data)}
      />

      <EvidenceRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        defaultControlId={control.id}
        onRequest={(data) => createEvidenceRequest(data)}
      />
    </div>
  );
}
