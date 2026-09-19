import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";

const colorFor = (pct) =>
  pct >= 80 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-800 mb-1">{label} — {d.name}</div>
      <div>Compliance: <strong>{d.percent.toFixed(1)}%</strong></div>
      <div className="text-slate-500">{d.compliant} compliant · {d.partial} partial · {d.nonCompliant} non-compliant</div>
      {d.na > 0 && <div className="text-slate-400">{d.na} not applicable</div>}
    </div>
  );
};

export function DomainComplianceBar({ data }) {
  return (
    <Card className="p-4">
      <SectionTitle sub="Compliance score per Annex A domain. Score = (Compliant×100 + Partial×50) ÷ Assessed×100. N/A controls are excluded.">
        Compliance by Annex A Domain
      </SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.percent)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
