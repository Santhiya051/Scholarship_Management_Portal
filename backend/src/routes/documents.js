const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { fileValidation } = require('../middlewares/validation');
const { auditLogger, uploadLimiter } = require('../middlewares/security');
const { Document, Application, Student, User } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Upload document
router.post('/upload',
  authenticateToken,
  uploadLimiter,
  upload.single('file'),
  fileValidation.validateFileUpload,
  auditLogger('UPLOAD', 'document'),
  async (req, res) => {
    try {
      const { application_id, document_type } = req.body;

      // Verify application exists and user has access
      const application = await Application.findByPk(application_id, {
        include: [{
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user'
          }]
        }]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Check if user owns the application (students) or has permission (staff)
      if (req.user.role.name === 'student' && application.student.user.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Create document record
      const document = await Document.create({
        application_id,
        document_type,
        original_filename: req.file.originalname,
        stored_filename: req.file.filename,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: { document }
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }
  }
);

// Get documents for an application
router.get('/application/:applicationId',
  authenticateToken,
  async (req, res) => {
    try {
      const { applicationId } = req.params;

      // Verify application access
      const application = await Application.findByPk(applicationId, {
        include: [{
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user'
          }]
        }]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Check access permissions
      if (req.user.role.name === 'student' && application.student.user.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const documents = await Document.findAll({
        where: { application_id: applicationId },
        include: [{
          model: User,
          as: 'uploader',
          attributes: ['first_name', 'last_name']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: { documents }
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch documents'
      });
    }
  }
);

// Download document
router.get('/:id/download',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const document = await Document.findByPk(id, {
        include: [{
          model: Application,
          as: 'application',
          include: [{
            model: Student,
            as: 'student',
            include: [{
              model: User,
              as: 'user'
            }]
          }]
        }]
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check access permissions
      if (req.user.role.name === 'student' && 
          document.application.student.user.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if file exists
      try {
        await fs.access(document.file_path);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
      res.setHeader('Content-Type', document.mime_type);

      // Send file
      res.sendFile(path.resolve(document.file_path));
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download document'
      });
    }
  }
);

// Verify document (coordinators, committee, admin)
router.put('/:id/verify',
  authenticateToken,
  requireRole(['coordinator', 'committee', 'admin']),
  auditLogger('VERIFY', 'document'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { verification_status, verification_notes } = req.body;

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      await document.update({
        verification_status,
        verification_notes,
        verified_by: req.user.id,
        verified_at: new Date()
      });

      res.json({
        success: true,
        message: 'Document verification updated',
        data: { document }
      });
    } catch (error) {
      console.error('Verify document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify document'
      });
    }
  }
);

// Delete document
router.delete('/:id',
  authenticateToken,
  auditLogger('DELETE', 'document'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const document = await Document.findByPk(id, {
        include: [{
          model: Application,
          as: 'application',
          include: [{
            model: Student,
            as: 'student',
            include: [{
              model: User,
              as: 'user'
            }]
          }]
        }]
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check permissions
      const isOwner = req.user.role.name === 'student' && 
                     document.application.student.user.id === req.user.id;
      const isStaff = ['coordinator', 'committee', 'admin'].includes(req.user.role.name);

      if (!isOwner && !isStaff) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.file_path);
      } catch (error) {
        console.warn('File not found on filesystem:', document.file_path);
      }

      // Delete database record
      await document.destroy();

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document'
      });
    }
  }
);

module.exports = router;