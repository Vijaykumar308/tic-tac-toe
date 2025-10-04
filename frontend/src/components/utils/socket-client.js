import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(import.meta.env.VITE_BACKEND_API || 'http://localhost:4000', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.cleanup();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createGame(playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) this.connect();
      this.socket.emit('createGame', { playerName }, (response) => {
        if (response.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  joinGame(roomId, playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) this.connect();
      this.socket.emit('joinGame', { roomId, playerName }, (response) => {
        if (response.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  makeMove(data) {
    if (!this.socket) this.connect();
    this.socket.emit('makeMove', data);
  }

  restartGame(roomId) {
    if (this.socket) {
      this.socket.emit('restartGame', { roomId });
    }
  }

  onGameUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.off('gameUpdate');
    this.socket.on('gameUpdate', callback);
  }

  onPlayerJoined(callback) {
    if (!this.socket) this.connect();
    this.socket.off('playerJoined');
    this.socket.on('playerJoined', callback);
  }

  onGameStart(callback) {
    if (!this.socket) this.connect();
    this.socket.off('gameStart');
    this.socket.on('gameStart', callback);
  }

  onError(callback) {
    if (!this.socket) this.connect();
    this.socket.off('error');
    this.socket.on('error', callback);
  }

  cleanup() {
    if (!this.socket) return;
    this.socket.offAny();
  }
}

export const socketClient = new SocketClient();