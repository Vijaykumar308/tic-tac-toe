// src/components/BoardView.jsx
import React from 'react';
import Square from "./Square";
import WinnerPopup from "./WinnerPopup";
import GameControls from "./GameControls";

const BoardView = ({ 
  squares, 
  onSquareClick, 
  isDraw, 
  winner, 
  gameMode, 
  players, 
  isXTurn,
  onNewGame,
  onBackToMenu,
  isComputerThinking
}) => {
  const renderSquare = (index) => (
    <Square 
      value={squares[index]} 
      onClick={() => onSquareClick(index)}
      disabled={!!winner || isDraw || (gameMode === 'pvc' && !isXTurn) || isComputerThinking}
    />
  );

  return (
    <>
      <div className="w-full max-w-md relative grid grid-cols-3 gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-3">
            {[0, 1, 2].map((col) => (
              <div key={col} className="flex-1">
                {renderSquare(row * 3 + col)}
              </div>
            ))}
          </div>
        ))}
        {(winner || isDraw) && (
          <WinnerPopup 
            winner={winner} 
            isDraw={isDraw}
            onClose={onNewGame} 
            gameMode={gameMode}
            players={players}
          />
        )}
      </div>
{/* 
      <GameControls 
        onNewGame={onNewGame} 
        onBackToMenu={onBackToMenu} 
      /> */}
    </>
  );
};

export default BoardView;