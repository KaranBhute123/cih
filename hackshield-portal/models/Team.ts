import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxSize: {
    type: Number,
    default: 4
  },
  status: {
    type: String,
    enum: ['forming', 'complete', 'registered', 'active', 'disbanded'],
    default: 'forming'
  },
  projectIdea: {
    type: String
  },
  repositoryUrl: {
    type: String
  },
  skills: [String],
  lookingFor: [String],
  ideSchedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '17:00'
    },
    allowedDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    lockdownMode: {
      type: Boolean,
      default: true
    },
    organizationApproved: {
      type: Boolean,
      default: false
    },
    accessWindows: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,
      maxDuration: Number // in minutes
    }],
    requestedAt: Date,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  ideAccessRequirements: String,
  ideAccessStatus: {
    type: String,
    enum: ['pending_approval', 'approved', 'denied', 'active', 'expired'],
    default: 'pending_approval'
  },
  ideCredentials: {
    username: {
      type: String,
      unique: true,
      sparse: true
    },
    passkey: {
      type: String
    },
    mainBranch: {
      type: String,
      default: 'main'
    },
    branches: [{
      name: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    credentialsSentAt: Date,
    leaderActivated: {
      type: Boolean,
      default: false
    },
    activatedAt: Date
  }
}, {
  timestamps: true,
  strict: false  // Allow fields not in schema for backward compatibility with old data
});

// Indexes
TeamSchema.index({ hackathonId: 1 });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ 'members.userId': 1 });

// Virtual for member count
TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if team is full
TeamSchema.methods.isFull = function() {
  return this.members.length >= this.maxSize;
};

// Method to add member
TeamSchema.methods.addMember = function(userId: string, name: string, email: string, role: string = 'member') {
  if (this.isFull()) {
    throw new Error('Team is already full');
  }
  
  const existingMember = this.members.find((m: any) => m.userId.toString() === userId);
  if (existingMember) {
    throw new Error('User is already a team member');
  }
  
  this.members.push({
    userId,
    name,
    email,
    role,
    joinedAt: new Date()
  });
  
  return this.save();
};

TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);