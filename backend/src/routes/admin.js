const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Appointment = require('../models/Appointment');
const Document = require('../models/Document');
const Payment = require('../models/Payment');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Lawyer.countDocuments(),
      Appointment.countDocuments(),
      Document.countDocuments(),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      stats: {
        totalUsers: stats[0],
        totalLawyers: stats[1],
        totalAppointments: stats[2],
        totalDocuments: stats[3],
        totalRevenue: stats[4][0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all lawyers
router.get('/lawyers', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = status !== 'all' ? { verificationStatus: status } : {};
    
    const lawyers = await Lawyer.find(query)
      .populate('userId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Lawyer.countDocuments(query);

    res.json({
      lawyers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lawyers' });
  }
});

// Approve/reject lawyer
router.put('/lawyers/:id/verify', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: status,
        verificationReason: reason,
        verifiedAt: status === 'approved' ? new Date() : null
      },
      { new: true }
    ).populate('userId', 'email');

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    res.json({ message: `Lawyer ${status} successfully`, lawyer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lawyer status' });
  }
});

// Get all appointments
router.get('/appointments', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = status !== 'all' ? { status } : {};
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('lawyerId', 'name specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Get all payments
router.get('/payments', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const query = status !== 'all' ? { status } : {};
    
    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Ban/unban user
router.put('/users/:id/ban', authenticate, isAdmin, async (req, res) => {
  try {
    const { isBanned, reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, banReason: reason },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

module.exports = router;
