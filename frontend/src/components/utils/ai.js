export const findBestMove = (squares, isXTurn) => {
    const player = isXTurn ? 'X' : 'O';
    const opponent = isXTurn ? 'O' : 'X';

    // Check if next move can win the game
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            const newSquares = [...squares];
            newSquares[i] = player;
            if (checkWinner(newSquares) === player) {
                return i;
            }
        }
    }

    // Block opponent's winning move
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            const newSquares = [...squares];
            newSquares[i] = opponent;
            if (checkWinner(newSquares) === opponent) {
                return i;
            }
        }
    }

    // Take center if available
    if (!squares[4]) return 4;

    // Take corners if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !squares[i]);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(i => !squares[i]);
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }

    return -1;
};

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