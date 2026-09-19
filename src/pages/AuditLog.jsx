import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { fmtDate } from "../utils/date.js";
import { History, Download, Search, Filter, ShieldAlert } from "lucide-react";
import { hasPermission } from "../constants/permissions.js";

export function AuditLog() {
  const { trail, role } = useApp();
  const [q, setQ] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");

  // Page-level access guard
  if (!hasPermission(role, "trail", "view")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 fade-in">
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
          <ShieldAlert size={36} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          The Audit Trail is restricted to GRC Administrators, GRC Managers, Lead Auditors,
          Compliance Managers, and Management Viewers.
        </p>
        <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-full">Current role: {role}</p>
      </div>
    );
  }

  const totalEvents = trail?.length || 0;

  // Extract unique modules and users for dropdowns
  const modules = ["All", ...new Set((trail || []).map((t) => t.module).filter(Boolean))];
  const users = ["All", ...new Set((trail || []).map((t) => t.user).filter(Boolean))];

  // Filter rows
  const rows = (trail || []).filter((t) => {
    if (moduleFilter !== "All" && t.module !== moduleFilter) return false;
    if (userFilter !== "All" && t.user !== userFilter) return false;
    if (q && !(`${t.action} ${t.details || ""} ${t.object || ""} ${t.user || ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Event ID", "Timestamp", "User", "Role", "Action", "Module", "Target Object", "Previous Value", "New Value"];
    const csvRows = [headers.join(",")];

    rows.forEach((r) => {
      const row = [
        r.id,
        r.timestamp,
        `"${r.user || "System"}"`,
        `"${r.role || "—"}"`,
        `"${r.action || "—"}"`,
        `"${r.module || "—"}"`,
        `"${r.object || "—"}"`,
        `"${(r.previousValue || "—").replace(/"/g, '""')}"`,
        `"${(r.newValue || r.details || "—").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `isms_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ISMS Audit Trail & Activity Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological ledger recording all policy modifications, evidence reviews, risk updates, and GRC operations.
          </p>
        </div>
        <Btn variant="primary" onClick={handleExportCSV}>
          <Download size={14} />
          <span>Export Audit Trail (CSV)</span>
        </Btn>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Logged Events" value={totalEvents} accent="border-indigo-500" />
        <Stat label="Active Modules Logged" value={modules.length - 1} accent="border-blue-500" />
        <Stat label="Distinct Actors" value={users.length - 1} accent="border-purple-500" />
        <Stat label="Integrity Assurance" value="SHA-256" accent="border-emerald-500" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search action, object, or details..."
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          {modules.map((m) => (
            <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>
          ))}
        </select>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          {users.map((u) => (
            <option key={u} value={u}>{u === "All" ? "All Actors" : u}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {totalEvents} events
        </span>
      </div>

      {/* Table */}
      <Table
        columns={[
          {
            key: "timestamp",
            header: "Timestamp",
            render: (r) => (
              <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
                {fmtDate(r.timestamp)}
              </span>
            ),
          },
          {
            key: "user",
            header: "User / Actor",
            render: (r) => (
              <div>
                <span className="font-semibold text-slate-800 text-xs block">{r.user || "System"}</span>
                {r.role && <span className="text-slate-400 text-[10px] block">{r.role}</span>}
              </div>
            ),
          },
          {
            key: "action",
            header: "Action / Operation",
            render: (r) => (
              <span className="font-semibold text-slate-800 text-xs">
                {r.action}
              </span>
            ),
          },
          {
            key: "module",
            header: "Module",
            render: (r) => (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {r.module || "General"}
              </span>
            ),
          },
          {
            key: "object",
            header: "Target Object",
            render: (r) => (
              <span className="font-mono text-xs font-bold text-indigo-700">
                {r.object || "—"}
              </span>
            ),
          },
          {
            key: "diff",
            header: "Value Transition / Details",
            render: (r) => (
              <div className="text-xs text-slate-600 max-w-xs truncate">
                {r.previousValue && r.previousValue !== "—" ? (
                  <span>
                    <span className="line-through text-slate-400">{r.previousValue}</span>
                    {" → "}
                    <strong className="text-slate-800">{r.newValue}</strong>
                  </span>
                ) : (
                  <span>{r.newValue || r.details || "—"}</span>
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
        empty="No audit events match the selected filters."
      />
    </div>
  );
}
