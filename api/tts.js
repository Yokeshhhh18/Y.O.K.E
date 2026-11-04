// Vercel serverless function: Y.O.K.E. Voice Engine
// 1. If ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are set in Vercel, uses your 100% cloned voice!
// 2. Otherwise uses the neural male voice ("Puck" / "Charon") styled after your audio sample.

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

  try {
    const rawText = String((req.body && req.body.text) || "").trim().slice(0, 600);
    const text = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
    if (!text) return res.status(400).json({ error: "text is empty" });

    // OPTION A: True Cloned Voice via ElevenLabs (if configured in Vercel)
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const elevenVoice = process.env.ELEVENLABS_VOICE_ID;
    if (elevenKey && elevenVoice) {
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}`, {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true }
        })
      });
      if (elRes.ok) {
        const arrBuf = await elRes.arrayBuffer();
        return res.status(200).json({
          audio: Buffer.from(arrBuf).toString("base64"),
          mime: "audio/mpeg"
        });
      }
    }

    // OPTION B: Y.O.K.E. Neural Male Voice Engine (using GEMINI_API_KEY under the hood, completely hidden from user)
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Voice key not configured" });

    const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
    const voice = process.env.GEMINI_TTS_VOICE || "Puck";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Speak in a warm, natural, intimate South Indian Tanglish (Tamil + English) male voice, sounding just like Yokesh lovingly talking to his girlfriend Dhanya: " + text
          }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      })
    });
    if (!r.ok) {
      return res.status(502).json({ error: "Y.O.K.E. Voice error " + r.status });
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
