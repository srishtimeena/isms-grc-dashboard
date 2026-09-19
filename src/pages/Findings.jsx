import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { fmtDate } from "../utils/date.js";
import { hasPermission } from "../constants/permissions.js";
import { FindingModal } from "../components/forms/FindingModal.jsx";
import { AlertTriangle, Plus, Search } from "lucide-react";

export function Findings() {
  const { findings, role, openFinding, createFinding } = useApp();
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreate = hasPermission(role, "finding", "create");

  // Summary Metrics
  const totalFindings = findings?.length || 0;
  const criticalCount = findings?.filter((f) => f.severity === "Critical" && !["Closed", "Resolved"].includes(f.status))?.length || 0;
  const highCount = findings?.filter((f) => f.severity === "High" && !["Closed", "Resolved"].includes(f.status))?.length || 0;
  const openCount = findings?.filter((f) => !["Closed", "Resolved"].includes(f.status))?.length || 0;
  const closedCount = findings?.filter((f) => f.status === "Closed" || f.status === "Resolved")?.length || 0;

  // Filter rows
  const rows = (findings || []).filter((f) => {
    if (severity !== "All" && f.severity !== severity) return false;
    if (status !== "All" && f.status !== status) return false;
    if (q && !(`${f.id} ${f.title} ${f.controlId} ${f.owner || ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleSaveFinding = (data) => {
    createFinding(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Findings Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit non-conformities, observations, root-cause analyses, and remediation verification.
          </p>
        </div>
        {canCreate && (
          <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            <span>Raise Finding</span>
          </Btn>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Findings" value={totalFindings} accent="border-indigo-500" />
        <Stat
          label="Critical Active"
          value={criticalCount}
          accent={criticalCount > 0 ? "border-red-600" : "border-slate-300"}
        />
        <Stat
          label="High Active"
          value={highCount}
          accent={highCount > 0 ? "border-orange-500" : "border-slate-300"}
        />
        <Stat label="Closed / Resolved" value={closedCount} accent="border-emerald-500" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search findings by ID, title, control, owner..."
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          className={`${inputCls} w-auto`}
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option>All Severities</option>
          {["Critical", "High", "Medium", "Low", "Observation"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className={`${inputCls} w-auto`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Statuses</option>
          {["Open", "Assigned", "In Progress", "Pending Verification", "Resolved", "Closed", "Overdue"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {totalFindings} findings
        </span>
      </div>

      {/* Findings Table */}
      <Table
        columns={[
          {
            key: "id",
            header: "Finding ID",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-indigo-600">
                {r.id}
              </span>
            ),
          },
          {
            key: "title",
            header: "Title",
            render: (r) => (
              <div>
                <span className="font-semibold text-slate-800 block truncate max-w-sm">
                  {r.title}
                </span>
                <span className="text-slate-400 text-[11px] block">{r.type}</span>
              </div>
            ),
          },
          {
            key: "controlId",
            header: "Control",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {r.controlId}
              </span>
            ),
          },
          {
            key: "severity",
            header: "Severity",
            render: (r) => <Badge tone={r.severity}>{r.severity}</Badge>,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
          },
          {
            key: "owner",
            header: "Remediation Owner",
            render: (r) => <span className="text-xs text-slate-700">{r.owner}</span>,
          },
          {
            key: "targetDate",
            header: "Target Date",
            render: (r) => (
              <span className={`text-xs ${r.status === "Overdue" ? "text-red-600 font-bold" : "text-slate-600"}`}>
                {fmtDate(r.targetDate)}
              </span>
            ),
          },
        ]}
        rows={rows}
        onRowClick={(r) => openFinding(r.id)}
        empty="No findings match the current filter criteria."
      />

      {/* Modal for Raising Finding */}
      <FindingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveFinding}
      />
    </div>
  );
}
