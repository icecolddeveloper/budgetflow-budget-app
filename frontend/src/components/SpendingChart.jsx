import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "../utils/format";

export function SpendingChart({ data }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={70}
            outerRadius={106}
            paddingAngle={4}
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #ece4d8",
              background: "#fffdf8",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
