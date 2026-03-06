# Realtime Voice UI

Simple web interface for continuous, spoken conversation using OpenAI Realtime API.

## Features

- Connect / disconnect with one click
- Continuous voice chat (auto VAD)
- Push-to-talk mode (manual control)
- Live transcript panel (user + assistant)
- Model + voice + instructions configuration
- Secure ephemeral key flow (`OPENAI_API_KEY` stays on server)

## Setup

```bash
cd realtime-voice-ui
npm install
cp .env.example .env
# add OPENAI_API_KEY in .env
npm run dev
```

Open: `http://localhost:8787`

## Environment

Create `.env`:

```env
OPENAI_API_KEY=sk-...
PORT=8787
```

## Security notes

- **Do not** expose your long-lived OpenAI API key in browser code.
- Browser asks local server `/session` for short-lived client secret.
- Server uses your real key only for calling `POST /v1/realtime/sessions`.

## How it works

1. Browser requests ephemeral token from local server.
2. Browser captures mic audio (`getUserMedia`) and creates WebRTC offer.
3. Browser sends SDP offer to OpenAI Realtime endpoint with ephemeral token.
4. OpenAI returns SDP answer; audio + data channel become active.
5. UI renders transcriptions and streamed assistant responses.

## Notes

- Requires a modern browser (Chrome/Safari/Edge latest).
- If OpenAI API shapes change, update event types in `public/app.js`.
