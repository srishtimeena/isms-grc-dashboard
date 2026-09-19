import { useState } from "react";
import { CheckCircle2, Circle, GitBranch, ArrowRight, ShieldCheck, FileText, AlertTriangle, ShieldAlert, ListChecks, TicketIcon, FileSearch } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Card } from "../components/ui/Card.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Field, inputCls } from "../components/ui/Field.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { fmtDate } from "../utils/date.js";
import { CONTROLS } from "../constants/iso27001.js";

const STEPS = [
  { label: "ISO Control",        key: "control"    },
  { label: "Audit",              key: "audit"      },
  { label: "Assessment",         key: "assessment" },
  { label: "Evidence",           key: "evidence"   },
  { label: "Finding",            key: "finding"    },
  { label: "Risk Record",        key: "risk"       },
  { label: "Corrective Action",  key: "action"     },
  { label: "ITSM Ticket",        key: "ticket"     },
  { label: "Resolution Evidence",key: "resolution" },
  { label: "Verification",       key: "closure"    },
  { label: "Closure",            key: "closed"     },
];

export function Traceability() {
  const {
    findings,
    risks,
    actions,
    tickets,
    evidence,
    assessments,
    policies,
    openFinding,
    openRisk,
    openAction,
    openTicket,
    openPolicy,
    openEvidence,
  } = useApp();

  const [activeTab, setActiveTab] = useState("mapping"); // 'mapping' | 'finding'
  const [findingId, setFindingId] = useState(findings?.[0]?.id || "");
  const [selectedControlId, setSelectedControl] = useState("A.5.23");

  /* Tab 1: Finding Trace Data */
  const f      = findings?.find((x) => x.id === findingId);
  const risk   = f?.riskId   ? risks?.find((r) => r.id === f.riskId)    : null;
  const action = f?.actionId ? actions?.find((a) => a.id === f.actionId): null;
  const ticket = action?.ticketId ? tickets?.find((t) => t.id === action.ticketId) : null;
  const ev     = f ? (evidence || []).filter((e) => e.controlId === f.controlId) : [];
  const asmnt  = f ? assessments[f.controlId] : null;

  const stepData = {
    control:    { value: f?.controlId,                              done: !!f?.controlId },
    audit:      { value: f?.auditId,                               done: !!f?.auditId   },
    assessment: { value: asmnt?.status,                            done: !!asmnt        },
    evidence:   { value: ev.length ? `${ev.length} record(s)` : null, done: ev.length > 0 },
    finding:    { value: f?.id,                                    done: !!f            },
    risk:       { value: risk?.id,                                 done: !!risk         },
    action:     { value: action?.id,                               done: !!action       },
    ticket:     { value: ticket?.id,                               done: !!ticket       },
    resolution: { value: ticket?.resolution,                       done: !!ticket?.resolution },
    closure:    { value: ticket?.closureNotes,                     done: !!ticket?.closureNotes },
    closed:     { value: f?.status === "Closed" ? fmtDate(f.closedDate) : null, done: f?.status === "Closed" },
  };

  const doneCount = Object.values(stepData).filter((s) => s.done).length;
  const pct = STEPS.length > 0 ? Math.round((doneCount / STEPS.length) * 100) : 0;

  const clickHandlers = {
    finding:  () => f    && openFinding(f.id),
    risk:     () => risk  && openRisk(risk.id),
    action:   () => action && openAction(action.id),
    ticket:   () => ticket && openTicket(ticket.id),
  };

  /* Tab 2: Control Mapping Data */
  const ctrlObj = CONTROLS.find((c) => c.id === selectedControlId) || CONTROLS[0];
  const ctrlAsmnt = assessments[ctrlObj.id];
  const linkedPolicies = (policies || []).filter(p => p.relatedControlIds?.includes(ctrlObj.id));
  const linkedRisks = (risks || []).filter(r => r.controlId === ctrlObj.id);
  const linkedEvidence = (evidence || []).filter(e => e.controlId === ctrlObj.id);
  const linkedFindings = (findings || []).filter(f => f.controlId === ctrlObj.id);
  const linkedActions = (actions || []).filter(a => linkedFindings.some(f => f.actionId === a.id) || linkedRisks.some(r => r.actionId === a.id));

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Compliance & Traceability Matrix</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Demonstrate unbroken lineage from ISO 27001 standard clauses through policies, risk register, evidence, findings, and ITIL ticket resolution.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("mapping")}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
            activeTab === "mapping"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <GitBranch size={15} />
          <span>Control to Remediation Traceability</span>
        </button>
        <button
          onClick={() => setActiveTab("finding")}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
            activeTab === "finding"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Finding Lifecycle 11-Step Progress</span>
        </button>
      </div>

      {/* TAB 1: Control to Remediation End-to-End Mapping */}
      {activeTab === "mapping" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Field label="Select ISO Control to inspect lineage">
              <select
                value={selectedControlId}
                onChange={(e) => setSelectedControl(e.target.value)}
                className={`${inputCls} min-w-[320px] font-semibold text-slate-800`}
              >
                {CONTROLS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex items-center gap-2 pt-4">
              <Badge tone={ctrlAsmnt?.status ?? "Not Assessed"}>{ctrlAsmnt?.status ?? "Not Assessed"}</Badge>
              <Badge tone={ctrlAsmnt?.implementationStatus ?? "Implemented"}>{ctrlAsmnt?.implementationStatus ?? "Implemented"}</Badge>
              <span className="text-xs text-slate-500">Maturity Level {ctrlAsmnt?.maturityLevel ?? 3}</span>
            </div>
          </div>

          {/* Traceability Flowchart Chain */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* 1. Control */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck size={12} className="text-indigo-600" />
                <span>1. ISO Control</span>
              </div>
              <div className="font-mono text-sm font-bold text-indigo-700">{ctrlObj.id}</div>
              <p className="text-xs text-slate-700 font-semibold line-clamp-2">{ctrlObj.title}</p>
              <span className="text-[10px] text-slate-400 block">{ctrlObj.domainName}</span>
            </div>

            {/* 2. Policies */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText size={12} className="text-teal-600" />
                <span>2. Policies ({linkedPolicies.length})</span>
              </div>
              {linkedPolicies.length === 0 ? (
                <span className="text-xs text-slate-400 block pt-2">No linked policy</span>
              ) : (
                linkedPolicies.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openPolicy(p.id)}
                    className="w-full text-left p-1.5 rounded bg-teal-50/50 hover:bg-teal-100/60 border border-teal-200 text-xs transition-colors"
                  >
                    <div className="font-mono font-bold text-[11px] text-teal-800">{p.id}</div>
                    <div className="text-[11px] text-slate-700 font-medium truncate">{p.name}</div>
                  </button>
                ))
              )}
            </div>

            {/* 3. Risks */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldAlert size={12} className="text-purple-600" />
                <span>3. Risks ({linkedRisks.length})</span>
              </div>
              {linkedRisks.length === 0 ? (
                <span className="text-xs text-slate-400 block pt-2">No linked risks</span>
              ) : (
                linkedRisks.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openRisk(r.id)}
                    className="w-full text-left p-1.5 rounded bg-purple-50/50 hover:bg-purple-100/60 border border-purple-200 text-xs transition-colors"
                  >
                    <div className="font-mono font-bold text-[11px] text-purple-800">{r.id}</div>
                    <div className="text-[11px] text-slate-700 font-medium truncate">{r.title}</div>
                    <div className="text-[10px] text-slate-400">Score: {r.inherentScore}</div>
                  </button>
                ))
              )}
            </div>

            {/* 4. Evidence */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileSearch size={12} className="text-sky-600" />
                <span>4. Evidence ({linkedEvidence.length})</span>
              </div>
              {linkedEvidence.length === 0 ? (
                <span className="text-xs text-slate-400 block pt-2">No evidence filed</span>
              ) : (
                linkedEvidence.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => openEvidence(e.id)}
                    className="w-full text-left p-1.5 rounded bg-sky-50/50 hover:bg-sky-100/60 border border-sky-200 text-xs transition-colors"
                  >
                    <div className="font-mono font-bold text-[11px] text-sky-800">{e.id}</div>
                    <div className="text-[11px] text-slate-700 truncate">{e.name || e.description}</div>
                    <Badge tone={e.status}>{e.status}</Badge>
                  </button>
                ))
              )}
            </div>

            {/* 5. Findings */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <AlertTriangle size={12} className="text-orange-600" />
                <span>5. Findings ({linkedFindings.length})</span>
              </div>
              {linkedFindings.length === 0 ? (
                <span className="text-xs text-slate-400 block pt-2">No open findings</span>
              ) : (
                linkedFindings.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => openFinding(f.id)}
                    className="w-full text-left p-1.5 rounded bg-orange-50/50 hover:bg-orange-100/60 border border-orange-200 text-xs transition-colors"
                  >
                    <div className="font-mono font-bold text-[11px] text-orange-800">{f.id}</div>
                    <div className="text-[11px] text-slate-700 font-medium truncate">{f.title}</div>
                    <Badge tone={f.severity}>{f.severity}</Badge>
                  </button>
                ))
              )}
            </div>

            {/* 6. Remediation & ITSM */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ListChecks size={12} className="text-indigo-600" />
                <span>6. Actions & Tickets</span>
              </div>
              {linkedActions.length === 0 ? (
                <span className="text-xs text-slate-400 block pt-2">No active actions</span>
              ) : (
                linkedActions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openAction(a.id)}
                    className="w-full text-left p-1.5 rounded bg-indigo-50/50 hover:bg-indigo-100/60 border border-indigo-200 text-xs transition-colors"
                  >
                    <div className="font-mono font-bold text-[11px] text-indigo-800">{a.id}</div>
                    <div className="text-[11px] text-slate-700 truncate">{a.description}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Prog: {a.progress || 0}%</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Finding 11-step progress */}
      {activeTab === "finding" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Field label="Select finding to trace">
              <select
                className={`${inputCls} min-w-[280px]`}
                value={findingId}
                onChange={(e) => setFindingId(e.target.value)}
              >
                {(findings || []).map((f) => (
                  <option key={f.id} value={f.id}>{f.id} — {f.title}</option>
                ))}
              </select>
            </Field>
            {f && (
              <div className="flex items-center gap-3 pt-4">
                <Badge tone={f.severity}>{f.severity}</Badge>
                <Badge tone={f.status}>{f.status}</Badge>
                <span className="text-sm text-slate-500">{doneCount}/{STEPS.length} steps complete ({pct}%)</span>
              </div>
            )}
          </div>

          {f && (
            <Card className="p-5">
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Lifecycle progress</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {STEPS.slice(0, 6).map((step) => {
                  const sd = stepData[step.key];
                  const handler = clickHandlers[step.key];
                  return (
                    <StepCard
                      key={step.key}
                      label={step.label}
                      value={sd.value}
                      done={sd.done}
                      clickable={!!handler && sd.done}
                      onClick={handler}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                {STEPS.slice(6).map((step) => {
                  const sd = stepData[step.key];
                  const handler = clickHandlers[step.key];
                  return (
                    <StepCard
                      key={step.key}
                      label={step.label}
                      value={sd.value}
                      done={sd.done}
                      clickable={!!handler && sd.done}
                      onClick={handler}
                    />
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StepCard({ label, value, done, clickable, onClick }) {
  const El = clickable ? "button" : "div";
  return (
    <El
      onClick={clickable ? onClick : undefined}
      className={`flex flex-col items-center text-center p-3 rounded-lg border transition-colors ${
        done
          ? clickable
            ? "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
            : "bg-indigo-50 border-indigo-200"
          : "bg-slate-50 border-slate-200 border-dashed"
      }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 ${done ? "bg-indigo-600" : "bg-slate-200"}`}>
        {done
          ? <CheckCircle2 size={14} className="text-white" />
          : <Circle size={14} className="text-slate-400" />
        }
      </div>
      <div className={`text-[11px] font-semibold leading-tight ${done ? "text-indigo-700" : "text-slate-500"}`}>
        {label}
      </div>
      <div className={`text-[10px] mt-1 font-mono leading-tight truncate max-w-[90px] ${done ? "text-indigo-500" : "text-slate-400"}`}>
        {value || "Pending"}
      </div>
    </El>
  );
}
