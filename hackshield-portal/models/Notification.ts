import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['hackathon', 'team', 'project', 'system', 'social', 'financial'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'hackathon_updates',
      'team_invitations', 
      'project_feedback',
      'marketplace_activity',
      'social_interactions',
      'system_announcements',
      'security_alerts'
    ],
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  }],
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  actionText: {
    type: String
  },
  metadata: {
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      avatar: String
    },
    hackathon: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon'
      },
      name: String
    },
    team: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      },
      name: String
    },
    project: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      },
      name: String
    }
  },
  scheduledFor: {
    type: Date
  },
  deliveryStatus: {
    email: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String,
      provider: String,
      messageId: String
    },
    sms: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String,
      provider: String,
      messageId: String
    },
    push: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String,
      subscription: String
    },
    in_app: {
      status: {
        type: String,
        enum: ['sent', 'delivered'],
        default: 'sent'
      },
      deliveredAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, archived: 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ priority: 1, createdAt: -1 });
NotificationSchema.index({ 'deliveryStatus.email.status': 1 });
NotificationSchema.index({ 'deliveryStatus.sms.status': 1 });
NotificationSchema.index({ 'deliveryStatus.push.status': 1 });

// Compound indexes for common queries
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1, archived: 1, createdAt: -1 });

// Virtual for delivery summary
NotificationSchema.virtual('deliverySummary').get(function() {
  const summary: any = {};
  
  this.channels.forEach((channel: string) => {
    const status = (this.deliveryStatus as any)?.[channel];
    summary[channel] = {
      status: status?.status || 'pending',
      deliveredAt: status?.deliveredAt,
      failureReason: status?.failureReason
    };
  });
  
  return summary;
});

// Static method to create notification
NotificationSchema.statics.createNotification = function(data: any) {
  return new this({
    userId: data.userId,
    type: data.type,
    category: data.category,
    title: data.title,
    message: data.message,
    data: data.data,
    priority: data.priority || 'medium',
    channels: data.channels || ['in_app'],
    actionRequired: data.actionRequired || false,
    actionUrl: data.actionUrl,
    actionText: data.actionText,
    metadata: data.metadata || {},
    scheduledFor: data.scheduledFor
  });
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Instance method to mark as archived
NotificationSchema.methods.archive = function() {
  this.archived = true;
  return this.save();
};

// Instance method to update delivery status
NotificationSchema.methods.updateDeliveryStatus = function(channel: string, status: string, data?: any) {
  const deliveryData: any = {
    status,
    ...data
  };
  
  if (status === 'sent') {
    deliveryData.sentAt = new Date();
  } else if (status === 'delivered') {
    deliveryData.deliveredAt = new Date();
  }
  
  this.deliveryStatus[channel] = {
    ...this.deliveryStatus[channel],
    ...deliveryData
  };
  
  return this.save();
};

// Pre-save middleware to set default delivery status
NotificationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Initialize delivery status for all channels
    this.channels.forEach((channel: string) => {
      if (!(this.deliveryStatus as any)?.[channel]) {
        (this.deliveryStatus as any)[channel] = {
          status: channel === 'in_app' ? 'sent' : 'pending'
        };
        
        if (channel === 'in_app') {
          (this.deliveryStatus as any).in_app.deliveredAt = new Date();
        }
      }
    });
  }
  next();
});

NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);