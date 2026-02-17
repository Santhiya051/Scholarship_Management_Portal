module.exports = (sequelize, DataTypes) => {
  const { Op } = require('sequelize');
  
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.ENUM('bank_transfer', 'check', 'direct_deposit', 'other'),
      defaultValue: 'bank_transfer'
    },
    transaction_id: {
      type: DataTypes.STRING,
      unique: true
    },
    reference_number: {
      type: DataTypes.STRING,
      unique: true
    },
    bank_details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    processed_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    processed_at: {
      type: DataTypes.DATE
    },
    scheduled_date: {
      type: DataTypes.DATE
    },
    completed_at: {
      type: DataTypes.DATE
    },
    failure_reason: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'payments',
    indexes: [
      {
        unique: true,
        fields: ['application_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['processed_by']
      },
      {
        fields: ['scheduled_date']
      },
      {
        unique: true,
        fields: ['transaction_id'],
        where: {
          transaction_id: {
            [Op.ne]: null
          }
        }
      }
    ]
  });

  // Instance methods
  Payment.prototype.markAsProcessing = function(processedBy) {
    this.status = 'processing';
    this.processed_by = processedBy;
    this.processed_at = new Date();
    
    return this.save();
  };

  Payment.prototype.markAsCompleted = function(transactionId) {
    this.status = 'completed';
    this.transaction_id = transactionId;
    this.completed_at = new Date();
    
    return this.save();
  };

  Payment.prototype.markAsFailed = function(reason) {
    this.status = 'failed';
    this.failure_reason = reason;
    
    return this.save();
  };

  Payment.prototype.generateReferenceNumber = function() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    this.reference_number = `PAY-${year}${month}-${random}`;
    return this.reference_number;
  };

  Payment.prototype.canBeProcessed = function() {
    return ['pending', 'failed'].includes(this.status);
  };

  Payment.prototype.canBeCancelled = function() {
    return ['pending', 'processing'].includes(this.status);
  };

  // Class methods
  Payment.getPendingPayments = function() {
    return this.findAll({
      where: {
        status: 'pending'
      },
      order: [['scheduled_date', 'ASC']]
    });
  };

  Payment.getTotalDisbursed = function(startDate, endDate) {
    const whereClause = {
      status: 'completed'
    };
    
    if (startDate && endDate) {
      whereClause.completed_at = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    return this.sum('amount', { where: whereClause });
  };

  return Payment;
};