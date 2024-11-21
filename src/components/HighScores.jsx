import React from "react";

const HighScores = ({ highScores, startGame }) => (
  <div>
    <h1>High Scores</h1>
    <ul>
      {highScores.map((score, index) => (
        <li key={index}>{score}</li>
      ))}
    </ul>
    <button
      onClick={startGame}
      style={{
        padding: "10px 20px",
        fontSize: "18px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Start Game
    </button>
  </div>
);

export default HighScores;
