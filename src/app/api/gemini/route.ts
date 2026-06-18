const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다. 프로젝트 루트에 .env.local 파일을 만들고 GEMINI_API_KEY=your_key 를 추가해 주세요." },
      { status: 500 }
    );
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }
      );

      if (res.status === 503) {
        lastError = `503 Service Unavailable (시도 ${attempt}/${MAX_RETRIES})`;
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return Response.json({ error: `Gemini API 오류: 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요.` }, { status: 503 });
      }

      if (!res.ok) {
        const errBody = await res.text();
        return Response.json({ error: `Gemini API 오류 (${res.status}): ${errBody}` }, { status: res.status });
      }

      const json = await res.json();
      const text =
        json.candidates?.[0]?.content?.parts?.[0]?.text ??
        "응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";

      return Response.json({ text });
    } catch (e) {
      lastError = `네트워크 오류 (시도 ${attempt}/${MAX_RETRIES})`;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
    }
  }

  return Response.json({ error: `네트워크 오류가 발생했습니다. (${lastError})` }, { status: 500 });
}
