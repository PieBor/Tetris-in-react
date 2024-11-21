import React from "react";

const StartButton = ({ startGame }) => (
  <button onClick={startGame} style={styles.button}>
    Start Game
  </button>
);

const styles = {
  button: {
    padding: "10px 20px",
    fontSize: "18px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default StartButton;
