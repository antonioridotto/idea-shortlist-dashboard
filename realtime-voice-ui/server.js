import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in server environment",
      });
    }

    const {
      model = "gpt-4o-realtime-preview-2024-12-17",
      voice = "alloy",
      instructions = "You are a helpful assistant speaking naturally.",
      vad = true,
    } = req.body || {};

    const sessionResponse = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        instructions,
        input_audio_transcription: {
          model: "gpt-4o-mini-transcribe",
        },
        turn_detection: vad
          ? {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
              create_response: true,
            }
          : null,
      }),
    });

    const data = await sessionResponse.json();
    if (!sessionResponse.ok) {
      return res.status(sessionResponse.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error("/session error:", error);
    return res.status(500).json({ error: "Failed to create realtime session" });
  }
});

app.listen(port, () => {
  console.log(`Realtime Voice UI listening at http://localhost:${port}`);
});
