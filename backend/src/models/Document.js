module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    document_type: {
      type: DataTypes.ENUM(
        'transcript',
        'recommendation_letter',
        'personal_statement',
        'financial_statement',
        'enrollment_proof',
        'id_document',
        'other'
      ),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    verified_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE
    },
    verification_notes: {
      type: DataTypes.TEXT
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'documents',
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['document_type']
      },
      {
        fields: ['verification_status']
      },
      {
        fields: ['uploaded_by']
      }
    ]
  });

  // Instance methods
  Document.prototype.verify = function(verifierId, notes = '') {
    this.verification_status = 'verified';
    this.verified_by = verifierId;
    this.verified_at = new Date();
    this.verification_notes = notes;
    
    return this.save();
  };

  Document.prototype.reject = function(verifierId, notes = '') {
    this.verification_status = 'rejected';
    this.verified_by = verifierId;
    this.verified_at = new Date();
    this.verification_notes = notes;
    
    return this.save();
  };

  Document.prototype.getFileUrl = function() {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/documents/${this.id}/download`;
  };

  Document.prototype.isImage = function() {
    return this.mime_type.startsWith('image/');
  };

  Document.prototype.isPDF = function() {
    return this.mime_type === 'application/pdf';
  };

  Document.prototype.getFileSizeFormatted = function() {
    const bytes = this.file_size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Class methods
  Document.getRequiredDocuments = function(scholarshipId) {
    // This would typically come from scholarship requirements
    return [
      'transcript',
      'recommendation_letter',
      'personal_statement',
      'enrollment_proof'
    ];
  };

  return Document;
};