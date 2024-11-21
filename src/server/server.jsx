import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let highScores = []; // Store top 10 scores and names

wss.on("connection", (ws) => {
  // Send the current high scores when a new client connects
  ws.send(JSON.stringify({ type: "highScores", scores: highScores }));

  // Handle incoming messages (e.g., score submission)
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "sendHighScore") {
      const { name, score } = data;

      // Add the new score with player name to the high scores array
      highScores.push({ name, score });
      
      // Sort the high scores in descending order by score
      highScores.sort((a, b) => b.score - a.score);
      
      // Keep only the top 10 high scores
      highScores = highScores.slice(0, 10);
      
      // Broadcast updated high scores to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "highScores", scores: highScores }));
        }
      });
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
