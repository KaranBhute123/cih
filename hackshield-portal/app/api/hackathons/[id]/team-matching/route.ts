import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Hackathon from '@/lib/db/models/Hackathon';
import User from '@/lib/db/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// AI-powered team matching algorithm
function calculateCompatibility(user1Profile: any, user2Profile: any): number {
  let compatibilityScore = 0;
  
  // Skill complementarity (40% weight)
  const skillComplementarity = calculateSkillComplementarity(user1Profile.skills, user2Profile.skills);
  compatibilityScore += skillComplementarity * 0.4;
  
  // Experience level compatibility (20% weight)
  const experienceCompatibility = calculateExperienceCompatibility(user1Profile.experience, user2Profile.experience);
  compatibilityScore += experienceCompatibility * 0.2;
  
  // Communication style (20% weight)
  const communicationCompatibility = calculateCommunicationCompatibility(user1Profile, user2Profile);
  compatibilityScore += communicationCompatibility * 0.2;
  
  // Availability compatibility (20% weight)
  const availabilityCompatibility = user1Profile.availability === user2Profile.availability ? 1 : 0.5;
  compatibilityScore += availabilityCompatibility * 0.2;
  
  return Math.min(Math.round(compatibilityScore * 100), 100);
}

function calculateSkillComplementarity(skills1: string[], skills2: string[]): number {
  const skillCategories = {
    frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    backend: ['Node.js', 'Python', 'Java', 'Go', 'PHP', 'Ruby'],
    design: ['UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop'],
    mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    data: ['Machine Learning', 'AI', 'Data Science', 'Python'],
    devops: ['AWS', 'Docker', 'Kubernetes', 'DevOps']
  };
  
  const categories1 = new Set();
  const categories2 = new Set();
  
  skills1.forEach(skill => {
    Object.entries(skillCategories).forEach(([category, categorySkills]) => {
      if (categorySkills.includes(skill)) {
        categories1.add(category);
      }
    });
  });
  
  skills2.forEach(skill => {
    Object.entries(skillCategories).forEach(([category, categorySkills]) => {
      if (categorySkills.includes(skill)) {
        categories2.add(category);
      }
    });
  });
  
  // Perfect complementarity = different skill categories
  const overlap = new Set(Array.from(categories1).filter(x => categories2.has(x))).size;
  const total = new Set([...Array.from(categories1), ...Array.from(categories2)]).size;
  
  // Higher score for more diverse skill sets
  return total > 0 ? (total - overlap * 0.5) / total : 0;
}

function calculateExperienceCompatibility(exp1: string, exp2: string): number {
  const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  const level1 = levels[exp1 as keyof typeof levels];
  const level2 = levels[exp2 as keyof typeof levels];
  
  const diff = Math.abs(level1 - level2);
  
  // Best compatibility when levels are 0-1 apart
  if (diff <= 1) return 1;
  if (diff === 2) return 0.7;
  return 0.4; // Expert + Beginner can still work
}

function calculateCommunicationCompatibility(profile1: any, profile2: any): number {
  // Simple mock - in real implementation, would analyze past chat patterns, response times, etc.
  const styles = ['fast', 'thoughtful'];
  const style1 = styles[Math.floor(Math.random() * styles.length)];
  const style2 = styles[Math.floor(Math.random() * styles.length)];
  
  // Mixed styles can work well
  if (style1 === style2) return 0.8;
  return 0.9; // Diverse communication styles often complement each other
}

function findComplementarySkills(userSkills: string[], otherSkills: string[]): string[] {
  const complementary: any[] = [];
  const skillCategories = {
    frontend: ['React', 'Vue', 'Angular'],
    backend: ['Node.js', 'Python', 'Java'],
    design: ['UI/UX Design', 'Figma'],
    mobile: ['React Native', 'Flutter']
  };
  
  const userCategories = new Set();
  userSkills.forEach(skill => {
    Object.entries(skillCategories).forEach(([category, categorySkills]) => {
      if (categorySkills.includes(skill)) {
        userCategories.add(category);
      }
    });
  });
  
  otherSkills.forEach(skill => {
    Object.entries(skillCategories).forEach(([category, categorySkills]) => {
      if (categorySkills.includes(skill) && !userCategories.has(category)) {
        complementary.push(skill);
      }
    });
  });
  
  return complementary;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { profile, limit = 10 } = await request.json();
    const hackathonId = params.id;

    // Get hackathon and all participants looking for teams
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Get all participants looking for teams (excluding current user)
    const lookingForTeamParticipants = (hackathon.participants || []).filter(
      (p: any) => p.status === 'looking-for-team' && p.userId !== session.user.id
    );

    // Get user details for each participant
    const participantUserIds = lookingForTeamParticipants.map((p: any) => p.userId);
    const participantUsers = await User.find({ _id: { $in: participantUserIds } });

    // Create enhanced profiles with compatibility scores
    const matches = participantUsers.map(user => {
      const participant = lookingForTeamParticipants.find((p: any) => p.userId === user._id.toString());
      
      const candidateProfile = {
        skills: (participant as any)?.skills || user.skills || [],
        experience: (participant as any)?.experience || user.experience || 'intermediate',
        availability: (participant as any)?.availability || 'full-time',
        preferredRole: (participant as any)?.preferredRole || '',
        bio: (participant as any)?.bio || user.bio || ''
      };

      const compatibility = calculateCompatibility(profile, candidateProfile);
      const complementarySkills = findComplementarySkills(profile.skills, candidateProfile.skills);
      const sharedInterests = profile.skills.filter((skill: string) => candidateProfile.skills.includes(skill));

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        skills: candidateProfile.skills,
        experience: candidateProfile.experience,
        bio: candidateProfile.bio,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        hackathonsParticipated: user.hackathonsParticipated,
        hackathonsWon: user.hackathonsWon,
        reputation: user.reputation,
        preferredRole: candidateProfile.preferredRole,
        availability: candidateProfile.availability,
        location: user.location,
        timezone: user.timezone,
        compatibility,
        complementarySkills,
        sharedInterests,
        communicationStyle: Math.random() > 0.5 ? 'fast' : 'thoughtful', // Mock data
        pastProjects: [] // Would come from user's portfolio/GitHub
      };
    });

    // Sort by compatibility and limit results
    const sortedMatches = matches
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      matches: sortedMatches,
      totalCandidates: matches.length
    });

  } catch (error) {
    console.error('Team matching error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}