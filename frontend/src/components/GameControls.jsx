// src/components/GameControls.jsx
import React from 'react';

const GameControls = ({ onNewGame, onBackToMenu }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <button
        onClick={onBackToMenu}
        className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 
                   text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                   flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      >
        Back to Menu
      </button>
      <button
        onClick={onNewGame}
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                   text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                   flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        New Game
      </button>
    </div>
  );
};

export default GameControls;