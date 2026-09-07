export interface Location {
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface CandidateExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  skillsUsed: string[];
}

export interface CandidateEducation {
  degree: string;
  field: string;
  institution: string;
  year: number;
}

export interface CandidateProfile {
  id: string;
  name?: string;
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  yearsOfExperience: number;
  currentLocation: Location | any;
  preferredLocations: string[];
  preferredWorkType: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible' | string;
  targetRoles: string[];
  skills: {
    id?: string;
    name: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
    category?: string;
    proficiency?: string;
    yearsOfExperience?: number;
    verified?: boolean;
    source?: string;
  }[];
  education: CandidateEducation[] | any;
  experience: CandidateExperience[] | any;
  projects: { id?: string; title?: string; name: string; description: string; techStack: string[] }[];
  certifications: string[];
  resumeText: string;
  resumeFileName?: string;
  [key: string]: any;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: Location | any;
  workType?: 'Remote' | 'Hybrid' | 'On-site' | string;
  minExperience?: number;
  maxExperience?: number;
  skillsRequired?: string[];
  skills?: string[];
  niceToHaveSkills?: string[];
  description?: string;
  salaryRange?: { min: number; max: number; currency: string } | any;
  postedDate?: string;
  source?: string;
  applyUrl?: string;
  [key: string]: any;
}

export type JobPosting = JobOpening;

export interface MatchScoreBreakdown {
  profileMatch: number;      // Weight 60%
  locationMatch: number;     // Weight 20%
  experienceMatch: number;   // Weight 10%
  preferenceMatch: number;   // Weight 10%
}

export interface MatchResult {
  job: JobOpening;
  overallMatchScore: number;
  breakdown: MatchScoreBreakdown;
  distanceKm: number;
  keyStrengths: string[];
  skillGaps: string[];
  explanation: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  overallFitPercentage: number;
  matchedSkills: string[];
  missingSkills: { skill: string; priority: 'Critical' | 'Recommended' | 'Bonus'; learningResource: string }[];
  estimatedLearningHours: number;
}

export interface CareerMilestone {
  step: number;
  title: string;
  duration: string;
  keySkillsToAcquire: string[];
  description: string;
}

export interface CareerPath {
  id: string;
  currentRole: string;
  targetRole: string;
  readinessPercentage: number;
  salaryIncreaseEstimate: string;
  milestones: CareerMilestone[];
}

export interface CareerTransitionPlan {
  currentRole: string;
  targetRole: string;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: { skill: string; priority: 'Critical' | 'Recommended' | 'Bonus'; estimatedHours: number }[];
  estimatedTransitionMonths: number;
  milestones: { step: number; title: string; duration: string; skillsToAcquire: string[]; description: string }[];
  recommendedProjects: { name: string; description: string; targetSkills: string[] }[];
  matchingJobsCount: number;
  marketDemand: {
    demandIndex: number;
    growthRate: string;
    salaryRangeIndia: string;
    status: 'Surging' | 'High Demand' | 'Stable';
  };
  disclaimer: string;
}

export type LearningResourceType =
  | 'Free Course'
  | 'Official Documentation'
  | 'Free Tutorial'
  | 'Open Educational Resource'
  | 'User Created';

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  skillName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  isFree: boolean;
  costLabel: string;
  url: string;
  lastVerified: string;
  type: LearningResourceType;
}

export interface ProjectLearningItem {
  id: string;
  title: string;
  skillName: string;
  targetRole: string;
  description: string;
  deliverables: string[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Verified';
  linkedToPortfolio: boolean;
  linkedToResume: boolean;
  interviewPrepPayload?: any;
}

export interface UserLearningProgress {
  completedSkillsCount: number;
  inProgressSkillsCount: number;
  completedProjectsCount: number;
  totalHoursLogged: number;
  overallCompletionPercentage: number;
}

export interface TodayActionItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  actionPayload?: any;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface CareerHealthMetrics {
  overallHealthScore: number;
  jobReadinessScore: number;
  skillDevelopmentScore: number;
  jobSearchActivityScore: number;
  interviewPrepScore: number;
  careerAlignmentScore: number;
  healthBand: 'Excellent' | 'Strong' | 'Developing' | 'Needs Attention';
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export interface FutureSkillTrend {
  skill: string;
  category: 'Tech' | 'AI & Data' | 'Product & Business' | 'Domain Specific';
  growthRate: string;
  demandIndex: number; // 1-100
  topLocationsInIndia: string[];
  status: 'Surging' | 'High Demand' | 'Emerging' | 'Stable';
}

export interface InterviewQuestion {
  id: string;
  role: string;
  category: 'Technical' | 'Behavioral' | 'Problem Solving';
  question: string;
  contextHint: string;
  starGuide: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface SoftSkillFeedback {
  category: string;
  score: number; // 1-100
  toneAnalysis: string;
  strengths: string[];
  areasForImprovement: string[];
  actionableTip: string;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Saved'
  | 'Applied'
  | 'Application Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Closed';

export interface ApplicationTimelineEvent {
  id: string;
  timestamp: string;
  status: ApplicationStatus;
  note: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdated: string;
  notes: string;
  interviewDate?: string;
  nextAction?: string;
  source: string;
  sourceUrl?: string;
  resumeVersionUsed?: string;
  matchScore?: number;
  timeline: ApplicationTimelineEvent[];
}

export interface ApplicationStats {
  totalApplications: number;
  appliedThisMonth: number;
  interviewsCount: number;
  offersCount: number;
  responseRate: number; // strictly calculated: (Shortlisted + Interview Scheduled + Interview Completed + Offer) / Total Applied * 100
}

export interface AIApplicationInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  actionPayload?: any;
}

export type SearchSortOption = 'bestMatch' | 'scoreDesc' | 'distanceAsc' | 'dateDesc' | 'salaryDesc';

export interface AdvancedSearchFilters {
  minMatchScore: number;
  skills: string[];
  company: string;
  careerTarget: string;
  locationQuery: string;
  maxRadiusKm: number;
  workModes: string[]; // 'Remote', 'Hybrid', 'On-site'
  minExperience: number;
  maxExperience: number;
  employmentTypes: string[]; // 'Full-time', 'Contract', 'Part-time', 'Internship'
  postedWithinDays: number; // 0 = Any time, 1 = 24h, 7 = Past week, 30 = Past month
}

export interface SavedSearchQuery {
  id: string;
  name: string;
  searchQuery: string;
  filters: AdvancedSearchFilters;
  sortBy: SearchSortOption;
  createdAt: string;
  notifyJobWatch: boolean;
  matchCountAtSave?: number;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string; // or 'Present'
  description: string;
  bulletPoints: string[];
  skillsUsed: string[];
}

export interface ResumeEducationItem {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location?: string;
  year: number;
  gpa?: string;
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  bulletPoints: string[];
}

export interface ResumeVersion {
  id: string;
  versionName: string;
  targetRole?: string;
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  skills: { name: string; category?: string; level?: string }[];
  certifications: string[];
  lastUpdated: string;
  isDefault: boolean;
}

export interface ResumeAnalysisReport {
  overallScore: number; // 0 to 100
  atsCompatibilityScore: number; // 0 to 100
  sectionScores: {
    summary: number;
    experience: number;
    skills: number;
    education: number;
    projects: number;
  };
  strongSections: string[];
  weakSections: string[];
  missingKeywords: string[];
  actionVerbCount: number;
  metricCount: number;
  improvementSuggestions: string[];
  formattingChecklist: { checkName: string; passed: boolean; tip: string }[];
}

export interface JobTailoringAnalysis {
  jobId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  strongSections: string[];
  weakSections: string[];
  missingKeywords: string[];
  tailoredSummarySuggestions: string[];
  experienceImprovements: {
    experienceId: string;
    role: string;
    originalBullets: string[];
    suggestedBullets: string[];
    addedKeywords: string[];
  }[];
  projectImprovements: {
    projectId: string;
    title: string;
    originalDescription: string;
    suggestedDescription: string;
    highlightedSkills: string[];
  }[];
  skillSuggestions: string[];
}

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  category: 'document' | 'skill' | 'requirement' | 'status';
  helpTip: string;
}

export interface CommonApplicationQuestion {
  id: string;
  question: string;
  suggestedStrategy: string;
  draftAnswer: string;
  category: 'Motivation' | 'Technical' | 'Logistics' | 'Behavioral';
}

export interface JobApplicationPrepBundle {
  jobId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  eligibilityChecklist: { criterion: string; met: boolean; detail: string }[];
  requiredDocuments: { name: string; status: 'Ready' | 'Needs Attention' | 'Missing'; description: string }[];
  recommendedResumeVersionId: string;
  recommendedResumeVersionName: string;
  missingInformation: string[];
  prepChecklist: ApplicationChecklistItem[];
  commonQuestions: CommonApplicationQuestion[];
  coverLetterDraft: string;
  interviewPrepRole: string;
  isSubmitted: boolean;
  submissionDate?: string;
}

export type SimulatorRoundType =
  | 'Technical'
  | 'HR'
  | 'Behavioral'
  | 'Resume'
  | 'Situational'
  | 'Company-Specific'
  | 'Full Simulation';

export type SimulatorDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adaptive';

export interface InterviewSimulatorConfig {
  roundType: SimulatorRoundType;
  difficulty: SimulatorDifficulty;
  timeLimitSecondsPerQuestion: number; // e.g. 60, 120, 180, 0 = untimed
  jobId?: string;
  jobTitle: string;
  company: string;
}

export interface WeakTopicInsight {
  topic: string;
  category: string;
  frequencyCount: number;
  averageScore: number;
  recommendation: string;
  actionModulePath: string;
}

export interface FinalInterviewReadinessReport {
  sessionId: string;
  date: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  roundScores: { roundName: string; score: number }[];
  categoryScores: {
    technical: number;
    communication: number;
    structure: number;
    roleKnowledge: number;
    behavioral: number;
  };
  weakTopics: WeakTopicInsight[];
  personalizedPrepPlan: { timeframe: string; action: string; targetModule: string }[];
  questionsSummary: {
    questionText: string;
    roundName: string;
    score: number;
    referenceAnswer: string; // Strictly labeled "Reference Answer"
    candidateAnswer: string;
  }[];
  readinessStatus: 'Highly Interview Ready' | 'Nearly Ready' | 'Needs Focused Practice';
}

// Step 20: Skill & Project Portfolio Types
export type SkillEvidenceSourceType = 'Project' | 'Experience' | 'Certification' | 'Assessment' | 'Course';

export interface SkillEvidenceMapping {
  id: string;
  skillName: string;
  sourceType: SkillEvidenceSourceType;
  title: string;
  description: string;
  dateLinked: string;
  verificationStatus: 'Verified' | 'Self-Reported' | 'Assessed';
}

export interface PortfolioProject {
  id: string;
  title: string;
  problem: string;
  technologies: string[];
  role: string;
  process: string;
  outcome: string;
  learnings: string;
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export interface PortfolioAchievement {
  id: string;
  title: string;
  issuerOrOrg: string;
  date: string;
  description: string;
  category: 'Award' | 'Hackathon' | 'Publication' | 'Patent' | 'Certification';
}

export interface WorkSample {
  id: string;
  title: string;
  type: 'Code Snippet' | 'Architecture Diagram' | 'Case Study' | 'Live Demo' | 'Presentation';
  description: string;
  urlOrContent: string;
  tags: string[];
}

export interface CandidatePortfolio {
  candidateId: string;
  headline: string;
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: {
    name: string;
    level: string;
    evidenceCount: number;
    evidenceSources: SkillEvidenceSourceType[];
  }[];
  projects: PortfolioProject[];
  certifications: {
    id: string;
    title: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
  }[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  achievements: PortfolioAchievement[];
  workSamples: WorkSample[];
  evidenceScore: number;
  profileUnderstandingScore: number;
}

// Step 21: Employer and Recruiter Portal Types
export type EmployerRole = 'Admin' | 'Recruiter' | 'Hiring Manager';

export interface EmployerUser {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: EmployerRole;
  designation: string;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  website: string;
  industry: string;
  companySize: string;
  headquarters: string;
  description: string;
  benefits: string[];
  techStack: string[];
}

export interface EmployerJobPost {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  skills: string[];
  niceToHaveSkills?: string[];
  minExperience: number;
  maxExperience: number;
  educationRequired: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryRange?: { min: number; max: number; currency: string };
  benefits?: string[];
  applicationMethod: 'Laboria One-Click' | 'External URL' | 'Email Direct';
  externalApplyUrl?: string;
  status: 'Active' | 'Draft' | 'Closed' | 'Archived';
  postedDate: string;
  applicantCount: number;
}

export interface CandidateApplicationSummary {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  maskedEmail: string;
  maskedPhone: string;
  hasConsentedPrivacy: boolean;
  jobId: string;
  jobTitle: string;
  status: 'Under Review' | 'Shortlisted' | 'Contact Requested' | 'Interview Scheduled' | 'Interview Completed' | 'Offer' | 'Hired' | 'Rejected' | 'Withdrawn';
  appliedDate: string;
  profileMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceYears: number;
  resumeFileName?: string;
  interviewDetails?: {
    date: string;
    time: string;
    roundType: string;
    meetingLink: string;
    interviewerName: string;
  };
}

export interface InterviewScheduleRequest {
  applicationId: string;
  candidateId: string;
  jobId: string;
  roundType: string;
  date: string;
  time: string;
  meetingLink: string;
  interviewerName: string;
  notes?: string;
}

// Step 22: Two-Sided Candidate-Employer Matching Types
export type MatchingPerspective = 'Candidate' | 'Employer';

export interface MatchingDimensionalBreakdown {
  skillsScore: number;
  jdFitScore: number;
  experienceScore: number;
  readinessScore: number;
  portfolioScore: number;
  educationScore: number;
  workModeScore: number;
  locationScore: number;
  preferenceScore: number;
  careerPathScore: number;
}

export interface TwoSidedMatchResult {
  matchId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  overallMatchScore: number;
  breakdown: MatchingDimensionalBreakdown;
  whyMatched: string[];
  strengths: string[];
  potentialGaps: string[];
  isShortlisted: boolean;
  isSaved: boolean;
  isDismissed: boolean;
  connectionStatus: 'None' | 'Pending' | 'Accepted' | 'Declined';
  lastEvaluatedAt: string;
  nonDiscriminationComplianceFlag: boolean;
  hiringGuaranteeDisclaimer: string;
}

export interface ConnectionRequest {
  id: string;
  senderType: 'Employer' | 'Candidate';
  senderId: string;
  senderName: string;
  recipientId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  note: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
  respondedAt?: string;
}

export interface MatchingAuditLogEntry {
  id: string;
  timestamp: string;
  action: 'MATCH_CALCULATED' | 'SHORTLISTED' | 'SAVED' | 'DISMISSED' | 'CONNECTION_REQUESTED' | 'CONNECTION_ACCEPTED' | 'CONNECTION_DECLINED';
  actorId: string;
  actorType: 'Candidate' | 'Employer' | 'System';
  targetId: string;
  jobId?: string;
  matchScore?: number;
  details: string;
  complianceFlags: {
    nonDiscriminationVerified: boolean;
    protectedAttributesExcluded: boolean;
    privacyConsentEnforced: boolean;
  };
}

// Step 23: Job Trust and Safety System Types
export type ConcernTier = 'Low concern' | 'Needs review' | 'Potential concern' | 'High concern';

export type ReportCategory =
  | 'Suspicious'
  | 'Fake'
  | 'Duplicate'
  | 'Misleading'
  | 'Payment request'
  | 'Wrong information';

export interface SafetySignalFlag {
  signalType:
    | 'Missing Company Info'
    | 'Suspicious URL'
    | 'Unusual Contact Request'
    | 'Request for Money'
    | 'Request for Sensitive Info'
    | 'Duplicate Posting'
    | 'Inconsistent Details'
    | 'Unverified Employer';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  evidenceSnippet?: string;
}

export interface JobSafetyAnalysis {
  jobId: string;
  jobTitle: string;
  companyName: string;
  concernTier: ConcernTier;
  reasoningExplanation: string;
  signalsDetected: SafetySignalFlag[];
  overallTrustScore: number;
  evaluatedAt: string;
  fairEvidenceVerified: boolean;
}

export interface UserJobReport {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  reporterId: string;
  maskedReporterId: string;
  category: ReportCategory;
  description: string;
  evidenceTextOrUrl?: string;
  createdAt: string;
  status: 'Pending Review' | 'Investigating' | 'Resolved' | 'Dismissed';
}

// Steps 45-55: Final Launch Command Center Types
export type LaunchDecisionState = 
  | 'NOT_READY'
  | 'INTERNAL_TESTING'
  | 'CLOSED_BETA'
  | 'CONTROLLED_LAUNCH'
  | 'PUBLIC_LAUNCH_READY';

export interface SystemHealthMetric {
  category: 'Product' | 'Data' | 'AI' | 'Matching' | 'Security' | 'Performance' | 'UX' | 'Employer';
  status: 'PASSED' | 'WARNING' | 'FAILED';
  metricName: string;
  value: string | number;
  threshold: string;
  details: string;
}

export interface FinalLaunchState {
  decision: LaunchDecisionState;
  healthMetrics: SystemHealthMetric[];
  checklist: {
    dataCleaned: boolean;
    fakeDataRemoved: boolean;
    uxMaxThreeActions: boolean;
    misleadingClaimsRemoved: boolean;
    allTestsPassed: boolean;
  };
  lastEvaluated: string;
}


export interface ModerationCase {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  concernTier: ConcernTier;
  safetyAnalysis: JobSafetyAnalysis;
  reports: UserJobReport[];
  status: 'Under Review' | 'Escalated' | 'Approved' | 'Suspended' | 'Warning Issued';
  evidenceSnapshot: {
    jobDescription: string;
    detectedSignalsCount: number;
    userReportCount: number;
    snapshotDate: string;
  };
  moderatorNotes?: string;
  lastUpdated: string;
}

// Step 24: India Labor Market Intelligence Types
export interface DataAttribution {
  source: string;
  sourceUrl: string;
  observedDate: string;
  updatedDate: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Experimental';
}

export interface CareerTrendItem {
  id: string;
  title: string;
  category: string;
  trendType: 'Growing' | 'Declining';
  growthRatePercent: number;
  demandVolume: string;
  keyDrivers: string[];
  topLocations: string[];
  attribution: DataAttribution;
}

export interface SkillDemandItem {
  id: string;
  skillName: string;
  category: string;
  isEmerging: boolean;
  growthRatePercent: number;
  openPostingsCount: number;
  topAssociatedRoles: string[];
  demandLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
  attribution: DataAttribution;
}

export interface LocationTrendItem {
  id: string;
  city: string;
  state: string;
  tier: 'Tier 1' | 'Tier 2' | 'Emerging Tech Hub';
  topHiringSectors: string[];
  avgSalaryRangeINR: string;
  remoteSharePercent: number;
  growthYoYPercent: number;
  attribution: DataAttribution;
}

export interface RemoteOpportunityItem {
  id: string;
  roleCategory: string;
  remoteSharePercent: number;
  hybridSharePercent: number;
  onsiteSharePercent: number;
  topRemoteHiringSectors: string[];
  growthTrend: 'Expanding' | 'Stable' | 'Contracting';
  attribution: DataAttribution;
}

export interface ExperienceTrendItem {
  id: string;
  experienceLevel: 'Entry-Level (0-2 yrs)' | 'Mid-Level (3-6 yrs)' | 'Senior (7-10 yrs)' | 'Executive (10+ yrs)';
  hiringVolumeSharePercent: number;
  topDemandedSkills: string[];
  avgSalaryINR: string;
  trendDescription: string;
  attribution: DataAttribution;
}

export interface TransitionTrendItem {
  id: string;
  fromCareer: string;
  toCareer: string;
  transitionDifficulty: 'Easy' | 'Moderate' | 'Challenging';
  commonBridgeSkills: string[];
  successRatePercent: number;
  avgTransitionMonths: number;
  attribution: DataAttribution;
}

export interface MarketInsightQueryFilter {
  keyword?: string;
  location?: string;
  skill?: string;
  experienceYears?: number;
}

export interface ModuleConnectionPayloads {
  futureSkillsRadarPayload: {
    emergingSkills: string[];
    decliningSkills: string[];
    recommendedRadarFocus: string;
  };
  careerNavigatorPayload: {
    recommendedPath: string;
    marketGrowthFactor: string;
    transitionEase: string;
  };
  jobMatchingPayload: {
    highDemandTags: string[];
    hotLocations: string[];
    boostFactor: number;
  };
  aiMentorPayload: {
    insightSummary: string;
    recommendedActionItem: string;
  };
}

export interface MarketIntelligenceBundle {
  growingCareers: CareerTrendItem[];
  decliningCareers: CareerTrendItem[];
  emergingSkills: SkillDemandItem[];
  skillDemand: SkillDemandItem[];
  locationTrends: LocationTrendItem[];
  remoteOpportunities: RemoteOpportunityItem[];
  experienceTrends: ExperienceTrendItem[];
  careerTransitions: TransitionTrendItem[];
  queryFilterApplied?: MarketInsightQueryFilter;
  isSparseDataResult: boolean;
  sparseDataReason?: string;
  moduleConnections: ModuleConnectionPayloads;
  lastUpdatedDate: string;
}

// Step 25: Personal Career Operating System Types
export type ActionPriorityTier =
  | '1. Immediate Opportunities'
  | '2. Important Skill Gaps'
  | '3. Upcoming Interviews'
  | '4. Career Goals Alignment'
  | '5. Future Skills Radar'
  | '6. Long-Term Development';

export interface PrioritizedCareerAction {
  id: string;
  title: string;
  category: string;
  priorityTier: ActionPriorityTier;
  rationale: string;
  targetModuleRoute: string;
  actionButtonLabel: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface UnifiedCareerContext {
  candidateId: string;
  fullName: string;
  targetRole: string;
  experienceLevel: string;
  currentLocation: string;
  overallReadinessScore: number;

  // 14 Aggregated Context Dimensions
  profileSummary: { yoe: number; targetRoles: string[]; preferredMode: string };
  resumeSummary: { atsScore: number; fileName: string; topParsedSkillsCount: number };
  skillsSummary: { verifiedCount: number; topSkillNames: string[] };
  skillGapSummary: { topGapName: string; highPriorityGapsCount: number };
  learningSummary: { activeModulesCount: number; todayTask: string };
  readinessSummary: { score: number; employabilityLevel: string };
  careerGoalsSummary: { targetTitle: string; targetSalary: string; timeframe: string };
  jobMatchesSummary: { topMatchTitle: string; topMatchCompany: string; topMatchScore: number };
  applicationsSummary: { activeCount: number; latestStatus: string };
  interviewsSummary: { scheduledCount: number; nextInterviewRound?: string; nextInterviewDate?: string };
  projectsSummary: { totalProjects: number; featuredProjectTitle: string };
  futureSkillsSummary: { emergingSkillName: string; growthYoY: string };
  careerPathSummary: { currentStage: string; recommendedNextRole: string };
  marketIntelligenceSummary: { topGrowingRole: string; marketGrowthPercent: number };

  lastUnifiedTimestamp: string;
}

export interface DailyCareerPlanOS {
  date: string;
  focusHeadline: string;
  prioritizedActions: PrioritizedCareerAction[];
  estimatedTotalMinutes: number;
}

export interface WeeklyCareerReviewOS {
  weekRange: string;
  overallProgressScore: number;
  summaryMetrics: {
    progress: string;
    jobsMatched: number;
    applicationsActive: number;
    interviewsScheduled: number;
    learningHoursCompleted: number;
    skillsMasteredCount: number;
    readinessDelta: string;
  };
  keyMilestonesAchieved: string[];
  aiMentorStrategicAdvice: string;
}

// Step 27: Performance and Scalability Types
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  metadata: PaginationMetadata;
}

export interface PerformanceMetricsReport {
  avgQueryLatencyMs: number;
  aiCacheHitRatePercent: number;
  deduplicatedRequestCount: number;
  nPlusOnePreventedCount: number;
  memoryUsageEstimateMB: number;
  cachedEntriesCount: number;
  auditTimestamp: string;
}

export interface ScaleArchitectureTier {
  tierName: '10,000 Users (Startup)' | '100,000 Users (Scale-up)' | '1,000,000 Users (Enterprise)';
  userCapacity: number;
  estimatedMonthlyCostUSD: number;
  databaseStrategy: string;
  cachingStrategy: string;
  searchStrategy: string;
  aiProcessingStrategy: string;
  keyTechStack: string[];
}

// Step 28: Security and Privacy Audit Types
export type UserRole = 'Candidate' | 'Employer' | 'Admin' | 'Moderator';

export interface AccessControlCheckResult {
  allowed: boolean;
  reason: string;
  sanitizedData?: any;
}

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'AUTH_LOGIN'
    | 'ACCESS_GRANTED'
    | 'ACCESS_DENIED'
    | 'PII_MASKED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'INPUT_SANITIZED'
    | 'PATH_TRAVERSAL_BLOCKED'
    | 'FILE_UPLOAD_VALIDATED';
  actorId: string;
  actorRole: UserRole;
  resourceId?: string;
  ipAddress: string;
  actionStatus: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  sanitizedDetails: string;
}

export interface RateLimitStatus {
  key: string;
  requestsRemaining: number;
  resetInSeconds: number;
  isBlocked: boolean;
}

export interface SecurityComplianceReport {
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  piiProtectionScore: number;
  rbacEnforcementScore: number;
  rateLimitScore: number;
  auditLogIntegrityScore: number;
  unmaskedPIIExposuresCount: number;
  totalSecurityEventsLogged: number;
  lastAuditTimestamp: string;
}

// Step 29: Full Platform Testing Types
export type TestTypeCategory =
  | 'Unit'
  | 'Integration'
  | 'UI'
  | 'API'
  | 'Data Validation'
  | 'Permission'
  | 'Regression'
  | 'Responsive';

export interface FullPlatformTestResult {
  testId: string;
  moduleName: string;
  testType: TestTypeCategory;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'FIXED';
  details: string;
  executionTimeMs: number;
}

export interface FinalPlatformTestReport {
  totalTestsCount: number;
  passedCount: number;
  failedCount: number;
  fixedCount: number;
  knownLimitations: string[];
  suiteTimestamp: string;
  testResults: FullPlatformTestResult[];
}

// Step 30: Production Readiness and Launch Types
export interface ProductionAuditDimension {
  id: string;
  name: string;
  category: 'Core System' | 'User Experience' | 'Security & Compliance' | 'Reliability';
  status: 'VERIFIED';
  details: string;
}

export interface ProductionChecklistSection {
  title: string;
  description: string;
  items: { check: string; status: 'DONE'; mandatory: boolean }[];
}

export interface GracefulFallbackState {
  providerType: 'AI Provider (LLM)' | 'Job Data Provider' | 'Market Intelligence Feed';
  isOnline: boolean;
  activeFallbackStrategy: string;
  userImpact: string;
}

export interface RecommendedLaunchPhase {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  actions: string[];
  gateCriteria: string;
}

export interface ProductionLaunchStatusReport {
  readinessStatus: 'READY FOR LAUNCH';
  readinessPercentage: number;
  remainingBlockersCount: number;
  auditDimensions: ProductionAuditDimension[];
  checklists: ProductionChecklistSection[];
  fallbackStates: GracefulFallbackState[];
  launchPhases: RecommendedLaunchPhase[];
  knownLimitations: string[];
  lastAuditTimestamp: string;
}

// Step 31 Product Audit & Stabilization Types
export interface ProductAuditCategoryScore {
  category: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  verifiedCount: number;
  totalChecks: number;
  auditNotes: string;
}

export interface CandidateJourneyStep {
  stepNumber: number;
  stepName: string;
  route: string;
  status: 'VERIFIED';
  verifiedDataProp: string;
}

export interface MatchingBenchmarkCase {
  candidateId: string;
  candidateName: string;
  profileJdMatch: number;
  distanceKm: number;
  expectedRank: number;
  actualRank: number;
  passed: boolean;
}

export interface Step31AuditReport {
  overallProductStatus: 'STABLE & PRODUCTION READY';
  totalCategoriesAudited: number;
  scorecard: ProductAuditCategoryScore[];
  journeySteps: CandidateJourneyStep[];
  matchingBenchmark: MatchingBenchmarkCase[];
  criticalIssuesFoundCount: number;
  criticalIssuesFixedCount: number;
  remainingWarningsCount: number;
  aiProviderStatus: string;
  jobDataProviderStatus: string;
  securityStatus: string;
  mobileStatus: string;
  performanceStatus: string;
  lastAuditTimestamp: string;
}

// Step 33 Real AI Engine Service Types
export interface AIProviderConfigStatus {
  providerName: string;
  isConfigured: boolean;
  apiKeyMasked: string;
  modelName: string;
  environment: string;
  isFallbackActive: boolean;
}

export interface AICacheStats {
  cacheSize: number;
  hitCount: number;
  missCount: number;
  savedCallsCount: number;
  deduplicatedRequestsCount: number;
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  requestType: string;
  provider: string;
  latencyMs: number;
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  errorCategory?: string;
}

export interface Step33Report {
  status: 'REAL AI SERVICE LAYER READY';
  configStatus: AIProviderConfigStatus;
  cacheStats: AICacheStats;
  connectedFeaturesCount: number;
  recentLogs: AILogEntry[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 34 Real User Testing System Types
export interface UsabilityTask {
  taskId: string;
  taskName: string;
  category: string;
  completedCount: number;
  totalAttempts: number;
  completionRate: number;
  averageTimeSeconds: number;
}

export interface UsabilityFeedbackEntry {
  id: string;
  timestamp: string;
  candidateRole: string;
  isUseful: boolean;
  matchRelevanceRating: number; // 1-5
  explanationClarityRating: number; // 1-5
  confusingPointsText: string;
}

export interface UsabilityMetricSummary {
  totalTestSessions: number;
  averageTimeToFirstRelevantJobSeconds: number;
  resumeUploadCompletionPercentage: number;
  jobSearchCompletionPercentage: number;
  jobSaveRatePercentage: number;
  applicationTrackingRatePercentage: number;
  interviewCoachUsagePercentage: number;
  skillGapUsagePercentage: number;
  mentorUsagePercentage: number;
  dropOffPoints: { stepName: string; dropOffRatePercentage: number; frictionReason: string }[];
}

export interface Step34Report {
  status: 'USABILITY TESTING ENVIRONMENT ACTIVE';
  metrics: UsabilityMetricSummary;
  tasks: UsabilityTask[];
  recentFeedback: UsabilityFeedbackEntry[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 35 AI Job Matching Accuracy Engine Types
export interface SevenFactorMatchBreakdown {
  skillsScore: number;          // Overlap in required/preferred skills
  experienceScore: number;      // YOE & role level fit
  educationScore: number;       // Degree & field alignment
  responsibilitiesScore: number;// Core duty & project keyword match
  careerAlignmentScore: number; // Trajectory & target role fit
  preferencesScore: number;     // Work mode & employment type fit
  locationScore: number;        // Haversine distance score (secondary)
  overallMatchScore: number;    // Weighted combination (Profile primary)
}

export interface MatchExplanationPayload {
  jobId: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  breakdown: SevenFactorMatchBreakdown;
  strengthsExplanation: string;
  potentialGapsExplanation: string;
  locationExplanation: string;
  factualSummary: string;
}

export interface LabeledBenchmarkJob {
  id: string;
  title: string;
  company: string;
  location: string;
  expectedCategory: 'Excellent Match' | 'Good Match' | 'Moderate Match' | 'Weak Match' | 'Irrelevant Job';
  expectedMatchScore: number;
  actualMatchScore: number;
  expectedRank: number;
  actualRank: number;
  isCorrectlyRanked: boolean;
}

export interface MatchFeedbackEntry {
  id: string;
  timestamp: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  feedbackType: 'RELEVANT' | 'NOT_RELEVANT';
  userNote?: string;
  appliedFairnessGuard: boolean;
}

export interface Step35Report {
  status: 'AI MATCHING ACCURACY ENGINE ACTIVE';
  benchmarkDatasetSize: number;
  rankingPrecisionAt5Percentage: number;
  ndcgAccuracyPercentage: number;
  falsePositiveRatePercentage: number;
  falseNegativeRatePercentage: number;
  labeledJobs: LabeledBenchmarkJob[];
  feedbackList: MatchFeedbackEntry[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 36 Job Data Quality Engine Types
export type JobQualityState = 'VERIFIED' | 'NEEDS_REVIEW' | 'STALE' | 'EXPIRED' | 'INVALID' | 'DEMO_TEST';

export interface JobQualityAuditResult {
  jobId: string;
  jobTitle: string;
  company: string;
  qualityState: JobQualityState;
  isDuplicate: boolean;
  isStale: boolean;
  isExpired: boolean;
  isUrlValid: boolean;
  hasMissingInfo: boolean;
  normalizedCompany: string;
  normalizedLocation: string;
  normalizedSkills: string[];
  qualityIssues: string[];
}

export interface JobQualityMetrics {
  totalJobs: number;
  activeJobs: number;
  staleJobs: number;
  expiredJobs: number;
  duplicateJobs: number;
  invalidJobs: number;
  jobsNeedingReview: number;
  verifiedJobs: number;
  demoTestJobs: number;
}

export interface Step36Report {
  status: 'JOB DATA QUALITY ENGINE ACTIVE';
  metrics: JobQualityMetrics;
  auditResults: JobQualityAuditResult[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 37 Career User Experience Optimization Types
export interface UXJourneyStep {
  stepNumber: number;
  stepName: string;
  route: string;
  primaryCTA: string;
  description: string;
  '10SecondClarityScoreSeconds': number;
  status: 'OPTIMIZED';
}

export interface TerminologyMapping {
  technicalTerm: string;
  simplifiedTerm: string;
  category: string;
  userFacingLocation: string;
}

export interface UXClarityAuditResult {
  pageName: string;
  pageRoute: string;
  primaryActionLabel: string;
  hasSinglePrimaryCTA: boolean;
  '10SecondRuleMet': boolean;
  jargonFree: boolean;
  mobileTouchTargetCompliant: boolean;
}

export interface Step37Report {
  status: 'CAREER UX OPTIMIZATION COMPLETE';
  journeyCompletenessPercentage: number;
  averageNextActionTimeSeconds: number;
  singlePrimaryCTACompliancePercentage: number;
  mobileTouchCompliancePercentage: number;
  primaryJourneySteps: UXJourneyStep[];
  simplifiedDictionary: TerminologyMapping[];
  auditedPages: UXClarityAuditResult[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 38 Employer Pilot Readiness Types
export type CandidateConsentStatus = 'CONSENT_GRANTED' | 'CONSENT_PENDING' | 'CONSENT_RESTRICTED';

export type PilotApplicationStatus =
  | 'Under Review'
  | 'Shortlisted'
  | 'Contact Requested'
  | 'Interview Scheduled'
  | 'Hired'
  | 'Rejected';

export interface EmployerWorkflowStep {
  stepNumber: number;
  stepName: string;
  description: string;
  requiredAction: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
}

export interface EmployerAuditLogEntry {
  id: string;
  timestamp: string;
  employerId: string;
  employerName: string;
  actionType:
    | 'EMPLOYER_SIGNUP'
    | 'COMPANY_PROFILE_UPDATE'
    | 'JOB_POSTED'
    | 'VIEW_CANDIDATE_PROFILE'
    | 'GRANT_CONSENT_REQUEST'
    | 'SHORTLIST_CANDIDATE'
    | 'SCHEDULE_INTERVIEW'
    | 'UPDATE_OUTCOME';
  targetCandidateId?: string;
  targetJobId?: string;
  details: string;
  ipAddress: string;
}

export interface CandidateMatchExplanation {
  overallMatchScore: number;
  skillsMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFitText: string;
  locationFitText: string;
  explanationSummary: string;
}

export interface EmployerPilotMetrics {
  jobsPosted: number;
  candidatesViewed: number;
  candidatesShortlisted: number;
  interviewsInitiated: number;
  auditLogsCount: number;
}

export interface Step38Report {
  status: 'EMPLOYER PILOT READINESS COMPLETE';
  pilotMetrics: EmployerPilotMetrics;
  workflowSteps: EmployerWorkflowStep[];
  auditLogs: EmployerAuditLogEntry[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 39 Product Analytics Types
export type AnalyticsEventType =
  | 'user_signup'
  | 'resume_uploaded'
  | 'job_viewed'
  | 'job_saved'
  | 'job_dismissed'
  | 'job_applied'
  | 'interview_started'
  | 'skill_gap_viewed'
  | 'learning_started'
  | 'mentor_used'
  | 'job_watch_used'
  | 'employer_action';

export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  anonymousUserId: string;
  metadata?: Record<string, any>;
  hasPII: false;
}

export interface AnalyticsMetricSummary {
  timeframe: AnalyticsTimeframe;
  uniqueUsers: number;
  resumeUploads: number;
  jobsViewed: number;
  jobsSaved: number;
  jobsDismissed: number;
  applicationsTracked: number;
  interviewsPracticed: number;
  skillGapsAnalyzed: number;
  learningStarted: number;
  mentorUsage: number;
  jobWatchUsage: number;
  employerActivity: number;
}

export interface Step39Report {
  status: 'PRODUCT ANALYTICS COMPLETE';
  currentMetrics: AnalyticsMetricSummary;
  timeframeBreakdown: Record<AnalyticsTimeframe, AnalyticsMetricSummary>;
  recentEvents: AnalyticsEvent[];
  privacyAuditPassed: boolean;
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 40 Sustainable Business Model Architecture Types
export type PlanTier = 'Free' | 'Premium' | 'Employer' | 'Institution' | 'Admin';

export type EntitlementKey =
  | 'job_search_basic'
  | 'resume_upload_limit'
  | 'ai_interview_simulations'
  | 'mentor_questions'
  | 'active_job_posts'
  | 'candidate_pii_access'
  | 'cohort_analytics'
  | 'priority_application_assistant';

export interface Entitlement {
  key: EntitlementKey;
  name: string;
  allowedPlanTiers: PlanTier[];
  isUnlimited: boolean;
  defaultMaxLimit: number;
}

export interface UsageLimit {
  entitlementKey: EntitlementKey;
  currentUsage: number;
  maxLimit: number;
  unitName: string;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string;
  priceMonthlyINR: number;
  priceMonthlyUSD: number;
  billingCycle: 'Monthly' | 'Annual';
  features: string[];
  usageLimits: UsageLimit[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: PlanTier;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SANDBOX_DEMO';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
}

export interface RevenueModelAnalysis {
  id: string;
  modelName: string;
  category: 'Employer' | 'Candidate' | 'Institutional' | 'Partnership';
  targetAudience: string;
  pricingStructure: string;
  valueProposition: string;
  candidateImpact: 'Zero Degradation' | 'Enhanced Option';
  readinessStatus: 'ARCHITECTED' | 'PILOT_READY' | 'FUTURE_EXPANSION';
}

export interface PaymentProviderConfig {
  providerName: 'MockSandbox' | 'StripeReady' | 'RazorpayReady';
  isSandboxMode: true;
  apiEndpoint: string;
  supportsWebhooks: true;
  supportsRecurringBilling: true;
}

export interface Step40Report {
  status: 'SUSTAINABLE BUSINESS MODEL ARCHITECTURE COMPLETE';
  plans: Plan[];
  entitlements: Entitlement[];
  revenueModels: RevenueModelAnalysis[];
  paymentConfig: PaymentProviderConfig;
  candidateNonDegradationGuardPassed: boolean;
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 41 User Growth and Referral System Types
export type ReferralChannel =
  | 'candidate_referral'
  | 'institution_batch'
  | 'employer_team'
  | 'organic_direct'
  | 'campaign';

export interface CandidateReferralLink {
  id: string;
  userId: string;
  candidateName: string;
  referralCode: string;
  shareableUrl: string;
  clicksCount: number;
  conversionsCount: number;
  createdAt: string;
}

export interface InstitutionBatch {
  id: string;
  institutionName: string;
  batchName: string;
  department: string;
  graduationYear: number;
  invitedStudentsCount: number;
  activeStudentsCount: number;
  createdDate: string;
}

export interface EmployerRecruiterInvite {
  id: string;
  companyId: string;
  companyName: string;
  inviterName: string;
  invitedEmail: string;
  roleAssigned: EmployerRole;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  sentDate: string;
}

export interface AcquisitionChannelMetrics {
  channel: ReferralChannel;
  channelName: string;
  uniqueVisitors: number;
  signupsCount: number;
  conversionRatePercent: number;
  activeEngagedUsers: number;
}

export interface Step41Report {
  status: 'USER GROWTH AND REFERRAL SYSTEM COMPLETE';
  referralLinks: CandidateReferralLink[];
  institutionBatches: InstitutionBatch[];
  recruiterInvites: EmployerRecruiterInvite[];
  channelMetrics: AcquisitionChannelMetrics[];
  antiSpamGuardPassed: boolean;
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 42 Production Infrastructure Readiness Types
export type EnvironmentMode = 'development' | 'staging' | 'production';

export interface HealthCheckResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  environment: EnvironmentMode;
  version: string;
  services: {
    database: 'UP' | 'DOWN';
    aiServices: 'UP' | 'DOWN';
    jobProviders: 'UP' | 'DOWN';
    caching: 'UP' | 'DOWN';
    authService: 'UP' | 'DOWN';
  };
  systemMetrics: {
    uptimeSeconds: number;
    memoryUsageMB: number;
    activeConnections: number;
    backupStatus: 'CURRENT' | 'PENDING' | 'BEHIND';
  };
}

export interface DatabaseBackupSnapshot {
  id: string;
  timestamp: string;
  version: string;
  totalRecords: number;
  sizeKB: number;
  checksum: string;
  status: 'COMPLETED' | 'RESTORABLE' | 'FAILED';
}

export interface InfrastructureErrorLog {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'ERROR' | 'WARNING';
  component: string;
  message: string;
  stackTrace?: string;
  context?: Record<string, any>;
}

export interface ProviderStatus {
  name: string;
  category: 'AI Adapter' | 'Job Provider' | 'Database' | 'Auth' | 'Cache';
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  lastChecked: string;
}

export interface ProductionInfraChecklistItem {
  id: string;
  section: string;
  task: string;
  status: 'READY' | 'PENDING';
  isMandatory: boolean;
}

export interface Step42Report {
  status: 'PRODUCTION INFRASTRUCTURE READINESS COMPLETE';
  healthStatus: HealthCheckResponse;
  backups: DatabaseBackupSnapshot[];
  errorLogs: InfrastructureErrorLog[];
  providerStatuses: ProviderStatus[];
  checklist: ProductionInfraChecklistItem[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 43: Privacy, Security and Compliance Review Types
export type PrivacyVisibilityMode = 'PUBLIC' | 'EMPLOYERS_ONLY' | 'PRIVATE';

export type ConsentType =
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_POLICY'
  | 'AI_PROCESSING'
  | 'EMPLOYER_MATCHING'
  | 'ANALYTICS_COLLECTION';

export interface PrivacySettings {
  profileVisibility: PrivacyVisibilityMode;
  allowAnalytics: boolean;
  allowAiTraining: boolean;
  allowEmployerSearch: boolean;
  dataRetentionDays: number;
  lastUpdated: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  isGranted: boolean;
  version: string;
  timestamp: string;
  ipAddress: string;
}

export interface DataExportPackage {
  exportId: string;
  userId: string;
  generatedAt: string;
  candidateProfile: any;
  resumes: any[];
  applications: any[];
  interviews: any[];
  mentorQuestions: any[];
  privacySettings: PrivacySettings;
  consentHistory: ConsentRecord[];
  checksum: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestTimestamp: string;
  scope: 'FULL_ACCOUNT' | 'RESUME_ONLY' | 'ACTIVITY_LOGS';
  status: 'COMPLETED';
  auditComplianceHash: string;
}

export interface TenAreaPrivacyAuditItem {
  area: string;
  description: string;
  status: 'COMPLIANT' | 'MINIMIZED' | 'ENCRYPTED';
  notes: string;
}

export interface DPDPComplianceChecklistItem {
  id: string;
  section: string;
  principle: string;
  status: 'FRAMEWORK_READY';
  legalDisclaimerRequired: boolean;
}

export interface TransparencyExplanation {
  topic: string;
  question: string;
  answerText: string;
  userAction: string;
}

export interface Step43Report {
  status: 'PRIVACY, SECURITY AND COMPLIANCE REVIEW COMPLETE';
  privacyAudit: TenAreaPrivacyAuditItem[];
  dataMinimizationVerified: boolean;
  legalDisclaimerAcknowledged: boolean;
  dpdpChecklist: DPDPComplianceChecklistItem[];
  transparencyExplanations: TransparencyExplanation[];
  testResults: { name: string; passed: boolean; message: string }[];
}

// Step 44: Closed Beta Launch Types
export type BetaGroup = 'Candidate' | 'Employer' | 'Institution';

export type BetaOnboardingStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export type BetaIssueCategory = 'CRITICAL_BUG' | 'USER_CONFUSION' | 'POOR_JOB_MATCH' | 'BROKEN_WORKFLOW';

export type BetaIssuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BetaCohortMember {
  id: string;
  email: string;
  name: string;
  group: BetaGroup;
  status: BetaOnboardingStatus;
  joinedDate: string;
  cohortName: string;
}

export interface BetaIssueReport {
  id: string;
  category: BetaIssueCategory;
  priority: BetaIssuePriority;
  title: string;
  description: string;
  stepName: string;
  group: BetaGroup;
  reporterEmail: string;
  reportedAt: string;
  status: 'NEW' | 'TRIAGED' | 'RESOLVED';
}

export interface BetaUserFeedback {
  id: string;
  userId: string;
  group: BetaGroup;
  wasUseful: boolean;
  matchRelevanceRating: number; // 1-5
  explanationClarityRating: number; // 1-5
  confusingPoints: string;
  featureCategory: string;
  submittedAt: string;
}

export interface BetaSupportTicket {
  id: string;
  userId: string;
  group: BetaGroup;
  subject: string;
  message: string;
  response: string;
  status: 'OPEN' | 'RESOLVED';
  createdDate: string;
}

export interface BetaTelemetryMetrics {
  activeUsersCount: number;
  totalResumesProcessed: number;
  aiSuccessRatePercent: number;
  avgTimeToFirstJobSeconds: number;
  applicationsTrackedCount: number;
  employerShortlistCount: number;
  openCriticalBugsCount: number;
  userSatisfactionScore: number;
}

export interface BetaChecklistItem {
  id: string;
  section: string;
  task: string;
  status: 'READY' | 'PENDING';
  isMandatory: boolean;
}

export interface Step44Report {
  status: 'CLOSED BETA LAUNCH ENVIRONMENT ACTIVE';
  cohortMembers: BetaCohortMember[];
  issues: BetaIssueReport[];
  feedbackList: BetaUserFeedback[];
  supportTickets: BetaSupportTicket[];
  telemetry: BetaTelemetryMetrics;
  checklist: BetaChecklistItem[];
  testResults: { name: string; passed: boolean; message: string }[];
}








