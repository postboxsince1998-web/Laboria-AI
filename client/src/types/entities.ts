// Laboria AI Database Entity Schemas (11 Domain Entities)

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  degree: string;
  specialization: string;
  graduationYear: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  currentLocation: string;
  latitude: number;
  longitude: number;
  preferredLocations: string[];
  preferredRadius: number; // in kilometers
  willingToRelocate: boolean;
  workPreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  targetRoles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeEntity {
  id: string;
  userId: string;
  fileName: string;
  extractedText: string;
  parsedProfile: {
    skillsFound: string[];
    experienceYears: number;
    educationSummary: string;
    keyAchievements: string[];
  };
  uploadedAt: string;
  updatedAt: string;
}

export interface SkillEntity {
  id: string;
  name: string;
  category: 'Tech' | 'AI & Data' | 'Soft Skills' | 'Product & Business' | 'Domain';
}

export interface UserSkillEntity {
  userId: string;
  skillId: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  evidence: string; // e.g. "Built WebSockets flow builder handling 50k events/sec"
}

export interface JobEntity {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[]; // List of required skills/qualifications
  skillsRequired?: string[];
  location: string;
  latitude: number;
  longitude: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | string;
  experienceRequired: { min: number; max: number };
  source: string;
  sourceUrl: string;
  postedDate: string;
  expiryDate?: string;
  salaryRange?: { min: number; max: number; currency: string } | any;
  status?: string;
  skills?: string[];
  locationCoordinates?: { latitude: number; longitude: number };
  workType?: string;
  minExperience?: number;
  maxExperience?: number;
  profileMatchScore?: number;
}


export interface JobMatchEntity {
  userId: string;
  jobId: string;
  profileMatchScore: number;  // Primary 60%
  locationScore: number;      // Secondary 20%
  experienceScore: number;    // 10%
  preferenceScore: number;    // 10%
  finalPriorityScore: number; // Weighted composite
  matchedSkills: string[];
  missingSkills: string[];
  positiveSuggestions: string[];
  negativeSuggestions: string[];
  recommendation: string;
  createdAt: string;
}

export interface CareerEntity {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  futureSkills: string[];
  careerPath: {
    step: number;
    title: string;
    duration: string;
    keySkillsToAcquire: string[];
    description: string;
  }[];
}

export interface ReadinessAssessmentEntity {
  userId: string;
  technicalScore: number;
  communicationScore: number;
  softSkillsScore: number;
  resumeScore: number;
  projectScore: number;
  interviewScore: number;
  overallScore: number;
  recommendations: string[];
  updatedAt?: string;
}

export interface InterviewSessionEntity {
  id: string;
  userId: string;
  jobId: string;
  questions: {
    id: string;
    category: 'Technical' | 'Behavioral';
    question: string;
    contextHint: string;
  }[];
  answers: {
    questionId: string;
    userAnswer: string;
    timestamp: string;
  }[];
  evaluation: {
    strengths: string[];
    improvements: string[];
    starMethodAdherence: number; // 0 - 100
  };
  score: number;
  createdAt: string;
}

export interface MentorConversationEntity {
  id: string;
  userId: string;
  messages: {
    id: string;
    sender: 'user' | 'mentor';
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface FutureSkillEntity {
  name: string;
  category: 'Tech' | 'AI & Data' | 'Product & Business' | 'Domain Specific';
  demandLevel: 'High' | 'Surging' | 'Emerging' | 'Stable';
  futurePotential: number; // Score 1-100
  relatedCareers: string[];
}
