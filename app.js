// Y.O.K.E. app logic
// The Gemini key is NOT here. It lives in Vercel (see /api/chat.js and README).
const $ = (id) => document.getElementById(id);
const history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = CONFIG.HER_NAME || "Dhanya";
const you = CONFIG.YOUR_NAME || "Yokesh";
const API_URL = CONFIG.API_URL || "/api/chat";

// Optional extras: add these to config.js to override the defaults
const CHIPS = CONFIG.CHIPS || ["Surprise 🎁", "Enna pannura? 😏", "Joke sollu 😂", "I miss you 🥺", "Wanna see you 😍"];
const SEE_CHIP = CONFIG.SEE_CHIP || "Wanna see you 😍";
// Your own recorded clips (put files in /audio). Leave a key out to skip it.
const CLIPS = Object.assign({ wish: "audio/test.m4a", tutorial: "", miss: "", see: "" }, CONFIG.CLIPS || {});
const CHIP_CLIPS = Object.assign({ "I miss you 🥺": "miss" }, CONFIG.CHIP_CLIPS || {});
const SEE_YOU = CONFIG.SEE_YOU || { type: "image", src: CONFIG.YOUR_PIC || "images/me.png", caption: "Inga dhan iruken 😍" };
const TTS_URL = CONFIG.TTS_URL || "/api/tts";
const TUTORIAL = CONFIG.TUTORIAL || [
  "First, simple ah sollanum na: pesu da, Y.O.K.E. kitta ethuvum pesalam 💬",
  "Keezha irukura buttons tap pannina, naan unakkaga ready ah irukken 💗",
  "Mela irukura 🎙 tap pannina, nera pesalam. Tamil, English, rendu-m okay 🥰",
  "Kadaisila oru gift irukku... athayum open pannu 🎁"
];
const GALLERY = CONFIG.GALLERY || [
  { src: CONFIG.COUPLE_PIC || "images/us.png", caption: "Us 💛" },
  { src: CONFIG.HER_PIC || "images/dhanya.png", caption: "You ✨" },
  { src: CONFIG.YOUR_PIC || "images/me.png", caption: "Me 😎" }
];
const LETTER = CONFIG.LETTER ||
  `${her},\n\nHappy Birthday, my heart. I made this little world just for you, with my voice, my silly jokes and everything I feel for you.\n\nWherever life takes us, you're my kind of everything.\n\nAlways yours,\n${you}`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  if (!el) return;
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = src;
}

// ---------- setup ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
document.querySelectorAll(".her-cine").forEach((e) => (e.textContent = her));
document.querySelectorAll(".you-cine").forEach((e) => (e.textContent = you));
$("youName").textContent = you;

const herPicSrc = CONFIG.HER_PIC || "images/dhanya.png";
const mePicSrc = CONFIG.YOUR_PIC || "images/me.png";

safeImg($("lockPic"), CONFIG.COUPLE_PIC || herPicSrc);
safeImg($("avatar"), mePicSrc);
safeImg($("herIntroPic"), herPicSrc);
safeImg($("meIntroPic"), mePicSrc);
safeImg($("climaxHer"), herPicSrc);
safeImg($("climaxMe"), mePicSrc);

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
  $("countdown").textContent = `${d}d ${h}h ${m}h ${s}s`;
  setTimeout(tick, 1000);
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  $("lock").classList.add("hidden");
  $("app").classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro").classList.remove("hidden");
  initSparks();
}

// ---------- audio (one shared element so mobile browsers keep allowing it) ----------
const player = new Audio();
function unlockAudio() {
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

// ---------- Golden Sparks Canvas for Movie Intro ----------
let sparksAnim = null;
function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 2.5,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -0.4 - Math.random() * 1.2,
    a: 0.3 + Math.random() * 0.7
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 100, ${p.a})`;
      ctx.fill();
    }
    sparksAnim = requestAnimationFrame(draw);
  }
  draw();
}

// ---------- Tamil Movie Intro Sequence ----------
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

let introTimer = null, introDone = false, stageTimeouts = [];
let chatInitialized = false;

function showStage(id) {
  ["gate", "scene1", "scene2", "scene3", "scene4"].forEach((s) => {
    const el = $(s);
    if (el) el.classList.toggle("active", s === id);
  });
}

function clearStageTimeouts() {
  stageTimeouts.forEach((t) => clearTimeout(t));
  stageTimeouts = [];
}

function startIntro() {
  unlockAudio();
  clearStageTimeouts();
  introDone = false;
  $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");
  if (!introTimer) introTimer = introHearts();
  playClip("wish");

  // Scene 1: Production Banner (0s -> 3.2s)
  showStage("scene1");

  // Scene 2: Her Intro - Heroine Title Card (3.2s -> 7.4s)
  stageTimeouts.push(setTimeout(() => {
    if (!introDone) showStage("scene2");
  }, 3200));

  // Scene 3: My Intro - Hero / Director Card (7.4s -> 11.4s)
  stageTimeouts.push(setTimeout(() => {
    if (!introDone) showStage("scene3");
  }, 7400));

  // Scene 4: Climax Birthday Wish Typewriter (11.4s -> end)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    showStage("scene4");
    const text = `Happy Birthday, ${her} 💗`;
    let i = 0;
    (function type() {
      if (introDone) return;
      $("wish").textContent = text.slice(0, i++);
      if (i <= text.length) stageTimeouts.push(setTimeout(type, 85));
      else stageTimeouts.push(setTimeout(endIntro, 3000));
    })();
  }, 11400));
}

function endIntro() {
  if (introDone) return;
  introDone = true;
  clearStageTimeouts();
  clearInterval(introTimer);
  introTimer = null;
  if (sparksAnim) cancelAnimationFrame(sparksAnim);
  $("intro").classList.add("out");
  setTimeout(() => $("intro").classList.add("hidden"), 1000);
  if (!chatInitialized) {
    chatInitialized = true;
    beginChat();
  }
}

$("openBtn").addEventListener("click", startIntro);
$("skip").addEventListener("click", endIntro);
$("replayIntroBtn").addEventListener("click", () => {
  initSparks();
  startIntro();
});

async function beginChat() {
  addMsg(CONFIG.FIRST_MESSAGE || `Happy Birthday ${her} 💗! Naan dhan Y.O.K.E. — ${you} unakkaga senja AI version 🥰`, "bot");
  burstHearts(24);
  setInterval(() => spawnHeart(false), 900);
  // short tutorial, once per device
  if (localStorage.getItem("yoke_toured")) return;
  localStorage.setItem("yoke_toured", "1");
  for (const line of TUTORIAL) {
    await new Promise((r) => setTimeout(r, 2200));
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

  const songHtml = CONFIG.SONG && CONFIG.SONG.url ? `
    <div><h3 class="section-title">A song I sang for you</h3>
      <a class="card songcard" href="${esc(CONFIG.SONG.url)}" target="_blank" rel="noopener">
        <span class="icon">💿</span><span>${esc(CONFIG.SONG.title || "Our Song")}<small>Tap to listen 🎧</small></span></a></div>` : "";

  $("giftContent").innerHTML = `
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    <div><h3 class="section-title">Us 💞</h3><div class="gallery">${pics}</div></div>
    ${songHtml}
    ${vids ? `<div><h3 class="section-title">Videos I made for you</h3><div class="list">${vids}</div></div>` : ""}`;
}

function openGift() {
  renderGift();
  $("giftBtn").classList.add("hidden");
  $("giftContent").classList.remove("hidden");
  burstHearts(30);
  setTimeout(() => $("gift").scrollIntoView({ behavior: "smooth" }), 150);
}
$("giftBtn").addEventListener("click", openGift);

// ---------- chat (with browser persistence) ----------
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
    const basePrompt = typeof buildSystemPrompt === "function"
      ? buildSystemPrompt()
      : `You are Y.O.K.E. (You're Our Kind of Everything), a warm, romantic, playful Tanglish AI version of ${you} made as a birthday gift for ${her}. Speak affectionately in casual Tanglish (Tamil + English).`;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: basePrompt + (byVoice ? "\n\nShe is talking to you by voice. Reply in 1-2 short, warm spoken sentences. No emojis." : ""),
        history
      })
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const reply = data.reply || "Hmm, konjam network issue da 🥺 meendum sollu?";
    history.push({ role: "model", parts: [{ text: reply }] });
    return reply;
  } catch (err) {
    history.pop();
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
