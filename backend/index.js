require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Parse frontend URLs from environment variable
const frontendUrls = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// console.log(frontendUrls);
app.use(cors({
  origin: frontendUrls,
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: frontendUrls,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const games = new Map();

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

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
  // console.log('User connected:', socket.id);

  socket.on('createGame', ({ playerName }, callback) => {
    const roomId = generateRoomId();
    const player = { id: socket.id, name: playerName, symbol: 'X' };

    games.set(roomId, {
      players: [player],
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting',
      winner: null,
      isDraw: false
    });

    socket.join(roomId);
    // console.log(`Game created: ${roomId} by ${playerName}`);
    
    callback({ 
      success: true,
      roomId,
      players: [player],
      isHost: true
    });
  });

  socket.on('joinGame', ({ roomId, playerName }, callback) => {
    const game = games.get(roomId);
    
    if (!game) return callback({ error: 'Game not found' });
    if (game.players.length >= 2) return callback({ error: 'Game is full' });

    const player = { id: socket.id, name: playerName, symbol: 'O' };
    game.players.push(player);
    game.status = 'in-progress';
    
    socket.join(roomId);
    
    io.to(roomId).emit('playerJoined', player);
    io.to(roomId).emit('gameStart', {
      roomId,
      players: game.players,
      currentPlayer: 'X',
      board: game.board,
      status: 'in-progress'
    });

    // console.log(`Player ${playerName} joined game ${roomId}`);
    callback({ 
      success: true, 
      roomId,
      players: game.players,
      isHost: false
    });
  });

  socket.on('makeMove', (data) => {
    const { roomId, index, symbol } = data;
    const game = games.get(roomId);
    if (!game) return // console.log('Game not found:', roomId);
  
    if (game.board[index] !== null) {
      // console.log('Invalid move: Cell already taken');
      return;
    }
  
    if (game.currentPlayer !== symbol) {
      // console.log('Invalid move: Not player\'s turn');
      return;
    }
  
    game.board[index] = symbol;
    game.currentPlayer = symbol === 'X' ? 'O' : 'X';
  
    const winner = checkWinner(game.board);
    const isDraw = !winner && game.board.every(cell => cell !== null);
    
    if (winner) {
      game.winner = winner;
      game.status = 'finished';
    } else if (isDraw) {
      game.isDraw = true;
      game.status = 'finished';
    }
  
    const updateData = {
      board: [...game.board],
      currentPlayer: game.currentPlayer,
      isXTurn: game.currentPlayer === 'X',
      status: game.status,
      winner: game.winner,
      isDraw: game.isDraw
    };
  
    // console.log('Broadcasting update:', updateData);
    io.to(roomId).emit('gameUpdate', updateData);
  });

  socket.on('restartGame', ({ roomId }) => {
    const game = games.get(roomId);
    if (!game) return;

    // console.log(`Restarting game in room ${roomId}`);
    game.board = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.winner = null;
    game.isDraw = false;
    game.status = 'in-progress';

    io.to(roomId).emit('gameUpdate', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      isXTurn: true,
      status: 'in-progress',
      winner: null,
      isDraw: false
    });
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
    
    for (const [roomId, game] of games.entries()) {
      game.players = game.players.filter(player => player.id !== socket.id);
      if (game.players.length === 0) {
        games.delete(roomId);
        // console.log(`Removed empty game: ${roomId}`);
      } else {
        io.to(roomId).emit('playerDisconnected', { playerId: socket.id });
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${frontendUrls.join(', ')}`);
});