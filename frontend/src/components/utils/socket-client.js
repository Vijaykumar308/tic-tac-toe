import {io} from "socket.io-client";

export const createSocketConnection = () => {
  return new Promise((resolve, reject) => {
    const socket = io(import.meta.env.VITE_BACKEND_API);

    socket.on("connect", () => {
      console.log("WS Connection Established...");
      resolve(socket); // ✅ only resolve once connected
    });

    socket.on("connect_error", (err) => {
      reject(err); // ✅ reject on connection error
    });
  });
};
