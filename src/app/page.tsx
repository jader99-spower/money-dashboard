"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, LogIn } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error ?? "로그인에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* 배경 그라데이션 광원 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* 타이틀 영역 */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <TrendingUp size={26} className="text-blue-300" />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            PERSONAL ASSET MANAGER
          </p>

          <h1 className="text-4xl font-black leading-tight tracking-tight">
            <span style={{ color: "var(--text-primary)" }}>돈은 벌어도</span>
            <br />
            <span style={{ color: "#fbbf24" }}>벌어도 없는것</span>
            <span className="ml-2 text-3xl">🤷</span>
          </h1>

          <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
            그래도 관리는 해야죠.{" "}
            <span className="text-base">💸</span>
          </p>
        </div>

        {/* 로그인 카드 */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2 className="text-base font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
            관리자 로그인
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#f87171", background: "rgba(239,68,68,0.1)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.85)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "rgba(59,130,246,1)"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "rgba(59,130,246,0.85)"; }}
            >
              <LogIn size={16} />
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
