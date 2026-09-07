import {
  UserProfile,
  Resume,
  Skill,
  UserSkill,
  Career,
  Job,
  JobMatch,
  ReadinessAssessment,
  InterviewSession,
  MentorConversation,
  FutureSkill,
  SkillGap,
  LearningRoadmap
} from '../types/models';

export interface IUserProfileRepository {
  getById(id: string): Promise<UserProfile | null>;
  getByEmail(email: string): Promise<UserProfile | null>;
  create(profile: Partial<UserProfile>): Promise<UserProfile>;
  update(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<boolean>;
}

export interface IResumeParsingService {
  parseResumeFile(fileName: string, rawText: string): Promise<Resume>;
  extractEntities(rawText: string): Promise<Resume['parsedProfile']>;
}

export interface IResumeRepository {
  getByUserId(userId: string): Promise<Resume | null>;
  saveResume(resume: Resume): Promise<Resume>;
  delete(id: string): Promise<boolean>;
}

export interface ISkillRepository {
  getAll(): Promise<Skill[]>;
  getByCategory(category: Skill['category']): Promise<Skill[]>;
  getById(id: string): Promise<Skill | null>;
}

export interface IUserSkillRepository {
  getByUserId(userId: string): Promise<{ skill: Skill; userSkill: UserSkill }[]>;
  addOrUpdate(userSkill: UserSkill): Promise<UserSkill>;
  remove(userId: string, skillId: string): Promise<boolean>;
}

export interface ICareerRepository {
  getAll(): Promise<Career[]>;
  getById(id: string): Promise<Career | null>;
  addCareer(career: Omit<Career, 'id' | 'createdAt' | 'updatedAt'>): Promise<Career>;
}

export interface IJobDataIngestionProvider {
  providerName: string;
  fetchPermittedJobs(): Promise<Job[]>;
}

export interface IJobRepository {
  getAll(): Promise<Job[]>;
  getById(id: string): Promise<Job | null>;
  searchJobs(query: string, locationFilter?: string): Promise<Job[]>;
  create(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job>;
}

export interface IJobMatchRepository {
  getMatchesForUser(userId: string): Promise<JobMatch[]>;
  calculateMatch(userId: string, jobId: string): Promise<JobMatch>;
}

export interface IReadinessRepository {
  getByUserId(userId: string): Promise<ReadinessAssessment | null>;
  updateAssessment(userId: string, updates: Partial<ReadinessAssessment>): Promise<ReadinessAssessment>;
}

export interface IInterviewRepository {
  getSessionsForUser(userId: string): Promise<InterviewSession[]>;
  saveSession(session: Omit<InterviewSession, 'id' | 'createdAt'>): Promise<InterviewSession>;
}

export interface IMentorRepository {
  getConversation(userId: string): Promise<MentorConversation | null>;
  addMessage(userId: string, sender: 'user' | 'mentor', text: string): Promise<MentorConversation>;
}

export interface IFutureSkillRepository {
  getAll(): Promise<FutureSkill[]>;
  getSurgingSkills(): Promise<FutureSkill[]>;
}

export interface ISkillGapRepository {
  getByUser(userId: string): Promise<SkillGap[]>;
  calculateGap(userId: string, targetId: string): Promise<SkillGap[]>;
}

export interface ILearningRoadmapRepository {
  getByUser(userId: string): Promise<LearningRoadmap[]>;
  generateRoadmap(userId: string, targetId: string): Promise<LearningRoadmap>;
}

// Master DbContext interface unifying all 12 domain repositories
export interface IPlatformDbContext {
  providerName: string;
  userProfiles: IUserProfileRepository;
  resumes: IResumeRepository;
  skills: ISkillRepository;
  userSkills: IUserSkillRepository;
  careers: ICareerRepository;
  jobs: IJobRepository;
  jobMatches: IJobMatchRepository;
  readiness: IReadinessRepository;
  interviews: IInterviewRepository;
  mentor: IMentorRepository;
  futureSkills: IFutureSkillRepository;
  skillGaps: ISkillGapRepository;
  roadmaps: ILearningRoadmapRepository;
}
