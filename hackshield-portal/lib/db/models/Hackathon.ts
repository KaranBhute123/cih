import mongoose, { Document, Schema, Model } from 'mongoose';

export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonStatus = 'draft' | 'published' | 'active' | 'judging' | 'completed';
export type AIAssistanceLevel = 'strict' | 'moderate' | 'permissive';

export interface IPrize {
  place: string;
  amount: number;
  description?: string;
}

export interface IJudgingCriteria {
  name: string;
  weight: number;
  description?: string;
}

export interface ITeamMember {
  name: string;
  email: string;
  mobile: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth: Date;
  collegeName: string;
  universityName?: string;
  yearOfStudy: string;
  course?: string;
}

export interface IParticipant {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  registeredAt: Date;
  status: 'registered' | 'checked-in' | 'disqualified';
  teamId?: mongoose.Types.ObjectId;
  
  // Team Information
  teamName: string;
  teamSize: number;
  teamLeaderName: string;
  teamLeaderEmail: string;
  teamLeaderMobile: string;
  teamLeaderGender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  teamLeaderDOB: Date;
  teamLeaderCollege: string;
  teamLeaderUniversity?: string;
  teamLeaderYearOfStudy: string;
  teamLeaderCourse?: string;
  
  // Team Members
  teamMembers: ITeamMember[];
  
  // Additional Information
  projectIdea?: string;
  previousHackathonExperience?: string;
  specialRequirements?: string;
}

export interface IHackathon extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  tagline: string;
  description: string;
  longDescription?: string;
  theme: string;
  coverImage?: string;
  
  // Organization
  organization: mongoose.Types.ObjectId;
  organizationName: string;
  organizationLogo?: string;
  
  // Dates
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  
  // Duration in hours
  duration: number;
  
  // Mode & Location
  mode: HackathonMode;
  venue?: string;
  venueAddress?: string;
  geofenceRadius?: number;
  
  // Team settings
  minTeamSize: number;
  maxTeamSize: number;
  soloAllowed: boolean;
  
  // Technology
  allowedTechnologies: string[];
  prohibitedTechnologies?: string[];
  externalLibrariesAllowed: boolean;
  preBuiltCodeAllowed: boolean;
  aiAssistanceLevel: AIAssistanceLevel;
  
  // Prizes
  prizes: IPrize[];
  totalPrizePool: number;
  
  // Judging
  judgingCriteria: IJudgingCriteria[];
  judges: mongoose.Types.ObjectId[];
  
  // Status
  status: HackathonStatus;
  
  // Registration
  registeredTeams: mongoose.Types.ObjectId[];
  maxTeams?: number;
  maxParticipants?: number;
  participants?: IParticipant[];
  
  // Settings
  publicLeaderboard: boolean;
  enableNeuralFairness: boolean;
  enableBlockchain: boolean;
  enableGeolocation: boolean;
  enableIdentityCheck: boolean;
  enableScreenshotDetection: boolean;
  
  // Sponsors
  sponsors?: {
    name: string;
    logo: string;
    tier: 'gold' | 'silver' | 'bronze';
    website?: string;
  }[];
  
  // Rules
  rules?: string[];
  codeOfConduct?: string;
  
  // Analytics
  views: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const hackathonSchema = new Schema<IHackathon>(
  {
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    longDescription: String,
    theme: { type: String, required: true },
    coverImage: String,
    
    // Organization
    organization: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationName: { type: String, required: true },
    organizationLogo: String,
    
    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    
    duration: { type: Number, required: true, default: 24 },
    
    // Mode & Location
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
    venue: String,
    venueAddress: String,
    geofenceRadius: { type: Number, default: 500 },
    
    // Team settings
    minTeamSize: { type: Number, required: true, default: 1 },
    maxTeamSize: { type: Number, required: true, default: 4 },
    soloAllowed: { type: Boolean, default: true },
    
    // Technology
    allowedTechnologies: [String],
    prohibitedTechnologies: [String],
    externalLibrariesAllowed: { type: Boolean, default: true },
    preBuiltCodeAllowed: { type: Boolean, default: false },
    aiAssistanceLevel: { type: String, enum: ['strict', 'moderate', 'permissive'], default: 'moderate' },
    
    // Prizes
    prizes: [{
      place: String,
      amount: Number,
      description: String,
    }],
    totalPrizePool: { type: Number, default: 0 },
    
    // Judging
    judgingCriteria: [{
      name: String,
      weight: Number,
      description: String,
    }],
    judges: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'judging', 'completed'],
      default: 'draft',
    },
    
    // Registration
    registeredTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    maxTeams: Number,
    maxParticipants: Number,
    participants: [{
      userId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      avatar: String,
      registeredAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['registered', 'checked-in', 'disqualified'], default: 'registered' },
      teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
      
      // Team Formation Mode
      hasTeam: { type: Boolean, default: true },
      needSmartMatching: { type: Boolean, default: false },
      skills: [{ type: String }],
      preferredTeamSize: { type: Number },
      matchingStatus: { type: String, enum: ['pending', 'matched', 'not-needed'], default: 'not-needed' },
      matchedWith: [{ type: String }], // User IDs of matched teammates
      
      // Team Information
      teamName: { type: String },
      teamSize: { type: Number },
      teamLeaderName: { type: String },
      teamLeaderEmail: { type: String },
      teamLeaderMobile: { type: String },
      teamLeaderGender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
      teamLeaderDOB: { type: Date },
      teamLeaderCollege: { type: String },
      teamLeaderUniversity: { type: String },
      teamLeaderYearOfStudy: { type: String },
      teamLeaderCourse: { type: String },
      
      // Team Members
      teamMembers: [{
        name: { type: String },
        email: { type: String },
        mobile: { type: String },
        gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
        dateOfBirth: { type: Date },
        collegeName: { type: String },
        universityName: { type: String },
        yearOfStudy: { type: String },
        course: { type: String },
      }],
      
      // Additional Information
      projectIdea: { type: String },
      previousHackathonExperience: { type: String },
      specialRequirements: { type: String },
      
      // PPT Upload for Selection Round
      pptUrl: { type: String },
      pptUploadedAt: { type: Date },
      selectionRound1Status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      selectionRound1Feedback: { type: String },
      
      // IDE Access Credentials
      ideAccessId: { type: String },
      ideAccessPassword: { type: String },
      ideAccessGeneratedAt: { type: Date },
      ideSessionActive: { type: Boolean, default: false },
      ideLastActivity: { type: Date },
      ideSessionStarted: { type: Date },
      ideAttemptedLeave: { type: Number, default: 0 },
      ideDisqualified: { type: Boolean, default: false },
      ideDisqualifiedReason: { type: String },
    }],
    
    // Settings
    publicLeaderboard: { type: Boolean, default: true },
    enableNeuralFairness: { type: Boolean, default: true },
    enableBlockchain: { type: Boolean, default: false },
    enableGeolocation: { type: Boolean, default: false },
    enableIdentityCheck: { type: Boolean, default: false },
    enableScreenshotDetection: { type: Boolean, default: true },
    
    // Sponsors
    sponsors: [{
      name: String,
      logo: String,
      tier: { type: String, enum: ['gold', 'silver', 'bronze'] },
      website: String,
    }],
    
    // Rules
    rules: [String],
    codeOfConduct: String,
    
    // Analytics
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
hackathonSchema.index({ status: 1, startDate: 1 });
hackathonSchema.index({ organization: 1 });
hackathonSchema.index({ theme: 1 });

const Hackathon: Model<IHackathon> = mongoose.models.Hackathon || mongoose.model<IHackathon>('Hackathon', hackathonSchema);

export default Hackathon;
