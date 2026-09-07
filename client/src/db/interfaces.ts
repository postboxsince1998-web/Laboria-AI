import {
  UserEntity,
  ResumeEntity,
  SkillEntity,
  UserSkillEntity,
  JobEntity,
  JobMatchEntity,
  CareerEntity,
  ReadinessAssessmentEntity,
  InterviewSessionEntity,
  MentorConversationEntity,
  FutureSkillEntity
} from '../types/entities';

export interface IUserRepository {
  getById(id: string): Promise<UserEntity | null>;
  getByEmail(email: string): Promise<UserEntity | null>;
  create(user: Omit<UserEntity, 'id'>): Promise<UserEntity>;
  update(id: string, updates: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<boolean>;
}

export interface IResumeRepository {
  getByUserId(userId: string): Promise<ResumeEntity | null>;
  uploadOrUpdate(userId: string, fileName: string, extractedText: string): Promise<ResumeEntity>;
  delete(id: string): Promise<boolean>;
}

export interface ISkillRepository {
  getAll(): Promise<SkillEntity[]>;
  getByCategory(category: SkillEntity['category']): Promise<SkillEntity[]>;
  getById(id: string): Promise<SkillEntity | null>;
}

export interface IUserSkillRepository {
  getByUserId(userId: string): Promise<{ skill: SkillEntity; userSkill: UserSkillEntity }[]>;
  addOrUpdate(userSkill: UserSkillEntity): Promise<UserSkillEntity>;
  remove(userId: string, skillId: string): Promise<boolean>;
}

export interface IJobRepository {
  getAll(): Promise<JobEntity[]>;
  getById(id: string): Promise<JobEntity | null>;
  searchJobs(query: string, locationFilter?: string): Promise<JobEntity[]>;
  create(job: Omit<JobEntity, 'id'>): Promise<JobEntity>;
}

export interface IJobMatchRepository {
  getMatchesForUser(userId: string): Promise<JobMatchEntity[]>;
  calculateAndSaveMatch(userId: string, jobId: string): Promise<JobMatchEntity>;
}

export interface ICareerRepository {
  getAll(): Promise<CareerEntity[]>;
  getById(id: string): Promise<CareerEntity | null>;
}

export interface IReadinessRepository {
  getByUserId(userId: string): Promise<ReadinessAssessmentEntity | null>;
  updateAssessment(userId: string, assessment: Partial<ReadinessAssessmentEntity>): Promise<ReadinessAssessmentEntity>;
}

export interface IInterviewRepository {
  getSessionsForUser(userId: string): Promise<InterviewSessionEntity[]>;
  saveSession(session: Omit<InterviewSessionEntity, 'id' | 'createdAt'>): Promise<InterviewSessionEntity>;
}

export interface IMentorRepository {
  getConversation(userId: string): Promise<MentorConversationEntity | null>;
  addMessage(userId: string, sender: 'user' | 'mentor', text: string): Promise<MentorConversationEntity>;
}

export interface IFutureSkillRepository {
  getAll(): Promise<FutureSkillEntity[]>;
  getSurgingSkills(): Promise<FutureSkillEntity[]>;
}

export interface IDbContext {
  providerName: string;
  users: IUserRepository;
  resumes: IResumeRepository;
  skills: ISkillRepository;
  userSkills: IUserSkillRepository;
  jobs: IJobRepository;
  jobMatches: IJobMatchRepository;
  careers: ICareerRepository;
  readiness: IReadinessRepository;
  interviews: IInterviewRepository;
  mentor: IMentorRepository;
  futureSkills: IFutureSkillRepository;
}
