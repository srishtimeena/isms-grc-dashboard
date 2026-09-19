import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { ticketSLA } from "../utils/sla.js";
import { fmtDate } from "../utils/date.js";

export function Tickets() {
  const { tickets, openTicket } = useApp();
  const [typeFilter, setTypeFilter] = useState("All");
  const [slaFilter,  setSlaFilter]  = useState("All");

  const rows = tickets
    .map((t) => ({ ...t, sla: ticketSLA(t) }))
    .filter((t) =>
      (typeFilter === "All" || t.type === typeFilter) &&
      (slaFilter  === "All" || t.sla.status === slaFilter)
    );

  return (
    <div className="max-w-[1280px] space-y-4 fade-in">
      <SectionTitle sub="ITIL-style remediation tickets linked to ISO findings, corrective actions, and controls. SLA is calculated from ticket creation time.">
        ITSM Remediation Tickets
      </SectionTitle>

      <div className="flex flex-wrap gap-2 items-center">
        <select className={`${inputCls} w-auto`} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>
          {["Incident","Service Request","Change"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className={`${inputCls} w-auto`} value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)}>
          <option>All</option>
          {["Within SLA","At Risk","Breached"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto font-medium">{rows.length} tickets</span>
      </div>

      <Table
        columns={[
          {
            key: "id", header: "Ticket ID",
            render: (r) => <span className="font-mono text-xs font-semibold text-indigo-600">{r.id}</span>,
          },
          { key: "type", header: "Type" },
          { key: "title", header: "Title" },
          {
            key: "priority", header: "Priority",
            render: (r) => <Badge tone={r.priority}>{r.priority}</Badge>,
          },
          { key: "assignmentGroup", header: "Group" },
          { key: "assignedTo", header: "Assigned to" },
          {
            key: "status", header: "Status",
            render: (r) => <Badge tone={r.status}>{r.status}</Badge>,
          },
          {
            key: "sla", header: "SLA",
            render: (r) => <Badge tone={r.sla.status}>{r.sla.status}</Badge>,
          },
          {
            key: "createdDate", header: "Created",
            render: (r) => fmtDate(r.createdDate),
          },
        ]}
        rows={rows}
        onRowClick={(r) => openTicket(r.id)}
        empty="No tickets match the current filters."
      />
    </div>
  );
}
