import express from "express";
import dotenv from "dotenv";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

dotenv.config();

const execFileAsync = promisify(execFile);
const app = express();
const port = process.env.PORT || 8787;

app.use(express.json());
app.use(express.static("public"));

function extractAssistantTextFromLine(lineObj) {
  if (lineObj?.type !== "message") return "";
  const msg = lineObj.message;
  if (msg?.role !== "assistant") return "";

  const content = Array.isArray(msg.content) ? msg.content : [];
  const chunks = [];
  for (const item of content) {
    if (item?.type === "text" && item.text) chunks.push(item.text);
  }

  return chunks.join("\n").trim();
}

function readAssistantAfter(sessionId, sinceTsMs) {
  const transcriptPath = path.join(
    os.homedir(),
    ".openclaw",
    "agents",
    "main",
    "sessions",
    `${sessionId}.jsonl`
  );

  if (!fs.existsSync(transcriptPath)) return "";

  const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
  let latest = "";

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const ts = obj?.message?.timestamp ?? Date.parse(obj?.timestamp || "0");
      if (!Number.isFinite(ts) || ts < sinceTsMs) continue;

      const text = extractAssistantTextFromLine(obj);
      if (text) latest = text;
    } catch {
      // ignore malformed line
    }
  }

  return latest;
}

async function resolveSessionId() {
  if (process.env.OPENCLAW_SESSION_ID) return process.env.OPENCLAW_SESSION_ID;

  const { stdout } = await execFileAsync("openclaw", ["sessions", "--json", "--active", "1440"]);
  const parsed = JSON.parse(stdout);

  const sessions = Array.isArray(parsed) ? parsed : parsed.sessions || [];
  const preferred = sessions.find((s) => s.key === "agent:main:main") || sessions[0];

  if (!preferred?.sessionId) {
    throw new Error("No active OpenClaw session found. Set OPENCLAW_SESSION_ID in .env");
  }

  return preferred.sessionId;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/config", async (_req, res) => {
  try {
    const sessionId = await resolveSessionId();
    res.json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  }
});

app.post("/talk", async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Missing text" });

    const sessionId = String(req.body?.sessionId || (await resolveSessionId()));
    const startedAt = Date.now();

    await execFileAsync("openclaw", [
      "agent",
      "--session-id",
      sessionId,
      "--message",
      text,
    ]);

    const assistantText = readAssistantAfter(sessionId, startedAt) || "(No assistant text found)";

    res.json({ sessionId, assistantText });
  } catch (error) {
    res.status(500).json({ error: String(error.message || error) });
  }
});

app.listen(port, () => {
  console.log(`OpenClaw Voice Bridge listening at http://localhost:${port}`);
});
