/** Static "now" date for deterministic demo data */
export const NOW = new Date("2026-09-14");

/** Format a Date object to ISO date string YYYY-MM-DD */
export const iso = (d) => d.toISOString().slice(0, 10);

/** Return ISO date string N days from NOW */
export const daysFromNow = (n) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** Format an ISO date string to a human-readable short date */
export const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/**
 * Return signed integer number of days between two ISO date strings.
 * Positive if a > b (a is after b), negative if a < b.
 */
export const daysBetween = (a, b) =>
  Math.round((new Date(a) - new Date(b)) / 86_400_000);

/** Generate a prefixed random ID for demo records */
export const uid = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** Human-readable relative days label (e.g. "5 days overdue", "12 days remaining") */
export const relDays = (targetDate) => {
  const d = daysBetween(targetDate, iso(NOW));
  if (d > 0) return `${d}d overdue`;
  if (d === 0) return "Due today";
  return `${-d}d remaining`;
};
