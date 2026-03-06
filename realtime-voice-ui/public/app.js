const $ = (id) => document.getElementById(id);

const modelInput = $("model");
const voiceInput = $("voice");
const instructionsInput = $("instructions");
const vadInput = $("vad");
const connectBtn = $("connectBtn");
const disconnectBtn = $("disconnectBtn");
const pttBtn = $("pttBtn");
const statusEl = $("status");
const logsEl = $("logs");
const transcriptEl = $("transcript");

let pc;
let dc;
let localStream;
let micTrack;
let isConnected = false;
let assistantBuffer = "";

function setStatus(text) {
  statusEl.textContent = text;
}

function log(message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;
  logsEl.textContent = `${line}\n${logsEl.textContent}`;
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = `${role === "user" ? "🧑" : "🤖"} ${text}`;
  transcriptEl.prepend(div);
}

function setUiConnected(connected) {
  isConnected = connected;
  connectBtn.disabled = connected;
  disconnectBtn.disabled = !connected;
  pttBtn.disabled = !connected || vadInput.checked;
}

function setMicEnabled(enabled) {
  if (micTrack) micTrack.enabled = enabled;
}

async function getEphemeralSession() {
  const res = await fetch("/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelInput.value.trim(),
      voice: voiceInput.value.trim(),
      instructions: instructionsInput.value.trim(),
      vad: vadInput.checked,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Session request failed");
  }

  const clientSecret = data.client_secret?.value;
  if (!clientSecret) throw new Error("Missing client_secret from session response");
  return clientSecret;
}

async function connect() {
  try {
    setStatus("Connecting...");
    log("Requesting ephemeral session...");

    const ephemeralKey = await getEphemeralSession();

    pc = new RTCPeerConnection();

    const remoteAudio = document.createElement("audio");
    remoteAudio.autoplay = true;

    pc.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
      log("Remote audio track received");
    };

    dc = pc.createDataChannel("oai-events");
    dc.onopen = () => {
      log("Data channel opened");
      setStatus("Connected");
    };
    dc.onmessage = (event) => handleRealtimeEvent(event.data);
    dc.onerror = (e) => log(`Data channel error: ${e.message || "unknown"}`);

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micTrack = localStream.getAudioTracks()[0];
    pc.addTrack(micTrack, localStream);

    if (!vadInput.checked) setMicEnabled(false);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    log("Sending SDP offer...");
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(modelInput.value.trim())}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp",
      },
    });

    const answerSdp = await sdpResponse.text();
    if (!sdpResponse.ok) throw new Error(`SDP error: ${answerSdp}`);

    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      log(`Peer connection: ${state}`);
      if (["disconnected", "failed", "closed"].includes(state)) {
        disconnect();
      }
    };

    setUiConnected(true);
    log("Connected to Realtime API");
  } catch (err) {
    log(`Connect failed: ${err.message}`);
    setStatus("Connection failed");
    disconnect();
  }
}

function sendEvent(event) {
  if (dc?.readyState === "open") {
    dc.send(JSON.stringify(event));
  }
}

function handleRealtimeEvent(raw) {
  try {
    const event = JSON.parse(raw);

    switch (event.type) {
      case "conversation.item.input_audio_transcription.completed": {
        const text = event.transcript?.trim();
        if (text) addMessage("user", text);
        break;
      }
      case "response.audio_transcript.delta":
      case "response.output_text.delta": {
        assistantBuffer += event.delta || "";
        break;
      }
      case "response.done": {
        const finalText = assistantBuffer.trim();
        if (finalText) addMessage("assistant", finalText);
        assistantBuffer = "";
        break;
      }
      case "error": {
        log(`Realtime error: ${JSON.stringify(event.error || event)}`);
        break;
      }
      default:
        break;
    }
  } catch {
    // ignore non-json frames
  }
}

function disconnect() {
  if (dc) {
    try {
      dc.close();
    } catch {}
  }

  if (pc) {
    try {
      pc.close();
    } catch {}
  }

  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
  }

  dc = null;
  pc = null;
  localStream = null;
  micTrack = null;
  assistantBuffer = "";

  setUiConnected(false);
  setStatus("Idle");
  log("Disconnected");
}

connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);

vadInput.addEventListener("change", () => {
  pttBtn.disabled = !isConnected || vadInput.checked;
  if (!vadInput.checked) {
    setMicEnabled(false);
    log("Push-to-talk mode enabled");
  } else {
    setMicEnabled(true);
    log("Auto VAD mode enabled");
  }
});

["mousedown", "touchstart"].forEach((evt) =>
  pttBtn.addEventListener(evt, () => {
    if (!vadInput.checked) {
      setMicEnabled(true);
      setStatus("Listening (PTT)...");
    }
  })
);

["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) =>
  pttBtn.addEventListener(evt, () => {
    if (!vadInput.checked) {
      setMicEnabled(false);
      setStatus("Connected");

      sendEvent({ type: "input_audio_buffer.commit" });
      sendEvent({ type: "response.create" });
    }
  })
);
