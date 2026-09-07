// Laboria AI Step 2 Data Models (12 Core Entities)

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  education?: string;
  degree?: string;
  specialization?: string;
  graduationYear?: number;
  experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  currentLocation?: string;
  latitude?: number;
  longitude?: number;
  preferredLocations: string[];
  preferredRadius: number; // in kilometers
  willingToRelocate: boolean;
  workPreference: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  targetRoles: string[];
  preferredIndustries?: string[];
  salaryExpectation?: { min: number; max: number; currency: string };
  createdAt: string;
  updatedAt: string;
}

export type InformationProvenance = 'resume' | 'user_input' | 'AI_recommendation' | 'assessment' | 'verified';

export interface ProvenanceField<T> {
  value: T;
  source: InformationProvenance;
  confirmedByUser: boolean;
}

export interface ParsedResumeProfile {
  education: ProvenanceField<string[]>;
  experience: ProvenanceField<{ company: string; role: string; duration: string; description: string }[]>;
  skills: ProvenanceField<string[]>;
  technicalSkills: ProvenanceField<string[]>;
  softSkills: ProvenanceField<string[]>;
  projects: ProvenanceField<{ name: string; description: string; techStack: string[] }[]>;
  certifications: ProvenanceField<string[]>;
  jobTitles: ProvenanceField<string[]>;
  industries: ProvenanceField<string[]>;
  achievements: ProvenanceField<string[]>;
  locations: ProvenanceField<string[]>;
  languages: ProvenanceField<string[]>;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt';
  extractedText: string;
  parsedProfile: ParsedResumeProfile;
  uploadedAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category:
    | 'Programming'
    | 'Data'
    | 'AI/ML'
    | 'Cloud'
    | 'Cybersecurity'
    | 'Web Development'
    | 'Database'
    | 'DevOps'
    | 'Design'
    | 'Business'
    | 'Communication'
    | 'Leadership'
    | 'Other';
  description: string;
}

export interface UserSkill {
  userId: string;
  skillId: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  evidence: string;
  source: InformationProvenance;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  industry: string;
  requiredSkills: string[];
  optionalSkills: string[];
  futureSkills: string[];
  typicalRoles: string[];
  careerPath: {
    step: number;
    title: string;
    duration: string;
    keySkillsToAcquire: string[];
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  educationRequirement: string;
  experienceRequired: { min: number; max: number };
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  workMode: 'onsite' | 'hybrid' | 'remote';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  source: string; // e.g. "DEMO DATA", "Employer Submission", "Permitted Feed"
  sourceUrl: string;
  postedDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobMatch {
  id: string;
  userId: string;
  jobId: string;
  profileMatchScore: number;  // 70% Primary
  locationScore: number;      // 15% Secondary
  experienceScore: number;    // 10%
  preferenceScore: number;    // 5%
  finalPriorityScore: number; // Weighted sum
  matchedSkills: string[];
  missingSkills: string[];
  positiveSuggestions: string[];
  improvementSuggestions: string[];
  recommendation: string;
  matchCategory: 'Strong Match' | 'Good Match' | 'Potential Match' | 'Low Match';
  distanceKm: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReadinessAssessment {
  id: string;
  userId: string;
  technicalScore: number;
  communicationScore: number;
  softSkillsScore: number;
  resumeScore: number;
  projectScore: number;
  interviewScore: number;
  careerAlignmentScore: number;
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobId: string;
  sessionType: 'Technical' | 'Behavioral' | 'System Design';
  questions: {
    id: string;
    question: string;
    contextHint: string;
    isPracticeQuestion: boolean; // Practice question label
  }[];
  answers: {
    questionId: string;
    userAnswer: string;
    timestamp: string;
  }[];
  evaluation: {
    strengths: string[];
    improvements: string[];
    score: number;
  };
  score: number;
  createdAt: string;
}

export interface MentorConversation {
  id: string;
  userId: string;
  messages: {
    id: string;
    sender: 'user' | 'mentor';
    text: string;
    timestamp: string;
  }[];
  context: {
    profileSummary: string;
    readinessScore: number;
    topMatch: string;
    criticalGaps: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FutureSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  currentDemandLevel: 'Surging' | 'High Demand' | 'Emerging' | 'Stable';
  futurePotential: number; // 1 to 100
  relatedCareers: string[];
  relatedSkills: string[];
  source: string; // "Empirical Market Feed" vs "AI Strategic Advice"
  lastUpdated: string;
}

export interface SkillGap {
  id: string;
  userId: string;
  targetCareerId?: string;
  targetJobId?: string;
  skillId: string;
  currentLevel?: string;
  requiredLevel: string;
  gapLevel: 'Critical' | 'Recommended' | 'Bonus';
  priority: number;
  recommendation: string;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  targetCareerId?: string;
  targetJobId?: string;
  title: string;
  description: string;
  stages: {
    stageNumber: number;
    title: string;
    duration: string;
    currentSkill?: string;
    missingSkill: string;
    learningActivity: string;
    practice: string;
    project: string;
    assessment: string;
    jobReadinessImpact: string;
  }[];
  progress: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
}
