import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PvPSetup = ({ onStartGame, onClose }) => {
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [gameLink, setGameLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Generate a unique game ID
        const gameId = Math.random().toString(36).substring(2, 9);
        setGameLink(`${window.location.origin}/game/${gameId}`);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(gameLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleStartGame = () => {
        if (player1.trim() && player2.trim()) {
            onStartGame({
                player1: player1.trim(),
                player2: player2.trim(),
                gameId: gameLink.split('/').pop()
            });
        }
        const url = new URL(gameLink);;
        navigate(url.pathname);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md transform transition-all animate-popIn">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Setup PvP Game</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="player1" className="block text-sm font-medium text-gray-300 mb-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="player1"
                            value={player1}
                            onChange={(e) => setPlayer1(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your name"
                            autoComplete="off"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="player2" className="block text-sm font-medium text-gray-300 mb-1">
                            Friend's Name
                        </label>
                        <input
                            type="text"
                            id="player2"
                            value={player2}
                            onChange={(e) => setPlayer2(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter friend's name"
                            autoComplete="off"
                        />
                    </div>
                    
                    <div className="mt-6">
                        <p className="text-sm text-gray-400 mb-2">Game Link (Share with friend)</p>
                        <div className="flex">
                            <input
                                type="text"
                                readOnly
                                value={gameLink}
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-sm text-gray-300 truncate"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors flex items-center ${isCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                                {isCopied ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStartGame}
                            disabled={!player1.trim() || !player2.trim()}
                            className={`px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg transition-all flex-1 
                                ${(!player1.trim() || !player2.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-emerald-700'}`}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PvPSetup;
