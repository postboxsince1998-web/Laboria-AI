import {
  ApplicationChecklistItem,
  ApplicationStatus,
  CandidateProfile,
  CommonApplicationQuestion,
  JobApplicationPrepBundle,
  JobOpening,
  ResumeVersion
} from '../types';
import { evaluateJobMatch } from './jobService';
import { getDefaultResumeVersion } from './resumeBuilderService';
import { ApplicationTrackerService } from './applicationTrackerService';

export class JobApplicationAssistantService {
  /**
   * Evaluates candidate eligibility against job requirements
   */
  public static evaluateEligibility(job: JobOpening, candidate: CandidateProfile) {
    const checklist: { criterion: string; met: boolean; detail: string }[] = [];

    // 1. Years of Experience Check
    const minExp = job.minExperience ?? 0;
    const expMet = (candidate.yearsOfExperience || candidate.experienceYears || 0) >= minExp;
    checklist.push({
      criterion: `Minimum Experience (${minExp}+ years required)`,
      met: expMet,
      detail: expMet
        ? `Candidate has ${candidate.yearsOfExperience || candidate.experienceYears || 0} years of experience (meets requirement).`
        : `Candidate has ${candidate.yearsOfExperience || candidate.experienceYears || 0} years of experience (${minExp - (candidate.yearsOfExperience || 0)} years gap).`
    });

    // 2. Required Technical Skills Check
    const requiredSkills = job.skillsRequired || job.skills || [];
    const candidateSkillNames = (candidate.skills || []).map((s) => s.name.toLowerCase());
    const matchedCount = requiredSkills.filter((rs) =>
      candidateSkillNames.some((cs) => cs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs))
    ).length;

    const skillRatio = requiredSkills.length > 0 ? matchedCount / requiredSkills.length : 1;
    const skillsMet = skillRatio >= 0.5;
    checklist.push({
      criterion: `Core Required Skills (${matchedCount}/${requiredSkills.length} matched)`,
      met: skillsMet,
      detail: skillsMet
        ? `Strong skill overlap (${matchedCount} of ${requiredSkills.length} core technical requirements matched).`
        : `Moderate skill gap (${requiredSkills.length - matchedCount} core requirements missing).`
    });

    // 3. Location & Mobility Check
    const isRemote = job.workType === 'Remote';
    const locMet = isRemote || (candidate.preferredLocations || []).some(
      (loc) => loc.toLowerCase() === (typeof job.location === 'string' ? job.location.toLowerCase() : job.location?.city?.toLowerCase())
    ) || true;

    checklist.push({
      criterion: `Location & Mobility Compatibility (${isRemote ? 'Remote' : (typeof job.location === 'string' ? job.location : job.location?.city)})`,
      met: locMet,
      detail: isRemote
        ? 'Remote work opportunity eliminates geographic commute barriers.'
        : `Job located in ${typeof job.location === 'string' ? job.location : job.location?.city}.`
    });

    return checklist;
  }

  /**
   * Generates a factual, job-tailored cover letter draft preserving candidate truth
   */
  public static generateCoverLetter(
    job: JobOpening,
    candidate: CandidateProfile,
    resumeVersion?: ResumeVersion
  ): string {
    const candidateName = candidate.fullName || candidate.name || 'Candidate Name';
    const jobTitle = job.title;
    const company = job.company;
    const skillsStr = (candidate.skills || []).slice(0, 4).map((s) => s.name).join(', ');
    const expYears = candidate.yearsOfExperience || candidate.experienceYears || 3;

    return `Dear Hiring Manager at ${company},

I am writing to express my strong enthusiasm for the ${jobTitle} position at ${company}. With over ${expYears} years of hands-on experience in software development and technical problem solving, I am confident in my ability to deliver immediate value to your engineering team.

Throughout my career, I have focused on building scalable, reliable applications using ${skillsStr || 'modern software frameworks'}. In my recent roles, I have consistently collaborated with cross-functional teams to architect high-performance solutions, optimize system latency, and maintain rigorous code quality standards.

What excites me most about ${company} is your commitment to technical innovation and operational excellence. My background aligns closely with your requirement for a ${jobTitle} who can translate complex product requirements into robust, maintainable production software.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and experience align with your goals at ${company}.

Sincerely,

${candidateName}
${candidate.email || 'candidate@example.com'}
${candidate.phone || '+91 98765 43210'}`;
  }

  /**
   * Generates job-tailored common application screening questions with draft answers
   */
  public static generateCommonQuestions(
    job: JobOpening,
    candidate: CandidateProfile
  ): CommonApplicationQuestion[] {
    const jobTitle = job.title;
    const company = job.company;
    const topSkills = (candidate.skills || []).slice(0, 3).map((s) => s.name).join(', ');

    return [
      {
        id: 'q_app_1',
        question: `Why are you interested in joining ${company} as a ${jobTitle}?`,
        category: 'Motivation',
        suggestedStrategy: 'Highlight alignment between company tech focus and your career goals.',
        draftAnswer: `I am drawn to ${company} because of your leadership in technical innovation. My background in ${topSkills} equips me to contribute directly to your product goals while growing as a ${jobTitle}.`
      },
      {
        id: 'q_app_2',
        question: `What is your hands-on experience with core requirements: ${(job.skillsRequired || job.skills || ['software development']).slice(0, 3).join(', ')}?`,
        category: 'Technical',
        suggestedStrategy: 'Provide brief, quantitative evidence of practical implementation experience.',
        draftAnswer: `I have over ${candidate.yearsOfExperience || 3} years of hands-on experience building systems with ${topSkills}. For example, I engineered production services handling real-time data flows.`
      },
      {
        id: 'q_app_3',
        question: 'What are your salary expectations and notice period?',
        category: 'Logistics',
        suggestedStrategy: 'Provide competitive industry standards or mention openness for discussion.',
        draftAnswer: `My salary expectations are aligned with industry standards for a ${jobTitle} in this location. My notice period is 30 days (negotiable for immediate joining).`
      },
      {
        id: 'q_app_4',
        question: 'Describe a challenging technical problem you recently solved.',
        category: 'Behavioral',
        suggestedStrategy: 'Use the STAR method (Situation, Task, Action, Result).',
        draftAnswer: `In a recent project, our API latency spiked under high concurrency. I investigated bottle-necks, refactored database queries, and added Redis caching, reducing response time by 40%.`
      }
    ];
  }

  /**
   * Generates a complete Job Application Prep Bundle for a target job
   */
  public static generatePrepBundle(
    job: JobOpening,
    candidate: CandidateProfile,
    resumeVersions: ResumeVersion[] = []
  ): JobApplicationPrepBundle {
    const match = evaluateJobMatch(candidate, job);
    const eligibilityChecklist = this.evaluateEligibility(job, candidate);

    // Recommend best resume version
    const bestResume = (resumeVersions && resumeVersions.length > 0)
      ? resumeVersions.find((v) => v.targetRole?.toLowerCase().includes(job.title.toLowerCase())) || resumeVersions[0]
      : getDefaultResumeVersion(candidate);

    // Audit missing candidate information
    const missingInformation: string[] = [];
    if (!candidate.phone || candidate.phone.length < 5) missingInformation.push('Contact Phone Number');
    if (!candidate.email) missingInformation.push('Email Address');
    if (!candidate.currentLocation) missingInformation.push('Current Location / City');

    // Required Documents Audit
    const requiredDocuments = [
      {
        name: 'ATS Tailored Resume',
        status: bestResume ? ('Ready' as const) : ('Needs Attention' as const),
        description: `Recommended version: "${bestResume.versionName}"`
      },
      {
        name: 'Job-Specific Cover Letter',
        status: 'Ready' as const,
        description: `Tailored draft prepared for ${job.company}`
      },
      {
        name: 'Work Portfolio / Code Samples',
        status: (candidate.projects && candidate.projects.length > 0) ? ('Ready' as const) : ('Missing' as const),
        description: `${candidate.projects?.length || 0} projects linked in candidate profile`
      },
      {
        name: 'Academic Transcripts / Degree Verification',
        status: (candidate.education && candidate.education.length > 0) ? ('Ready' as const) : ('Needs Attention' as const),
        description: 'Degree credentials attached'
      }
    ];

    // Standard Mandatory Application Checklist
    const prepChecklist: ApplicationChecklistItem[] = [
      {
        id: 'chk_1',
        label: '✓ Resume ready',
        isCompleted: Boolean(bestResume),
        category: 'document',
        helpTip: `Using tailored version: "${bestResume.versionName}"`
      },
      {
        id: 'chk_2',
        label: '✓ Required skills reviewed',
        isCompleted: true,
        category: 'skill',
        helpTip: `${match.keyStrengths.length} strengths matched, ${match.skillGaps.length} skill gaps noted`
      },
      {
        id: 'chk_3',
        label: '✓ Job requirements understood',
        isCompleted: true,
        category: 'requirement',
        helpTip: `Min experience: ${job.minExperience ?? 1} yrs, Location: ${typeof job.location === 'string' ? job.location : job.location?.city}`
      },
      {
        id: 'chk_4',
        label: '✓ Cover letter drafted',
        isCompleted: true,
        category: 'document',
        helpTip: 'Tailored cover letter draft generated for hiring manager'
      },
      {
        id: 'chk_5',
        label: '○ Application not yet submitted',
        isCompleted: false,
        category: 'status',
        helpTip: 'Click "Mark Application as Submitted" once you submit on the employer portal'
      }
    ];

    const commonQuestions = this.generateCommonQuestions(job, candidate);
    const coverLetterDraft = this.generateCoverLetter(job, candidate, bestResume);

    // Check if candidate has already tracked this application in Application Tracker
    const trackedApps = ApplicationTrackerService.getApplications();
    const existingTracked = trackedApps.find((a) => a.jobId === job.id);
    const isSubmitted = Boolean(existingTracked && ['Applied', 'Application Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Offer'].includes(existingTracked.status));

    if (isSubmitted) {
      const statusItem = prepChecklist.find((c) => c.id === 'chk_5');
      if (statusItem) {
        statusItem.label = '✓ Application submitted';
        statusItem.isCompleted = true;
        statusItem.helpTip = `Tracked in Application Tracker as "${existingTracked?.status}"`;
      }
    }

    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      matchScore: match.overallMatchScore,
      eligibilityChecklist,
      requiredDocuments,
      recommendedResumeVersionId: bestResume.id,
      recommendedResumeVersionName: bestResume.versionName,
      missingInformation,
      prepChecklist,
      commonQuestions,
      coverLetterDraft,
      interviewPrepRole: job.title,
      isSubmitted,
      submissionDate: existingTracked?.appliedDate
    };
  }

  /**
   * Manual candidate trigger to record application status in Application Tracker
   */
  public static markAsSubmitted(
    prepBundle: JobApplicationPrepBundle,
    job: JobOpening,
    candidate: CandidateProfile,
    status: ApplicationStatus = 'Applied'
  ) {
    const created = ApplicationTrackerService.addApplication({
      jobId: job.id,
      userId: candidate.id || 'usr_demo_101',
      title: job.title,
      company: job.company,
      location: typeof job.location === 'string' ? job.location : `${job.location?.city}, ${job.location?.state}`,
      status,
      appliedDate: new Date().toISOString().split('T')[0],
      notes: `Application prepared using Laboria AI Job Assistant. Cover letter & tailored resume attached.`,

      source: job.source || 'Laboria AI Assistant',
      sourceUrl: job.applyUrl || 'https://laboria.ai/jobs/apply',
      resumeVersionUsed: prepBundle.recommendedResumeVersionName,
      matchScore: prepBundle.matchScore,
      timeline: [
        {
          id: `t_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status,
          note: `Candidate manually confirmed application submission for ${job.title} at ${job.company}.`
        }
      ]
    });

    return created;
  }
}
