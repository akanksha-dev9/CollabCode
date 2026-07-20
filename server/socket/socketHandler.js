const Room = require('../models/Room');
const { transform, applyOperation } = require('../ot/ot');
const terminalHandler = require('./terminalHandler');

// Room states memory mein
const roomStates = {};

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.username = username;
      socket.roomId = roomId;

      let room = await Room.findOne({ roomId });
      if (!room) {
        room = await Room.create({ roomId });
      }

      // Room state initialize karo agar nahi hai
      if (!roomStates[roomId]) {
        roomStates[roomId] = {
          content: room.code,
          revision: 0,
          history: []
        };
      }

      socket.emit('load-document', {
        code: roomStates[roomId].content,
        language: room.language,
        revision: roomStates[roomId].revision,
        chat: room.chat
      });

      socket.to(roomId).emit('user-joined', { username });

      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      const users = clients.map(id => ({
        socketId: id,
        username: io.sockets.sockets.get(id)?.username || 'Anonymous'
      }));
      io.in(roomId).emit('users-update', users);

      console.log(`${username} joined room ${roomId}`);
    });

    socket.on('code-change', async ({ roomId, operation, revision }) => {
      const state = roomStates[roomId];
      if (!state) return;

      // Simple content sync — OT ke saath
      let op = { ...operation };

      // Client ke revision ke baad jo operations aaye unke against transform karo
      const concurrentOps = state.history.slice(revision);
      for (const pastOp of concurrentOps) {
        if (op.type && pastOp.type) {
          // Actual OT transform — dono operations hain
          op = transform(op, pastOp);
          if (!op) return;
        }
      }

      // State update karo
      if (op.content !== undefined) {
        // Content based sync — fallback
        state.content = op.content;
      } else if (op.type) {
        // OT operation apply karo
        state.content = applyOperation(state.content, op);
      }

      state.revision++;
      state.history.push(op);

      // MongoDB save karo
      await Room.findOneAndUpdate(
        { roomId },
        { code: state.content }
      );

      // Broadcast to others
      socket.to(roomId).emit('code-update', {
        operation: op,
        revision: state.revision
      });
    });

    socket.on('language-change', async ({ roomId, language }) => {
      await Room.findOneAndUpdate({ roomId }, { language });
      socket.to(roomId).emit('language-updated', { language });
    });

    socket.on('send-message', async ({ roomId, message }) => {
      const chatMessage = {
        user: socket.username,
        message,
        timestamp: new Date()
      };
      await Room.findOneAndUpdate(
        { roomId },
        { $push: { chat: chatMessage } }
      );
      io.in(roomId).emit('receive-message', chatMessage);
    });

    socket.on('cursor-move', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        username: socket.username,
        cursor
      });
    });

    terminalHandler(io, socket);

    socket.on('disconnect', () => {
      if (socket.ptyProcess) socket.ptyProcess.kill();
      if (socket.dockerProcess && !socket.dockerProcess.killed) {
        socket.dockerProcess.kill();
      }

      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', { username: socket.username });

        const clients = Array.from(io.sockets.adapter.rooms.get(socket.roomId) || []);
        const users = clients.map(id => ({
          socketId: id,
          username: io.sockets.sockets.get(id)?.username || 'Anonymous'
        }));
        io.in(socket.roomId).emit('users-update', users);

        // Room empty hone pe state clean karo
        if (clients.length === 0) {
          delete roomStates[socket.roomId];
        }
      }

      console.log('User disconnected:', socket.id);
    });
  });
};