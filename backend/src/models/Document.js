const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer'
  },
  type: {
    type: String,
    enum: [
      'NDA',
      'Agreement',
      'Legal Notice',
      'Affidavit',
      'Will',
      'Power of Attorney',
      'Partnership Deed',
      'Sale Deed',
      'Rent Agreement',
      'Employment Agreement',
      'Service Agreement',
      'Loan Agreement',
      'MoU',
      'GST Registration',
      'Company Incorporation',
      'Trademark Registration',
      'Copyright Registration',
      'Patent Application',
      'Consumer Complaint',
      'RTI Application',
      'Court Petition',
      'Divorce Petition',
      'Child Custody Petition',
      'Property Dispute',
      'Insurance Claim',
      'Bank Complaint',
      'Income Tax Appeal',
      'Customs Petition',
      'FSSAI Registration',
      'Shop License',
      'Trade License',
      'Other'
    ],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: [
      'Business & Corporate',
      'Property & Real Estate',
      'Family & Personal',
      'Criminal Law',
      'Civil Litigation',
      'Taxation',
      'Intellectual Property',
      'Banking & Finance',
      'Employment',
      'Consumer Protection',
      'Government & Regulatory',
      'Immigration',
      'Insurance',
      'Education',
      'Healthcare',
      'Other'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'under_review', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  content: {
    type: String,
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate'
  },
  templateData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['original', 'draft', 'reviewed', 'final'],
      default: 'original'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviewDetails: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer'
    },
    reviewedAt: Date,
    reviewNotes: {
      type: String,
      maxlength: [2000, 'Review notes cannot exceed 2000 characters']
    },
    suggestedChanges: [{
      section: String,
      originalText: String,
      suggestedText: String,
      reason: String
    }],
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected_with_changes', 'rejected'],
      default: 'pending'
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: [0, 'Additional charges cannot be negative']
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR']
    }
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  delivery: {
    format: {
      type: String,
      enum: ['pdf', 'docx', 'both'],
      default: 'pdf'
    },
    deliveryMethod: {
      type: String,
      enum: ['download', 'email', 'both'],
      default: 'download'
    },
    deliveryEmail: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  signatures: [{
    signerName: {
      type: String,
      required: true
    },
    signerEmail: {
      type: String,
      required: true
    },
    signerPhone: String,
    signerType: {
      type: String,
      enum: ['user', 'lawyer', 'witness', 'other'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'declined'],
      default: 'pending'
    },
    signedAt: Date,
    signatureUrl: String,
    ipAddress: String,
    otp: String,
    otpExpires: Date
  }],
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'reviewed', 'approved', 'rejected', 'signed', 'downloaded', 'paid'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
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
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ lawyerId: 1, createdAt: -1 });
documentSchema.index({ type: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ paymentStatus: 1 });

// Method to add audit trail entry
documentSchema.methods.addAuditTrail = function(action, performedBy, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    ipAddress
  });
  return this.save();
};

// Method to check if document can be edited
documentSchema.methods.canBeEdited = function(userId) {
  return this.userId.toString() === userId.toString() && ['draft', 'pending_review'].includes(this.status);
};

// Method to check if document can be reviewed
documentSchema.methods.canBeReviewed = function(lawyerId) {
  return this.lawyerId && this.lawyerId.toString() === lawyerId.toString() && this.status === 'pending_review';
};

// Pre-save middleware to calculate total amount
documentSchema.pre('save', function(next) {
  if (this.isModified('pricing.basePrice') || this.isModified('pricing.additionalCharges')) {
    this.pricing.tax = Math.round((this.pricing.basePrice + this.pricing.additionalCharges) * 0.18); // 18% GST
    this.pricing.totalAmount = this.pricing.basePrice + this.pricing.additionalCharges + this.pricing.tax;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
