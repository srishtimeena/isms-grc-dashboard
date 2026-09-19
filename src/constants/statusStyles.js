/**
 * Badge Tailwind class map — keyed by status/severity/SLA value.
 * Format: "bg text border" space-separated for use in Badge component.
 */
export const STATUS_STYLE = {
  // Compliance
  Compliant:             "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partially Compliant": "bg-amber-50 text-amber-700 border-amber-200",
  "Non-Compliant":       "bg-red-50 text-red-700 border-red-200",
  "Not Applicable":      "bg-slate-100 text-slate-500 border-slate-200",
  "Not Assessed":        "bg-slate-50 text-slate-400 border-slate-200 border-dashed",

  // Control Implementation Status
  "Implemented":         "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partially Implemented":"bg-amber-50 text-amber-700 border-amber-200",
  "Not Implemented":     "bg-red-50 text-red-700 border-red-200",
  "Needs Improvement":   "bg-orange-50 text-orange-700 border-orange-200",

  // Finding / Action / Ticket status
  Open:                  "bg-red-50 text-red-700 border-red-200",
  Assigned:              "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress":         "bg-blue-50 text-blue-700 border-blue-200",
  "Pending Verification":"bg-amber-50 text-amber-700 border-amber-200",
  "Pending Evidence":    "bg-amber-50 text-amber-700 border-amber-200",
  Resolved:              "bg-teal-50 text-teal-700 border-teal-200",
  Closed:                "bg-slate-100 text-slate-500 border-slate-200",
  Completed:             "bg-teal-50 text-teal-700 border-teal-200",
  Overdue:               "bg-red-100 text-red-800 border-red-300",
  Blocked:               "bg-rose-100 text-rose-800 border-rose-300",
  Rejected:              "bg-rose-50 text-rose-700 border-rose-200",

  // Policy Lifecycle Status
  Draft:                 "bg-slate-100 text-slate-600 border-slate-200",
  "Under Review":        "bg-indigo-50 text-indigo-700 border-indigo-200",
  Approved:              "bg-emerald-50 text-emerald-700 border-emerald-200",
  Published:             "bg-teal-50 text-teal-700 border-teal-200",
  "Review Due":          "bg-amber-50 text-amber-700 border-amber-200",
  Archived:              "bg-slate-100 text-slate-400 border-slate-200",

  // Evidence Status & Verification
  Requested:             "bg-sky-50 text-sky-700 border-sky-200",
  Uploaded:              "bg-blue-50 text-blue-700 border-blue-200",
  Accepted:              "bg-emerald-50 text-emerald-700 border-emerald-200",
  Verified:              "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partially Verified":  "bg-amber-50 text-amber-700 border-amber-200",
  "Not Verified":        "bg-red-50 text-red-700 border-red-200",
  "Not Available":       "bg-slate-100 text-slate-500 border-slate-200",
  Insufficient:          "bg-orange-50 text-orange-700 border-orange-200",
  Expired:               "bg-rose-50 text-rose-700 border-rose-200",
  "Expiring Soon":       "bg-amber-50 text-amber-700 border-amber-200",
  Missing:               "bg-red-100 text-red-700 border-red-200",

  // Assessment Status
  Submitted:             "bg-indigo-50 text-indigo-700 border-indigo-200",

  // Audit Status
  Planned:               "bg-sky-50 text-sky-700 border-sky-200",

  // Severity
  Critical:              "bg-red-100 text-red-800 border-red-300",
  High:                  "bg-orange-50 text-orange-700 border-orange-200",
  Medium:                "bg-amber-50 text-amber-700 border-amber-200",
  Low:                   "bg-slate-100 text-slate-600 border-slate-200",
  Observation:           "bg-blue-50 text-blue-700 border-blue-200",

  // SLA / Timeline
  "Within SLA":          "bg-emerald-50 text-emerald-700 border-emerald-200",
  "At Risk":             "bg-amber-50 text-amber-700 border-amber-200",
  Breached:              "bg-red-100 text-red-800 border-red-300",
  "On Track":            "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Due Today":           "bg-amber-100 text-amber-800 border-amber-300",
  "Due Soon":            "bg-amber-50 text-amber-700 border-amber-200",

  // Risk treatment
  "Treatment In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "Treatment Overdue":     "bg-red-100 text-red-800 border-red-300",
  Accepted:                "bg-violet-50 text-violet-700 border-violet-200",
  Mitigate:                "bg-blue-50 text-blue-700 border-blue-200",
  Transfer:                "bg-purple-50 text-purple-700 border-purple-200",
  Avoid:                   "bg-slate-100 text-slate-700 border-slate-300",
};

/** Derive risk category label from a numeric risk score (Likelihood × Impact) */
export const RISK_CATEGORY = (score) => {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6)  return "Medium";
  return "Low";
};

/** Map compliance score (0–100) to a status label */
export const scoreToStatus = (score) => {
  if (score == null) return "Not Assessed";
  if (score >= 80)   return "Compliant";
  if (score >= 40)   return "Partially Compliant";
  return "Non-Compliant";
};

/** Chart color palette — used consistently across all chart components */
export const CHART_COLORS = {
  compliant:  "#059669",
  partial:    "#d97706",
  nonCompliant: "#dc2626",
  na:         "#94a3b8",
  notAssessed: "#e2e8f0",
  critical:   "#dc2626",
  high:       "#ea580c",
  medium:     "#d97706",
  low:        "#64748b",
  primary:    "#4f46e5",
  blue:       "#0891b2",
  teal:       "#0d9488",
  violet:     "#7c3aed",
  within:     "#059669",
  atRisk:     "#d97706",
  breached:   "#dc2626",
};
