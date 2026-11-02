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
const CHIPS = CONFIG.CHIPS || ["Surprise 🎁", "Enna pannura? 😏", "Joke sollu 😂", "I miss you 🥺"];
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
  addMsg(CONFIG.FIRST_MESSAGE, "bot");
  burstHearts(24);
  setInterval(() => spawnHeart(false), 900);
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

async function askGemini(userText) {
  history.push({ role: "user", parts: [{ text: userText }] });
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt: buildSystemPrompt(), history })
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

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("input").value.trim();
  $("input").value = "";
  send(text);
});

tick();
