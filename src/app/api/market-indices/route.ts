export const dynamic = "force-dynamic";

type IndexItem = {
  name: string;
  region: string;
  point: number;
  change: number;
  changePercent: number;
};

const SYMBOLS: Array<{ symbol: string; name: string; region: string }> = [
  { symbol: "^KS11",     name: "KOSPI",    region: "국내" },
  { symbol: "069500.KS", name: "KODEX 200", region: "국내 ETF" },
  { symbol: "^IXIC",     name: "NASDAQ",   region: "미국" },
  { symbol: "^DJI",      name: "다우지수",  region: "미국" },
];

const FALLBACK: Record<string, { point: number; change: number; changePercent: number }> = {
  "^KS11":     { point: 2768.31,  change: +14.52,  changePercent: +0.53 },
  "069500.KS": { point: 372.45,   change: -1.85,   changePercent: -0.49 },
  "^IXIC":     { point: 19864.98, change: +124.56, changePercent: +0.63 },
  "^DJI":      { point: 43821.37, change: -213.44, changePercent: -0.49 },
};

async function fetchQuote(symbol: string) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1d&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    // Next.js 서버 캐시: 60초마다 갱신
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status} for ${symbol}`);

  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`No price in response for ${symbol}`);

  const point = Number(meta.regularMarketPrice);
  const prevClose =
    Number(meta.chartPreviousClose ?? meta.regularMarketPreviousClose ?? point);
  const change = point - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return { point, change, changePercent };
}

export async function GET() {
  const results = await Promise.allSettled(
    SYMBOLS.map(({ symbol }) => fetchQuote(symbol))
  );

  let anyLive = false;

  const items: IndexItem[] = SYMBOLS.map(({ symbol, name, region }, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      anyLive = true;
      return { name, region, ...result.value };
    }
    // 개별 심볼 실패 시 해당 심볼만 모크로 폴백
    return { name, region, ...FALLBACK[symbol] };
  });

  return Response.json({
    items,
    source: anyLive ? "live" : "mock",
    fetchedAt: new Date().toISOString(),
  });
}
