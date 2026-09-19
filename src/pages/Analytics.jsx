import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { DomainComplianceBar }    from "../components/charts/DomainComplianceBar.jsx";
import { ClauseComplianceBar }    from "../components/charts/ClauseComplianceBar.jsx";
import { ComplianceDistribution } from "../components/charts/ComplianceDistribution.jsx";
import { ComplianceTrend }        from "../components/charts/ComplianceTrend.jsx";
import { RiskMatrix }             from "../components/charts/RiskMatrix.jsx";
import { FindingsBySeverity }     from "../components/charts/FindingsBySeverity.jsx";
import { FindingsAgingBar }       from "../components/charts/FindingsAgingBar.jsx";
import { FindingClosureTrend }    from "../components/charts/FindingClosureTrend.jsx";
import { SLAChart }               from "../components/charts/SLAChart.jsx";
import { AssignmentWorkload }     from "../components/charts/AssignmentWorkload.jsx";
import { ticketSLA } from "../utils/sla.js";

const SECTION_TABS = ["Compliance", "Risk & Findings", "ITSM Performance"];

export function Analytics() {
  const { compliance, findings, risks, tickets, openRisk } = useApp();
  const [tab, setTab] = useState("Compliance");

  const slaCounts = {
    within:  tickets.filter((t) => ticketSLA(t).status === "Within SLA").length,
    atRisk:  tickets.filter((t) => ticketSLA(t).status === "At Risk").length,
    breached:tickets.filter((t) => ticketSLA(t).status === "Breached").length,
  };

  const trend = (() => {
    const target = compliance.overall.percent;
    return ["Apr","May","Jun","Jul","Aug","Sep"].map((month, i) => ({
      month,
      compliance: Math.max(0, Math.round(target - (5 - i) * (2 + i * 0.6))),
    }));
  })();

  const distribution = [
    { name: "Compliant",           value: compliance.overall.compliant },
    { name: "Partially Compliant", value: compliance.overall.partial },
    { name: "Non-Compliant",       value: compliance.overall.nonCompliant },
    { name: "Not Applicable",      value: compliance.overall.na },
    { name: "Not Assessed",        value: compliance.overall.notAssessed },
  ];

  return (
    <div className="max-w-[1280px] space-y-5 fade-in">
      <SectionTitle>Analytics</SectionTitle>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {SECTION_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Compliance tab ── */}
      {tab === "Compliance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><DomainComplianceBar data={compliance.byDomain} /></div>
            <ComplianceDistribution data={distribution} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ClauseComplianceBar data={compliance.byClauseGroup} />
            <ComplianceTrend data={trend} />
          </div>
        </div>
      )}

      {/* ── Risk & Findings tab ── */}
      {tab === "Risk & Findings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskMatrix risks={risks} onRiskClick={(rs) => openRisk(rs[0].id)} />
            <FindingsBySeverity findings={findings} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FindingsAgingBar findings={findings} />
            <FindingClosureTrend findings={findings} />
          </div>
        </div>
      )}

      {/* ── ITSM Performance tab ── */}
      {tab === "ITSM Performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Within SLA"  value={slaCounts.within}  accent="border-emerald-500" />
            <Stat label="At Risk"     value={slaCounts.atRisk}  accent="border-amber-500" />
            <Stat label="Breached"    value={slaCounts.breached} accent="border-red-600" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SLAChart tickets={tickets} />
            <AssignmentWorkload tickets={tickets} />
          </div>
        </div>
      )}
    </div>
  );
}
