import mongoose, { Document, Schema, Model } from 'mongoose';

export type ProjectStatus = 'draft' | 'submitted' | 'published' | 'featured';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  hackathon: mongoose.Types.ObjectId;
  
  // Basic Info
  title: string;
  tagline: string;
  description: string;
  longDescription?: string;
  
  // Media
  thumbnail?: string;
  screenshots: string[];
  demoVideo?: string;
  
  // Links
  demoUrl?: string;
  repositoryUrl?: string;
  
  // Technology
  technologies: string[];
  domain: string[];
  
  // Team seeking
  seeking: string[];
  openToInvestors: boolean;
  openToMentorship: boolean;
  openToCollaboration: boolean;
  
  // Code Stats
  linesOfCode: number;
  codeQualityScore: number;
  testCoverage?: number;
  securityScore?: number;
  
  // Blockchain
  blockchainCertificateId?: string;
  
  // Status & Visibility
  status: ProjectStatus;
  isPublic: boolean;
  
  // Placement
  placement?: number;
  specialAwards?: string[];
  
  // Analytics
  views: number;
  likes: number;
  bookmarks: number;
  
  // Inquiries from contributors
  inquiries: {
    contributor: mongoose.Types.ObjectId;
    type: 'invest' | 'mentor' | 'hire' | 'collaborate';
    message: string;
    offer?: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    hackathon: { type: Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    
    // Basic Info
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true },
    longDescription: String,
    
    // Media
    thumbnail: String,
    screenshots: [String],
    demoVideo: String,
    
    // Links
    demoUrl: String,
    repositoryUrl: String,
    
    // Technology
    technologies: [String],
    domain: [String],
    
    // Team seeking
    seeking: [String],
    openToInvestors: { type: Boolean, default: false },
    openToMentorship: { type: Boolean, default: false },
    openToCollaboration: { type: Boolean, default: false },
    
    // Code Stats
    linesOfCode: { type: Number, default: 0 },
    codeQualityScore: { type: Number, default: 0 },
    testCoverage: Number,
    securityScore: Number,
    
    // Blockchain
    blockchainCertificateId: String,
    
    // Status & Visibility
    status: {
      type: String,
      enum: ['draft', 'submitted', 'published', 'featured'],
      default: 'draft',
    },
    isPublic: { type: Boolean, default: false },
    
    // Placement
    placement: Number,
    specialAwards: [String],
    
    // Analytics
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    
    // Inquiries
    inquiries: [{
      contributor: { type: Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['invest', 'mentor', 'hire', 'collaborate'] },
      message: String,
      offer: String,
      status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ status: 1, isPublic: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ domain: 1 });
projectSchema.index({ hackathon: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project;
