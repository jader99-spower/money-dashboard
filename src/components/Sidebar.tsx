"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  Sparkles,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "홈", href: "/dashboard" },
  { icon: Wallet, label: "자산 관리", href: "/dashboard/assets" },
  { icon: Receipt, label: "정기 지출", href: "/dashboard/expenses" },
  { icon: TrendingUp, label: "시장 현황", href: "/dashboard/market" },
  { icon: Sparkles, label: "Gemini AI 비서", href: "/dashboard/ai-assistant" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const userName = session?.user?.name ?? "사용자";
  const userEmail = session?.user?.email ?? "";
  const avatarUrl = session?.user?.image ?? null;
  const avatarInitial = userName.charAt(0);

  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0"
      style={{
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* 로고 */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <TrendingUp size={16} className="text-blue-300" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
              자산관리
            </p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>
              대시보드
            </p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                color: active ? "#60a5fa" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                size={17}
                style={{ color: active ? "#60a5fa" : "var(--text-muted)" }}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} style={{ color: "#60a5fa" }} />}
            </Link>
          );
        })}
      </nav>

      {/* 유저 프로필 */}
      <div
        className="px-3 py-4 space-y-0.5"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}
            >
              {avatarInitial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {userName}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
