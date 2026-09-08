import {
  EmployerUser,
  CompanyProfile,
  EmployerJobPost,
  CandidateApplicationSummary,
  InterviewScheduleRequest,
  EmployerRole,
  CandidateProfile
} from '../types';
import { seedJobs } from '../data/seedData';
import { AuthService } from './authService';

const EMPLOYER_USER_KEY = 'laboria_employer_user';
const COMPANY_PROFILE_KEY = 'laboria_employer_company';
const EMPLOYER_JOBS_KEY = 'laboria_employer_jobs';
const EMPLOYER_APPS_KEY = 'laboria_employer_applications';

export class SavedEmployerPortalService {
  public static getUser(): EmployerUser {
    try {
      const raw = localStorage.getItem(EMPLOYER_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaultUser: EmployerUser = {
      id: 'emp_usr_101',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@techpartner.ai',
      companyId: 'comp_101',
      role: 'Admin',
      designation: 'Director of Talent Acquisition',
      createdAt: '2026-01-10'
    };
    this.saveUser(defaultUser);
    return defaultUser;
  }

  public static saveUser(user: EmployerUser): void {
    try {
      localStorage.setItem(EMPLOYER_USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to save employer user:', err);
    }
  }

  public static getCompany(): CompanyProfile {
    try {
      const raw = localStorage.getItem(COMPANY_PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaultCompany: CompanyProfile = {
      id: 'comp_101',
      name: 'TechPartner Analytics & AI Solutions',
      logoUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=120&auto=format&fit=crop&q=80',
      website: 'https://techpartner.ai',
      industry: 'Enterprise Software & Artificial Intelligence',
      companySize: '250 - 500 Employees',
      headquarters: 'Bengaluru, Karnataka, India',
      description: 'TechPartner builds real-time telemetry processing pipelines, AI career matching platforms, and cloud microservice infrastructure for global enterprises.',
      benefits: [
        'Comprehensive Health & Dental Coverage',
        'Annual Professional Learning Stipend ($1,500)',
        'Flexible Hybrid Work Culture & Remote Allowances',
        'Competitive Equity Stock Options'
      ],
      techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Python']
    };
    this.saveCompany(defaultCompany);
    return defaultCompany;
  }

  public static saveCompany(company: CompanyProfile): void {
    try {
      localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(company));
    } catch (err) {
      console.warn('Failed to save company profile:', err);
    }
  }

  public static getJobs(): EmployerJobPost[] {
    try {
      const raw = localStorage.getItem(EMPLOYER_JOBS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const initialJobs: EmployerJobPost[] = seedJobs.map((j, idx) => ({
      id: j.id,
      companyId: 'comp_101',
      companyName: j.company || 'TechPartner Analytics',
      title: j.title,
      description: j.description || 'Join our fast-growing engineering team to build scalable real-time applications.',
      skills: j.skillsRequired || j.skills || ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
      niceToHaveSkills: ['AWS', 'Docker', 'GraphQL'],
      minExperience: j.minExperience ?? 2,
      maxExperience: j.maxExperience ?? 6,
      educationRequired: 'Bachelor of Technology (B.Tech) in CS/IT or equivalent',
      location: typeof j.location === 'string' ? j.location : String(j.location || ''),
      workMode: (j.workType as any) || 'Hybrid',
      employmentType: 'Full-time',
      salaryRange: j.salaryRange || { min: 1400000, max: 2200000, currency: 'INR' },
      benefits: [
        'Health Insurance',
        'Learning Stipend',
        'Flexible Hours',
        'Stock Options'
      ],
      applicationMethod: 'Laboria One-Click',
      status: idx === 3 ? 'Closed' : 'Active',
      postedDate: j.postedDate || '2026-08-25',
      applicantCount: 12 - idx * 2
    }));

    this.saveJobs(initialJobs);
    return initialJobs;
  }

  public static saveJobs(jobs: EmployerJobPost[]): void {
    try {
      localStorage.setItem(EMPLOYER_JOBS_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.warn('Failed to save employer jobs:', err);
    }
  }

  public static getApplications(): CandidateApplicationSummary[] {
    try {
      const raw = localStorage.getItem(EMPLOYER_APPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const initialApps: CandidateApplicationSummary[] = [
      {
        applicationId: 'app_emp_101',
        candidateId: 'cand_101',
        candidateName: 'Aarav Sharma',
        candidateHeadline: 'Senior Full Stack Engineer',
        maskedEmail: 'aarav.s*****@laboria.ai',
        maskedPhone: '+91 98*** **210',
        hasConsentedPrivacy: true,
        jobId: seedJobs[0].id,
        jobTitle: seedJobs[0].title,
        status: 'Under Review',
        appliedDate: '2026-09-01',
        profileMatchScore: 94,
        matchedSkills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
        missingSkills: ['AWS'],
        experienceYears: 4,
        resumeFileName: 'Aarav_Sharma_ATS_Resume.pdf'
      },
      {
        applicationId: 'app_emp_102',
        candidateId: 'cand_102',
        candidateName: 'Candidate #1029',
        candidateHeadline: 'Backend & Data Systems Developer',
        maskedEmail: 'p***.v*****@laboria.ai',
        maskedPhone: '+91 97*** **844',
        hasConsentedPrivacy: false,
        jobId: seedJobs[0].id,
        jobTitle: seedJobs[0].title,
        status: 'Shortlisted',
        appliedDate: '2026-09-02',
        profileMatchScore: 88,
        matchedSkills: ['Python', 'SQL', 'Node.js'],
        missingSkills: ['React', 'TypeScript'],
        experienceYears: 3,
        resumeFileName: 'Candidate_1029_Resume.pdf'
      },
      {
        applicationId: 'app_emp_103',
        candidateId: 'cand_103',
        candidateName: 'Priya Verma',
        candidateHeadline: 'Lead Analytics Engineer',
        maskedEmail: 'priya.v*****@laboria.ai',
        maskedPhone: '+91 99*** **112',
        hasConsentedPrivacy: true,
        jobId: seedJobs[1]?.id || seedJobs[0].id,
        jobTitle: seedJobs[1]?.title || seedJobs[0].title,
        status: 'Interview Scheduled',
        appliedDate: '2026-08-30',
        profileMatchScore: 91,
        matchedSkills: ['Python', 'SQL', 'Power BI', 'Excel'],
        missingSkills: [],
        experienceYears: 5,
        resumeFileName: 'Priya_Verma_Analytics_Resume.pdf',
        interviewDetails: {
          date: '2026-09-08',
          time: '14:00 IST',
          roundType: 'Technical Deep-Dive',
          meetingLink: 'https://meet.laboria.ai/techpartner-round2',
          interviewerName: 'Sarah Jenkins (Director of TA)'
        }
      }
    ];

    this.saveApplications(initialApps);
    return initialApps;
  }

  public static saveApplications(apps: CandidateApplicationSummary[]): void {
    try {
      localStorage.setItem(EMPLOYER_APPS_KEY, JSON.stringify(apps));
    } catch (err) {
      console.warn('Failed to save employer applications:', err);
    }
  }
}

export class EmployerPortalService {
  /**
   * Registers a new employer recruiter account
   */
  public static registerEmployer(
    name: string,
    email: string,
    companyName: string,
    role: EmployerRole = 'Admin',
    designation: string = 'Recruitment Manager'
  ): { user: EmployerUser; company: CompanyProfile } {
    const user: EmployerUser = {
      id: `emp_usr_${Date.now()}`,
      name,
      email,
      companyId: `comp_${Date.now()}`,
      role,
      designation,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const company: CompanyProfile = {
      id: user.companyId,
      name: companyName,
      website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      industry: 'Information Technology & Services',
      companySize: '50 - 200 Employees',
      headquarters: 'Bengaluru, India',
      description: `${companyName} is a technology firm specializing in digital solutions.`,
      benefits: ['Health Insurance', 'Flexible Work Options', 'Professional Development'],
      techStack: ['TypeScript', 'React', 'Node.js']
    };

    SavedEmployerPortalService.saveUser(user);
    SavedEmployerPortalService.saveCompany(company);

    return { user, company };
  }

  /**
   * Gets current active employer user
   */
  public static getCurrentUser(): EmployerUser {
    return SavedEmployerPortalService.getUser();
  }

  /**
   * Updates employer user role (RBAC switch)
   */
  public static updateUserRole(role: EmployerRole): EmployerUser {
    const user = SavedEmployerPortalService.getUser();
    user.role = role;
    SavedEmployerPortalService.saveUser(user);
    return user;
  }

  /**
   * Gets corporate company profile
   */
  public static getCompanyProfile(): CompanyProfile {
    return SavedEmployerPortalService.getCompany();
  }

  /**
   * Updates corporate company profile
   */
  public static updateCompanyProfile(profile: CompanyProfile): CompanyProfile {
    SavedEmployerPortalService.saveCompany(profile);
    return profile;
  }

  /**
   * Gets all job postings created by employer
   */
  public static getJobs(): EmployerJobPost[] {
    return SavedEmployerPortalService.getJobs();
  }

  /**
   * Posts a new job with all 11 required fields
   */
  public static postJob(job: Omit<EmployerJobPost, 'id' | 'companyId' | 'companyName' | 'postedDate' | 'applicantCount'>): EmployerJobPost {
    const company = SavedEmployerPortalService.getCompany();
    const newJob: EmployerJobPost = {
      ...job,
      id: `job_emp_${Date.now()}`,
      companyId: company.id,
      companyName: company.name,
      postedDate: new Date().toISOString().split('T')[0],
      applicantCount: 0
    };

    const jobs = SavedEmployerPortalService.getJobs();
    jobs.unshift(newJob);
    SavedEmployerPortalService.saveJobs(jobs);
    return newJob;
  }

  /**
   * Edits an existing job posting
   */
  public static editJob(jobId: string, updates: Partial<EmployerJobPost>): EmployerJobPost {
    const jobs = SavedEmployerPortalService.getJobs();
    const idx = jobs.findIndex((j) => j.id === jobId);
    if (idx === -1) throw new Error('Job posting not found');

    jobs[idx] = { ...jobs[idx], ...updates };
    SavedEmployerPortalService.saveJobs(jobs);
    return jobs[idx];
  }

  /**
   * Closes a job posting
   */
  public static closeJob(jobId: string): EmployerJobPost {
    return this.editJob(jobId, { status: 'Closed' });
  }

  /**
   * Mask candidate contact details unless consent is granted
   */
  public static maskCandidatePrivacy(
    candidate: { name: string; email: string; phone: string },
    hasConsented: boolean
  ): { displayName: string; maskedEmail: string; maskedPhone: string } {
    if (hasConsented) {
      return {
        displayName: candidate.name,
        maskedEmail: candidate.email,
        maskedPhone: candidate.phone
      };
    }

    const emailParts = candidate.email.split('@');
    const maskedEmail = `${emailParts[0].charAt(0)}***@${emailParts[1] || 'laboria.ai'}`;
    const maskedPhone = candidate.phone.replace(/\d(?=\d{4})/g, '*');

    return {
      displayName: `Candidate #${candidate.name.length * 117 + 1020}`,
      maskedEmail,
      maskedPhone
    };
  }

  /**
   * Candidate Search & Matching Engine (Profile/JD match 60% primary factor)
   */
  public static searchAndMatchCandidates(
    jobId: string,
    filters?: { minMatchScore?: number; skillFilter?: string; minExperience?: number }
  ): CandidateApplicationSummary[] {
    const apps = SavedEmployerPortalService.getApplications();
    const targetJob = SavedEmployerPortalService.getJobs().find((j) => j.id === jobId) || SavedEmployerPortalService.getJobs()[0];

    // Filter by Job ID or return all active candidate matches
    let matches = apps.filter((a) => a.jobId === targetJob.id || true);

    if (filters?.minMatchScore) {
      matches = matches.filter((m) => m.profileMatchScore >= filters.minMatchScore!);
    }
    if (filters?.skillFilter) {
      const sf = filters.skillFilter.toLowerCase();
      matches = matches.filter((m) => m.matchedSkills.some((s) => s.toLowerCase().includes(sf)));
    }
    if (filters?.minExperience) {
      matches = matches.filter((m) => m.experienceYears >= filters.minExperience!);
    }

    // Rank strictly by Profile/JD Match Score descending
    return matches.sort((a, b) => b.profileMatchScore - a.profileMatchScore);
  }

  /**
   * Shortlists a candidate application
   */
  public static shortlistCandidate(applicationId: string): CandidateApplicationSummary {
    const apps = SavedEmployerPortalService.getApplications();
    const idx = apps.findIndex((a) => a.applicationId === applicationId);
    if (idx === -1) throw new Error('Application not found');

    apps[idx].status = 'Shortlisted';
    SavedEmployerPortalService.saveApplications(apps);
    return apps[idx];
  }

  /**
   * Rejects a candidate application
   */
  public static rejectCandidate(applicationId: string, _reason?: string): CandidateApplicationSummary {
    const apps = SavedEmployerPortalService.getApplications();
    const idx = apps.findIndex((a) => a.applicationId === applicationId);
    if (idx === -1) throw new Error('Application not found');

    apps[idx].status = 'Rejected';
    SavedEmployerPortalService.saveApplications(apps);
    return apps[idx];
  }

  /**
   * Grants candidate privacy consent (unmasks contact info)
   */
  public static grantCandidateConsent(applicationId: string): CandidateApplicationSummary {
    const apps = SavedEmployerPortalService.getApplications();
    const idx = apps.findIndex((a) => a.applicationId === applicationId);
    if (idx === -1) throw new Error('Application not found');

    const active = AuthService.getCurrentProfile();
    apps[idx].hasConsentedPrivacy = true;
    apps[idx].candidateName = active?.fullName || 'Candidate Name';
    apps[idx].maskedEmail = active?.email || 'candidate@laboria.ai';
    apps[idx].maskedPhone = active?.phone || '+91 90000 00000';
    SavedEmployerPortalService.saveApplications(apps);
    return apps[idx];
  }

  /**
   * Schedules an interview for candidate application
   */
  public static scheduleInterview(req: InterviewScheduleRequest): CandidateApplicationSummary {
    const apps = SavedEmployerPortalService.getApplications();
    const idx = apps.findIndex((a) => a.applicationId === req.applicationId);
    if (idx === -1) throw new Error('Application not found');

    apps[idx].status = 'Interview Scheduled';
    apps[idx].interviewDetails = {
      date: req.date,
      time: req.time,
      roundType: req.roundType,
      meetingLink: req.meetingLink,
      interviewerName: req.interviewerName
    };

    SavedEmployerPortalService.saveApplications(apps);
    return apps[idx];
  }

  /**
   * Role-Based Access Control (RBAC) Permission Evaluator
   */
  public static evaluateRBACPermission(
    role: EmployerRole,
    action: 'POST_JOB' | 'EDIT_JOB' | 'CLOSE_JOB' | 'SHORTLIST' | 'REJECT' | 'SCHEDULE_INTERVIEW' | 'MANAGE_COMPANY'
  ): { permitted: boolean; reason?: string } {
    if (role === 'Admin') {
      return { permitted: true };
    }

    if (role === 'Recruiter') {
      if (action === 'MANAGE_COMPANY') {
        return { permitted: false, reason: 'Company profile management requires Admin role permissions.' };
      }
      return { permitted: true };
    }

    if (role === 'Hiring Manager') {
      if (['POST_JOB', 'EDIT_JOB', 'CLOSE_JOB', 'MANAGE_COMPANY'].includes(action)) {
        return {
          permitted: false,
          reason: `Action ${action} is restricted to Admin or Recruiter roles.`
        };
      }
      return { permitted: true };
    }

    return { permitted: false, reason: 'Unknown role or unauthorized action.' };
  }
}
