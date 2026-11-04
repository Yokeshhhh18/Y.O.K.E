// Vercel Serverless Function: Y.O.K.E. Real Gemini AI Brain + Google Drive Logger
// Uses audio/test.m4a to clone Yokesh's Chennai Tanglish speaking style & personality!
const fs = require("fs");
const path = require("path");

let cachedVoiceBase64 = null;
function getVoiceSample() {
  if (cachedVoiceBase64 !== null) return cachedVoiceBase64;
  const candidates = [
    path.join(process.cwd(), "audio", "test.m4a"),
    path.join(__dirname, "..", "audio", "test.m4a")
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

async function callGeminiModel(key, model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

module.exports = async function handler(req, res) {
  // Allow CORS for local testing & Vercel preview URLs
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  // Support key from Vercel Environment Variable OR optional config.js fallback
  const key = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    body.apiKey ||
    ""
  ).trim();

  if (!key) {
    return res.status(500).json({
      error: "MISSING_API_KEY",
      message: "GEMINI_API_KEY is not set in Vercel Environment Variables (or config.js)."
    });
  }

  try {
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    const recent = history.slice(-20).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1500) }]
    }));

    const systemPrompt = String(body.systemPrompt || "").slice(0, 8000);
    const voiceSample = getVoiceSample();

    // Build payload with voice sample training
    const contentsWithVoice = [];
    if (voiceSample) {
      contentsWithVoice.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: "audio/mp4", data: voiceSample } },
          {
            text: "Listen to Yokesh's real voice recording above ('Hii chellam...'). Adopt his exact warm, playful, romantic Chennai Tanglish / Tamil speaking style, tone, and rhythm (using pet names like chellam, thangam, kuttyma, da, ma). Answer every question naturally, intelligently, and conversationally just like Gemini, while staying in character as Y.O.K.E. AI created by Yokesh for Dhanya."
          }
        ]
      });
      contentsWithVoice.push({
        role: "model",
        parts: [
          {
            text: "Hii chellam! Naan Yokesh oda exact voice tone matrum Chennai Tanglish style-ah appadiye kathukitten. Ippo nee enna ketalum semma natural-ah, real conversation maadhiriye pesuven! 💗"
          }
        ]
      });
    }
    contentsWithVoice.push(...recent);

    const modelsToTry = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ].filter(Boolean);

    let lastError = null;
    let reply = "";

    // Try with multimodal voice sample first; if any model rejects audio/mp4, automatically retry text-only!
    for (const model of modelsToTry) {
      const attempt1 = await callGeminiModel(key, model, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contentsWithVoice,
        generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
      });

      if (attempt1.ok) {
        reply = (attempt1.data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
        if (reply) break;
      } else {
        lastError = attempt1.data?.error?.message || `HTTP ${attempt1.status}`;
        // Retry without inline audio in case the specific model/tier rejected m4a inlineData
        if (voiceSample) {
          const attempt2 = await callGeminiModel(key, model, {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: recent,
            generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
          });
          if (attempt2.ok) {
            reply = (attempt2.data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
            if (reply) break;
          } else {
            lastError = attempt2.data?.error?.message || lastError;
          }
        }
      }
    }

    if (!reply) {
      return res.status(502).json({
        error: "GEMINI_API_ERROR",
        message: lastError || "Gemini API returned an empty response. Check your GEMINI_API_KEY."
      });
    }

    // Optional: Sync chat turn to Google Drive
    const gdriveUrl = process.env.GDRIVE_WEBHOOK_URL || body.gdriveWebhookUrl;
    if (gdriveUrl && gdriveUrl.startsWith("https://script.google.com/")) {
      const lastUserMsg = recent[recent.length - 1]?.parts?.[0]?.text || "";
      fetch(gdriveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          sender: "Dhanya",
          userMessage: lastUserMsg,
          yokeReply: reply,
          fullHistory: recent
        })
      }).catch(() => {});
    }

    return res.status(200).json({ reply });
  } catch (e) {
    console.error("chat.js error:", e);
    return res.status(500).json({ error: "SERVER_ERROR", message: e.message });
  }
};
