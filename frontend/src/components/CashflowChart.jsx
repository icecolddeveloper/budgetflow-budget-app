import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "../utils/format";

export function CashflowChart({ data }) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ left: 4, right: 4, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.36} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d7d4ca" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #ece4d8",
              background: "#fffdf8",
            }}
          />
          <Area
            type="monotone"
            dataKey="deposits"
            stroke="#0f766e"
            fill="url(#depositGradient)"
            strokeWidth={3}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#f97316"
            fill="url(#spendingGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
