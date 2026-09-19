import {
  LayoutDashboard, ShieldCheck, ClipboardList, FileSearch, AlertTriangle,
  ShieldAlert, ListChecks, TicketIcon, GitBranch, BarChart3, FileText,
  Users, ChevronDown, ChevronRight, FileCheck, CheckSquare, History,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { hasPermission } from "../../constants/permissions.js";

const NAV_GROUPS = [
  {
    group: "Executive",
    items: [
      { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
      { id: "tasks",     label: "My Tasks & Work Queue", icon: CheckSquare, badgeKey: "tasks" },
    ],
  },
  {
    group: "ISO / ISMS",
    items: [
      { id: "policies", label: "Policy Management",       icon: FileCheck,      requiredPermission: { module: "policy",  action: "view" } },
      { id: "controls", label: "ISO Controls & Library",   icon: ShieldCheck,    requiredPermission: { module: "control", action: "view" } },
      { id: "audits",   label: "Audit Management",         icon: ClipboardList,  requiredPermission: { module: "audit",   action: "view" } },
      { id: "evidence", label: "Evidence Repository",      icon: FileSearch,     requiredPermission: { module: "evidence",action: "view" }, badgeKey: "evidence" },
    ],
  },
  {
    group: "GRC",
    items: [
      { id: "findings", label: "Findings Management",      icon: AlertTriangle,  requiredPermission: { module: "finding", action: "view" }, badgeKey: "findings" },
      { id: "risks",    label: "Risk Register (5x5)",      icon: ShieldAlert,    requiredPermission: { module: "risk",    action: "view" }, badgeKey: "risks" },
      { id: "actions",  label: "Corrective Actions (CAPA)",icon: ListChecks,     requiredPermission: { module: "action",  action: "view" }, badgeKey: "actions" },
    ],
  },
  {
    group: "ITSM",
    items: [{ id: "tickets", label: "Remediation Tickets", icon: TicketIcon,     requiredPermission: { module: "ticket",  action: "view" } }],
  },
  {
    group: "Analytics & Reporting",
    items: [
      { id: "traceability", label: "Compliance & Traceability", icon: GitBranch,  requiredPermission: { module: "report",  action: "view" } },
      { id: "analytics",    label: "Analytics & Trends",        icon: BarChart3,  requiredPermission: { module: "report",  action: "view" } },
      { id: "reports",      label: "Compliance Reports",        icon: FileText,   requiredPermission: { module: "report",  action: "view" } },
      { id: "auditlog",     label: "Audit Trail / Activity Log",icon: History,    requiredPermission: { module: "trail",   action: "view" } },
    ],
  },
  {
    group: "Administration",
    items: [{ id: "admin", label: "Users & Governance", icon: Users,             requiredPermission: { module: "user",    action: "view" } }],
  },
];

export { NAV_GROUPS };

export function Sidebar({ page, setPage }) {
  const [collapsed, setCollapsed] = useState({});
  const { findings, risks, actions, evidenceRequests, role } = useApp();

  const toggle = (group) =>
    setCollapsed((s) => ({ ...s, [group]: !s[group] }));

  // Badge counts for sidebar badges
  const openFindingsCount = findings?.filter(f => !["Closed", "Resolved"].includes(f.status))?.length || 0;
  const criticalRisksCount = risks?.filter(r => r.status !== "Closed" && (r.residualScore ?? r.inherentScore) >= 12)?.length || 0;
  const overdueActionsCount = actions?.filter(a => a.status === "Overdue")?.length || 0;
  const pendingRequestsCount = evidenceRequests?.filter(r => r.status === "Pending")?.length || 0;

  const getBadge = (key) => {
    if (key === "findings" && openFindingsCount > 0) return { count: openFindingsCount, tone: "bg-orange-500/20 text-orange-400 border border-orange-500/30" };
    if (key === "risks" && criticalRisksCount > 0) return { count: criticalRisksCount, tone: "bg-red-500/20 text-red-400 border border-red-500/30" };
    if (key === "actions" && overdueActionsCount > 0) return { count: overdueActionsCount, tone: "bg-red-500/20 text-red-400 border border-red-500/30" };
    if (key === "evidence" && pendingRequestsCount > 0) return { count: pendingRequestsCount, tone: "bg-sky-500/20 text-sky-400 border border-sky-500/30" };
    return null;
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-full select-none">
      {/* Logo / Brand */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm tracking-tight leading-tight flex items-center gap-1.5">
              <span>ISMS-GRC</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono font-normal">v2.0</span>
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5 leading-tight truncate">Enterprise Compliance Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {NAV_GROUPS.map((g) => {
          // Filter items by role permission
          const visibleItems = g.items.filter((item) => {
            if (!item.requiredPermission) return true;
            return hasPermission(role, item.requiredPermission.module, item.requiredPermission.action);
          });
          if (visibleItems.length === 0) return null;

          const isOpen = !collapsed[g.group];
          return (
            <div key={g.group}>
              {/* Group header */}
              <button
                onClick={() => toggle(g.group)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-400 transition-colors"
              >
                <span>{g.group}</span>
                {isOpen ? (
                  <ChevronDown size={11} />
                ) : (
                  <ChevronRight size={11} />
                )}
              </button>

              {/* Items */}
              {isOpen && visibleItems.map((item) => {
                const Icon   = item.icon;
                const active = page === item.id;
                const badge  = item.badgeKey ? getBadge(item.badgeKey) : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-[13px] font-medium transition-colors relative ${
                      active
                        ? "bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-500"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={15} className={active ? "text-indigo-400" : "text-slate-500"} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${badge.tone}`}>
                        {badge.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            RBAC Active
          </span>
          <span className="text-[10px] text-slate-500 truncate">{role}</span>
        </div>
      </div>
    </aside>
  );
}
