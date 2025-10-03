import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PvPSetup from './PvPSetup';
import BoardView from './BoardView';
import GameModeSelector from './GameModeSelector';
import { socketClient } from './utils/socket-client';
import useTicTacToe from '../hooks/useTicTacToe';

const Board = ({ isPvP = false, gameId: initialGameId = null }) => {
  const [gameMode, setGameMode] = useState(isPvP ? 'pvp' : null);
  const [showPvPSetup, setShowPvPSetup] = useState(false);
  const [players, setPlayers] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [gameId, setGameId] = useState(initialGameId);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const navigate = useNavigate();
  const params = useParams();

  const {
    squares,
    xIsNext,
    winner,
    handleClick,
    resetGame,
    status
  } = useTicTacToe();

  // Handle game mode selection
  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setShowPvPSetup(true);
    }
  };

  // Handle PvP game start
  const handlePvPStart = (gameData) => {
    setPlayers({
      player1: gameData.players[0].name,
      player2: gameData.players[1]?.name || 'Waiting...'
    });
    setGameId(gameData.roomId);
    setShowPvPSetup(false);
    setIsHost(gameData.isHost);
  };

  // Handle PvP move
  const handlePvPMove = (i) => {
    if (gameMode === 'pvp' && gameId) {
      socketClient.makeMove({
        roomId: gameId,
        index: i,
        symbol: xIsNext ? 'X' : 'O'
      });
    }
    handleClick(i);
  };

  // Set up socket listeners when component mounts
  useEffect(() => {
    socketClient.connect();

    // Handle game updates from server
    const handleGameUpdate = (data) => {
      // Update game state based on server data
      // This will depend on your game state management
      console.log('Game update:', data);
    };

    // Handle player joined event
    const handlePlayerJoined = (player) => {
      setPlayers(prev => ({
        ...prev,
        player2: player.name
      }));
    };

    // Set up event listeners
    socketClient.onGameUpdate(handleGameUpdate);
    socketClient.onGameStart(handlePvPStart);

    return () => {
      // Clean up event listeners
      socketClient.cleanup();
    };
  }, []);

  // Handle back to menu
  const handleBackToMenu = () => {
    if (gameMode === 'pvp') {
      socketClient.disconnect();
    }
    setGameMode(null);
    setShowPvPSetup(false);
    setGameId(null);
  };

  // If game mode not selected, show mode selector
  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleGameModeSelect} />;
  }

  // If PvP mode and setup needed, show PvP setup
  if (gameMode === 'pvp' && showPvPSetup) {
    return <PvPSetup onStart={handlePvPStart} />;
  }

  // Show the game board
  return (
    <div className="game">
      <div className="game-board">
        <BoardView 
          squares={squares}
          onClick={gameMode === 'pvp' ? handlePvPMove : handleClick}
        />
      </div>
      <div className="game-info">
        <div className="status">{status}</div>
        <div className="players">
          <div>Player 1 (X): {players.player1}</div>
          <div>Player 2 (O): {players.player2 || 'Waiting...'}</div>
        </div>
        <button 
          onClick={handleBackToMenu}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default Board;