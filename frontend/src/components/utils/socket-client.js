import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(import.meta.env.VITE_BACKEND_API || 'http://localhost:4000', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  disconnect() {
    if (this.socket) {
      this.cleanup();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createGame(playerName, callback) {
    if (!this.socket) this.connect();
    this.socket.emit('createGame', { playerName }, callback);
  }

  joinGame(roomId, playerName, callback) {
    if (!this.socket) this.connect();
    this.socket.emit('joinGame', { roomId, playerName }, callback);
  }

  makeMove({ roomId, index, symbol }) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('makeMove', { roomId, index, symbol });
  }

  onGameStart(callback) {
    if (!this.socket) this.connect();
    this.socket.on('gameStart', callback);
    this.listeners.set('gameStart', callback);
  }

  onGameUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('gameUpdate', callback);
    this.listeners.set('gameUpdate', callback);
  }

  onError(callback) {
    if (!this.socket) this.connect();
    this.socket.on('error', callback);
    this.listeners.set('error', callback);
  }

  onDisconnect(callback) {
    if (!this.socket) this.connect();
    this.socket.on('disconnect', callback);
    this.listeners.set('disconnect', callback);
  }

  cleanup() {
    if (!this.socket) return;
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
  }
}

export const socketClient = new SocketClient();