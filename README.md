# Y.O.K.E. 💛
**You're Our Kind of Everything** — a Tanglish birthday AI for Dhanya.

## Files
- `config.js`  — the ONLY file you edit (key, name, song, videos, memories, sample texts)
- `index.html`, `style.css`, `app.js` — the website
- `images/` — put your cartoon pics here (`dhanya.png`, `me.png`, `us.png`)

## Setup
1. Get a free Gemini API key: https://aistudio.google.com/apikey
2. Paste it in `config.js` → `GEMINI_API_KEY`
3. Fill in `YOUR_NAME`, `SONG`, `VIDEOS`, `MEMORIES`, `SAMPLE_TEXTS`
4. Add cartoon pics to `images/`
5. Test: set `UNLOCK_AT` to a past date, open `index.html` in a browser
6. Before gifting, set `UNLOCK_AT` back to `2026-11-07T00:00:00+05:30`

## Deploy free (GitHub Pages)
1. Create a GitHub repo, upload all files
2. Settings → Pages → Branch: `main` → Save
3. Your link: `https://<username>.github.io/<repo>/`

## Key safety
The key sits in the browser code, so anyone with the link could copy it.
In Google Cloud Console → Credentials, restrict the key to your GitHub Pages URL
(HTTP referrer) and to the Generative Language API. Use a repo with a key made only for this.
