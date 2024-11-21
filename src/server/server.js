import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let highScores = [];

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(highScores)); // Send high scores to new clients

  ws.on("message", (message) => {
    const { score } = JSON.parse(message); // Parse incoming score
    highScores.push(score);
    highScores.sort((a, b) => b - a); // Sort scores descending
    highScores = highScores.slice(0, 5); // Keep top 5 scores

    // Broadcast updated high scores to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(highScores));
      }
    });
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
