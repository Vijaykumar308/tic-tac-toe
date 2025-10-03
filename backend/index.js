const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,  // Add this line
    allowedHeaders: ["my-custom-header"],
  }
});

// Store active games
const games = new Map();

// Generate a random 6-character room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle creating a new game room
  socket.on('createGame', ({ playerName }, callback) => {
    const roomId = generateRoomId();
    const player = {
      id: socket.id,
      name: playerName,
      symbol: 'X'
    };

    games.set(roomId, {
      players: [player],
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting',
    });

    socket.join(roomId);
    callback({ roomId, player });
    console.log(`Game created with ID: ${roomId}`);
  });

  // Handle joining an existing game
  socket.on('joinGame', ({ roomId, playerName }, callback) => {
    const game = games.get(roomId);
    
    if (!game) {
      return callback({ error: 'Game not found' });
    }

    if (game.players.length >= 2) {
      return callback({ error: 'Game is full' });
    }

    const player = {
      id: socket.id,
      name: playerName,
      symbol: 'O'
    };

    game.players.push(player);
    game.status = 'in-progress';
    
    socket.join(roomId);
    
    // Notify both players that the game has started
    io.to(roomId).emit('gameStart', {
      players: game.players,
      currentPlayer: game.currentPlayer,
      board: game.board
    });

    callback({ success: true, player });
  });

  // Handle player moves
  socket.on('makeMove', ({ roomId, index, symbol }) => {
    const game = games.get(roomId);
    if (!game || game.status !== 'in-progress') return;

    // Validate move
    if (game.board[index] !== null || game.currentPlayer !== symbol) {
      return;
    }

    // Update game state
    game.board[index] = symbol;
    game.currentPlayer = symbol === 'X' ? 'O' : 'X';

    // Check for winner or draw
    const winner = checkWinner(game.board);
    if (winner) {
      game.status = 'finished';
      game.winner = winner;
    } else if (game.board.every(cell => cell !== null)) {
      game.status = 'finished';
      game.winner = 'draw';
    }

    // Broadcast updated game state to all players in the room
    io.to(roomId).emit('gameUpdate', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner
    });
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle player disconnection logic
  });
});

// Helper function to check for a winner
function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});