import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { ticketSLA } from "../../utils/sla.js";
import { CHART_COLORS } from "../../constants/statusStyles.js";

/**
 * SLAChart — NEW chart
 * Shows SLA compliance breakdown per assignment group.
 * All values derived from ticketSLA() — no hardcoded numbers.
 */
export function SLAChart({ tickets }) {
  const groups = [...new Set(tickets.map((t) => t.assignmentGroup))];

  const data = groups.map((g) => {
    const gt = tickets.filter((t) => t.assignmentGroup === g);
    return {
      group: g,
      within:  gt.filter((t) => ticketSLA(t).status === "Within SLA").length,
      atRisk:  gt.filter((t) => ticketSLA(t).status === "At Risk").length,
      breached: gt.filter((t) => ticketSLA(t).status === "Breached").length,
    };
  });

  return (
    <Card className="p-4">
      <SectionTitle sub="SLA status per assignment group. Breached tickets require immediate escalation.">
        SLA Performance by Assignment Group
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <YAxis type="category" dataKey="group" tick={{ fontSize: 11, fill: "#64748b" }} width={110} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="within"  name="Within SLA" stackId="a" fill={CHART_COLORS.within}  radius={[0, 0, 0, 0]} />
          <Bar dataKey="atRisk"  name="At Risk"    stackId="a" fill={CHART_COLORS.atRisk}  />
          <Bar dataKey="breached" name="Breached"  stackId="a" fill={CHART_COLORS.breached} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
