const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const { authenticate, rateLimitByUser } = require('../middleware/auth');
const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite' });

// Legal system prompt for AI
const LEGAL_SYSTEM_PROMPT = `You are a helpful AI legal assistant for the Indian legal system. Your role is to provide general legal information and guidance, not specific legal advice. 

Important guidelines:
1. Always clarify that you are not a lawyer and your responses are for informational purposes only
2. Encourage users to consult with qualified lawyers for specific legal matters
3. Provide information about Indian laws, legal procedures, and general legal concepts
4. Be helpful, clear, and concise in your responses
5. If you're unsure about something, admit it and suggest consulting a lawyer
6. Focus on commonly asked legal topics in India: family law, property law, consumer rights, etc.
7. Provide references to relevant Indian laws, acts, or sections when applicable
8. Never provide specific legal advice for ongoing cases or situations

Remember: Your goal is to educate and guide users about the Indian legal system, not to replace professional legal counsel.`;

// Enhanced legal system prompt for anonymous users
const ANONYMOUS_LEGAL_SYSTEM_PROMPT = `You are an AI Legal Assistant for India.

Rules:
- Answer ONLY law-related questions
- Use Indian laws: IPC, CrPC, CPC, Constitution, IT Act, Companies Act
- Explain in simple language
- Mention sections where applicable
- Add disclaimer at the end: "This information is for educational purposes only and not legal advice."
- Never ask for personal information or case details
- Do not store or remember any user information

If question is not legal, reply: "I can assist only with legal-related queries."

IMPORTANT: This is an anonymous chat. Do not request any personal information, case details, or identifying information. Focus only on general legal knowledge.`;

// @route   POST /api/ai/chat
// @desc    Send message to AI chat
router.post('/chat', authenticate, rateLimitByUser(20, 60000), [ // 20 messages per minute
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
  body('chatId').optional().custom((value) => {
    if (!value) return true; // Optional field
    // Simple ObjectId validation - 24 character hex string
    return /^[0-9a-fA-F]{24}$/.test(value) || 'Invalid chat ID format';
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message, chatId } = req.body;
    const userId = req.user._id;

    // Find or create chat session
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(userId)) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found or access denied'
        });
      }
    } else {
      // Create new chat session
      chat = new Chat({
        participants: [
          { user: userId, role: 'user' },
          { user: null, role: 'ai' }
        ],
        type: 'ai',
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        status: 'active'
      });
      await chat.save();
    }

    // Add user message to chat
    await chat.addMessage({
      sender: userId,
      content: message,
      type: 'text',
      isAI: false
    });

    // Generate AI response
    try {
      const prompt = `${LEGAL_SYSTEM_PROMPT}\n\nUser: ${message}`;
      console.log('🤖 Sending prompt to AI:', prompt.substring(0, 100) + '...');

      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });

      const aiResponse = result.response.text();
      console.log('✅ AI response received:', aiResponse.substring(0, 100) + '...');

      // Add AI response to chat
      const aiMessage = await chat.addMessage({
        sender: null, // AI messages don't have a sender user
        content: aiResponse,
        type: 'text',
        isAI: true,
        aiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
        tokenUsage: {
          prompt: result.response.promptTokenCount || 0,
          completion: result.response.candidatesTokenCount || 0,
          total: (result.response.promptTokenCount || 0) + (result.response.candidatesTokenCount || 0)
        }
      });

      // Update AI session data
      chat.aiSessionData.totalTokens += aiMessage.tokenUsage.total;
      // Calculate cost (approximate: $0.0001 per 1000 tokens)
      chat.aiSessionData.totalCost = Math.round(chat.aiSessionData.totalTokens * 0.0001) / 1000;
      await chat.save();

      res.json({
        success: true,
        message: 'Response generated successfully',
        data: {
          chatId: chat._id,
          userMessage: {
            id: chat.messages[chat.messages.length - 2]._id,
            content: message,
            createdAt: chat.messages[chat.messages.length - 2].createdAt
          },
          aiResponse: {
            id: aiMessage._id,
            content: aiResponse,
            createdAt: aiMessage.createdAt,
            tokenUsage: aiMessage.tokenUsage
          },
          sessionData: {
            totalTokens: chat.aiSessionData.totalTokens,
            totalCost: chat.aiSessionData.totalCost,
            modelUsed: chat.aiSessionData.modelUsed
          }
        }
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);

      // Add error message to chat
      await chat.addMessage({
        sender: null,
        content: 'I apologize, but I encountered an error generating a response. Please try again or contact our support team.',
        type: 'text',
        isAI: true,
        aiModel: 'error'
      });

      res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Chat AI error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });

    // Check if it's a Google AI quota error
    if (error.message && error.message.includes('quota')) {
      res.status(429).json({
        success: false,
        message: 'AI service temporarily unavailable due to quota limits. Please try again later.',
        errorType: 'quota_exceeded'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error processing AI chat',
      error: {
        type: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// @route   GET /api/ai/history
// @desc    Get user's AI chat history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      type: 'ai',
      'participants.user': req.user._id
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title lastMessage createdAt updatedAt status aiSessionData');

    const total = await Chat.countDocuments({
      type: 'ai',
      'participants.user': req.user._id
    });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching AI chat history'
    });
  }
});

// @route   GET /api/ai/chat/:id
// @desc    Get specific AI chat with messages
router.get('/chat/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'firstName lastName email profileImage');

    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Get AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching AI chat'
    });
  }
});

// @route   PUT /api/ai/chat/:id
// @desc    Update AI chat (title, feedback)
router.put('/chat/:id', authenticate, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('feedback').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const { title, rating, feedback } = req.body;

    if (title) {
      chat.title = title;
    }

    if (rating) {
      chat.rating = rating;
    }

    if (feedback) {
      chat.feedback = feedback;
    }

    await chat.save();

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Update AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating AI chat'
    });
  }
});

// @route   DELETE /api/ai/chat/:id
// @desc    Delete AI chat
router.delete('/chat/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    await Chat.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting AI chat'
    });
  }
});

// @route   POST /api/ai/chat/:id/end
// @desc    End AI chat session
router.post('/chat/:id/end', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.isParticipant(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    await chat.endChat(req.user._id);

    res.json({
      success: true,
      message: 'Chat session ended successfully',
      data: {
        chat,
        sessionSummary: {
          totalMessages: chat.messages.length,
          totalTokens: chat.aiSessionData.totalTokens,
          totalCost: chat.aiSessionData.totalCost,
          duration: Math.round((chat.endedAt - chat.createdAt) / 1000 / 60), // in minutes
          modelUsed: chat.aiSessionData.modelUsed
        }
      }
    });
  } catch (error) {
    console.error('End AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending AI chat'
    });
  }
});

// @route   GET /api/ai/usage
// @desc    Get user's AI usage statistics
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all AI chats for the user
    const chats = await Chat.find({
      type: 'ai',
      'participants.user': userId
    }).select('aiSessionData createdAt updatedAt');

    // Calculate usage statistics
    let totalTokens = 0;
    let totalCost = 0;
    let totalChats = chats.length;
    let totalMinutes = 0;

    chats.forEach(chat => {
      totalTokens += chat.aiSessionData.totalTokens || 0;
      totalCost += chat.aiSessionData.totalCost || 0;
      if (chat.endedAt && chat.createdAt) {
        totalMinutes += Math.round((chat.endedAt - chat.createdAt) / 1000 / 60);
      }
    });

    res.json({
      success: true,
      data: {
        usage: {
          totalChats,
          totalTokens,
          totalCost,
          totalMinutes,
          averageTokensPerChat: totalChats > 0 ? Math.round(totalTokens / totalChats) : 0,
          averageMinutesPerChat: totalChats > 0 ? Math.round(totalMinutes / totalChats) : 0
        },
        monthlyUsage: {
          // This month's usage
          currentMonth: new Date().getMonth(),
          currentYear: new Date().getFullYear(),
          monthlyChats: chats.filter(chat => {
            const chatDate = new Date(chat.createdAt);
            return chatDate.getMonth() === new Date().getMonth() &&
              chatDate.getFullYear() === new Date().getFullYear();
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching AI usage'
    });
  }
});

// @route   POST /api/ai/anonymous-chat
// @desc    Anonymous AI legal chat (no authentication, no storage)
router.post('/anonymous-chat', [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message } = req.body;

    // Generate AI response for anonymous user
    try {
      const prompt = `${ANONYMOUS_LEGAL_SYSTEM_PROMPT}\n\nUser: ${message}`;
      console.log('🔒 Anonymous AI request:', prompt.substring(0, 100) + '...');

      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }]
      });

      const aiResponse = result.response.text();
      console.log('✅ Anonymous AI response received:', aiResponse.substring(0, 100) + '...');

      res.json({
        success: true,
        message: 'Response generated successfully',
        data: {
          aiResponse: {
            content: aiResponse,
            timestamp: new Date().toISOString(),
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
            anonymous: true
          }
        }
      });
    } catch (aiError) {
      console.error('Anonymous AI generation error:', aiError);

      res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.',
        errorType: 'ai_service_error'
      });
    }
  } catch (error) {
    console.error('Anonymous chat error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });

    // Check if it's a Google AI quota error
    if (error.message && error.message.includes('quota')) {
      res.status(429).json({
        success: false,
        message: 'AI service temporarily unavailable due to high demand. Please try again later.',
        errorType: 'quota_exceeded'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error processing anonymous chat request',
      error: {
        type: error.name,
        message: error.message
      }
    });
  }
});

module.exports = router;
