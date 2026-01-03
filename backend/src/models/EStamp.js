const mongoose = require('mongoose');

const eStampSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
      'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru'
    ]
  },
  stampType: {
    type: String,
    required: true,
    enum: ['judicial', 'non-judicial', 'revenue', 'special adhesive']
  },
  stampValue: {
    type: Number,
    required: true,
    min: 0
  },
  stampValueCurrency: {
    type: String,
    default: 'INR'
  },
  instrumentType: {
    type: String,
    enum: ['agreement', 'bond', 'deed', 'power_of_attorney', 'affidavit', 'indemnity_bond'],
    required: true
  },
  instrumentNumber: {
    type: String
  },
  instrumentDate: {
    type: Date,
    required: true
  },
  parties: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['first_party', 'second_party', 'witness', 'authorizer'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    pan: String,
    aadhaar: String
  }],
  description: {
    type: String,
    required: true
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'offline'],
      required: true
    },
    transactionId: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'paytm', 'phonepe'],
      required: true
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  stampCertificate: {
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    },
    qrCode: {
      type: String
    },
    certificateUrl: {
      type: String
    },
    verificationUrl: {
      type: String
    }
  },
  attachment: {
    originalDocumentUrl: {
      type: String
    },
    stampedDocumentUrl: {
      type: String
    },
    certificateUrl: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['draft', 'payment_pending', 'stamped', 'completed', 'cancelled'],
    default: 'draft'
  },
  metadata: {
    source: {
      type: String,
      enum: ['user_upload', 'lawyer_assisted', 'system_generated'],
      default: 'user_upload'
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'express'],
      default: 'normal'
    },
    notes: String,
    referenceNumber: String
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
    },
    ipAddress: String,
    userAgent: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
eStampSchema.index({ documentId: 1 });
eStampSchema.index({ state: 1 });
eStampSchema.index({ status: 1 });
eStampSchema.index({ 'stampCertificate.certificateNumber': 1 }, { sparse: true });
eStampSchema.index({ createdAt: -1 });

// Virtual for checking if stamp is valid
eStampSchema.virtual('isValid').get(function() {
  if (!this.stampCertificate || !this.stampCertificate.expiresAt) return false;
  return new Date() <= this.stampCertificate.expiresAt;
});

// Virtual for days until expiry
eStampSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.stampCertificate || !this.stampCertificate.expiresAt) return 0;
  const now = new Date();
  const expiryDate = new Date(this.stampCertificate.expiresAt);
  const diffTime = expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
eStampSchema.pre('save', function(next) {
  if (this.status === 'stamped' && !this.stampCertificate.issuedAt) {
    this.stampCertificate.issuedAt = new Date();
    
    // Generate certificate number if not present
    if (!this.stampCertificate.certificateNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      this.stampCertificate.certificateNumber = `EST-${timestamp}-${random}`;
    }
    
    // Generate QR code and verification URLs
    this.stampCertificate.verificationUrl = `${process.env.FRONTEND_URL}/verify-estamp/${this.stampCertificate.certificateNumber}`;
    
    // Add to audit trail
    this.auditTrail.push({
      action: 'stamp_issued',
      details: {
        certificateNumber: this.stampCertificate.certificateNumber,
        state: this.state,
        stampValue: this.stampValue
      }
    });
  }
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    
    // Add to audit trail
    this.auditTrail.push({
      action: 'estamp_completed',
      details: {
        certificateNumber: this.stampCertificate.certificateNumber,
        completedAt: new Date()
      }
    });
  }
  
  next();
});

// Static method to get stamp duty rates by state
eStampSchema.statics.getStampDutyRates = function(state) {
  const rates = {
    'Andhra Pradesh': { judicial: 0.01, nonJudicial: 0.005 },
    'Arunachal Pradesh': { judicial: 0.01, nonJudicial: 0.005 },
    'Assam': { judicial: 0.008, nonJudicial: 0.004 },
    'Bihar': { judicial: 0.015, nonJudicial: 0.006 },
    'Chhattisgarh': { judicial: 0.01, nonJudicial: 0.005 },
    'Goa': { judicial: 0.01, nonJudicial: 0.005 },
    'Gujarat': { judicial: 0.01, nonJudicial: 0.005 },
    'Haryana': { judicial: 0.01, nonJudicial: 0.005 },
    'Himachal Pradesh': { judicial: 0.01, nonJudicial: 0.005 },
    'Jharkhand': { judicial: 0.01, nonJudicial: 0.005 },
    'Karnataka': { judicial: 0.01, nonJudicial: 0.005 },
    'Kerala': { judicial: 0.01, nonJudicial: 0.005 },
    'Madhya Pradesh': { judicial: 0.01, nonJudicial: 0.005 },
    'Maharashtra': { judicial: 0.01, nonJudicial: 0.005 },
    'Manipur': { judicial: 0.008, nonJudicial: 0.004 },
    'Meghalaya': { judicial: 0.008, nonJudicial: 0.004 },
    'Mizoram': { judicial: 0.008, nonJudicial: 0.004 },
    'Nagaland': { judicial: 0.008, nonJudicial: 0.004 },
    'Odisha': { judicial: 0.01, nonJudicial: 0.005 },
    'Punjab': { judicial: 0.01, nonJudicial: 0.005 },
    'Rajasthan': { judicial: 0.01, nonJudicial: 0.005 },
    'Sikkim': { judicial: 0.008, nonJudicial: 0.004 },
    'Tamil Nadu': { judicial: 0.01, nonJudicial: 0.005 },
    'Telangana': { judicial: 0.01, nonJudicial: 0.005 },
    'Tripura': { judicial: 0.008, nonJudicial: 0.004 },
    'Uttar Pradesh': { judicial: 0.01, nonJudicial: 0.005 },
    'Uttarakhand': { judicial: 0.01, nonJudicial: 0.005 },
    'West Bengal': { judicial: 0.01, nonJudicial: 0.005 },
    'Delhi': { judicial: 0.01, nonJudicial: 0.005 },
    'Mumbai': { judicial: 0.01, nonJudicial: 0.005 },
    'Kolkata': { judicial: 0.01, nonJudicial: 0.005 },
    'Chennai': { judicial: 0.01, nonJudicial: 0.005 },
    'Bengaluru': { judicial: 0.01, nonJudicial: 0.005 }
  };
  
  return rates[state] || { judicial: 0.01, nonJudicial: 0.005 };
};

module.exports = mongoose.model('EStamp', eStampSchema);
