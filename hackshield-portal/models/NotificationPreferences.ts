import mongoose from 'mongoose';

interface INotificationPreferencesStatics {
  createDefault(userId: string, email: string): any;
}

interface INotificationPreferencesModel extends mongoose.Model<any>, INotificationPreferencesStatics {}

const NotificationPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  channels: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      address: {
        type: String,
        required: true
      },
      verified: {
        type: Boolean,
        default: false
      },
      verificationToken: String,
      verificationExpiry: Date
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String
      },
      verified: {
        type: Boolean,
        default: false
      },
      verificationCode: String,
      verificationExpiry: Date,
      countryCode: {
        type: String,
        default: '+1'
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      subscription: {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String
        }
      },
      deviceTokens: [{
        token: String,
        platform: {
          type: String,
          enum: ['web', 'ios', 'android']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    in_app: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  categories: {
    hackathon_updates: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    },
    team_invitations: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
      }
    },
    project_feedback: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    },
    marketplace_activity: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
      }
    },
    social_interactions: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
      }
    },
    system_announcements: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    },
    security_alerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'critical'
      }
    }
  },
  schedule: {
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String, // Format: "22:00"
        default: "22:00"
      },
      end: {
        type: String, // Format: "08:00"
        default: "08:00"
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    },
    digest: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      time: {
        type: String, // Format: "09:00"
        default: "09:00"
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      day: {
        type: String, // For weekly digest
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: 'monday'
      },
      date: {
        type: Number, // For monthly digest (1-28)
        min: 1,
        max: 28,
        default: 1
      },
      lastSent: Date
    },
    immediate: {
      enabled: {
        type: Boolean,
        default: true
      },
      priorities: [{
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: ['high', 'critical']
      }]
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

// Index for efficient querying
NotificationPreferencesSchema.index({ userId: 1 });

// Static method to create default preferences
NotificationPreferencesSchema.statics.createDefault = function(userId: string, email: string) {
  return new this({
    userId,
    channels: {
      email: {
        enabled: true,
        address: email,
        verified: false
      },
      sms: {
        enabled: false
      },
      push: {
        enabled: true
      },
      in_app: {
        enabled: true
      }
    },
    categories: {
      hackathon_updates: {
        enabled: true,
        channels: ['email', 'in_app'],
        priority: 'medium'
      },
      team_invitations: {
        enabled: true,
        channels: ['email', 'push', 'in_app'],
        priority: 'high'
      },
      project_feedback: {
        enabled: true,
        channels: ['email', 'in_app'],
        priority: 'medium'
      },
      marketplace_activity: {
        enabled: true,
        channels: ['email', 'push', 'in_app'],
        priority: 'high'
      },
      social_interactions: {
        enabled: true,
        channels: ['in_app'],
        priority: 'low'
      },
      system_announcements: {
        enabled: true,
        channels: ['email', 'in_app'],
        priority: 'medium'
      },
      security_alerts: {
        enabled: true,
        channels: ['email', 'sms', 'push'],
        priority: 'critical'
      }
    },
    schedule: {
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: 'UTC'
      },
      digest: {
        enabled: false,
        frequency: 'weekly',
        time: "09:00",
        timezone: 'UTC'
      },
      immediate: {
        enabled: true,
        priorities: ['high', 'critical']
      }
    }
  });
};

// Method to check if notification should be sent
NotificationPreferencesSchema.methods.shouldSendNotification = function(category: string, channel: string, priority: string) {
  // Check if category is enabled
  const categoryPrefs = this.categories[category];
  if (!categoryPrefs || !categoryPrefs.enabled) {
    return false;
  }

  // Check if channel is enabled for this category
  if (!categoryPrefs.channels.includes(channel)) {
    return false;
  }

  // Check if channel is globally enabled
  const channelPrefs = this.channels[channel];
  if (!channelPrefs || !channelPrefs.enabled) {
    return false;
  }

  // For SMS and email, check if verified (for critical notifications)
  if ((channel === 'sms' || channel === 'email') && priority === 'critical' && !channelPrefs.verified) {
    return false;
  }

  return true;
};

// Method to check if currently in quiet hours
NotificationPreferencesSchema.methods.isInQuietHours = function() {
  if (!this.schedule.quietHours.enabled) {
    return false;
  }

  const now = new Date();
  const userTimezone = this.schedule.quietHours.timezone || this.timezone || 'UTC';
  
  // Convert to user's timezone
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const startTime = this.parseTime(this.schedule.quietHours.start);
  const endTime = this.parseTime(this.schedule.quietHours.end);

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    return currentTime >= startTime && currentTime <= endTime;
  }
};

// Helper method to parse time string
NotificationPreferencesSchema.methods.parseTime = function(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

NotificationPreferencesSchema.set('toJSON', { virtuals: true });
NotificationPreferencesSchema.set('toObject', { virtuals: true });

export default (mongoose.models.NotificationPreferences || mongoose.model<any, INotificationPreferencesModel>('NotificationPreferences', NotificationPreferencesSchema)) as INotificationPreferencesModel;