const io = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"], // force websocket transport
});

socket.on("connect", () => {
  console.log("✅ Connected as", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});

socket.on("pollUpdated", (data) => {
  console.log("📊 Poll updated:", data);
});
