const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ESignature = require('../models/ESignature');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Configure multer for signature uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for signature upload'), false);
    }
  }
});

// Create new e-signature request
router.post('/create', authenticate, async (req, res) => {
  try {
    const { documentId, signers, settings } = req.body;
    const userId = req.user._id;

    // Validate document exists and user has permission
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user is owner or has permission
    if (document.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Parse signers
    const parsedSigners = Array.isArray(signers) ? signers : JSON.parse(signers);
    
    // Create e-signature request
    const eSignature = new ESignature({
      documentId,
      signers: parsedSigners.map((signer, index) => ({
        ...signer,
        order: index + 1,
        otp: crypto.randomBytes(6).toString('hex').toUpperCase()
      })),
      settings: {
        requireOTP: settings?.requireOTP !== false,
        allowDrawSignature: settings?.allowDrawSignature !== false,
        allowTypeSignature: settings?.allowTypeSignature !== false,
        allowUploadSignature: settings?.allowUploadSignature !== false,
        signatureRequired: settings?.signatureRequired !== false,
        message: settings?.message || 'Please sign This document'
      },
      status: 'draft',
      createdBy: userId,
      auditTrail: [{
        action: 'esignature_created',
        userId,
        details: { documentId, signersCount: parsedSigners.length }
      }]
    });

    await eSignature.save();

    // Send OTP emails to all signers
    for (const signer of eSignature.signers) {
      await emailService.sendOTPEmail(signer.email, eSignature._id, signer.name);
    }

    res.status(201).json({
      success: true,
      message: 'E-signature request created successfully',
      data: { eSignature }
    });

  } catch (error) {
    console.error('Create e-signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create e-signature request',
      error: error.message
    });
  }
});

// Send document for signing
router.post('/:id/send', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eSignature = await ESignature.findById(id).populate('documentId');
    if (!eSignature) {
      return res.status(404).json({
        success: false,
        message: 'E-signature request not found'
      });
    }

    // Check permissions
    if (eSignature.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Update status and send emails
    eSignature.status = 'sent';
    eSignature.auditTrail.push({
      action: 'document_sent',
      userId,
      details: { sentAt: new Date() }
    });

    await eSignature.save();

    // Send signing emails to all signers
    for (const signer of eSignature.signers) {
      await emailService.sendSigningEmail(signer.email, eSignature._id, signer.name, eSignature.settings.message);
    }

    res.json({
      success: true,
      message: 'Document sent for signing successfully'
    });

  } catch (error) {
    console.error('Send document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send document',
      error: error.message
    });
  }
});

// Sign document (with OTP verification)
router.post('/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signerEmail, otp, signatureData, signatureType = 'draw' } = req.body;
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    const eSignature = await ESignature.findById(id);
    if (!eSignature) {
      return res.status(404).json({
        success: false,
        message: 'E-signature request not found'
      });
    }

    // Find signer
    const signer = eSignature.signers.find(s => s.email === signerEmail);
    if (!signer) {
      return res.status(404).json({
        success: false,
        message: 'Signer not found in this document'
      });
    }

    // Verify OTP
    if (eSignature.settings.requireOTP && signer.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Update signer with signature
    signer.signatureData = signatureData;
    signer.signatureType = signatureType;
    signer.signedAt = new Date();
    signer.otpVerified = true;
    signer.ipAddress = clientIP;
    signer.userAgent = userAgent;
    signer.status = 'signed';

    await eSignature.save();

    // Add to audit trail
    eSignature.auditTrail.push({
      action: 'document_signed',
      details: { signerEmail, signedAt: new Date(), ipAddress: clientIP }
    });

    // Check if all signers have signed
    const allSigned = eSignature.signers.every(s => s.status === 'signed');
    if (allSigned) {
      eSignature.status = 'completed';
      eSignature.completedAt = new Date();
      
      eSignature.auditTrail.push({
        action: 'document_completed',
        details: { completedAt: new Date(), totalSigners: eSignature.signers.length }
      });
    }

    await eSignature.save();

    res.json({
      success: true,
      message: allSigned ? 'Document signed and completed' : 'Signature recorded successfully',
      data: {
        allSignersSigned: allSigned,
        completionPercentage: eSignature.completionPercentage
      }
    });

  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign document',
      error: error.message
    });
  }
});

// Upload signature image
router.post('/:id/upload-signature', authenticate, upload.single('signature'), async (req, res) => {
  try {
    const { id } = req.params;
    const { signerEmail } = req.body;
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    const eSignature = await ESignature.findById(id);
    if (!eSignature) {
      return res.status(404).json({
        success: false,
        message: 'E-signature request not found'
      });
    }

    // Find signer
    const signer = eSignature.signers.find(s => s.email === signerEmail);
    if (!signer) {
      return res.status(404).json({
        success: false,
        message: 'Signer not found in this document'
      });
    }

    // Convert image to base64
    const signatureData = req.file.buffer.toString('base64');

    // Update signer with signature
    signer.signatureData = signatureData;
    signer.signatureType = 'upload';
    signer.signedAt = new Date();
    signer.otpVerified = true;
    signer.ipAddress = clientIP;
    signer.userAgent = userAgent;
    signer.status = 'signed';

    await eSignature.save();

    // Add to audit trail
    eSignature.auditTrail.push({
      action: 'signature_uploaded',
      details: { signerEmail, signedAt: new Date() }
    });

    // Check if all signers have signed
    const allSigned = eSignature.signers.every(s => s.status === 'signed');
    if (allSigned) {
      eSignature.status = 'completed';
      eSignature.completedAt = new Date();
      
      eSignature.auditTrail.push({
        action: 'document_completed',
        details: { completedAt: new Date(), totalSigners: eSignature.signers.length }
      });
    }

    await eSignature.save();

    res.json({
      success: true,
      message: allSigned ? 'Document signed and completed' : 'Signature uploaded successfully',
      data: {
        allSignersSigned: allSigned,
        completionPercentage: eSignature.completionPercentage
      }
    });

  } catch (error) {
    console.error('Upload signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload signature',
      error: error.message
    });
  }
});

// Get e-signature details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eSignature = await ESignature.findById(id)
      .populate('documentId')
      .populate('createdBy', 'name email');

    if (!eSignature) {
      return res.status(404).json({
        success: false,
        message: 'E-signature request not found'
      });
    }

    // Check permissions
    const isOwner = eSignature.createdBy._id.toString() === userId.toString();
    const isSigner = eSignature.signers.some(s => s.email === req.user.email);
    
    if (!isOwner && !isSigner) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    res.json({
      success: true,
      data: { eSignature }
    });

  } catch (error) {
    console.error('Get e-signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get e-signature details',
      error: error.message
    });
  }
});

// Get user's e-signature requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { createdBy: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const eSignatures = await ESignature.find(query)
      .populate('documentId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ESignature.countDocuments(query);

    res.json({
      success: true,
      data: {
        eSignatures,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my e-signature requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get e-signature requests',
      error: error.message
    });
  }
});

// Download signed document
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const eSignature = await ESignature.findById(id).populate('documentId');
    if (!eSignature) {
      return res.status(404).json({
        success: false,
        message: 'E-signature request not found'
      });
    }

    // Check permissions
    if (eSignature.createdBy.toString() !== userId.toString() && 
        !eSignature.signers.some(s => s.email === req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Check if document is completed
    if (eSignature.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Document not yet ready for download'
      });
    }

    // Generate PDF with signatures (implementation would go here)
    // For now, return the original document URL
    const documentUrl = eSignature.documentId.fileUrl;
    
    // Add to audit trail
    eSignature.auditTrail.push({
      action: 'document_downloaded',
      userId,
      details: { downloadedAt: new Date() }
    });

    await eSignature.save();

    // Redirect to document URL
    res.redirect(documentUrl);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
});

module.exports = router;
