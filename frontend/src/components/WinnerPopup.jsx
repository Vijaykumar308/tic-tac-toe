const WinnerPopup = ({ winner, isDraw, onClose, gameMode }) => {
    if (!winner && !isDraw) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-gray-700 transform transition-all duration-300 animate-popIn">
                <div className="text-center">
                    <div className={`w-20 h-20 ${isDraw ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 'bg-gradient-to-r from-yellow-400 to-pink-500'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <span className="text-4xl">{isDraw ? '🤝' : '🏆'}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {isDraw ? 'Game Drawn!' : 'Congratulations!'}
                    </h2>
                    {!isDraw && (
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                            <span className={`font-bold text-3xl ${winner === 'X' ? 'text-blue-500' : 'text-pink-500'}`}>
                                {winner}
                            </span> wins the game!
                        </p>
                    )}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                                       text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                                       flex items-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <span className="mr-2">🔄</span> Play Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinnerPopup;