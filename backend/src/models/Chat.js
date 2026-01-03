const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'audio', 'video'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  isAI: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    default: ''
  },
  tokenUsage: {
    prompt: Number,
    completion: Number,
    total: Number
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'lawyer', 'admin'],
      required: true
    }
  }],
  type: {
    type: String,
    enum: ['ai', 'lawyer', 'support'],
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'archived'],
    default: 'active'
  },
  endedAt: {
    type: Date
  },
  endedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  aiSessionData: {
    totalTokens: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    modelUsed: {
      type: String,
      default: 'gemini-2.0-flash-lite'
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ appointmentId: 1 });

// Virtual to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Virtual to get other participant for 1-on-1 chats
chatSchema.virtual('otherParticipant').get(function() {
  if (this.participants.length === 2) {
    return this.participants.find(p => p.role === 'lawyer') || this.participants.find(p => p.role === 'user');
  }
  return null;
});

// Pre-save middleware to update lastMessage
chatSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMessage.content,
      sender: lastMessage.sender,
      createdAt: lastMessage.createdAt
    };
  }
  next();
});

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.updatedAt = new Date();
  return this.save();
};

// Method to end chat
chatSchema.methods.endChat = function(endedBy) {
  this.status = 'ended';
  this.endedAt = new Date();
  this.endedBy = endedBy;
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
