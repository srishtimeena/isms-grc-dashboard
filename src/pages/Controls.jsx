import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { CONTROLS, ANNEX_A } from "../constants/iso27001.js";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { ControlDetail } from "./ControlDetail.jsx";

export function Controls() {
  const { assessments, selectedControlId, setSelectedControlId } = useApp();
  const [q, setQ] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [implFilter, setImplFilter] = useState("All");

  const selected = selectedControlId ? CONTROLS.find((c) => c.id === selectedControlId) : null;

  if (selected) {
    return <ControlDetail control={selected} onBack={() => setSelectedControlId(null)} />;
  }

  // Summary Metrics
  const total = CONTROLS.length;
  const compliantCount = CONTROLS.filter(c => assessments[c.id]?.status === "Compliant").length;
  const partialCount = CONTROLS.filter(c => assessments[c.id]?.status === "Partially Compliant").length;
  const nonCompliantCount = CONTROLS.filter(c => assessments[c.id]?.status === "Non-Compliant").length;

  const rows = CONTROLS.filter((c) => {
    const a = assessments[c.id];
    const status = a ? a.status : "Not Assessed";
    const implStatus = a ? a.implementationStatus : "Not Implemented";
    if (domainFilter !== "All" && c.domain !== domainFilter) return false;
    if (statusFilter !== "All" && status !== statusFilter) return false;
    if (implFilter !== "All" && implStatus !== implFilter) return false;
    if (q && !(`${c.id} ${c.title} ${a?.owner || ""}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1280px] space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ISO 27001 Control Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            93 Annex A controls across 4 domains. Track implementation status, maturity levels, and objective evidence.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Annex A Controls" value={total} accent="border-indigo-500" />
        <Stat label="Compliant Controls" value={compliantCount} accent="border-emerald-500" />
        <Stat label="Partially Compliant" value={partialCount} accent="border-amber-500" />
        <Stat
          label="Non-Compliant"
          value={nonCompliantCount}
          accent={nonCompliantCount > 0 ? "border-red-500" : "border-slate-300"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, title, or owner…"
            className={`${inputCls} pl-8 w-64`}
          />
        </div>

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All Domains</option>
          {ANNEX_A.map(([d, n]) => (
            <option key={d} value={d}>{d} — {n}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All Assessment Statuses</option>
          {["Compliant", "Partially Compliant", "Non-Compliant", "Not Applicable", "Not Assessed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={implFilter}
          onChange={(e) => setImplFilter(e.target.value)}
          className={`${inputCls} w-auto`}
        >
          <option>All Implementation Statuses</option>
          {["Implemented", "Partially Implemented", "Not Implemented", "Needs Improvement"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          {rows.length} of {CONTROLS.length} controls
        </span>
      </div>

      <Table
        columns={[
          {
            key: "id",
            header: "Control ID",
            render: (r) => <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span>,
          },
          {
            key: "title",
            header: "Control Title",
            render: (r) => (
              <div>
                <span className="font-semibold text-slate-800 block">{r.title}</span>
                <span className="text-slate-400 text-[11px] block">{r.domainName}</span>
              </div>
            ),
          },
          {
            key: "impl",
            header: "Implementation",
            render: (r) => {
              const a = assessments[r.id];
              const st = a?.implementationStatus || (a?.status === "Compliant" ? "Implemented" : "Partially Implemented");
              return <Badge tone={st}>{st}</Badge>;
            },
          },
          {
            key: "maturity",
            header: "Maturity",
            render: (r) => {
              const a = assessments[r.id];
              return (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  L{a?.maturityLevel ?? 3}
                </span>
              );
            },
          },
          {
            key: "status",
            header: "Compliance",
            render: (r) => {
              const a = assessments[r.id];
              return <Badge tone={a?.status ?? "Not Assessed"}>{a?.status ?? "Not Assessed"}</Badge>;
            },
          },
          {
            key: "score",
            header: "Score",
            render: (r) => {
              const a = assessments[r.id];
              return a?.score != null ? (
                <span className="tabular-nums font-semibold text-slate-800">{a.score}%</span>
              ) : "—";
            },
          },
          {
            key: "owner",
            header: "Control Owner",
            render: (r) => {
              const a = assessments[r.id];
              return <span className="text-xs text-slate-600">{a?.owner || "Cloud Platform"}</span>;
            },
          },
        ]}
        rows={rows}
        onRowClick={(r) => setSelectedControlId(r.id)}
        empty="No controls match the current filters."
      />
    </div>
  );
}
