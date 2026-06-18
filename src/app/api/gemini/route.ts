export async function POST(request: Request) {
  const { prompt } = await request.json();

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다. 프로젝트 루트에 .env.local 파일을 만들고 GEMINI_API_KEY=your_key 를 추가해 주세요." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

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
    return Response.json({ error: "네트워크 오류가 발생했습니다." }, { status: 500 });
  }
}
