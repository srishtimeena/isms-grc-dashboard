import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { ReadinessBar } from "../components/ui/ReadinessBar.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { DomainComplianceBar }   from "../components/charts/DomainComplianceBar.jsx";
import { ClauseComplianceBar }   from "../components/charts/ClauseComplianceBar.jsx";
import { ComplianceDistribution } from "../components/charts/ComplianceDistribution.jsx";
import { ComplianceTrend }       from "../components/charts/ComplianceTrend.jsx";
import { RiskMatrix }            from "../components/charts/RiskMatrix.jsx";
import { FindingsBySeverity }    from "../components/charts/FindingsBySeverity.jsx";
import { FindingsAgingBar }      from "../components/charts/FindingsAgingBar.jsx";
import { FindingClosureTrend }   from "../components/charts/FindingClosureTrend.jsx";
import { SLAChart }              from "../components/charts/SLAChart.jsx";
import { AssignmentWorkload }    from "../components/charts/AssignmentWorkload.jsx";
import { ticketSLA }  from "../utils/sla.js";
import { RISK_CATEGORY } from "../constants/statusStyles.js";

/* ── Management Insights ─────────────────────────────── */
function buildInsights({ compliance, findings, actions, tickets, risks, evidence }) {
  const out = [];
  const o = compliance.overall;
  const worst = [...compliance.byDomain].sort((a, b) => a.percent - b.percent)[0];
  if (worst) out.push(`${worst.domain} (${worst.name}) has the lowest domain compliance at ${worst.percent.toFixed(0)}%.`);

  const openHigh = findings.filter((f) => ["Open","In Progress","Overdue"].includes(f.status) && ["High","Critical"].includes(f.severity)).length;
  if (openHigh > 0) out.push(`${openHigh} high or critical finding${openHigh > 1 ? "s" : ""} remain open and require priority attention.`);

  const overdue = actions.filter((a) => a.status === "Overdue").length;
  if (overdue > 0) out.push(`${overdue} corrective action${overdue > 1 ? "s are" : " is"} past their target date and marked Overdue.`);

  const unverified = new Set(evidence.filter((e) => e.verificationStatus !== "Verified").map((e) => e.controlId)).size;
  if (unverified > 0) out.push(`Evidence verification is incomplete for ${unverified} control${unverified > 1 ? "s" : ""}.`);

  const critRisks = risks.filter((r) => RISK_CATEGORY(r.residualScore ?? r.inherentScore) === "Critical" && r.status !== "Closed").length;
  if (critRisks > 0) out.push(`${critRisks} critical risk${critRisks > 1 ? "s" : ""} with no closed treatment plan require management attention.`);

  const breached = tickets.filter((t) => ticketSLA(t).status === "Breached").length;
  if (breached > 0) out.push(`${breached} ITSM ticket${breached > 1 ? "s have" : " has"} breached SLA — escalation may be required.`);

  const closedViaTicket = findings.filter((f) => f.status === "Closed" && f.actionId).length;
  const totalClosed = findings.filter((f) => f.status === "Closed").length;
  if (totalClosed > 0) out.push(`${closedViaTicket} of ${totalClosed} closed findings were remediated via a tracked ITSM ticket — demonstrating end-to-end traceability.`);

  return out;
}

/* ── KPI group header ─────────────────────────────────── */
function KpiGroup({ label, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1">{label}</div>
      <div className="grid grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────── */
export function Dashboard() {
  const { compliance, findings, risks, actions, tickets, evidence, openRisk, setPage } = useApp();
  const o = compliance.overall;

  /* Audit readiness composite score */
  const readiness = useMemo(() => {
    const assessPct    = o.applicable ? (o.assessed / o.applicable) * 100 : 0;
    const verifiedPct  = evidence.length ? (evidence.filter((e) => e.verificationStatus === "Verified").length / evidence.length) * 100 : 100;
    const closurePct   = findings.length ? (findings.filter((f) => f.status === "Closed").length / findings.length) * 100 : 100;
    const actionPct    = actions.length  ? (actions.filter((a) => ["Completed","Closed"].includes(a.status)).length / actions.length) * 100 : 100;
    const riskPct      = risks.length    ? (risks.filter((r) => r.status === "Closed" || (r.residualScore ?? r.inherentScore) < r.inherentScore).length / risks.length) * 100 : 100;
    return { assessPct, verifiedPct, closurePct, actionPct, riskPct, overall: (assessPct + verifiedPct + closurePct + actionPct + riskPct) / 5 };
  }, [o, evidence, findings, actions, risks]);

  /* Distribution data for donut */
  const distribution = [
    { name: "Compliant",          value: o.compliant    },
    { name: "Partially Compliant",value: o.partial      },
    { name: "Non-Compliant",      value: o.nonCompliant },
    { name: "Not Applicable",     value: o.na           },
    { name: "Not Assessed",       value: o.notAssessed  },
  ];

  /* Compliance trend (illustrative) */
  const trend = useMemo(() => {
    const target = o.percent;
    return ["Apr","May","Jun","Jul","Aug","Sep"].map((month, i) => ({
      month,
      compliance: Math.max(0, Math.round(target - (5 - i) * (2 + i * 0.6))),
    }));
  }, [o.percent]);

  const openFindings = findings.filter((f) => !["Closed","Resolved"].includes(f.status));
  const slaBreaches  = tickets.filter((t) => ticketSLA(t).status === "Breached").length;
  const openTickets  = tickets.filter((t) => !["Closed","Resolved"].includes(t.status));
  const openRisks    = risks.filter((r) => r.status !== "Closed");
  const insights     = buildInsights({ compliance, findings, actions, tickets, risks, evidence });

  return (
    <div className="space-y-6 max-w-[1280px] fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Annual ISMS Internal Audit 2026 · AUD-2026-01 · All metrics derived live from assessment and ITSM data.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          DEMO DATA
        </span>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiGroup label="Compliance">
          <Stat onClick={() => setPage("controls")} label="Overall ISO Compliance" value={o.percent.toFixed(1)} suffix="%" accent="border-indigo-500" />
          <Stat onClick={() => setPage("traceability")} label="Audit Readiness Score"  value={readiness.overall.toFixed(0)} suffix="%" accent="border-blue-500" />
          <Stat onClick={() => setPage("controls")} label="Controls Assessed"       value={`${o.assessed}/${o.applicable}`} accent="border-slate-400" />
        </KpiGroup>

        <KpiGroup label="Findings & Risk">
          <Stat onClick={() => setPage("findings")} label="Open Findings"    value={openFindings.length}
            accent={openFindings.length > 0 ? "border-orange-500" : "border-emerald-500"} />
          <Stat onClick={() => setPage("findings")} label="Critical Findings" value={findings.filter((f) => f.severity === "Critical" && !["Closed"].includes(f.status)).length}
            accent="border-red-600" />
          <Stat onClick={() => setPage("risks")} label="Open Risks"        value={openRisks.length} accent="border-purple-500" />
        </KpiGroup>

        <KpiGroup label="ITSM Remediation">
          <Stat onClick={() => setPage("tickets")} label="Open Tickets"      value={openTickets.length} accent="border-blue-400" />
          <Stat onClick={() => setPage("tickets")} label="SLA Breaches"      value={slaBreaches}
            accent={slaBreaches > 0 ? "border-red-600" : "border-emerald-500"} />
          <Stat onClick={() => setPage("actions")} label="Overdue Actions"   value={actions.filter((a) => a.status === "Overdue").length}
            accent="border-red-500" />
        </KpiGroup>
      </div>

      {/* ── Compliance Analytics Section ───────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1 rounded-full bg-indigo-600" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Compliance Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <DomainComplianceBar data={compliance.byDomain} />
          </div>
          <ComplianceDistribution data={distribution} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <ClauseComplianceBar data={compliance.byClauseGroup} />
          </div>
          <Card className="p-4">
            <SectionTitle sub="Bottom 8 assessed controls by compliance score.">Lowest Performing Controls</SectionTitle>
            <div className="space-y-1.5">
              {compliance.lowest.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPage("controls")}
                  className="w-full text-left flex items-center justify-between text-sm px-2.5 py-2 rounded-md hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-200"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-semibold text-indigo-600">{c.id}</span>
                    <span className="text-slate-500 text-xs block truncate">{c.title}</span>
                  </div>
                  <Badge tone={c.score >= 80 ? "Compliant" : c.score >= 40 ? "Partially Compliant" : "Non-Compliant"}>
                    {c.score}%
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>
        <ComplianceTrend data={trend} currentScore={o.percent} />
      </section>

      {/* ── Risk & Findings Section ────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1 rounded-full bg-red-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Risk & Findings</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <RiskMatrix risks={risks} onRiskClick={(rs) => openRisk(rs[0].id)} />
          <FindingsBySeverity findings={findings} />
          <FindingsAgingBar findings={findings} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FindingClosureTrend findings={findings} />
          <Card className="p-4">
            <SectionTitle sub="Open risks with residual score and treatment status.">Open Risk Summary</SectionTitle>
            <div className="space-y-2">
              {openRisks.length === 0 && (
                <p className="text-sm text-slate-400">No open risks.</p>
              )}
              {openRisks.map((r) => {
                const cat = RISK_CATEGORY(r.residualScore ?? r.inherentScore);
                return (
                  <button
                    key={r.id}
                    onClick={() => openRisk(r.id)}
                    className="w-full text-left border border-slate-200 rounded-lg px-3 py-2 hover:bg-red-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 line-clamp-1">{r.title}</span>
                      <Badge tone={cat}>{cat}</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Score: {r.residualScore ?? r.inherentScore} · {r.treatment} · {r.owner}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* ── ITSM Remediation Section ───────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">ITSM Remediation</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SLAChart tickets={tickets} />
          <AssignmentWorkload tickets={tickets} />
        </div>
      </section>

      {/* ── Management Insights ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1 rounded-full bg-violet-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Management Insights</h2>
        </div>
        <Card className="p-4">
          <SectionTitle sub="Auto-generated from current data. Labeled as management indicators — not official ISO conclusions.">
            Platform Insights
          </SectionTitle>
          {insights.length === 0 ? (
            <p className="text-sm text-slate-400">No significant issues detected. All metrics within expected thresholds.</p>
          ) : (
            <ul className="space-y-2">
              {insights.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ── Audit Readiness ────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1 rounded-full bg-teal-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Audit Readiness</h2>
        </div>
        <Card className="p-4">
          <SectionTitle sub="Internal project readiness score across 5 dimensions. Not an official ISO certification indicator.">
            Readiness Score: {readiness.overall.toFixed(0)}%
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <ReadinessBar label="Assessment completion" value={readiness.assessPct} />
            <ReadinessBar label="Evidence verification" value={readiness.verifiedPct} />
            <ReadinessBar label="Finding closure"       value={readiness.closurePct} />
            <ReadinessBar label="Action completion"     value={readiness.actionPct} />
            <ReadinessBar label="Risk treatment"        value={readiness.riskPct} />
          </div>
        </Card>
      </section>

    </div>
  );
}
