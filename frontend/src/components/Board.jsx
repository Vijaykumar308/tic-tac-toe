import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Square from './Square';
import WinnerPopup from './WinnerPopup';
import PvPSetup from './PvPSetup';
import { findBestMove } from './utils/ai';

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

const Board = ({ isPvP = false, gameId: initialGameId = null }) => {
    const [state, setState] = useState(Array(9).fill(null));
    const [isXTurn, setIsXTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState('Select game mode to start');
    const [moves, setMoves] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [gameMode, setGameMode] = useState(isPvP ? 'pvp' : null);
    const [isComputerThinking, setIsComputerThinking] = useState(false);
    const [showPvPSetup, setShowPvPSetup] = useState(!isPvP);
    const [players, setPlayers] = useState({ player1: 'Player 1', player2: 'Player 2' });
    const [gameId, setGameId] = useState(initialGameId);
    const navigate = useNavigate();
    const params = useParams();

    // Sync gameId from URL if it changes
    useEffect(() => {
        if (params.id && params.id !== gameId) {
            setGameId(params.id);
            resetGame();
        }
    }, [params.id]);

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

    const startNewGame = (mode) => {
        if (mode === 'pvp') {
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
        
        // Navigate to the game URL
        navigate(`/game/${gameData.gameId}`, { replace: true });
    };

    const resetGame = () => {
        setState(Array(9).fill(null));
        setIsXTurn(true);
        setMoves(0);
        setWinner(null);
        setIsDraw(false);
        
        if (gameMode === 'pvp') {
            setGameStatus(`${players.player1}'s turn (X)`);
        } else if (gameMode === 'pvc') {
            setGameStatus("Your turn (X)");
        }
    };

    const handleBackToMenu = () => {
        setGameMode(null);
        setGameStatus('Select game mode to start');
        navigate('/');
    };

    // Computer's turn
    useEffect(() => {
        if (gameMode === 'pvc' && !isXTurn && !winner && !isDraw) {
            makeComputerMove();
        }
    }, [isXTurn, gameMode, winner, isDraw]);

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
                        {gameMode === 'pvp' && (
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {isXTurn ? players.player1 : players.player2}'s turn
                                </div>
                                <div className="text-xl font-bold">
                                    {gameStatus}
                                </div>
                            </div>
                        )}
                        {gameMode === 'pvc' && (
                            <>
                                {gameStatus}
                                {!isXTurn && !winner && !isDraw && (
                                    <span className="ml-2 animate-pulse">🤔</span>
                                )}
                            </>
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
                                players={players}
                            />
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button
                            onClick={handleBackToMenu}
                            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Back to Menu
                        </button>
                        <button
                            onClick={resetGame}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            New Game
                        </button>
                    </div>
                </>
            )}

            {showPvPSetup && (
                <PvPSetup
                    onStartGame={handlePvPStart}
                    onClose={() => setShowPvPSetup(false)}
                />
            )}
        </div>
    );
};

export default Board;