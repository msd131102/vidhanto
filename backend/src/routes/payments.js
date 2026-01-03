const express = require('express');
const { body, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const { authenticate, checkOwnership } = require('../middleware/auth');
const router = express.Router();

// Initialize Razorpay only if environment variables are set
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @route   POST /api/payments/create
// @desc    Create payment order
router.post('/create', authenticate, [
  body('amount').isInt({ min: 1 }).withMessage('Amount must be at least 1'),
  body('currency').optional().isIn(['INR']),
  body('type').isIn(['appointment', 'document', 'consultation', 'subscription']).withMessage('Invalid payment type'),
  body('relatedId').notEmpty().withMessage('Related ID is required'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required')
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

    const { amount, currency = 'INR', type, relatedId, description } = req.body;

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (INR * 100)
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: req.user._id.toString(),
        type,
        relatedId,
        description
      }
    };

    const order = razorpay ? await razorpay.orders.create(options) : null;
    if (!order) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not available'
      });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      type,
      relatedId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'razorpay',
      transactionId: order.id,
      gatewayOrderId: order.id,
      description,
      breakdown: {
        consultationFee: type === 'appointment' ? Math.round(amount * 0.9) : amount,
        platformFee: type === 'appointment' ? Math.round(amount * 0.1) : 0,
        tax: 0,
        discount: 0
      }
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        order,
        payment: {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        },
        razorpayKey: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and update status
router.post('/verify', [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Fetch payment details from Razorpay
    try {
      const razorpayPayment = razorpay ? await razorpay.payments.fetch(razorpay_payment_id) : null;
      if (!razorpayPayment) {
        return res.status(500).json({
          success: false,
          message: 'Payment service not available'
        });
      }

      if (razorpayPayment.status === 'captured') {
        // Payment successful
        payment.status = 'completed';
        payment.gatewayTransactionId = razorpay_payment_id;
        payment.processedAt = new Date();

        // Update related entity based on payment type
        await updateRelatedEntity(payment);

        await payment.save();

        res.json({
          success: true,
          message: 'Payment verified successfully',
          data: { payment }
        });
      } else {
        // Payment failed or pending
        payment.status = razorpayPayment.status === 'failed' ? 'failed' : 'pending';
        payment.failureReason = razorpayPayment.error?.description || 'Payment processing failed';
        payment.gatewayTransactionId = razorpay_payment_id;

        await payment.save();

        res.json({
          success: false,
          message: `Payment ${razorpayPayment.status}`,
          data: { payment }
        });
      }
    } catch (razorpayError) {
      console.error('Razorpay verification error:', razorpayError);
      
      payment.status = 'failed';
      payment.failureReason = 'Payment verification failed';
      await payment.save();

      res.status(500).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
router.get('/history', authenticate, async (req, res) => {
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
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment history'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment details by ID
router.get('/:id', authenticate, checkOwnership('Payment', 'id'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment'
    });
  }
});

// @route   POST /api/payments/:id/refund
// @desc    Request refund for payment
router.post('/:id/refund', authenticate, checkOwnership('Payment', 'id'), [
  body('refundReason').trim().isLength({ min: 1, max: 500 }).withMessage('Refund reason is required'),
  body('refundAmount').optional().isInt({ min: 1 })
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

    const payment = req.resource;
    const { refundReason, refundAmount } = req.body;

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    // Calculate refund amount
    const maxRefundAmount = payment.calculateRefundAmount();
    const finalRefundAmount = refundAmount ? Math.min(refundAmount, maxRefundAmount) : maxRefundAmount;

    // Update payment refund details
    payment.refundDetails.refundAmount = finalRefundAmount;
    payment.refundDetails.refundReason = refundReason;
    payment.refundDetails.refundStatus = 'pending';

    await payment.save();

    // Process refund with Razorpay (in production, this would call Razorpay refund API)
    // For now, we'll mark as processed
    // In production: const refund = await razorpay.payments.refund(payment.gatewayTransactionId, {
    //   amount: finalRefundAmount * 100,
    //   notes: refundReason
    // });

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      data: {
        payment,
        refundAmount: finalRefundAmount,
        maxRefundAmount,
        processingFee: maxRefundAmount - finalRefundAmount
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
});

// Helper function to update related entity based on payment type
async function updateRelatedEntity(payment) {
  try {
    switch (payment.type) {
      case 'appointment':
        const Appointment = require('../models/Appointment');
        await Appointment.findByIdAndUpdate(payment.relatedId, {
          paymentId: payment._id,
          paymentStatus: payment.status
        });
        break;
      case 'document':
        const Document = require('../models/Document');
        await Document.findByIdAndUpdate(payment.relatedId, {
          paymentId: payment._id,
          paymentStatus: payment.status
        });
        break;
      case 'consultation':
        // Handle consultation payment
        break;
      case 'subscription':
        // Handle subscription payment
        break;
    }
  } catch (error) {
    console.error('Update related entity error:', error);
  }
}

module.exports = router;
