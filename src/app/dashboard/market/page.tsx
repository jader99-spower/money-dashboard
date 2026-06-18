"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  ArrowUpDown,
  Newspaper,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// ── 타입 ─────────────────────────────────────────────────────────
type IndexData = {
  name: string;
  region: string;
  point: number;
  change: number;
  changePercent: number;
};

type NewsItem = {
  title: string;
  link: string;
  press: string;
  pubDate: string;
  summary: string;
};

type StockItem = {
  rank: number;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // 조원
  volume: number;    // 만주
};

// ── 헬퍼 ─────────────────────────────────────────────────────────
type SortKey = "marketCap" | "changePercent" | "volume";

function getChangeStyle(v: number) {
  if (v > 0) return { color: "#ef4444", icon: TrendingUp as typeof TrendingUp };
  if (v < 0) return { color: "#3b82f6", icon: TrendingDown as typeof TrendingDown };
  return { color: "var(--text-muted)", icon: Minus as typeof Minus };
}

function fmtPrice(n: number)  { return `₩${n.toLocaleString()}`; }
function fmtPct(n: number)    { return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`; }
function fmtChange(n: number) { return `${n >= 0 ? "+" : ""}${n.toLocaleString()}`; }

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (!isFinite(diff) || diff < 0) return "최근";
  if (diff < 60)   return `${Math.round(diff)}분 전`;
  if (diff < 1440) return `${Math.round(diff / 60)}시간 전`;
  return `${Math.round(diff / 1440)}일 전`;
}

// ── 스켈레톤: 지수 카드 ───────────────────────────────────────────
function SkeletonIndexCard() {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 animate-pulse"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="w-8 h-8 rounded-lg"   style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div className="h-4 w-24 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="h-8 w-36 rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded"      style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-4 w-16 rounded"     style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-5 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

// ── 스켈레톤: 테이블 행 ──────────────────────────────────────────
function SkeletonTableRow() {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
      {[28, 88, 72, 60, 56, 52].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div
            className="h-4 rounded animate-pulse"
            style={{
              width: w,
              background: "rgba(255,255,255,0.07)",
              marginLeft: i >= 2 ? "auto" : undefined,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── 스켈레톤: 뉴스 카드 ──────────────────────────────────────────
function SkeletonNewsCard() {
  return (
    <div
      className="rounded-xl p-4 animate-pulse"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 w-12 rounded"      style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div className="h-4 w-full rounded mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-4 w-4/5 rounded mb-4"   style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="h-3 w-full rounded mb-1"  style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-3 w-5/6 rounded mb-1"  style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-3 w-3/4 rounded mb-4"  style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-3 w-16 rounded"         style={{ background: "rgba(59,130,246,0.15)" }} />
    </div>
  );
}

// ── 뉴스 카드 ────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
        >
          {item.press}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo(item.pubDate)}
        </span>
      </div>
      <p
        className="text-sm font-bold leading-snug line-clamp-2 transition-colors group-hover:text-blue-400"
        style={{ color: "var(--text-primary)" }}
      >
        {item.title}
      </p>
      <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: "var(--text-muted)" }}>
        {item.summary}
      </p>
      <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(96,165,250,0.7)" }}>
        <ExternalLink size={11} />
        <span>원문 보기</span>
      </div>
    </a>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function MarketPage() {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");

  // 실시간 지수 데이터
  const [indices, setIndices]               = useState<IndexData[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [indicesSource, setIndicesSource]   = useState<"live" | "mock">("mock");
  const [fetchedAt, setFetchedAt]           = useState<string>("");

  // 시총 TOP 20 실시간 데이터
  const [stocks, setStocks]               = useState<StockItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksSource, setStocksSource]   = useState<"live" | "mock">("mock");

  // 뉴스 데이터
  const [news, setNews]               = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const sorted = useMemo(
    () => [...stocks].sort((a, b) => b[sortKey] - a[sortKey]),
    [stocks, sortKey]
  );

  // 지수 fetch
  useEffect(() => {
    fetch("/api/market-indices")
      .then((r) => r.json())
      .then((d) => {
        setIndices(d.items ?? []);
        setIndicesSource(d.source ?? "mock");
        setFetchedAt(d.fetchedAt ?? "");
      })
      .catch(() => setIndices([]))
      .finally(() => setIndicesLoading(false));
  }, []);

  // 시총 TOP 20 fetch
  useEffect(() => {
    fetch("/api/top-stocks")
      .then((r) => r.json())
      .then((d) => {
        setStocks(d.items ?? []);
        setStocksSource(d.source ?? "mock");
      })
      .catch(() => setStocks([]))
      .finally(() => setStocksLoading(false));
  }, []);

  // 뉴스 fetch
  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setNews(d.items ?? []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const SORT_BUTTONS: { key: SortKey; label: string }[] = [
    { key: "marketCap",     label: "시가총액 순" },
    { key: "changePercent", label: "등락률 순"   },
    { key: "volume",        label: "거래량 순"   },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            시장 현황
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            국내외 주요 지수 및 시총 상위 20위 종목
          </p>
        </div>

        {/* 데이터 소스 뱃지 */}
        {!indicesLoading && (
          <div className="flex items-center gap-1.5 text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
            <RefreshCw size={11} />
            <span
              className="px-2 py-0.5 rounded-full font-medium"
              style={{
                background: indicesSource === "live" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                color:      indicesSource === "live" ? "#34d399"                : "#fbbf24",
              }}
            >
              {indicesSource === "live" ? "실시간" : "모크 데이터"}
            </span>
            {fetchedAt && (
              <span>
                {new Date(fetchedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 지수 카드 4개 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicesLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonIndexCard key={i} />)
          : indices.map((idx) => {
              const { color, icon: Icon } = getChangeStyle(idx.changePercent);
              return (
                <div
                  key={idx.name}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <Globe size={10} />
                      {idx.region}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                  </div>

                  <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                    {idx.name}
                  </p>

                  <p
                    className="text-2xl font-black tabular-nums leading-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {idx.point.toLocaleString("ko-KR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                  <div
                    className="flex items-center gap-2 text-sm font-semibold tabular-nums"
                    style={{ color }}
                  >
                    <Icon size={14} />
                    <span>{fmtChange(idx.change)}</span>
                    <span
                      className="text-xs font-normal px-1.5 py-0.5 rounded"
                      style={{ background: `${color}15` }}
                    >
                      {fmtPct(idx.changePercent)}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* ── 시총 Top 20 테이블 ── */}
      <div
        className="rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              시가총액 상위 20위
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {stocksLoading
                ? "데이터 로딩 중..."
                : stocksSource === "live"
                  ? "실시간 Yahoo Finance 기준 · KOSPI·KOSDAQ"
                  : "모의 데이터 (Yahoo Finance 연결 실패)"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 종목 데이터 소스 뱃지 */}
            {!stocksLoading && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium mr-1"
                style={{
                  background: stocksSource === "live" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  color:      stocksSource === "live" ? "#34d399"                : "#fbbf24",
                }}
              >
                {stocksSource === "live" ? "실시간" : "모크"}
              </span>
            )}
            <ArrowUpDown size={13} style={{ color: "var(--text-muted)" }} />
            {SORT_BUTTONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: sortKey === key ? "var(--accent)" : "rgba(255,255,255,0.05)",
                  color:      sortKey === key ? "#fff"          : "var(--text-muted)",
                  border:     sortKey === key ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                {["순위", "종목명", "현재가", "등락률", "시가총액", "거래량"].map((h, i) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color: "var(--text-muted)", textAlign: i < 2 ? "left" : "right" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocksLoading
                ? Array.from({ length: 20 }).map((_, i) => <SkeletonTableRow key={i} />)
                : sorted.map((stock, idx) => {
                    const { color, icon: ChangeIcon } = getChangeStyle(stock.changePercent);
                    return (
                      <tr
                        key={stock.name}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border-color)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                        }}
                      >
                        <td className="px-5 py-3 w-12">
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                            style={{
                              background: idx < 3 ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.05)",
                              color:      idx < 3 ? "#60a5fa"                : "var(--text-muted)",
                            }}
                          >
                            {stock.rank}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {stock.name}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {fmtPrice(stock.price)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className="inline-flex items-center justify-end gap-1 text-sm font-semibold tabular-nums"
                            style={{ color }}
                          >
                            <ChangeIcon size={13} />
                            {fmtPct(stock.changePercent)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {stock.marketCap.toFixed(1)}조
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
                            {stock.volume.toLocaleString()}만주
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        <p className="text-xs px-5 py-3" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-color)" }}>
          * 거래 시간 외에는 전일 종가 기준으로 표시됩니다. 시가총액은 Yahoo Finance 기준이며 실제와 다를 수 있습니다.
        </p>
      </div>

      {/* ── 뉴스 배너 ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Newspaper size={16} style={{ color: "var(--text-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            주식시장 대장주 뉴스
          </h2>
          {!newsLoading && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
            >
              {news.length}건
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {newsLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonNewsCard key={i} />)
            : news.length > 0
              ? news.map((item, i) => <NewsCard key={i} item={item} />)
              : (
                <div
                  className="col-span-full flex items-center justify-center h-24 rounded-xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-muted)",
                  }}
                >
                  <p className="text-sm">뉴스를 불러올 수 없습니다.</p>
                </div>
              )
          }
        </div>
      </section>
    </div>
  );
}
