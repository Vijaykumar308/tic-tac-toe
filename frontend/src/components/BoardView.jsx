import React from 'react';

const BoardView = ({ 
  squares, 
  onSquareClick, 
  isDraw, 
  winner, 
  gameMode, 
  isXTurn,
  onNewGame,
  isComputerThinking,
  mySymbol
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

  const didIWin = gameMode === 'pvp' && winner === mySymbol;
  const didILose = gameMode === 'pvp' && winner && winner !== mySymbol;

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
          <div className={`bg-white p-8 rounded-2xl text-center shadow-2xl w-full max-w-sm transform transition-all ${
            didIWin ? 'border-4 border-green-400' : didILose ? 'border-4 border-red-400' : 'border-4 border-yellow-400'
          }`}>
            <div className="text-6xl mb-4">
              {isDraw ? '🤝' : didIWin ? '🏆' : didILose ? '😢' : '🎉'}
            </div>
            <h3 className={`text-4xl font-bold mb-4 ${
              didIWin ? 'text-green-600' : didILose ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {isDraw 
                ? "It's a Draw!" 
                : didIWin 
                  ? "You Win!" 
                  : didILose 
                    ? "You Lost!" 
                    : `Player ${winner} Wins!`}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {isDraw 
                ? "Great game! Want to play again?" 
                : didIWin 
                  ? "Congratulations! You played brilliantly! 🎊" 
                  : didILose 
                    ? "Better luck next time! Keep practicing! 💪"
                    : `Congratulations to ${winner}!`}
            </p>
            <button
              onClick={onNewGame}
              className={`px-6 py-3 text-white rounded-lg font-semibold
                       hover:opacity-90 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 w-full
                       ${didIWin ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                         didILose ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                         'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
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