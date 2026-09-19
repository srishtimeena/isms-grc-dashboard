/**
 * Role-Based Access Control (RBAC) & Segregation of Duties Engine
 * ISO 27001 ISMS Enterprise GRC
 */

/** 10 Standard Enterprise GRC Roles */
export const ROLES = [
  "GRC Administrator",
  "GRC Manager",
  "Lead Auditor",
  "Auditor",
  "Control Owner",
  "Evidence Contributor",
  "Risk Manager",
  "Compliance Manager",
  "Reviewer/Approver",
  "Read-Only/Management Viewer",
];

/** Role Descriptions & Metadata */
export const ROLE_INFO = {
  "GRC Administrator": {
    description: "Full access across all modules, configuration, user access, and system-level administration.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    icon: "ShieldAlert",
  },
  "GRC Manager": {
    description: "Orchestrates GRC workflows, assigns owners, manages findings and risks, initiates assessments, and monitors reports.",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: "Briefcase",
  },
  "Lead Auditor": {
    description: "Leads audit planning, raises and verifies findings, reviews evidence, conducts assessments, and generates audit reports.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "ClipboardCheck",
  },
  "Auditor": {
    description: "Performs control assessments, uploads and requests evidence, raises observations and findings, and adds audit notes.",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    icon: "FileSearch",
  },
  "Control Owner": {
    description: "Maintains assigned ISO controls, updates implementation status, uploads evidence, and responds to auditor requests.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "ShieldCheck",
  },
  "Evidence Contributor": {
    description: "Uploads and maintains evidence records, adds evidence metadata, and fulfills evidence requests.",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    icon: "UploadCloud",
  },
  "Risk Manager": {
    description: "Owns the enterprise Risk Register, defines risk likelihood/impact, formulates treatments, and tracks mitigation plans.",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "AlertOctagon",
  },
  "Compliance Manager": {
    description: "Maps compliance frameworks to controls, reviews regulatory coverage, and generates compliance status reports.",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
    icon: "GitPullRequest",
  },
  "Reviewer/Approver": {
    description: "Independent quality reviewer for submitted policies, evidence, and findings before final formal publication or closure.",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    icon: "CheckSquare",
  },
  "Read-Only/Management Viewer": {
    description: "Executive and stakeholder access to view dashboards, reports, risks, findings, and compliance analytics without editing.",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
    icon: "Eye",
  },
};

/** Pre-configured Demo Identities for Demo Switching and Impersonation */
export const DEMO_PERSONAS = [
  { id: "usr-01", name: "Srishti Meena", email: "srishti.meena@enterprise.org", role: "Lead Auditor", dept: "Internal Audit", initials: "SM" },
  { id: "usr-02", name: "Alex Rivera", email: "alex.rivera@enterprise.org", role: "GRC Administrator", dept: "Information Security", initials: "AR" },
  { id: "usr-03", name: "Vikram Malhotra", email: "vikram.m@enterprise.org", role: "GRC Manager", dept: "GRC & Governance", initials: "VM" },
  { id: "usr-04", name: "Fatima Sheikh", email: "fatima.s@enterprise.org", role: "Auditor", dept: "Internal Audit", initials: "FS" },
  { id: "usr-05", name: "Rahul Sharma", email: "rahul.s@enterprise.org", role: "Control Owner", dept: "Cloud Platform", initials: "RS" },
  { id: "usr-06", name: "Ananya Patel", email: "ananya.p@enterprise.org", role: "Evidence Contributor", dept: "Security Operations", initials: "AP" },
  { id: "usr-07", name: "Elena Rostova", email: "elena.r@enterprise.org", role: "Risk Manager", dept: "Enterprise Risk", initials: "ER" },
  { id: "usr-08", name: "Marcus Vance", email: "marcus.v@enterprise.org", role: "Compliance Manager", dept: "Regulatory Compliance", initials: "MV" },
  { id: "usr-09", name: "David Kim", email: "david.kim@enterprise.org", role: "Reviewer/Approver", dept: "Quality & Governance", initials: "DK" },
  { id: "usr-10", name: "Patricia Wu", email: "patricia.wu@enterprise.org", role: "Read-Only/Management Viewer", dept: "Executive Office", initials: "PW" },
];

/** 5 Guided Viva Demonstration Scenarios */
export const VIVA_SCENARIOS = [
  {
    id: 1,
    title: "Scenario 1: Auditor Workflow",
    role: "Lead Auditor",
    persona: "Srishti Meena",
    steps: "1. Request evidence on A.5.23 → 2. Raise an audit finding → 3. Conduct control assessment",
    targetPage: "controls",
  },
  {
    id: 2,
    title: "Scenario 2: Control Owner Response",
    role: "Control Owner",
    persona: "Rahul Sharma",
    steps: "1. Check My Tasks for evidence request → 2. Upload file & checksum → 3. Update control implementation",
    targetPage: "tasks",
  },
  {
    id: 3,
    title: "Scenario 3: Reviewer Quality Check",
    role: "Reviewer/Approver",
    persona: "David Kim",
    steps: "1. Review submitted evidence → 2. Approve or reject with comments → 3. Validate policy draft",
    targetPage: "evidence",
  },
  {
    id: 4,
    title: "Scenario 4: GRC Manager Governance",
    role: "GRC Manager",
    persona: "Vikram Malhotra",
    steps: "1. Inspect live executive metrics → 2. Review 5x5 Risk Matrix → 3. Examine audit trail log",
    targetPage: "dashboard",
  },
  {
    id: 5,
    title: "Scenario 5: Management Read-Only Verification",
    role: "Read-Only/Management Viewer",
    persona: "Patricia Wu",
    steps: "1. View executive summaries & reports → 2. Verify all mutation/action buttons are blocked",
    targetPage: "reports",
  },
];

/**
 * Centralized Permission Matrix
 * Maps [module][action] -> Array of authorized roles
 */
export const PERMISSIONS = {
  // Policy Management
  policy: {
    view: ["*"],
    create: ["GRC Administrator", "GRC Manager", "Compliance Manager"],
    edit: ["GRC Administrator", "GRC Manager", "Compliance Manager"],
    delete: ["GRC Administrator"],
    archive: ["GRC Administrator", "GRC Manager"],
    submit: ["GRC Administrator", "GRC Manager", "Compliance Manager"],
    review: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Reviewer/Approver"],
    approve: ["GRC Administrator", "GRC Manager", "Reviewer/Approver"],
    reject: ["GRC Administrator", "GRC Manager", "Reviewer/Approver"],
    comment: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Reviewer/Approver", "Compliance Manager"],
    download: ["*"],
    uploadDoc: ["GRC Administrator", "GRC Manager", "Compliance Manager"],
  },

  // ISO Controls & Assessments
  control: {
    view: ["*"],
    edit: ["GRC Administrator", "GRC Manager", "Control Owner", "Compliance Manager"],
    assignOwner: ["GRC Administrator", "GRC Manager"],
    assess: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
    approveAssessment: ["GRC Administrator", "Lead Auditor", "Reviewer/Approver"],
    requestEvidence: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
    comment: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Control Owner", "Compliance Manager"],
  },

  // Evidence Repository & Requests
  evidence: {
    view: ["*"],
    upload: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Control Owner", "Evidence Contributor"],
    replace: ["GRC Administrator", "Control Owner", "Evidence Contributor", "Lead Auditor"],
    download: ["*"],
    delete: ["GRC Administrator", "GRC Manager"],
    request: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
    verify: ["GRC Administrator", "Lead Auditor", "Auditor", "Reviewer/Approver"],
    accept: ["GRC Administrator", "Lead Auditor", "Reviewer/Approver"],
    reject: ["GRC Administrator", "Lead Auditor", "Reviewer/Approver"],
    markInsufficient: ["GRC Administrator", "Lead Auditor", "Auditor", "Reviewer/Approver"],
    comment: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Control Owner", "Evidence Contributor", "Reviewer/Approver"],
  },

  // Findings Management
  finding: {
    view: ["*"],
    create: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
    edit: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
    assign: ["GRC Administrator", "GRC Manager", "Lead Auditor"],
    changeSeverity: ["GRC Administrator", "Lead Auditor"],
    verify: ["GRC Administrator", "Lead Auditor"],
    close: ["GRC Administrator", "Lead Auditor"],
    reopen: ["GRC Administrator", "Lead Auditor", "GRC Manager"],
    comment: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Control Owner", "Reviewer/Approver"],
  },

  // Risk Register & 5x5 Matrix
  risk: {
    view: ["*"],
    create: ["GRC Administrator", "GRC Manager", "Risk Manager", "Lead Auditor"],
    edit: ["GRC Administrator", "GRC Manager", "Risk Manager"],
    assignOwner: ["GRC Administrator", "GRC Manager", "Risk Manager"],
    treat: ["GRC Administrator", "GRC Manager", "Risk Manager"],
    approve: ["GRC Administrator", "GRC Manager", "Risk Manager"],
    close: ["GRC Administrator", "Risk Manager", "GRC Manager"],
    reopen: ["GRC Administrator", "Risk Manager", "GRC Manager"],
    comment: ["GRC Administrator", "GRC Manager", "Risk Manager", "Lead Auditor", "Auditor", "Control Owner"],
  },

  // Corrective Actions (CAPA)
  action: {
    view: ["*"],
    create: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Control Owner", "Risk Manager"],
    edit: ["GRC Administrator", "GRC Manager", "Control Owner", "Lead Auditor"],
    assign: ["GRC Administrator", "GRC Manager", "Lead Auditor"],
    updateProgress: ["GRC Administrator", "Control Owner", "Evidence Contributor", "GRC Manager"],
    submitVerification: ["GRC Administrator", "Control Owner", "GRC Manager"],
    verify: ["GRC Administrator", "Lead Auditor"],
    close: ["GRC Administrator", "Lead Auditor"],
    comment: ["*"],
  },

  // ITSM Tickets
  ticket: {
    view: ["*"],
    create: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Control Owner"],
    edit: ["GRC Administrator", "GRC Manager", "Control Owner"],
    resolve: ["GRC Administrator", "Control Owner", "GRC Manager"],
    close: ["GRC Administrator", "Lead Auditor"],
    comment: ["*"],
  },

  // Audit Management
  audit: {
    view: ["*"],
    create: ["GRC Administrator", "Lead Auditor"],
    edit: ["GRC Administrator", "Lead Auditor"],
    assign: ["GRC Administrator", "Lead Auditor"],
    close: ["GRC Administrator", "Lead Auditor"],
    generateReport: ["GRC Administrator", "Lead Auditor", "Auditor", "GRC Manager"],
    comment: ["*"],
  },

  // Reporting
  report: {
    view: ["*"],
    export: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Risk Manager", "Compliance Manager", "Read-Only/Management Viewer"],
  },

  // User Management
  user: {
    view: ["GRC Administrator", "GRC Manager"],
    create: ["GRC Administrator"],
    edit: ["GRC Administrator"],
    assignRole: ["GRC Administrator"],
    delete: ["GRC Administrator"],
  },

  // Audit Log / Trail
  trail: {
    view: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Compliance Manager", "Reviewer/Approver", "Risk Manager", "Read-Only/Management Viewer"],
    export: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Compliance Manager"],
  },

  // Tasks
  tasks: {
    view: ["*"],
  },
};

/** Normalize role strings to handle legacy values gracefully */
export function normalizeRole(role) {
  if (!role) return "Read-Only/Management Viewer";
  if (role === "Administrator") return "GRC Administrator";
  if (role === "Management") return "Read-Only/Management Viewer";
  if (role === "ITSM Manager") return "GRC Manager";
  if (role === "Technician / Action Owner") return "Control Owner";
  if (ROLES.includes(role)) return role;
  return "Read-Only/Management Viewer";
}

/**
 * Central Permission Evaluation Helper
 * Returns true if the user's role has permission for module + action
 */
export function hasPermission(role, module, action) {
  const normRole = normalizeRole(role);
  // GRC Administrator has unconditional access to all modules and actions
  if (normRole === "GRC Administrator") return true;

  const mod = PERMISSIONS[module];
  if (!mod) return false;

  const allowedRoles = mod[action];
  if (!allowedRoles) return false;

  if (allowedRoles.includes("*")) return true;
  return allowedRoles.includes(normRole);
}

/**
 * Segregation of Duties (SoD) Evaluator
 * Verifies that independent checks and balances are respected:
 * 1. Finding creator cannot close or verify their own finding.
 * 2. Control Owner / Evidence submitter cannot approve their own evidence.
 * 3. Policy author cannot be the sole approver of their own policy.
 * 4. Assessment creator cannot approve their own assessment.
 */
export function checkSegregationOfDuties(role, action, object, currentUserName) {
  if (!object || !currentUserName) return { allowed: true };

  const normRole = normalizeRole(role);
  const user = currentUserName.trim().toLowerCase();

  // Rule 1: Finding verification and closure
  if (["close", "verify", "verifyAndClose"].includes(action)) {
    const creator = (object.createdBy || "").trim().toLowerCase();
    if (creator && creator === user) {
      return {
        allowed: false,
        reason: "Separation of Duties Violation: The auditor who raised this finding cannot verify or close it. An independent Lead Auditor is required.",
      };
    }
  }

  // Rule 2: Evidence approval
  if (["approve", "accept", "verifyEvidence"].includes(action)) {
    const uploader = (object.uploadedBy || object.owner || "").trim().toLowerCase();
    if (uploader && uploader === user) {
      return {
        allowed: false,
        reason: "Separation of Duties Violation: The Control Owner / Contributor who submitted this evidence cannot act as its final approver.",
      };
    }
  }

  // Rule 3: Policy approval
  if (action === "approvePolicy") {
    const author = (object.author || object.owner || "").trim().toLowerCase();
    if (author && author === user) {
      return {
        allowed: false,
        reason: "Separation of Duties Violation: The author of this policy cannot be the final approver. An independent reviewer must approve.",
      };
    }
  }

  // Rule 4: Control assessment approval
  if (action === "approveAssessment") {
    const assessor = (object.auditor || object.assessor || "").trim().toLowerCase();
    if (assessor && assessor === user) {
      return {
        allowed: false,
        reason: "Separation of Duties Violation: The assessor who evaluated this control cannot sign off as final reviewer.",
      };
    }
  }

  return { allowed: true };
}

/** Legacy Compatibility Helper `can(role, key)` */
export const PERMS = {
  assess:        ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
  verifyEvidence:["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor", "Reviewer/Approver"],
  createFinding: ["GRC Administrator", "GRC Manager", "Lead Auditor", "Auditor"],
  manageRisk:    ["GRC Administrator", "GRC Manager", "Risk Manager", "Lead Auditor"],
  manageAction:  ["GRC Administrator", "GRC Manager", "Lead Auditor", "Control Owner"],
  manageTicket:  ["GRC Administrator", "GRC Manager", "Control Owner"],
  closeFinding:  ["GRC Administrator", "Lead Auditor"],
};

export const can = (role, key) => {
  const norm = normalizeRole(role);
  if (norm === "GRC Administrator") return true;
  return (PERMS[key] ?? []).includes(norm);
};
