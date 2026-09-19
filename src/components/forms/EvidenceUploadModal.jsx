import { useState } from "react";
import { X, UploadCloud, FileText, Check, Hash } from "lucide-react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { CONTROLS } from "../../constants/iso27001.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

const EVIDENCE_TYPES = ["Document", "Report", "Log", "Configuration", "Screenshot", "Policy", "Interview Notes"];
const CONFIDENTIALITY_LEVELS = ["Internal", "Confidential", "Restricted", "Public"];

export function EvidenceUploadModal({ isOpen, onClose, onUpload, defaultControlId = "" }) {
  const { currentUser, role } = useApp();

  const [form, setForm] = useState({
    name: "",
    type: "Document",
    controlId: defaultControlId || "A.5.1",
    description: "",
    period: "2026 Annual",
    expiryDate: daysFromNow(180),
    confidentiality: "Internal",
    fileName: "",
    fileSize: "2.4 MB",
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleFileSimulate = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        name: prev.name || file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Evidence name is required";
    if (!form.controlId) errs.controlId = "Control ID is required";
    if (!form.description.trim()) errs.description = "Description of evidence is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    // Simulated SHA-256 checksum
    const randomHash = "sha256-" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    onUpload({
      ...form,
      fileName: form.fileName || `${form.name.replace(/\s+/g, "_")}.pdf`,
      fileType: form.fileName?.endsWith(".csv") ? "text/csv" : form.fileName?.endsWith(".xlsx") ? "application/vnd.ms-excel" : "application/pdf",
      hash: randomHash,
      uploadedBy: currentUser?.name || role,
      uploadDate: new Date().toISOString(),
      status: "Under Review",
      reviewStatus: "Pending",
      reviewer: "",
      reviewComments: "",
      comments: [],
      history: [
        { date: new Date().toISOString(), user: currentUser?.name || role, action: "Uploaded initial evidence record" },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Upload Objective Evidence</h3>
              <p className="text-xs text-slate-500">Attach audit evidence, configuration exports, or review reports</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* File Picker Simulator */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center bg-slate-50 transition-colors">
            <UploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
            <div className="text-xs font-semibold text-slate-700">Choose file or drag & drop</div>
            <div className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, CSV, XLSX, JSON, PNG (Max 50MB)</div>
            <label className="mt-2.5 inline-block cursor-pointer px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 shadow-2xs">
              <span>Browse File</span>
              <input type="file" onChange={handleFileSimulate} className="hidden" />
            </label>
            {form.fileName && (
              <div className="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-50 py-1 px-2 rounded inline-flex items-center gap-1.5">
                <FileText size={12} />
                <span>{form.fileName} ({form.fileSize})</span>
              </div>
            )}
          </div>

          <Field label="Evidence Title / Name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Q3 Privileged Access Review Spreadsheet"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target ISO 27001 Control" required error={errors.controlId}>
              <select
                value={form.controlId}
                onChange={(e) => setForm({ ...form, controlId: e.target.value })}
                className={inputCls}
              >
                {CONTROLS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Evidence Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description & Testing Guidance" required error={errors.description}>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what objective evidence this file contains and how it satisfies the control requirement..."
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Evidence Period">
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="e.g. Q3 2026"
                className={inputCls}
              />
            </Field>

            <Field label="Validity / Expiry Date">
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Confidentiality">
              <select
                value={form.confidentiality}
                onChange={(e) => setForm({ ...form, confidentiality: e.target.value })}
                className={inputCls}
              >
                {CONFIDENTIALITY_LEVELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="primary">
              <UploadCloud size={13} />
              <span>Submit for Verification</span>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
