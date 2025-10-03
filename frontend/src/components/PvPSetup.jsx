import { useState, useCallback, useEffect } from 'react';
import { socketClient } from './utils/socket-client';

const PvPSetup = ({ onStart }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [gameLink, setGameLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Set up socket listeners when component mounts
        const handleGameStart = (gameData) => {
            console.log('Game started:', gameData);
            onStart(gameData);
        };

        const handleError = (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'An error occurred');
        };

        socketClient.onGameStart(handleGameStart);
        socketClient.onError(handleError);

        // Clean up on unmount
        return () => {
            socketClient.cleanup();
        };
    }, [onStart]);

    // Input change handlers
    const handleNameChange = (e) => {
        setPlayerName(e.target.value);
        setError('');
    };

    const handleRoomIdChange = (e) => {
        setRoomId(e.target.value.toUpperCase());
        setError('');
    };

    const toggleMode = () => {
        setMode(prev => prev === 'create' ? 'join' : 'create');
        setError('');
    };

    // Handle form submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (mode === 'join' && !roomId.trim()) {
            setError('Please enter a game ID');
            return;
        }

        if (mode === 'create') {
            socketClient.createGame(playerName, (response) => {
                if (response.error) {
                    setError(response.error);
                    return;
                }
                const link = `${window.location.origin}?join=${response.roomId}`;
                setGameLink(link);
            });
        } else {
            socketClient.joinGame(roomId, playerName, (response) => {
                if (response.error) {
                    setError(response.error);
                    return;
                }
                // onStart will be called when the game starts
            });
        }
    }, [playerName, roomId, mode]);

    // Copy game link to clipboard
    const copyToClipboard = () => {
        if (!gameLink) return;
        navigator.clipboard.writeText(gameLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // If we have a game link, show the share screen
    if (gameLink) {
        return (
            <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Share Game Link</h2>
                <p className="mb-4">Send this link to your friend to start playing:</p>
                <div className="flex mb-4 text-black">
                    <input
                        type="text"
                        readOnly
                        value={gameLink}
                        className="flex-1 p-2 border rounded-l focus:outline-none"
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

    // Show the setup form
    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {mode === 'create' ? 'Create Game' : 'Join Game'}
            </h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
                        onChange={handleNameChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter your name"
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
                            onChange={handleRoomIdChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter game ID"
                            required={mode === 'join'}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    {mode === 'create' ? 'Create Game' : 'Join Game'}
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={toggleMode}
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