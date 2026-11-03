// Vercel serverless function: Gemini text-to-speech. Same GEMINI_API_KEY as chat.js.
// Uses a warm male voice ("Puck") styled after Yokesh's affectionate Tanglish delivery.

function pcmToWav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel" });

  try {
    const rawText = String((req.body && req.body.text) || "").trim().slice(0, 600);
    // Strip emojis so TTS doesn't read emoji names out loud
    const text = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    if (!text) return res.status(400).json({ error: "text is empty" });

    const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
    const voice = process.env.GEMINI_TTS_VOICE || "Puck"; // Male, warm conversational voice
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Speak in a soft, natural, intimate South Indian Tanglish (Tamil + English) male voice, like Yokesh lovingly talking to his girlfriend Dhanya: " + text
          }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      })
    });
    if (!r.ok) {
      console.error("Gemini TTS error", r.status, await r.text());
      return res.status(502).json({ error: "Gemini TTS error " + r.status });
    }
    const data = await r.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) return res.status(502).json({ error: "no audio returned" });

    const wav = pcmToWav(Buffer.from(part.inlineData.data, "base64"));
    return res.status(200).json({ audio: wav.toString("base64"), mime: "audio/wav" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
};
