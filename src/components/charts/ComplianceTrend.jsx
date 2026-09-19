import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";

export function ComplianceTrend({ data, currentScore }) {
  return (
    <Card className="p-4">
      <SectionTitle sub="Illustrative trend based on current score. Historical data points populate as periodic assessments are saved over time.">
        Compliance Score Trend
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            domain={[60, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v) => [`${v.toFixed(1)}%`, "Compliance"]}
          />
          <ReferenceLine
            y={80}
            stroke="#d1d5db"
            strokeDasharray="4 2"
            label={{ value: "Target 80%", position: "insideTopRight", fill: "#9ca3af", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="compliance"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#4f46e5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
