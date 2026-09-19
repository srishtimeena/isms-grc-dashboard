import { useState } from "react";
import { Users, Key, RotateCcw, Activity, Check, X, ShieldAlert, Database, Download, Plus, Edit2, UserX, Shield } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { ROLES, ROLE_INFO, PERMISSIONS, hasPermission } from "../constants/permissions.js";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Btn } from "../components/ui/Btn.jsx";
import { SectionTitle } from "../components/ui/SectionTitle.jsx";
import { Callout } from "../components/ui/Callout.jsx";
import { UserModal } from "../components/forms/UserModal.jsx";
import { fmtDate } from "../utils/date.js";

const MODULE_PERM_LABELS = [
  { module: "policy", action: "create", label: "Create / Draft Policy" },
  { module: "policy", action: "approve", label: "Approve / Publish Policy" },
  { module: "control", action: "assess", label: "Perform Control Assessment" },
  { module: "control", action: "approveAssessment", label: "Approve Control Assessment" },
  { module: "evidence", action: "upload", label: "Upload / Replace Evidence" },
  { module: "evidence", action: "verify", label: "Verify / Accept Evidence" },
  { module: "evidence", action: "request", label: "Issue Evidence Request" },
  { module: "finding", action: "create", label: "Raise Audit Finding" },
  { module: "finding", action: "verify", label: "Verify & Close Finding" },
  { module: "risk", action: "create", label: "Register New Risk" },
  { module: "risk", action: "treat", label: "Formulate Risk Treatment" },
  { module: "action", action: "create", label: "Create CAPA Action" },
  { module: "action", action: "verify", label: "Verify CAPA Closure" },
  { module: "ticket", action: "create", label: "Dispatch ITSM Ticket" },
  { module: "audit", action: "create", label: "Plan / Manage Audits" },
  { module: "user", action: "create", label: "Manage User Access" },
];

export function Admin() {
  const {
    role,
    setRole,
    currentUser,
    setCurrentUser,
    users,
    createUser,
    updateUser,
    deleteUser,
    trail,
    resetData,
    assessments,
    policies,
    evidence,
    evidenceRequests,
    findings,
    risks,
    actions,
    tickets,
    audits,
  } = useApp();

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const canManageUsers = hasPermission(role, "user", "create");
  const canViewAdmin = hasPermission(role, "user", "view");

  // Page-level access guard
  if (!canViewAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 fade-in">
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
          <ShieldAlert size={36} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          You do not have the required permissions to view the Administration panel.
          This area requires <strong>GRC Administrator</strong> or <strong>GRC Manager</strong> role.
        </p>
        <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1.5 rounded-full">Current role: {role}</p>
      </div>
    );
  }

  const handleReset = async () => {
    await resetData();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const dataSnapshot = {
      exportedAt: new Date().toISOString(),
      assessments,
      policies,
      evidence,
      evidenceRequests,
      findings,
      risks,
      actions,
      tickets,
      audits,
      users,
      trail,
    };
    const blob = new Blob([JSON.stringify(dataSnapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `isms-grc-enterprise-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      createUser(userData);
    }
    setEditingUser(null);
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setIsUserModalOpen(true);
  };

  const handleImpersonate = (u) => {
    setRole(u.role);
    setCurrentUser(u);
  };

  return (
    <div className="max-w-[1280px] space-y-8 fade-in">
      <SectionTitle sub="Manage user identities, 10-role access control permissions, immutable audit logs, and global system state.">
        Administration & Governance
      </SectionTitle>

      {/* Role Switching & Active Persona */}
      <Card className="p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" />
              <span>Active Persona & Authentication Simulation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current identity: <strong className="text-slate-800">{currentUser?.name || role}</strong> ({currentUser?.dept || "Enterprise"}) · Role: <strong className="text-indigo-600">{role}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Switch Role:</span>
            <select
              value={role}
              onChange={(e) => {
                const newR = e.target.value;
                setRole(newR);
                const matched = users?.find((u) => u.role === newR);
                if (matched) setCurrentUser(matched);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Enterprise Users Directory */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <span>User Directory & Access Assignments</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise users mapped to ISO 27001 roles with individual audit trail accountability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">{users?.length || 0} configured users</span>
            {canManageUsers && (
              <Btn variant="primary" size="sm" onClick={handleOpenCreateUser}>
                <Plus size={13} />
                <span>Add User</span>
              </Btn>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Department</th>
                <th className="px-3 py-2.5">Assigned Role</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users || []).map((u) => {
                const isActivePersona = (currentUser?.id && currentUser.id === u.id) || (currentUser?.name === u.name && role === u.role);
                const roleMeta = ROLE_INFO[u.role] || {};
                return (
                  <tr key={u.id || u.email} className={`hover:bg-slate-50/80 ${isActivePersona ? "bg-indigo-50/40" : ""}`}>
                    <td className="px-3 py-2.5 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                        {u.initials || u.name?.slice(0, 2).toUpperCase() || "US"}
                      </div>
                      <span className="font-semibold">{u.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono">{u.email}</td>
                    <td className="px-3 py-2.5 text-slate-600">{u.dept}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleMeta.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={u.status === "Active" ? "Compliant" : "Non-Compliant"}>{u.status || "Active"}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isActivePersona ? (
                          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImpersonate(u)}
                            className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 hover:underline"
                          >
                            Impersonate
                          </button>
                        )}
                        {canManageUsers && (
                          <>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                              title="Edit User"
                            >
                              <Edit2 size={12} />
                            </button>
                            {u.status !== "Deactivated" && (
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Deactivate User"
                              >
                                <UserX size={12} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role-Based Access Control (RBAC) Permissions Matrix across 10 Roles */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Key size={18} className="text-indigo-600" />
            <span>10-Role RBAC Authorization Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict policy rule mappings enforced across all mutations, approval gates, and Segregation of Duties (SoD).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-3 py-2.5 border-b border-r border-slate-200 w-64">Permission Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-2 py-2 border-b border-r border-slate-200 text-center font-medium text-slate-700">
                    <div className="max-w-[70px] mx-auto text-[10px] leading-tight">{r}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODULE_PERM_LABELS.map(({ module, action, label }) => (
                <tr key={`${module}-${action}`} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">
                    <div>{label}</div>
                    <div className="font-mono text-[9px] text-slate-400">{module}.{action}</div>
                  </td>
                  {ROLES.map((r) => {
                    const isAllowed = hasPermission(r, module, action);
                    return (
                      <td key={r} className="px-2 py-2 text-center border-r border-slate-200">
                        {isAllowed ? (
                          <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-300">
                            <X size={11} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log / Trail */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              <span>ISMS Audit Trail Snapshot</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of recent GRC operations and state transitions.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{trail?.length || 0} total events</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {(!trail || trail.length === 0) ? (
            <div className="text-center py-6 text-slate-400 text-xs">No audit events recorded yet.</div>
          ) : (
            trail.slice(0, 15).map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>{item.action}</span>
                    {item.module && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {item.module}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{item.details}</div>
                  <div className="text-slate-400 text-[10px] mt-1 font-mono">By: {item.user || "System"} ({item.role || "Administrator"})</div>
                </div>
                <div className="text-slate-400 text-[10px] whitespace-nowrap font-mono">{fmtDate(item.timestamp)}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Data Management & State Reset */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Database size={18} className="text-indigo-600" />
            <span>Data State Management & Factory Reset</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Export full enterprise state snapshot or restore initial factory demo dataset.</p>
        </div>

        {resetSuccess && (
          <Callout tone="success">
            Enterprise demo dataset has been successfully reset to initial factory baseline!
          </Callout>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Btn variant="secondary" onClick={handleExportJSON}>
            <Download size={14} />
            <span>Export State Snapshot (JSON)</span>
          </Btn>

          {!showConfirmReset ? (
            <Btn variant="danger" onClick={() => setShowConfirmReset(true)}>
              <RotateCcw size={14} />
              <span>Reset to Factory Seed Data</span>
            </Btn>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs text-red-700 font-medium">Reset all custom policies, findings, and logs?</span>
              <Btn variant="danger" size="sm" onClick={handleReset}>
                Yes, Reset All
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => setShowConfirmReset(false)}>
                Cancel
              </Btn>
            </div>
          )}
        </div>
      </Card>

      {/* User Create/Edit Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  );
}
