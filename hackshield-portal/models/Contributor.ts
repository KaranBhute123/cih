import mongoose from 'mongoose';

const ContributorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['company', 'investor', 'mentor', 'freelancer', 'accelerator']
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String
  },
  bio: {
    type: String,
    required: true,
    maxLength: 500
  },
  expertise: [{
    type: String,
    required: true
  }],
  investmentRange: {
    type: String,
    required: function() {
      return this.type === 'investor' || this.type === 'company';
    }
  },
  location: {
    type: String
  },
  website: {
    type: String
  },
  linkedin: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  portfolio: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: String,
    link: String,
    technologies: [String],
    date: Date
  }],
  stats: {
    projectsSupported: {
      type: Number,
      default: 0
    },
    successfulProjects: {
      type: Number,
      default: 0
    },
    totalInvestment: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    responseTime: {
      type: String,
      default: '< 24h'
    },
    activeProjects: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    domains: [{
      type: String,
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
    stages: [{
      type: String,
      enum: ['concept', 'mvp', 'beta', 'production']
    }],
    teamSizes: {
      min: Number,
      max: Number
    },
    investmentRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    hoursPerWeek: Number,
    timezone: String,
    nextAvailable: Date
  },
  pricing: {
    hourlyRate: Number,
    projectRate: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  social: {
    twitter: String,
    github: String,
    behance: String,
    dribbble: String
  },
  languages: [String],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],
  interests: [String],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    type: {
      type: String,
      enum: ['award', 'recognition', 'milestone', 'certification']
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ContributorSchema.index({ name: 'text', bio: 'text', title: 'text' });
ContributorSchema.index({ type: 1 });
ContributorSchema.index({ expertise: 1 });
ContributorSchema.index({ location: 1 });
ContributorSchema.index({ verified: 1 });
ContributorSchema.index({ rating: -1, reviewCount: -1 });
ContributorSchema.index({ 'stats.projectsSupported': -1 });
ContributorSchema.index({ createdAt: -1 });
ContributorSchema.index({ featured: -1, createdAt: -1 });
ContributorSchema.index({ 'availability.status': 1 });

// Virtual for profile completeness
ContributorSchema.virtual('profileCompleteness').get(function() {
  let completeness = 0;
  const totalFields = 15;
  
  if (this.name) completeness++;
  if (this.avatar) completeness++;
  if (this.bio) completeness++;
  if (this.title) completeness++;
  if (this.expertise && this.expertise.length > 0) completeness++;
  if (this.location) completeness++;
  if (this.website) completeness++;
  if (this.linkedin) completeness++;
  if (this.portfolio && this.portfolio.length > 0) completeness++;
  if (this.preferences?.domains && this.preferences.domains.length > 0) completeness++;
  if (this.availability?.timezone) completeness++;
  if (this.languages && this.languages.length > 0) completeness++;
  if (this.interests && this.interests.length > 0) completeness++;
  if (this.pricing?.hourlyRate || this.pricing?.projectRate) completeness++;
  if (this.social?.github || this.social?.twitter) completeness++;
  
  return Math.round((completeness / totalFields) * 100);
});

// Virtual for reputation score
ContributorSchema.virtual('reputationScore').get(function() {
  let score = 0;
  
  // Rating component (40%)
  score += (this.rating / 5) * 40;
  
  // Experience component (30%)
  const projectsScore = Math.min((this.stats?.projectsSupported || 0) / 10, 1) * 30;
  score += projectsScore;
  
  // Success rate component (20%)
  score += ((this.stats?.successRate || 0) / 100) * 20;
  
  // Verification component (10%)
  if (this.verified) score += 10;
  
  return Math.round(score);
});

// Middleware to update stats
ContributorSchema.pre('save', function(next) {
  // Calculate success rate if we have project data
  if ((this.stats?.projectsSupported || 0) > 0 && (this.stats?.successfulProjects || 0)) {
    this.stats!.successRate = ((this.stats?.successfulProjects || 0) / (this.stats?.projectsSupported || 1)) * 100;
  }
  next();
});

ContributorSchema.set('toJSON', { virtuals: true });
ContributorSchema.set('toObject', { virtuals: true });

export default mongoose.models.Contributor || mongoose.model('Contributor', ContributorSchema);