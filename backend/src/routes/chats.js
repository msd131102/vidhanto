const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Chat = require('../models/Chat');

// Get all chats for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chat.countDocuments({ userId: req.user.id });

    res.json({
      chats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Get a specific chat
router.get('/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

// Create a new chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, messages } = req.body;

    const chat = new Chat({
      userId: req.user.id,
      title: title || 'New Chat',
      messages: messages || []
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat' });
  }
});

// Add message to chat
router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { message, isUser } = req.body;

    const chat = await Chat.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      content: message,
      isUser,
      timestamp: new Date()
    });

    chat.updatedAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message' });
  }
});

// Update chat title
router.put('/:id/title', authenticate, async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chat' });
  }
});

// Delete a chat
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

// Get chat statistics
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const stats = await Chat.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalMessages: { $sum: { $size: '$messages' } },
          lastChatDate: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        totalChats: 0,
        totalMessages: 0,
        lastChatDate: null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat stats' });
  }
});

module.exports = router;
