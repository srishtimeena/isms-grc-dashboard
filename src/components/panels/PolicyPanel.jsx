import { useState } from "react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { CommentsSection } from "../ui/CommentsSection.jsx";
import { fmtDate, daysFromNow } from "../../utils/date.js";
import { hasPermission, checkSegregationOfDuties } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";
import {
  FileText, Download, CheckCircle2, XCircle, Clock, History,
  GitCommit, ArrowRight, ShieldCheck, AlertCircle, Plus, Send
} from "lucide-react";

export function PolicyPanel({ id, onClose }) {
  const {
    policies,
    role,
    currentUser,
    updatePolicy,
    addPolicyVersion,
    changePolicyStatus,
    addComment,
    setSelectedControlId,
    setPage,
  } = useApp();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'versions' | 'workflow'
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [newVersionTag, setNewVersionTag] = useState("");
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [workflowNote, setWorkflowNote] = useState("");

  const p = policies?.find((x) => x.id === id);
  if (!p) return null;

  const canEdit = hasPermission(role, "policy", "edit");
  const canApprove = hasPermission(role, "policy", "approve");
  const canSubmit = hasPermission(role, "policy", "submit");

  // Segregation of Duties check: author cannot approve own policy
  const sodCheck = checkSegregationOfDuties(role, "approvePolicy", p, currentUser?.name);

  const handleDownloadDoc = () => {
    const textContent = `# ${p.id} — ${p.name}\nVersion: ${p.version}\nClassification: ${p.classification}\nOwner: ${p.owner} (${p.department})\nEffective: ${p.effectiveDate}\n\n${p.content}\n\n--- Applicable Framework ---\n${p.applicableFramework}`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = p.documentName || `${p.id}_${p.version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddVersion = (e) => {
    e?.preventDefault?.();
    if (!newVersionTag.trim() || !newVersionSummary.trim()) return;
    addPolicyVersion(p.id, {
      version: newVersionTag.trim(),
      summary: newVersionSummary.trim(),
      changes: newVersionSummary.trim(),
      changedBy: currentUser?.name || role,
    });
    setNewVersionTag("");
    setNewVersionSummary("");
    setShowVersionForm(false);
  };

  const handleAddPolicyComment = (text) => {
    addComment("policy", p.id, text);
  };

  return (
    <SlideOver
      title={`${p.id} — ${p.name}`}
      subtitle={`${p.type} · Version ${p.version}`}
      onClose={onClose}
      width="max-w-2xl"
    >
      {/* Status Badges Row */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        <Badge tone={p.status}>{p.status}</Badge>
        <Badge tone="Not Applicable">{p.classification}</Badge>
        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          v{p.version}
        </span>
        <span className="text-xs text-slate-400 ml-auto">
          Owner: <strong className="text-slate-700">{p.owner}</strong>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 mt-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 text-xs font-semibold transition-colors relative ${
            activeTab === "overview"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Details & Scope
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`pb-2.5 text-xs font-semibold transition-colors relative flex items-center gap-1.5 ${
            activeTab === "versions"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <History size={12} />
          <span>Version History ({p.versions?.length || 1})</span>
        </button>
        <button
          onClick={() => setActiveTab("workflow")}
          className={`pb-2.5 text-xs font-semibold transition-colors relative flex items-center gap-1.5 ${
            activeTab === "workflow"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <GitCommit size={12} />
          <span>Sign-off & Lifecycle</span>
        </button>
      </div>

      {/* TAB 1: Overview & Details */}
      {activeTab === "overview" && (
        <div className="pt-3 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
            <div className="font-semibold text-slate-800 mb-1">Policy Statement & Purpose</div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{p.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Detail label="Department" value={p.department} />
            <Detail label="Standard / Framework" value={p.applicableFramework} />
            <Detail label="Effective Date" value={fmtDate(p.effectiveDate)} />
            <Detail label="Review Due Date" value={fmtDate(p.reviewDate)} />
            <Detail label="Last Modified By" value={`${p.lastModifiedBy || p.owner} on ${fmtDate(p.lastModifiedDate)}`} />
            <Detail label="Approved By" value={p.approver || "Pending Formal Sign-off"} />
          </div>

          {/* Linked ISO Controls */}
          <div className="border-t border-slate-100 pt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>Related ISO 27001 Controls</span>
            </div>
            {(!p.relatedControlIds || p.relatedControlIds.length === 0) ? (
              <span className="text-xs text-slate-400">No linked controls.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {p.relatedControlIds.map((cid) => (
                  <button
                    key={cid}
                    onClick={() => {
                      onClose();
                      setSelectedControlId(cid);
                      setPage("controls");
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1"
                    title="View control details"
                  >
                    <span>{cid}</span>
                    <ArrowRight size={10} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Document Attachment & Download Simulation */}
          <div className="border-t border-slate-100 pt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Attached Document</div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">{p.documentName || `${p.id}_v${p.version}.pdf`}</div>
                  <div className="text-[10px] text-slate-400">Formal approved publication document</div>
                </div>
              </div>
              <Btn size="sm" variant="secondary" onClick={handleDownloadDoc}>
                <Download size={13} />
                <span>Download</span>
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Version History & Comparison */}
      {activeTab === "versions" && (
        <div className="pt-3 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Trail & Revisions
            </span>
            {canEdit && !showVersionForm && (
              <Btn size="sm" variant="secondary" onClick={() => setShowVersionForm(true)}>
                <Plus size={12} />
                <span>Create New Version</span>
              </Btn>
            )}
          </div>

          {/* New Version Form */}
          {showVersionForm && (
            <form onSubmit={handleAddVersion} className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-200 text-xs space-y-3">
              <div className="font-semibold text-indigo-900">Add Version Increment</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Version Number (e.g. 2.1)</label>
                  <input
                    type="text"
                    required
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                    placeholder="2.1"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Author</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.name || role}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-100 text-xs text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Summary of Modifications (What changed?)</label>
                <textarea
                  rows={2}
                  required
                  value={newVersionSummary}
                  onChange={(e) => setNewVersionSummary(e.target.value)}
                  placeholder="Describe specific clause amendments, regulatory changes, or control updates..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Btn size="sm" variant="secondary" onClick={() => setShowVersionForm(false)}>Cancel</Btn>
                <Btn size="sm" type="submit" variant="primary">Publish Version</Btn>
              </div>
            </form>
          )}

          {/* Timeline of Versions */}
          <div className="space-y-3">
            {(p.versions || []).map((v, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      v{v.version}
                    </span>
                    {i === (p.versions.length - 1) && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{fmtDate(v.changedDate)}</span>
                </div>
                <div className="text-slate-800 font-medium">{v.summary}</div>
                {v.changes && (
                  <div className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                    <strong className="text-slate-600">Details:</strong> {v.changes}
                  </div>
                )}
                <div className="text-[10px] text-slate-400">Modified by: <strong className="text-slate-600">{v.changedBy}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Workflow Sign-off & Lifecycle */}
      {activeTab === "workflow" && (
        <div className="pt-3 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="font-semibold text-slate-800 mb-1">Current Lifecycle Phase</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge tone={p.status}>{p.status}</Badge>
              <span className="text-slate-500 text-xs">
                {p.status === "Draft" && "Policy is currently being drafted by owner."}
                {p.status === "Under Review" && "Submitted for quality & compliance sign-off."}
                {p.status === "Approved" && "Formally ratified. Ready for publication."}
                {p.status === "Published" && "Active operational policy across organization."}
                {p.status === "Review Due" && "Annual review cycle is due or overdue."}
                {p.status === "Archived" && "Historical superseded version."}
              </span>
            </div>
          </div>

          {/* Workflow Transitions */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Available Lifecycle Actions
            </div>

            {/* If Draft -> Submit for review */}
            {p.status === "Draft" && (
              <div className="space-y-2">
                <p className="text-slate-600">
                  Ready to send this policy to the Reviewer/Approver or GRC Manager for formal sign-off?
                </p>
                <Btn
                  size="sm"
                  disabled={!canSubmit}
                  onClick={() => changePolicyStatus(p.id, "Under Review", "Submitted for executive review")}
                >
                  <Send size={13} />
                  <span>Submit for Formal Review</span>
                </Btn>
              </div>
            )}

            {/* If Under Review -> Approve or Reject */}
            {p.status === "Under Review" && (
              <div className="space-y-3">
                {!sodCheck.allowed ? (
                  <Callout tone="amber">
                    {sodCheck.reason}
                  </Callout>
                ) : !canApprove ? (
                  <Callout tone="slate">
                    Approving policies requires Reviewer/Approver, GRC Manager, or GRC Administrator role.
                  </Callout>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600">
                      As an authorized Reviewer/Approver, review policy clauses and record your determination:
                    </p>
                    <div className="flex items-center gap-2">
                      <Btn
                        size="sm"
                        variant="primary"
                        onClick={() => changePolicyStatus(p.id, "Approved", `Approved by ${currentUser?.name || role}`)}
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve Policy</span>
                      </Btn>
                      <Btn
                        size="sm"
                        variant="danger"
                        onClick={() => changePolicyStatus(p.id, "Draft", `Returned for revisions by ${currentUser?.name || role}`)}
                      >
                        <XCircle size={13} />
                        <span>Request Changes (Reject)</span>
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Approved -> Publish */}
            {p.status === "Approved" && (
              <div className="space-y-2">
                <p className="text-slate-600">
                  Policy has been approved. Publish to the organization as an active standard.
                </p>
                <Btn
                  size="sm"
                  variant="primary"
                  onClick={() => changePolicyStatus(p.id, "Published", "Published to active corporate intranet")}
                >
                  <CheckCircle2 size={13} />
                  <span>Publish to Entire Organization</span>
                </Btn>
              </div>
            )}

            {/* If Published -> Review Due or Archive */}
            {p.status === "Published" && (
              <div className="flex items-center gap-2">
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => changePolicyStatus(p.id, "Review Due", "Initiated annual review cycle")}
                >
                  <Clock size={13} />
                  <span>Mark Annual Review Due</span>
                </Btn>
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => changePolicyStatus(p.id, "Archived", "Archived superseded policy")}
                >
                  <span>Archive Policy</span>
                </Btn>
              </div>
            )}

            {p.status === "Review Due" && (
              <div className="space-y-2">
                <p className="text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                  Annual review is due. Owner should revise content and submit a new version for review.
                </p>
                <Btn
                  size="sm"
                  onClick={() => changePolicyStatus(p.id, "Under Review", "Annual review submitted")}
                >
                  <span>Re-submit for Review</span>
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Threaded Comments Section */}
      <CommentsSection
        comments={p.comments || []}
        onAddComment={handleAddPolicyComment}
        title="Policy Review Comments & Notes"
      />
    </SlideOver>
  );
}
