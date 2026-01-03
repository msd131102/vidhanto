const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const moment = require('moment');

class PaymentService {
  constructor() {
    this.razorpay = null;
    this.initializeRazorpay();
  }

  initializeRazorpay() {
    try {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    } catch (error) {
      console.error('Razorpay initialization failed:', error);
    }
  }

  async createOrder(amount, currency = 'INR', receipt = null, notes = {}) {
    try {
      if (!this.razorpay) {
        throw new Error('Payment service not initialized');
      }

      const options = {
        amount: amount * 100, // Convert to paise (Indian currency)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          created_at: new Date().toISOString(),
          platform: 'vidhanto'
        }
      };

      const order = await this.razorpay.orders.create(options);
      
      return {
        success: true,
        order: {
          id: order.id,
          entity: order.entity,
          amount: order.amount,
          amount_paid: order.amount_paid,
          amount_due: order.amount_due,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          attempts: order.attempts,
          notes: order.notes,
          created_at: order.created_at
        }
      };
    } catch (error) {
      console.error('Order creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyPayment(paymentId, orderId, signature) {
    try {
      if (!this.razorpay) {
        throw new Error('Payment service not initialized');
      }

      // Generate signature for verification
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === signature;

      if (!isSignatureValid) {
        return {
          success: false,
          error: 'Invalid payment signature',
          verified: false
        };
      }

      // Fetch payment details from Razorpay
      const payment = await this.razorpay.payments.fetch(paymentId);
      
      return {
        success: true,
        verified: true,
        payment: {
          id: payment.id,
          entity: payment.entity,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          order_id: payment.order_id,
          invoice_id: payment.invoice_id,
          international: payment.international,
          method: payment.method,
          amount_refunded: payment.amount_refunded,
          refund_status: payment.refund_status,
          captured: payment.captured,
          description: payment.description,
          card_id: payment.card_id,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa,
          email: payment.email,
          contact: payment.contact,
          notes: payment.notes,
          fee: payment.fee,
          tax: payment.tax,
          created_at: payment.created_at
        }
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message,
        verified: false
      };
    }
  }

  async createPaymentRecord(paymentData) {
    try {
      const {
        userId,
        orderId,
        paymentId,
        amount,
        currency,
        status,
        method,
        description,
        metadata,
        serviceType,
        serviceId
      } = paymentData;

      const payment = new Payment({
        user: userId,
        orderId,
        paymentId,
        amount,
        currency: currency || 'INR',
        status,
        method,
        description,
        metadata,
        serviceType,
        serviceId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await payment.save();
      
      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Payment record creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    try {
      const payment = await Payment.findOne({ paymentId });
      
      if (!payment) {
        return {
          success: false,
          error: 'Payment record not found'
        };
      }

      payment.status = status;
      payment.updatedAt = new Date();
      
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          payment[key] = additionalData[key];
        });
      }

      await payment.save();
      
      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Payment status update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPaymentHistory(userId, page = 1, limit = 10, filters = {}) {
    try {
      const query = { user: userId };
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.serviceType) {
        query.serviceType = filters.serviceType;
      }
      
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: moment(filters.startDate).startOf('day').toDate(),
          $lte: moment(filters.endDate).endOf('day').toDate()
        };
      }

      const skip = (page - 1) * limit;
      
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('serviceId', 'title type')
        .select('-metadata -__v');

      const total = await Payment.countDocuments(query);
      
      return {
        success: true,
        payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Payment history fetch failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPaymentStats(userId, period = 'month') {
    try {
      const startDate = moment().subtract(1, period).startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();

      const matchStage = {
        user: userId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'captured'
      };

      const stats = await Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalPayments: { $sum: 1 },
            averageAmount: { $avg: '$amount' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' }
          }
        }
      ]);

      const result = stats[0] || {
        totalAmount: 0,
        totalPayments: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0
      };

      return {
        success: true,
        stats: {
          ...result,
          period,
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Payment stats fetch failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processRefund(paymentId, amount, reason = '') {
    try {
      if (!this.razorpay) {
        throw new Error('Payment service not initialized');
      }

      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100, // Convert to paise
        notes: {
          reason,
          refund_processed_by: 'vidhanto_system',
          refund_date: new Date().toISOString()
        }
      });

      // Update payment record
      await this.updatePaymentStatus(paymentId, 'refunded', {
        refundId: refund.id,
        refundAmount: refund.amount,
        refundStatus: refund.status,
        refundReason: reason
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          entity: refund.entity,
          amount: refund.amount,
          currency: refund.currency,
          payment_id: refund.payment_id,
          status: refund.status,
          notes: refund.notes,
          created_at: refund.created_at
        }
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateInvoice(paymentId) {
    try {
      const payment = await Payment.findOne({ paymentId })
        .populate('user', 'firstName lastName email phone')
        .populate('serviceId', 'title description');

      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        };
      }

      const invoice = {
        invoiceNumber: `INV-${Date.now()}`,
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        date: payment.createdAt,
        dueDate: payment.createdAt,
        customer: {
          name: `${payment.user.firstName} ${payment.user.lastName}`,
          email: payment.user.email,
          phone: payment.user.phone
        },
        items: [{
          description: payment.description || payment.serviceId?.title || 'Service',
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }],
        subtotal: payment.amount,
        tax: 0,
        total: payment.amount,
        status: payment.status,
        paymentMethod: payment.method
      };

      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Invoice generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Service type pricing
  getServicePricing() {
    return {
      ai_consultation: {
        name: 'AI Legal Assistant',
        basePrice: 99,
        currency: 'INR',
        description: 'Per session with AI legal assistant'
      },
      lawyer_consultation: {
        name: 'Lawyer Consultation',
        basePrice: 1499,
        currency: 'INR',
        description: '30-minute consultation with verified lawyer'
      },
      document_drafting: {
        name: 'Document Drafting',
        basePrice: 2999,
        currency: 'INR',
        description: 'Professional legal document drafting'
      },
      document_review: {
        name: 'Document Review',
        basePrice: 1999,
        currency: 'INR',
        description: 'Legal document review by expert lawyer'
      },
      company_registration: {
        name: 'Company Registration',
        basePrice: 9999,
        currency: 'INR',
        description: 'Complete company registration service'
      },
      gst_registration: {
        name: 'GST Registration',
        basePrice: 2999,
        currency: 'INR',
        description: 'GST registration assistance'
      },
      trademark_filing: {
        name: 'Trademark Filing',
        basePrice: 6999,
        currency: 'INR',
        description: 'Trademark registration and filing'
      }
    };
  }

  calculatePrice(serviceType, additionalOptions = {}) {
    const pricing = this.getServicePricing();
    const basePrice = pricing[serviceType]?.basePrice || 0;
    
    let totalPrice = basePrice;
    
    // Add additional costs based on options
    if (additionalOptions.urgent) {
      totalPrice *= 1.5; // 50% extra for urgent service
    }
    
    if (additionalOptions.premiumLawyer) {
      totalPrice *= 1.3; // 30% extra for premium lawyer
    }
    
    if (additionalOptions.consultationDuration === '60min') {
      totalPrice *= 1.5; // 50% extra for 60-minute consultation
    }
    
    return {
      basePrice,
      totalPrice,
      currency: 'INR',
      additionalOptions,
      breakdown: {
        base: basePrice,
        urgent: additionalOptions.urgent ? basePrice * 0.5 : 0,
        premiumLawyer: additionalOptions.premiumLawyer ? basePrice * 0.3 : 0,
        extendedDuration: additionalOptions.consultationDuration === '60min' ? basePrice * 0.5 : 0
      }
    };
  }
}

module.exports = new PaymentService();
