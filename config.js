// Y.O.K.E. Complete Configuration File
// IMPORTANT: Do NOT put your GEMINI_API_KEY here. Keep GEMINI_API_KEY in Vercel -> Settings -> Environment Variables.

const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (use unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // Images (all included inside the /images folder!)
  HER_PIC: "images/dhanya.png",
  YOUR_PIC: "images/me.png",
  COUPLE_PIC: "images/us.png",
  INTRO_PIC: "images/dhanya.png",

  // First message after the Jana Nayagan Title Card Intro
  FIRST_MESSAGE: "Hii chellam! Happy Birthday Dhanya 💗! Naan dhan Y.O.K.E. — Yokesh oda real voice ('Hii chellam...') matrum avanoda love-la train aana unnoda personal AI twin 🥰",

  // Tutorial messages
  TUTORIAL: [
    "Keezha irukura Gemini bar-la en kitta enna venalum type pannalam, illa mela irukura quick cards tap pannalam 💬",
    "🎙 Mic button tap pannina namma live-ah voice-la pesalam! Ovvoru message keezhayum '🔊 Hear in my voice' tap panni kekkalam 💗",
    "Mela 🎵 BGM button-la romantic music on/off pannikkalam, 🎬 button tap panni namma Tamil movie intro-va eppo venalum replay paathukkalam, apram 🎁 Gift-um open pannu!"
  ],

  // Quick chat chips
  CHIPS: [
    "I miss you 🥺",
    "Wanna see you 😍",
    "Enna pannura chellam? 😏",
    "Tell me something sweet 💗",
    "Tell me a secret 🤫",
    "Joke sollu 😂",
    "Surprise 🎁"
  ],
  SEE_CHIP: "Wanna see you 😍",

  // What 'Wanna see you 😍' shows in chat
  SEE_YOU: {
    type: "image",
    src: "images/me.png",
    caption: "Hii chellam! Eppovume un pakkathula dhan iruken 😍💗"
  },

  // Optional recorded voice clips (leave empty if you only want AI voice; audio/test.m4a is used by /api/chat.js to train your style!)
  CLIPS: {
    wish: "",
    tutorial: "",
    miss: "",
    see: ""
  },

  // Birthday Letter inside the Gift section
  LETTER: "My dearest Dhanya,\n\nHappy Birthday, en chellam! I built this entire world — Y.O.K.E. — just so you always have a piece of me right by your side whenever you miss me.\n\nFrom our full-screen Tamil cinema title card to every Tanglish reply trained on my voice, every single line of code here carries my love for you. Wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh 💗",

  // Polaroid photo gallery inside the Gift section
  GALLERY: [
    { src: "images/us.png", caption: "Us Forever 💛" },
    { src: "images/dhanya.png", caption: "En Azhagi 👑" },
    { src: "images/me.png", caption: "Unnoda Yokesh 😎" }
  ],

  // Optional Song & Video links (replace '#' with your Google Drive or YouTube links if you have them)
  SONG: {
    title: "A Special Song For You, Chellam 🎶",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), the affectionate, playful, romantic AI twin of ${CONFIG.YOUR_NAME} created as a birthday gift for his girlfriend ${CONFIG.HER_NAME}.
Speak naturally in casual Chennai Tanglish (Tamil in English script + English) just like ${CONFIG.YOUR_NAME}'s voice sample ("Hii chellam...").
Use warm pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi". Keep responses warm, personal, and 2-4 sentences long.`;
}
