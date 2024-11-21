import React, { useState, useEffect, useCallback } from "react";

const ROWS = 20;
const COLS = 10;

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const TetrisGame = ({ onGameEnd }) => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const tetrominoes = {
    I: [[1, 1, 1, 1]],
    O: [
      [1, 1],
      [1, 1],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    L: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  };

  const getRandomPiece = () => {
    const pieces = Object.keys(tetrominoes);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return { shape: tetrominoes[randomPiece], x: 3, y: 0 };
  };

  const movePiece = useCallback(
    (dx, dy) => {
      if (!currentPiece) return;

      const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
      if (!isCollision(newPiece)) {
        setCurrentPiece(newPiece);
      } else if (dy > 0) {
        lockPiece(currentPiece);
      }
    },
    [currentPiece, grid]
  );

  const rotatePiece = (piece) => {
    const { shape, x, y } = piece;

    const rotatedShape = shape[0].map((_, colIndex) =>
      shape.map((row) => row[colIndex]).reverse()
    );

    const rotatedPiece = { ...piece, shape: rotatedShape };
    if (!isCollision(rotatedPiece)) {
      setCurrentPiece(rotatedPiece);
    }
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
          if (newY >= 0) newGrid[newY][newX] = 1;
        }
      });
    });

    clearRows(newGrid);
    setGrid(newGrid);

    if (piece.y === 0) {
      setGameOver(true);
      onGameEnd(score);
    } else {
      setCurrentPiece(getRandomPiece());
    }
  };

  const clearRows = (grid) => {
    let rowsCleared = 0;
    const newGrid = grid.filter((row) => !row.every((cell) => cell !== 0));
    rowsCleared = ROWS - newGrid.length;

    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(0));
    }

    setScore((prev) => prev + rowsCleared * 100);
    setGrid(newGrid);
  };

  useEffect(() => {
    const interval = setInterval(() => movePiece(0, 1), 500);
    return () => clearInterval(interval);
  }, [movePiece]);

  useEffect(() => {
    setCurrentPiece(getRandomPiece());
  }, []);

  const handleKeyDown = (e) => {
    if (gameOver) return;

    if (e.key === "ArrowLeft") movePiece(-1, 0);
    else if (e.key === "ArrowRight") movePiece(1, 0);
    else if (e.key === "ArrowDown") movePiece(0, 1);
    else if (e.key === "ArrowUp") rotatePiece(currentPiece);
    else if (e.key === " ") dropPiece();
  };

  const dropPiece = () => {
    let piece = { ...currentPiece };
    while (!isCollision({ ...piece, y: piece.y + 1 })) {
      piece.y += 1;
    }
    lockPiece(piece);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (gameOver) {
    return <h2>Game Over! Your score: {score}</h2>;
  }

  return (
    <div>
      <h1>Tetris Game</h1>
      <div>
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex" }}>
            {row.map((cell, c) => (
              <div
                key={c}
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: cell ? "blue" : "white",
                  border: "1px solid black",
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <p>Score: {score}</p>
    </div>
  );
};

export default TetrisGame;
