import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PvPSetup from './PvPSetup';
import BoardView from './BoardView';
import GameModeSelector from './GameModeSelector';
import { socketClient } from './utils/socket-client';

const Board = ({ isPvP = false }) => {
  const [gameMode, setGameMode] = useState(isPvP ? 'pvp' : null);
  const [showPvPSetup, setShowPvPSetup] = useState(false);
  const [players, setPlayers] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [gameId, setGameId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [mySymbol, setMySymbol] = useState(null);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameStatus, setGameStatus] = useState('Waiting for players...');
  
  const navigate = useNavigate();

  const checkWinner = useCallback((squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const resetGame = useCallback(() => {
    if (gameMode === 'pvp' && gameId) {
      // For PvP mode, emit restart event to server
      socketClient.restartGame(gameId);
    } else {
      // For local games, reset immediately
      setSquares(Array(9).fill(null));
      setIsXTurn(true);
      setWinner(null);
      setIsDraw(false);
      setGameStatus('Game reset - Make your move');
    }
  }, [gameMode, gameId]);

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setShowPvPSetup(true);
    }
  };

  const handlePvPStart = useCallback((gameData) => {
    console.log('Game started with data:', gameData);
    
    const player1 = gameData.players?.[0]?.name || 'Player 1';
    const player2 = gameData.players?.[1]?.name || 'Waiting...';
    
    setPlayers({
      player1,
      player2
    });
    
    setGameId(gameData.roomId);
    setShowPvPSetup(false);
    setIsHost(!!gameData.isHost);
    
    const playerSymbol = gameData.isHost ? 'X' : 'O';
    setMySymbol(playerSymbol);
    
    if (gameData.isHost) {
      setGameStatus('Your turn (X)');
    } else {
      setGameStatus('Waiting for X...');
    }
  }, []);

  const handleSquareClick = useCallback((i) => {
    if (winner || isDraw) {
      console.log('Game is over');
      return;
    }

    if (squares[i]) {
      console.log('Invalid move: Square already taken');
      return;
    }

    const currentSymbol = isXTurn ? 'X' : 'O';
    const isMyTurn = gameMode === 'pvp' ? (mySymbol === currentSymbol) : true;

    if (!isMyTurn) {
      console.log(`Invalid move: Not your turn. Your symbol: ${mySymbol}, Current turn: ${currentSymbol}`);
      return;
    }

    console.log(`Making move at index ${i} with symbol ${currentSymbol}`);

    if (gameMode === 'pvp' && gameId) {
      socketClient.makeMove({
        roomId: gameId,
        index: i,
        symbol: currentSymbol,
        isXTurn: isXTurn
      });
    } else {
      const newSquares = [...squares];
      newSquares[i] = currentSymbol;
      setSquares(newSquares);
      setIsXTurn(!isXTurn);
      
      const gameWinner = checkWinner(newSquares);
      if (gameWinner) {
        setWinner(gameWinner);
        setGameStatus(`Player ${gameWinner} wins!`);
      } else if (newSquares.every(square => square !== null)) {
        setIsDraw(true);
        setGameStatus("It's a draw!");
      }
    }
  }, [squares, isXTurn, gameMode, gameId, mySymbol, winner, isDraw, checkWinner]);

  useEffect(() => {
    if (gameMode !== 'pvp') return;

    socketClient.connect();

    const handleGameUpdate = (data) => {
      console.log('Game update received:', data);
      
      setSquares([...data.board]);
      setIsXTurn(data.isXTurn);
      
      if (data.winner) {
        setWinner(data.winner);
        setGameStatus(`Player ${data.winner} wins!`);
      } else if (data.isDraw) {
        setIsDraw(true);
        setGameStatus("It's a draw!");
      } else {
        // Clear winner and draw state when game restarts
        setWinner(null);
        setIsDraw(false);
        
        const currentPlayer = data.isXTurn ? 'X' : 'O';
        const isMyTurn = mySymbol === currentPlayer;
        
        setGameStatus(isMyTurn 
          ? `Your turn (${currentPlayer})` 
          : `Waiting for ${currentPlayer}...`
        );
      }
    };

    const handlePlayerJoined = (player) => {
      console.log('Player joined:', player);
      setPlayers(prev => ({
        ...prev,
        player2: player?.name || 'Player 2'
      }));
      
      if (isHost) {
        setGameStatus('Your turn (X)');
      }
    };

    const handleGameStart = (data) => {
      console.log('Game start event received:', data);
      
      if (data.players && data.players.length === 2) {
        setPlayers({
          player1: data.players[0].name,
          player2: data.players[1].name
        });
      }
      
      const isMyTurn = mySymbol === 'X';
      setGameStatus(isMyTurn ? 'Your turn (X)' : 'Waiting for X...');
    };

    socketClient.onGameUpdate(handleGameUpdate);
    socketClient.onPlayerJoined(handlePlayerJoined);
    socketClient.onGameStart(handleGameStart);

    return () => {
      socketClient.cleanup();
    };
  }, [gameMode, mySymbol, isHost]);

  const handleBackToMenu = () => {
    if (gameMode === 'pvp') {
      socketClient.disconnect();
    }
    setGameMode(null);
    setShowPvPSetup(false);
    setGameId(null);
    setMySymbol(null);
    setSquares(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setIsDraw(false);
    setGameStatus('Waiting for players...');
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
              {gameMode === 'pvp' ? `Player vs Player (You: ${mySymbol || '?'})` : 'Player vs Computer'}
              {gameId && (
                <span className="ml-2 text-blue-600">
                  Room: {gameId}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gameId);
                      alert('Room ID copied to clipboard!');
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    title="Copy Room ID"
                  >
                    📋
                  </button>
                </span>
              )}
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
                (isXTurn && mySymbol === 'X') || (!isXTurn && mySymbol === 'O') 
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400' 
                  : 'text-gray-600'
              }`}>
                {players.player1} (X) {mySymbol === 'X' && '← You'}
              </span>
              <span className="text-gray-400 mx-2">vs</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                (!isXTurn && mySymbol === 'O') || (isXTurn && mySymbol === 'X')
                  ? 'text-gray-600'
                  : 'bg-red-100 text-red-800 ring-2 ring-red-400'
              }`}>
                {players.player2 || 'Waiting...'} (O) {mySymbol === 'O' && '← You'}
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
          isComputerThinking={false}
        />
      </div>
    </div>
  );
};

export default Board;