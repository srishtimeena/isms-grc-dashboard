import { useState, useEffect, useCallback, useMemo } from "react";
import { AppContext } from "./context/AppContext.jsx";
import { storageService } from "./services/storage.js";
import { seed } from "./data/seed.js";
import { useCompliance } from "./utils/compliance.js";
import { uid, iso, NOW, daysFromNow } from "./utils/date.js";
import { DEMO_PERSONAS } from "./constants/permissions.js";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { AppHeader } from "./components/layout/AppHeader.jsx";
import { DetailPanel } from "./components/panels/DetailPanel.jsx";
import { GlobalSearch } from "./components/layout/GlobalSearch.jsx";
import { Login } from "./pages/Login.jsx";

// Pages
import { Dashboard } from "./pages/Dashboard.jsx";
import { MyTasks } from "./pages/MyTasks.jsx";
import { Policies } from "./pages/Policies.jsx";
import { Controls } from "./pages/Controls.jsx";
import { Audits } from "./pages/Audits.jsx";
import { EvidenceList } from "./pages/EvidenceList.jsx";
import { Findings } from "./pages/Findings.jsx";
import { Risks } from "./pages/Risks.jsx";
import { Actions } from "./pages/Actions.jsx";
import { Tickets } from "./pages/Tickets.jsx";
import { Traceability } from "./pages/Traceability.jsx";
import { Analytics } from "./pages/Analytics.jsx";
import { Reports } from "./pages/Reports.jsx";
import { AuditLog } from "./pages/AuditLog.jsx";
import { Admin } from "./pages/Admin.jsx";

export default function App() {
  const [data, setData] = useState(() => seed());
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState(() => localStorage.getItem("isms_role") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("isms_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [panel, setPanel] = useState(null); // { type: 'finding'|'risk'|'action'|'ticket'|'policy'|'evidence', id }
  const [selectedControlId, setSelectedControlId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const login = useCallback((persona) => {
    setCurrentUser(persona);
    setRole(persona.role);
    localStorage.setItem("isms_user", JSON.stringify(persona));
    localStorage.setItem("isms_role", persona.role);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setRole(null);
    localStorage.removeItem("isms_user");
    localStorage.removeItem("isms_role");
  }, []);

  // Load from persistent storage on initial mount
  useEffect(() => {
    async function loadState() {
      try {
        const stored = await storageService.get();
        if (stored && stored.assessments) {
          setData(stored);
        }
      } catch (err) {
        console.warn("Could not load stored ISMS state, using seed:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadState();
  }, []);

  // Save to persistent storage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      storageService.set("isms-grc-state-v1", data).catch((err) => {
        console.warn("Storage sync failed:", err);
      });
    }
  }, [data, isLoaded]);

  const {
    assessments = {},
    policies = [],
    evidence = [],
    evidenceRequests = [],
    findings = [],
    risks = [],
    actions = [],
    tickets = [],
    audits = [],
    notifications = [],
    users = [],
    trail = [],
  } = data;

  // Compute live ISO compliance metrics
  const compliance = useCompliance(assessments);

  // Helper to append an audit trail event
  const logEvent = useCallback((action, details, module = "General", object = "—", prev = "—", next = "—") => {
    const entry = {
      id: uid("LOG"),
      timestamp: new Date().toISOString(),
      user: currentUser?.name || role,
      role,
      action,
      module,
      object,
      previousValue: prev,
      newValue: next,
      details: details || `${action} on ${object}`,
    };
    setData((prevData) => ({
      ...prevData,
      trail: [entry, ...(prevData.trail || [])],
    }));
  }, [role, currentUser]);

  // Panel helper functions
  const openPanel = useCallback((type, id, extra = null) => {
    setPanel({ type, id, data: extra });
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);

  const openFinding = useCallback((id) => openPanel("finding", id), [openPanel]);
  const openRisk = useCallback((id) => openPanel("risk", id), [openPanel]);
  const openAction = useCallback((id) => openPanel("action", id), [openPanel]);
  const openTicket = useCallback((id) => openPanel("ticket", id), [openPanel]);
  const openPolicy = useCallback((id) => openPanel("policy", id), [openPanel]);
  const openEvidence = useCallback((id) => openPanel("evidence", id), [openPanel]);

  // Assessment mutation
  const assessControl = useCallback((controlId, payload) => {
    setData((prev) => {
      const prevStatus = prev.assessments[controlId]?.status || "Not Assessed";
      const updatedAssessments = {
        ...prev.assessments,
        [controlId]: {
          ...prev.assessments[controlId],
          ...payload,
          auditor: currentUser?.name || role,
          date: iso(NOW),
        },
      };
      return { ...prev, assessments: updatedAssessments };
    });
    logEvent("Control Assessment Updated", `Control ${controlId} assessed as ${payload.status} by ${currentUser?.name || role}`, "Controls", controlId, "Draft", payload.status);
  }, [role, currentUser, logEvent]);

  // Policy mutations
  const createPolicy = useCallback((payload) => {
    const id = payload.id || uid("POL");
    const newPolicy = {
      id,
      version: "v1.0",
      status: "Draft",
      owner: currentUser?.name || "GRC Manager",
      department: currentUser?.dept || "GRC & Governance",
      effectiveDate: iso(NOW),
      reviewDate: daysFromNow(365),
      versionHistory: [
        {
          version: "v1.0",
          date: iso(NOW),
          author: currentUser?.name || "GRC Manager",
          summary: "Initial draft created",
          changes: "Document created and baseline policy text established.",
        },
      ],
      comments: [],
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      policies: [newPolicy, ...(prev.policies || [])],
    }));
    logEvent("Policy Created", `Policy ${id} (${newPolicy.name}) created in Draft state`, "Policy Management", id, "—", "Draft");
    return id;
  }, [currentUser, logEvent]);

  const updatePolicy = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      policies: (prev.policies || []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    logEvent("Policy Updated", `Policy ${id} details updated`, "Policy Management", id);
  }, [logEvent]);

  const addPolicyVersion = useCallback((id, versionObj) => {
    setData((prev) => ({
      ...prev,
      policies: (prev.policies || []).map((p) => {
        if (p.id !== id) return p;
        const currentHist = p.versionHistory || [];
        const newHist = [
          {
            version: versionObj.version,
            date: iso(NOW),
            author: currentUser?.name || role,
            summary: versionObj.summary,
            changes: versionObj.changes || versionObj.summary,
          },
          ...currentHist,
        ];
        return {
          ...p,
          version: versionObj.version,
          status: "Under Review",
          versionHistory: newHist,
        };
      }),
    }));
    logEvent("Policy Version Added", `Policy ${id} updated to version ${versionObj.version}`, "Policy Management", id, "—", versionObj.version);
  }, [currentUser, role, logEvent]);

  const changePolicyStatus = useCallback((id, newStatus, note = "") => {
    setData((prev) => ({
      ...prev,
      policies: (prev.policies || []).map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: newStatus,
          approvedBy: newStatus === "Published" || newStatus === "Approved" ? currentUser?.name || role : p.approvedBy,
          approvalDate: newStatus === "Published" || newStatus === "Approved" ? iso(NOW) : p.approvalDate,
        };
      }),
    }));
    logEvent("Policy Status Changed", `Policy ${id} status moved to ${newStatus}. Note: ${note || "None"}`, "Policy Management", id, "—", newStatus);
  }, [currentUser, role, logEvent]);

  // Evidence mutations
  const createEvidence = useCallback((payload) => {
    const id = payload.id || uid("EV");
    const newEvidence = {
      id,
      uploadDate: iso(NOW),
      uploadedBy: currentUser?.name || role,
      status: "Under Review",
      verificationStatus: "Not Verified",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      comments: [],
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      evidence: [newEvidence, ...(prev.evidence || [])],
    }));
    logEvent("Evidence Uploaded", `Evidence record ${id} uploaded for control ${payload.controlId}`, "Evidence Repository", id, "—", "Under Review");
    return id;
  }, [currentUser, role, logEvent]);

  const uploadEvidence = createEvidence;

  const updateEvidence = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      evidence: (prev.evidence || []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    logEvent("Evidence Updated", `Evidence record ${id} metadata updated`, "Evidence Repository", id);
  }, [logEvent]);

  const verifyEvidence = useCallback((evId, status, notes) => {
    setData((prev) => {
      const updatedEvidence = (prev.evidence || []).map((e) =>
        e.id === evId
          ? { ...e, verificationStatus: status, status: status === "Verified" ? "Accepted" : status === "Rejected" ? "Rejected" : e.status, verificationNotes: notes, auditor: currentUser?.name || role }
          : e
      );
      return { ...prev, evidence: updatedEvidence };
    });
    logEvent("Evidence Verified", `Evidence record ${evId} marked as ${status} by ${currentUser?.name || role}`, "Evidence Repository", evId, "—", status);
  }, [currentUser, role, logEvent]);

  // Evidence Requests mutations
  const createEvidenceRequest = useCallback((payload) => {
    const id = payload.id || uid("REQ");
    const newReq = {
      id,
      requestDate: iso(NOW),
      requestedBy: currentUser?.name || role,
      status: "Pending",
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      evidenceRequests: [newReq, ...(prev.evidenceRequests || [])],
    }));
    logEvent("Evidence Requested", `Evidence request ${id} raised for control ${payload.controlId}`, "Evidence Repository", id, "—", "Pending");
    return id;
  }, [currentUser, role, logEvent]);

  const updateEvidenceRequest = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      evidenceRequests: (prev.evidenceRequests || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    logEvent("Evidence Request Updated", `Evidence request ${id} updated to status ${patch.status || "updated"}`, "Evidence Repository", id);
  }, [logEvent]);

  // Finding mutations
  const createFinding = useCallback((payload) => {
    const id = uid("FND");
    const newFinding = {
      id,
      createdDate: iso(NOW),
      createdBy: currentUser?.name || role,
      status: "Open",
      comments: [],
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      findings: [newFinding, ...(prev.findings || [])],
    }));
    logEvent("Finding Created", `New finding ${id} raised for control ${payload.controlId}`, "Findings", id, "—", "Open");
    return id;
  }, [currentUser, role, logEvent]);

  const updateFinding = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      findings: (prev.findings || []).map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
    logEvent("Finding Updated", `Finding ${id} details updated`, "Findings", id);
  }, [logEvent]);

  const closeFinding = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      findings: (prev.findings || []).map((f) =>
        f.id === id ? { ...f, status: "Closed", closedDate: iso(NOW), closedBy: currentUser?.name || role } : f
      ),
    }));
    logEvent("Finding Closed", `Finding ${id} formally verified and closed by ${currentUser?.name || role}`, "Findings", id, "Pending Verification", "Closed");
  }, [currentUser, role, logEvent]);

  // Risk mutations
  const createRisk = useCallback((payload) => {
    const id = uid("RSK");
    const inherentScore = Number(payload.likelihood || 3) * Number(payload.impact || 3);
    const newRisk = {
      id,
      inherentScore,
      residualScore: payload.residualScore ?? inherentScore,
      status: "Treatment In Progress",
      comments: [],
      ...payload,
    };
    setData((prev) => {
      const updatedFindings = payload.findingId
        ? (prev.findings || []).map((f) => (f.id === payload.findingId ? { ...f, riskId: id } : f))
        : prev.findings;
      return {
        ...prev,
        risks: [newRisk, ...(prev.risks || [])],
        findings: updatedFindings,
      };
    });
    logEvent("Risk Registered", `Risk ${id} created with inherent score ${inherentScore}`, "Risk Register", id, "-", "Treatment In Progress");
    return id;
  }, [logEvent]);

  const updateRisk = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      risks: (prev.risks || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    logEvent("Risk Updated", `Risk ${id} treatment details updated`, "Risk Register", id);
  }, [logEvent]);

  // Corrective Action (CAPA) mutations
  const createAction = useCallback((payload) => {
    const id = uid("CA");
    const newAction = {
      id,
      status: "In Progress",
      progress: 0,
      verificationStatus: "Pending",
      auditorApproval: false,
      comments: [],
      ...payload,
    };
    setData((prev) => {
      const updatedFindings = payload.findingId
        ? (prev.findings || []).map((f) => (f.id === payload.findingId ? { ...f, actionId: id } : f))
        : prev.findings;
      const updatedRisks = payload.riskId
        ? (prev.risks || []).map((r) => (r.id === payload.riskId ? { ...r, actionId: id } : r))
        : prev.risks;
      return {
        ...prev,
        actions: [newAction, ...(prev.actions || [])],
        findings: updatedFindings,
        risks: updatedRisks,
      };
    });
    logEvent("Action Created", `Corrective action ${id} assigned to ${payload.owner || "owner"}`, "Corrective Actions", id, "—", "In Progress");
    return id;
  }, [logEvent]);

  const updateAction = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      actions: (prev.actions || []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    logEvent("Action Updated", `Action ${id} details updated`, "Corrective Actions", id);
  }, [logEvent]);

  const completeAction = useCallback((id, patch) => {
    setData((prev) => {
      const targetAction = (prev.actions || []).find((a) => a.id === id);
      const updatedActions = (prev.actions || []).map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Completed",
              progress: 100,
              completionDate: iso(NOW),
              ...patch,
            }
          : a
      );
      // Advance finding to Pending Verification
      const updatedFindings = targetAction?.findingId
        ? (prev.findings || []).map((f) =>
            f.id === targetAction.findingId && f.status !== "Closed"
              ? { ...f, status: "Pending Verification" }
              : f
          )
        : prev.findings;

      return {
        ...prev,
        actions: updatedActions,
        findings: updatedFindings,
      };
    });
    logEvent("Action Completed", `Corrective action ${id} marked completed, awaiting auditor verification`, "Corrective Actions", id, "In Progress", "Completed");
  }, [logEvent]);

  // ITSM Ticket mutations
  const createTicket = useCallback((payload) => {
    const id = uid("TCK");
    const newTicket = {
      id,
      createdDate: iso(NOW),
      status: "In Progress",
      comments: [],
      ...payload,
    };
    setData((prev) => {
      const updatedActions = payload.actionId
        ? (prev.actions || []).map((a) => (a.id === payload.actionId ? { ...a, ticketId: id } : a))
        : prev.actions;
      return {
        ...prev,
        tickets: [newTicket, ...(prev.tickets || [])],
        actions: updatedActions,
      };
    });
    logEvent("Ticket Created", `Remediation ticket ${id} dispatched to ${payload.assignmentGroup || "group"}`, "ITSM Tickets", id, "—", "In Progress");
    return id;
  }, [logEvent]);

  const updateTicket = useCallback((id, patch) => {
    setData((prev) => {
      const targetTicket = (prev.tickets || []).find((t) => t.id === id);
      const updatedTickets = (prev.tickets || []).map((t) => (t.id === id ? { ...t, ...patch } : t));
      
      let updatedActions = prev.actions || [];
      let updatedFindings = prev.findings || [];

      // If ticket is resolved, automatically progress linked action & finding
      if (patch.status === "Resolved" || patch.status === "Closed") {
        if (targetTicket?.actionId) {
          updatedActions = (prev.actions || []).map((a) =>
            a.id === targetTicket.actionId
              ? {
                  ...a,
                  status: patch.status === "Closed" ? "Closed" : "Completed",
                  progress: 100,
                  completionDate: iso(NOW),
                  completionEvidence: patch.resolution || a.completionEvidence,
                }
              : a
          );
        }
        if (targetTicket?.findingId) {
          updatedFindings = (prev.findings || []).map((f) =>
            f.id === targetTicket.findingId && f.status !== "Closed"
              ? { ...f, status: "Pending Verification" }
              : f
          );
        }
      }

      return {
        ...prev,
        tickets: updatedTickets,
        actions: updatedActions,
        findings: updatedFindings,
      };
    });
    logEvent("Ticket Updated", `Ticket ${id} status changed to ${patch.status || "updated"}`, "ITSM Tickets", id, "—", patch.status || "Updated");
  }, [logEvent]);

  // Audit mutations
  const createAudit = useCallback((payload) => {
    const id = payload.id || uid("AUD");
    const newAudit = {
      id,
      status: "Planned",
      startDate: iso(NOW),
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      audits: [newAudit, ...(prev.audits || [])],
    }));
    logEvent("Audit Created", `Audit program ${id} (${payload.name || "Audit"}) created`, "Audit Management", id, "—", "Planned");
    return id;
  }, [logEvent]);

  const updateAudit = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      audits: (prev.audits || []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    logEvent("Audit Updated", `Audit program ${id} updated`, "Audit Management", id);
  }, [logEvent]);

  // User management mutations
  const createUser = useCallback((payload) => {
    const id = payload.id || uid("USR");
    const newUser = {
      id,
      status: "Active",
      lastLogin: "Never",
      ...payload,
    };
    setData((prev) => ({
      ...prev,
      users: [...(prev.users || []), newUser],
    }));
    logEvent("User Created", `User ${payload.name} (${payload.role}) created by Admin`, "Administration", id, "—", payload.role);
    return id;
  }, [logEvent]);

  const updateUser = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      users: (prev.users || []).map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
    logEvent("User Updated", `User ${id} profile/role updated`, "Administration", id);
  }, [logEvent]);

  const deleteUser = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      users: (prev.users || []).map((u) => (u.id === id ? { ...u, status: "Deactivated" } : u)),
    }));
    logEvent("User Deactivated", `User ${id} deactivated`, "Administration", id, "Active", "Deactivated");
  }, [logEvent]);

  // Notification mutations
  const markNotificationRead = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) => ({ ...n, read: true })),
    }));
  }, []);

  // Universal Comment Mutation
  const addComment = useCallback((module, id, commentText) => {
    const commentObj = {
      id: uid("CMT"),
      user: currentUser?.name || role,
      role,
      avatar: currentUser?.initials || role.slice(0, 2).toUpperCase(),
      timestamp: new Date().toISOString(),
      text: commentText,
    };

    setData((prev) => {
      if (module === "policy") {
        return {
          ...prev,
          policies: (prev.policies || []).map((p) =>
            p.id === id ? { ...p, comments: [...(p.comments || []), commentObj] } : p
          ),
        };
      }
      if (module === "evidence") {
        return {
          ...prev,
          evidence: (prev.evidence || []).map((e) =>
            e.id === id ? { ...e, comments: [...(e.comments || []), commentObj] } : e
          ),
        };
      }
      if (module === "finding") {
        return {
          ...prev,
          findings: (prev.findings || []).map((f) =>
            f.id === id ? { ...f, comments: [...(f.comments || []), commentObj] } : f
          ),
        };
      }
      if (module === "risk") {
        return {
          ...prev,
          risks: (prev.risks || []).map((r) =>
            r.id === id ? { ...r, comments: [...(r.comments || []), commentObj] } : r
          ),
        };
      }
      if (module === "action") {
        return {
          ...prev,
          actions: (prev.actions || []).map((a) =>
            a.id === id ? { ...a, comments: [...(a.comments || []), commentObj] } : a
          ),
        };
      }
      if (module === "control") {
        const curAsmnt = prev.assessments[id] || {};
        return {
          ...prev,
          assessments: {
            ...prev.assessments,
            [id]: {
              ...curAsmnt,
              commentsList: [...(curAsmnt.commentsList || []), commentObj],
            },
          },
        };
      }
      return prev;
    });

    logEvent("Comment Added", `Comment added on ${module} ${id} by ${currentUser?.name || role}`, module, id);
  }, [currentUser, role, logEvent]);

  // Reset to demo factory data
  const resetData = useCallback(async () => {
    const fresh = seed();
    setData(fresh);
    setPanel(null);
    setSelectedControlId(null);
    await storageService.set("isms-grc-state-v1", fresh);
    logEvent("Factory Reset", "All data reset to initial demo seed dataset", "System", "All");
  }, [logEvent]);

  // Global Context Provider Value
  const contextValue = useMemo(() => ({
    page,
    setPage,
    role,
    setRole,
    currentUser,
    setCurrentUser,
    assessments,
    policies,
    evidence,
    evidenceRequests,
    findings,
    risks,
    actions,
    tickets,
    audits,
    notifications,
    users,
    trail,
    compliance,
    selectedControlId,
    setSelectedControlId,
    panel,
    setPanel,
    openPanel,
    closePanel,
    openFinding,
    openRisk,
    openAction,
    openTicket,
    openPolicy,
    openEvidence,
    assessControl,
    createPolicy,
    updatePolicy,
    addPolicyVersion,
    changePolicyStatus,
    createEvidence,
    uploadEvidence,
    updateEvidence,
    verifyEvidence,
    createEvidenceRequest,
    updateEvidenceRequest,
    createFinding,
    updateFinding,
    closeFinding,
    createRisk,
    updateRisk,
    createAction,
    updateAction,
    completeAction,
    createTicket,
    updateTicket,
    createAudit,
    updateAudit,
    createUser,
    updateUser,
    deleteUser,
    markNotificationRead,
    markAllNotificationsRead,
    addComment,
    logEvent,
    resetData,
    login,
    logout,
  }), [
    page,
    role,
    currentUser,
    assessments,
    policies,
    evidence,
    evidenceRequests,
    findings,
    risks,
    actions,
    tickets,
    audits,
    notifications,
    users,
    trail,
    compliance,
    selectedControlId,
    panel,
    openPanel,
    closePanel,
    openFinding,
    openRisk,
    openAction,
    openTicket,
    openPolicy,
    openEvidence,
    assessControl,
    createPolicy,
    updatePolicy,
    addPolicyVersion,
    changePolicyStatus,
    createEvidence,
    uploadEvidence,
    updateEvidence,
    verifyEvidence,
    createEvidenceRequest,
    updateEvidenceRequest,
    createFinding,
    updateFinding,
    closeFinding,
    createRisk,
    updateRisk,
    createAction,
    updateAction,
    completeAction,
    createTicket,
    updateTicket,
    createAudit,
    updateAudit,
    createUser,
    updateUser,
    deleteUser,
    markNotificationRead,
    markAllNotificationsRead,
    addComment,
    logEvent,
    resetData,
  ]);

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
        {/* Left Navigation Sidebar */}
        <Sidebar page={page} setPage={setPage} />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Application Header */}
          <AppHeader onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {page === "dashboard" && <Dashboard />}
            {page === "tasks" && <MyTasks />}
            {page === "policies" && <Policies />}
            {page === "controls" && <Controls />}
            {page === "audits" && <Audits />}
            {page === "evidence" && <EvidenceList />}
            {page === "findings" && <Findings />}
            {page === "risks" && <Risks />}
            {page === "actions" && <Actions />}
            {page === "tickets" && <Tickets />}
            {page === "traceability" && <Traceability />}
            {page === "analytics" && <Analytics />}
            {page === "reports" && <Reports />}
            {page === "auditlog" && <AuditLog />}
            {page === "admin" && <Admin />}
          </main>
        </div>

        {/* Universal Right Drawer / SlideOver Detail Panel */}
        <DetailPanel panel={panel} onClose={closePanel} />

        {/* Global Multi-Entity Search Modal */}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </AppContext.Provider>
  );
}
