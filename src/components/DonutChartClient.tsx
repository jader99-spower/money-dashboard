"use client";

import dynamic from "next/dynamic";
import type { DonutChartProps } from "./DonutChart";

const DonutChart = dynamic<DonutChartProps>(() => import("./DonutChart"), {
  ssr: false,
  loading: () => (
    <div
      className="h-60 rounded-xl animate-pulse"
      style={{ background: "var(--bg-card-hover)" }}
    />
  ),
});

export default DonutChart;
