const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');
const { authenticate, checkOwnership } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/appointments
// @desc    Book an appointment
router.post('/', authenticate, [
  body('lawyerId').notEmpty().withMessage('Lawyer ID is required'),
  body('type').isIn(['chat', 'voice', 'video']).withMessage('Invalid consultation type'),
  body('scheduledDate').isISO8601().withMessage('Invalid date format'),
  body('duration').isIn([15, 30, 45, 60]).withMessage('Invalid duration'),
  body('description').optional().isLength({ max: 1000 }),
  body('documents').optional().isArray()
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

    const { lawyerId, type, scheduledDate, duration, description, documents } = req.body;

    // Check if lawyer exists and is verified
    const lawyer = await Lawyer.findOne({ _id: lawyerId, isVerified: true, isActive: true });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found or not verified'
      });
    }

    // Check if lawyer is available at the requested time
    const appointmentDate = new Date(scheduledDate);
    const dayOfWeek = appointmentDate.toLocaleLowerCase('en-US', { weekday: 'long' });
    const time = appointmentDate.toTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (!lawyer.isAvailableAt(dayOfWeek, time)) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer is not available at the requested time'
      });
    }

    // Get consultation fee based on type
    const consultationFee = lawyer.consultationFees[type];
    const platformFee = Math.round(consultationFee * 0.1); // 10% platform fee
    const totalFee = consultationFee + platformFee;

    // Create appointment
    const appointment = new Appointment({
      userId: req.user._id,
      lawyerId,
      type,
      scheduledDate: appointmentDate,
      duration,
      description,
      documents: documents || [],
      fees: {
        consultationFee,
        platformFee,
        totalFee
      },
      status: 'pending',
      paymentStatus: 'pending'
    });

    await appointment.save();

    // Populate lawyer and user details for response
    await appointment.populate([
      { path: 'lawyerId', populate: { path: 'userId', select: 'firstName lastName email profileImage' } },
      { path: 'userId', select: 'firstName lastName email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error booking appointment'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get user appointments with pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'lawyerId',
        populate: { path: 'userId', select: 'firstName lastName email profileImage' }
      })
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

// @route   GET /api/appointments/:id
// @desc    Get appointment details by ID
router.get('/:id', authenticate, checkOwnership('Appointment', 'id'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate([
        { path: 'lawyerId', populate: { path: 'userId', select: 'firstName lastName email profileImage phone' } },
        { path: 'userId', select: 'firstName lastName email phone' }
      ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
router.put('/:id', authenticate, checkOwnership('Appointment', 'id'), [
  body('scheduledDate').optional().isISO8601(),
  body('duration').optional().isIn([15, 30, 45, 60]),
  body('description').optional().isLength({ max: 1000 }),
  body('documents').optional().isArray()
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

    const appointment = req.resource;
    const updates = req.body;

    // Only allow updates if appointment is pending or confirmed
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update appointment in current status'
      });
    }

    // Update allowed fields
    if (updates.scheduledDate) {
      appointment.scheduledDate = new Date(updates.scheduledDate);
    }
    if (updates.duration) {
      appointment.duration = updates.duration;
    }
    if (updates.description !== undefined) {
      appointment.description = updates.description;
    }
    if (updates.documents) {
      appointment.documents = updates.documents;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment'
    });
  }
});

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm appointment (by lawyer)
router.put('/:id/confirm', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only lawyer can confirm appointments
    if (appointment.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned lawyer can confirm this appointment'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be confirmed in current status'
      });
    }

    appointment.status = 'confirmed';
    appointment.meetingLink = `https://meet.vidhanto.com/room/${appointment._id}`;
    appointment.roomId = appointment._id.toString();
    
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error confirming appointment'
    });
  }
});

// @route   PUT /api/appointments/:id/complete
// @desc    Complete appointment
router.put('/:id/complete', authenticate, checkOwnership('Appointment', 'id'), [
  body('notes').optional().isLength({ max: 2000 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
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

    const appointment = req.resource;
    const { notes, rating, review } = req.body;

    if (!['confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be completed'
      });
    }

    // Update appointment status and notes
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    
    if (notes) {
      appointment.notes.lawyerNotes = notes;
    }
    
    if (rating) {
      appointment.rating.userRating = rating;
      
      // Update lawyer's overall rating
      const Lawyer = require('../models/Lawyer');
      const lawyer = await Lawyer.findById(appointment.lawyerId);
      if (lawyer) {
        const newTotalRatings = lawyer.rating.count + 1;
        const newAverageRating = ((lawyer.rating.average * lawyer.rating.count) + rating) / newTotalRatings;
        lawyer.rating.average = Math.round(newAverageRating * 10) / 10;
        lawyer.rating.count = newTotalRatings;
        lawyer.totalConsultations = lawyer.totalConsultations + 1;
        await lawyer.save();
      }
    }
    
    if (review) {
      appointment.rating.userReview = review;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing appointment'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
router.delete('/:id', authenticate, checkOwnership('Appointment', 'id'), [
  body('cancellationReason').optional().isLength({ max: 500 })
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

    const appointment = req.resource;
    const { cancellationReason } = req.body;

    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled (less than 2 hours before scheduled time)'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || '';
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment'
    });
  }
});

module.exports = router;
