import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { RiskMatrix } from "../components/charts/RiskMatrix.jsx";
import { RISK_CATEGORY } from "../constants/statusStyles.js";
import { inputCls } from "../components/ui/Field.jsx";
import { hasPermission } from "../constants/permissions.js";
import { RiskModal } from "../components/forms/RiskModal.jsx";
import { ShieldAlert, Plus, Search } from "lucide-react";

export function Risks() {
  const { risks, role, openRisk, createRisk } = useApp();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [treatmentFilter, setTreatmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreate = hasPermission(role, "risk", "create");

  // Summary Metrics
  const totalRisks = risks?.length || 0;
  const criticalCount = risks?.filter((r) => RISK_CATEGORY(r.residualScore ?? r.inherentScore) === "Critical" && r.status !== "Closed")?.length || 0;
  const highCount = risks?.filter((r) => RISK_CATEGORY(r.residualScore ?? r.inherentScore) === "High" && r.status !== "Closed")?.length || 0;
  const overdueCount = risks?.filter((r) => r.status === "Treatment Overdue")?.length || 0;
  const closedCount = risks?.filter((r) => r.status === "Closed")?.length || 0;

  // Filter rows
  const rows = (risks || []).filter((r) => {
    const score = r.residualScore ?? r.inherentScore;
    const cat = RISK_CATEGORY(score);
    if (catFilter !== "All" && cat !== catFilter) return false;
    if (treatmentFilter !== "All" && r.treatment !== treatmentFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (q && !(`${r.id} ${r.title} ${r.asset || ""} ${r.owner || ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleSaveRisk = (data) => {
    createRisk(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Risk Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ISO 27005 risk assessments, interactive 5×5 matrix, treatment plans, and residual risk tracking.
          </p>
        </div>
        {canCreate && (
          <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            <span>Register New Risk</span>
          </Btn>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Risks" value={totalRisks} accent="border-indigo-500" />
        <Stat label="Critical / High Active" value={criticalCount + highCount} accent="border-red-500" />
        <Stat
          label="Treatment Overdue"
          value={overdueCount}
          accent={overdueCount > 0 ? "border-amber-500" : "border-slate-300"}
        />
        <Stat label="Closed / Treated" value={closedCount} accent="border-emerald-500" />
      </div>

      {/* Interactive 5×5 Risk Matrix with Drill-down Popover */}
      <RiskMatrix risks={risks || []} onRiskClick={(r) => openRisk(r.id)} />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search risks by ID, title, asset, owner..."
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All</option>
          {["Critical", "High", "Medium", "Low"].map((c) => (
            <option key={c} value={c}>{c} Rating</option>
          ))}
        </select>

        <select
          value={treatmentFilter}
          onChange={(e) => setTreatmentFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All</option>
          {["Mitigate", "Accept", "Transfer", "Avoid"].map((t) => (
            <option key={t} value={t}>{t} Strategy</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All</option>
          {["Treatment In Progress", "Treatment Overdue", "Accepted", "Closed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {totalRisks} risks
        </span>
      </div>

      {/* Risk Register Table */}
      <Table
        columns={[
          {
            key: "id",
            header: "Risk ID",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-purple-700">
                {r.id}
              </span>
            ),
          },
          {
            key: "title",
            header: "Risk Title & Asset",
            render: (r) => (
              <div>
                <span className="font-semibold text-slate-800 block truncate max-w-sm">
                  {r.title}
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Asset: <strong className="text-slate-600">{r.asset || "—"}</strong>
                </span>
              </div>
            ),
          },
          {
            key: "inherentScore",
            header: "Inherent",
            render: (r) => (
              <span className="font-mono font-bold text-xs text-slate-800">
                {r.inherentScore || r.likelihood * r.impact}
              </span>
            ),
          },
          {
            key: "residual",
            header: "Residual",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-slate-600">
                {r.residualScore ?? "—"}
              </span>
            ),
          },
          {
            key: "cat",
            header: "Category",
            render: (r) => {
              const cat = RISK_CATEGORY(r.residualScore ?? r.inherentScore);
              return <Badge tone={cat}>{cat}</Badge>;
            },
          },
          {
            key: "treatment",
            header: "Treatment",
            render: (r) => (
              <span className="text-xs font-medium text-slate-700">
                {r.treatment}
              </span>
            ),
          },
          {
            key: "owner",
            header: "Owner",
            render: (r) => <span className="text-xs text-slate-700">{r.owner}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => {
              const tone = r.status === "Closed" ? "Closed" : r.status === "Treatment Overdue" ? "Overdue" : "In Progress";
              return <Badge tone={tone}>{r.status}</Badge>;
            },
          },
        ]}
        rows={rows}
        onRowClick={(r) => openRisk(r.id)}
        empty="No risks match the current filter criteria."
      />

      {/* Modal for Registering Risk */}
      <RiskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveRisk}
      />
    </div>
  );
}
