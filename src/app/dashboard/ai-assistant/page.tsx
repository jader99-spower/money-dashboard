"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { useAssetContext } from "@/context/AssetContext";

type Message = { role: "user" | "ai"; text: string };

const INITIAL_MESSAGE: Message = {
  role: "ai",
  text: "안녕하세요! 홍길동님의 자산 데이터를 기반으로 맞춤 재무 조언을 해드리는 Gemini 비서입니다. 자산 비중이나 고정 지출 줄이기 등 궁금한 점을 물어보세요!",
};

const SAMPLE_PROMPTS = [
  "내 포트폴리오 리스크를 분석해줘",
  "고정 지출 중 줄일 수 있는 항목을 알려줘",
  "현재 자산 배분이 적절한지 평가해줘",
  "ETF와 개별 주식의 비중을 어떻게 조정할까?",
];

const n = (v: unknown) => Number(v) || 0;

function buildPrompt(
  userMsg: string,
  data: ReturnType<typeof useAssetContext>["data"],
  expenses: ReturnType<typeof useAssetContext>["expenses"]
): string {
  const { bankInsurance, stocksEtf } = data;

  const bankTotal = bankInsurance.reduce((s, r) => s + n(r["금액(원)"]), 0);
  const stockTotal = stocksEtf.reduce((s, r) => s + n(r["평가금액(원)"]), 0);
  const totalAssets = bankTotal + stockTotal;
  const monthlyExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const bankLines = bankInsurance
    .map((r) => `  - ${r["금융기관명"]} ${r["상품명"]} (${r["자산구분"]}): ₩${n(r["금액(원)"]).toLocaleString()}`)
    .join("\n");

  const stockLines = stocksEtf
    .map(
      (r) =>
        `  - ${r["종목명"]} (${r["구분"]}): ${r["보유수량"]}주, 평가금액 ₩${n(r["평가금액(원)"]).toLocaleString()}, 수익률 ${r["수익률(%)"]?.toString() ?? "?"}%`
    )
    .join("\n");

  const expenseLines = expenses
    .map((e) => `  - ${e.name} (${e.category}): ₩${e.amount.toLocaleString()}/월`)
    .join("\n");

  return `당신은 개인 재무 어시스턴트입니다. 반드시 한국어로 간결하고 친절하게 답변하세요.

[사용자 자산 현황]
• 총 자산: ₩${totalAssets.toLocaleString()}
• 은행/보험 자산 (${bankInsurance.length}건, 합계 ₩${bankTotal.toLocaleString()}):
${bankLines}
• 주식/ETF 보유 (${stocksEtf.length}종목, 합계 ₩${stockTotal.toLocaleString()}):
${stockLines}
• 월 정기 지출 (${expenses.length}건, 월 합계 ₩${monthlyExpenses.toLocaleString()}):
${expenseLines}

[사용자 질문]
${userMsg}`;
}

export default function AiAssistantPage() {
  const { data, expenses } = useAssetContext();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setInput("");
      setLoading(true);

      try {
        const prompt = buildPrompt(trimmed, data, expenses);
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const json = await res.json();
        const aiText =
          json.text ??
          json.error ??
          "알 수 없는 오류가 발생했습니다.";
        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, data, expenses]
  );

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Gemini AI 자산 비서
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            실시간 자산 데이터 기반 맞춤 재무 조언
          </p>
        </div>
      </div>

      {/* 추천 질문 칩 */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {SAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto rounded-xl p-4 space-y-4 min-h-0"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* AI 아이콘 */}
            {msg.role === "ai" && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
              >
                <Sparkles size={14} className="text-white" />
              </div>
            )}

            {/* 말풍선 */}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={
                msg.role === "user"
                  ? {
                      background: "var(--accent)",
                      color: "#fff",
                      borderBottomRightRadius: "4px",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              {msg.text}
            </div>

            {/* 사용자 아이콘 */}
            {msg.role === "user" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}
              >
                홍
              </div>
            )}
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderBottomLeftRadius: "4px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    background: "#a78bfa",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="자산 관련 질문을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          disabled={loading}
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff" }}
        >
          <Send size={14} />
          전송
        </button>
      </div>
    </div>
  );
}
