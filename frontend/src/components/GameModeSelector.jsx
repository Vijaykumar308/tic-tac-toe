import React from 'react';

const GameModeSelector = ({ onSelectMode }) => {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Select Game Mode
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onSelectMode('pvp')}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                     text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                     flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          <span className="mr-2">👥</span> Player vs Player
        </button>
        <button
          onClick={() => onSelectMode('pvc')}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 
                     text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                     flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <span className="mr-2">🤖</span> Play vs Computer
        </button>
      </div>
    </div>
  );
};

export default GameModeSelector;
