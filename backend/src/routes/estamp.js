const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const EStamp = require('../models/EStamp');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');

// Configure multer for document uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Create new e-stamp request
router.post('/create', auth, upload.single('document'), async (req, res) => {
  try {
    const {
      state,
      stampType,
      stampValue,
      instrumentType,
      instrumentNumber,
      instrumentDate,
      parties,
      description,
      metadata
    } = req.body;
    const userId = req.user._id;

    // Parse parties if it's a string
    const parsedParties = Array.isArray(parties) ? parties : JSON.parse(parties);

    // Calculate stamp duty based on state and type
    const rates = EStamp.getStampDutyRates(state);
    const calculatedStampValue = stampValue || (rates[stampType] * 1000); // Default calculation

    // Upload document
    let documentUrl = null;
    if (req.file) {
      // Upload to S3 or local storage (implementation would go here)
      const filename = `estamp-${Date.now()}-${req.file.originalname}`;
      documentUrl = `/uploads/${filename}`;
      // For now, just store buffer info
    }

    // Create e-stamp request
    const eStamp = new EStamp({
      state,
      stampType,
      stampValue: calculatedStampValue,
      instrumentType,
      instrumentNumber,
      instrumentDate: new Date(instrumentDate),
      parties: parsedParties,
      description,
      payment: {
        amount: calculatedStampValue,
        currency: 'INR',
        paymentMethod: 'online',
        gateway: 'razorpay',
        paymentStatus: 'pending'
      },
      attachment: {
        originalDocumentUrl: documentUrl
      },
      metadata: {
        source: metadata?.source || 'user_upload',
        priority: metadata?.priority || 'normal',
        notes: metadata?.notes
      },
      status: 'draft',
      createdBy: userId,
      auditTrail: [{
        action: 'estamp_created',
        userId,
        details: { state, stampType, stampValue: calculatedStampValue }
      }]
    });

    await eStamp.save();

    res.status(201).json({
      success: true,
      message: 'E-stamp request created successfully',
      data: { eStamp }
    });

  } catch (error) {
    console.error('Create e-stamp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create e-stamp request',
      error: error.message
    });
  }
});

// Initiate payment for e-stamp
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eStamp = await EStamp.findById(id);
    if (!eStamp) {
      return res.status(404).json({
        success: false,
        message: 'E-stamp request not found'
      });
    }

    // Check permissions
    if (eStamp.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Create payment order
    const paymentOrder = await paymentService.createOrder({
      amount: eStamp.payment.amount,
      currency: eStamp.payment.currency,
      receipt: `estamp-${id}`,
      notes: {
        eStampId: id,
        type: 'estamp_payment'
      }
    });

    // Update e-stamp with payment order ID
    eStamp.payment.transactionId = paymentOrder.id;
    eStamp.status = 'payment_pending';
    eStamp.auditTrail.push({
      action: 'payment_initiated',
      userId,
      details: { orderId: paymentOrder.id, amount: eStamp.payment.amount }
    });

    await eStamp.save();

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        orderId: paymentOrder.id,
        amount: eStamp.payment.amount,
        currency: eStamp.payment.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});

// Verify payment and process e-stamp
router.post('/:id/payment/verify', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    const eStamp = await EStamp.findById(id);
    if (!eStamp) {
      return res.status(404).json({
        success: false,
        message: 'E-stamp request not found'
      });
    }

    // Verify payment signature
    const isValid = paymentService.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update payment details
    eStamp.payment.transactionId = razorpay_payment_id;
    eStamp.payment.paymentStatus = 'completed';
    eStamp.payment.paidAt = new Date();
    eStamp.payment.gatewayResponse = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };

    // Generate stamp certificate
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const certificateNumber = `EST-${timestamp}-${random}`;

    eStamp.stampCertificate = {
      certificateNumber,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      verificationUrl: `${process.env.FRONTEND_URL}/verify-estamp/${certificateNumber}`
    };

    eStamp.status = 'stamped';
    eStamp.auditTrail.push({
      action: 'payment_completed',
      userId,
      details: { 
        paymentId: razorpay_payment_id,
        certificateNumber,
        amount: eStamp.payment.amount
      }
    });

    await eStamp.save();

    // Send confirmation email
    await emailService.sendEStampConfirmation(
      req.user.email,
      eStamp.stampCertificate.certificateNumber,
      eStamp.state,
      eStamp.stampValue
    );

    res.json({
      success: true,
      message: 'Payment verified and e-stamp generated successfully',
      data: {
        certificateNumber: eStamp.stampCertificate.certificateNumber,
        verificationUrl: eStamp.stampCertificate.verificationUrl,
        expiresAt: eStamp.stampCertificate.expiresAt
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get e-stamp details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eStamp = await EStamp.findById(id)
      .populate('createdBy', 'name email')
      .populate('documentId', 'title');

    if (!eStamp) {
      return res.status(404).json({
        success: false,
        message: 'E-stamp request not found'
      });
    }

    // Check permissions
    if (eStamp.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    res.json({
      success: true,
      data: { eStamp }
    });

  } catch (error) {
    console.error('Get e-stamp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get e-stamp details',
      error: error.message
    });
  }
});

// Get user's e-stamp requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { createdBy: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const eStamps = await EStamp.find(query)
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EStamp.countDocuments(query);

    res.json({
      success: true,
      data: {
        eStamps,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my e-stamp requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get e-stamp requests',
      error: error.message
    });
  }
});

// Download stamped document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eStamp = await EStamp.findById(id).populate('documentId');
    if (!eStamp) {
      return res.status(404).json({
        success: false,
        message: 'E-stamp request not found'
      });
    }

    // Check permissions
    if (eStamp.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Check if e-stamp is completed
    if (eStamp.status !== 'completed' && eStamp.status !== 'stamped') {
      return res.status(400).json({
        success: false,
        message: 'E-stamp not yet ready for download'
      });
    }

    // Generate PDF with stamp (implementation would go here)
    // For now, return stamped document URL
    const documentUrl = eStamp.attachment.stampedDocumentUrl || eStamp.attachment.originalDocumentUrl;
    
    // Add to audit trail
    eStamp.auditTrail.push({
      action: 'document_downloaded',
      userId,
      details: { downloadedAt: new Date() }
    });

    await eStamp.save();

    // Redirect to document URL
    res.redirect(documentUrl);

  } catch (error) {
    console.error('Download e-stamp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download e-stamp',
      error: error.message
    });
  }
});

// Verify e-stamp certificate (public endpoint)
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const eStamp = await EStamp.findOne({
      'stampCertificate.certificateNumber': certificateNumber
    }).populate('createdBy', 'name email');

    if (!eStamp) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: {
        certificateNumber: eStamp.stampCertificate.certificateNumber,
        issuedAt: eStamp.stampCertificate.issuedAt,
        expiresAt: eStamp.stampCertificate.expiresAt,
        state: eStamp.state,
        stampType: eStamp.stampType,
        stampValue: eStamp.stampValue,
        instrumentType: eStamp.instrumentType,
        isValid: eStamp.isValid,
        daysUntilExpiry: eStamp.daysUntilExpiry,
        verificationUrl: eStamp.stampCertificate.verificationUrl
      }
    });

  } catch (error) {
    console.error('Verify e-stamp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

// Get stamp duty rates by state
router.get('/rates/:state', auth, async (req, res) => {
  try {
    const { state } = req.params;
    const rates = EStamp.getStampDutyRates(state);

    res.json({
      success: true,
      data: { 
        state,
        rates 
      }
    });

  } catch (error) {
    console.error('Get stamp duty rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stamp duty rates',
      error: error.message
    });
  }
});

module.exports = router;
