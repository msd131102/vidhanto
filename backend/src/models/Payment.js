const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'document', 'consultation', 'subscription', 'refund'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'netbanking', 'wallet', 'card'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayTransactionId: {
    type: String,
    default: ''
  },
  gatewayOrderId: {
    type: String,
    default: ''
  },
  gatewaySignature: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  breakdown: {
    consultationFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    refundDate: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    sessionId: String
  },
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: {
    type: Date
  },
  processedAt: {
    type: Date
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
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ gatewayOrderId: 1 });

// Virtual for total amount with breakdown
paymentSchema.virtual('totalBreakdown').get(function() {
  return {
    subtotal: this.breakdown.consultationFee + this.breakdown.platformFee,
    tax: this.breakdown.tax,
    discount: this.breakdown.discount,
    total: this.amount
  };
});

// Method to check if payment can be retried
paymentSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && !this.refundDetails.refundId;
};

// Method to calculate refund amount (with platform fee deduction)
paymentSchema.methods.calculateRefundAmount = function() {
  if (this.status !== 'completed') return 0;
  
  // Refund consultation fee minus platform processing fee
  const processingFee = Math.round(this.amount * 0.02); // 2% processing fee
  return Math.max(0, this.amount - processingFee);
};

// Pre-save middleware to validate refund amount
paymentSchema.pre('save', function(next) {
  if (this.isModified('refundDetails.refundAmount') && this.refundDetails.refundAmount) {
    const maxRefund = this.calculateRefundAmount();
    if (this.refundDetails.refundAmount > maxRefund) {
      this.refundDetails.refundAmount = maxRefund;
    }
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
