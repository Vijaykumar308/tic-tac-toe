import { useState, useEffect } from 'react';
import { socketClient } from './utils/socket-client';

const PvPSetup = ({ onStart }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');

  // Get roomId from URL if it exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomIdFromUrl = params.get('roomId');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, []);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await socketClient.createGame(playerName);
      const gameLink = `${window.location.origin}?roomId=${response.roomId}`;
      setShareLink(gameLink);
      
      // Call onStart with the correct data structure
      onStart({
        roomId: response.roomId,
        players: [{ name: playerName, symbol: 'X' }],
        isHost: true
      });
    } catch (err) {
      setError(err.message || 'Failed to create game');
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await socketClient.joinGame(roomId, playerName);
      onStart({
        roomId: response.roomId,
        players: response.players || [], // Ensure players is an array
        isHost: false
      });
    } catch (err) {
      setError(err.message || 'Failed to join game');
      setIsJoining(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (shareLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Created!</h2>
          <p className="text-gray-600 mb-4">Share this link with your friend:</p>
          
          <div className="flex items-center mb-6">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none"
            >
              Copy
            </button>
          </div>
          
          <p className="text-gray-500 text-sm">Waiting for opponent to join...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Play Tic Tac Toe</h2>
        
        <form onSubmit={handleCreateGame} className="mb-8">
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Game...' : 'Create New Game'}
          </button>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleJoinGame}>
          <div className="mb-4">
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter room ID"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isJoining}
            className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining Game...' : 'Join Existing Game'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PvPSetup;