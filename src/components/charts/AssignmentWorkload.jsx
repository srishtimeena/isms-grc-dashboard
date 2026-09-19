import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";

const COLORS = ["#4f46e5", "#0891b2", "#0d9488", "#7c3aed", "#ea580c"];

/**
 * AssignmentWorkload — NEW chart
 * Shows open ticket count per assignment group.
 * Derived from tickets array — no hardcoded values.
 */
export function AssignmentWorkload({ tickets }) {
  const groups = [...new Set(tickets.map((t) => t.assignmentGroup))];
  const data = groups.map((g) => ({
    name: g,
    open: tickets.filter((t) => t.assignmentGroup === g && !["Closed", "Resolved"].includes(t.status)).length,
    total: tickets.filter((t) => t.assignmentGroup === g).length,
  }));

  return (
    <Card className="p-4">
      <SectionTitle sub="Open remediation tickets by assignment group. Highlights team workload distribution.">
        Team Workload — Open Tickets
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={110} />
          <Tooltip
            formatter={(v, n, props) => [
              `${props.payload.open} open / ${props.payload.total} total`,
              props.payload.name,
            ]}
          />
          <Bar dataKey="open" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
