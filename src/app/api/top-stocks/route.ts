export const dynamic = "force-dynamic";

type StockItem = {
  rank: number;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // 조원 단위
  volume: number;    // 만주 단위
};

const SYMBOLS: { ticker: string; name: string }[] = [
  { ticker: "005930.KS", name: "삼성전자" },
  { ticker: "000660.KS", name: "SK하이닉스" },
  { ticker: "373220.KS", name: "LG에너지솔루션" },
  { ticker: "207940.KS", name: "삼성바이오로직스" },
  { ticker: "005380.KS", name: "현대차" },
  { ticker: "000270.KS", name: "기아" },
  { ticker: "012450.KS", name: "한화에어로스페이스" },
  { ticker: "105560.KS", name: "KB금융" },
  { ticker: "005490.KS", name: "POSCO홀딩스" },
  { ticker: "068270.KS", name: "셀트리온" },
  { ticker: "012330.KS", name: "현대모비스" },
  { ticker: "035420.KS", name: "NAVER" },
  { ticker: "055550.KS", name: "신한지주" },
  { ticker: "035720.KS", name: "카카오" },
  { ticker: "259960.KS", name: "크래프톤" },
  { ticker: "034020.KS", name: "두산에너빌리티" },
  { ticker: "006400.KS", name: "삼성SDI" },
  { ticker: "051910.KS", name: "LG화학" },
  { ticker: "066570.KS", name: "LG전자" },
  { ticker: "010130.KS", name: "고려아연" },
];

// 시가총액은 v8 chart API에 없으므로 기준값 유지 (단위: 조원)
const FALLBACK_MARKET_CAP: Record<string, number> = {
  "005930.KS": 475.2, "000660.KS": 159.1, "373220.KS":  92.0,
  "207940.KS":  80.3, "005380.KS":  62.4, "000270.KS":  48.1,
  "012450.KS":  45.3, "105560.KS":  36.2, "005490.KS":  34.8,
  "068270.KS":  33.2, "012330.KS":  33.1, "035420.KS":  32.5,
  "055550.KS":  27.3, "035720.KS":  26.2, "259960.KS":  24.8,
  "034020.KS":  24.1, "006400.KS":  21.4, "051910.KS":  21.0,
  "066570.KS":  20.3, "010130.KS":  19.7,
};

const FALLBACK: Record<string, Omit<StockItem, "rank" | "name">> = {
  "005930.KS": { price:    71300, changePercent: +2.10, marketCap: FALLBACK_MARKET_CAP["005930.KS"], volume: 1284 },
  "000660.KS": { price:   218000, changePercent: +3.42, marketCap: FALLBACK_MARKET_CAP["000660.KS"], volume:  382 },
  "373220.KS": { price:   392000, changePercent: -0.76, marketCap: FALLBACK_MARKET_CAP["373220.KS"], volume:   94 },
  "207940.KS": { price:  1124000, changePercent: +1.17, marketCap: FALLBACK_MARKET_CAP["207940.KS"], volume:   18 },
  "005380.KS": { price:   286500, changePercent: +0.88, marketCap: FALLBACK_MARKET_CAP["005380.KS"], volume:  204 },
  "000270.KS": { price:   118700, changePercent: -0.33, marketCap: FALLBACK_MARKET_CAP["000270.KS"], volume:  318 },
  "012450.KS": { price:   548000, changePercent: +4.12, marketCap: FALLBACK_MARKET_CAP["012450.KS"], volume:   72 },
  "105560.KS": { price:    89200, changePercent: +0.79, marketCap: FALLBACK_MARKET_CAP["105560.KS"], volume:  162 },
  "005490.KS": { price:   412000, changePercent: -1.53, marketCap: FALLBACK_MARKET_CAP["005490.KS"], volume:   88 },
  "068270.KS": { price:   243000, changePercent: +2.78, marketCap: FALLBACK_MARKET_CAP["068270.KS"], volume:  147 },
  "012330.KS": { price:   354000, changePercent: +0.71, marketCap: FALLBACK_MARKET_CAP["012330.KS"], volume:   56 },
  "035420.KS": { price:   198500, changePercent: +1.52, marketCap: FALLBACK_MARKET_CAP["035420.KS"], volume:  119 },
  "055550.KS": { price:    54600, changePercent: +0.46, marketCap: FALLBACK_MARKET_CAP["055550.KS"], volume:  208 },
  "035720.KS": { price:    58900, changePercent: +3.16, marketCap: FALLBACK_MARKET_CAP["035720.KS"], volume:  437 },
  "259960.KS": { price:   312000, changePercent: +1.82, marketCap: FALLBACK_MARKET_CAP["259960.KS"], volume:   68 },
  "034020.KS": { price:    31850, changePercent: -0.62, marketCap: FALLBACK_MARKET_CAP["034020.KS"], volume:  612 },
  "006400.KS": { price:   312000, changePercent: -2.12, marketCap: FALLBACK_MARKET_CAP["006400.KS"], volume:   74 },
  "051910.KS": { price:   298000, changePercent: -1.18, marketCap: FALLBACK_MARKET_CAP["051910.KS"], volume:   83 },
  "066570.KS": { price:   124000, changePercent: -0.40, marketCap: FALLBACK_MARKET_CAP["066570.KS"], volume:  156 },
  "010130.KS": { price:  1458000, changePercent: +0.89, marketCap: FALLBACK_MARKET_CAP["010130.KS"], volume:   11 },
};

// v8 chart API — 지수 API와 동일한 방식 (Vercel에서 작동 검증됨)
async function fetchQuote(ticker: string): Promise<Omit<StockItem, "rank" | "name">> {
  const encoded = encodeURIComponent(ticker);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1d&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${ticker}`);

  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`No price for ${ticker}`);

  const price      = Number(meta.regularMarketPrice);
  const prevClose  = Number(meta.chartPreviousClose ?? meta.regularMarketPreviousClose ?? price);
  const changePercent = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;
  const volume     = Math.round(Number(meta.regularMarketVolume ?? 0) / 10_000);
  // marketCap은 v8 chart API에 없으므로 FALLBACK 값 사용
  const marketCap  = FALLBACK_MARKET_CAP[ticker] ?? 0;

  return { price, changePercent, marketCap, volume };
}

export async function GET() {
  const results = await Promise.allSettled(
    SYMBOLS.map(({ ticker }) => fetchQuote(ticker))
  );

  let anyLive = false;

  const items: StockItem[] = SYMBOLS.map(({ ticker, name }, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      anyLive = true;
      return { rank: 0, name, ...result.value };
    }
    return { rank: 0, name, ...FALLBACK[ticker] };
  });

  // 시가총액 내림차순 정렬 후 순위 부여
  items.sort((a, b) => b.marketCap - a.marketCap);
  items.forEach((item, i) => { item.rank = i + 1; });

  return Response.json({
    items,
    source: anyLive ? "live" : "mock",
    fetchedAt: new Date().toISOString(),
  });
}
