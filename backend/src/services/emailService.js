const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Use custom SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      }
    } catch (error) {
      console.error('Email service initialization failed:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification - Vidhanto Legal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Vidhanto Legal</h1>
            <p>AI-Powered Legal Tech Platform for India</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up with Vidhanto Legal! Please click the button below to verify your email address and activate your account.</p>
            <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${verificationUrl}</small></p>
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Vidhanto Legal. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, 'Verify Your Email Address - Vidhanto Legal', html);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Vidhanto Legal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Vidhanto Legal</p>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Vidhanto Legal account. Click the button below to set a new password.</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <p>Or copy and paste this link in your browser:</p>
            <p><small>${resetUrl}</small></p>
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This password reset link will expire in 1 hour.</li>
                <li>If you didn't request this password reset, please ignore this email.</li>
                <li>For security reasons, never share this link with anyone.</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Vidhanto Legal. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, 'Reset Your Password - Vidhanto Legal', html);
  }

  async sendAppointmentConfirmation(email, appointmentDetails) {
    const { lawyerName, date, time, consultationType, meetingLink } = appointmentDetails;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Confirmation - Vidhanto Legal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed!</h1>
            <p>Vidhanto Legal</p>
          </div>
          <div class="content">
            <h2>Your Consultation is Scheduled</h2>
            <p>Great news! Your appointment has been confirmed. Here are the details:</p>
            
            <div class="appointment-details">
              <h3>Appointment Details</h3>
              <p><strong>Lawyer:</strong> ${lawyerName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Consultation Type:</strong> ${consultationType}</p>
              ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
            </div>
            
            <p>Please make sure to:</p>
            <ul>
              <li>Join the consultation 5 minutes early</li>
              <li>Have your documents ready</li>
              <li>Test your audio/video if it's a video consultation</li>
            </ul>
            
            ${meetingLink ? `<p><a href="${meetingLink}" class="button">Join Consultation</a></p>` : ''}
          </div>
          <div class="footer">
            <p>&copy; 2024 Vidhanto Legal. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, 'Appointment Confirmation - Vidhanto Legal', html);
  }

  async sendPaymentConfirmation(email, paymentDetails) {
    const { amount, orderId, serviceName, paymentDate } = paymentDetails;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation - Vidhanto Legal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful!</h1>
            <p>Vidhanto Legal</p>
          </div>
          <div class="content">
            <h2>Payment Received</h2>
            <p>Thank you for your payment. Your transaction has been processed successfully.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Amount Paid:</strong> ₹${amount}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Payment Date:</strong> ${paymentDate}</p>
            </div>
            
            <p>You can view your invoice and payment history in your dashboard.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Vidhanto Legal. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, 'Payment Confirmation - Vidhanto Legal', html);
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new EmailService();
