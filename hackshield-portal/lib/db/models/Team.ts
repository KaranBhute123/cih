import mongoose, { Document, Schema, Model } from 'mongoose';

export type TeamStatus = 'forming' | 'registered' | 'active' | 'submitted' | 'disqualified';
export type MemberRole = 'leader' | 'member';

export interface ITeamMember {
  user: mongoose.Types.ObjectId;
  role: MemberRole;
  skills?: string[];
  joinedAt: Date;
  isOnline?: boolean;
  lastActive?: Date;
}

export interface ITeamProject {
  title?: string;
  description?: string;
  technologies?: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  hackathon: mongoose.Types.ObjectId;
  members: ITeamMember[];
  invitedEmails: string[];
  inviteCode: string;
  
  // Status
  status: TeamStatus;
  isLocked: boolean;
  
  // Project (nested object for API compatibility)
  project?: ITeamProject;
  
  // Legacy project fields (for backward compatibility)
  projectTitle?: string;
  projectDescription?: string;
  projectTechnologies?: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  
  // Submission
  submittedAt?: Date;
  submissionFiles?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // Code & Activity Tracking
  totalLinesOfCode: number;
  totalCommits: number;
  lastActivityAt?: Date;
  
  // Security & Fairness
  warningStrikes: number;
  aiUsagePercentage: number;
  codeQualityScore: number;
  originalityScore: number;
  
  // Security Violations
  violations: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
    memberId?: mongoose.Types.ObjectId;
  }[];
  
  // Judging
  scores: {
    judgeId: mongoose.Types.ObjectId;
    criteria: {
      name: string;
      score: number;
    }[];
    totalScore: number;
    feedback?: string;
    submittedAt: Date;
  }[];
  finalScore?: number;
  rank?: number;
  
  // Team Health
  teamHealthScore: number;
  
  // Chat
  chatHistory: {
    sender: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
    type: 'text' | 'code' | 'file' | 'system';
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Generate random invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    members: [{
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['leader', 'member'], default: 'member' },
      skills: [String],
      joinedAt: { type: Date, default: Date.now },
      isOnline: { type: Boolean, default: false },
      lastActive: Date,
    }],
    invitedEmails: [String],
    inviteCode: { type: String, unique: true, default: generateInviteCode },
    
    // Project as nested object
    project: {
      title: String,
      description: String,
      technologies: [String],
      repoUrl: String,
      demoUrl: String,
    },
    
    // Status
    status: {
      type: String,
      enum: ['forming', 'registered', 'active', 'submitted', 'disqualified'],
      default: 'forming',
    },
    isLocked: { type: Boolean, default: false },
    
    // Project
    projectTitle: String,
    projectDescription: String,
    projectTechnologies: [String],
    repositoryUrl: String,
    demoUrl: String,
    
    // Submission
    submittedAt: Date,
    submissionFiles: [{
      name: String,
      url: String,
      type: String,
    }],
    
    // Code & Activity
    totalLinesOfCode: { type: Number, default: 0 },
    totalCommits: { type: Number, default: 0 },
    lastActivityAt: Date,
    
    // Security & Fairness
    warningStrikes: { type: Number, default: 0 },
    aiUsagePercentage: { type: Number, default: 0 },
    codeQualityScore: { type: Number, default: 0 },
    originalityScore: { type: Number, default: 100 },
    
    // Violations
    violations: [{
      type: String,
      description: String,
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      timestamp: Date,
      memberId: Schema.Types.ObjectId,
    }],
    
    // Judging
    scores: [{
      judgeId: Schema.Types.ObjectId,
      criteria: [{
        name: String,
        score: Number,
      }],
      totalScore: Number,
      feedback: String,
      submittedAt: Date,
    }],
    finalScore: Number,
    rank: Number,
    
    // Team Health
    teamHealthScore: { type: Number, default: 100 },
    
    // Chat
    chatHistory: [{
      sender: Schema.Types.ObjectId,
      message: String,
      timestamp: { type: Date, default: Date.now },
      type: { type: String, enum: ['text', 'code', 'file', 'system'], default: 'text' },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
teamSchema.index({ hackathon: 1, status: 1 });
teamSchema.index({ 'members.user': 1 });

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

export default Team;
