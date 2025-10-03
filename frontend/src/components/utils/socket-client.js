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
      console.log('Creating game for player:', playerName);
      this.socket.emit('createGame', { playerName }, (response) => {
        if (response.error) {
          console.error('Error creating game:', response.error);
          reject(response.error);
        } else {
          console.log('Game created:', response);
          resolve(response);
        }
      });
    });
  }

  joinGame(roomId, playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) this.connect();
      console.log(`Joining game ${roomId} as ${playerName}`);
      this.socket.emit('joinGame', { roomId, playerName }, (response) => {
        if (response.error) {
          console.error('Error joining game:', response.error);
          reject(response.error);
        } else {
          console.log('Joined game:', response);
          resolve(response);
        }
      });
    });
  }

  makeMove(data) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    console.log('Sending move:', data);
    this.socket.emit('makeMove', data);
  }

  onGameUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.off('gameUpdate');
    this.socket.on('gameUpdate', (data) => {
      console.log('Game update received:', data);
      callback(data);
    });
  }

  onPlayerJoined(callback) {
    if (!this.socket) this.connect();
    this.socket.off('playerJoined');
    this.socket.on('playerJoined', (player) => {
      console.log('Player joined:', player);
      callback(player);
    });
  }

  onGameStart(callback) {
    if (!this.socket) this.connect();
    this.socket.off('gameStart');
    this.socket.on('gameStart', (data) => {
      console.log('Game started:', data);
      callback(data);
    });
  }

  onError(callback) {
    if (!this.socket) this.connect();
    this.socket.off('error');
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      callback(error);
    });
  }

  cleanup() {
    if (!this.socket) return;
    this.socket.offAny();
  }
}

export const socketClient = new SocketClient();