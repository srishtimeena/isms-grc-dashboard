import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { CHART_COLORS } from "../../constants/statusStyles.js";

const SEV_COLORS = {
  Critical: CHART_COLORS.critical,
  High:     CHART_COLORS.high,
  Medium:   CHART_COLORS.medium,
  Low:      CHART_COLORS.low,
};

export function FindingsBySeverity({ findings }) {
  const data = ["Critical", "High", "Medium", "Low"].map((s) => ({
    name: s,
    total: findings.filter((f) => f.severity === s).length,
    open:  findings.filter((f) => f.severity === s && !["Closed", "Resolved"].includes(f.status)).length,
  }));

  return (
    <Card className="p-4">
      <SectionTitle sub="All findings grouped by severity. Open findings shown darker; closed are counted but lightly stacked.">
        Findings by Severity
      </SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <Tooltip
            formatter={(v, n) => [v, n === "open" ? "Open" : "Total"]}
            labelFormatter={(l) => `${l} Severity`}
          />
          <Bar dataKey="total" name="total" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d, i) => (
              <Cell key={i} fill={SEV_COLORS[d.name]} fillOpacity={0.25} />
            ))}
          </Bar>
          <Bar dataKey="open" name="open" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d, i) => (
              <Cell key={i} fill={SEV_COLORS[d.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-2 rounded-sm bg-slate-300 inline-block" />Total
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-2 rounded-sm bg-red-500 inline-block" />Open
        </div>
      </div>
    </Card>
  );
}
