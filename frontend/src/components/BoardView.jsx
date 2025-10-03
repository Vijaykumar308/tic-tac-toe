import React from 'react';

const BoardView = ({ 
  squares, 
  onSquareClick, 
  isDraw, 
  winner, 
  gameMode, 
  isXTurn,
  onNewGame,
  isComputerThinking
}) => {
  const renderSquare = (index) => (
    <button
      key={index}
      className={`
        w-20 h-20 text-3xl font-bold 
        bg-white border-2 border-gray-200 rounded-xl 
        hover:bg-gray-50 focus:outline-none focus:ring-2 
        focus:ring-blue-400 transition-all duration-200
        ${squares[index] === 'X' ? 'text-blue-600' : 'text-red-600'}
        shadow-sm hover:shadow-md
      `}
      onClick={() => onSquareClick(index)}
      disabled={!!winner || isDraw || (gameMode === 'pvc' && !isXTurn) || isComputerThinking}
    >
      {squares[index]}
    </button>
  );

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-100 p-4 rounded-2xl shadow-inner">
        <div className="grid grid-rows-3 grid-cols-3 gap-2">
          {Array(9).fill(null).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              {renderSquare(index)}
            </div>
          ))}
        </div>
      </div>

      {(winner || isDraw) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-10">
          <div className="bg-white p-6 rounded-xl text-center shadow-xl w-full max-w-sm">
            <h3 className="text-3xl font-bold mb-4 text-gray-800">
              {isDraw ? "It's a Draw! 🎉" : `Player ${winner} Wins! 🏆`}
            </h3>
            <p className="text-gray-600 mb-6">
              {isDraw 
                ? "The game ended in a draw. Want to play again?" 
                : `Congratulations to ${winner === 'X' ? 'X' : 'O'}!`}
            </p>
            <button
              onClick={onNewGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 w-full"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;