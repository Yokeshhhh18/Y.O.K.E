// Y.O.K.E. app logic
const $ = (id) => document.getElementById(id);
const history = []; // {role: 'user'|'model', parts:[{text}]}

// ---------- setup ----------
document.querySelectorAll(".her").forEach(e => (e.textContent = CONFIG.HER_NAME));
$("lockPic").src = CONFIG.COUPLE_PIC;
$("avatar").src = CONFIG.YOUR_PIC;
$("couplePic").src = CONFIG.COUPLE_PIC;

$("songBox").innerHTML =
  `<p>🎵 A song I sang for you</p><a class="songlink" href="${CONFIG.SONG.url}" target="_blank" rel="noopener">${CONFIG.SONG.title}</a>`;
$("videos").innerHTML = CONFIG.VIDEOS
  .map(v => `<li>🎬 <a href="${v.url}" target="_blank" rel="noopener">${v.title}</a></li>`)
  .join("");

// ---------- lock / countdown ----------
const unlockAt = new Date(CONFIG.UNLOCK_AT).getTime();

function tick() {
  const diff = unlockAt - Date.now();
  if (diff <= 0) return unlock();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  $("countdown").textContent = `${d}d ${h}h ${m}m ${s}s`;
  setTimeout(tick, 1000);
}

function unlock() {
  $("lock").classList.add("hidden");
  $("app").classList.remove("hidden");
  addMsg(CONFIG.FIRST_MESSAGE, "bot");
}
tick();

// ---------- chat ----------
function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  $("chat").appendChild(div);
  $("chat").scrollTop = $("chat").scrollHeight;
  return div;
}

async function askGemini(userText) {
  history.push({ role: "user", parts: [{ text: userText }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: history,
      generationConfig: { temperature: 0.9, maxOutputTokens: 300 }
    })
  });
  if (!res.ok) throw new Error("API " + res.status);
  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, konjam network issue da 🥺 meendum sollu?";
  history.push({ role: "model", parts: [{ text: reply }] });
  return reply;
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  if (!text) return;
  $("input").value = "";
  addMsg(text, "me");

  if (/^surprise$/i.test(text)) {
    document.getElementById("surprise").scrollIntoView({ behavior: "smooth" });
  }

  const typing = addMsg("typing...", "bot");
  try {
    typing.textContent = await askGemini(text);
  } catch (err) {
    typing.textContent = "Aiyo, Y.O.K.E.-ku konjam problem 🥺 (check API key / internet)";
    console.error(err);
  }
  $("chat").scrollTop = $("chat").scrollHeight;
});
