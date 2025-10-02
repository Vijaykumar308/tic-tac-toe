import { useState, useEffect, useRef } from 'react';
import Square from './Square';
import WinnerPopup from './WinnerPopup';
import { findBestMove } from './utils/ai';
import { createSocketConnection } from './utils/socket-client';

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

let socket;

const Board = () => {
    const [state, setState] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState('Select game mode to start');
    const [moves, setMoves] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [gameMode, setGameMode] = useState(null);
    const [isComputerThinking, setIsComputerThinking] = useState(false);

    let io;


    const renderSquare = (index) => (
        <Square 
            value={state[index]} 
            onClick={() => handleClick(index)}
            disabled={!!winner || isDraw || (gameMode === 'pvc' && !isXTurn) || isComputerThinking}
        />
    );

    const makeComputerMove = () => {
        if (isBoardFull(state) || checkWinner(state)) return;
        
        setIsComputerThinking(true);
        
        setTimeout(() => {
            const move = findBestMove(state, isXTurn);
            if (move !== -1) {
                handleMove(move);
            }
            setIsComputerThinking(false);
        }, 500);
    };

    const handleMove = (index) => {
        if (state[index] || checkWinner(state)) return;

        const newSquares = [...state];
        newSquares[index] = isXTurn ? 'X' : 'O';
        
        const winner = checkWinner(newSquares);
        const boardFull = isBoardFull(newSquares);
        
        setState(newSquares);
        setIsXTurn(!isXTurn);
        setMoves(prev => prev + 1);

        if (winner) {
            setWinner(winner);
        } else if (boardFull) {
            setIsDraw(true);
        }
    };

    const handleClick = (index) => {
        if (gameMode === null) return;
        if (gameMode === 'pvp' || (gameMode === 'pvc' && isXTurn)) {
            handleMove(index);
        }
    };

    const startNewGame = async (mode) => {
        if(mode === "pvp") {
            const io = await createSocketConnection();
        }
        setGameMode(mode);
        resetGame();
    };

    const resetGame = () => {
        setState(Array(9).fill(null));
        setIsXTurn(true);
        setMoves(0);
        setWinner(null);
        setIsDraw(false);
        if (gameMode === 'pvp') {
            setGameStatus("Player X's turn");
        } else if (gameMode === 'pvc') {
            setGameStatus("Your turn (X)");
        }
    };

    const changeGameMode = () => {
        setGameMode(null);
        resetGame();
    };

    useEffect(() => {
        if (gameMode === 'pvc' && !isXTurn && !winner && !isDraw) {
            makeComputerMove();
        }
    }, [isXTurn, gameMode, winner, isDraw]);

    useEffect(() => {
        if (gameMode === null) return;
        
        if (winner) {
            if (gameMode === 'pvp') {
                setGameStatus(`Player ${winner} wins!`);
            } else {
                setGameStatus(winner === 'X' ? 'You win!' : 'Computer wins!');
            }
        } else if (isDraw) {
            setGameStatus("Game is a draw!");
        } else {
            if (gameMode === 'pvp') {
                setGameStatus(`Player ${isXTurn ? 'X' : 'O'}'s turn`);
            } else {
                setGameStatus(isXTurn ? 'Your turn (X)' : 'Computer is thinking...');
            }
        }
    }, [isXTurn, winner, isDraw, gameMode]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Tic Tac Toe
            </h1>
            
            {!gameMode ? (
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Select Game Mode
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => startNewGame('pvp')}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            <span className="mr-2">👥</span> Player vs Player
                        </button>
                        <button
                            onClick={() => startNewGame('pvc')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                        >
                            <span className="mr-2">🤖</span> Play vs Computer
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                        {gameStatus}
                        {!isXTurn && gameMode === 'pvc' && !winner && !isDraw && (
                            <span className="ml-2 animate-pulse">🤔</span>
                        )}
                    </div>
                    
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
                                onClose={resetGame} 
                                gameMode={gameMode}
                            />
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button
                            onClick={resetGame}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <span className="mr-2">🔄</span> New Game
                        </button>
                        <button
                            onClick={changeGameMode}
                            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            <span className="mr-2">↩️</span> Change Mode
                        </button>
                    </div>
                    
                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Moves: {moves} | Mode: {gameMode === 'pvp' ? 'Player vs Player' : 'Player vs Computer'}
                    </div>
                </>
            )}
        </div>
    );
};

export default Board;