const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

class UploadService {
  constructor() {
    this.s3 = null;
    this.initializeS3();
    this.initializeMulter();
  }

  initializeS3() {
    try {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });
    } catch (error) {
      console.error('S3 initialization failed:', error);
    }
  }

  initializeMulter() {
    // Configure multer for memory storage
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
        const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
        
        if (allowedTypes.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
      }
    });
  }

  generateFileName(originalName, userId = null) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(originalname);
    const baseName = path.basename(originalname, extension);
    
    // Sanitize filename
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    if (userId) {
      return `users/${userId}/${sanitizedName}_${timestamp}_${randomString}${extension}`;
    }
    
    return `documents/${sanitizedName}_${timestamp}_${randomString}${extension}`;
  }

  async uploadFile(file, userId = null, folder = 'documents') {
    try {
      if (!this.s3) {
        throw new Error('S3 service not initialized');
      }

      const fileName = this.generateFileName(file.originalname, userId);
      const key = `${folder}/${fileName}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private', // Change to 'public-read' if needed
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId || 'anonymous',
          uploadTime: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(params).promise();
      
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        etag: result.ETag,
        bucket: result.Bucket,
        size: file.size,
        contentType: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async uploadMultipleFiles(files, userId = null, folder = 'documents') {
    const uploadPromises = files.map(file => this.uploadFile(file, userId, folder));
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      files: results,
      totalFiles: files.length,
      successfulUploads: results.filter(r => r.success).length,
      failedUploads: results.filter(r => !r.success).length
    };
  }

  async deleteFile(key) {
    try {
      if (!this.s3) {
        throw new Error('S3 service not initialized');
      }

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('File deletion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getFileUrl(key, expiresIn = 3600) {
    try {
      if (!this.s3) {
        throw new Error('S3 service not initialized');
      }

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrl('getObject', params);
      
      return {
        success: true,
        url,
        expiresIn
      };
    } catch (error) {
      console.error('Generating file URL failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getFileInfo(key) {
    try {
      if (!this.s3) {
        throw new Error('S3 service not initialized');
      }

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      
      return {
        success: true,
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        etag: result.ETag,
        metadata: result.Metadata
      };
    } catch (error) {
      console.error('Getting file info failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get middleware for single file upload
  single(fieldName) {
    return this.upload.single(fieldName);
  }

  // Get middleware for multiple files upload
  multiple(fieldName, maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }

  // Validate file before upload
  validateFile(file) {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    
    const errors = [];
    
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }
    
    if (!allowedTypes.includes(fileExtension)) {
      errors.push(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new UploadService();
