const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { authenticate, checkOwnership, requireLawyerVerification } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/documents
// @desc    Create new document
router.post('/', authenticate, [
  body('type').isIn(['nda', 'agreement', 'legal-notice', 'affidavit', 'will', 'petition', 'other']).withMessage('Invalid document type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required'),
  body('content').optional().isLength({ max: 10000 }),
  body('lawyerId').optional().isMongoId().withMessage('Invalid lawyer ID'),
  body('templateId').optional().isMongoId().withMessage('Invalid template ID'),
  body('isDraft').optional().isBoolean()
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

    const { type, title, description, content, lawyerId, templateId, isDraft = false } = req.body;

    // Create document
    const document = new Document({
      userId: req.user._id,
      lawyerId,
      type,
      title,
      description,
      content: content || '',
      status: isDraft ? 'draft' : 'pending',
      isDraft,
      templateId,
      version: 1,
      metadata: {
        wordCount: content ? content.split(/\s+/).length : 0,
        pageCount: Math.ceil((content ? content.length : 0) / 500), // Approximate
        lastModified: new Date()
      }
    });

    await document.save();

    // If lawyer assigned, notify lawyer
    if (lawyerId) {
      const Lawyer = require('../models/Lawyer');
      const lawyer = await Lawyer.findById(lawyerId);
      if (lawyer) {
        // Add notification logic here
        console.log(`Document assigned to lawyer: ${lawyerId}`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating document'
    });
  }
});

// @route   GET /api/documents
// @desc    Get user documents with pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, isDraft } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (isDraft !== undefined) {
      query.isDraft = isDraft === 'true';
    }

    const documents = await Document.find(query)
      .populate('lawyerId', 'barLicenseNumber specialization')
      .sort({ updatedAt: -1 })
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

// @route   GET /api/documents/:id
// @desc    Get document by ID
router.get('/:id', authenticate, checkOwnership('Document', 'id'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('lawyerId', 'barLicenseNumber specialization userId')
      .populate('userId', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching document'
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document
router.put('/:id', authenticate, checkOwnership('Document', 'id'), [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }),
  body('content').optional().isLength({ max: 10000 }),
  body('lawyerId').optional().isMongoId(),
  body('isDraft').optional().isBoolean()
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

    const document = req.resource;
    const updates = req.body;

    // Only allow updates if document is not finalized
    if (document.status === 'finalized') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update finalized document'
      });
    }

    // Update allowed fields
    if (updates.title) document.title = updates.title;
    if (updates.description) document.description = updates.description;
    if (updates.content !== undefined) {
      document.content = updates.content;
      document.version += 1;
    }
    if (updates.lawyerId) document.lawyerId = updates.lawyerId;
    if (updates.isDraft !== undefined) {
      document.isDraft = updates.isDraft;
      document.status = updates.isDraft ? 'draft' : 'pending';
    }

    // Update metadata
    document.metadata.wordCount = document.content.split(/\s+/).length;
    document.metadata.pageCount = Math.ceil(document.content.length / 500);
    document.metadata.lastModified = new Date();

    await document.save();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating document'
    });
  }
});

// @route   POST /api/documents/:id/review
// @desc    Submit document for lawyer review
router.post('/:id/review', authenticate, checkOwnership('Document', 'id'), [
  body('lawyerId').notEmpty().withMessage('Lawyer ID is required'),
  body('reviewInstructions').trim().isLength({ min: 1, max: 1000 }).withMessage('Review instructions are required'),
  body('urgency').optional().isIn(['low', 'medium', 'high'])
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

    const document = req.resource;
    const { lawyerId, reviewInstructions, urgency = 'medium' } = req.body;

    // Verify lawyer exists and is verified
    const Lawyer = require('../models/Lawyer');
    const lawyer = await Lawyer.findOne({ _id: lawyerId, isVerified: true });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found or not verified'
      });
    }

    // Update document
    document.lawyerId = lawyerId;
    document.status = 'in_review';
    document.reviewDetails = {
      submittedAt: new Date(),
      instructions: reviewInstructions,
      urgency,
      status: 'pending'
    };

    await document.save();

    res.json({
      success: true,
      message: 'Document submitted for review successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting document for review'
    });
  }
});

// @route   PUT /api/documents/:id/review
// @desc    Lawyer reviews document
router.put('/:id/review', authenticate, requireLawyerVerification, [
  body('reviewComments').trim().isLength({ min: 1, max: 2000 }).withMessage('Review comments are required'),
  body('reviewStatus').isIn(['approved', 'rejected', 'needs_revision']).withMessage('Invalid review status'),
  body('revisions').optional().isArray()
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

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Verify lawyer is assigned to this document
    if (document.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned lawyer can review this document'
      });
    }

    const { reviewComments, reviewStatus, revisions } = req.body;

    // Update document review
    document.reviewDetails.reviewComments = reviewComments;
    document.reviewDetails.reviewStatus = reviewStatus;
    document.reviewDetails.reviewedAt = new Date();
    document.reviewDetails.reviewedBy = req.user._id;

    if (revisions && revisions.length > 0) {
      document.reviewDetails.revisions = revisions;
    }

    // Update document status based on review
    switch (reviewStatus) {
      case 'approved':
        document.status = 'approved';
        break;
      case 'rejected':
        document.status = 'rejected';
        break;
      case 'needs_revision':
        document.status = 'needs_revision';
        break;
    }

    await document.save();

    res.json({
      success: true,
      message: 'Document review submitted successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reviewing document'
    });
  }
});

// @route   POST /api/documents/:id/sign
// @desc    Sign document (e-signature)
router.post('/:id/sign', authenticate, checkOwnership('Document', 'id'), [
  body('signerName').trim().isLength({ min: 1, max: 100 }).withMessage('Signer name is required'),
  body('signerEmail').isEmail().withMessage('Valid signer email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP is required')
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

    const document = req.resource;
    const { signerName, signerEmail, otp } = req.body;

    // Verify OTP (in production, this would verify against sent OTP)
    // For demo, we'll accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Add signature
    const signature = {
      signerName,
      signerEmail,
      signedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      otpVerified: true
    };

    document.signatures.push(signature);
    document.status = 'signed';
    document.signedAt = new Date();

    await document.save();

    res.json({
      success: true,
      message: 'Document signed successfully',
      data: { 
        document,
        signature: {
          signerName,
          signerEmail,
          signedAt: signature.signedAt
        }
      }
    });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error signing document'
    });
  }
});

// @route   GET /api/documents/templates
// @desc    Get document templates
router.get('/templates', authenticate, async (req, res) => {
  try {
    const { type } = req.query;

    // Document templates for Indian legal system
    const templates = [
      {
        id: 'nda-template',
        name: 'Non-Disclosure Agreement',
        type: 'nda',
        description: 'Standard NDA template for business agreements',
        content: 'This Non-Disclosure Agreement...',
        fields: ['company_name', 'purpose', 'duration', 'penalty_clause']
      },
      {
        id: 'employment-agreement',
        name: 'Employment Agreement',
        type: 'agreement',
        description: 'Comprehensive employment contract template',
        content: 'This Employment Agreement...',
        fields: ['employee_name', 'employer_name', 'position', 'salary', 'start_date']
      },
      {
        id: 'rental-agreement',
        name: 'Rental Agreement',
        type: 'agreement',
        description: 'Property rental agreement template',
        content: 'This Rental Agreement...',
        fields: ['landlord_name', 'tenant_name', 'property_address', 'rent_amount', 'duration']
      },
      {
        id: 'legal-notice',
        name: 'Legal Notice',
        type: 'legal-notice',
        description: 'General legal notice template',
        content: 'LEGAL NOTICE...',
        fields: ['recipient_name', 'notice_type', 'details', 'compliance_period']
      },
      {
        id: 'affidavit',
        name: 'Affidavit',
        type: 'affidavit',
        description: 'General affidavit template',
        content: 'AFFIDAVIT...',
        fields: ['deponent_name', 'purpose', 'facts', 'oath_statement']
      }
    ];

    let filteredTemplates = templates;
    if (type) {
      filteredTemplates = templates.filter(template => template.type === type);
    }

    res.json({
      success: true,
      data: {
        templates: filteredTemplates,
        types: ['nda', 'agreement', 'legal-notice', 'affidavit', 'will', 'petition', 'other']
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching templates'
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
router.delete('/:id', authenticate, checkOwnership('Document', 'id'), async (req, res) => {
  try {
    const document = req.resource;

    // Only allow deletion if document is not finalized or signed
    if (['finalized', 'signed'].includes(document.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete finalized or signed document'
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting document'
    });
  }
});

module.exports = router;
