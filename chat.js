// Vercel serverless function: keeps the Gemini API key OFF GitHub.
// Set GEMINI_API_KEY in Vercel -> Project -> Settings -> Environment Variables.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel" });
  }

  try {
    const body = req.body || {};
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    // keep requests small so nobody can abuse the endpoint
    const contents = history.slice(-20).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1000) }]
    }));
    const systemPrompt = String(body.systemPrompt || "").slice(0, 8000);

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 400,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("Gemini error", r.status, t);
      return res.status(502).json({ error: "Gemini error " + r.status });
    }

    const data = await r.json();
    const reply =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text || "").join("")) ||
      "";

    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
};
