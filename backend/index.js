const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: ["http://10.66.81.193:5173", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://10.66.81.193:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const games = new Map();

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const checkWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];
  
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new game
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
    console.log(`Game created: ${roomId} by ${playerName}`);
    
    callback({ 
      success: true,
      roomId,
      players: [player],
      isHost: true
    });
  });

  // Join existing game
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
    
    // Notify all players in the room
    io.to(roomId).emit('playerJoined', player);
    
    // Start the game
    io.to(roomId).emit('gameStart', {
      roomId,
      players: game.players,
      currentPlayer: 'X'
    });

    console.log(`Player ${playerName} joined game ${roomId}`);
    callback({ 
      success: true, 
      roomId,
      players: game.players,
      isHost: false
    });
  });

  // Handle player moves
  socket.on('makeMove', (data) => {
    const { roomId, index, symbol, isXTurn } = data;
    const game = games.get(roomId);
    
    if (!game) {
      console.log('Game not found:', roomId);
      return;
    }
  
    // Validate the move
    if (game.board[index] !== null) {
      console.log('Invalid move: Cell already taken');
      return;
    }
  
    // FIXED: Validate it's the correct player's turn
    if (game.currentPlayer !== symbol) {
      console.log('Invalid move: Not player\'s turn');
      return;
    }
  
    // Update the game state
    game.board[index] = symbol;
    game.currentPlayer = symbol === 'X' ? 'O' : 'X';
  
    // Check for winner or draw
    const winner = checkWinner(game.board);
    const isDraw = !winner && game.board.every(cell => cell !== null);
  
    // Prepare update data
    const updateData = {
      board: [...game.board],
      index,
      symbol,
      isXTurn: game.currentPlayer === 'X', // Send correct turn state
      winner: winner || null,
      isDraw
    };
  
    console.log('Broadcasting update:', updateData);
    io.to(roomId).emit('gameUpdate', updateData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up empty games
    for (const [roomId, game] of games.entries()) {
      game.players = game.players.filter(player => player.id !== socket.id);
      if (game.players.length === 0) {
        games.delete(roomId);
        console.log(`Removed empty game: ${roomId}`);
      } else {
        // Notify remaining player about disconnection
        io.to(roomId).emit('playerDisconnected', { playerId: socket.id });
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});