import { useState } from "react";
import { Plus, Search, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Download } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { fmtDate } from "../utils/date.js";
import { hasPermission } from "../constants/permissions.js";
import { PolicyModal } from "../components/forms/PolicyModal.jsx";

export function Policies() {
  const { policies, role, openPolicy, createPolicy } = useApp();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreate = hasPermission(role, "policy", "create");

  // Summary Metrics
  const totalPolicies = policies?.length || 0;
  const publishedCount = policies?.filter((p) => p.status === "Published")?.length || 0;
  const underReviewCount = policies?.filter((p) => p.status === "Under Review")?.length || 0;
  const reviewDueCount = policies?.filter((p) => p.status === "Review Due")?.length || 0;

  // Filter rows
  const rows = (policies || []).filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (classFilter !== "All" && p.classification !== classFilter) return false;
    if (q && !(`${p.id} ${p.name} ${p.owner} ${p.type}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleSaveNew = (data) => {
    createPolicy(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Policy Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ISMS policy governance suite, lifecycle sign-offs, version tracking, and ISO 27001 control mapping.
          </p>
        </div>
        {canCreate && (
          <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            <span>Draft New Policy</span>
          </Btn>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Policies" value={totalPolicies} accent="border-indigo-500" />
        <Stat label="Published & Active" value={publishedCount} accent="border-emerald-500" />
        <Stat label="Under Review" value={underReviewCount} accent="border-blue-500" />
        <Stat
          label="Review Due"
          value={reviewDueCount}
          accent={reviewDueCount > 0 ? "border-amber-500" : "border-slate-300"}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search policies by ID, title, owner..."
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All</option>
          {["Draft", "Under Review", "Approved", "Published", "Review Due", "Archived"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All</option>
          {["Public", "Internal", "Confidential", "Restricted"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {totalPolicies} policies
        </span>
      </div>

      {/* Policy Catalog Table */}
      <Table
        columns={[
          {
            key: "id",
            header: "Policy ID",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-indigo-600">
                {r.id}
              </span>
            ),
          },
          {
            key: "name",
            header: "Policy Name",
            render: (r) => (
              <div>
                <span className="font-semibold text-slate-800">{r.name}</span>
                <span className="text-slate-400 text-[11px] block">{r.type}</span>
              </div>
            ),
          },
          {
            key: "version",
            header: "Version",
            render: (r) => (
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                v{r.version}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
          },
          {
            key: "classification",
            header: "Classification",
            render: (r) => (
              <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                {r.classification}
              </span>
            ),
          },
          {
            key: "owner",
            header: "Owner",
            render: (r) => (
              <div>
                <span className="text-xs text-slate-800 font-medium">{r.owner}</span>
                <span className="text-slate-400 text-[11px] block">{r.department}</span>
              </div>
            ),
          },
          {
            key: "reviewDate",
            header: "Next Review",
            render: (r) => (
              <span className={`text-xs ${r.status === "Review Due" ? "text-amber-600 font-semibold" : "text-slate-600"}`}>
                {fmtDate(r.reviewDate)}
              </span>
            ),
          },
        ]}
        rows={rows}
        onRowClick={(r) => openPolicy(r.id)}
        empty="No policies match the current filter criteria."
      />

      {/* Modal for Creating Policy */}
      <PolicyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNew}
      />
    </div>
  );
}
