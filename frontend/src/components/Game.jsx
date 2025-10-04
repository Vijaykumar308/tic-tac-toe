import { useState, useEffect } from 'react';
import Board from './Board';
import { socketClient } from './utils/socket-client';

export const Game = ({ gameData, onBack }) => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState("Next player: X");
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (gameData) {
      const { players, board, currentPlayer, status } = gameData;
      setPlayers(players || []);
      setSquares(board || Array(9).fill(null));
      setCurrentPlayer(currentPlayer || 'X');
      setIsXNext(currentPlayer === 'X');
      setGameStatus(status || 'in-progress');
      updateStatus(board || Array(9).fill(null), currentPlayer || 'X');
    }

    socketClient.onGameUpdate(handleGameUpdate);
    socketClient.onPlayerJoined(handlePlayerJoined);
    
    return () => {
      socketClient.cleanup();
    };
  }, [gameData]);

  const handleGameUpdate = (data) => {
    const { board, currentPlayer, status, winner, isDraw } = data;
    
    setSquares([...board]);
    setCurrentPlayer(currentPlayer);
    setIsXNext(currentPlayer === 'X');
    setGameStatus(status);
    
    if (winner) {
      setWinner(winner);
      if (winner === 'draw') {
        setStatus('Game ended in a draw!');
      } else {
        const winnerPlayer = players.find(p => p.symbol === winner);
        setStatus(`Winner: ${winnerPlayer?.name || winner}`);
      }
    } else {
      setWinner(null);
      if (status === 'in-progress') {
        const currentPlayerObj = players.find(p => p.symbol === currentPlayer);
        setStatus(`Next player: ${currentPlayerObj?.name || currentPlayer} (${currentPlayer})`);
      }
    }
    
    if (isDraw) {
      setStatus('Game ended in a draw!');
      setWinner('draw');
    }
  };

  const handlePlayerJoined = (player) => {
    setPlayers(prevPlayers => {
      const existingPlayer = prevPlayers.find(p => p.id === player.id);
      return existingPlayer ? prevPlayers : [...prevPlayers, player];
    });
  };

  const updateStatus = (squares, current) => {
    const winner = calculateWinner(squares);
    if (winner) {
      const winnerPlayer = players.find(p => p.symbol === winner);
      setStatus(`Winner: ${winnerPlayer?.name || winner}`);
    } else if (squares.every(square => square !== null)) {
      setStatus('Game ended in a draw!');
    } else {
      const currentPlayer = players.find(p => p.symbol === current);
      setStatus(`Next player: ${currentPlayer?.name || current} (${current})`);
    }
  };

  const handleClick = (i) => {
    if (gameStatus !== 'in-progress' || squares[i] !== null) {
      console.log('Invalid move - game not in progress or cell taken');
      return;
    }

    const isCurrentPlayer = gameData?.isHost ? currentPlayer === 'X' : currentPlayer === 'O';
    if (!isCurrentPlayer) {
      console.log('Not your turn');
      return;
    }

    socketClient.makeMove({
      roomId: gameData.roomId,
      index: i,
      symbol: currentPlayer
    });
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleRestart = () => {
    setWinner(null);
    setStatus('Restarting game...');
    socketClient.restartGame(gameData.roomId);
  };

  return (
    <div className="game">
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mb-4"
        >
          Back to Menu
        </button>
        
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {gameData?.isHost ? 'You are X (Host)' : 'You are O (Guest)'}
          </h2>
          {players.length > 0 && (
            <p className="text-gray-600">
              Playing against: {players.find(p => p.id !== socketClient.socket?.id)?.name || 'Waiting for opponent...'}
            </p>
          )}
        </div>
        
        <div className="status mb-4 text-lg font-semibold">{status}</div>
      </div>
      
      <Board squares={squares} onClick={handleClick} />
      
      {(winner || gameStatus === 'finished') && (
        <div className="mt-6">
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;