import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { fmtDate, relDays } from "../utils/date.js";
import { hasPermission } from "../constants/permissions.js";
import { ActionModal } from "../components/forms/ActionModal.jsx";
import { ListChecks, Plus, Search } from "lucide-react";

export function Actions() {
  const { actions, role, openAction, createAction } = useApp();
  const [q, setQ] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreate = hasPermission(role, "action", "create");

  // Summary Metrics
  const total = actions?.length || 0;
  const inProgressCount = actions?.filter((a) => a.status === "In Progress")?.length || 0;
  const overdueCount = actions?.filter((a) => a.status === "Overdue")?.length || 0;
  const completedCount = actions?.filter((a) => ["Completed", "Closed"].includes(a.status))?.length || 0;

  // Filter rows
  const rows = (actions || []).filter((a) => {
    if (priorityFilter !== "All" && a.priority !== priorityFilter) return false;
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (q && !(`${a.id} ${a.description} ${a.owner || ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleSaveAction = (data) => {
    createAction(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Corrective Actions (CAPA)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Remediation task management, root-cause resolution, implementation progress, and verification.
          </p>
        </div>
        {canCreate && (
          <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            <span>Create Action Plan</span>
          </Btn>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Actions" value={total} accent="border-indigo-500" />
        <Stat label="In Progress" value={inProgressCount} accent="border-blue-500" />
        <Stat
          label="Overdue Actions"
          value={overdueCount}
          accent={overdueCount > 0 ? "border-red-500" : "border-slate-300"}
        />
        <Stat label="Completed / Closed" value={completedCount} accent="border-emerald-500" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actions by ID, description, owner..."
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All Priorities</option>
          {["Critical", "High", "Medium", "Low"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All Statuses</option>
          {["Open", "In Progress", "Blocked", "Pending Verification", "Completed", "Closed", "Overdue"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {total} actions
        </span>
      </div>

      {/* Table */}
      <Table
        columns={[
          {
            key: "id",
            header: "Action ID",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-indigo-600">
                {r.id}
              </span>
            ),
          },
          {
            key: "description",
            header: "Action Description",
            render: (r) => (
              <div className="max-w-md">
                <span className="font-semibold text-slate-800 line-clamp-1">{r.description}</span>
                {r.rootCause && (
                  <span className="text-slate-400 text-[11px] line-clamp-1">Root Cause: {r.rootCause}</span>
                )}
              </div>
            ),
          },
          {
            key: "progress",
            header: "Progress",
            render: (r) => (
              <div className="w-24">
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>{r.progress || (r.status === "Completed" ? 100 : 0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${r.progress || (r.status === "Completed" ? 100 : 0)}%` }}
                  />
                </div>
              </div>
            ),
          },
          { key: "owner", header: "Owner" },
          {
            key: "priority",
            header: "Priority",
            render: (r) => <Badge tone={r.priority}>{r.priority}</Badge>,
          },
          {
            key: "targetDate",
            header: "Target Date",
            render: (r) => fmtDate(r.targetDate),
          },
          {
            key: "daysRel",
            header: "Timeline",
            render: (r) => {
              const label = relDays(r.targetDate);
              const isOver = label.includes("overdue");
              return (
                <span className={`text-xs font-medium ${isOver ? "text-red-600 font-bold" : "text-slate-500"}`}>
                  {label}
                </span>
              );
            },
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
          },
          {
            key: "verificationStatus",
            header: "Verification",
            render: (r) => <Badge tone={r.verificationStatus}>{r.verificationStatus}</Badge>,
          },
        ]}
        rows={rows}
        onRowClick={(r) => openAction(r.id)}
        empty="No corrective actions match the current filter criteria."
      />

      {/* Modal for Creating Action */}
      <ActionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveAction}
      />
    </div>
  );
}
