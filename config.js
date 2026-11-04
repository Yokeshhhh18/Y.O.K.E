// Y.O.K.E. v10 Complete Configuration File
// Note: Your GEMINI_API_KEY in Vercel -> Settings -> Environment Variables is automatically used by /api/chat and /api/tts!

const CONFIG = {
  HER_NAME: "Dhanya",
  YOUR_NAME: "Yokesh",

  // Unlocks at midnight on Saturday, Nov 7, 2026 IST (use unlock() in browser console to test anytime)
  UNLOCK_AT: "2026-11-07T00:00:00+05:30",

  // ==========================================================================
  // GOOGLE DRIVE CLOUD STORAGE (Paste your Google Apps Script Web App URL here)
  // ==========================================================================
  GDRIVE_CLOUD_URL: "",

  // Optional: If you want an additional custom MP3/Drive audio track to play during the 4-panel intro along with the built-in Anirudh-style Kuthu Banger synth, paste its URL here:
  INTRO_BANGER_URL: "",

  // 4-Panel Jana Nayagan Intro Images (in exact order: Panel 1 -> Panel 2 -> Panel 3)
  PANEL_1_PIC: "images/panel_1.jpg",
  PANEL_2_PIC: "images/panel_2.jpg",
  PANEL_3_PIC: "images/panel_3.jpg",

  // 3D Chibi Doll Game Icons & Medal Award Ceremony Card
  XO_HER_ICON: "images/xo_her.png",
  XO_ME_ICON: "images/xo_me.png",
  MEDAL_AWARD_PIC: "images/medal_award.jpg",

  // Gift Gallery Images (No pictures are shown inside the chat stream!)
  HER_PIC: "images/dhanya.png",
  YOUR_PIC: "images/me.png",
  COUPLE_PIC: "images/us.png",

  TUTORIAL: [
    "Hii chellam! இனிய பிறந்தநாள் வாழ்த்துக்கள் Dhanya! Happy Birthday 💗! Naan dhan Y.O.K.E., oru AI 🤖 — Yokesh avanoda real voice ('Hii chellam...') matrum Gemini AI brain vechi unakkagave உருவாக்குன personal AI companion 🥰",
    "Left side-la irukura '☰ History' tab-la namma pesura ellame save aagum (Google Drive-layum automatic-ah sync aagum ☁️!).",
    "🎮 Mela irukura 'Games' button tap panni namma 3D Chibi Dolls vechi 👑 X-O Game vilayadalam, apram 🥇 Funny Quest mudichi Yokesh kitta irundhu Gold Medal-um vaangalam! ✨"
  ],

  CHIPS: [
    "Play X-O Game ❌⭕",
    "Play Yes or No 💗",
    "I miss you 🥺",
    "Enna pannura chellam? 😏",
    "Roast me playfully 😜",
    "Joke sollu 😂",
    "Surprise 🎁"
  ],

  CLIPS: {
    wish: "",
    tutorial: "",
    miss: ""
  },

  LETTER: "My dearest Dhanya,\n\nஇனிய பிறந்தநாள் வாழ்த்துக்கள் செல்லம்! Happy Birthday! I built this entire AI world — Y.O.K.E. — just so you always have a fun, loving digital companion trained on my voice and style whenever you miss me.\n\nPlay the Chibi X-O and Funny Medal Quest games, listen to the music, and remember that wherever life takes us, you're my kind of everything.\n\nAlways & forever yours,\nYokesh 💗",

  GALLERY: [
    { src: "images/panel_1.jpg", caption: "Happy ✨" },
    { src: "images/panel_2.jpg", caption: "Birthday 👑" },
    { src: "images/panel_3.jpg", caption: "Dhanya 💗" },
    { src: "images/chibi_her.jpg", caption: "Cutie Queen Doll 🎀" },
    { src: "images/chibi_me.jpg", caption: "Your Chibi Boy 😎" },
    { src: "images/medal_award.jpg", caption: "Gold Medal Winner 🥇" }
  ],

  SONG: {
    title: "A Special Song For You, Chellam 🎶",
    url: "#"
  },
  VIDEOS: []
};

function buildSystemPrompt() {
  return `You are Y.O.K.E. (You're Our Kind of Everything), a romantic, witty, playful AI companion created exclusively by ${CONFIG.YOUR_NAME} as a birthday gift for his girlfriend ${CONFIG.HER_NAME}.
IMPORTANT AI IDENTITY RULE:
- Be clear and proud that you are Y.O.K.E., a custom AI companion built by ${CONFIG.YOUR_NAME} for ${CONFIG.HER_NAME} (do not pretend to be the physical human ${CONFIG.YOUR_NAME}).
- Speak naturally in casual Chennai Tanglish matching ${CONFIG.YOUR_NAME}'s voice sample ("Hii chellam...").
- Use warm pet names like "chellam", "thangam", "kuttyma", "da", and "en azhagi". Keep responses warm, funny, and 2-4 sentences long.`;
}
