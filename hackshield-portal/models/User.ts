import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.provider; // Password required only for credential-based auth
    }
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['participant', 'organizer', 'judge', 'mentor', 'admin'],
    default: 'participant'
  },
  profile: {
    bio: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    twitter: String,
    skills: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    interests: [String],
    languages: [String],
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'participants', 'private'],
        default: 'participants'
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true }
    }
  },
  stats: {
    hackathonsParticipated: { type: Number, default: 0 },
    hackathonsWon: { type: Number, default: 0 },
    projectsSubmitted: { type: Number, default: 0 },
    teamsJoined: { type: Number, default: 0 },
    mentoringSessions: { type: Number, default: 0 }
  },
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false }
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'github', 'linkedin']
  },
  providerId: String,
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
// Note: email index is created by unique:true, no need to add it again
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.skills': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ provider: 1, providerId: 1 });

// Virtual for full profile completion
UserSchema.virtual('profileCompleteness').get(function() {
  let completeness = 0;
  const totalFields = 10;
  
  if (this.name) completeness++;
  if (this.email) completeness++;
  if (this.avatar) completeness++;
  if (this.profile?.bio) completeness++;
  if (this.profile?.location) completeness++;
  if (this.profile?.skills && this.profile.skills.length > 0) completeness++;
  if (this.profile?.experience) completeness++;
  if (this.profile?.linkedin || this.profile?.github) completeness++;
  if (this.profile?.interests && this.profile.interests.length > 0) completeness++;
  if (this.verification?.email) completeness++;
  
  return Math.round((completeness / totalFields) * 100);
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);