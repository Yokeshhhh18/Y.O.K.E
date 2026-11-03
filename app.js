// Y.O.K.E. app logic
// The Gemini key is NOT here. It lives in Vercel (see /api/chat.js and README).
const $ = (id) => document.getElementById(id);
const history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = CONFIG.HER_NAME;
const you = CONFIG.YOUR_NAME;
const API_URL = CONFIG.API_URL || "/api/chat";

// Optional extras: add these to config.js to override the defaults
const CHIPS = CONFIG.CHIPS || ["Surprise 🎁", "Enna pannura? 😏", "Joke sollu 😂", "I miss you 🥺", "Wanna see you 😍"];
const SEE_CHIP = CONFIG.SEE_CHIP || "Wanna see you 😍";
// Your own recorded clips (put files in /audio). Leave a key out to skip it.
const CLIPS = Object.assign({ wish: "", tutorial: "", miss: "", see: "" }, CONFIG.CLIPS || {});
const CHIP_CLIPS = Object.assign({ "I miss you 🥺": "miss" }, CONFIG.CHIP_CLIPS || {});
const SEE_YOU = CONFIG.SEE_YOU || { type: "image", src: CONFIG.YOUR_PIC, caption: "Inga dhan iruken 😍" };
const TTS_URL = CONFIG.TTS_URL || "/api/tts";
const TUTORIAL = CONFIG.TUTORIAL || [
  "First, simple ah sollanum na: pesu da, Y.O.K.E. kitta ethuvum pesalam 💬",
  "Keezha irukura buttons tap pannina, naan unakkaga ready ah irukken 💗",
  "Mela irukura 🎙 tap pannina, nera pesalam. Tamil, English, rendu-m okay 🥰",
  "Kadaisila oru gift irukku... athayum open pannu 🎁"
];
const GALLERY = CONFIG.GALLERY || [
  { src: CONFIG.COUPLE_PIC, caption: "Us 💛" },
  { src: CONFIG.HER_PIC, caption: "You ✨" },
  { src: CONFIG.YOUR_PIC, caption: "Me 😎" }
];
const LETTER = CONFIG.LETTER ||
  `${her},\n\nHappy Birthday, my heart. I made this little world just for you, with my voice, my silly jokes and everything I feel for you.\n\nWherever life takes us, you're my kind of everything.\n\nAlways yours,\n${you}`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = src;
}

// ---------- setup ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
$("youName").textContent = you;
safeImg($("lockPic"), CONFIG.COUPLE_PIC);
safeImg($("avatar"), CONFIG.YOUR_PIC);

// ---------- floating hearts ----------
const HEARTS = ["💗", "💖", "💛", "🌸", "✨", "💕"];
function spawnHeart(burst) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 22 + "px";
  h.style.animationDuration = (burst ? 3 + Math.random() * 2 : 8 + Math.random() * 8) + "s";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 17000);
}
function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 60);
}

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
  if (unlocked) return;
  unlocked = true;
  $("lock").classList.add("hidden");
  $("app").classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro").classList.remove("hidden");
}

// ---------- audio (one shared element so mobile browsers keep allowing it) ----------
const player = new Audio();
let sessionStarted = false;
function unlockAudio() {
  // call from a tap: plays a silent clip so later async audio is allowed
  player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  player.play().catch(() => {});
}
function stopAudio() { player.pause(); }
function playSrc(src) {
  return new Promise((resolve) => {
    player.pause();
    player.onended = player.onerror = () => resolve();
    player.src = src;
    player.play().catch(() => resolve());
  });
}
const playClip = (key) => (CLIPS[key] ? playSrc(CLIPS[key]) : Promise.resolve());

async function speakText(text) {
  const r = await fetch(TTS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  if (!r.ok) throw new Error("TTS " + r.status);
  const { audio, mime } = await r.json();
  return playSrc(`data:${mime || "audio/wav"};base64,${audio}`);
}

// ---------- intro ----------
safeImg($("introPic"), CONFIG.INTRO_PIC || CONFIG.YOUR_PIC);
function introHearts() {
  return setInterval(() => {
    const h = document.createElement("span");
    h.className = "ihrt";
    h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 16 + Math.random() * 18 + "px";
    h.style.setProperty("--dx", Math.random() * 80 - 40 + "px");
    h.style.animationDuration = 4 + Math.random() * 3 + "s";
    $("intro").appendChild(h);
    setTimeout(() => h.remove(), 7500);
  }, 260);
}
let introTimer = null, introDone = false;
function startIntro() {
  unlockAudio();
  $("intro").classList.add("go");
  introTimer = introHearts();
  playClip("wish");
  const text = `Happy Birthday, ${her} 💗`;
  let i = 0;
  (function type() {
    if (introDone) return;
    $("wish").textContent = text.slice(0, i++);
    if (i <= text.length) setTimeout(type, 90);
    else setTimeout(endIntro, 2400);
  })();
}
function endIntro() {
  if (introDone) return;
  introDone = true;
  clearInterval(introTimer);
  $("intro").classList.add("out");
  setTimeout(() => $("intro").remove(), 1000);
  beginChat();
}
$("openBtn").addEventListener("click", startIntro);
$("skip").addEventListener("click", endIntro);

async function beginChat() {
  addMsg(CONFIG.FIRST_MESSAGE, "bot");
  burstHearts(24);
  setInterval(() => spawnHeart(false), 900);
  // short tutorial, once per device
  if (localStorage.getItem("yoke_toured")) return;
  localStorage.setItem("yoke_toured", "1");
  for (const line of TUTORIAL) {
    await new Promise((r) => setTimeout(r, 2400));
    addMsg(line, "bot");
  }
  playClip("tutorial");
}

// ---------- chips ----------
$("chips").innerHTML = CHIPS.map((c) => `<button type="button" class="chip">${esc(c)}</button>`).join("");
$("chips").addEventListener("click", (e) => {
  if (e.target.classList.contains("chip")) send(e.target.textContent);
});

// ---------- gift ----------
function renderGift() {
  if (giftRendered) return;
  giftRendered = true;

  const tilts = ["-4deg", "3deg", "-2deg", "4deg", "-3deg", "2deg"];
  const pics = GALLERY.map(
    (g, i) => `<figure class="polaroid" style="--r:${tilts[i % tilts.length]};margin:0">
        <img src="${esc(g.src)}" alt="" onerror="this.closest('figure').remove()">
        <p>${esc(g.caption || "")}</p></figure>`
  ).join("");

  const vids = (CONFIG.VIDEOS || [])
    .map((v) => `<a class="card" href="${esc(v.url)}" target="_blank" rel="noopener">
        <span class="icon">🎬</span><span>${esc(v.title)}<small>Tap to watch</small></span></a>`)
    .join("");

  $("giftContent").innerHTML = `
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    <div><h3 class="section-title">Us 💞</h3><div class="gallery">${pics}</div></div>
    <div><h3 class="section-title">A song I sang for you</h3>
      <a class="card songcard" href="${esc(CONFIG.SONG.url)}" target="_blank" rel="noopener">
        <span class="icon">💿</span><span>${esc(CONFIG.SONG.title)}<small>Tap to listen 🎧</small></span></a></div>
    <div><h3 class="section-title">Videos I made for you</h3><div class="list">${vids}</div></div>`;
}

function openGift() {
  renderGift();
  $("giftBtn").classList.add("hidden");
  $("giftContent").classList.remove("hidden");
  burstHearts(30);
  setTimeout(() => $("gift").scrollIntoView({ behavior: "smooth" }), 150);
}
$("giftBtn").addEventListener("click", openGift);

// ---------- chat ----------
function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  $("chat").appendChild(div);
  $("chat").scrollTop = $("chat").scrollHeight;
  return div;
}

function addTyping() {
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  $("chat").appendChild(div);
  $("chat").scrollTop = $("chat").scrollHeight;
  return div;
}

async function askGemini(userText, byVoice) {
  history.push({ role: "user", parts: [{ text: userText }] });
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: buildSystemPrompt() + (byVoice ? "\n\nShe is talking to you by voice. Reply in 1-2 short, warm spoken sentences. No emojis." : ""),
        history
      })
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const reply = data.reply || "Hmm, konjam network issue da 🥺 meendum sollu?";
    history.push({ role: "model", parts: [{ text: reply }] });
    return reply;
  } catch (err) {
    history.pop(); // don't keep a user turn with no answer
    throw err;
  }
}

let busy = false;
async function send(text) {
  if (busy || !text) return;
  busy = true;
  addMsg(text, "me");
  if (/surprise|gift/i.test(text)) openGift();
  if (text === SEE_CHIP) { showSeeYou(); busy = false; return; }
  if (CHIP_CLIPS[text]) playClip(CHIP_CLIPS[text]);

  const typing = addTyping();
  try {
    const reply = await askGemini(text);
    typing.className = "msg bot";
    typing.textContent = reply;
  } catch (err) {
    typing.className = "msg bot";
    typing.textContent = "Aiyo, Y.O.K.E.-ku konjam problem 🥺 Konjam neram kazhichi try pannu!";
    console.error(err);
  }
  $("chat").scrollTop = $("chat").scrollHeight;
  busy = false;
}

function showSeeYou() {
  const d = addMsg(SEE_YOU.caption || "", "bot");
  if (SEE_YOU.type === "image" || SEE_YOU.type === "video") {
    const m = document.createElement(SEE_YOU.type === "video" ? "video" : "img");
    m.src = SEE_YOU.src;
    if (SEE_YOU.type === "video") { m.controls = true; m.playsInline = true; }
    m.addEventListener("load", () => ($("chat").scrollTop = $("chat").scrollHeight));
    d.appendChild(m);
  }
  playClip("see");
  burstHearts(12);
}

// ---------- voice mode ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let vLang = "en-IN", rec = null, vBusy = false;
const setOrb = (cls, label) => { $("orb").className = cls; $("vstate").textContent = label; };
const idleLabel = () => (SR ? "Tap the orb to talk" : "Listening needs Chrome on Android");

$("micBtn").addEventListener("click", () => { unlockAudio(); $("voice").classList.add("on"); setOrb("", idleLabel()); });
$("vclose").addEventListener("click", () => { stopAudio(); if (rec) rec.abort(); vBusy = false; $("voice").classList.remove("on"); });
$("langBtn").addEventListener("click", (e) => {
  vLang = vLang === "en-IN" ? "ta-IN" : "en-IN";
  e.target.textContent = vLang === "en-IN" ? "English" : "தமிழ்";
});
$("orb").addEventListener("click", () => {
  if (!SR || vBusy) return;
  unlockAudio();
  let heard = "";
  rec = new SR();
  rec.lang = vLang;
  rec.interimResults = true;
  rec.onstart = () => setOrb("listening", "Listening…");
  rec.onresult = (e) => { heard = [...e.results].map((r) => r[0].transcript).join(" "); $("vtext").textContent = heard; };
  rec.onerror = () => { vBusy = false; setOrb("", idleLabel()); };
  rec.onend = async () => {
    if (!heard) return setOrb("", idleLabel());
    vBusy = true;
    setOrb("thinking", "Thinking…");
    addMsg(heard, "me");
    try {
      const reply = await askGemini(heard, true);
      addMsg(reply, "bot");
      $("vtext").textContent = reply;
      setOrb("speaking", "Speaking…");
      await speakText(reply);
    } catch (err) {
      console.error(err);
      $("vtext").textContent = "Konjam problem da 🥺 meendum try pannu";
    }
    vBusy = false;
    setOrb("", idleLabel());
  };
  rec.start();
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  $("input").value = "";
  send(text);
});

tick();
