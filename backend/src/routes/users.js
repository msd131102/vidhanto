const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile (users only)
router.get('/profile', authenticate, authorize('user'), async (req, res) => {
  try {
    const user = req.user;

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
          lastLogin: user.lastLogin,
          address: user.address || null,
          preferences: user.preferences || {
            emailNotifications: true,
            smsNotifications: false,
            twoFactorAuth: false
          }
        }
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
router.put('/profile', authenticate, authorize('user'), [
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

// @route   PUT /api/users/address
// @desc    Update user address
router.put('/address', authenticate, authorize('user'), [
  body('street').optional().trim().isLength({ min: 5, max: 200 }),
  body('city').optional().trim().isLength({ min: 2, max: 50 }),
  body('state').optional().trim().isLength({ min: 2, max: 50 }),
  body('pinCode').optional().matches(/^[0-9]{6}$/)
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
    const { street, city, state, pinCode } = req.body;

    // Initialize address if it doesn't exist
    if (!user.address) {
      user.address = {};
    }

    // Update address fields
    if (street !== undefined) user.address.street = street;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (pinCode !== undefined) user.address.pinCode = pinCode;

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating address'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
router.put('/preferences', authenticate, authorize('user'), [
  body('emailNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('twoFactorAuth').optional().isBoolean()
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
    const { emailNotifications, smsNotifications, twoFactorAuth } = req.body;

    // Initialize preferences if it doesn't exist
    if (!user.preferences) {
      user.preferences = {
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: false
      };
    }

    // Update preference fields
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.preferences.smsNotifications = smsNotifications;
    if (twoFactorAuth !== undefined) user.preferences.twoFactorAuth = twoFactorAuth;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          preferences: user.preferences,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

// @route   GET /api/users/appointments
// @desc    Get user appointments
router.get('/appointments', authenticate, authorize('user'), async (req, res) => {
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
router.get('/documents', authenticate, authorize('user'), async (req, res) => {
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
router.get('/payments', authenticate, authorize('user'), async (req, res) => {
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
router.delete('/account', authenticate, authorize('user'), async (req, res) => {
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
router.get('/dashboard/stats', authenticate, authorize('user'), async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const Document = require('../models/Document');
    const Chat = require('../models/Chat');

    const [appointmentsCount, documentsCount, chatsCount] = await Promise.all([
      Appointment.countDocuments({ userId: req.user._id }),
      Document.countDocuments({ userId: req.user._id }),
      Chat.countDocuments({ userId: req.user._id })
    ]);

    // Debug: Check all lawyers first
    const allLawyers = await Lawyer.find({});
    console.log('All lawyers in DB:', allLawyers.map(l => ({
      _id: l._id,
      isVerified: l.isVerified,
      isActive: l.isActive,
      kycStatus: l.kycStatus,
      barLicenseNumber: l.barLicenseNumber
    })));

    // Get active lawyers count - count verified and active lawyers
    const activeLawyersCount = await Lawyer.countDocuments({
      isVerified: true,
      isActive: true
    });

    console.log('Active lawyers count:', activeLawyersCount);

    res.json({
      success: true,
      data: {
        stats: {
          totalAppointments: appointmentsCount,
          totalDocuments: documentsCount,
          totalChats: chatsCount,
          activeLawyers: activeLawyersCount
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

// Get recent appointments for dashboard
router.get('/dashboard/recent-appointments', authenticate, authorize('user'), async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('lawyerId', 'name barLicenseNumber specialization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Recent appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent appointments'
    });
  }
});

// Get recent documents for dashboard
router.get('/dashboard/recent-documents', authenticate, authorize('user'), async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const Document = require('../models/Document');
    const documents = await Document.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    console.error('Recent documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent documents'
    });
  }
});

// Get recommended lawyers for dashboard
router.get('/dashboard/recommended-lawyers', authenticate, authorize('user'), async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    // Get verified and active lawyers
    const lawyers = await Lawyer.find({ 
      isVerified: true, 
      isActive: true 
    })
      .populate('userId', 'firstName lastName email profileImage')
      .sort({ rating: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { lawyers }
    });
  } catch (error) {
    console.error('Recommended lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended lawyers'
    });
  }
});

module.exports = router;
