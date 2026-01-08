const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const { authenticate, authorize, requireLawyerVerification } = require('../middleware/auth');
const router = express.Router();

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

// @route   GET /api/lawyers
// @desc    Get lawyers with filters and pagination (public endpoint)
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
// @desc    Get lawyer details by ID (public endpoint)
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

// @route   POST /api/lawyers
// @desc    Create lawyer profile (lawyer only)
router.post('/', authenticate, authorize('lawyer'), [
  body('barLicenseNumber').notEmpty().trim(),
  body('specialization').isArray({ min: 1 }),
  body('experience').isInt({ min: 0 }),
  body('education').isArray({ min: 1 }),
  body('location.city').notEmpty().trim(),
  body('location.state').notEmpty().trim(),
  body('consultationFees.chat').isInt({ min: 0 }),
  body('consultationFees.voice').isInt({ min: 0 }),
  body('consultationFees.video').isInt({ min: 0 })
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

    // Check if lawyer profile already exists
    const existingLawyer = await Lawyer.findOne({ userId: req.user._id });
    if (existingLawyer) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer profile already exists'
      });
    }

    const lawyerData = {
      userId: req.user._id,
      ...req.body
    };

    const lawyer = new Lawyer(lawyerData);
    await lawyer.save();

    // Update user role to lawyer if not already set
    if (req.user.role !== 'lawyer') {
      await User.findByIdAndUpdate(req.user._id, { role: 'lawyer' });
    }

    res.status(201).json({
      success: true,
      message: 'Lawyer profile created successfully',
      data: { lawyer }
    });
  } catch (error) {
    console.error('Create lawyer error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bar license number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating lawyer profile'
    });
  }
});

// @route   PUT /api/lawyers/:id
// @desc    Update lawyer profile (lawyer only)
router.put('/:id', authenticate, authorize('lawyer'), [
  body('specialization').optional().isArray(),
  body('experience').optional().isInt({ min: 0 }),
  body('education').optional().isArray(),
  body('languages').optional().isArray(),
  body('bio').optional().isLength({ max: 2000 }),
  body('location.city').optional().trim(),
  body('location.state').optional().trim(),
  body('consultationFees.chat').optional().isInt({ min: 0 }),
  body('consultationFees.voice').optional().isInt({ min: 0 }),
  body('consultationFees.video').optional().isInt({ min: 0 })
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

    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'specialization', 'experience', 'education', 'languages', 'bio',
      'location', 'consultationFees', 'achievements', 'socialLinks'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        lawyer[field] = req.body[field];
      }
    });

    await lawyer.save();

    res.json({
      success: true,
      message: 'Lawyer profile updated successfully',
      data: { lawyer }
    });
  } catch (error) {
    console.error('Update lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lawyer profile'
    });
  }
});

// @route   DELETE /api/lawyers/:id
// @desc    Delete lawyer profile (lawyer only)
router.delete('/:id', authenticate, authorize('lawyer'), async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    await Lawyer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lawyer profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting lawyer profile'
    });
  }
});

// @route   PUT /api/lawyers/:id/availability
// @desc    Update lawyer availability (lawyer only)
router.put('/:id/availability', authenticate, authorize('lawyer'), [
  body('availability').notEmpty().isObject()
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

    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    lawyer.availability = req.body.availability;
    await lawyer.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability: lawyer.availability }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
});

// @route   PUT /api/lawyers/:id/fees
// @desc    Update consultation fees (lawyer only)
router.put('/:id/fees', authenticate, authorize('lawyer'), [
  body('chat').isInt({ min: 0 }),
  body('voice').isInt({ min: 0 }),
  body('video').isInt({ min: 0 })
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

    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    lawyer.consultationFees = req.body;
    await lawyer.save();

    res.json({
      success: true,
      message: 'Consultation fees updated successfully',
      data: { consultationFees: lawyer.consultationFees }
    });
  } catch (error) {
    console.error('Update fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating consultation fees'
    });
  }
});

// @route   POST /api/lawyers/:id/documents
// @desc    Upload verification documents (lawyer only)
router.post('/:id/documents', authenticate, authorize('lawyer'), [
  body('documentType').isIn(['aadhar', 'pan', 'barLicense', 'photo', 'addressProof', 'voterId', 'passport', 'drivingLicense']),
  body('documentUrl').isURL(),
  body('documentNumber').notEmpty().trim()
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

    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    const { documentType, documentUrl, documentNumber } = req.body;

    // Check if document type already exists
    const existingDocIndex = lawyer.kycDocuments.findIndex(doc => doc.documentType === documentType);
    if (existingDocIndex !== -1) {
      // Update existing document
      lawyer.kycDocuments[existingDocIndex] = {
        documentType,
        documentUrl,
        documentNumber,
        uploadedAt: new Date()
      };
    } else {
      // Add new document
      lawyer.kycDocuments.push({
        documentType,
        documentUrl,
        documentNumber,
        uploadedAt: new Date()
      });
    }

    await lawyer.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: { kycDocuments: lawyer.kycDocuments }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading document'
    });
  }
});

// @route   GET /api/lawyers/:id/appointments
// @desc    Get lawyer's appointments (lawyer only)
router.get('/:id/appointments', authenticate, authorize('lawyer'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    let query = { lawyerId: req.params.id };
    if (status) {
      query.status = status;
    }

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total,
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    console.error('Get lawyer appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @route   GET /api/lawyers/:id/stats
// @desc    Get lawyer dashboard stats (lawyer only)
router.get('/:id/stats', authenticate, authorize('lawyer'), async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found or unauthorized'
      });
    }

    const Appointment = require('../models/Appointment');
    const Chat = require('../models/Chat');

    const [appointmentsCount, chatsCount, totalEarnings] = await Promise.all([
      Appointment.countDocuments({ lawyerId: req.params.id }),
      Chat.countDocuments({ lawyerId: req.params.id }),
      Lawyer.findById(req.params.id).select('totalEarnings')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalAppointments: appointmentsCount,
          totalChats: chatsCount,
          totalEarnings: totalEarnings.totalEarnings,
          totalConsultations: lawyer.totalConsultations,
          averageRating: lawyer.rating.average,
          ratingCount: lawyer.rating.count
        }
      }
    });
  } catch (error) {
    console.error('Get lawyer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching lawyer stats'
    });
  }
});

// @route   POST /api/lawyers/:id/ratings
// @desc    Add rating/review for lawyer (user only)
router.post('/:id/ratings', authenticate, authorize('user'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').optional().isLength({ max: 1000 })
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

    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    const { rating, review } = req.body;

    // Here you would typically store the rating in a separate Rating model
    // For now, we'll update the lawyer's average rating directly
    const currentTotal = lawyer.rating.average * lawyer.rating.count;
    const newCount = lawyer.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    lawyer.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
    lawyer.rating.count = newCount;

    await lawyer.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: lawyer.rating.average,
        count: lawyer.rating.count
      }
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting rating'
    });
  }
});

// @route   GET /api/lawyers/:id/ratings
// @desc    Get lawyer ratings
router.get('/:id/ratings', async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).select('rating');
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      data: {
        rating: lawyer.rating
      }
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ratings'
    });
  }
});

module.exports = router;
