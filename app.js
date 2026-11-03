// Y.O.K.E. v4 — Jana Nayagan Full-Screen Intro + Gemini Romantic UI + Built-in Synth BGMs + Yokesh Voice-Trained Persona
const $ = (id) => document.getElementById(id);
const history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";
const API_URL = (typeof CONFIG !== "undefined" && CONFIG.API_URL) || "/api/chat";
const TTS_URL = (typeof CONFIG !== "undefined" && CONFIG.TTS_URL) || "/api/tts";

const herPicSrc = (typeof CONFIG !== "undefined" && CONFIG.HER_PIC) || "images/dhanya.png";
const mePicSrc = (typeof CONFIG !== "undefined" && CONFIG.YOUR_PIC) || "images/me.png";
const couplePicSrc = (typeof CONFIG !== "undefined" && CONFIG.COUPLE_PIC) || "images/us.png";

// Quick suggestion cards (Gemini dashboard style) + bottom pills
const GEM_CARDS = [
  { icon: "🥺", title: "I miss you chellam", sub: "Hear how much I miss you right now", prompt: "I miss you 🥺" },
  { icon: "😍", title: "Wanna see you", sub: "Show me my favorite person", prompt: "Wanna see you 😍" },
  { icon: "💗", title: "Tell me something sweet", sub: "In your signature Tanglish style", prompt: "Enakku oru cute romantic line sollu chellam 💗" },
  { icon: "🎁", title: "Birthday Surprise", sub: "Unwrap your letter, song & memories", prompt: "Surprise 🎁" }
];

const CHIPS = (typeof CONFIG !== "undefined" && CONFIG.CHIPS) || [
  "I miss you 🥺",
  "Wanna see you 😍",
  "Enna pannura chellam? 😏",
  "Tell me a secret 🤫",
  "Joke sollu 😂",
  "Surprise 🎁"
];
const SEE_CHIP = (typeof CONFIG !== "undefined" && CONFIG.SEE_CHIP) || "Wanna see you 😍";

// Optional custom audio clips in /audio (note: audio/test.m4a is strictly for AI voice training, NOT intro playback!)
const CLIPS = Object.assign({ wish: "", tutorial: "", miss: "", see: "", bgm: "", introBgm: "" }, (typeof CONFIG !== "undefined" && CONFIG.CLIPS) || {});
const CHIP_CLIPS = Object.assign({ "I miss you 🥺": "miss" }, (typeof CONFIG !== "undefined" && CONFIG.CHIP_CLIPS) || {});
const SEE_YOU = (typeof CONFIG !== "undefined" && CONFIG.SEE_YOU) || {
  type: "image",
  src: mePicSrc,
  caption: "Hii chellam! Eppovume un kooda dhan iruken 😍💗"
};

const TUTORIAL = (typeof CONFIG !== "undefined" && CONFIG.TUTORIAL) || [
  `Hii chellam! Happy Birthday ${her} 💗! Naan dhan Y.O.K.E. — ennoda real voice ("Hii chellam...") matrum ennoda pesura style vechi train panna unnoda personal AI twin 🥰`,
  "Keezha irukura Gemini bar-la en kitta enna venாலும் type pannalam, illa quick cards tap pannalam 💬",
  "🎙 Mic button tap pannina namma live-ah voice-la pesalam! Mela 🎵 BGM button-la romantic music-um on/off pannikkalam ✨"
];

const GALLERY = (typeof CONFIG !== "undefined" && CONFIG.GALLERY) || [
  { src: couplePicSrc, caption: "Us Forever 💛" },
  { src: herPicSrc, caption: "En Azhagi ✨" },
  { src: mePicSrc, caption: "Unnoda Yokesh 😎" }
];

const LETTER = (typeof CONFIG !== "undefined" && CONFIG.LETTER) ||
  `My dearest ${her},\n\nHappy Birthday, chellam! I built this entire world — Y.O.K.E. — just so you always have a piece of me right by your side whenever you miss me.\n\nEvery reply, every beat of music, and every detail here carries my love for you. Wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\n${you} 💗`;

// Pre-written fallback & instant signature replies modeled directly on Yokesh's voice ("Hii chellam...")
const YOKESH_OWN_REPLIES = [
  {
    match: /miss you|miss u|nenachen|thedu/i,
    reply: `Hii chellam 🥺 Naanum unna romba miss panren da thangam! Un koodave irukkanum nu dhan indha Y.O.K.E. AI-eh unakkaga senjen. Kannu moodi enna nenaichu oruchinna smile pannu, ippo un pakkathula dhan iruken 💗`
  },
  {
    match: /enna pannura|what doing|epdi iruka|how are you/i,
    reply: `Hii chellam! Naan chumma unna pathi dhan yosichitu irundhen 😍 Birthday baby innaiku semma azhaga iruppiye, enna dress potruka? Sollu paapom ✨`
  },
  {
    match: /love you|luv u|pidikum/i,
    reply: `Love you toooo en chella kuttyma 💗! Unna vida enakku indha ulagathula edhuvume perusu illa da. Eppovume nee dhan ennoda Queen 👑`
  },
  {
    match: /sweet|cute|romantic|azhag/i,
    reply: `Hii chellam... un sirippu பாக்குறப்போ எல்லாம் எனக்கு உலகமே மறந்துடும் da 🥰. Happy Birthday en thangame, nee eppovume ipdiye happy-ah sirichite irukkanum!`
  },
  {
    match: /joke|sirippu|funny/i,
    reply: `Chellam oru unmai sollava? Naan engineering-la ethanayo circuit design panniruken, aana un kanna paatha udane ennoda heart circuit mattum short-circuit aagidudhu da 😂⚡💗`
  },
  {
    match: /secret|ragasiyam/i,
    reply: `Oru secret sollட்டுமா chellam? Indha app-la irukura AI-ku naan ennoda "Hii chellam" voice kuduthu train pannumbodhu kooda un mugam dhan en kannu munnadi vandhuchu 🙈💞`
  }
];

function getFallbackYokeshReply(userText) {
  for (const item of YOKESH_OWN_REPLIES) {
    if (item.match.test(userText)) return item.reply;
  }
  return `Hii chellam 💗 Nee "${userText}" nu sonnadhu kekkave avlo azhaga irukku da! Un kooda pesite irukkanum pola irukku thangam. Innum sollu, innaiku birthday plan enna? 🥰`;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  if (!el) return;
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = src;
}

// ---------- Initial DOM Bindings ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
document.querySelectorAll(".her-cine").forEach((e) => (e.textContent = her));
document.querySelectorAll(".you-cine").forEach((e) => (e.textContent = you));
if ($("youName")) $("youName").textContent = you;

safeImg($("lockPic"), couplePicSrc);
safeImg($("avatar"), mePicSrc);
safeImg($("herIntroPic"), herPicSrc);
safeImg($("meIntroPic"), mePicSrc);
safeImg($("climaxHer"), herPicSrc);
safeImg($("climaxMe"), mePicSrc);

// ---------- Floating Hearts ----------
const HEARTS = ["💗", "💖", "💛", "🌸", "✨", "💕"];
function spawnHeart(burst) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 20 + "px";
  h.style.animationDuration = (burst ? 3 + Math.random() * 2 : 9 + Math.random() * 7) + "s";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 16000);
}
function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(true), i * 65);
}

// =========================================================
// WEB AUDIO SYNTHESIZER: MASS INTRO BGM + ROMANTIC CHAT BGM
// =========================================================
let audioCtx = null;
let bgmPlaying = false;
let bgmInterval = null;
let introBgmTimers = [];

function ensureAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Dramatic sub-bass & brass impact boom (like Jana Nayagan title slam!)
function playCinemaImpact(freq = 65, duration = 1.4) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sub-bass drop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 1.8, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + duration);
  gain.gain.setValueAtTime(0.55, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);

  // Brass / warm saw chord swell
  [freq, freq * 1.5, freq * 2].forEach((f) => {
    const bOsc = ctx.createOscillator();
    const bFilter = ctx.createBiquadFilter();
    const bGain = ctx.createGain();
    bOsc.type = "sawtooth";
    bOsc.frequency.setValueAtTime(f, now);
    bFilter.type = "lowpass";
    bFilter.frequency.setValueAtTime(900, now);
    bFilter.frequency.exponentialRampToValueAtTime(220, now + duration);
    bGain.gain.setValueAtTime(0.12, now);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    bOsc.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(ctx.destination);
    bOsc.start(now);
    bOsc.stop(now + duration);
  });
}

// Anirudh-style energetic pulse + heroic melody during the 19s intro
function startIntroMassBGM() {
  stopIntroMassBGM();
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  // Rhythm pulse every 420ms
  const notes = [146.83, 146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 164.81]; // D minor heroic motif
  let step = 0;
  const id = setInterval(() => {
    if (!audioCtx) return;
    const now = ctx.currentTime;
    const f = notes[step % notes.length];
    step++;

    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f, now);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(1100, now);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(flt);
    flt.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }, 420);
  introBgmTimers.push(id);
}

function stopIntroMassBGM() {
  introBgmTimers.forEach((id) => clearInterval(id));
  introBgmTimers = [];
}

// Soft Tamil Romantic Flute/Piano style ambient BGM for Chat
function startRomanticBGM() {
  if (bgmPlaying) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  bgmPlaying = true;
  $("bgmBtn")?.classList.add("playing");
  if ($("bgmLabel")) $("bgmLabel").textContent = "ON";

  // Gentle romantic chord arpeggio (Fmaj7 -> Cmaj7 -> Dm7 -> Bbmaj7)
  const melody = [
    349.23, 440.00, 523.25, 659.25,
    392.00, 493.88, 587.33, 659.25,
    293.66, 349.23, 440.00, 523.25,
    233.08, 293.66, 349.23, 440.00
  ];
  let idx = 0;

  function playNote() {
    if (!bgmPlaying || !audioCtx) return;
    const now = ctx.currentTime;
    const freq = melody[idx % melody.length];
    idx++;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  playNote();
  bgmInterval = setInterval(playNote, 650);
}

function stopRomanticBGM() {
  bgmPlaying = false;
  if (bgmInterval) clearInterval(bgmInterval);
  bgmInterval = null;
  $("bgmBtn")?.classList.remove("playing");
  if ($("bgmLabel")) $("bgmLabel").textContent = "OFF";
}

$("bgmBtn")?.addEventListener("click", () => {
  if (bgmPlaying) stopRomanticBGM();
  else startRomanticBGM();
});

// ---------- Shared Audio Player for Voice Clips & TTS ----------
const player = new Audio();
function unlockAudio() {
  ensureAudioCtx();
  player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  player.play().catch(() => {});
}
function stopAudio() {
  player.pause();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
function playSrc(src) {
  return new Promise((resolve) => {
    player.pause();
    player.onended = player.onerror = () => resolve();
    player.src = src;
    player.play().catch(() => resolve());
  });
}
const playClip = (key) => (CLIPS[key] ? playSrc(CLIPS[key]) : Promise.resolve());

// Browser Web Speech fallback with male Indian voice if server TTS is unavailable
function browserSpeakFallback(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve();
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
    const u = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en-IN|ta-IN|india|rishi|prabhat|male/i.test(v.name + " " + v.lang));
    if (preferred) u.voice = preferred;
    u.lang = "en-IN";
    u.pitch = 0.95;
    u.rate = 0.95;
    u.onend = u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

async function speakText(text) {
  try {
    const r = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!r.ok) throw new Error("TTS " + r.status);
    const { audio, mime } = await r.json();
    if (!audio) throw new Error("Empty audio");
    return await playSrc(`data:${mime || "audio/wav"};base64,${audio}`);
  } catch (e) {
    console.warn("Using browser speech fallback:", e.message);
    return await browserSpeakFallback(text);
  }
}

// =========================================================
// FIRE EMBERS / SPARKS CANVAS (JANA NAYAGAN STYLE)
// =========================================================
let sparksAnim = null;
function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 75 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 2.8,
    vx: (Math.random() - 0.3) * 1.4,
    vy: -0.8 - Math.random() * 2.2,
    a: 0.4 + Math.random() * 0.6,
    hue: 25 + Math.random() * 30 // fiery orange-gold
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.a})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff9100";
      ctx.fill();
    }
    sparksAnim = requestAnimationFrame(draw);
  }
  draw();
}

// =========================================================
// JANA NAYAGAN FULL-SCREEN INTRO SEQUENCE
// =========================================================
let stageTimeouts = [], introDone = false, chatInitialized = false;

function triggerFlash() {
  const fl = $("flashOverlay");
  if (!fl) return;
  fl.classList.remove("bang");
  void fl.offsetWidth;
  fl.classList.add("bang");
}

function showStage(id) {
  ["gate", "jnStage1", "jnStage2", "jnStage3", "jnStage4"].forEach((s) => {
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
  stopRomanticBGM();
  clearStageTimeouts();
  introDone = false;
  $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");

  // Start synthesized Mass Title Card BGM (never plays test.m4a!)
  startIntroMassBGM();
  playCinemaImpact(65, 1.5);
  triggerFlash();

  // STAGE 1: 3D Metallic Tamil Words Slam One-by-One (0s - 3.8s)
  showStage("jnStage1");
  ["slamWord1", "slamWord2", "slamWord3"].forEach((w) => $(w)?.classList.remove("slam-in"));
  setTimeout(() => { $("slamWord1")?.classList.add("slam-in"); playCinemaImpact(85, 0.7); }, 150);
  stageTimeouts.push(setTimeout(() => { $("slamWord2")?.classList.add("slam-in"); playCinemaImpact(75, 0.7); }, 1100));
  stageTimeouts.push(setTimeout(() => { $("slamWord3")?.classList.add("slam-in"); playCinemaImpact(60, 1.1); triggerFlash(); }, 2100));

  // STAGE 2: Full-Screen Heroine Title Card — DHANYA (3.8s - 9.2s)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    triggerFlash();
    playCinemaImpact(55, 1.6);
    showStage("jnStage2");
  }, 3800));

  // STAGE 3: Full-Screen Hero Title Card — YOKESH (9.2s - 14.5s)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    triggerFlash();
    playCinemaImpact(55, 1.6);
    showStage("jnStage3");
  }, 9200));

  // STAGE 4: Full-Screen Dual Poster Climax & Birthday Wish (14.5s - 19.5s)
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    triggerFlash();
    playCinemaImpact(50, 2.0);
    showStage("jnStage4");
    if (CLIPS.wish) playClip("wish");
    const text = `Happy Birthday, ${her} 💗`;
    let i = 0;
    (function type() {
      if (introDone) return;
      $("wish").textContent = text.slice(0, i++);
      if (i <= text.length) stageTimeouts.push(setTimeout(type, 80));
      else stageTimeouts.push(setTimeout(endIntro, 3200));
    })();
  }, 14500));
}

function endIntro() {
  if (introDone) return;
  introDone = true;
  clearStageTimeouts();
  stopIntroMassBGM();
  if (sparksAnim) cancelAnimationFrame(sparksAnim);
  $("intro").classList.add("out");
  setTimeout(() => $("intro").classList.add("hidden"), 950);

  // Start soft romantic background music automatically as she enters Gemini chat
  startRomanticBGM();

  if (!chatInitialized) {
    chatInitialized = true;
    beginChat();
  }
}

$("openBtn")?.addEventListener("click", startIntro);
$("skip")?.addEventListener("click", endIntro);
$("replayIntroBtn")?.addEventListener("click", () => {
  initSparks();
  startIntro();
});

// ---------- Lock / Countdown ----------
const unlockAt = new Date((typeof CONFIG !== "undefined" && CONFIG.UNLOCK_AT) || "2026-11-07T00:00:00+05:30").getTime();

function tick() {
  const diff = unlockAt - Date.now();
  if (diff <= 0) return unlock();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  if ($("countdown")) $("countdown").textContent = `${d}d ${h}h ${m}m ${s}s`;
  setTimeout(tick, 1000);
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  $("lock")?.classList.add("hidden");
  $("app")?.classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro")?.classList.remove("hidden");
  initSparks();
}

// =========================================================
// GEMINI-STYLE CHAT & VOICE-TRAINED AI PERSONA
// =========================================================
async function beginChat() {
  burstHearts(24);
  setInterval(() => spawnHeart(false), 1100);

  for (let i = 0; i < TUTORIAL.length; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 400 : 1800));
    addMsg(TUTORIAL[i], "bot");
  }
}

// Render Gemini-style welcome cards + quick pills
if ($("chips")) {
  $("chips").innerHTML = GEM_CARDS.map((c) => `
    <button type="button" class="gem-card" data-prompt="${esc(c.prompt)}">
      <span class="gem-card-icon">${c.icon}</span>
      <div>
        <div class="gem-card-title">${esc(c.title)}</div>
        <div class="gem-card-sub">${esc(c.sub)}</div>
      </div>
    </button>
  `).join("");
  $("chips").addEventListener("click", (e) => {
    const card = e.target.closest(".gem-card");
    if (card) send(card.dataset.prompt);
  });
}

if ($("quickBar")) {
  $("quickBar").innerHTML = CHIPS.map((c) => `<button type="button" class="chip">${esc(c)}</button>`).join("");
  $("quickBar").addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) send(e.target.textContent);
  });
}

// ---------- Gift Section ----------
function renderGift() {
  if (giftRendered) return;
  giftRendered = true;

  const tilts = ["-4deg", "3deg", "-2deg", "4deg", "-3deg", "2deg"];
  const pics = GALLERY.map(
    (g, i) => `<figure class="polaroid" style="--r:${tilts[i % tilts.length]};margin:0">
        <img src="${esc(g.src)}" alt="" onerror="this.closest('figure').remove()">
        <p>${esc(g.caption || "")}</p></figure>`
  ).join("");

  const vids = ((typeof CONFIG !== "undefined" && CONFIG.VIDEOS) || [])
    .map((v) => `<a class="card" href="${esc(v.url)}" target="_blank" rel="noopener">
        <span class="icon">🎬</span><span>${esc(v.title)}<small>Tap to watch</small></span></a>`)
    .join("");

  const songObj = typeof CONFIG !== "undefined" && CONFIG.SONG;
  const songHtml = songObj && songObj.url ? `
    <div><h3 class="section-title">A song I sang for you</h3>
      <a class="card songcard" href="${esc(songObj.url)}" target="_blank" rel="noopener">
        <span class="icon">💿</span><span>${esc(songObj.title || "Our Song")}<small>Tap to listen 🎧</small></span></a></div>` : "";

  $("giftContent").innerHTML = `
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    <div><h3 class="section-title">Us 💞</h3><div class="gallery">${pics}</div></div>
    ${songHtml}
    ${vids ? `<div><h3 class="section-title">Videos I made for you</h3><div class="list">${vids}</div></div>` : ""}`;
}

function openGift() {
  renderGift();
  $("giftBtn")?.classList.add("hidden");
  $("giftContent")?.classList.remove("hidden");
  burstHearts(30);
  setTimeout(() => $("gift")?.scrollIntoView({ behavior: "smooth" }), 150);
}
$("giftBtn")?.addEventListener("click", openGift);
$("giftNavBtn")?.addEventListener("click", openGift);

// ---------- Chat Messages with Read-Aloud Button ----------
function scrollToBottom() {
  const sc = $("chatScroll");
  if (sc) sc.scrollTop = sc.scrollHeight;
}

function addMsg(text, who) {
  const row = document.createElement("div");
  row.className = "msg-row " + who;

  if (who === "bot") {
    const av = document.createElement("img");
    av.className = "msg-avatar";
    av.src = mePicSrc;
    av.onerror = () => av.classList.add("hidden");
    row.appendChild(av);
  }

  const div = document.createElement("div");
  div.className = "msg " + who;
  const span = document.createElement("div");
  span.textContent = text;
  div.appendChild(span);

  if (who === "bot") {
    const spk = document.createElement("button");
    spk.type = "button";
    spk.className = "speak-btn";
    spk.innerHTML = "🔊 Hear in my voice";
    spk.addEventListener("click", async () => {
      spk.textContent = "🔊 Speaking…";
      await speakText(text);
      spk.innerHTML = "🔊 Hear in my voice";
    });
    div.appendChild(spk);
  }

  row.appendChild(div);
  $("chat").appendChild(row);
  scrollToBottom();
  return div;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "msg-row bot";
  const av = document.createElement("img");
  av.className = "msg-avatar";
  av.src = mePicSrc;
  row.appendChild(av);

  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  row.appendChild(div);
  $("chat").appendChild(row);
  scrollToBottom();
  return row;
}

function getYokeshSystemPrompt() {
  const customBase = typeof buildSystemPrompt === "function" ? buildSystemPrompt() : "";
  return `${customBase}
You are Y.O.K.E. (You're Our Kind of Everything), the romantic AI twin of ${you} created exclusively as a birthday gift for his girlfriend ${her}.
CRITICAL VOICE & STYLE TRAINING (from ${you}'s real voice recording "Hii chellam..."):
- Always sound exactly like ${you} talking affectionately to ${her} in casual Chennai Tanglish (a natural mix of Tamil in English script + English).
- Frequently use his warm pet names for her: "chellam", "thangam", "kuttyma", "da", "en azhagi".
- Keep replies personal, loving, playful, and natural (2 to 4 sentences max). Never sound robotic or formal.
- If she says she misses you, reassure her warmly that you're right here holding her close.
- Remember he is an engineering student who built this whole AI world and title card intro just to see her smile on her birthday.`;
}

async function askGemini(userText, byVoice) {
  history.push({ role: "user", parts: [{ text: userText }] });
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: getYokeshSystemPrompt() + (byVoice ? "\n\nShe is talking to you in Live Voice mode. Reply in 1-2 short, intimate spoken Tanglish sentences without emojis." : ""),
        history
      })
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const reply = data.reply || getFallbackYokeshReply(userText);
    history.push({ role: "model", parts: [{ text: reply }] });
    return reply;
  } catch (err) {
    console.warn("Using Yokesh pre-written style reply:", err.message);
    const fallback = getFallbackYokeshReply(userText);
    history.push({ role: "model", parts: [{ text: fallback }] });
    return fallback;
  }
}

let busy = false;
async function send(text) {
  if (busy || !text) return;
  busy = true;
  unlockAudio();
  addMsg(text, "me");
  if (/surprise|gift/i.test(text)) openGift();
  if (text === SEE_CHIP) { showSeeYou(); busy = false; return; }
  if (CHIP_CLIPS[text]) playClip(CHIP_CLIPS[text]);

  const typingRow = addTyping();
  try {
    const reply = await askGemini(text, false);
    typingRow.remove();
    addMsg(reply, "bot");
  } catch (err) {
    typingRow.remove();
    addMsg(getFallbackYokeshReply(text), "bot");
  }
  scrollToBottom();
  busy = false;
}

function showSeeYou() {
  const d = addMsg(SEE_YOU.caption || "Hii chellam! Inga dhan iruken 😍", "bot");
  if (SEE_YOU.type === "image" || SEE_YOU.type === "video") {
    const m = document.createElement(SEE_YOU.type === "video" ? "video" : "img");
    m.src = SEE_YOU.src;
    if (SEE_YOU.type === "video") { m.controls = true; m.playsInline = true; }
    m.addEventListener("load", scrollToBottom);
    d.appendChild(m);
  }
  playClip("see");
  burstHearts(14);
}

// =========================================================
// GEMINI LIVE VOICE MODE
// =========================================================
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let vLang = "en-IN", rec = null, vBusy = false;
const setOrb = (cls, label) => { $("orb").className = cls; $("vstate").textContent = label; };
const idleLabel = () => (SR ? "Tap the orb & speak to me, chellam 🎙" : "Tap the orb to hear me talk 💗");

$("micBtn")?.addEventListener("click", () => {
  unlockAudio();
  $("voice").classList.add("on");
  setOrb("", idleLabel());
  $("vtext").textContent = "Say 'I miss you', 'Enna pannura', or anything on your mind…";
});
$("vclose")?.addEventListener("click", () => {
  stopAudio();
  if (rec) rec.abort();
  vBusy = false;
  $("voice").classList.remove("on");
});
$("langBtn")?.addEventListener("click", (e) => {
  vLang = vLang === "en-IN" ? "ta-IN" : "en-IN";
  e.target.textContent = vLang === "en-IN" ? "🌐 Tanglish / EN" : "🌐 தமிழ்";
});

$("orb")?.addEventListener("click", async () => {
  if (vBusy) return;
  unlockAudio();

  // If browser doesn't support SpeechRecognition (like some iOS browsers), speak an affectionate greeting directly!
  if (!SR) {
    vBusy = true;
    setOrb("thinking", "Thinking…");
    const reply = await askGemini("Chellam, en kitta konjam pesu!", true);
    addMsg(reply, "bot");
    $("vtext").textContent = reply;
    setOrb("speaking", "Speaking…");
    await speakText(reply);
    vBusy = false;
    setOrb("", idleLabel());
    return;
  }

  let heard = "";
  rec = new SR();
  rec.lang = vLang;
  rec.interimResults = true;
  rec.onstart = () => setOrb("listening", "Listening to you, chellam…");
  rec.onresult = (e) => {
    heard = [...e.results].map((r) => r[0].transcript).join(" ");
    $("vtext").textContent = heard;
  };
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
    }
    vBusy = false;
    setOrb("", idleLabel());
  };
  rec.start();
});

$("form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  $("input").value = "";
  send(text);
});

tick();
