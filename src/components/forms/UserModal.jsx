import { useState, useEffect } from "react";
import { X, Users, Shield, Check } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { ROLES, ROLE_INFO } from "../../constants/permissions.js";

export function UserModal({ isOpen, onClose, onSave, user = null }) {
  const isEdit = !!user;

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Auditor",
    dept: "Internal Audit",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Auditor",
        dept: user.dept || "Internal Audit",
        status: user.status || "Active",
      });
    } else {
      setForm({
        name: "",
        email: "",
        role: "Auditor",
        dept: "Internal Audit",
        status: "Active",
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    if (!form.dept.trim()) errs.dept = "Department is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    const initials = form.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    onSave({
      ...form,
      initials: initials || "US",
    });
    onClose();
  };

  const roleMeta = ROLE_INFO[form.role] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{isEdit ? "Edit User Profile" : "Add Enterprise User"}</h3>
              <p className="text-xs text-slate-500">Configure role, authorization permissions, and department</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <Field label="Full Name" error={errors.name} required>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Priyanshu Meena"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Work Email" error={errors.email} required>
            <input
              type="email"
              className={inputCls}
              placeholder="e.g. priyanshu.m@enterprise.org"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned Role" required>
              <select
                className={inputCls}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Department" error={errors.dept} required>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. SecOps, Cloud Platform"
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              />
            </Field>
          </div>

          {/* Role Description Callout */}
          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-xs">
            <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <Shield size={13} className="text-indigo-600" />
              <span>{form.role}</span>
            </div>
            <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
              {roleMeta.description || "Grants standard access privileges to designated GRC functional areas."}
            </p>
          </div>

          <Field label="Account Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </Field>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 rounded-b-xl">
          <Btn variant="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit}>
            <Check size={14} />
            <span>{isEdit ? "Save Changes" : "Create User"}</span>
          </Btn>
        </div>
      </div>
    </div>
  );
}
