const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const { authenticate, authorize, requireLawyerVerification } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/lawyers
// @desc    Get lawyers with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      location,
      state,
      minExperience,
      maxExperience,
      minRating,
      maxFee,
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { isVerified: true, isActive: true };

    // Build filter conditions
    if (specialization) {
      filter.specialization = { $in: specialization.split(',') };
    }

    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    if (state) {
      filter['location.state'] = state;
    }

    if (minExperience) {
      filter.experience = { $gte: parseInt(minExperience) };
    }

    if (maxExperience) {
      filter.experience = { ...filter.experience, $lte: parseInt(maxExperience) };
    }

    if (minRating) {
      filter['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      filter['consultationFees.chat'] = { $lte: parseInt(maxFee) };
    }

    if (search) {
      filter.$or = [
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'experience':
        sort.experience = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'fees':
        sort['consultationFees.chat'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'reviews':
        sort['rating.count'] = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sort['rating.average'] = -1;
    }

    const lawyers = await Lawyer.find(filter)
      .populate({
        path: 'userId',
        select: 'firstName lastName email profileImage'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lawyer.countDocuments(filter);

    res.json({
      success: true,
      data: {
        lawyers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalLawyers: total,
          hasNext: page * limit < total
        },
        filters: {
          specialization,
          location,
          state,
          minExperience,
          maxExperience,
          minRating,
          maxFee,
          search,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('Get lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lawyers'
    });
  }
});

// @route   GET /api/lawyers/:id
// @desc    Get lawyer details by ID
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ _id: req.params.id })
      .populate({
        path: 'userId',
        select: 'firstName lastName email profileImage phone'
      });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      data: { lawyer }
    });
  } catch (error) {
    console.error('Get lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lawyer'
    });
  }
});

// @route   PUT /api/lawyers/profile
// @desc    Update lawyer profile
router.put('/profile', authenticate, requireLawyerVerification, [
  body('specialization').optional().isArray(),
  body('experience').optional().isInt({ min: 0 }),
  body('education').optional().isArray(),
  body('languages').optional().isArray(),
  body('location.city').optional().trim(),
  body('location.state').optional().trim(),
  body('consultationFees.chat').optional().isInt({ min: 0 }),
  body('consultationFees.voice').optional().isInt({ min: 0 }),
  body('consultationFees.video').optional().isInt({ min: 0 }),
  body('bio').optional().isLength({ max: 2000 }),
  body('availability').optional().isObject(),
  body('socialLinks.linkedin').optional().isURL(),
  body('socialLinks.website').optional().isURL(),
  body('bankDetails').optional().isObject()
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

    const lawyer = req.lawyer;
    const updates = req.body;

    // Update allowed fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key.includes('.')) {
          // Handle nested objects like consultationFees, location, etc.
          const [parent, child] = key.split('.');
          if (lawyer[parent] && lawyer[parent][child] !== undefined) {
            lawyer[parent][child] = updates[key];
          }
        } else {
          lawyer[key] = updates[key];
        }
      }
    });

    await lawyer.save();

    res.json({
      success: true,
      message: 'Lawyer profile updated successfully',
      data: { lawyer }
    });
  } catch (error) {
    console.error('Update lawyer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lawyer profile'
    });
  }
});

// @route   POST /api/lawyers/kyc
// @desc    Submit KYC documents
router.post('/kyc', authenticate, requireLawyerVerification, [
  body('barLicenseNumber').notEmpty().trim(),
  body('kycDocuments').isArray({ min: 1 }),
  body('bankDetails').optional().isObject()
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

    const lawyer = req.lawyer;
    const { barLicenseNumber, kycDocuments, bankDetails } = req.body;

    // Update bar license number
    lawyer.barLicenseNumber = barLicenseNumber;

    // Update KYC documents
    if (kycDocuments && kycDocuments.length > 0) {
      lawyer.kycDocuments = kycDocuments;
      lawyer.kycStatus = 'pending'; // Change to pending for admin review
    }

    // Update bank details if provided
    if (bankDetails) {
      lawyer.bankDetails = bankDetails;
    }

    await lawyer.save();

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Your profile is now under review.',
      data: { lawyer }
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting KYC documents'
    });
  }
});

// @route   PUT /api/lawyers/availability
// @desc    Update lawyer availability
router.put('/availability', authenticate, requireLawyerVerification, [
  body('availability').isObject(),
  body('isAvailable').optional().isBoolean()
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

    const lawyer = req.lawyer;
    const { availability, isAvailable } = req.body;

    if (availability) {
      lawyer.availability = availability;
    }

    if (isAvailable !== undefined) {
      lawyer.isAvailable = isAvailable;
    }

    await lawyer.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { lawyer }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
});

// @route   GET /api/lawyers/specializations
// @desc    Get list of legal specializations
router.get('/specializations', (req, res) => {
  try {
    const specializations = [
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
    ];

    res.json({
      success: true,
      data: { specializations }
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching specializations'
    });
  }
});

// @route   GET /api/lawyers/states
// @desc    Get list of Indian states
router.get('/states', (req, res) => {
  try {
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
      'Chandigarh', 'Lakshadweep', 'Andaman and Nicobar Islands', 
      'Dadra and Nagar Haveli and Daman and Diu', 'Jammu and Kashmir', 'Ladakh'
    ];

    res.json({
      success: true,
      data: { states }
    });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching states'
    });
  }
});

module.exports = router;
