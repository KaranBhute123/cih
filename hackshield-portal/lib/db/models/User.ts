import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Types
export type UserRole = 'participant' | 'organization' | 'contributor';
export type ContributorType = 'company' | 'investor' | 'mentor' | 'freelancer' | 'accelerator';

// User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  github?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  timezone?: string;
  
  // Organization specific
  orgName?: string;
  orgType?: 'university' | 'company' | 'nonprofit' | 'community';
  orgLogo?: string;
  orgWebsite?: string;
  verified?: boolean;
  
  // Contributor specific
  contributorType?: ContributorType;
  companyName?: string;
  investmentRange?: string;
  industriesOfInterest?: string[];
  
  // Gamification
  xp: number;
  level: number;
  badges: string[];
  reputation: number;
  
  // Stats
  hackathonsParticipated: number;
  hackathonsWon: number;
  projectsCreated: number;
  
  // Settings
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    push: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['participant', 'organization', 'contributor'],
      required: true,
    },
    avatar: String,
    phone: String,
    bio: String,
    skills: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    github: String,
    linkedin: String,
    portfolio: String,
    location: String,
    timezone: String,
    
    // Organization fields
    orgName: String,
    orgType: {
      type: String,
      enum: ['university', 'company', 'nonprofit', 'community'],
    },
    orgLogo: String,
    orgWebsite: String,
    verified: { type: Boolean, default: false },
    
    // Contributor fields
    contributorType: {
      type: String,
      enum: ['company', 'investor', 'mentor', 'freelancer', 'accelerator'],
    },
    companyName: String,
    investmentRange: String,
    industriesOfInterest: [String],
    
    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [String],
    reputation: { type: Number, default: 0 },
    
    // Stats
    hackathonsParticipated: { type: Number, default: 0 },
    hackathonsWon: { type: Number, default: 0 },
    projectsCreated: { type: Number, default: 0 },
    
    // Settings
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
userSchema.pre('save', function (next) {
  if (this.xp < 100) this.level = 1;
  else if (this.xp < 500) this.level = 2;
  else if (this.xp < 1500) this.level = 3;
  else if (this.xp < 5000) this.level = 4;
  else this.level = 5;
  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
