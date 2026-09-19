import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { NOW } from "../../utils/date.js";

const BUCKETS = [
  { label: "0–7 days",  min: 0,  max: 7  },
  { label: "8–30 days", min: 8,  max: 30 },
  { label: "31–60 days",min: 31, max: 60 },
  { label: "60+ days",  min: 61, max: Infinity },
];

const BUCKET_COLORS = ["#0891b2", "#d97706", "#ea580c", "#dc2626"];

/**
 * FindingsAgingBar — NEW chart
 * Groups open findings by how many days they have been open.
 * Derived from finding.createdDate vs NOW.
 */
export function FindingsAgingBar({ findings }) {
  const open = findings.filter((f) => !["Closed", "Resolved"].includes(f.status));

  const data = BUCKETS.map(({ label, min, max }, i) => ({
    label,
    count: open.filter((f) => {
      const age = Math.round((NOW - new Date(f.createdDate)) / 86_400_000);
      return age >= min && age <= max;
    }).length,
    color: BUCKET_COLORS[i],
  }));

  return (
    <Card className="p-4">
      <SectionTitle sub="How long open findings have been unresolved. Older findings indicate delayed remediation.">
        Open Findings Aging
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <Tooltip formatter={(v) => [v, "Open findings"]} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
