# Antonio Voice Bridge (same OpenClaw session)

This app lets you talk by voice to the **same session** you are using now.

- 🎤 Speech input: Browser Web Speech API (no API key)
- 🧠 Assistant brain: `openclaw agent --session-id ...`
- 🔊 Speech output: Browser `speechSynthesis` (no API key)

## Why no API key?

This bridge does **not** use OpenAI Realtime API directly.
It talks to your local OpenClaw runtime via CLI.

## Setup

```bash
cd realtime-voice-ui
npm install
cp .env.example .env
npm run dev
```

Open: `http://localhost:8787`

## Optional .env

```env
PORT=8787
# Optional: lock to a specific active session
# OPENCLAW_SESSION_ID=6979e7da-d120-442c-91b4-ce1f6aee1510
```

If `OPENCLAW_SESSION_ID` is missing, server auto-picks the latest active `agent:main:main` session.

## Notes

- Best browser support: Chrome / Edge (SpeechRecognition)
- TTS voice quality depends on OS/browser voice packs
- If session resolution fails, set `OPENCLAW_SESSION_ID` manually in `.env`
