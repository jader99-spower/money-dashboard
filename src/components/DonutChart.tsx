"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export type DonutChartItem = {
  name: string;
  value: number;
  amount: number;
  color: string;
};

export interface DonutChartProps {
  data: DonutChartItem[];
  total: number;
}

function formatKRW(n: number) {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `₩${Math.round(n / 10000).toLocaleString()}만`;
  return `₩${n.toLocaleString()}`;
}

export default function DonutChart({ data, total }: DonutChartProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* 도넛 차트 */}
      <div className="relative shrink-0" style={{ width: 240, height: 240 }}>
        <PieChart width={240} height={240}>
          <Pie
            data={data}
            cx={120}
            cy={120}
            innerRadius={72}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
            contentStyle={{
              background: "#1e2530",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#f0f6fc",
              fontSize: "13px",
            }}
            labelStyle={{ color: "#f0f6fc" }}
          />
        </PieChart>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>총 자산</p>
          <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {formatKRW(total)}
          </p>
        </div>
      </div>

      {/* 범례 + 금액 */}
      <div className="flex-1 w-full space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-sm flex-1" style={{ color: "var(--text-muted)" }}>
              {item.name}
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {formatKRW(item.amount)}
            </span>
            <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>
              {item.value}%
            </span>
            <div
              className="w-24 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${item.value}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
