const Room = require('../models/Room');
const { transform } = require('../ot/ot');

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.username = username;
      socket.roomId = roomId;

      // Find or create room in DB
      let room = await Room.findOne({ roomId });
      if (!room) {
        room = await Room.create({ roomId });
      }

      // Send current code to the user who just joined
      socket.emit('load-document', {
        code: room.code,
        language: room.language
      });

      // Notify others
      socket.to(roomId).emit('user-joined', { username });

      // Send active users list
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      const users = clients.map(id => ({
        socketId: id,
        username: io.sockets.sockets.get(id)?.username || 'Anonymous'
      }));
      io.in(roomId).emit('users-update', users);

      console.log(`${username} joined room ${roomId}`);
    });

    // Handle code changes with OT
    socket.on('code-change', async ({ roomId, operation, revision }) => {
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('code-update', { operation, revision });

      // Save latest code to DB
      await Room.findOneAndUpdate(
        { roomId },
        { code: operation.content }
      );
    });

    // Handle chat messages
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

    // Handle cursor position
    socket.on('cursor-move', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        username: socket.username,
        cursor
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', {
          username: socket.username
        });

        const clients = Array.from(io.sockets.adapter.rooms.get(socket.roomId) || []);
        const users = clients.map(id => ({
          socketId: id,
          username: io.sockets.sockets.get(id)?.username || 'Anonymous'
        }));
        io.in(socket.roomId).emit('users-update', users);
      }
      console.log('User disconnected:', socket.id);
    });
  });
};