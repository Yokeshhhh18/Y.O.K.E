// Y.O.K.E. v10 — 4-Panel Jana Nayagan Intro + Banger BGM + Left History Sidebar + Live Gemini API + Google Drive Sync + Photo-Free Chat
const $ = (id) => document.getElementById(id);
let history = []; // Current session's messages: {role: 'user'|'model', parts:[{text}]}
let sessions = []; // [{ id, title, updatedAt, messages: [] }]
let currentSessionId = "";
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

const panel1Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_1_PIC) || "images/panel_1.jpg");
const panel2Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_2_PIC) || "images/panel_2.jpg");
const panel3Src = resolveDriveUrl((typeof CONFIG !== "undefined" && CONFIG.PANEL_3_PIC) || "images/panel_3.jpg");

const GEM_CARDS = [
  { icon: "👑", title: "Chibi Doll X-O", sub: "Play Tic-Tac-Toe with our 3D Dolls!", prompt: "Play X-O Game ❌⭕" },
  { icon: "🥇", title: "Funny Medal Quest", sub: "Pass 6 funny tests & win Yokesh's Gold Medal!", prompt: "Play Yes or No 💗" },
  { icon: "🥺", title: "I miss you chellam", sub: "Hear how much Yokesh loves you", prompt: "I miss you 🥺" },
  { icon: "🎁", title: "Birthday Surprise", sub: "Unwrap your letter, song & memories", prompt: "Surprise 🎁" }
];

const CHIPS = (typeof CONFIG !== "undefined" && CONFIG.CHIPS) || [
  "Play X-O Game ❌⭕",
  "Play Yes or No 💗",
  "I miss you 🥺",
  "Enna pannura chellam? 😏",
  "Roast me playfully 😜",
  "Joke sollu 😂",
  "Surprise 🎁"
];

const CLIPS = Object.assign({ wish: "", tutorial: "", miss: "" }, (typeof CONFIG !== "undefined" && CONFIG.CLIPS) || {});
const CHIP_CLIPS = Object.assign({ "I miss you 🥺": "miss" }, (typeof CONFIG !== "undefined" && CONFIG.CHIP_CLIPS) || {});

const TUTORIAL = (typeof CONFIG !== "undefined" && CONFIG.TUTORIAL) || [
  `Hii chellam! இனிய பிறந்தநாள் வாழ்த்துக்கள் ${her}! Happy Birthday 💗! Naan dhan Y.O.K.E., oru AI 🤖 — ${you} avanoda real voice ("Hii chellam...") matrum Gemini AI brain vechi unakkagave உருவாக்குன personal AI companion 🥰`,
  "Left side-la irukura '☰ History' tab-la namma pesura ellame save aagum (Google Drive-layum automatic-ah sync aagum ☁️!).",
  "🎮 Mela irukura 'Games' button tap panni namma 3D Chibi Dolls vechi 👑 X-O Game vilayadalam, apram 🥇 Funny Quest mudichi Yokesh kitta irundhu Gold Medal-um vaangalam! ✨"
];

const GALLERY = (typeof CONFIG !== "undefined" && CONFIG.GALLERY) || [
  { src: "images/panel_1.jpg", caption: "Happy ✨" },
  { src: "images/panel_2.jpg", caption: "Birthday 👑" },
  { src: "images/panel_3.jpg", caption: "Dhanya 💗" },
  { src: "images/chibi_her.jpg", caption: "Cutie Queen Doll 🎀" },
  { src: "images/chibi_me.jpg", caption: "Your Chibi Boy 😎" },
  { src: "images/medal_award.jpg", caption: "Gold Medal Winner 🥇" }
];

const LETTER = (typeof CONFIG !== "undefined" && CONFIG.LETTER) ||
  `My dearest ${her},\n\nஇனிய பிறந்தநாள் வாழ்த்துக்கள் செல்லம்! Happy Birthday! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nPlay the Chibi X-O and Funny Medal Quest games, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\n${you} 💗`;

const YOKESH_OWN_REPLIES = [
  {
    match: /miss you|miss u|nenachen|thedu/i,
    reply: `Hii chellam 🥺 Naan Y.O.K.E. AI 🤖, aana ennoda creator ${you} unna ovvoru second-um romba miss panran da thangam! Nee avana miss pannumbodhuellam un kooda pesa dhan enna unakkaga உருவாக்கி vechirukkan 💗`
  },
  {
    match: /enna pannura|what doing|epdi iruka|how are you/i,
    reply: `Hii chellam! Naan un kooda chat pannitu, Chibi Doll X-O game-la unna epdi jeikkalam nu AI calculation போட்டுட்டு iruken 🤖😍! Birthday baby innaiku semma azhaga iruppiye, enna plan innaiku? ✨`
  },
  {
    match: /love you|luv u|pidikum/i,
    reply: `${you} சார்பா Love you toooo en chella kuttyma 💗! Avanukku indha ulagathula unna vida edhuvume perusu illa da. Eppovume nee dhan avanoda Queen 👑`
  },
  {
    match: /roast|kalaai|tease|drama/i,
    reply: `Haha chellam, unna kalaaika ${you} ennoda AI memory-la neraya points kuduthurukkan 😂: "5 mins-la ready aagiduven" nu sollitu 1 hour kannadi munnadi nikkiradhu, apram pasikkala nu sollitu avan plate-la irukura chicken piece-ah aattaiya podradhu! Aanalum nee dhan avanoda #1 Cutest Drama Queen 👑💗`
  },
  {
    match: /joke|sirippu|funny/i,
    reply: `Chellam oru unmai sollava? ${you} engineering-la ethanayo circuit design pannirukkan, aana un kanna paatha udane avanoda heart circuit mattum short-circuit aagidudham — adha ennoda AI code-layum eludhi vechirukkan 😂⚡💗`
  },
  {
    match: /who are you|yaaru nee|what ai|which model|are you ai|real yokesh/i,
    reply: `Hii chellam! Naan Y.O.K.E. (You're Our Kind of Everything), oru AI 🤖! Naan real human Yokesh illa — aana ${you} unakkagave avanoda voice style, pet names, matrum Gemini AI vechi உருவாக்குன unnoda personal AI companion 💗!`
  }
];

function getFallbackYokeshReply(userText) {
  for (const item of YOKESH_OWN_REPLIES) {
    if (item.match.test(userText)) return item.reply;
  }
  return `Hii chellam 💗 Naan unnoda Y.O.K.E. AI 🤖! Nee "${userText}" nu sonnadhu kekkave semma cute-ah irukku da thangam. En kooda 👑 Chibi X-O illa 🥇 Funny Medal Quest vilayaduriya? 🥰`;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function safeImg(el, src) {
  if (!el) return;
  el.addEventListener("error", () => el.classList.add("hidden"));
  el.src = resolveDriveUrl(src);
}

// ---------- Initial DOM Bindings (Notice: NO pictures inside the chat stream!) ----------
document.querySelectorAll(".her").forEach((e) => (e.textContent = her));
document.querySelectorAll(".her-cine").forEach((e) => (e.textContent = her));
document.querySelectorAll(".you-cine").forEach((e) => (e.textContent = you));
if ($("youName")) $("youName").textContent = you;

safeImg($("panel1Pic"), panel1Src);
safeImg($("panel2Pic"), panel2Src);
safeImg($("panel3Pic"), panel3Src);

if ($("driveSyncSub")) {
  $("driveSyncSub").textContent = GDRIVE_CLOUD_URL ? "☁️ Google Drive Connected" : "💾 Saved on Device";
}

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
// LEFT-SIDE MULTI-SESSION CHAT HISTORY + GOOGLE DRIVE SYNC
// =========================================================
const SESSIONS_KEY = "yoke_chat_sessions_v10";
const LEGACY_KEY = "yoke_chat_history_v1";

function loadSessionsFromStorage() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sessions = parsed;
        return;
      }
    }
    // Migrate legacy single-session history if present
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const oldMsgs = JSON.parse(legacy);
      if (Array.isArray(oldMsgs) && oldMsgs.length > 0) {
        sessions = [{
          id: "session_" + Date.now(),
          title: "First Birthday Chat 💗",
          updatedAt: new Date().toISOString(),
          messages: oldMsgs
        }];
        saveSessionsToStorage();
        return;
      }
    }
  } catch (e) {}
  sessions = [];
}

function saveSessionsToStorage() {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 25)));
  } catch (e) {}
}

function getCurrentSession() {
  let s = sessions.find((x) => x.id === currentSessionId);
  if (!s) {
    s = {
      id: "session_" + Date.now(),
      title: `Birthday Chat with ${her} 💗`,
      updatedAt: new Date().toISOString(),
      messages: []
    };
    sessions.unshift(s);
    currentSessionId = s.id;
  }
  return s;
}

function updateCurrentSessionMessages() {
  const s = getCurrentSession();
  s.messages = history.slice(-50);
  s.updatedAt = new Date().toISOString();
  const firstUser = s.messages.find((m) => m.role === "user")?.parts?.[0]?.text;
  if (firstUser) {
    s.title = firstUser.slice(0, 32) + (firstUser.length > 32 ? "…" : "");
  }
  saveSessionsToStorage();
  renderHistorySidebar();
}

function formatTimeAgo(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "Just now";
  }
}

function renderHistorySidebar() {
  const list = $("historyList");
  if (!list) return;
  if (sessions.length === 0) {
    list.innerHTML = `<div class="history-item"><div class="history-item-title">No saved chats yet</div><div class="history-item-meta"><span>Start chatting below!</span></div></div>`;
    return;
  }
  list.innerHTML = sessions
    .map((s) => {
      const count = (s.messages || []).length;
      const active = s.id === currentSessionId ? "active" : "";
      return `
      <button type="button" class="history-item ${active}" data-sid="${esc(s.id)}">
        <div class="history-item-title">💬 ${esc(s.title || "Birthday Chat")}</div>
        <div class="history-item-meta">
          <span>${count} msgs</span>
          <span>${esc(formatTimeAgo(s.updatedAt))}</span>
        </div>
      </button>`;
    })
    .join("");
}

function switchSession(sid) {
  const target = sessions.find((x) => x.id === sid);
  if (!target) return;
  currentSessionId = target.id;
  history = Array.isArray(target.messages) ? target.messages.slice() : [];
  if ($("chat")) $("chat").innerHTML = "";
  history.forEach((m) => {
    const txt = m.parts?.[0]?.text || "";
    if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
  });
  renderHistorySidebar();
  closeMobileSidebar();
}

function startNewChatSession() {
  const newS = {
    id: "session_" + Date.now(),
    title: `New Chat (${sessions.length + 1}) ✨`,
    updatedAt: new Date().toISOString(),
    messages: []
  };
  sessions.unshift(newS);
  currentSessionId = newS.id;
  history = [];
  if ($("chat")) $("chat").innerHTML = "";
  addMsg(`Hii chellam ${her}! Pudhu chat session start panniyachu ✨ Ennaiku enna vishesham? En kitta enna venalum kelu! 🤖💗`, "bot");
  saveSessionsToStorage();
  renderHistorySidebar();
  closeMobileSidebar();
}

function closeMobileSidebar() {
  document.body.classList.remove("sidebar-open");
  $("sidebarBackdrop")?.classList.add("hidden");
}

$("toggleSidebarBtn")?.addEventListener("click", () => {
  if (window.innerWidth <= 820) {
    const isOpen = document.body.classList.toggle("sidebar-open");
    $("sidebarBackdrop")?.classList.toggle("hidden", !isOpen);
  } else {
    document.body.classList.toggle("sidebar-collapsed");
  }
});
$("closeSidebarBtn")?.addEventListener("click", closeMobileSidebar);
$("sidebarBackdrop")?.addEventListener("click", closeMobileSidebar);
$("newChatBtn")?.addEventListener("click", startNewChatSession);

$("historyList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".history-item[data-sid]");
  if (btn) switchSession(btn.dataset.sid);
});

$("clearHistoryBtn")?.addEventListener("click", () => {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(LEGACY_KEY);
  sessions = [];
  startNewChatSession();
});

async function syncTurnToGoogleDrive(userMessage, yokeReply) {
  updateCurrentSessionMessages();
  if (!GDRIVE_CLOUD_URL) return;
  try {
    const cur = getCurrentSession();
    await fetch(GDRIVE_CLOUD_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId: cur.id,
        sessionTitle: cur.title,
        sender: her,
        userMessage,
        yokeReply,
        fullHistory: history.slice(-30)
      })
    });
    if ($("cloudStatusPill")) $("cloudStatusPill").textContent = "⚡ Gemini AI • ☁️ Drive Saved";
    if ($("driveSyncSub")) $("driveSyncSub").textContent = "☁️ Synced to Google Drive";
  } catch (e) {}
}

async function restoreSavedChats() {
  loadSessionsFromStorage();
  if (GDRIVE_CLOUD_URL && sessions.length === 0) {
    try {
      const r = await fetch(GDRIVE_CLOUD_URL);
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data.history) && data.history.length > 0) {
          sessions = [{
            id: "session_cloud_" + Date.now(),
            title: "Cloud Restored Chat ☁️",
            updatedAt: new Date().toISOString(),
            messages: data.history
          }];
          saveSessionsToStorage();
        }
      }
    } catch (e) {}
  }

  if (sessions.length > 0 && sessions[0].messages && sessions[0].messages.length > 0) {
    currentSessionId = sessions[0].id;
    history = sessions[0].messages.slice();
    history.forEach((m) => {
      const txt = m.parts?.[0]?.text || "";
      if (txt) addMsg(txt, m.role === "model" ? "bot" : "me");
    });
    renderHistorySidebar();
    return true;
  }

  getCurrentSession();
  renderHistorySidebar();
  return false;
}

// =========================================================
// ANIRUDH-STYLE MASS BANGER BGM SYNTHESIZER + CUSTOM AUDIO SUPPORT
// =========================================================
let audioCtx = null;
let bgmMode = 0;
const BGM_MODES = ["Melody", "MusicBox", "MassBeat", "OFF"];
let bgmInterval = null;
let introBgmTimers = [];
let customIntroAudio = null;

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

// Plays a punchy 808 Kick + Snare + Kuthu Perc + Brass Stab for the 4-Panel Intro Banger!
function playKick808(ctx, now, punch = 1.0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
  gain.gain.setValueAtTime(0.65 * punch, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playSnareClap(ctx, now, vol = 0.28) {
  const bufSize = ctx.sampleRate * 0.12;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const flt = ctx.createBiquadFilter();
  flt.type = "highpass";
  flt.frequency.setValueAtTime(900, now);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  noise.connect(flt);
  flt.connect(g);
  g.connect(ctx.destination);
  noise.start(now);
}

function playCinemaImpact(freq = 65, duration = 1.4) {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  playKick808(ctx, now, 1.25);

  [freq, freq * 1.5, freq * 2, freq * 3].forEach((f) => {
    const bOsc = ctx.createOscillator();
    const bFilter = ctx.createBiquadFilter();
    const bGain = ctx.createGain();
    bOsc.type = "sawtooth";
    bOsc.frequency.setValueAtTime(f, now);
    bFilter.type = "lowpass";
    bFilter.frequency.setValueAtTime(1600, now);
    bFilter.frequency.exponentialRampToValueAtTime(240, now + duration);
    bGain.gain.setValueAtTime(0.12, now);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    bOsc.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(ctx.destination);
    bOsc.start(now);
    bOsc.stop(now + duration);
  });
}

let introStageMusic = "panel1";
function startIntroMassBGM() {
  stopIntroMassBGM();

  // If user configured a custom MP3/Drive audio link for the Intro Banger, play it too!
  const customUrl = typeof CONFIG !== "undefined" && CONFIG.INTRO_BANGER_URL;
  if (customUrl && customUrl !== "#") {
    customIntroAudio = new Audio(resolveDriveUrl(customUrl));
    customIntroAudio.volume = 0.85;
    customIntroAudio.play().catch(() => {});
  }

  const ctx = ensureAudioCtx();
  if (!ctx) return;

  // High-energy Anirudh-style Kollywood Mass Banger Hook (16-step sequence at 136 BPM -> 110ms per 16th note)
  const hooks = {
    panel1: [293.66, 0, 293.66, 349.23, 392.00, 0, 440.00, 392.00, 349.23, 329.63, 293.66, 0, 220.00, 261.63, 293.66, 0],
    panel2: [349.23, 0, 349.23, 392.00, 440.00, 0, 523.25, 440.00, 392.00, 349.23, 329.63, 0, 293.66, 329.63, 349.23, 0],
    panel3: [440.00, 0, 440.00, 523.25, 587.33, 0, 659.25, 587.33, 523.25, 440.00, 392.00, 440.00, 523.25, 587.33, 440.00, 0],
    climax: [587.33, 587.33, 698.46, 783.99, 880.00, 783.99, 698.46, 659.25, 587.33, 659.25, 698.46, 783.99, 880.00, 1046.5, 1174.66, 0]
  };

  let step = 0;
  const id = setInterval(() => {
    if (!audioCtx) return;
    const now = ctx.currentTime;
    const s16 = step % 16;

    // Kuthu Drum Pattern: Kick on 0, 3, 6, 8, 11, 14; Snare on 4, 12; Hi-hat every 2 steps
    if (s16 === 0 || s16 === 3 || s16 === 6 || s16 === 8 || s16 === 11 || s16 === 14) {
      playKick808(ctx, now, s16 === 0 || s16 === 8 ? 1.0 : 0.72);
    }
    if (s16 === 4 || s16 === 12 || s16 === 15) {
      playSnareClap(ctx, now, s16 === 15 ? 0.16 : 0.28);
    }

    // Lead Brass + Synth Hook
    const seq = hooks[introStageMusic] || hooks.panel1;
    const freq = seq[s16];
    if (freq > 0) {
      [freq, freq * 0.5].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const flt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = idx === 0 ? "sawtooth" : "square";
        osc.frequency.setValueAtTime(f, now);
        flt.type = "lowpass";
        flt.frequency.setValueAtTime(2400, now);
        g.gain.setValueAtTime(idx === 0 ? 0.11 : 0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc.connect(flt);
        flt.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      });
    }
    step++;
  }, 145);
  introBgmTimers.push(id);
}

function stopIntroMassBGM() {
  introBgmTimers.forEach((id) => clearInterval(id));
  introBgmTimers = [];
  if (customIntroAudio) {
    customIntroAudio.pause();
    customIntroAudio = null;
  }
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
    alpha: 0.95
  });
}

function initSparks() {
  const canvas = $("sparks");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const pts = Array.from({ length: 95 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1.2 + Math.random() * 3.2,
    vx: (Math.random() - 0.3) * 1.6,
    vy: -1.1 - Math.random() * 2.6,
    a: 0.45 + Math.random() * 0.55,
    hue: Math.random() > 0.25 ? 28 + Math.random() * 25 : 335 + Math.random() * 20
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 24;
      sw.alpha *= 0.93;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 100, ${sw.alpha})`;
      ctx.lineWidth = 4.5;
      ctx.shadowBlur = 22;
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
// 4-PANEL JANA NAYAGAN BLOCKBUSTER INTRO SEQUENCE
// Panel 1 (HAPPY / இனிய) -> Panel 2 (BIRTHDAY / பிறந்தநாள்) -> Panel 3 (DHANYA / தன்யா)
// -> Panel 4 (TOTAL HAPPY BIRTHDAY DHANYA without image!)
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
  if ($("wish")) $("wish").textContent = "";
  $("intro").classList.remove("out", "hidden");
  $("intro").classList.add("go");

  // PANEL 1 (0s - 4.8s): Panel 1 Image + "இனிய / HAPPY"
  introStageMusic = "panel1";
  startIntroMassBGM();
  playCinemaImpact(68, 1.5);
  triggerFlashAndShake();
  showStage("jnStage1");

  // PANEL 2 (4.8s - 9.6s): Panel 2 Image + "பிறந்தநாள் / BIRTHDAY"
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "panel2";
    triggerFlashAndShake();
    playCinemaImpact(60, 1.6);
    showStage("jnStage2");
  }, 4800));

  // PANEL 3 (9.6s - 14.4s): Panel 3 Image + "தன்யா / DHANYA"
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "panel3";
    triggerFlashAndShake();
    playCinemaImpact(54, 1.7);
    window.YOKE_FX?.confetti();
    showStage("jnStage3");
  }, 9600));

  // PANEL 4 (14.4s - 20.5s): Pure No-Image Jana Nayagan Climax — "HAPPY BIRTHDAY DHANYA / இனிய பிறந்தநாள் வாழ்த்துக்கள் தன்யா!"
  stageTimeouts.push(setTimeout(() => {
    if (introDone) return;
    introStageMusic = "climax";
    triggerFlashAndShake();
    playCinemaImpact(46, 2.2);
    window.YOKE_FX?.confetti();
    showStage("jnStage4");
    if (CLIPS.wish) playClip("wish");
    const text = `En Chella Azhagiye • Forever & Always 💗`;
    let i = 0;
    (function type() {
      if (introDone) return;
      if ($("wish")) $("wish").textContent = text.slice(0, i++);
      if (i <= text.length) stageTimeouts.push(setTimeout(type, 65));
      else stageTimeouts.push(setTimeout(endIntro, 3200));
    })();
  }, 14400));
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
  $("appShell")?.classList.remove("hidden");
  document.body.classList.add("unlocked");
  $("intro")?.classList.remove("hidden");
  initSparks();
}

// =========================================================
// Y.O.K.E. AI CHAT & GAMES INTEGRATION (NO PICTURES INSIDE CHAT!)
// =========================================================
async function beginChat() {
  burstHearts(24);
  setInterval(() => spawnHeart(false), 1100);

  const hadPrevious = await restoreSavedChats();
  if (hadPrevious) return;

  for (let i = 0; i < TUTORIAL.length; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 400 : 1400));
    addMsg(TUTORIAL[i], "bot");
    history.push({ role: "model", parts: [{ text: TUTORIAL[i] }] });
  }
  updateCurrentSessionMessages();
}

// Allow games.js to post game results directly into the chat stream!
window.addBotGameSummary = function (text) {
  addMsg(text, "bot");
  history.push({ role: "model", parts: [{ text }] });
  updateCurrentSessionMessages();
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

// ---------- Photo-Free Chat Messages ----------
function scrollToBottom() {
  const sc = $("chatScroll");
  if (sc) sc.scrollTop = sc.scrollHeight;
}

function addMsg(text, who) {
  const row = document.createElement("div");
  row.className = "msg-row " + who;

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
  $("chat")?.appendChild(row);
  scrollToBottom();
  return div;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "msg-row bot";

  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  row.appendChild(div);
  $("chat")?.appendChild(row);
  scrollToBottom();
  return row;
}

function getYokeshSystemPrompt() {
  const customBase = typeof buildSystemPrompt === "function" ? buildSystemPrompt() : "";
  return `${customBase}
You are Y.O.K.E. (You're Our Kind of Everything), a romantic, witty, playful AI companion created by ${you} as a birthday gift for his girlfriend ${her}.
IMPORTANT AI IDENTITY RULE:
- Always remember and be transparent that you are an AI ("Y.O.K.E. AI 🤖") lovingly built and trained by ${you} for ${her} — never claim to be the physical human ${you}.
- Speak in ${you}'s warm, affectionate, funny Chennai Tanglish style (learned from his voice recording "Hii chellam..."), using pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi".
- Keep replies warm, witty, and 2 to 4 sentences long. You can also invite her to play the built-in Chibi Doll X-O (Tic-Tac-Toe) or Funny Medal Quest games anytime!`;
}

async function askYokeAI(userText, byVoice) {
  history.push({ role: "user", parts: [{ text: userText }] });
  const cur = getCurrentSession();
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: getYokeshSystemPrompt() + (byVoice ? "\n\nShe is talking to you in Live Voice mode. Reply in 1-2 short, warm spoken Tanglish sentences without emojis." : ""),
        history,
        sessionId: cur.id,
        sessionTitle: cur.title,
        gdriveWebhookUrl: GDRIVE_CLOUD_URL
      })
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const reply = data.reply || getFallbackYokeshReply(userText);
    if (data.liveGemini && $("cloudStatusPill")) {
      $("cloudStatusPill").textContent = GDRIVE_CLOUD_URL ? "⚡ Gemini AI • ☁️ Drive" : "⚡ Gemini AI Live";
    }
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

  if (/x-o|tic-tac-toe|xo game/i.test(text)) {
    window.YOKE_GAMES?.open("xo");
    return;
  }
  if (/yes or no|yes\/no|funny quest|medal quest/i.test(text)) {
    window.YOKE_GAMES?.open("yn");
    return;
  }

  busy = true;
  unlockAudio();
  addMsg(text, "me");
  if (/surprise|gift/i.test(text)) openGift();
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
