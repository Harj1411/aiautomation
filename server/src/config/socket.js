const { Server } = require('socket.io');

let io = null;

const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join:execution', (executionId) => {
      socket.join(`execution:${executionId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined execution:${executionId}`);
    });

    socket.on('leave:execution', (executionId) => {
      socket.leave(`execution:${executionId}`);
      console.log(`[Socket.IO] Socket ${socket.id} left execution:${executionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getSocketIO = () => io;

const emitAgentEvent = (executionId, data) => {
  if (io) {
    io.to(`execution:${executionId}`).emit('agent:step', data);
    io.emit('execution:update', data);
  }
};

const emitNotification = (userId, notification) => {
  if (io) {
    io.emit(`notification:${userId}`, notification);
  }
};

module.exports = {
  initSocket,
  getSocketIO,
  emitAgentEvent,
  emitNotification
};
