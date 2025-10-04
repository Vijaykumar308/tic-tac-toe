const GameModeSelector = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tic Tac Toe</h1>
        <p className="text-gray-600 mb-8">Select game mode to start playing</p>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('pvp')}
            className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 
                       transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2"
          >
            Player vs Player (Online)
          </button>
          
          <button
            onClick={() => onSelectMode('pvc')}
            className="w-full py-3 px-6 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 
                       transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 
                       focus:ring-offset-2"
          >
            Player vs Computer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;