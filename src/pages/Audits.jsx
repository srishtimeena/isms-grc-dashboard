import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CONTROLS } from "../constants/iso27001.js";
import { Card } from "../components/ui/Card.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Detail } from "../components/ui/Detail.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { fmtDate } from "../utils/date.js";
import { hasPermission } from "../constants/permissions.js";
import { AuditModal } from "../components/forms/AuditModal.jsx";
import { ClipboardList, Plus, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export function Audits() {
  const { audits, compliance, findings, role, createAudit, setPage } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canCreate = hasPermission(role, "audit", "create");

  const handleSaveAudit = (data) => {
    const auditId = `AUD-2026-0${(audits?.length || 0) + 1}`;
    createAudit({
      ...data,
      id: auditId,
    });
    setIsCreateOpen(false);
  };

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal, supplier, and certification audit programs aligned with ISO/IEC 27001:2022 clause 9.2.
          </p>
        </div>
        {canCreate && (
          <Btn variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            <span>Plan New Audit</span>
          </Btn>
        )}
      </div>

      {/* Audits Cards */}
      <div className="space-y-4">
        {(audits || []).map((a) => {
          const auditFindings = (findings || []).filter((f) => f.auditId === a.id);
          const assessed = compliance.overall.assessed;
          const pct = CONTROLS.length > 0 ? ((assessed / CONTROLS.length) * 100).toFixed(0) : 0;
          return (
            <Card key={a.id} className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {a.id}
                    </span>
                    <Badge tone={a.status}>{a.status}</Badge>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{a.name}</h2>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{a.type}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setPage("reports");
                    }}
                  >
                    <FileText size={13} />
                    <span>Audit Report</span>
                  </Btn>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <Detail label="Lead Auditor" value={a.leadAuditor} />
                <Detail label="Audit Team" value={a.team} />
                <Detail label="Department" value={a.department || "Internal Audit"} />
                <Detail label="Audit Period" value={`${fmtDate(a.startDate)} – ${fmtDate(a.endDate)}`} />
              </div>

              <div className="space-y-1 text-xs">
                <Detail label="Audit Scope" value={a.scope} />
                <Detail label="Objectives" value={a.objectives} />
                <Detail label="Criteria & Standards" value={a.criteria} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <Stat label="Controls Assessed" value={`${assessed}/${CONTROLS.length}`} accent="border-indigo-500" />
                <Stat label="Annex A Progress" value={pct} suffix="%" accent="border-blue-500" />
                <Stat label="Findings Raised" value={auditFindings.length} accent="border-orange-500" />
                <Stat
                  label="Findings Closed"
                  value={auditFindings.filter((f) => f.status === "Closed" || f.status === "Resolved").length}
                  accent="border-emerald-500"
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal for Planning Audit */}
      <AuditModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveAudit}
      />
    </div>
  );
}
