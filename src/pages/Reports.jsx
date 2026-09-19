import { useState } from "react";
import { Printer, Download, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Calendar, User, ShieldAlert, ListChecks } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { CONTROLS, ANNEX_A, CLAUSES } from "../constants/iso27001.js";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { fmtDate } from "../utils/date.js";
import { ticketSLA } from "../utils/sla.js";
import { RISK_CATEGORY } from "../constants/statusStyles.js";

export function Reports() {
  const { compliance, findings, risks, actions, tickets, audits, assessments, policies, evidence } = useApp();
  const [activeTab, setActiveTab] = useState("audit"); // 'audit' | 'mgmt' | 'soa' | 'risk' | 'capa'

  const audit = audits[0] || {
    id: "AUD-2026-01",
    name: "ISO 27001:2022 Stage 1 Internal Audit",
    type: "Internal Audit",
    scope: "Cloud Infrastructure, DevOps, and Enterprise IT",
    leadAuditor: "Srishti Meena (Lead Auditor)",
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    status: "In Progress",
  };

  const handlePrint = () => {
    window.print();
  };

  const nonConformities = (findings || []).filter((f) => f.type.includes("Non-Conformity"));
  const observations = (findings || []).filter((f) => f.type === "Observation" || f.type === "Opportunity for Improvement");

  return (
    <div className="max-w-[1280px] space-y-6 fade-in print:p-0 print:m-0">
      {/* Header and Print action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compliance & Audit Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal ISO 27001 audit deliverables, management reviews, SoA, risk reports, and CAPA remediation exports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print / Export PDF</span>
          </Btn>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === "audit"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Internal Audit Report (ISO 9.2)
        </button>
        <button
          onClick={() => setActiveTab("mgmt")}
          className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === "mgmt"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Management Review (ISO 9.3)
        </button>
        <button
          onClick={() => setActiveTab("soa")}
          className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === "soa"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Statement of Applicability (SoA)
        </button>
        <button
          onClick={() => setActiveTab("risk")}
          className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === "risk"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Risk Assessment & Treatment Report
        </button>
        <button
          onClick={() => setActiveTab("capa")}
          className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
            activeTab === "capa"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Remediation (CAPA) SLA Report
        </button>
      </div>

      {/* ── 1. INTERNAL AUDIT REPORT ── */}
      {activeTab === "audit" && (
        <Card className="p-8 space-y-8 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">ISMS Formal Report</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">ISO/IEC 27001:2022 Internal Audit Report</h1>
              <p className="text-sm text-slate-500 mt-1">Audit Reference: <span className="font-mono font-medium text-slate-700">{audit.id}</span></p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Date: <strong className="text-slate-800">{fmtDate(new Date())}</strong></div>
              <div>Standard: <strong className="text-slate-800">ISO/IEC 27001:2022</strong></div>
              <div className="mt-1">Status: <Badge tone={audit.status}>{audit.status}</Badge></div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">1. Executive Summary</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              An internal audit of the Information Security Management System (ISMS) was conducted against the requirements of ISO/IEC 27001:2022.
              The overall compliance score across assessed controls is <strong>{compliance.overall.percent.toFixed(1)}%</strong>.
              A total of <strong>{findings.length} findings</strong> were identified during this audit cycle, including {nonConformities.length} Non-Conformity items and {observations.length} Observations.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-2xl font-bold text-indigo-600">{compliance.overall.percent.toFixed(0)}%</div>
                <div className="text-xs text-slate-500 mt-0.5">Overall Compliance</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-2xl font-bold text-emerald-600">{compliance.overall.compliant} / {compliance.overall.assessed}</div>
                <div className="text-xs text-slate-500 mt-0.5">Controls Compliant</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-2xl font-bold text-amber-600">{nonConformities.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Non-Conformities</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{actions.filter(a => a.status === "Closed" || a.status === "Completed").length} / {actions.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Remediated CAPAs</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">2. Audit Scope & Criteria</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Audit Scope:</span> <span className="font-medium text-slate-800">{audit.scope}</span></div>
              <div><span className="text-slate-500">Lead Auditor:</span> <span className="font-medium text-slate-800">{audit.leadAuditor}</span></div>
              <div><span className="text-slate-500">Audit Period:</span> <span className="font-medium text-slate-800">{fmtDate(audit.startDate)} — {fmtDate(audit.endDate)}</span></div>
              <div><span className="text-slate-500">Audit Criteria:</span> <span className="font-medium text-slate-800">ISO/IEC 27001:2022 Clauses 4–10 & Annex A</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">3. Annex A Domain Assessment Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Domain</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2 text-center">Controls</th>
                    <th className="px-3 py-2 text-center">Compliant</th>
                    <th className="px-3 py-2 text-center">Partial</th>
                    <th className="px-3 py-2 text-center">Non-Compliant</th>
                    <th className="px-3 py-2 text-right">Compliance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compliance.byDomain.map((d) => (
                    <tr key={d.domain} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-indigo-600">{d.domain}</td>
                      <td className="px-3 py-2 text-slate-800">{d.name}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{d.total}</td>
                      <td className="px-3 py-2 text-center text-emerald-600 font-medium">{d.compliant}</td>
                      <td className="px-3 py-2 text-center text-amber-600 font-medium">{d.partial}</td>
                      <td className="px-3 py-2 text-center text-red-600 font-medium">{d.nonCompliant}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{d.percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">4. Audit Findings Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Control</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Target Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-slate-800">{f.id}</td>
                      <td className="px-3 py-2 font-mono text-indigo-600">{f.controlId}</td>
                      <td className="px-3 py-2 text-slate-600">{f.type}</td>
                      <td className="px-3 py-2 font-medium text-slate-800">{f.title}</td>
                      <td className="px-3 py-2"><Badge tone={f.severity}>{f.severity}</Badge></td>
                      <td className="px-3 py-2 text-slate-600">{fmtDate(f.targetDate)}</td>
                      <td className="px-3 py-2"><Badge tone={f.status}>{f.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h2 className="text-base font-semibold text-slate-900 mb-4">5. Auditor Sign-Off & Verification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div className="p-4 border border-dashed border-slate-300 rounded-lg space-y-4">
                <div className="font-semibold text-slate-700">Lead Auditor Sign-off</div>
                <div className="h-10 border-b border-slate-300"></div>
                <div className="flex justify-between text-slate-500">
                  <span>Name: Srishti Meena</span>
                  <span>Date: {fmtDate(new Date())}</span>
                </div>
              </div>
              <div className="p-4 border border-dashed border-slate-300 rounded-lg space-y-4">
                <div className="font-semibold text-slate-700">GRC / Security Lead Acceptance</div>
                <div className="h-10 border-b border-slate-300"></div>
                <div className="flex justify-between text-slate-500">
                  <span>Name: Vikram Malhotra</span>
                  <span>Date: {fmtDate(new Date())}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── 2. MANAGEMENT REVIEW REPORT ── */}
      {activeTab === "mgmt" && (
        <Card className="p-8 space-y-8 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">Executive Briefing</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">ISMS Management Review Report</h1>
              <p className="text-sm text-slate-500 mt-1">Conducted pursuant to ISO/IEC 27001:2022 Clause 9.3</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Review Cycle: <strong className="text-slate-800">Q3 2026</strong></div>
              <div>Period: <strong className="text-slate-800">Jan 2026 – Sep 2026</strong></div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">1. ISMS Performance & Compliance Posture</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Top management reviewed the organization's information security posture, risk management effectiveness, and compliance status.
              The current posture shows <strong>{compliance.overall.percent.toFixed(1)}% compliance</strong> across evaluated controls.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div className="text-xs text-indigo-700 font-semibold uppercase">Compliance Posture</div>
                <div className="text-2xl font-bold text-indigo-900 mt-1">{compliance.overall.percent.toFixed(1)}%</div>
                <p className="text-xs text-indigo-600 mt-1">{compliance.overall.compliant} fully implemented controls</p>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                <div className="text-xs text-amber-700 font-semibold uppercase">Risk Exposure</div>
                <div className="text-2xl font-bold text-amber-900 mt-1">{risks.filter(r => r.status !== "Closed").length} Open Risks</div>
                <p className="text-xs text-amber-600 mt-1">{risks.filter(r => (r.residualScore ?? r.inherentScore) >= 12).length} High / Critical inherent risks</p>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-700 font-semibold uppercase">Remediation Velocity</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">{tickets.filter(t => t.status === "Closed" || t.status === "Resolved").length} / {tickets.length}</div>
                <p className="text-xs text-emerald-600 mt-1">ITSM remediation tickets resolved</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">2. High Priority Risks & Remediation Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Risk ID</th>
                    <th className="px-3 py-2">Asset / Threat</th>
                    <th className="px-3 py-2">Inherent Score</th>
                    <th className="px-3 py-2">Residual Score</th>
                    <th className="px-3 py-2">Treatment Plan</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {risks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-slate-800">{r.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{r.title}</div>
                        <div className="text-slate-400 text-[11px]">{r.asset}</div>
                      </td>
                      <td className="px-3 py-2 font-semibold text-red-600">{r.inherentScore}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700">{r.residualScore ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate">{r.treatmentPlan || r.treatmentDetail || r.treatment}</td>
                      <td className="px-3 py-2"><Badge tone={r.status}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-1.5">3. Top Management Decisions & Continual Improvement</h2>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-700">
              <p>• <strong>Resource Allocation:</strong> Approved engineering capacity for cloud workload EDR deployment on A.8.7.</p>
              <p>• <strong>ISMS Policy Updates:</strong> Ratified Information Security Policy Suite v2.0 with annual review cycle.</p>
              <p>• <strong>Certification Audit:</strong> Validated organizational readiness for upcoming ISO/IEC 27001:2022 Stage 2 external audit.</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── 3. STATEMENT OF APPLICABILITY (SoA) ── */}
      {activeTab === "soa" && (
        <Card className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">Annex A Controls</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Statement of Applicability (SoA)</h1>
              <p className="text-sm text-slate-500 mt-1">Comprehensive mapping of all 93 controls per ISO/IEC 27001:2022</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Total Controls: <strong className="text-slate-800">{CONTROLS.length}</strong></div>
              <div>Applicable: <strong className="text-slate-800">{CONTROLS.filter(c => assessments[c.id]?.status !== "Not Applicable").length}</strong></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Control ID</th>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2">Control Title</th>
                  <th className="px-3 py-2">Applicability</th>
                  <th className="px-3 py-2">Implementation Status</th>
                  <th className="px-3 py-2">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CONTROLS.map((c) => {
                  const a = assessments[c.id];
                  const isNA = a?.status === "Not Applicable";
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-indigo-600">{c.id}</td>
                      <td className="px-3 py-2 text-slate-500">{c.domain}</td>
                      <td className="px-3 py-2 font-medium text-slate-800">{c.title}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isNA ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                          {isNA ? "Excluded" : "Applicable"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={a?.status ?? "Not Assessed"}>{a?.status ?? "Not Assessed"}</Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-700">
                        {a?.score != null ? `${a.score}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── 4. RISK ASSESSMENT & TREATMENT REPORT ── */}
      {activeTab === "risk" && (
        <Card className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">ISO 27005 Deliverable</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Enterprise Information Security Risk Assessment Report</h1>
              <p className="text-sm text-slate-500 mt-1">Inherent & residual risk scoring, risk treatment decisions, and asset exposure</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Total Risks: <strong className="text-slate-800">{risks.length}</strong></div>
              <div>Critical / High: <strong className="text-red-600">{risks.filter(r => (r.residualScore ?? r.inherentScore) >= 12).length}</strong></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Risk ID</th>
                  <th className="px-3 py-2">Risk Title & Asset</th>
                  <th className="px-3 py-2">Likelihood × Impact</th>
                  <th className="px-3 py-2">Inherent Risk</th>
                  <th className="px-3 py-2">Treatment Strategy</th>
                  <th className="px-3 py-2">Residual Risk</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {risks.map((r) => {
                  const inherentCat = RISK_CATEGORY(r.inherentScore);
                  const residualCat = RISK_CATEGORY(r.residualScore ?? r.inherentScore);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-slate-800">{r.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{r.title}</div>
                        <div className="text-slate-400 text-[11px]">{r.asset} · Control {r.controlId || "General"}</div>
                      </td>
                      <td className="px-3 py-2 font-mono text-center">{r.likelihood || 3} × {r.impact || 3}</td>
                      <td className="px-3 py-2">
                        <Badge tone={inherentCat}>{r.inherentScore} ({inherentCat})</Badge>
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700">{r.treatment}</td>
                      <td className="px-3 py-2">
                        <Badge tone={residualCat}>{r.residualScore ?? r.inherentScore} ({residualCat})</Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{r.owner}</td>
                      <td className="px-3 py-2"><Badge tone={r.status}>{r.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── 5. CAPA REMEDIATION SLA REPORT ── */}
      {activeTab === "capa" && (
        <Card className="p-8 space-y-6 bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">CAPA Governance</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Corrective Action (CAPA) & Remediation SLA Report</h1>
              <p className="text-sm text-slate-500 mt-1">Tracking root-cause resolution, technician progress, and auditor verification</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Total Actions: <strong className="text-slate-800">{actions.length}</strong></div>
              <div>Completed: <strong className="text-emerald-600">{actions.filter(a => ["Completed", "Closed"].includes(a.status)).length}</strong></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">CAPA ID</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Linked Finding / Risk</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Target Date</th>
                  <th className="px-3 py-2">Progress</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((a) => {
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-slate-800">{a.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{a.description}</div>
                        {a.ticketId && <div className="text-slate-400 text-[10px] font-mono">ITSM Ticket: {a.ticketId}</div>}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600">{a.findingId || a.riskId || "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{a.owner}</td>
                      <td className="px-3 py-2 text-slate-600">{fmtDate(a.targetDate)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${a.progress || (a.status === 'Completed' ? 100 : 0)}%` }}></div>
                          </div>
                          <span className="font-mono text-[10px] text-slate-600">{a.progress || (a.status === 'Completed' ? 100 : 0)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2"><Badge tone={a.status}>{a.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
