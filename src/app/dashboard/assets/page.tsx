"use client";

import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Loader2,
  Building2,
  BarChart2,
  ArrowLeftRight,
} from "lucide-react";
import { useAssetContext } from "@/context/AssetContext";
import type { AssetData } from "@/lib/mockData";

const SHEET_NAMES = [
  "1. 은행 및 보험 자산",
  "2. 주식 및 ETF 자산",
  "3. 주식 매매기록",
] as const;

export default function AssetsPage() {
  const { updateAssetData } = useAssetContext();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [parsed, setParsed] = useState<AssetData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setStatus("error");
        setErrorMessage(".xlsx 또는 .xls 파일만 업로드할 수 있습니다.");
        return;
      }

      setStatus("loading");
      setErrorMessage("");
      setParsed(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const getSheet = (name: string) => {
          const sheet = workbook.Sheets[name];
          return sheet
            ? XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
            : [];
        };

        const bankInsurance = getSheet(SHEET_NAMES[0]);
        const stocksEtf = getSheet(SHEET_NAMES[1]);
        const tradeHistory = getSheet(SHEET_NAMES[2]);

        console.log(`📊 ${SHEET_NAMES[0]}:`, bankInsurance);
        console.log(`📈 ${SHEET_NAMES[1]}:`, stocksEtf);
        console.log(`📋 ${SHEET_NAMES[2]}:`, tradeHistory);

        const data: AssetData = { bankInsurance, stocksEtf, tradeHistory };
        updateAssetData(data); // 전역 Context 갱신
        setParsed(data);
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage(
          "파일 파싱 중 오류가 발생했습니다. 양식에 맞는 파일인지 확인해 주세요."
        );
      }
    },
    [updateAssetData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { 자산구분: "은행", 금융기관명: "국민은행", 상품명: "정기예금", 계좌번호: "1234-56-7890", 만기일: "2025-12-31", "금액(원)": 10000000, "이자율(%)": 3.5, 비고: "자동이체" },
        { 자산구분: "IRP", 금융기관명: "미래에셋증권", 상품명: "개인형IRP", 계좌번호: "5678-90-1234", 만기일: "2045-06-30", "금액(원)": 30000000, "이자율(%)": 0, 비고: "퇴직연금" },
        { 자산구분: "보험", 금융기관명: "삼성생명", 상품명: "저축형보험", 계좌번호: "9876-54-3210", 만기일: "2030-06-30", "금액(원)": 5000000, "이자율(%)": 2.8, 비고: "" },
      ]),
      SHEET_NAMES[0]
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { 종목코드: "005930", 종목명: "삼성전자", 구분: "주식", 보유수량: 100, "평균단가(원)": 70000, "현재가(원)": 75000, "평가금액(원)": 7500000, "손익(원)": 500000, "수익률(%)": 7.14 },
        { 종목코드: "069500", 종목명: "KODEX 200", 구분: "ETF", 보유수량: 50, "평균단가(원)": 38000, "현재가(원)": 40000, "평가금액(원)": 2000000, "손익(원)": 100000, "수익률(%)": 5.26 },
      ]),
      SHEET_NAMES[1]
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { 거래일자: "2025-01-15", 종목코드: "005930", 종목명: "삼성전자", 거래구분: "매수", 거래수량: 50, "거래단가(원)": 68000, "거래금액(원)": 3400000, "수수료(원)": 5100, "세금(원)": 0, "순손익(원)": -5100 },
        { 거래일자: "2025-03-20", 종목코드: "005930", 종목명: "삼성전자", 거래구분: "매도", 거래수량: 20, "거래단가(원)": 75000, "거래금액(원)": 1500000, "수수료(원)": 2250, "세금(원)": 2250, "순손익(원)": 135500 },
      ]),
      SHEET_NAMES[2]
    );
    XLSX.writeFile(wb, "자산관리_업로드양식.xlsx");
  };

  // 카테고리별 요약 계산
  const summary = parsed
    ? {
        bank: parsed.bankInsurance.filter((r) => r["자산구분"] === "은행").length,
        irp: parsed.bankInsurance.filter((r) => r["자산구분"] === "IRP").length,
        insurance: parsed.bankInsurance.filter((r) => r["자산구분"] === "보험").length,
        stock: parsed.stocksEtf.filter((r) => r["구분"] === "주식").length,
        etf: parsed.stocksEtf.filter((r) => r["구분"] === "ETF").length,
        trades: parsed.tradeHistory.length,
      }
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            자산 관리
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            엑셀 파일을 업로드하면 대시보드 전체가 실시간으로 갱신됩니다.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#34d399",
          }}
        >
          <Download size={15} />
          양식 다운로드
        </button>
      </div>

      {/* 업로드 영역 */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={17} style={{ color: "#60a5fa" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            엑셀 파일 업로드
          </h2>
        </div>

        <div
          className="flex flex-col items-center justify-center h-44 rounded-xl cursor-pointer transition-all"
          style={{
            border: `2px dashed ${isDragOver ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
            background: isDragOver ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {status === "loading" ? (
            <Loader2 size={32} className="animate-spin" style={{ color: "#60a5fa" }} />
          ) : (
            <>
              <Upload size={30} className="mb-3" style={{ color: isDragOver ? "#60a5fa" : "var(--text-muted)" }} />
              <p className="text-sm font-medium" style={{ color: isDragOver ? "#60a5fa" : "var(--text-primary)" }}>
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                .xlsx, .xls 지원 · 3개 시트 양식 필수
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />

        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          시트 구성: {SHEET_NAMES.join(" · ")}
        </p>
      </div>

      {/* 에러 */}
      {status === "error" && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <XCircle size={16} style={{ color: "#ef4444" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "#fca5a5" }}>{errorMessage}</p>
        </div>
      )}

      {/* 성공 + 요약 */}
      {status === "success" && parsed && summary && (
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          {/* 성공 배너 */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <CheckCircle size={16} style={{ color: "#10b981" }} className="shrink-0" />
            <p className="text-sm font-medium" style={{ color: "#6ee7b7" }}>
              엑셀 데이터가 성공적으로 로드되어 대시보드에 반영되었습니다 ✅
            </p>
          </div>

          {/* 카테고리별 요약 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 은행/보험 */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={15} style={{ color: "#f59e0b" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>은행 및 보험</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>은행 계좌</span>
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>{summary.bank}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>IRP 계좌</span>
                  <span className="font-semibold" style={{ color: "#8b5cf6" }}>{summary.irp}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>저축형보험</span>
                  <span className="font-semibold" style={{ color: "#10b981" }}>{summary.insurance}개</span>
                </div>
              </div>
            </div>

            {/* 주식/ETF */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={15} style={{ color: "#3b82f6" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>주식 및 ETF</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>주식 종목</span>
                  <span className="font-semibold" style={{ color: "#3b82f6" }}>{summary.stock}종목</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>ETF 종목</span>
                  <span className="font-semibold" style={{ color: "#60a5fa" }}>{summary.etf}종목</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>총 보유</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{summary.stock + summary.etf}종목</span>
                </div>
              </div>
            </div>

            {/* 매매기록 */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight size={15} style={{ color: "#a78bfa" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>매매기록</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>총 거래건수</span>
                  <span className="font-semibold" style={{ color: "#a78bfa" }}>{summary.trades}건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>매수</span>
                  <span className="font-semibold" style={{ color: "#10b981" }}>
                    {parsed.tradeHistory.filter((r) => r["거래구분"] === "매수").length}건
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>매도</span>
                  <span className="font-semibold" style={{ color: "#ef4444" }}>
                    {parsed.tradeHistory.filter((r) => r["거래구분"] === "매도").length}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            * 상세 데이터는 브라우저 콘솔(F12)에서 확인 · 페이지 새로고침 시 초기 데이터로 복원됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
