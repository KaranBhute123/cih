import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String
  },
  thumbnail: {
    type: String
  },
  demoVideo: {
    type: String
  },
  liveDemo: {
    type: String
  },
  githubRepo: {
    type: String
  },
  technologies: [{
    type: String,
    required: true
  }],
  domain: [{
    type: String,
    required: true,
    enum: [
      'HealthTech',
      'FinTech', 
      'EdTech',
      'CleanTech',
      'Social Impact',
      'Entertainment',
      'E-commerce',
      'AI/ML',
      'Blockchain',
      'IoT',
      'Gaming',
      'Productivity',
      'Communication',
      'Security',
      'Other'
    ]
  }],
  team: {
    name: {
      type: String,
      required: true
    },
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true
      },
      avatar: String,
      linkedin: String,
      github: String
    }],
    size: {
      type: Number,
      required: true
    }
  },
  hackathon: {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon'
    },
    name: {
      type: String,
      required: true
    },
    placement: String,
    date: {
      type: Date,
      required: true
    }
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  tractionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  codeQuality: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    linesOfCode: {
      type: Number,
      required: true
    },
    commits: {
      type: Number,
      required: true
    },
    testCoverage: {
      type: Number,
      min: 0,
      max: 100
    },
    securityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  blockchain: {
    verified: {
      type: Boolean,
      default: false
    },
    originalityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    aiDependency: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    proofHash: String,
    nftTokenId: String
  },
  seeking: [{
    type: String,
    enum: [
      'investment',
      'mentor', 
      'designer',
      'developer',
      'marketing',
      'legal',
      'business',
      'technical',
      'advisor'
    ]
  }],
  stage: {
    type: String,
    enum: ['concept', 'mvp', 'beta', 'production'],
    required: true
  },
  traction: {
    users: Number,
    revenue: Number,
    growth: String,
    partnerships: [String],
    awards: [String]
  },
  funding: {
    raised: Number,
    seeking: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    investors: [String]
  },
  contact: {
    email: String,
    website: String,
    social: {
      twitter: String,
      linkedin: String,
      discord: String
    }
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ domain: 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ stage: 1 });
ProjectSchema.index({ seeking: 1 });
ProjectSchema.index({ 'metrics.views': -1 });
ProjectSchema.index({ 'metrics.likes': -1 });
ProjectSchema.index({ 'codeQuality.score': -1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ featured: -1, createdAt: -1 });

// Middleware to calculate traction score
ProjectSchema.pre('save', function(next) {
  if (this.traction) {
    let tractionScore = 0;
    if (this.traction.users) tractionScore += Math.min(this.traction.users / 1000, 50);
    if (this.traction.revenue) tractionScore += Math.min(this.traction.revenue / 10000, 30);
    if (this.traction.partnerships) tractionScore += this.traction.partnerships.length * 5;
    if (this.traction.awards) tractionScore += this.traction.awards.length * 10;
    
    this.tractionScore = Math.min(tractionScore, 100);
  }
  next();
});

// Virtual for popularity score
ProjectSchema.virtual('popularityScore').get(function() {
  const viewsScore = Math.min((this.metrics?.views || 0) / 100, 30);
  const likesScore = Math.min((this.metrics?.likes || 0) * 2, 40);
  const bookmarksScore = Math.min((this.metrics?.bookmarks || 0) * 3, 30);
  
  return viewsScore + likesScore + bookmarksScore;
});

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);