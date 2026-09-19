import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const MONTH_NUMS = [3, 4, 5, 6, 7, 8, 9]; // 2026

/**
 * FindingClosureTrend — NEW chart
 * Shows opened vs closed findings per month, derived from
 * finding.createdDate and finding.closedDate.
 */
export function FindingClosureTrend({ findings }) {
  const data = MONTHS.map((month, i) => {
    const m = MONTH_NUMS[i];
    const opened = findings.filter((f) => {
      const d = new Date(f.createdDate);
      return d.getFullYear() === 2026 && d.getMonth() + 1 === m;
    }).length;
    const closed = findings.filter((f) => {
      if (!f.closedDate) return false;
      const d = new Date(f.closedDate);
      return d.getFullYear() === 2026 && d.getMonth() + 1 === m;
    }).length;
    return { month, opened, closed };
  });

  return (
    <Card className="p-4">
      <SectionTitle sub="Monthly finding creation vs closure. A healthy program shows closures keeping pace with openings.">
        Finding Open / Close Trend
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="opened"
            name="Opened"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="closed"
            name="Closed"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
