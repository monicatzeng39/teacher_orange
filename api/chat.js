export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message" });

  // ⚠️ 把 key 放在 Vercel 環境變數，不要寫在前端或 repo
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });

  // 這裡用 OpenAI Responses API（若你要 Chat Completions / 或 Gemini，我可以改）
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: message,
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return res.status(500).json({ error: "Upstream error", detail: t });
  }

  const data = await r.json();

  // 取回文字（保守寫法）
  const output =
    data.output_text ||
    (data.output?.[0]?.content?.map(c => c.text).join("") ?? JSON.stringify(data));

  res.status(200).json({ output });
}