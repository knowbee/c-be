import { Server } from "socket.io";

import eventEmitter from "./eventEmitter";

export default (app) => {
  const io = new Server(app, {
    cors: {
      origin: "*",
      methods: "*",
    },
  });

  io.on("connection", (client) => {
    eventEmitter.on("messageSent", (message) => {
      client.emit("incomingMessage", {
        message,
      });
    });
  });

  return io;
};
