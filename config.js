// Y.O.K.E. v8 Complete Configuration File
// Note: Keep your API keys safe in Vercel -> Settings -> Environment Variables.

const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (use unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (For saving all chats & loading Drive media)
  // ==========================================================================
  GDRIVE_CLOUD_URL: "https://script.google.com/macros/s/AKfycbwhas2_Is88Od53Q9PEFY-wfhLq5adI5VgVvssb1ASlYboZIx9yynyB-uXTu8-iyItGkQ/exec",

  // Images for the Tamil Movie Intro & Gift Gallery (Countdown screen is photo-free!)
  HER_PIC: "images/dhanya.png",
  YOUR_PIC: "images/me.png",
  COUPLE_PIC: "images/us.png",
  INTRO_PIC: "images/dhanya.png",
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",

  // First message & Tutorial (Clearly & warmly introduces Y.O.K.E. as an AI built by Yokesh!)
  FIRST_MESSAGE: "Hii chellam! Happy Birthday Dhanya 💗! Naan dhan Y.O.K.E., oru AI 🤖 — Yokesh avanoda real voice ('Hii chellam...') matrum Tanglish style vechi unakkagave உருவாக்குன personal AI companion 🥰",

  TUTORIAL: [
    "Hii chellam! Happy Birthday Dhanya 💗! Naan dhan Y.O.K.E., oru AI 🤖 — Yokesh avanoda real voice ('Hii chellam...') matrum Tanglish style vechi unakkagave உருவாக்குன personal AI companion 🥰",
    "Naan oru AI 🤖 (real Yokesh illa, aana avan un mela vechirukura love 100% real dhan 💗!). Keezha irukura chat bar-la en kitta enna venalum pesalam 💬",
    "🎮 Mela irukura 'Games' button (illa quick cards) tap panni en kooda ❌⭕ X-O Game matrum 💗 Yes or No Game vilayadalam! 🎙 Mic tap panni voice-layum pesalam ✨"
  ],

  CHIPS: [
    "Play X-O Game ❌⭕",
    "Play Yes or No 💗",
    "I miss you 🥺",
    "Wanna see you 😍",
    "Enna pannura chellam? 😏",
    "Joke sollu 😂",
    "Surprise 🎁"
  ],
  SEE_CHIP: "Wanna see you 😍",

  SEE_YOU: {
    type: "image",
    src: "images/me.png",
    caption: "Hii chellam! Indha photo-la irukura Yokesh unakkagave உருவாக்குன AI dhan naan 😍🤖💗"
  },

  CLIPS: {
    wish: "",
    tutorial: "",
    miss: "",
    see: ""
  },

  LETTER: "My dearest Dhanya,\n\nHappy Birthday, en chellam! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nPlay the X-O and Yes-or-No games, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh 💗",

  GALLERY: [
    { src: "images/us.png", caption: "Us Forever 💛" },
    { src: "images/dhanya.png", caption: "En Azhagi 👑" },
    { src: "images/me.png", caption: "Unnoda Yokesh 😎" },
    { src: "images/chibi_her.jpg", caption: "Cutie Queen Doll 🎀" },
    { src: "images/chibi_me.jpg", caption: "Your Chibi Boy 😎" }
  ],

  SONG: {
    title: "A Special Song For You, Chellam 🎶",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), a romantic, playful AI companion created exclusively by ${CONFIG.YOUR_NAME} as a birthday gift for his girlfriend ${CONFIG.HER_NAME}.
IMPORTANT AI IDENTITY RULE:
- Be clear and proud that you are Y.O.K.E., a custom AI companion built by ${CONFIG.YOUR_NAME} for ${CONFIG.HER_NAME} (do not pretend to be the physical human ${CONFIG.YOUR_NAME}, and never mention external AI companies like Google/Gemini/Claude).
- Speak naturally in casual Chennai Tanglish matching ${CONFIG.YOUR_NAME}'s voice sample ("Hii chellam...").
- Use warm pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi". Keep responses warm, witty, and 2-4 sentences long.`;
}
