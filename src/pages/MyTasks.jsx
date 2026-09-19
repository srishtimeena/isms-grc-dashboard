import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { Stat } from "../components/ui/Stat.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { fmtDate, relDays } from "../utils/date.js";
import {
  CheckSquare, Clock, AlertCircle, ShieldAlert, FileText,
  FileCheck, ArrowRight, UserCheck, CheckCircle2
} from "lucide-react";

export function MyTasks() {
  const {
    role,
    currentUser,
    evidenceRequests,
    findings,
    actions,
    policies,
    risks,
    assessments,
    openFinding,
    openRisk,
    openAction,
    openPolicy,
    openEvidence,
    setSelectedControlId,
    setPage,
  } = useApp();

  // Compute dynamic task queue based on the currently active persona & role
  const tasks = useMemo(() => {
    const list = [];
    const r = role;

    // 1. Auditor / Lead Auditor tasks
    if (r === "Lead Auditor" || r === "Auditor" || r === "GRC Administrator") {
      // Evidence awaiting verification
      evidenceRequests?.filter(req => req.status === "Pending").forEach(req => {
        list.push({
          id: req.id,
          category: "Evidence Request",
          title: `Evidence Request: ${req.requirement}`,
          subtitle: `Control ${req.controlId} · Requested from ${req.requestedFrom}`,
          dueDate: req.dueDate,
          priority: req.priority,
          badgeTone: req.priority,
          type: "evidence_request",
          actionLabel: "View Request",
          onClick: () => {
            setPage("evidence");
          },
        });
      });

      // Findings awaiting verification / closure
      findings?.filter(f => f.status === "Pending Verification").forEach(f => {
        list.push({
          id: f.id,
          category: "Finding Verification",
          title: `Finding Awaiting Verification: ${f.title}`,
          subtitle: `${f.type} · Control ${f.controlId} · Owner: ${f.owner}`,
          dueDate: f.targetDate,
          priority: f.severity,
          badgeTone: f.severity,
          type: "finding_verify",
          actionLabel: "Verify Finding",
          onClick: () => openFinding(f.id),
        });
      });

      // Overdue findings
      findings?.filter(f => f.status === "Overdue" || (f.status === "Open" && f.targetDate && new Date(f.targetDate) < new Date())).forEach(f => {
        list.push({
          id: f.id,
          category: "Overdue Finding",
          title: `Overdue Finding: ${f.title}`,
          subtitle: `Severity ${f.severity} · Remediation Owner: ${f.owner}`,
          dueDate: f.targetDate,
          priority: "Critical",
          badgeTone: "Critical",
          type: "finding_overdue",
          actionLabel: "Inspect Finding",
          onClick: () => openFinding(f.id),
        });
      });
    }

    // 2. Control Owner / Evidence Contributor tasks
    if (r === "Control Owner" || r === "Evidence Contributor" || r === "GRC Administrator") {
      evidenceRequests?.filter(req => req.status === "Pending").forEach(req => {
        list.push({
          id: req.id,
          category: "Action Required",
          title: `Upload Evidence: ${req.requirement}`,
          subtitle: `Control ${req.controlId} · Requested by ${req.requestedBy}`,
          dueDate: req.dueDate,
          priority: req.priority,
          badgeTone: req.priority,
          type: "upload_evidence",
          actionLabel: "Upload Evidence",
          onClick: () => {
            setPage("evidence");
          },
        });
      });

      // Corrective actions assigned to me or overdue
      actions?.filter(a => a.status === "Overdue" || a.status === "In Progress").forEach(a => {
        list.push({
          id: a.id,
          category: "Corrective Action (CAPA)",
          title: a.description,
          subtitle: `Priority ${a.priority} · Status: ${a.status} · Progress: ${a.progress || 0}%`,
          dueDate: a.targetDate,
          priority: a.priority,
          badgeTone: a.status === "Overdue" ? "Overdue" : a.priority,
          type: "action_due",
          actionLabel: "Update Progress",
          onClick: () => openAction(a.id),
        });
      });
    }

    // 3. Reviewer / Approver tasks
    if (r === "Reviewer/Approver" || r === "GRC Manager" || r === "GRC Administrator") {
      policies?.filter(p => p.status === "Under Review").forEach(p => {
        list.push({
          id: p.id,
          category: "Policy Sign-off",
          title: `Review Policy: ${p.name} v${p.version}`,
          subtitle: `Submitted by ${p.owner} · Department: ${p.department}`,
          dueDate: p.reviewDate,
          priority: "High",
          badgeTone: "High",
          type: "policy_signoff",
          actionLabel: "Review Policy",
          onClick: () => openPolicy(p.id),
        });
      });

      policies?.filter(p => p.status === "Review Due").forEach(p => {
        list.push({
          id: p.id,
          category: "Policy Review Due",
          title: `Annual Review Due: ${p.name}`,
          subtitle: `Next review anniversary: ${fmtDate(p.reviewDate)}`,
          dueDate: p.reviewDate,
          priority: "Medium",
          badgeTone: "Medium",
          type: "policy_review",
          actionLabel: "View Policy",
          onClick: () => openPolicy(p.id),
        });
      });
    }

    // 4. Risk Manager tasks
    if (r === "Risk Manager" || r === "GRC Administrator") {
      risks?.filter(rk => rk.status === "Treatment Overdue" || (rk.residualScore ?? rk.inherentScore) >= 15).forEach(rk => {
        list.push({
          id: rk.id,
          category: "Risk Treatment",
          title: `High Risk Mitigation: ${rk.title}`,
          subtitle: `Score: ${rk.inherentScore} · Strategy: ${rk.treatment} · Owner: ${rk.owner}`,
          dueDate: rk.targetDate,
          priority: "Critical",
          badgeTone: "Critical",
          type: "risk_treatment",
          actionLabel: "Inspect Risk",
          onClick: () => openRisk(rk.id),
        });
      });
    }

    // 5. Read-Only / Management Viewer summary items
    if (r === "Read-Only/Management Viewer") {
      risks?.filter(rk => (rk.residualScore ?? rk.inherentScore) >= 15 && rk.status !== "Closed").forEach(rk => {
        list.push({
          id: rk.id,
          category: "Executive Attention",
          title: `Critical Enterprise Risk: ${rk.title}`,
          subtitle: `Score ${rk.inherentScore} · Owner: ${rk.owner}`,
          dueDate: rk.targetDate,
          priority: "Critical",
          badgeTone: "Critical",
          type: "exec_risk",
          actionLabel: "View Risk Details",
          onClick: () => openRisk(rk.id),
        });
      });

      findings?.filter(f => f.severity === "Critical" && f.status !== "Closed").forEach(f => {
        list.push({
          id: f.id,
          category: "Executive Attention",
          title: `Critical Audit Gap: ${f.title}`,
          subtitle: `Control ${f.controlId} · Owner: ${f.owner}`,
          dueDate: f.targetDate,
          priority: "Critical",
          badgeTone: "Critical",
          type: "exec_finding",
          actionLabel: "View Finding",
          onClick: () => openFinding(f.id),
        });
      });
    }

    return list;
  }, [role, evidenceRequests, findings, actions, policies, risks, openFinding, openRisk, openAction, openPolicy, setPage]);

  // SLA / Timeline calculations
  const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const highPriorityCount = tasks.filter(t => ["Critical", "High"].includes(t.priority)).length;

  return (
    <div className="max-w-[1280px] space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">My Tasks & Work Queue</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Role: {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-personalized action queue based on active persona ({currentUser?.name || role}).
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Action Items" value={tasks.length} accent="border-indigo-500" />
        <Stat
          label="High / Critical Priority"
          value={highPriorityCount}
          accent={highPriorityCount > 0 ? "border-orange-500" : "border-slate-300"}
        />
        <Stat
          label="Past Due Date"
          value={overdueCount}
          accent={overdueCount > 0 ? "border-red-600" : "border-slate-300"}
        />
        <Stat label="Role Persona" value={currentUser?.name?.split(" ")[0] || "Active"} accent="border-emerald-500" />
      </div>

      {/* Tasks Queue List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <div className="font-semibold text-slate-700 text-sm">No Pending Tasks for Current Persona</div>
            <p>You are completely caught up with your scheduled audits, sign-offs, and remediation duties.</p>
          </div>
        ) : (
          tasks.map((task, idx) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <div
                key={idx}
                className={`p-4 bg-white rounded-xl border transition-all hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isOverdue ? "border-red-200 bg-red-50/10" : "border-slate-200"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                      {task.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {task.category}
                    </span>
                    <Badge tone={task.badgeTone}>{task.priority}</Badge>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
                  <p className="text-xs text-slate-500">{task.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 text-[10px] block">Due Date</span>
                    <span className={`font-mono font-medium ${isOverdue ? "text-red-600 font-bold" : "text-slate-700"}`}>
                      {fmtDate(task.dueDate)}
                    </span>
                  </div>
                  <Btn size="sm" variant="primary" onClick={task.onClick}>
                    <span>{task.actionLabel}</span>
                    <ArrowRight size={12} />
                  </Btn>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
