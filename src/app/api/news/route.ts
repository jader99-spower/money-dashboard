type NewsItem = {
  title: string;
  link: string;
  press: string;
  pubDate: string;
  summary: string;
};

const MOCK_NEWS: NewsItem[] = [
  {
    title: "삼성전자, 2분기 영업이익 컨센서스 상회…AI 반도체 수요 폭증",
    press: "한국경제",
    pubDate: "2026-06-18T09:15:00+09:00",
    summary:
      "삼성전자가 2분기 영업이익 11조 원을 기록하며 시장 예상치를 20% 상회했다. HBM3E 공급 확대와 파운드리 수주 증가가 주요 요인으로 분석됐다.",
    link: "https://www.hankyung.com/finance",
  },
  {
    title: "SK하이닉스 HBM4 양산 본격화…엔비디아 공급 독점 계약 체결",
    press: "매일경제",
    pubDate: "2026-06-18T08:30:00+09:00",
    summary:
      "SK하이닉스가 차세대 고대역폭 메모리 HBM4 양산에 돌입, 엔비디아와 3년간 독점 공급 계약을 체결했다고 밝혔다. 목표주가 30만 원으로 일제히 상향됐다.",
    link: "https://www.mk.co.kr/news/stock",
  },
  {
    title: "현대차·기아, 글로벌 전기차 판매 급증…2분기 합산 최대 실적",
    press: "연합뉴스",
    pubDate: "2026-06-18T07:45:00+09:00",
    summary:
      "현대자동차그룹이 2분기 전기차 판매량 35만 대를 돌파하며 글로벌 3위 자리를 공고히 했다. 아이오닉9·EV9 인기가 실적을 견인했다.",
    link: "https://www.yna.co.kr/economy",
  },
  {
    title: "한화에어로스페이스, 방산 수출 기대감 최고조…목표주가 80만 원 상향",
    press: "조선비즈",
    pubDate: "2026-06-18T06:50:00+09:00",
    summary:
      "폴란드·사우디 K9 자주포 추가 수주 소식에 한화에어로스페이스 주가가 급등. 다수 증권사가 목표주가를 60만 원에서 80만 원으로 올렸다.",
    link: "https://biz.chosun.com/stock",
  },
  {
    title: "LG에너지솔루션, 美 배터리 공장 완공…테슬라 공급 본격 확대",
    press: "서울경제",
    pubDate: "2026-06-17T18:00:00+09:00",
    summary:
      "LG에너지솔루션이 미시간주 배터리 공장을 완공, 테슬라 모델 S·X 전용 4680 셀 공급을 3분기부터 시작한다고 발표했다.",
    link: "https://www.sedaily.com/Finance",
  },
];

function extractTag(item: string, tag: string): string {
  const m = item.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
  );
  return m?.[1]?.trim() ?? "";
}

function parseRSS(xml: string, press: string): NewsItem[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  return items.slice(0, 5).map((item) => ({
    title: extractTag(item, "title"),
    link: extractTag(item, "link"),
    press,
    pubDate: extractTag(item, "pubDate"),
    summary: extractTag(item, "description")
      .replace(/<[^>]+>/g, "")
      .slice(0, 120),
  }));
}

export async function GET() {
  try {
    const res = await fetch("https://www.mk.co.kr/rss/40300001/", {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; money-dashboard/1.0)" },
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();
    const items = parseRSS(xml, "매일경제");

    if (items.length === 0 || !items[0].title) throw new Error("Empty RSS");

    return Response.json({ items, source: "live" });
  } catch {
    return Response.json({ items: MOCK_NEWS, source: "mock" });
  }
}
