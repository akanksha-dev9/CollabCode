const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { username } = req.body;
    const roomId = uuidv4().slice(0, 8); // short unique id like "a1b2c3d4"

    const room = await Room.create({ roomId });

    res.json({
      success: true,
      roomId: room.roomId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check if a room exists
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({
      success: true,
      roomId: room.roomId,
      language: room.language
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Save a snapshot
router.post('/:roomId/snapshot', async (req, res) => {
  try {
    const { code } = req.body;

    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $push: { snapshots: { code } } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, message: 'Snapshot saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get chat history
router.get('/:roomId/chat', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, chat: room.chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;