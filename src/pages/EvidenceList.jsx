import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { inputCls } from "../components/ui/Field.jsx";
import { fmtDate, daysFromNow } from "../utils/date.js";
import { hasPermission } from "../constants/permissions.js";
import { EvidenceUploadModal } from "../components/forms/EvidenceUploadModal.jsx";
import { EvidenceRequestModal } from "../components/forms/EvidenceRequestModal.jsx";
import {
  UploadCloud, Send, Search, FileText, CheckCircle2, AlertTriangle,
  Clock, XCircle, ShieldCheck, ArrowRight, MessageSquare
} from "lucide-react";

export function EvidenceList() {
  const {
    evidence,
    evidenceRequests,
    role,
    currentUser,
    openEvidence,
    uploadEvidence,
    createEvidenceRequest,
    updateEvidenceRequest,
    setSelectedControlId,
    setPage,
  } = useApp();

  const [activeTab, setActiveTab] = useState("repository"); // 'repository' | 'requests'
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const canUpload = hasPermission(role, "evidence", "upload");
  const canRequest = hasPermission(role, "evidence", "request");

  // Summary Metrics
  const totalEvidence = evidence?.length || 0;
  const acceptedCount = evidence?.filter((e) => e.status === "Accepted" || e.verificationStatus === "Verified")?.length || 0;
  const underReviewCount = evidence?.filter((e) => e.status === "Under Review" || e.verificationStatus === "Not Verified")?.length || 0;
  const expiredCount = evidence?.filter((e) => e.status === "Expired" || (e.expiryDate && new Date(e.expiryDate) < new Date()))?.length || 0;
  const pendingRequestsCount = evidenceRequests?.filter((r) => r.status === "Pending")?.length || 0;

  // Filtered evidence records
  const filteredEvidence = (evidence || []).filter((e) => {
    if (statusFilter !== "All" && e.status !== statusFilter && e.verificationStatus !== statusFilter) return false;
    if (q && !(`${e.id} ${e.controlId} ${e.name || e.description} ${e.uploadedBy || e.owner}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  // Filtered evidence requests
  const filteredRequests = (evidenceRequests || []).filter((r) => {
    if (q && !(`${r.id} ${r.controlId} ${r.requirement} ${r.requestedFrom} ${r.requestedBy}`).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Evidence Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect, verify, and maintain objective audit artifacts and track evidence request workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canRequest && (
            <Btn variant="secondary" onClick={() => setIsRequestOpen(true)}>
              <Send size={13} />
              <span>Request Evidence</span>
            </Btn>
          )}
          {canUpload && (
            <Btn variant="primary" onClick={() => setIsUploadOpen(true)}>
              <UploadCloud size={14} />
              <span>Upload Evidence</span>
            </Btn>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Artifacts" value={totalEvidence} accent="border-indigo-500" />
        <Stat label="Verified & Accepted" value={acceptedCount} accent="border-emerald-500" />
        <Stat label="Pending Review" value={underReviewCount} accent="border-amber-500" />
        <Stat
          label="Open Requests"
          value={pendingRequestsCount}
          accent={pendingRequestsCount > 0 ? "border-sky-500" : "border-slate-300"}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("repository")}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
            activeTab === "repository"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={15} />
          <span>Evidence Repository ({totalEvidence})</span>
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
            activeTab === "requests"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock size={15} />
          <span>Evidence Requests ({evidenceRequests?.length || 0})</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Evidence Repository */}
      {activeTab === "repository" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by ID, control, filename..."
                className={`${inputCls} pl-8 w-64`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} w-auto`}
            >
              <option>All</option>
              {["Accepted", "Under Review", "Verified", "Rejected", "Insufficient", "Expired"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <span className="text-xs text-slate-400 ml-auto font-medium">
              {filteredEvidence.length} of {totalEvidence} records
            </span>
          </div>

          <Table
            columns={[
              {
                key: "id",
                header: "Evidence ID",
                render: (r) => (
                  <span className="font-mono text-xs font-semibold text-indigo-600">
                    {r.id}
                  </span>
                ),
              },
              {
                key: "controlId",
                header: "Control",
                render: (r) => (
                  <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {r.controlId}
                  </span>
                ),
              },
              {
                key: "name",
                header: "Evidence Title / Artifact",
                render: (r) => (
                  <div>
                    <span className="font-semibold text-slate-800 block truncate max-w-xs">
                      {r.name || r.description}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono block">
                      {r.fileName || `${r.id}.pdf`} {r.fileSize && `· ${r.fileSize}`}
                    </span>
                  </div>
                ),
              },
              {
                key: "type",
                header: "Type",
                render: (r) => <span className="text-xs text-slate-600">{r.type}</span>,
              },
              {
                key: "uploadedBy",
                header: "Submitted By",
                render: (r) => (
                  <div>
                    <span className="text-xs text-slate-800 font-medium">{r.uploadedBy || r.owner}</span>
                    <span className="text-slate-400 text-[11px] block">{fmtDate(r.uploadDate || r.submissionDate)}</span>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (r) => <Badge tone={r.status || r.verificationStatus}>{r.status || r.verificationStatus}</Badge>,
              },
              {
                key: "expiryDate",
                header: "Valid Until",
                render: (r) => {
                  const isExpired = r.expiryDate && new Date(r.expiryDate) < new Date();
                  return (
                    <span className={`text-xs ${isExpired ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                      {fmtDate(r.expiryDate)}
                    </span>
                  );
                },
              },
            ]}
            rows={filteredEvidence}
            onRowClick={(r) => openEvidence(r.id)}
            empty="No evidence records match the current filter criteria."
          />
        </div>
      )}

      {/* TAB 2: Evidence Requests Workflow */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Audit evidence requests requiring collection and submission
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {filteredRequests.length} requests
            </span>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                No open evidence requests. Use &ldquo;Request Evidence&rdquo; to dispatch inquiries to control owners.
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isAssignedToMe = currentUser?.name && req.requestedFrom.includes(currentUser.name);
                return (
                  <div
                    key={req.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {req.id}
                        </span>
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {req.controlId}
                        </span>
                        <Badge tone={req.priority}>{req.priority} Priority</Badge>
                        <Badge tone={req.status === "Pending" ? "In Progress" : "Completed"}>{req.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <span>Due:</span>
                        <strong className="text-slate-800">{fmtDate(req.dueDate)}</strong>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{req.requirement}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {req.comment}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Requested From:</span>
                        <span className="font-semibold text-slate-800">{req.requestedFrom}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Requested By:</span>
                        <span className="font-semibold text-slate-800">{req.requestedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Date Issued:</span>
                        <span className="text-slate-600">{fmtDate(req.createdDate)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "Pending" && (
                          <Btn
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setIsUploadOpen(true);
                            }}
                          >
                            <UploadCloud size={12} />
                            <span>Fulfill Request</span>
                          </Btn>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <EvidenceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(data) => uploadEvidence(data)}
      />

      <EvidenceRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onRequest={(data) => createEvidenceRequest(data)}
      />
    </div>
  );
}
