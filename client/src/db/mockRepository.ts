import {
  IPlatformDbContext,
  IUserProfileRepository,
  IResumeRepository,
  ISkillRepository,
  IUserSkillRepository,
  ICareerRepository,
  IJobRepository,
  IJobMatchRepository,
  IReadinessRepository,
  IInterviewRepository,
  IMentorRepository,
  IFutureSkillRepository,
  ISkillGapRepository,
  ILearningRoadmapRepository
} from './repositoryInterfaces';

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

import {
  demoCandidate,
  demoResume,
  demoSkills,
  demoUserSkills,
  demoCareers,
  demoJobs,
  demoJobMatches,
  demoReadinessAssessment,
  demoInterviewSessions,
  demoMentorConversations,
  demoFutureSkills,
  demoSkillGaps,
  demoLearningRoadmaps
} from '../data/demoData';

function calcDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export class PlatformMockRepository implements IPlatformDbContext {
  public providerName = 'Mock Local Service Provider (Zero-Cost MVP)';

  private profilesStore: UserProfile[] = [demoCandidate];
  private resumesStore: Resume[] = [demoResume];
  private skillsStore: Skill[] = [...demoSkills];
  private userSkillsStore: UserSkill[] = [...demoUserSkills];
  private careersStore: Career[] = [...demoCareers];
  private jobsStore: Job[] = [...demoJobs];
  private matchesStore: JobMatch[] = [...demoJobMatches];
  private readinessStore: ReadinessAssessment[] = [demoReadinessAssessment];
  private interviewsStore: InterviewSession[] = [...demoInterviewSessions];
  private mentorStore: MentorConversation[] = [...demoMentorConversations];
  private futureSkillsStore: FutureSkill[] = [...demoFutureSkills];
  private gapsStore: SkillGap[] = [...demoSkillGaps];
  private roadmapsStore: LearningRoadmap[] = [...demoLearningRoadmaps];

  // User Profile
  public userProfiles: IUserProfileRepository = {
    getById: async (id) => this.profilesStore.find((p) => p.id === id) || null,
    getByEmail: async (email) => this.profilesStore.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null,
    create: async (data) => {
      const newProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        name: data.name || 'New Candidate',
        email: data.email || 'user@example.com',
        phone: data.phone || '',
        preferredLocations: data.preferredLocations || [],
        preferredRadius: data.preferredRadius || 50,
        willingToRelocate: data.willingToRelocate ?? true,
        workPreference: data.workPreference || 'Hybrid',
        targetRoles: data.targetRoles || ['Full Stack Engineer'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      };
      this.profilesStore.push(newProfile);
      return newProfile;
    },
    update: async (id, updates) => {
      const idx = this.profilesStore.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Profile ${id} not found`);
      const updated = { ...this.profilesStore[idx], ...updates, updatedAt: new Date().toISOString() };
      this.profilesStore[idx] = updated;
      return updated;
    },
    delete: async (id) => {
      const len = this.profilesStore.length;
      this.profilesStore = this.profilesStore.filter((p) => p.id !== id);
      return this.profilesStore.length < len;
    }
  };

  // Resume
  public resumes: IResumeRepository = {
    getByUserId: async (userId) => this.resumesStore.find((r) => r.userId === userId) || null,
    saveResume: async (resume) => {
      const idx = this.resumesStore.findIndex((r) => r.userId === resume.userId);
      if (idx !== -1) this.resumesStore[idx] = resume;
      else this.resumesStore.push(resume);
      return resume;
    },
    delete: async (id) => {
      const len = this.resumesStore.length;
      this.resumesStore = this.resumesStore.filter((r) => r.id !== id);
      return this.resumesStore.length < len;
    }
  };

  // Skills
  public skills: ISkillRepository = {
    getAll: async () => [...this.skillsStore],
    getByCategory: async (category) => this.skillsStore.filter((s) => s.category === category),
    getById: async (id) => this.skillsStore.find((s) => s.id === id) || null
  };

  // User Skills
  public userSkills: IUserSkillRepository = {
    getByUserId: async (userId) => {
      const list = this.userSkillsStore.filter((us) => us.userId === userId);
      return list.map((us) => ({
        skill: this.skillsStore.find((s) => s.id === us.skillId) || { id: us.skillId, name: 'Custom', category: 'Programming', description: '' },
        userSkill: us
      }));
    },
    addOrUpdate: async (userSkill) => {
      const idx = this.userSkillsStore.findIndex((us) => us.userId === userSkill.userId && us.skillId === userSkill.skillId);
      if (idx !== -1) this.userSkillsStore[idx] = userSkill;
      else this.userSkillsStore.push(userSkill);
      return userSkill;
    },
    remove: async (userId, skillId) => {
      const len = this.userSkillsStore.length;
      this.userSkillsStore = this.userSkillsStore.filter((us) => !(us.userId === userId && us.skillId === skillId));
      return this.userSkillsStore.length < len;
    }
  };

  // Careers
  public careers: ICareerRepository = {
    getAll: async () => [...this.careersStore],
    getById: async (id) => this.careersStore.find((c) => c.id === id) || null,
    addCareer: async (cData) => {
      const newC: Career = { ...cData, id: `car_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.careersStore.push(newC);
      return newC;
    }
  };

  // Jobs (Primary Matching Rule: Profile 70% > Location 15%)
  public jobs: IJobRepository = {
    getAll: async () => [...this.jobsStore],
    getById: async (id) => this.jobsStore.find((j) => j.id === id) || null,
    searchJobs: async (query, locationFilter) => {
      let res = [...this.jobsStore];
      if (query) {
        const q = query.toLowerCase();
        res = res.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.requiredSkills.some((s) => s.toLowerCase().includes(q)));
      }
      if (locationFilter && locationFilter !== 'All') {
        res = res.filter((j) => j.city.toLowerCase() === locationFilter.toLowerCase() || j.workMode === 'remote');
      }
      return res;
    },
    create: async (jData) => {
      const newJob: Job = { ...jData, id: `job_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this.jobsStore.push(newJob);
      return newJob;
    }
  };

  // Job Matches (Profile Match 70% > Location 15% > Exp 10% > Pref 5%)
  public jobMatches: IJobMatchRepository = {
    getMatchesForUser: async (userId) => {
      const user = this.profilesStore.find((p) => p.id === userId);
      if (!user) return [];

      const uSkills = this.userSkillsStore.filter((us) => us.userId === userId);
      const uSkillNames = uSkills.map((us) => {
        const s = this.skillsStore.find((sk) => sk.id === us.skillId);
        return (s?.name || '').toLowerCase();
      });

      const results = this.jobsStore.map((job) => {
        const matchedSkills: string[] = [];
        const missingSkills: string[] = [];

        job.requiredSkills.forEach((reqSkill) => {
          if (uSkillNames.some((sk) => sk.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(sk))) {
            matchedSkills.push(reqSkill);
          } else {
            missingSkills.push(reqSkill);
          }
        });

        // 1. Profile Match Score (70% Primary)
        const ratio = job.requiredSkills.length > 0 ? matchedSkills.length / job.requiredSkills.length : 0.8;
        const profileMatchScore = Math.min(100, Math.round(ratio * 95));

        // 2. Location Score (15% Secondary)
        const distKm = calcDistance(user.latitude, user.longitude, job.latitude, job.longitude);
        const locationScore = job.workMode === 'remote' ? 100 : distKm !== null ? Math.max(30, Math.round(100 - distKm / 25)) : 50;

        // 3. Experience Score (10%)
        const experienceScore = 95;

        // 4. Preference Score (5%)
        const preferenceScore = job.workMode === 'remote' ? 100 : 85;

        // Weighted Final Priority
        const finalPriorityScore = Math.round(
          profileMatchScore * 0.70 + locationScore * 0.15 + experienceScore * 0.10 + preferenceScore * 0.05
        );

        let matchCategory: JobMatch['matchCategory'] = 'Low Match';
        if (profileMatchScore >= 85) matchCategory = 'Strong Match';
        else if (profileMatchScore >= 70) matchCategory = 'Good Match';
        else if (profileMatchScore >= 55) matchCategory = 'Potential Match';

        return {
          id: `match_${user.id}_${job.id}`,
          userId,
          jobId: job.id,
          profileMatchScore,
          locationScore,
          experienceScore,
          preferenceScore,
          finalPriorityScore,
          matchedSkills,
          missingSkills,
          positiveSuggestions: [`High profile match (${profileMatchScore}%). Matched ${matchedSkills.length} skills.`],
          improvementSuggestions: missingSkills.length > 0 ? [`Missing skills: ${missingSkills.join(', ')}`] : [],
          recommendation: profileMatchScore >= 85 ? 'Strong match. Consider preparing for interview.' : 'Good match.',
          matchCategory,
          distanceKm: distKm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      return results.sort((a, b) => b.profileMatchScore - a.profileMatchScore); // Primary sort by PROFILE MATCH
    },
    calculateMatch: async (userId, jobId) => {
      const matches = await this.jobMatches.getMatchesForUser(userId);
      const found = matches.find((m) => m.jobId === jobId);
      if (!found) throw new Error(`Match for ${jobId} not found`);
      return found;
    }
  };

  // Readiness Assessment
  public readiness: IReadinessRepository = {
    getByUserId: async (userId) => this.readinessStore.find((r) => r.userId === userId) || null,
    updateAssessment: async (userId, updates) => {
      const idx = this.readinessStore.findIndex((r) => r.userId === userId);
      const updated: ReadinessAssessment = {
        ...this.readinessStore[0],
        ...updates,
        userId,
        updatedAt: new Date().toISOString()
      };
      if (idx !== -1) this.readinessStore[idx] = updated;
      else this.readinessStore.push(updated);
      return updated;
    }
  };

  // Interview Sessions
  public interviews: IInterviewRepository = {
    getSessionsForUser: async (userId) => this.interviewsStore.filter((i) => i.userId === userId),
    saveSession: async (sessionData) => {
      const newS: InterviewSession = { ...sessionData, id: `int_${Date.now()}`, createdAt: new Date().toISOString() };
      this.interviewsStore.push(newS);
      return newS;
    }
  };

  // AI Mentor
  public mentor: IMentorRepository = {
    getConversation: async (userId) => this.mentorStore.find((m) => m.userId === userId) || null,
    addMessage: async (userId, sender, text) => {
      let conv = this.mentorStore.find((m) => m.userId === userId);
      const newMsg = { id: `msg_${Date.now()}`, sender, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      if (!conv) {
        conv = { id: `mc_${Date.now()}`, userId, messages: [newMsg], context: { profileSummary: 'Demo Candidate', readinessScore: 76, topMatch: 'Data Analyst', criticalGaps: ['Kafka'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        this.mentorStore.push(conv);
      } else {
        conv.messages.push(newMsg);
      }
      return conv;
    }
  };

  // Future Skills
  public futureSkills: IFutureSkillRepository = {
    getAll: async () => [...this.futureSkillsStore],
    getSurgingSkills: async () => this.futureSkillsStore.filter((fs) => fs.currentDemandLevel === 'Surging')
  };

  // Skill Gap
  public skillGaps: ISkillGapRepository = {
    getByUser: async (userId) => this.gapsStore.filter((g) => g.userId === userId),
    calculateGap: async (userId) => this.gapsStore.filter((g) => g.userId === userId)
  };

  // Learning Roadmap
  public roadmaps: ILearningRoadmapRepository = {
    getByUser: async (userId) => this.roadmapsStore.filter((r) => r.userId === userId),
    generateRoadmap: async (userId) => this.roadmapsStore[0]
  };
}
