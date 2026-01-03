const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get lawyer details if user is a lawyer
    let lawyerDetails = null;
    if (user.role === 'lawyer') {
      lawyerDetails = await Lawyer.findOne({ userId: user._id })
        .populate('userId', 'firstName lastName email phone profileImage');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        lawyer: lawyerDetails
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', authenticate, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[0-9]{10}$/),
  body('profileImage').optional().isURL()
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

    const user = req.user;
    const { firstName, lastName, phone, profileImage } = req.body;

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/appointments
// @desc    Get user appointments
router.get('/appointments', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find(query)
      .populate('lawyerId', 'barLicenseNumber specialization experience')
      .populate('userId', 'firstName lastName email')
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
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @route   GET /api/users/documents
// @desc    Get user documents
router.get('/documents', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const Document = require('../models/Document');
    const documents = await Document.find(query)
      .populate('lawyerId', 'barLicenseNumber specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDocuments: total,
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching documents'
    });
  }
});

// @route   GET /api/users/payments
// @desc    Get user payment history
router.get('/payments', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) query.status = status;

    const Payment = require('../models/Payment');
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Delete related data
    const Appointment = require('../models/Appointment');
    const Document = require('../models/Document');
    const Chat = require('../models/Chat');
    const Payment = require('../models/Payment');
    const Lawyer = require('../models/Lawyer');

    // Delete appointments
    await Appointment.deleteMany({ userId: user._id });
    
    // Delete documents
    await Document.deleteMany({ userId: user._id });
    
    // Delete chats
    await Chat.deleteMany({ 'participants.user': user._id });
    
    // Delete payments
    await Payment.deleteMany({ userId: user._id });
    
    // Delete lawyer profile if exists
    if (user.role === 'lawyer') {
      await Lawyer.findOneAndDelete({ userId: user._id });
    }
    
    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
});

// Get user dashboard stats
router.get('/dashboard/stats', authenticate, async (req, res) => {
  try {
    const [appointmentsCount, documentsCount, chatsCount] = await Promise.all([
      Appointment.countDocuments({ userId: req.user.id }),
      Document.countDocuments({ userId: req.user.id }),
      Chat.countDocuments({ userId: req.user.id })
    ]);

    // Get active lawyers count
    const activeLawyersCount = await Lawyer.countDocuments({ 
      verificationStatus: 'approved' 
    });

    res.json({
      stats: {
        totalAppointments: appointmentsCount,
        totalDocuments: documentsCount,
        totalChats: chatsCount,
        activeLawyers: activeLawyersCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
