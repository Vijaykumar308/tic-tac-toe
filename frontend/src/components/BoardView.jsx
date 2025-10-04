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
  mySymbol,
  winningLine,
  showWinPopup
}) => {
  const renderSquare = (index) => {
    const isWinningSquare = winningLine && winningLine.includes(index);
    
    return (
      <button
        key={index}
        className={`
          w-20 h-20 text-3xl font-bold 
          bg-white border-2 rounded-xl 
          hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-blue-400 transition-all duration-300
          ${squares[index] === 'X' ? 'text-blue-600' : 'text-red-600'}
          ${isWinningSquare ? 'bg-yellow-200 border-yellow-500 animate-pulse scale-110' : 'border-gray-200'}
          shadow-sm hover:shadow-md
          ${!winner && !isDraw && !isComputerThinking ? 'hover:scale-105' : ''}
        `}
        onClick={() => onSquareClick(index)}
        disabled={!!winner || isDraw || (gameMode === 'pvc' && !isXTurn) || isComputerThinking}
      >
        <span className={`${isWinningSquare ? 'animate-bounce' : ''}`}>
          {squares[index]}
        </span>
      </button>
    );
  };

  const didIWin = gameMode === 'pvp' && winner === mySymbol;
  const didILose = gameMode === 'pvp' && winner && winner !== mySymbol;
  
  const playerWonPvC = gameMode === 'pvc' && winner === 'X';
  const computerWonPvC = gameMode === 'pvc' && winner === 'O';

  const isWinner = didIWin || playerWonPvC;
  const isLoser = didILose || computerWonPvC;

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

      {showWinPopup && (winner || isDraw) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`bg-white p-8 rounded-2xl text-center shadow-2xl w-full max-w-sm transform transition-all animate-slideUp ${
            isWinner ? 'border-4 border-green-400' : isLoser ? 'border-4 border-red-400' : 'border-4 border-yellow-400'
          }`}>
            <div className="text-6xl mb-4 animate-bounce">
              {isDraw ? '🤝' : isWinner ? '🏆' : isLoser ? (gameMode === 'pvc' ? '🤖' : '😢') : '🎉'}
            </div>
            <h3 className={`text-4xl font-bold mb-4 ${
              isWinner ? 'text-green-600' : isLoser ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {isDraw 
                ? "It's a Draw!" 
                : isWinner 
                  ? "You Win!" 
                  : isLoser 
                    ? (gameMode === 'pvc' ? "Computer Wins!" : "You Lost!")
                    : `Player ${winner} Wins!`}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {isDraw 
                ? "Great game! Want to play again?" 
                : isWinner 
                  ? "Congratulations! You played brilliantly! 🎊" 
                  : isLoser 
                    ? (gameMode === 'pvc' 
                        ? "The computer was too smart! Try again! 💪"
                        : "Better luck next time! Keep practicing! 💪")
                    : `Congratulations to ${winner}!`}
            </p>
            <button
              onClick={onNewGame}
              className={`px-6 py-3 text-white rounded-lg font-semibold
                       hover:opacity-90 transition-all duration-200 transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-offset-2 w-full
                       ${isWinner ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                         isLoser ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                         'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BoardView;