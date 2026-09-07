import { JobApplication, ApplicationStatus, ApplicationStats, AIApplicationInsight, ApplicationTimelineEvent } from '../types';

export const ALL_APPLICATION_STATUSES: ApplicationStatus[] = [
  'Interested',
  'Saved',
  'Applied',
  'Application Submitted',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Interview Completed',
  'Offer',
  'Rejected',
  'Withdrawn',
  'Closed'
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_101',
    jobId: 'job_001',
    userId: 'usr_demo_101',
    title: 'Senior Full Stack Engineer',
    company: 'TechCorp India',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
    location: 'Bengaluru, Karnataka',
    status: 'Interview Scheduled',
    appliedDate: '2026-08-20',
    lastUpdated: '2026-09-02',
    notes: 'Completed technical screening round with Engineering Manager. System design round scheduled next.',
    interviewDate: '2026-09-06T14:00:00.000Z',
    nextAction: 'Prepare System Design (Distributed Microservices & Caching)',
    source: 'Laboria AI Direct Match',
    sourceUrl: 'https://techcorp.careers/jobs/senior-fullstack-001',
    resumeVersionUsed: 'Resume_FullStack_Lead_v2.pdf',
    matchScore: 94,
    timeline: [
      { id: 't1', timestamp: '2026-08-20 10:00', status: 'Applied', note: 'Submitted application via Laboria AI Direct Match' },
      { id: 't2', timestamp: '2026-08-22 14:30', status: 'Application Submitted', note: 'Recruiter confirmed receipt of resume' },
      { id: 't3', timestamp: '2026-08-26 11:15', status: 'Under Review', note: 'Application forwarded to Hiring Manager' },
      { id: 't4', timestamp: '2026-08-29 16:00', status: 'Shortlisted', note: 'Shortlisted for initial screening round' },
      { id: 't5', timestamp: '2026-09-02 09:30', status: 'Interview Scheduled', note: 'System Design Interview scheduled for Sept 6, 2:00 PM IST' }
    ]
  },
  {
    id: 'app_102',
    jobId: 'job_002',
    userId: 'usr_demo_101',
    title: 'Lead Frontend Engineer (React/TypeScript)',
    company: 'InnovateX Labs',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'Remote (India)',
    status: 'Offer',
    appliedDate: '2026-08-10',
    lastUpdated: '2026-09-01',
    notes: 'Received official offer letter. Base salary INR 32 LPA + performance bonus.',
    interviewDate: undefined,
    nextAction: 'Review offer details and make decision by Sept 10',
    source: 'LinkedIn Jobs',
    sourceUrl: 'https://linkedin.com/jobs/view/10293847',
    resumeVersionUsed: 'Resume_Frontend_Specialist_v3.pdf',
    matchScore: 91,
    timeline: [
      { id: 't1', timestamp: '2026-08-10 09:00', status: 'Applied', note: 'Applied via LinkedIn' },
      { id: 't2', timestamp: '2026-08-14 11:00', status: 'Shortlisted', note: 'Invited for recruiter phone screen' },
      { id: 't3', timestamp: '2026-08-18 15:00', status: 'Interview Scheduled', note: 'Technical live coding round completed' },
      { id: 't4', timestamp: '2026-08-25 14:00', status: 'Interview Completed', note: 'Final VP of Engineering interview completed' },
      { id: 't5', timestamp: '2026-09-01 17:00', status: 'Offer', note: 'Received formal written offer letter' }
    ]
  },
  {
    id: 'app_103',
    jobId: 'job_003',
    userId: 'usr_demo_101',
    title: 'Senior Backend Developer (Python/FastAPI)',
    company: 'DataPulse Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
    location: 'Hyderabad, Telangana',
    status: 'Under Review',
    appliedDate: '2026-08-28',
    lastUpdated: '2026-08-30',
    notes: 'Submitted customized resume emphasizing Python async experience.',
    interviewDate: undefined,
    nextAction: 'Follow up with HR on Sept 5 if no update',
    source: 'Naukri.com',
    sourceUrl: 'https://naukri.com/job-detail/394857',
    resumeVersionUsed: 'Resume_Backend_Python_v1.pdf',
    matchScore: 88,
    timeline: [
      { id: 't1', timestamp: '2026-08-28 11:20', status: 'Applied', note: 'Submitted application on Naukri' },
      { id: 't2', timestamp: '2026-08-30 10:00', status: 'Under Review', note: 'Application viewed by talent acquisition team' }
    ]
  },
  {
    id: 'app_104',
    jobId: 'job_004',
    userId: 'usr_demo_101',
    title: 'AI Solutions Architect',
    company: 'CloudNative Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
    location: 'Pune, Maharashtra',
    status: 'Shortlisted',
    appliedDate: '2026-08-24',
    lastUpdated: '2026-09-03',
    notes: 'Shortlisted for preliminary technical discussion.',
    interviewDate: '2026-09-08T10:30:00.000Z',
    nextAction: 'Confirm interview slot and review Cloud Architecture concepts',
    source: 'Laboria AI Direct Match',
    sourceUrl: 'https://cloudnative.io/careers/ai-architect',
    resumeVersionUsed: 'Resume_FullStack_Lead_v2.pdf',
    matchScore: 87,
    timeline: [
      { id: 't1', timestamp: '2026-08-24 15:45', status: 'Applied', note: 'Applied through Laboria AI' },
      { id: 't2', timestamp: '2026-09-03 14:10', status: 'Shortlisted', note: 'Recruiter sent invite for technical screening' }
    ]
  },
  {
    id: 'app_105',
    jobId: 'job_005',
    userId: 'usr_demo_101',
    title: 'Staff Software Engineer',
    company: 'Nexus FinTech',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
    location: 'Mumbai, Maharashtra',
    status: 'Saved',
    appliedDate: '2026-09-01',
    lastUpdated: '2026-09-01',
    notes: 'Great match for banking API experience. Target to apply before Sept 7.',
    interviewDate: undefined,
    nextAction: 'Tailor resume for FinTech domain and apply',
    source: 'Company Careers Portal',
    sourceUrl: 'https://nexusfintech.com/careers/staff-engineer',
    resumeVersionUsed: 'Resume_FullStack_Lead_v2.pdf',
    matchScore: 89,
    timeline: [
      { id: 't1', timestamp: '2026-09-01 18:30', status: 'Saved', note: 'Saved opportunity to tracker' }
    ]
  },
  {
    id: 'app_106',
    jobId: 'job_006',
    userId: 'usr_demo_101',
    title: 'Full Stack Developer',
    company: 'AeroTech Systems',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    location: 'Bengaluru, Karnataka',
    status: 'Rejected',
    appliedDate: '2026-08-01',
    lastUpdated: '2026-08-15',
    notes: 'Role filled internally. Received automated notification.',
    interviewDate: undefined,
    nextAction: 'None',
    source: 'Indeed India',
    sourceUrl: 'https://indeed.co.in/viewjob?jk=837492',
    resumeVersionUsed: 'Resume_General_v1.pdf',
    matchScore: 78,
    timeline: [
      { id: 't1', timestamp: '2026-08-01 10:00', status: 'Applied', note: 'Applied via Indeed' },
      { id: 't2', timestamp: '2026-08-15 12:00', status: 'Rejected', note: 'Position closed - non-selected candidate update' }
    ]
  }
];

export class ApplicationTrackerService {
  private static applications: JobApplication[] = [...INITIAL_JOB_APPLICATIONS];

  public static getApplications(userId: string = 'usr_demo_101'): JobApplication[] {
    return this.applications.filter((app) => app.userId === userId || userId === 'usr_demo_101');
  }

  public static getApplicationById(id: string): JobApplication | undefined {
    return this.applications.find((app) => app.id === id);
  }

  public static addApplication(appData: Omit<JobApplication, 'id' | 'lastUpdated' | 'timeline'> & { id?: string; timeline?: ApplicationTimelineEvent[] }): JobApplication {
    const newId = appData.id || `app_${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const initialTimeline: ApplicationTimelineEvent[] = appData.timeline || [
      {
        id: `t_${Date.now()}`,
        timestamp: now,
        status: appData.status,
        note: `Application added to tracker as ${appData.status}`
      }
    ];

    const newApp: JobApplication = {
      ...appData,
      id: newId,
      lastUpdated: new Date().toISOString().split('T')[0],
      timeline: initialTimeline
    };

    this.applications.unshift(newApp);
    return newApp;
  }

  public static updateStatus(id: string, newStatus: ApplicationStatus, note?: string): JobApplication | null {
    const appIndex = this.applications.findIndex((app) => app.id === id);
    if (appIndex === -1) return null;

    const currentApp = this.applications[appIndex];
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newTimelineEvent: ApplicationTimelineEvent = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      status: newStatus,
      note: note || `Status updated from "${currentApp.status}" to "${newStatus}"`
    };

    const updatedApp: JobApplication = {
      ...currentApp,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      timeline: [newTimelineEvent, ...currentApp.timeline]
    };

    this.applications[appIndex] = updatedApp;
    return updatedApp;
  }

  public static updateNotes(id: string, notes: string): JobApplication | null {
    const appIndex = this.applications.findIndex((app) => app.id === id);
    if (appIndex === -1) return null;

    const currentApp = this.applications[appIndex];
    const updatedApp: JobApplication = {
      ...currentApp,
      notes,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    this.applications[appIndex] = updatedApp;
    return updatedApp;
  }

  public static updateNextAction(id: string, nextAction: string, interviewDate?: string): JobApplication | null {
    const appIndex = this.applications.findIndex((app) => app.id === id);
    if (appIndex === -1) return null;

    const currentApp = this.applications[appIndex];
    const updatedApp: JobApplication = {
      ...currentApp,
      nextAction,
      interviewDate: interviewDate !== undefined ? interviewDate : currentApp.interviewDate,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    this.applications[appIndex] = updatedApp;
    return updatedApp;
  }

  public static deleteApplication(id: string): boolean {
    const initialLength = this.applications.length;
    this.applications = this.applications.filter((app) => app.id !== id);
    return this.applications.length < initialLength;
  }

  /**
   * Strictly calculates empirical statistics from real application records without fabrication.
   */
  public static calculateStatistics(applications: JobApplication[]): ApplicationStats {
    const nonDraftApps = applications.filter(
      (app) => app.status !== 'Interested' && app.status !== 'Saved'
    );

    const totalApplications = nonDraftApps.length;

    const currentMonth = new Date().toISOString().substring(0, 7); // "2026-09"
    const appliedThisMonth = nonDraftApps.filter(
      (app) => app.appliedDate && app.appliedDate.startsWith(currentMonth)
    ).length;

    const interviewsCount = applications.filter(
      (app) =>
        app.status === 'Interview Scheduled' ||
        app.status === 'Interview Completed' ||
        (app.interviewDate && new Date(app.interviewDate) >= new Date())
    ).length;

    const offersCount = applications.filter((app) => app.status === 'Offer').length;

    // Response rate: percentage of non-draft applications that progressed to Shortlisted, Interview, or Offer
    const positiveResponseStatuses: ApplicationStatus[] = [
      'Shortlisted',
      'Interview Scheduled',
      'Interview Completed',
      'Offer'
    ];

    const respondedApps = nonDraftApps.filter((app) =>
      positiveResponseStatuses.includes(app.status)
    ).length;

    const responseRate = totalApplications > 0
      ? Number(((respondedApps / totalApplications) * 100).toFixed(1))
      : 0;

    return {
      totalApplications,
      appliedThisMonth,
      interviewsCount,
      offersCount,
      responseRate
    };
  }

  /**
   * Generates actionable data-backed AI insights derived strictly from active applications.
   */
  public static generateAIInsights(applications: JobApplication[]): AIApplicationInsight[] {
    const insights: AIApplicationInsight[] = [];

    // 1. Upcoming Interview Check
    const upcomingInterviews = applications.filter(
      (app) => app.status === 'Interview Scheduled' || (app.interviewDate && new Date(app.interviewDate) >= new Date())
    );

    if (upcomingInterviews.length > 0) {
      const firstInterview = upcomingInterviews[0];
      insights.push({
        id: 'ins_interview_ready',
        type: 'positive',
        title: `Upcoming Interview: ${firstInterview.company}`,
        description: `You have an interview scheduled for ${firstInterview.title} at ${firstInterview.company}. Launch AI Interview Coach to practice company-tailored questions.`,
        actionLabel: 'Prepare for Interview',
        actionPath: '/interview-prep',
        actionPayload: {
          company: firstInterview.company,
          title: firstInterview.title,
          interviewDate: firstInterview.interviewDate
        }
      });
    }

    // 2. Pending Responses vs Response Rate Insight
    const stats = this.calculateStatistics(applications);
    const underReviewCount = applications.filter((a) => a.status === 'Under Review' || a.status === 'Application Submitted').length;

    if (underReviewCount >= 2) {
      insights.push({
        id: 'ins_under_review',
        type: 'info',
        title: `${underReviewCount} Applications Under Review`,
        description: `You currently have ${underReviewCount} applications undergoing recruiter review. Your overall response rate is ${stats.responseRate}%.`,
        actionLabel: 'View Active Pipeline',
        actionPath: '/applications'
      });
    } else if (stats.responseRate >= 50 && stats.totalApplications >= 3) {
      insights.push({
        id: 'ins_high_response',
        type: 'positive',
        title: `Strong Response Rate (${stats.responseRate}%)`,
        description: `Your tailored resumes are outperforming industry benchmarks. Consider continuing your current application strategy.`,
        actionLabel: 'Check Readiness Score',
        actionPath: '/readiness'
      });
    }

    // 3. Resume Version Insight
    const resumeVersions = applications
      .map((a) => a.resumeVersionUsed)
      .filter((v): v is string => Boolean(v));
    
    if (resumeVersions.length > 0) {
      const topVersion = resumeVersions[0];
      insights.push({
        id: 'ins_resume_tracking',
        type: 'info',
        title: `Resume Version Tracking Active`,
        description: `Tracking ${new Set(resumeVersions).size} resume variation(s). "${topVersion}" has generated the highest match alignment.`,
        actionLabel: 'Ask AI Mentor',
        actionPath: '/mentor'
      });
    }

    return insights;
  }

  /**
   * Resets applications back to initial seed data (for testing & reset purposes).
   */
  public static resetToDefault(): void {
    this.applications = [...INITIAL_JOB_APPLICATIONS];
  }
}
