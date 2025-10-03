// creating Server
import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 4000;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin:"http://localhost:5173",
        methods:['GET', 'POST']
    }
});

// make socket
io.on("connection", (socket) => {
    console.log("Connection established", socket.id);

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });
});








httpServer.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
});