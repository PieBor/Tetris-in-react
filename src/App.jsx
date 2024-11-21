import React, { useState, useEffect } from "react";
import HighScores from "./components/HighScores";
import TetrisGame from "./components/TetrisGame";

const App = () => {
  const [showHighScores, setShowHighScores] = useState(true);
  const [highScores, setHighScores] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (message) => {
      setHighScores(JSON.parse(message.data));
    };
    setSocket(ws);

    return () => ws.close();
  }, []);

  const startGame = () => setShowHighScores(false);

  const updateHighScores = (newScore) => {
    if (socket) {
      socket.send(JSON.stringify({ score: newScore }));
    }
  };

  const handleGameEnd = (finalScore) => {
    updateHighScores(finalScore);
    setTimeout(() => setShowHighScores(true), 2000); // Wait 2 seconds before showing high scores
  };

  return (
    <div className="content">
      {showHighScores ? (
        <HighScores highScores={highScores} startGame={startGame} />
      ) : (
        <TetrisGame onGameEnd={handleGameEnd} />
      )}
    </div>
  );
};

export default App;
