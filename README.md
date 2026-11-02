# Y.O.K.E. 💛
**You're Our Kind of Everything** — a Tanglish birthday AI for Dhanya.

## Files
- `config.js` — your personal details (name, song, videos, memories, sample texts). **No API key in here.**
- `api/chat.js` — Vercel server function that talks to Gemini using a secret key
- `index.html`, `style.css`, `app.js` — the website
- `images/` — cartoon pics (`dhanya.png`, `me.png`, `us.png`)

## Why the key must NOT be on GitHub
GitHub scans public repos for API keys and tells Google, which disables the key
automatically. So the key lives only in Vercel's settings.

## Setup (Vercel)
1. Make a NEW key at https://aistudio.google.com/apikey (the old one is already disabled)
2. Vercel -> your project -> Settings -> Environment Variables
   - Name: `GEMINI_API_KEY`   Value: your key   Environments: Production (+ Preview)
3. Deployments -> latest -> ... -> Redeploy (env vars apply only to new deployments)
4. In `config.js`, delete the `GEMINI_API_KEY` line.

## Optional extras in config.js
```js
CHIPS: ["Surprise 🎁", "Joke sollu 😂"],
LETTER: "Dhanya,\n\nYour own birthday letter here...\n\n- Your name",
GALLERY: [{ src: "images/us.png", caption: "Us 💛" }],
```

## Testing
Open your Vercel link, press Ctrl+Shift+J, type `unlock()` and press Enter.
(The chat only works on the Vercel link, not by opening index.html from your computer.)
Before gifting, make sure `UNLOCK_AT` is `2026-11-07T00:00:00+05:30`.
