import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PvPSetup from './PvPSetup';
import BoardView from './BoardView';
import GameModeSelector from './GameModeSelector';
import { createSocketConnection } from './utils/socket-client';
import useTicTacToe from '../hooks/useTicTacToe';

let socket;

const Board = ({ isPvP = false, gameId: initialGameId = null }) => {
  const [gameMode, setGameMode] = useState(isPvP ? 'pvp' : null);
  const [showPvPSetup, setShowPvPSetup] = useState(false);
  const [players, setPlayers] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [gameId, setGameId] = useState(initialGameId);
  
  const navigate = useNavigate();
  const params = useParams();

  const {
    squares,
    isXTurn,
    winner,
    isDraw,
    isComputerThinking,
    gameStatus,
    handleSquareClick,
    resetGame,
  } = useTicTacToe(gameMode, players);

  useEffect(() => {
    if (params.id && params.id !== gameId) {
      setGameId(params.id);
      resetGame();
    }
  }, [params.id]);

  const startNewGame = async (mode) => {
    if (mode === 'pvp') {
      socket = await createSocketConnection();
      setGameId(socket.id);
      setShowPvPSetup(true);
      return;
    }
    
    if (mode === 'pvc') {
      setPlayers({ player1: 'You', player2: 'Computer' });
    }
    
    setGameMode(mode);
    resetGame();
  };

  const handlePvPStart = (gameData) => {
    setPlayers({
      player1: gameData.player1,
      player2: gameData.player2
    });
    setGameId(gameData.gameId);
    setGameMode('pvp');
    setShowPvPSetup(false);
    resetGame();
    
    navigate(`/game/${gameData.gameId}`, { replace: true });
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setGameStatus('Select game mode to start');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        Tic Tac Toe
      </h1>
      
      {!gameMode ? (
        <GameModeSelector onSelectMode={startNewGame} />
      ) : (
        <>
          <div className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-300">
            {gameStatus}
            {gameMode === 'pvc' && !isXTurn && !winner && !isDraw && (
              <span className="ml-2 animate-pulse">🤔</span>
            )}
          </div>
          
          <BoardView 
            squares={squares}
            onSquareClick={handleSquareClick}
            isDraw={isDraw}
            winner={winner}
            gameMode={gameMode}
            players={players}
            isXTurn={isXTurn}
            onNewGame={resetGame}
            onBackToMenu={handleBackToMenu}
            isComputerThinking={isComputerThinking}
          />
        </>
      )}

      {showPvPSetup && (
        <PvPSetup
          onStartGame={handlePvPStart}
          onClose={() => setShowPvPSetup(false)}
          gameId={gameId}
        />
      )}
    </div>
  );
};

export default Board;