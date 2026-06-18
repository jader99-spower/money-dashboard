"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Briefcase,
  Coins,
  ChevronRight,
} from "lucide-react";
import DateTimeWidget from "@/components/DateTimeWidget";
import DonutChart from "@/components/DonutChartClient";
import { useAssetContext } from "@/context/AssetContext";

const n = (v: unknown) => Number(v) || 0;

function fmt(amount: number, sign = false): string {
  const prefix = sign ? (amount >= 0 ? "+" : "") : "";
  if (Math.abs(amount) >= 100000000)
    return `${prefix}₩${(amount / 100000000).toFixed(2)}억`;
  if (Math.abs(amount) >= 10000)
    return `${prefix}₩${Math.round(amount / 10000).toLocaleString()}만`;
  return `${prefix}₩${amount.toLocaleString()}`;
}

const DONUT_COLORS = {
  "주식/ETF": "#3b82f6",
  IRP계좌: "#8b5cf6",
  저축형보험: "#10b981",
  은행계좌: "#f59e0b",
};

export default function DashboardPage() {
  const { data } = useAssetContext();
  const { bankInsurance, stocksEtf, tradeHistory } = data;

  const kpi = useMemo(() => {
    const bankOnly = bankInsurance
      .filter((r) => r["자산구분"] === "은행")
      .reduce((s, r) => s + n(r["금액(원)"]), 0);
    const irpOnly = bankInsurance
      .filter((r) => r["자산구분"] === "IRP")
      .reduce((s, r) => s + n(r["금액(원)"]), 0);
    const insOnly = bankInsurance
      .filter((r) => r["자산구분"] === "보험")
      .reduce((s, r) => s + n(r["금액(원)"]), 0);
    const stockEtfTotal = stocksEtf.reduce((s, r) => s + n(r["평가금액(원)"]), 0);
    const totalAssets = bankOnly + irpOnly + insOnly + stockEtfTotal;

    const totalProfit = stocksEtf.reduce((s, r) => s + n(r["손익(원)"]), 0);
    const tradeProfit = tradeHistory.reduce((s, r) => s + n(r["순손익(원)"]), 0);
    const annualInterest = bankInsurance.reduce(
      (s, r) => s + n(r["금액(원)"]) * (n(r["이자율(%)"]) / 100),
      0
    );
    const portfolioCount = stocksEtf.length;

    const donutSegments = [
      { name: "주식/ETF", amount: stockEtfTotal },
      { name: "IRP계좌", amount: irpOnly },
      { name: "저축형보험", amount: insOnly },
      { name: "은행계좌", amount: bankOnly },
    ]
      .filter((d) => d.amount > 0)
      .map((d) => ({
        ...d,
        value: totalAssets > 0 ? Math.round((d.amount / totalAssets) * 100) : 0,
        color: DONUT_COLORS[d.name as keyof typeof DONUT_COLORS] ?? "#6b7280",
      }));

    return {
      totalAssets,
      totalProfit,
      tradeProfit,
      annualInterest,
      portfolioCount,
      donutSegments,
    };
  }, [bankInsurance, stocksEtf, tradeHistory]);

  const KPI_CARDS = [
    {
      label: "총 자산 현황",
      value: fmt(kpi.totalAssets),
      sub: "전체 보유 자산",
      icon: Wallet,
      iconColor: "#3b82f6",
      iconBg: "rgba(59,130,246,0.12)",
      valueColor: undefined as string | undefined,
    },
    {
      label: "주식/ETF 총 수익",
      value: fmt(kpi.totalProfit, true),
      sub: "평균단가 대비 평가손익",
      icon: TrendingUp,
      iconColor: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
      valueColor: kpi.totalProfit >= 0 ? "#10b981" : "#ef4444",
    },
    {
      label: "매매 누적 손익",
      value: fmt(kpi.tradeProfit, true),
      sub: "매매기록 순손익 합계",
      icon: BarChart3,
      iconColor: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
      valueColor: kpi.tradeProfit >= 0 ? "#10b981" : "#ef4444",
    },
    {
      label: "주식 평가손익",
      value: fmt(kpi.totalProfit, true),
      sub: "보유 종목 손익",
      icon: TrendingDown,
      iconColor: kpi.totalProfit >= 0 ? "#10b981" : "#ef4444",
      iconBg:
        kpi.totalProfit >= 0
          ? "rgba(16,185,129,0.12)"
          : "rgba(239,68,68,0.12)",
      valueColor: kpi.totalProfit >= 0 ? "#10b981" : "#ef4444",
    },
    {
      label: "포트폴리오 수",
      value: `${kpi.portfolioCount}종목`,
      sub: "보유 종목 수",
      icon: Briefcase,
      iconColor: "#8b5cf6",
      iconBg: "rgba(139,92,246,0.12)",
      valueColor: undefined as string | undefined,
    },
    {
      label: "예상 연간 이자",
      value: fmt(kpi.annualInterest),
      sub: "은행/IRP/보험 이자 합산",
      icon: Coins,
      iconColor: "#f59e0b",
      iconBg: "rgba(245,158,11,0.12)",
      valueColor: "#f59e0b",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm mb-1.5" style={{ color: "var(--text-muted)" }}>
            안녕하세요, 좋은 하루 보내세요 👋
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            홍길동님의 자산관리 보드입니다.
          </h1>
        </div>
        <DateTimeWidget />
      </div>

      {/* 퀵 버튼 */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/assets"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#60a5fa",
          }}
        >
          <Wallet size={15} />
          자산관리 현황 보기
          <ChevronRight size={14} />
        </Link>
        <Link
          href="/dashboard/market"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#34d399",
          }}
        >
          <TrendingUp size={15} />
          국내 주식시장 현황 보기
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* KPI 카드 6개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {item.label}
                </p>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: item.iconBg }}
                >
                  <Icon size={17} style={{ color: item.iconColor }} />
                </div>
              </div>
              <p
                className="text-xl font-bold tracking-tight"
                style={{ color: item.valueColor ?? "var(--text-primary)" }}
              >
                {item.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {item.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* 도넛 차트 */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            자산 배분 현황
          </h2>
          <span className="text-xs px-2 py-1 rounded-md" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
            엑셀 업로드 시 자동 갱신
          </span>
        </div>
        {kpi.donutSegments.length > 0 ? (
          <DonutChart data={kpi.donutSegments} total={kpi.totalAssets} />
        ) : (
          <div className="flex items-center justify-center h-40" style={{ color: "var(--text-muted)" }}>
            데이터가 없습니다. 자산관리 페이지에서 엑셀을 업로드해 주세요.
          </div>
        )}
      </div>
    </div>
  );
}
