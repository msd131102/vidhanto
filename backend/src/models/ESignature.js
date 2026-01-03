const mongoose = require('mongoose');

const eSignatureSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  signers: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    signatureType: {
      type: String,
      enum: ['draw', 'type', 'upload'],
      default: 'draw'
    },
    signatureData: {
      type: String, // Base64 encoded signature
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    signedAt: {
      type: Date,
      default: Date.now
    },
    otp: {
      type: String,
      required: true
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    otpSentAt: {
      type: Date
    },
    order: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'otp_sent', 'signed', 'completed'],
      default: 'pending'
    }
  }],
  settings: {
    requireOTP: {
      type: Boolean,
      default: true
    },
    allowDrawSignature: {
      type: Boolean,
      default: true
    },
    allowTypeSignature: {
      type: Boolean,
      default: true
    },
    allowUploadSignature: {
      type: Boolean,
      default: false
    },
    signatureRequired: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: 'Please sign this document'
    },
    redirectUrl: {
      type: String
    }
  },
  auditTrail: [{
    action: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  completedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
eSignatureSchema.index({ documentId: 1 });
eSignatureSchema.index({ 'signers.email': 1 });
eSignatureSchema.index({ status: 1 });
eSignatureSchema.index({ createdAt: -1 });

// Virtual for checking if all signers have signed
eSignatureSchema.virtual('allSignersSigned').get(function() {
  if (!this.signers || this.signers.length === 0) return false;
  return this.signers.every(signer => signer.status === 'completed');
});

// Virtual for completion percentage
eSignatureSchema.virtual('completionPercentage').get(function() {
  if (!this.signers || this.signers.length === 0) return 0;
  const signedCount = this.signers.filter(signer => signer.status === 'completed').length;
  return Math.round((signedCount / this.signers.length) * 100);
});

// Pre-save middleware
eSignatureSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    
    // Add to audit trail
    this.auditTrail.push({
      action: 'document_completed',
      details: {
        totalSigners: this.signers.length,
        completedAt: new Date()
      }
    });
  }
  next();
});

module.exports = mongoose.model('ESignature', eSignatureSchema);
