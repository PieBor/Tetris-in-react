import React, { useState, useEffect } from "react";

// WebSocket setup (assuming your server is running at ws://localhost:8080)
const socket = new WebSocket("ws://localhost:8080");

const ROWS = 20;
const COLS = 10;

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const tetrominoes = {
  I: { shape: [[1, 1, 1, 1]], color: "cyan" },
  O: { shape: [[1, 1], [1, 1]], color: "yellow" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: "orange" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "red" },
};

const TetrisGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [nameInputVisible, setNameInputVisible] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // WebSocket event handlers
  useEffect(() => {
    socket.onopen = () => {
      console.log("WebSocket connection established");
      // Request the current high scores when the connection is established
      socket.send(JSON.stringify({ type: "getHighScores" }));
    };

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "highScores") {
        // Update the high scores when the server sends them
        setHighScores(data.scores);
      }
    };

    return () => socket.close();
  }, []);

  // Handle WebSocket communication for high score submission
  const submitHighScore = () => {
    if (playerName.length > 0) {
      // Send the high score to the server
      socket.send(JSON.stringify({
        type: "sendHighScore",
        name: playerName,
        score: score,
      }));

      // Hide the input form and reset the game state
      setNameInputVisible(false);
      resetGame();
    }
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setCurrentPiece(getRandomPiece());
    setGameOver(false);
  };

  const getRandomPiece = () => {
    const keys = Object.keys(tetrominoes);
    const key = keys[Math.floor(Math.random() * keys.length)];
    return { shape: tetrominoes[key].shape, color: tetrominoes[key].color, x: 4, y: 0 };
  };

  const isCollision = (piece) => {
    const { shape, x, y } = piece;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const lockPiece = (piece) => {
    const { shape, x, y } = piece;
    const newGrid = grid.map((row) => [...row]);

    shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const newX = x + c;
          const newY = y + r;
          if (newY >= 0) newGrid[newY][newX] = piece.color;
        }
      });
    });

    clearRows(newGrid);

    if (piece.y === 0) {
      setGameOver(true);
      handleGameOver(score);
    } else {
      setCurrentPiece(getRandomPiece());
    }
  };

  const clearRows = (grid) => {
    let rowsCleared = 0;

    const newGrid = grid.filter((row) => row.some((cell) => cell === 0));

    rowsCleared = ROWS - newGrid.length;

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(0));
    }

    setScore((prev) => prev + rowsCleared * 100);
    setGrid(newGrid);
  };

  const movePiece = (dx, dy) => {
    if (!currentPiece) return;
    const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    if (!isCollision(newPiece)) setCurrentPiece(newPiece);
    else if (dy > 0) lockPiece(currentPiece);
  };

  const rotatePiece = () => {
    const rotatedShape = currentPiece.shape[0].map((_, colIndex) =>
      currentPiece.shape.map((row) => row[colIndex]).reverse()
    );
    const newPiece = { ...currentPiece, shape: rotatedShape };
    if (!isCollision(newPiece)) setCurrentPiece(newPiece);
  };

  const dropPiece = () => {
    let piece = { ...currentPiece };
    while (!isCollision({ ...piece, y: piece.y + 1 })) piece.y++;
    lockPiece(piece);
  };

  const handleKeyDown = (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") movePiece(-1, 0);
    if (e.key === "ArrowRight") movePiece(1, 0);
    if (e.key === "ArrowDown") movePiece(0, 1);
    if (e.key === "ArrowUp") rotatePiece();
    if (e.key === " ") dropPiece();
  };

  const handleGameOver = (score) => {
    setNameInputVisible(true);
  };

  const handleNameChange = (e) => setPlayerName(e.target.value);

  useEffect(() => {
    const interval = setInterval(() => movePiece(0, 1), 500);
    return () => clearInterval(interval);
  }, [currentPiece]);

  useEffect(() => {
    setCurrentPiece(getRandomPiece());
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div>
      {gameOver ? (
        // Show highscore input form and high scores
        <div>
          <h2>Game Over! Your score: {score}</h2>
          {nameInputVisible && (
            <div>
              <h3>Enter Your Name (up to 20 characters)</h3>
              <input
                type="text"
                maxLength="20"
                value={playerName}
                onChange={handleNameChange}
                placeholder="Enter name"
              />
              <button onClick={submitHighScore}>Submit</button>
            </div>
          )}
          <div>
            <h3>Top 10 High Scores</h3>
            <ul>
              {highScores.map((entry, index) => (
                <li key={index}>{entry.name} - {entry.score}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        // Show the game and score
        <div>
          <h1>Tetris</h1>
          {grid.map((row, r) => (
            <div key={r} style={{ display: "flex" }}>
              {row.map((cell, c) => {
                let cellColor = cell || "white";
                if (currentPiece) {
                  const { shape, x, y, color } = currentPiece;
                  if (shape[r - y] && shape[r - y][c - x]) {
                    cellColor = color; 
                  }
                }
                return (
                  <div
                    key={c}
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: cellColor,
                      border: "1px solid black",
                    }}
                  ></div>
                );
              })}
            </div>
          ))}
          <p>Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default TetrisGame;
