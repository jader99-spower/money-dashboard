"use client";

import { signIn } from "next-auth/react";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
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
            로그인
          </h2>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            {/* Google 로고 SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
