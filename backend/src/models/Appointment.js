const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'voice', 'video'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number,
    required: true,
    enum: [15, 30, 45, 60], // in minutes
    default: 30
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  fees: {
    consultationFee: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      required: true
    },
    totalFee: {
      type: Number,
      required: true
    }
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  documents: [{
    type: String // S3 URLs
  }],
  meetingLink: {
    type: String,
    default: ''
  },
  roomId: {
    type: String,
    default: ''
  },
  notes: {
    lawyerNotes: {
      type: String,
      maxlength: [2000, 'Lawyer notes cannot exceed 2000 characters']
    },
    userNotes: {
      type: String,
      maxlength: [2000, 'User notes cannot exceed 2000 characters']
    }
  },
  rating: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userReview: {
      type: String,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    lawyerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lawyerReview: {
      type: String,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    }
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
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
appointmentSchema.index({ userId: 1, scheduledDate: -1 });
appointmentSchema.index({ lawyerId: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ paymentStatus: 1 });
appointmentSchema.index({ scheduledDate: 1 });

// Virtual for calculated time until appointment
appointmentSchema.virtual('timeUntilAppointment').get(function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  return scheduledTime.getTime() - now.getTime();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  const timeDiff = scheduledTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Can cancel if more than 2 hours before appointment
  return hoursDiff > 2 && ['pending', 'confirmed'].includes(this.status);
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledDate);
  return scheduledTime > now && ['pending', 'confirmed'].includes(this.status);
};

// Pre-save middleware to calculate total fees
appointmentSchema.pre('save', function(next) {
  if (this.isModified('fees.consultationFee')) {
    this.fees.platformFee = Math.round(this.fees.consultationFee * 0.1); // 10% platform fee
    this.fees.totalFee = this.fees.consultationFee + this.fees.platformFee;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
