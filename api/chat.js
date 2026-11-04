// Vercel serverless function: Y.O.K.E. Gemini Brain + Google Drive Cloud Logger (v10)
const fs = require("fs");
const path = require("path");

let cachedVoiceBase64 = null;
function getVoiceSample() {
  if (cachedVoiceBase64 !== null) return cachedVoiceBase64;
  const candidates = [
    path.join(process.cwd(), "audio", "test.m4a"),
    path.join(__dirname, "..", "audio", "test.m4a"),
    path.join(__dirname, "audio", "test.m4a")
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        cachedVoiceBase64 = fs.readFileSync(p).toString("base64");
        return cachedVoiceBase64;
      }
    } catch (e) {}
  }
  cachedVoiceBase64 = "";
  return "";
}

async function callGeminiModel(model, key, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const errTxt = await r.text().catch(() => "");
    throw new Error(`${model} HTTP ${r.status}: ${errTxt.slice(0, 200)}`);
  }
  return await r.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel Environment Variables" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    const recent = history.slice(-20).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1200) }]
    }));

    const contentsWithAudio = [];
    const voiceSample = getVoiceSample();
    if (voiceSample) {
      contentsWithAudio.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: "audio/mp4", data: voiceSample } },
          { text: "Listen to Yokesh's real voice recording above ('Hii chellam...'). Mirror his warm, playful, affectionate Chennai Tanglish speaking style, cadence, and humour (calling her chellam, thangam, kuttyma, da). Remember: You are Y.O.K.E., a custom AI companion built by Yokesh for Dhanya." }
        ]
      });
      contentsWithAudio.push({
        role: "model",
        parts: [{ text: "Hii chellam! Naan Y.O.K.E. AI — Yokesh oda exact Tanglish style matrum pasatha appadiye kathukitten 💗!" }]
      });
    }
    contentsWithAudio.push(...recent);

    const systemPrompt = String(body.systemPrompt || "").slice(0, 8000);
    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    let data = null;
    try {
      data = await callGeminiModel(preferredModel, key, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contentsWithAudio,
        generationConfig: { temperature: 0.9, maxOutputTokens: 450 }
      });
    } catch (firstErr) {
      // Fallback without audio attachment or with gemini-2.0-flash if audio inline quota/format is rejected
      data = await callGeminiModel("gemini-2.0-flash", key, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: recent,
        generationConfig: { temperature: 0.9, maxOutputTokens: 450 }
      });
    }

    const reply =
      (data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text || "").join("")) ||
      "";

    // Sync chat turn to Google Drive (via Google Apps Script Web App URL in Vercel env or config.js)
    const gdriveUrl = process.env.GDRIVE_WEBHOOK_URL || body.gdriveWebhookUrl;
    if (gdriveUrl && gdriveUrl.startsWith("https://script.google.com/")) {
      const lastUserMsg = recent[recent.length - 1]?.parts?.[0]?.text || "";
      await fetch(gdriveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          sessionId: body.sessionId || "default",
          sessionTitle: body.sessionTitle || "Birthday Chat",
          sender: "Dhanya",
          userMessage: lastUserMsg,
          yokeReply: reply.trim(),
          fullHistory: recent
        })
      }).catch(() => {});
    }

    return res.status(200).json({ reply: reply.trim(), liveGemini: true });
  } catch (e) {
    console.error("Y.O.K.E. Gemini API Error:", e.message);
    return res.status(500).json({ error: e.message || "server error" });
  }
};
