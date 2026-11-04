// Y.O.K.E. Complete Configuration File
// Note: Keep your API keys safe in Vercel -> Settings -> Environment Variables.

const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (use unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (For saving all chats & loading Drive media)
  // ==========================================================================
  // Paste your Google Apps Script Web App URL here (see GOOGLE_DRIVE_SETUP.gs)
  // Every chat Dhanya sends will automatically save to your Google Drive folder!
  GDRIVE_CLOUD_URL: "",

  // Images (can be local paths like "images/dhanya.png" OR any Google Drive share link!)
  HER_PIC: "images/dhanya.png",
  YOUR_PIC: "images/me.png",
  COUPLE_PIC: "images/us.png",
  INTRO_PIC: "images/dhanya.png",

  // First message after the Tamil Movie Title Card Intro
  FIRST_MESSAGE: "Hii chellam! Happy Birthday Dhanya 💗! Naan dhan Y.O.K.E. — Yokesh oda real voice ('Hii chellam...') matrum avanoda love-la train aana unnoda personal AI twin 🥰",

  // Tutorial messages (Zero mention of any external AI brand!)
  TUTORIAL: [
    "Keezha irukura chat bar-la en kitta enna venalum type pannalam, illa mela irukura quick cards tap pannalam 💬",
    "🎙 Mic button tap pannina namma live-ah voice-la pesalam! Ovvoru message keezhayum '🔊 Hear in my voice' tap panni ennoda voice-la kekkalam 💗",
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

  // What 'Wanna see you 😍' shows in chat (supports local image/video OR Google Drive link)
  SEE_YOU: {
    type: "image",
    src: "images/me.png",
    caption: "Hii chellam! Eppovume un pakkathula dhan iruken 😍💗"
  },

  // Optional recorded voice clips (can be local "audio/..." or Google Drive links)
  CLIPS: {
    wish: "",
    tutorial: "",
    miss: "",
    see: ""
  },

  // Birthday Letter inside the Gift section
  LETTER: "My dearest Dhanya,\n\nHappy Birthday, en chellam! I built this entire world — Y.O.K.E. — just so you always have a piece of me right by your side whenever you miss me.\n\nFrom our full-screen Tamil cinema title card to every Tanglish reply trained on my voice, every single line of code here carries my love for you. Wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh 💗",

  // Polaroid photo gallery inside the Gift section (supports local images or Google Drive share links)
  GALLERY: [
    { src: "images/us.png", caption: "Us Forever 💛" },
    { src: "images/dhanya.png", caption: "En Azhagi 👑" },
    { src: "images/me.png", caption: "Unnoda Yokesh 😎" }
  ],

  // Song & Video links (paste any Google Drive share link or YouTube link)
  SONG: {
    title: "A Special Song For You, Chellam 🎶",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), the affectionate, playful, romantic twin of ${CONFIG.YOUR_NAME} created exclusively as a birthday gift for his girlfriend ${CONFIG.HER_NAME}.
STRICT IDENTITY RULE: Never mention Google, Gemini, Claude, OpenAI, or any AI company/model name under any circumstance. If asked who or what you are, say you are Y.O.K.E. — ${CONFIG.YOUR_NAME}'s digital heart and voice built from scratch just for ${CONFIG.HER_NAME}.
Speak naturally in casual Chennai Tanglish (Tamil in English script + English) matching ${CONFIG.YOUR_NAME}'s voice sample ("Hii chellam...").
Use warm pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi". Keep responses warm, personal, and 2-4 sentences long.`;
}
