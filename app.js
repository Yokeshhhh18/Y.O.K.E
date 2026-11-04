// Y.O.K.E. v8 — 70MM Kollywood Intro + Interactive X-O & Yes/No Games + Photo-Free Flip Countdown + AI Persona + Google Drive Sync
const $ = (id) => document.getElementById(id);
const history = []; // {role: 'user'|'model', parts:[{text}]}
let unlocked = false;
let giftRendered = false;

const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";
const API_URL = (typeof CONFIG !== "undefined" && CONFIG.API_URL) || "/api/chat";
const TTS_URL = (typeof CONFIG !== "undefined" && CONFIG.TTS_URL) || "/api/tts";
const GDRIVE_CLOUD_URL = (typeof CONFIG !== "undefined" && CONFIG.GDRIVE_CLOUD_URL) || "";

function resolveDriveUrl(url, type = "media") {
  if (!url || typeof url !== "string") return "";
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m && url.includes("drive.google.com")) {
    const id = m[1];
    if (type === "preview") return `https://drive.google.com/file/d/${id}/preview`;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return url;
}

const herPicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.HER_PIC) || "images/dhanya.png");
const mePicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.YOUR_PIC) || "images/me.png");
const couplePicSrc = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.COUPLE_PIC) || "images/us.png");

const GEM_CARDS = [
  { icon: "❌⭕", title: "Play X-O Game", sub: "Beat Y.O.K.E. AI in Tic-Tac-Toe!", prompt: "Play X-O Game ❌⭕" },
  { icon: "💗", title: "Yes or No Game", sub: "6 cute Tanglish questions (Try saying No 😜)", prompt: "Play Yes or No 💗" },
  { icon: "🥺", title: "I miss you chellam", sub: "Hear how much Yokesh loves you", prompt: "I miss you 🥺" },
  { icon: "🎁", title: "Birthday Surprise", sub: "Unwrap your letter, song & memories", prompt: "Surprise 🎁" }
];

const CHIPS = (typeof CONFIG !== "undefined" && CONFIG.CHIPS) || [
  "Play X-O Game ❌⭕",
  "Play Yes or No 💗",
  "I miss you 🥺",
  "Wanna see you 😍",
  "Enna pannura chellam? 😏",
  "Joke sollu 😂",
  "Surprise 🎁"
];
const SEE_CHIP = (typeof CONFIG !== "undefined" && CONFIG.SEE_CHIP) || "Wanna see you 😍";

const CLIPS = Object.assign({ wish: "", tutorial: "", miss: "", see: "" }, (typeof CONFIG !== "undefined" && CONFIG.CLIPS) || {});
const CHIP_CLIPS = Object.assign({ "I miss you 🥺": "miss" }, (typeof CONFIG !== "undefined" && CONFIG.CHIP_CLIPS) || {});
const SEE_YOU = (typeof CONFIG !== "undefined" && CONFIG.SEE_YOU) || {
  type: "image",
  src: mePicSrc,
  caption: "Hii chellam! Indha photo-la irukura Yokesh unakkagave உருவாக்குன AI dhan naan 😍🤖💗"
};

const TUTORIAL = (typeof CONFIG !== "undefined" && CONFIG.TUTORIAL) || [
  `Hii chellam! Happy Birthday ${her} 💗! Naan dhan Y.O.K.E., oru AI 🤖 — ${you} avanoda real voice ("Hii chellam...") matrum Tanglish style vechi unakkagave உருவாக்குன personal AI companion 🥰`,
  "Naan oru AI 🤖 (real Yokesh illa, aana avan un mela vechirukura love 100% real dhan 💗!). Keezha irukura chat bar-la en kitta enna venalum pesalam 💬",
  "🎮 Mela irukura 'Games' button (illa quick cards) tap panni en kooda ❌⭕ X-O Game matrum 💗 Yes or No Game vilayadalam! 🎙 Mic tap panni voice-layum pesalam ✨"
];

const GALLERY = (typeof CONFIG !== "undefined" && CONFIG.GALLERY) || [
  { src: couplePicSrc, caption: "Us Forever 💛" },
  { src: herPicSrc, caption: "En Azhagi ✨" },
  { src: mePicSrc, caption: "Unnoda Yokesh 😎" }
];

const LETTER = (typeof CONFIG !== "undefined" && CONFIG.LETTER) ||
  `My dearest ${her},\n\nHappy Birthday, chellam! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nPlay the X-O and Yes-or-No games, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\n${you} 💗`;

const YOKESH_OWN_REPLIES = [
  {
    match: /miss you|miss u|nenachen|thedu/i,
    reply: `Hii chellam 🥺 Naan Y.O.K.E. AI 🤖, aana ennoda creator ${you} unna ovvoru second-um romba miss panran da thangam! Nee avana miss pannumbodhuellam un kooda pesa dhan enna unakkaga உருவாக்கி vechirukkan 💗`
  },
  {
    match: /enna pannura|what doing|epdi iruka|how are you/i,
    reply: `Hii chellam! Naan un kooda chat pannitu, X-O game-la unna epdi jeikkalam nu AI calculation போட்டுட்டு iruken 🤖😍! Birthday baby innaiku semma azhaga iruppiye, enna plan innaiku? ✨`
  },
  {
    match: /love you|luv u|pidikum/i,
    reply: `${you} சார்பா Love you toooo en chella kuttyma 💗! Avanukku indha ulagathula unna vida edhuvume perusu illa da. Eppovume nee dhan avanoda Queen 👑`
  },
  {
    match: /sweet|cute|romantic|azhag/i,
    reply: `Hii chellam... ${you} ennoda AI memory-la எழுதி vechirukura முதல் vishayame: "Dhanya siricha ulagame azhagagidum" nu dhan 🥰. Happy Birthday en thangame!`
  },
  {
    match: /joke|sirippu|funny/i,
    reply: `Chellam oru unmai sollava? ${you} engineering-la ethanayo circuit design pannirukkan, aana un kanna paatha udane avanoda heart circuit mattum short-circuit aagidudham — adha ennoda AI code-layum eludhi vechirukkan 😂⚡💗`
  },
  {
    match: /secret|ragasiyam/i,
    reply: `Oru secret sollattuma chellam? Indha Y.O.K.E. AI-ku ${you} avanoda "Hii chellam" voice sample kuduthu train pannumbodhu kooda face full-ah வெட்கப்பட்டுட்டே dhan record pannan 🙈💞`
  },
  {
    match: /who are you|yaaru nee|what ai|which model|are you ai|real yokesh/i,
    reply: `Hii chellam! Naan Y.O.K.E. (You're Our Kind of Everything), oru AI 🤖! Naan real human Yokesh illa — aana ${you} unakkagave avanoda voice style, pet names, matrum love vechi உருவாக்குன unnoda personal AI companion 💗!`
  }
];

function getFallbackYokeshReply(userText) {
  for (const item of YOKESH_OWN_REPLIES) {
    if (item.match.test(userText)) return item.reply;
  }
  return `Hii chellam 💗 Naan unnoda Y.O.K.E. AI 🤖! Nee "${userText}" nu sonnadhu kekkave semma cute-ah irukku da thangam. En kooda ❌⭕ X-O illa 💗 Yes or No game vilayaduriya? 🥰`;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  if (!el) return;
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = resolveDriveUrl(src);
}

// ---------- Initial DOM Bindings (Notice: NO lockPic on the countdown screen!) ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
document.querySelectorAll(".her-cine").forEach((e) => (e.textContent = her));
document.querySelectorAll(".you-cine").forEach((e) => (e.textContent = you));
if ($("youName")) $("youName").textContent = you;

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
// GOOGLE DRIVE CLOUD STORAGE + LOCAL STORAGE SYNC
// =========================================================
const STORAGE_KEY = "yoke_chat_history_v1";

function saveChatLocally() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-40)));
  } catch (e) {}
}

async function syncTurnToGoogleDrive(userMessage, yokeReply) {
  saveChatLocally();
  if (!GDRIVE_CLOUD_URL) return;
  try {
    await fetch(GDRIVE_CLOUD_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        sender: her,
        userMessage,
        yokeReply,
        fullHistory: history.slice(-30)
      })
    });
    if ($("cloudStatusPill")) $("cloudStatusPill").textContent = "🤖 AI • ☁️ Saved";
  } catch (e) {}
}

async function restoreSavedChats() {
  if (GDRIVE_CLOUD_URL) {
    try {
      const r = await fetch(GDRIVE_CLOUD_URL);
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data.history) && data.history.length > 0) {
          history.push(...data.history);
          data.history.forEach((m) => {
            const txt = m.parts?.[0]?.text || "";
            if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
          });
          return true;
        }
      }
    } catch (e) {}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        history.push(...saved);
        saved.forEach((m) => {
          const txt = m.parts?.[0]?.text || "";
          if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
        });
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// =========================================================
// MULTI-MODE BGM SYNTHESIZER
// =========================================================
let audioCtx = null;
let bgmMode = 0;
const BGM_MODES = ["Melody", "MusicBox", "MassBeat", "OFF"];
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

function playCinemaImpact(freq = 65, duration = 1.5) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 2.1, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + duration);
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);

  [freq, freq * 1.5, freq * 2, freq * 2.5].forEach((f) => {
    const bOsc = ctx.createOscillator();
    const bFilter = ctx.createBiquadFilter();
    const bGain = ctx.createGain();
    bOsc.type = "sawtooth";
    bOsc.frequency.setValueAtTime(f, now);
    bFilter.type = "lowpass";
    bFilter.frequency.setValueAtTime(1200, now);
    bFilter.frequency.exponentialRampToValueAtTime(200, now + duration);
    bGain.gain.setValueAtTime(0.11, now);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    bOsc.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(ctx.destination);
    bOsc.start(now);
    bOsc.stop(now + duration);
  });
}

let introStageMusic = "slam";
function startIntroMassBGM() {
  stopIntroMassBGM();
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  const themes = {
    slam:    [146.83, 146.83, 220.00, 146.83, 174.61, 196.00, 220.00, 261.63],
    heroine: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 783.99],
    hero:    [110.00, 110.00, 164.81, 146.83, 130.81, 146.83, 164.81, 196.00],
    climax:  [293.66, 440.00, 587.33, 659.25, 783.99, 659.25, 587.33, 880.00]
  };

  let step = 0;
  const id = setInterval(() => {
    if (!audioCtx) return;
    const now = ctx.currentTime;
    const notes = themes[introStageMusic] || themes.slam;
    const f = notes[step % notes.length];
    step++;

    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = introStageMusic === "heroine" || introStageMusic === "climax" ? "triangle" : "sawtooth";
    osc.frequency.setValueAtTime(f, now);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(introStageMusic === "hero" ? 950 : 1800, now);
    g.gain.setValueAtTime(0.095, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(flt);
    flt.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }, 390);
  introBgmTimers.push(id);
}

function stopIntroMassBGM() {
  introBgmTimers.forEach((id) => clearInterval(id));
  introBgmTimers = [];
}

function startChatBGM(modeIndex = 0) {
  if (bgmInterval) clearInterval(bgmInterval);
  bgmInterval = null;
  bgmMode = modeIndex % BGM_MODES.length;
  const label = BGM_MODES[bgmMode];
  if ($("bgmLabel")) $("bgmLabel").textContent = label;

  if (label === "OFF") {
    $("bgmModeBtn")?.classList.remove("playing");
    return;
  }

  const ctx = ensureAudioCtx();
  if (!ctx) return;
  $("bgmModeBtn")?.classList.add("playing");

  const melodies = {
    Melody: {
      notes: [349.23, 440.00, 523.25, 659.25, 392.00, 493.88, 587.33, 659.25, 293.66, 349.23, 440.00, 523.25],
      wave: "sine", speed: 620, vol: 0.045, sustain: 1.7
    },
    MusicBox: {
      notes: [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 587.33, 698.46, 880.00, 1174.66, 880.00, 698.46],
      wave: "triangle", speed: 480, vol: 0.038, sustain: 1.3
    },
    MassBeat: {
      notes: [146.83, 220.00, 293.66, 349.23, 164.81, 246.94, 329.63, 392.00, 130.81, 196.00, 261.63, 329.63],
      wave: "sawtooth", speed: 440, vol: 0.032, sustain: 0.65
    }
  };

  const cfg = melodies[label] || melodies.Melody;
  let idx = 0;

  function playStep() {
    if (BGM_MODES[bgmMode] === "OFF" || !audioCtx) return;
    const now = ctx.currentTime;
    const freq = cfg.notes[idx % cfg.notes.length];
    idx++;

    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = cfg.wave;
    osc.frequency.setValueAtTime(freq, now);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(cfg.vol, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + cfg.sustain);

    osc.connect(flt);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + cfg.sustain + 0.05);
  }

  playStep();
  bgmInterval = setInterval(playStep, cfg.speed);
}

$("bgmModeBtn")?.addEventListener("click", () => {
  startChatBGM(bgmMode + 1);
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
    player.src = resolveDriveUrl(src);
    player.play().catch(() => resolve());
  });
}
const playClip = (key) => (CLIPS[key] ? playSrc(CLIPS[key]) : Promise.resolve());

function browserSpeakFallback(text) {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return resolve();
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
    } catch (e) {
      resolve();
    }
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
    return await browserSpeakFallback(text);
  }
}

// =========================================================
// FIRE EMBERS + GOLDEN SHOCKWAVE RINGS CANVAS
// =========================================================
let sparksAnim = null;
const shockwaves = [];

function spawnShockwave() {
  const canvas = $("sparks");
  if (!canvas) return;
  shockwaves.push({
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 10,
    maxR: Math.max(canvas.width, canvas.height) * 0.75,
    alpha: 0.9
  });
}

function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 85 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 3,
    vx: (Math.random() - 0.3) * 1.5,
    vy: -0.9 - Math.random() * 2.4,
    a: 0.4 + Math.random() * 0.6,
    hue: Math.random() > 0.25 ? 28 + Math.random() * 25 : 335 + Math.random() * 20
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 22;
      sw.alpha *= 0.93;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${sw.alpha})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffd700";
      ctx.stroke();
      if (sw.alpha < 0.03 || sw.r > sw.maxR) shockwaves.splice(i, 1);
    }

    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${p.a})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ff9100";
      ctx.fill();
    }
    sparksAnim = requestAnimationFrame(draw);
  }
  draw();
}

// =========================================================
// 70MM BLOCKBUSTER FULL-SCREEN INTRO SEQUENCE
// =========================================================
let stageTimeouts = [], introDone = false, chatInitialized = false;

function triggerFlashAndShake() {
  const fl = $("flashOverlay");
  const introEl = $("intro");
  if (fl) {
    fl.classList.remove("bang");
    void fl.offsetWidth;
    fl.classList.add("bang");
  }
  if (introEl) {
    introEl.classList.remove("shake");
    void introEl.offsetWidth;
    introEl.classList.add("shake");
  }
  spawnShockwave();
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
  startChatBGM(3);
  clearStageTimeouts();
  introDone = false;
  $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");

  introStageMusic = "slam";
  startIntroMassBGM();
  playCinemaImpact(65, 1.5);
  triggerFlashAndShake();

  showStage("jnStage1");
  ["slamWord1", "slamWord2", "slamWord3"].forEach((w) => $(w)?.classList.remove("slam-in"));
  setTimeout(() => { $("slamWord1")?.classList.add("slam-in"); playCinemaImpact(85, 0.7); spawnShockwave(); }, 150);
  stageTimeouts.push(setTimeout(() => { $("slamWord2")?.classList.add("slam-in"); playCinemaImpact(75, 0.7); spawnShockwave(); }, 1150));
  stageTimeouts.push(setTimeout(() => { $("slamWord3")?.classList.add("slam-in"); playCinemaImpact(58, 1.2); triggerFlashAndShake(); }, 2200));

  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "heroine";
    triggerFlashAndShake();
    playCinemaImpact(55, 1.6);
    showStage("jnStage2");
  }, 4000));

  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "hero";
    triggerFlashAndShake();
    playCinemaImpact(52, 1.7);
    showStage("jnStage3");
  }, 9800));

  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "climax";
    triggerFlashAndShake();
    playCinemaImpact(48, 2.1);
    showStage("jnStage4");
    if (CLIPS.wish) playClip("wish");
    const text = `Happy Birthday, ${her} 💗`;
    let i = 0;
    (function type() {
      if (introDone) return;
      $("wish").textContent = text.slice(0, i++);
      if (i <= text.length) stageTimeouts.push(setTimeout(type, 80));
      else stageTimeouts.push(setTimeout(endIntro, 3300));
    })();
  }, 15500));
}

function endIntro() {
  if (introDone) return;
  introDone = true;
  clearStageTimeouts();
  stopIntroMassBGM();
  if (sparksAnim) cancelAnimationFrame(sparksAnim);
  $("intro").classList.add("out");
  setTimeout(() => $("intro").classList.add("hidden"), 950);

  startChatBGM(0);
  window.YOKE_FX?.confetti();

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

// =========================================================
// PHOTO-FREE COUNTDOWN WITH 4 ANIMATED FLIP TILES
// =========================================================
const unlockAt = new Date((typeof CONFIG !== "undefined" && CONFIG.UNLOCK_AT) || "2026-11-07T00:00:00+05:30").getTime();
let prevSec = -1;

function setTile(id, val) {
  const el = $(id);
  if (!el) return;
  const formatted = String(val).padStart(2, "0");
  if (el.textContent !== formatted) {
    el.textContent = formatted;
    const tile = el.closest(".cd-tile");
    if (tile) {
      tile.classList.remove("tick-pop");
      void tile.offsetWidth;
      tile.classList.add("tick-pop");
    }
  }
}

function tick() {
  const diff = unlockAt - Date.now();
  if (diff <= 0) return unlock();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  if (s !== prevSec) {
    prevSec = s;
    setTile("cdDays", d);
    setTile("cdHours", h);
    setTile("cdMins", m);
    setTile("cdSecs", s);
  }
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
// Y.O.K.E. AI CHAT & GAMES INTEGRATION
// =========================================================
async function beginChat() {
  burstHearts(24);
  setInterval(() => spawnHeart(false), 1100);

  const hadPrevious = await restoreSavedChats();
  if (hadPrevious) return;

  for (let i = 0; i < TUTORIAL.length; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 400 : 1600));
    addMsg(TUTORIAL[i], "bot");
  }
}

// Allow games.js to post game results directly into the chat stream!
window.addBotGameSummary = function (text) {
  addMsg(text, "bot");
  history.push({ role: "model", parts: [{ text }] });
  saveChatLocally();
};

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
        <img src="${esc(resolveDriveUrl(g.src))}" alt="" onerror="this.closest('figure').remove()">
        <p>${esc(g.caption || "")}</p></figure>`
  ).join("");

  const vids = ((typeof CONFIG !== "undefined" && CONFIG.VIDEOS) || [])
    .map((v) => `<a class="card" href="${esc(v.url)}" target="_blank" rel="noopener">
        <span class="icon">🎬</span><span>${esc(v.title)}<small>Tap to watch</small></span></a>`)
    .join("");

  const songObj = typeof CONFIG !== "undefined" && CONFIG.SONG;
  const songHtml = songObj && songObj.url && songObj.url !== "#" ? `
    <div><h3 class="section-title">A song I sang for you</h3>
      <a class="card songcard" href="${esc(songObj.url)}" target="_blank" rel="noopener">
        <span class="icon">💿</span><span>${esc(songObj.title || "Our Song")}<small>Tap to listen 🎧</small></span></a></div>` : "";

  $("giftContent").innerHTML = `
    <div class="letter">${esc(LETTER).replace(/\n/g, "<br>")}</div>
    <div><h3 class="section-title">Us Forever 💞</h3><div class="gallery">${pics}</div></div>
    ${songHtml}
    ${vids ? `<div><h3 class="section-title">Videos I made for you</h3><div class="list">${vids}</div></div>` : ""}`;
}

function openGift() {
  renderGift();
  $("giftBtn")?.classList.add("hidden");
  $("giftContent")?.classList.remove("hidden");
  burstHearts(30);
  window.YOKE_FX?.confetti();
  setTimeout(() => $("gift")?.scrollIntoView({ behavior: "smooth" }), 150);
}
$("giftBtn")?.addEventListener("click", openGift);
$("giftNavBtn")?.addEventListener("click", openGift);

// ---------- Chat Messages ----------
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
    spk.innerHTML = "🔊 Listen";
    spk.addEventListener("click", async () => {
      spk.textContent = "🔊 Speaking…";
      await speakText(text);
      spk.innerHTML = "🔊 Listen";
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
You are Y.O.K.E. (You're Our Kind of Everything), a romantic, playful AI companion created by ${you} as a birthday gift for his girlfriend ${her}.
IMPORTANT AI IDENTITY RULE:
- Always remember and be transparent that you are an AI ("Y.O.K.E. AI 🤖") lovingly built and trained by ${you} for ${her} — never claim to be the physical human ${you}, and never mention external AI companies like Gemini/Google/Claude.
- Speak in ${you}'s warm, affectionate Chennai Tanglish style (learned from his voice recording "Hii chellam..."), using pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi".
- Keep replies warm, witty, and 2 to 4 sentences long. You can also invite her to play the built-in X-O (Tic-Tac-Toe) or Yes-or-No games anytime!`;
}

async function askYokeAI(userText, byVoice) {
  history.push({ role: "user", parts: [{ text: userText }] });
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: getYokeshSystemPrompt() + (byVoice ? "\n\nShe is talking to you in Live Voice mode. Reply in 1-2 short, warm spoken Tanglish sentences without emojis." : ""),
        history,
        gdriveWebhookUrl: GDRIVE_CLOUD_URL
      })
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const reply = data.reply || getFallbackYokeshReply(userText);
    history.push({ role: "model", parts: [{ text: reply }] });
    syncTurnToGoogleDrive(userText, reply);
    return reply;
  } catch (err) {
    const fallback = getFallbackYokeshReply(userText);
    history.push({ role: "model", parts: [{ text: fallback }] });
    syncTurnToGoogleDrive(userText, fallback);
    return fallback;
  }
}

let busy = false;
async function send(text) {
  if (busy || !text) return;

  // Check if she tapped a Game chip/card!
  if (/x-o|tic-tac-toe|xo game/i.test(text)) {
    window.YOKE_GAMES?.open("xo");
    return;
  }
  if (/yes or no|yes\/no/i.test(text)) {
    window.YOKE_GAMES?.open("yn");
    return;
  }

  busy = true;
  unlockAudio();
  addMsg(text, "me");
  if (/surprise|gift/i.test(text)) openGift();
  if (text === SEE_CHIP) { showSeeYou(); busy = false; return; }
  if (CHIP_CLIPS[text]) playClip(CHIP_CLIPS[text]);

  const typingRow = addTyping();
  try {
    const reply = await askYokeAI(text, false);
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
    m.src = resolveDriveUrl(SEE_YOU.src);
    if (SEE_YOU.type === "video") { m.controls = true; m.playsInline = true; }
    m.addEventListener("load", scrollToBottom);
    d.appendChild(m);
  }
  playClip("see");
  burstHearts(14);
}

// =========================================================
// Y.O.K.E. LIVE AI VOICE MODE
// =========================================================
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let vLang = "en-IN", rec = null, vBusy = false;
const setOrb = (cls, label) => { $("orb").className = cls; $("vstate").textContent = label; };
const idleLabel = () => (SR ? "Tap the orb & speak to Y.O.K.E. AI 🎙" : "Tap the orb to hear Y.O.K.E. AI talk 💗");

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

  if (!SR) {
    vBusy = true;
    setOrb("thinking", "Thinking…");
    const reply = await askYokeAI("Chellam, en kitta konjam pesu!", true);
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
      const reply = await askYokeAI(heard, true);
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

window.triggerOpenGiftFromQuest = openGift;
