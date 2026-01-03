const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  barLicenseNumber: {
    type: String,
    required: [true, 'Bar license number is required'],
    unique: true,
    trim: true
  },
  specialization: [{
    type: String,
    enum: [
      'Criminal Law',
      'Civil Law',
      'Corporate Law',
      'Family Law',
      'Property Law',
      'Tax Law',
      'Intellectual Property',
      'Labor Law',
      'Constitutional Law',
      'Environmental Law',
      'GST Law',
      'Cyber Law',
      'Banking Law',
      'Insurance Law',
      'Immigration Law',
      'Consumer Protection',
      'Real Estate Law',
      'Medical Negligence',
      'Motor Accident Claims',
      'Arbitration Law',
      'Company Law',
      'Securities Law',
      'Customs Law',
      'Service Tax',
      'Income Tax',
      'Land Acquisition',
      'RERA Law',
      'Sexual Harassment',
      'Domestic Violence',
      'Child Custody',
      'Divorce Law',
      'Inheritance Law',
      'Wills & Probate',
      'Partnership Law',
      'LLP Law',
      'FEMA Law',
      'FSSAI Law',
      'Drug Laws',
      'Educational Law',
      'Media & Entertainment Law',
      'Sports Law',
      'Aviation Law',
      'Maritime Law',
      'Other'
    ]
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Other']
  }],
  location: {
    city: {
      type: String,
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
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
        'Chandigarh', 'Lakshadweep', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
        'Jammu and Kashmir', 'Ladakh'
      ]
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  consultationFees: {
    chat: {
      type: Number,
      required: true,
      min: [0, 'Fee cannot be negative']
    },
    voice: {
      type: Number,
      required: true,
      min: [0, 'Fee cannot be negative']
    },
    video: {
      type: Number,
      required: true,
      min: [0, 'Fee cannot be negative']
    }
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  achievements: [{
    title: String,
    year: Number,
    description: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String // S3 URLs
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  socialLinks: {
    linkedin: String,
    website: String,
    other: String
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    documentType: {
      type: String,
      enum: ['aadhar', 'pan', 'barLicense', 'photo', 'addressProof', 'voterId', 'passport', 'drivingLicense']
    },
    documentUrl: String,
    documentNumber: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branchName: String
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

// Index for better search performance
lawyerSchema.index({ userId: 1 });
lawyerSchema.index({ specialization: 1 });
lawyerSchema.index({ location: 1 });
lawyerSchema.index({ 'rating.average': -1 });
lawyerSchema.index({ isVerified: 1 });
lawyerSchema.index({ kycStatus: 1 });

// Virtual for full name (populated from user)
lawyerSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to check if lawyer is available at given time
lawyerSchema.methods.isAvailableAt = function(day, time) {
  if (!this.isAvailable) return false;
  
  const daySlots = this.availability[day.toLowerCase()];
  if (!daySlots || daySlots.length === 0) return false;
  
  return daySlots.some(slot => {
    return time >= slot.start && time <= slot.end;
  });
};

module.exports = mongoose.model('Lawyer', lawyerSchema);
