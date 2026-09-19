import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { CHART_COLORS } from "../../constants/statusStyles.js";

const COLORS = [
  CHART_COLORS.compliant,
  CHART_COLORS.partial,
  CHART_COLORS.nonCompliant,
  CHART_COLORS.na,
  CHART_COLORS.notAssessed,
];

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ComplianceDistribution({ data }) {
  return (
    <Card className="p-4">
      <SectionTitle sub="Distribution of assessment outcomes across all 93 Annex A controls.">
        Control Assessment Distribution
      </SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={52}
            outerRadius={82}
            labelLine={false}
            label={<CustomLabel />}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(value) => <span style={{ color: "#475569" }}>{value}</span>}
          />
          <Tooltip formatter={(v, n) => [v, n]} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
