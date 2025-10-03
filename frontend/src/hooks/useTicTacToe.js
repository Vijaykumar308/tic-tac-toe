import { useState, useEffect } from 'react';
import { findBestMove } from '../components/utils/ai';

const checkWinner = (squares) => {
  const winningCombination = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (let logic of winningCombination) {
    const [a, b, c] = logic;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const isBoardFull = (squares) => {
  return squares.every(square => square !== null);
};

const useTicTacToe = (gameMode, players) => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [moves, setMoves] = useState(0);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('Select game mode to start');

  // Update game status text
  useEffect(() => {
    if (winner) {
      setGameStatus(`${winner === 'X' ? players.player1 : players.player2} wins!`);
    } else if (isDraw) {
      setGameStatus("It's a draw!");
    } else if (gameMode) {
      setGameStatus(`${isXTurn ? players.player1 : players.player2}'s turn (${isXTurn ? 'X' : 'O'})`);
    }
  }, [isXTurn, winner, isDraw, players, gameMode]);

  // Computer's turn
  useEffect(() => {
    if (gameMode === 'pvc' && !isXTurn && !winner && !isDraw) {
      makeComputerMove();
    }
  }, [isXTurn, gameMode, winner, isDraw]);

  const makeComputerMove = () => {
    if (isBoardFull(squares) || checkWinner(squares)) return;
    
    setIsComputerThinking(true);
    
    setTimeout(() => {
      const move = findBestMove(squares, isXTurn);
      if (move !== -1) {
        handleMove(move);
      }
      setIsComputerThinking(false);
    }, 500);
  };

  const handleMove = (index) => {
    if (squares[index] || checkWinner(squares)) return;

    const newSquares = [...squares];
    newSquares[index] = isXTurn ? 'X' : 'O';
    
    const newWinner = checkWinner(newSquares);
    const boardFull = isBoardFull(newSquares);
    
    setSquares(newSquares);
    setIsXTurn(!isXTurn);
    setMoves(prev => prev + 1);

    if (newWinner) {
      setWinner(newWinner);
    } else if (boardFull) {
      setIsDraw(true);
    }
  };

  const handleSquareClick = (index) => {
    if (gameMode === null) return;
    if (gameMode === 'pvp' || (gameMode === 'pvc' && isXTurn)) {
      handleMove(index);
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsXTurn(true);
    setMoves(0);
    setWinner(null);
    setIsDraw(false);
  };

  return {
    squares,
    isXTurn,
    moves,
    winner,
    isDraw,
    isComputerThinking,
    gameStatus,
    handleSquareClick,
    resetGame,
  };
};

export default useTicTacToe;
