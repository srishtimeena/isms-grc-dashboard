import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";

const colorFor = (pct) =>
  pct >= 80 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";

export function ClauseComplianceBar({ data }) {
  return (
    <Card className="p-4">
      <SectionTitle sub="ISO/IEC 27001:2022 management system clauses 4–10. Partially compliant clauses score 50%.">
        Compliance by ISO Clause
      </SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="clause"
            tickFormatter={(v) => `Cl. ${v}`}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => [`${v.toFixed(1)}%`, "Compliance"]}
            labelFormatter={(l) => `Clause ${l}`}
          />
          <ReferenceLine y={80} stroke="#d1d5db" strokeDasharray="4 2" label={{ value: "80%", position: "insideTopRight", fill: "#9ca3af", fontSize: 10 }} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.percent)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
