import { useState } from "react";
import { SlideOver } from "../ui/SlideOver.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Detail } from "../ui/Detail.jsx";
import { Btn } from "../ui/Btn.jsx";
import { Callout } from "../ui/Callout.jsx";
import { CommentsSection } from "../ui/CommentsSection.jsx";
import { fmtDate } from "../../utils/date.js";
import { hasPermission, checkSegregationOfDuties } from "../../constants/permissions.js";
import { useApp } from "../../context/AppContext.jsx";
import {
  FileText, Download, CheckCircle2, XCircle, AlertCircle, Hash,
  ArrowRight, ShieldCheck, History, RefreshCw, UploadCloud
} from "lucide-react";

export function EvidencePanel({ id, onClose }) {
  const {
    evidence,
    role,
    currentUser,
    verifyEvidence,
    updateEvidence,
    addComment,
    setSelectedControlId,
    setPage,
  } = useApp();

  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'history'
  const [reviewNote, setReviewNote] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  const e = evidence?.find((x) => x.id === id);
  if (!e) return null;

  const canVerify = hasPermission(role, "evidence", "verify");
  const canReplace = hasPermission(role, "evidence", "replace");

  // SoD: Uploader cannot approve their own evidence
  const sodCheck = checkSegregationOfDuties(role, "verifyEvidence", e, currentUser?.name);

  const handleDownload = () => {
    const content = `Evidence Record: ${e.id} - ${e.name || e.description}\nControl: ${e.controlId}\nUploaded By: ${e.uploadedBy}\nUpload Date: ${e.uploadDate}\nSHA-256: ${e.hash}\n\nDescription:\n${e.description}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = e.fileName || `${e.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateReplace = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      updateEvidence(e.id, {
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toISOString(),
        status: "Under Review",
        reviewStatus: "Pending",
        hash: "sha256-" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      });
      setIsReplacing(false);
    }
  };

  const handleVerificationAction = (status) => {
    verifyEvidence(e.id, status, reviewNote || `Marked as ${status} by ${currentUser?.name || role}`);
    setReviewNote("");
  };

  return (
    <SlideOver
      title={`Evidence ${e.id}`}
      subtitle={`${e.type} · Control ${e.controlId}`}
      onClose={onClose}
      width="max-w-xl"
    >
      {/* Status Badges Header */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        <Badge tone={e.status}>{e.status}</Badge>
        <Badge tone={e.verificationStatus || e.status}>{e.verificationStatus || e.status}</Badge>
        <Badge tone="Not Applicable">{e.confidentiality || "Internal"}</Badge>
        <span className="text-xs text-slate-400 ml-auto">
          Period: <strong className="text-slate-700">{e.period || "2026"}</strong>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 mt-2">
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-2.5 text-xs font-semibold transition-colors relative ${
            activeTab === "details"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Evidence Details
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2.5 text-xs font-semibold transition-colors relative flex items-center gap-1.5 ${
            activeTab === "history"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <History size={12} />
          <span>Audit History ({e.history?.length || 1})</span>
        </button>
      </div>

      {activeTab === "details" && (
        <div className="pt-3 space-y-4 text-xs">
          {/* Linked Control Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target ISO Control</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{e.controlId}</div>
              <div className="text-slate-500 text-[11px]">{e.requirement}</div>
            </div>
            <button
              onClick={() => {
                onClose();
                setSelectedControlId(e.controlId);
                setPage("controls");
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-white text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1"
            >
              <span>View Control</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <Detail label="Evidence Description & Scope" value={e.description} />

          <div className="grid grid-cols-2 gap-3">
            <Detail label="Submitted By" value={e.uploadedBy || e.owner} />
            <Detail label="Submission Date" value={fmtDate(e.uploadDate || e.submissionDate)} />
            <Detail label="Valid Until (Expiry)" value={fmtDate(e.expiryDate)} />
            <Detail label="Confidentiality" value={e.confidentiality || "Internal"} />
          </div>

          {/* Cryptographic Hash & File Info */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                <span className="font-semibold text-slate-800">{e.fileName || "audit_artifact.pdf"}</span>
                <span className="text-slate-400 font-mono text-[10px]">({e.fileSize || "1.8 MB"})</span>
              </div>
              <div className="flex items-center gap-2">
                <Btn size="sm" variant="secondary" onClick={handleDownload}>
                  <Download size={12} />
                  <span>Download</span>
                </Btn>
                {canReplace && (
                  <label className="cursor-pointer px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 shadow-2xs inline-flex items-center gap-1">
                    <RefreshCw size={11} />
                    <span>Replace</span>
                    <input type="file" onChange={handleSimulateReplace} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {e.hash && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 font-mono text-[10px] text-slate-500 truncate">
                <Hash size={12} className="text-slate-400 shrink-0" />
                <span className="truncate" title={e.hash}>{e.hash}</span>
              </div>
            )}
          </div>

          {/* Verification & Auditor Assessment Box */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span>Auditor Verification</span>
              </div>
              <Badge tone={e.status}>{e.status}</Badge>
            </div>

            {e.reviewComments && (
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                <strong>Reviewer Feedback:</strong> {e.reviewComments}
              </div>
            )}

            {/* Verification Actions */}
            {!sodCheck.allowed ? (
              <Callout tone="amber">{sodCheck.reason}</Callout>
            ) : !canVerify ? (
              <Callout tone="slate">Auditor or Reviewer role required to record evidence verification.</Callout>
            ) : (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Auditor Review Notes / Determination:
                  </label>
                  <input
                    type="text"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="e.g. Confirmed sampling across AWS accounts; evidence meets control criteria."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Btn size="sm" variant="primary" onClick={() => handleVerificationAction("Accepted")}>
                    <CheckCircle2 size={12} />
                    <span>Accept Evidence</span>
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleVerificationAction("Rejected")}>
                    <XCircle size={12} />
                    <span>Reject</span>
                  </Btn>
                  <Btn size="sm" variant="secondary" onClick={() => handleVerificationAction("Insufficient")}>
                    <AlertCircle size={12} />
                    <span>Mark Insufficient</span>
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: History Trail */}
      {activeTab === "history" && (
        <div className="pt-3 space-y-2 text-xs">
          {(e.history || []).map((h, i) => (
            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-800">{h.action}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">By {h.user}</div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{fmtDate(h.date)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Collaboration Comments */}
      <CommentsSection
        comments={e.comments || []}
        onAddComment={(txt) => addComment("evidence", e.id, txt)}
        title="Evidence Review Comments"
      />
    </SlideOver>
  );
}
