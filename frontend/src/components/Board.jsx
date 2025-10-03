import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PvPSetup from './PvPSetup';
import BoardView from './BoardView';
import GameModeSelector from './GameModeSelector';
import { socketClient } from './utils/socket-client';
import useTicTacToe from '../hooks/useTicTacToe';

const Board = ({ isPvP = false }) => {
  const [gameMode, setGameMode] = useState(isPvP ? 'pvp' : null);
  const [showPvPSetup, setShowPvPSetup] = useState(false);
  const [players, setPlayers] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [gameId, setGameId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const navigate = useNavigate();
  const params = useParams();

  const {
    squares,
    isXTurn,
    winner,
    isDraw,
    handleSquareClick: handleGameMove,
    resetGame,
    gameStatus,
    isComputerThinking
  } = useTicTacToe(gameMode, players);

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setShowPvPSetup(true);
    }
  };

  const handlePvPStart = (gameData) => {
    setPlayers(prev => ({
      ...prev,
      player2: gameData.players[1]?.name || 'Waiting...'
    }));
    setGameId(gameData.roomId);
    setShowPvPSetup(false);
    setIsHost(gameData.isHost);
    setIsConnected(true);
  };

  const handleSquareClick = (i) => {
    if (gameMode === 'pvp' && gameId) {
      if (squares[i] || (isHost ? !isXTurn : isXTurn)) return;
      socketClient.makeMove({
        roomId: gameId,
        index: i,
        symbol: isXTurn ? 'X' : 'O'
      });
    }
    handleGameMove(i);
  };

  useEffect(() => {
    if (gameMode !== 'pvp') return;

    socketClient.connect();

    const handleGameUpdate = (data) => {
      console.log('Game update:', data);
    };

    const handlePlayerJoined = (player) => {
      setPlayers(prev => ({
        ...prev,
        player2: player.name
      }));
    };

    socketClient.onGameUpdate(handleGameUpdate);
    socketClient.onGameStart(handlePvPStart);

    return () => {
      socketClient.cleanup();
    };
  }, [gameMode]);

  const handleBackToMenu = () => {
    if (gameMode === 'pvp') {
      socketClient.disconnect();
    }
    setGameMode(null);
    setShowPvPSetup(false);
    setGameId(null);
    resetGame();
  };

  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleGameModeSelect} />;
  }

  if (gameMode === 'pvp' && showPvPSetup) {
    return <PvPSetup onStart={handlePvPStart} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tic Tac Toe</h1>
            <p className="text-sm text-gray-500">
              {gameMode === 'pvp' 
                ? 'Player vs Player' 
                : gameMode === 'pvc' 
                  ? 'Player vs Computer' 
                  : 'Select Game Mode'}
            </p>
          </div>
          <button
            onClick={handleBackToMenu}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                     transition-colors duration-200 focus:outline-none focus:ring-2 
                     focus:ring-gray-300"
          >
            Menu
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
          <p className="text-lg font-semibold text-center text-gray-800 mb-1">
            {gameStatus}
          </p>
          {gameMode === 'pvp' && (
            <div className="flex justify-between items-center mt-2 px-2">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isXTurn ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
              }`}>
                {players.player1} (X)
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                !isXTurn ? 'bg-red-100 text-red-800' : 'text-gray-600'
              }`}>
                {players.player2 || 'Waiting...'} (O)
              </span>
            </div>
          )}
        </div>

        <BoardView
          squares={squares}
          onSquareClick={handleSquareClick}
          isDraw={isDraw}
          winner={winner}
          gameMode={gameMode}
          isXTurn={isXTurn}
          onNewGame={resetGame}
          isComputerThinking={isComputerThinking}
        />
      </div>
    </div>
  );
};

export default Board;