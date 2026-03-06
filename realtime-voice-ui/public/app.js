const $ = (id) => document.getElementById(id);

const listenBtn = $("listenBtn");
const stopBtn = $("stopBtn");
const sendBtn = $("sendBtn");
const manualInput = $("manualInput");
const statusEl = $("status");
const transcriptEl = $("transcript");
const logsEl = $("logs");
const autoSpeak = $("autoSpeak");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let sessionId = null;
let active = false;

function log(text) {
  logsEl.textContent = `[${new Date().toLocaleTimeString()}] ${text}\n${logsEl.textContent}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function addMsg(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = `${role === "user" ? "🧑" : "🤖"} ${text}`;
  transcriptEl.prepend(div);
}

async function ensureConfig() {
  if (sessionId) return;
  const res = await fetch("/config");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load config");
  sessionId = data.sessionId;
  log(`Session connected: ${sessionId}`);
}

async function sendText(text) {
  const clean = String(text || "").trim();
  if (!clean) return;

  await ensureConfig();
  addMsg("user", clean);
  setStatus("Thinking...");

  const res = await fetch("/talk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: clean, sessionId }),
  });

  const data = await res.json();
  if (!res.ok) {
    log(`Error: ${data.error || "unknown"}`);
    setStatus("Error");
    return;
  }

  addMsg("assistant", data.assistantText);
  setStatus("Ready");

  if (autoSpeak.checked) {
    const u = new SpeechSynthesisUtterance(data.assistantText);
    u.lang = "tr-TR";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

function initRecognition() {
  if (!SpeechRecognition) {
    log("SpeechRecognition not supported in this browser");
    listenBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "tr-TR";
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalBuffer = "";

  recognition.onstart = () => {
    active = true;
    listenBtn.disabled = true;
    stopBtn.disabled = false;
    setStatus("Listening...");
    log("Mic started");
  };

  recognition.onend = () => {
    active = false;
    listenBtn.disabled = false;
    stopBtn.disabled = true;
    setStatus("Idle");
    log("Mic stopped");
  };

  recognition.onerror = (e) => {
    log(`Speech error: ${e.error}`);
  };

  recognition.onresult = async (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalBuffer += `${t} `;
      else interim += t;
    }

    setStatus(interim ? `Listening: ${interim}` : "Listening...");

    const sentenceDone = /[.!?]\s*$/.test(finalBuffer.trim()) || finalBuffer.trim().length > 60;
    if (sentenceDone) {
      const toSend = finalBuffer.trim();
      finalBuffer = "";
      recognition.stop();
      await sendText(toSend);
      if (!active) {
        setTimeout(() => recognition.start(), 350);
      }
    }
  };
}

listenBtn.addEventListener("click", async () => {
  try {
    await ensureConfig();
    recognition?.start();
  } catch (e) {
    log(e.message);
  }
});

stopBtn.addEventListener("click", () => recognition?.stop());

sendBtn.addEventListener("click", async () => {
  const text = manualInput.value;
  manualInput.value = "";
  await sendText(text);
});

manualInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

initRecognition();
setStatus("Idle");
