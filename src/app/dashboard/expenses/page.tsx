"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Receipt, CalendarDays, TrendingDown } from "lucide-react";
import { useAssetContext } from "@/context/AssetContext";
import type { BarChartItem } from "@/components/ExpensesBarChart";

const ExpensesBarChart = dynamic(() => import("@/components/ExpensesBarChart"), {
  ssr: false,
  loading: () => (
    <div className="h-40 animate-pulse rounded-xl" style={{ background: "var(--bg-card-hover)" }} />
  ),
});

const CATEGORIES = ["보험", "구독", "통신", "건강", "교육", "기타"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  보험: "#ef4444",
  구독: "#3b82f6",
  통신: "#10b981",
  건강: "#8b5cf6",
  교육: "#f59e0b",
  기타: "#6b7280",
};

function fmtKRW(n: number) {
  return `₩${n.toLocaleString()}`;
}

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useAssetContext();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  const monthlyTotal = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const chartData = useMemo<BarChartItem[]>(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => ({
        category: cat,
        total,
        color: CATEGORY_COLORS[cat] ?? "#6b7280",
      }));
  }, [expenses]);

  function handleAdd() {
    setFormError("");
    if (!name.trim()) { setFormError("항목명을 입력해 주세요."); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setFormError("올바른 금액을 입력해 주세요."); return; }
    addExpense({ name: name.trim(), category, amount: amt });
    setName("");
    setAmount("");
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    borderRadius: "10px",
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          정기 지출 관리
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          매월 고정으로 나가는 지출을 관리하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 폼 + 목록 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 입력 폼 */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              정기 지출 추가
            </h2>

            {formError && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="항목명 (예: 넷플릭스)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="sm:col-span-1 px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#161b22" }}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="월 금액 (원)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                min={0}
              />
            </div>

            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Plus size={15} />
              추가하기
            </button>
          </div>

          {/* 지출 목록 */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              등록된 정기 지출
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                ({expenses.length}건)
              </span>
            </h2>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32" style={{ color: "var(--text-muted)" }}>
                <Receipt size={28} className="mb-2 opacity-40" />
                <p className="text-sm">등록된 정기 지출이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}
                  >
                    {/* 카테고리 색상 점 */}
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: CATEGORY_COLORS[e.category] ?? "#6b7280" }}
                    />
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {e.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${CATEGORY_COLORS[e.category] ?? "#6b7280"}18`,
                        color: CATEGORY_COLORS[e.category] ?? "#6b7280",
                        border: `1px solid ${CATEGORY_COLORS[e.category] ?? "#6b7280"}33`,
                      }}
                    >
                      {e.category}
                    </span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {fmtKRW(e.amount)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>/월</span>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="p-1.5 rounded-lg transition-colors shrink-0"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(el) => { (el.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (el.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                      onMouseLeave={(el) => { (el.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; (el.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 요약 + 바 차트 */}
        <div className="space-y-5">
          {/* 월 합계 KPI */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)" }}
              >
                <Receipt size={17} style={{ color: "#ef4444" }} />
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                월 고정 지출 합계
              </p>
            </div>
            <p className="text-3xl font-black tabular-nums" style={{ color: "#ef4444" }}>
              {fmtKRW(monthlyTotal)}
            </p>
            <div className="mt-3 pt-3 space-y-1" style={{ borderTop: "1px solid var(--border-color)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>
                  <CalendarDays size={11} className="inline mr-1" />
                  연간 합계
                </span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {fmtKRW(monthlyTotal * 12)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>
                  <TrendingDown size={11} className="inline mr-1" />
                  항목 수
                </span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {expenses.length}건
                </span>
              </div>
            </div>
          </div>

          {/* 카테고리 바 차트 */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <h3 className="text-xs font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
              카테고리별 지출
            </h3>
            {chartData.length > 0 ? (
              <ExpensesBarChart data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-24" style={{ color: "var(--text-muted)" }}>
                <p className="text-sm">데이터 없음</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
