import React from "react";
import StartButton from "./StartButton";

const HighScores = ({ highScores, startGame }) => (
  <div>
    <h1>High Scores</h1>
    <ul>
      {highScores.map((score, index) => (
        <li key={index}>{score}</li>
      ))}
    </ul>
    <StartButton startGame={startGame} />
  </div>
);

export default HighScores;
