"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type BarChartItem = {
  category: string;
  total: number;
  color: string;
};

interface Props {
  data: BarChartItem[];
}

function fmtKRW(v: number) {
  if (v >= 10000) return `₩${Math.round(v / 10000)}만`;
  return `₩${v.toLocaleString()}`;
}

export default function ExpensesBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 48, 120)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tickFormatter={fmtKRW}
          tick={{ fill: "#8b949e", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={44}
          tick={{ fill: "#8b949e", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => [`₩${Number(v).toLocaleString()}`, "월 합계"]}
          contentStyle={{
            background: "#1e2530",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#f0f6fc",
            fontSize: "13px",
          }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
