// Vercel serverless function: Y.O.K.E. Brain + Google Drive Cloud Logger
// Uses audio/test.m4a as a multimodal voice & style training reference for Yokesh!
const fs = require("fs");
const path = require("path");

let cachedVoiceBase64 = null;
function getVoiceSample() {
  if (cachedVoiceBase64 !== null) return cachedVoiceBase64;
  try {
    const p = path.join(process.cwd(), "audio", "test.m4a");
    if (fs.existsSync(p)) {
      cachedVoiceBase64 = fs.readFileSync(p).toString("base64");
      return cachedVoiceBase64;
    }
  } catch (e) {
    console.warn("Could not read voice sample:", e.message);
  }
  cachedVoiceBase64 = "";
  return "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Y.O.K.E. engine key is not set in Vercel" });
  }

  try {
    const body = req.body || {};
    const history = Array.isArray(body.history) ? body.history : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "history is empty" });
    }

    const contents = [];
    const voiceSample = getVoiceSample();
    if (voiceSample) {
      contents.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: "audio/mp4", data: voiceSample } },
          { text: "Listen to my real voice recording above ('Hii chellam...'). Train yourself on my exact casual, warm, affectionate Chennai Tanglish speaking style, cadence, and personality (calling her chellam, thangam, kuttyma, da). NEVER mention any external AI company or model name—you are 100% Y.O.K.E., built by Yokesh for Dhanya." }
        ]
      });
      contents.push({
        role: "model",
        parts: [{ text: "Hii chellam! Naan Yokesh oda exact voice style matrum pesura vidhatha appadiye kathukitten. Naan eppovume Y.O.K.E. dhan!" }]
      });
    }

    const recent = history.slice(-20).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String((m.parts && m.parts[0] && m.parts[0].text) || "").slice(0, 1000) }]
    }));
    contents.push(...recent);

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
      return res.status(502).json({ error: "Y.O.K.E. network busy" });
    }

    const data = await r.json();
    const reply =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text || "").join("")) ||
      "";

    // Optional: Sync chat turn to Google Drive (via Google Apps Script Web App URL) if set in Vercel or body
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
          yokeReply: reply.trim(),
          fullHistory: recent
        })
      }).catch(() => {});
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
};
