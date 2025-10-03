import { useState, useEffect, useCallback } from 'react';
import { socketClient } from './utils/socket-client';

const PvPSetup = ({ onStart }) => {
    const [playerName, setPlayerName] = useState('');
    const [gameLink, setGameLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [roomId, setRoomId] = useState('');

    useEffect(() => {
        // Check for join link in URL
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get('join');
        if (joinId) {
            setMode('join');
            setRoomId(joinId);
        }

        // Setup socket listeners
        const handleGameStart = (data) => {
            console.log('Game started:', data);
            onStart(data);
        };

        const handleError = (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'An error occurred');
            setIsJoining(false);
        };

        socketClient.onGameStart(handleGameStart);
        socketClient.onError(handleError);

        return () => {
            socketClient.cleanup();
        };
    }, [onStart]);

    const handleCreateGame = useCallback(async (e) => {
        e?.preventDefault();
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsJoining(true);
        setError('');

        socketClient.createGame(playerName, (response) => {
            if (response.error) {
                setError(response.error);
                setIsJoining(false);
            } else {
                const link = `${window.location.origin}?join=${response.roomId}`;
                setGameLink(link);
                // The game will start when the second player joins (handled in handleGameStart)
            }
        });
    }, [playerName]);

    const handleJoinGame = useCallback(async (e) => {
        e?.preventDefault();
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!roomId) {
            setError('Please enter a valid game ID');
            return;
        }

        setIsJoining(true);
        setError('');

        socketClient.joinGame(roomId, playerName, (response) => {
            if (response.error) {
                setError(response.error);
                setIsJoining(false);
            }
            // The game will start when the second player joins (handled in handleGameStart)
        });
    }, [playerName, roomId]);

    const copyToClipboard = useCallback(() => {
        if (!gameLink) return;
        navigator.clipboard.writeText(gameLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [gameLink]);

    const handleSubmit = mode === 'create' ? handleCreateGame : handleJoinGame;

    if (gameLink) {
        return (
            <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Share Game Link</h2>
                <p className="mb-4">Send this link to your friend to start playing:</p>
                <div className="flex mb-4">
                    <input
                        type="text"
                        readOnly
                        value={gameLink}
                        className="flex-1 p-2 border rounded-l"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                        disabled={isCopied}
                    >
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <p className="text-gray-600">Waiting for opponent to join...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {mode === 'create' ? 'Create Game' : 'Join Game'}
            </h2>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {mode === 'join' && (
                    <div>
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                            Game ID
                        </label>
                        <input
                            type="text"
                            id="roomId"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter game ID"
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isJoining}
                    className={`w-full py-2 px-4 rounded text-white font-medium ${
                        isJoining
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isJoining 
                        ? 'Loading...' 
                        : mode === 'create' ? 'Create Game' : 'Join Game'
                    }
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => setMode(mode === 'create' ? 'join' : 'create')}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                        {mode === 'create' 
                            ? 'Have a game ID? Join an existing game' 
                            : 'Want to create a new game instead?'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PvPSetup;