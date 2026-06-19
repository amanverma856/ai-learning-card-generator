require("dotenv").config();
const WebSocket = require("ws");
const { generateCards } = require("./cardGenerator");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (rawMessage) => {
    let parsed;

    // Parse incoming message safely
    try {
      parsed = JSON.parse(rawMessage.toString());
    } catch {
      sendMessage(ws, { type: "error", index: -1, message: "Invalid message format" });
      return;
    }

    const { type, topic, mode } = parsed;

    // Handle both "generate" and "retry" — same logic, retry just re-runs card 3
    if (type === "generate" || type === "retry") {
      if (!topic || topic.trim() === "") {
        sendMessage(ws, { type: "error", index: -1, message: "Topic cannot be empty" });
        return;
      }

      console.log(`Generating cards for topic: "${topic}" | mode: ${mode}`);

      // For retry, only generate card 3 again
      const startIndex = type === "retry" ? 2 : 0;

      await generateCards(
        topic,
        type === "retry" ? "success" : mode, // retry always succeeds
        (card) => {
          // Skip cards before startIndex on retry
          if (card.index >= startIndex) {
            sendMessage(ws, { type: "card", data: card });
          }
        },
        (index, message) => {
          sendMessage(ws, { type: "error", index, message });
        },
        () => {
          sendMessage(ws, { type: "done" });
        }
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });

  // Send welcome confirmation
  sendMessage(ws, { type: "connected", message: "Connected to AI Card Generator" });
});

function sendMessage(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}
