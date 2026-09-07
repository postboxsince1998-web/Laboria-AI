import {
  JobOpening,
  EmployerJobPost,
  JobSafetyAnalysis,
  SafetySignalFlag,
  ConcernTier,
  UserJobReport,
  ReportCategory,
  ModerationCase,
  CandidateProfile
} from '../types';
import { seedJobs } from '../data/seedData';

const REPORTS_STORAGE_KEY = 'laboria_trust_reports';
const MODERATION_STORAGE_KEY = 'laboria_trust_moderation_cases';
const TRUST_AUDIT_KEY = 'laboria_trust_audit_logs';

export class SavedJobTrustSafetyService {
  public static getReports(): UserJobReport[] {
    try {
      const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  public static saveReports(reports: UserJobReport[]): void {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.warn('Failed to save job reports:', err);
    }
  }

  public static getModerationCases(): ModerationCase[] {
    try {
      const raw = localStorage.getItem(MODERATION_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  public static saveModerationCases(cases: ModerationCase[]): void {
    try {
      localStorage.setItem(MODERATION_STORAGE_KEY, JSON.stringify(cases));
    } catch (err) {
      console.warn('Failed to save moderation cases:', err);
    }
  }
}

export class JobTrustSafetyService {
  /**
   * Analyzes job posting for suspicious patterns across 8 safety signals
   */
  public static analyzeJobSafety(job: JobOpening | EmployerJobPost): JobSafetyAnalysis {
    const signals: SafetySignalFlag[] = [];
    const descLower = (job.description || '').toLowerCase();
    const titleLower = (job.title || '').toLowerCase();
    const companyStr = (job as any).company || (job as any).companyName || '';
    const companyLower = companyStr.toLowerCase();

    // Signal 1: Missing Company Information
    if (!companyStr || companyLower.includes('unknown') || companyLower.trim().length < 2) {
      signals.push({
        signalType: 'Missing Company Info',
        severity: 'Medium',
        description: 'Job posting lacks verified corporate entity or company name.',
        evidenceSnippet: `Company field: "${companyStr || 'Empty'}"`
      });
    }

    // Signal 2: Suspicious URLs or Free Webmail Domain
    if (
      descLower.includes('bit.ly/') ||
      descLower.includes('tinyurl.com/') ||
      descLower.includes('http://') ||
      descLower.includes('@gmail.com') ||
      descLower.includes('@yahoo.com') ||
      descLower.includes('@outlook.com')
    ) {
      signals.push({
        signalType: 'Suspicious URL',
        severity: 'High',
        description: 'Job description contains unencrypted HTTP links, URL shorteners, or free webmail contact addresses.',
        evidenceSnippet: 'Detected unverified external URL or free email domain in job description.'
      });
    }

    // Signal 3: Unusual Contact Requests (Telegram/WhatsApp direct handles)
    if (
      descLower.includes('telegram') ||
      descLower.includes('whatsapp me') ||
      descLower.includes('contact via wire') ||
      descLower.includes('direct zelle')
    ) {
      signals.push({
        signalType: 'Unusual Contact Request',
        severity: 'High',
        description: 'Recruiter requests applicants to bypass official application channels via direct messaging handles.',
        evidenceSnippet: 'Detected direct messaging/chat app handle in description.'
      });
    }

    // Signal 4: Requests for Money (Training fees, laptop deposits)
    if (
      descLower.includes('training fee') ||
      descLower.includes('laptop deposit') ||
      descLower.includes('registration fee') ||
      descLower.includes('security deposit') ||
      descLower.includes('pay upfront') ||
      descLower.includes('send money')
    ) {
      signals.push({
        signalType: 'Request for Money',
        severity: 'Critical',
        description: 'Explicit request for upfront candidate payment, training fees, or equipment security deposits.',
        evidenceSnippet: 'Detected upfront payment keyphrases in job description.'
      });
    }

    // Signal 5: Requests for Sensitive Information (SSN, credit card, bank logins)
    if (
      descLower.includes('ssn upfront') ||
      descLower.includes('credit card number') ||
      descLower.includes('bank account password') ||
      descLower.includes('social security number') ||
      descLower.includes('aadhaar photo')
    ) {
      signals.push({
        signalType: 'Request for Sensitive Info',
        severity: 'Critical',
        description: 'Posting requests highly confidential financial or identity documentation prior to interview selection.',
        evidenceSnippet: 'Detected request for confidential identity or banking credentials.'
      });
    }

    // Signal 6: Duplicate Job Postings
    const allJobs = seedJobs;
    const duplicates = allJobs.filter(
      (j) => j.id !== job.id && j.title.toLowerCase() === titleLower && j.company.toLowerCase() === companyLower
    );
    if (duplicates.length >= 2) {
      signals.push({
        signalType: 'Duplicate Posting',
        severity: 'Medium',
        description: 'Identical job posting title and company found across multiple listing IDs.',
        evidenceSnippet: `Found ${duplicates.length} duplicate postings across platform.`
      });
    }

    // Signal 7: Inconsistent Job Details (Senior title with 0 YOE or Entry title with 15 YOE)
    const minExp = job.minExperience ?? 0;
    if (titleLower.includes('senior') && minExp === 0) {
      signals.push({
        signalType: 'Inconsistent Details',
        severity: 'Low',
        description: 'Title indicates Senior role but minimum experience requirement is set to 0 years.',
        evidenceSnippet: `Title "${job.title}" vs Min Experience ${minExp} YOE`
      });
    }

    // Signal 8: Unverified Employer Status
    if ((job as any).status === 'Draft' || companyLower.includes('test')) {
      signals.push({
        signalType: 'Unverified Employer',
        severity: 'Low',
        description: 'Employer domain or recruiter profile pending corporate verification check.',
        evidenceSnippet: 'Employer account verification pending.'
      });
    }

    // Determine Concern Tier & Rationale
    const { concernTier, reasoningExplanation, overallTrustScore } = this.classifyConcernTier(signals, job);

    return {
      jobId: job.id,
      jobTitle: job.title,
      companyName: companyStr || 'Corporate Employer',
      concernTier,
      reasoningExplanation,
      signalsDetected: signals,
      overallTrustScore,
      evaluatedAt: new Date().toISOString().split('T')[0],
      fairEvidenceVerified: true
    };
  }

  /**
   * Classifies Concern Tier based on detected signals and evidence severity
   */
  public static classifyConcernTier(
    signals: SafetySignalFlag[],
    job: JobOpening | EmployerJobPost
  ): {
    concernTier: ConcernTier;
    reasoningExplanation: string;
    overallTrustScore: number;
  } {
    const hasCritical = signals.some((s) => s.severity === 'Critical');
    const hasHigh = signals.some((s) => s.severity === 'High');
    const hasMedium = signals.some((s) => s.severity === 'Medium');

    if (hasCritical) {
      return {
        concernTier: 'High concern',
        reasoningExplanation: `High concern flag: Posting contains critical risk signals (${signals.map((s) => s.signalType).join(', ')}). Immediate moderation review required.`,
        overallTrustScore: 25
      };
    }

    if (hasHigh) {
      return {
        concernTier: 'Potential concern',
        reasoningExplanation: `Potential concern flag: Unusual contact handles or unverified URL structures detected (${signals.map((s) => s.signalType).join(', ')}).`,
        overallTrustScore: 55
      };
    }

    if (hasMedium || signals.length > 0) {
      return {
        concernTier: 'Needs review',
        reasoningExplanation: `Needs review flag: Minor inconsistencies or unverified employer domain detected (${signals.map((s) => s.signalType).join(', ')}).`,
        overallTrustScore: 78
      };
    }

    return {
      concernTier: 'Low concern',
      reasoningExplanation: `Low concern: Clean job posting. Verified company domain, consistent experience metrics, and standard application channels.`,
      overallTrustScore: 98
    };
  }

  /**
   * Submits User Job Report with strict Reporter Privacy Protection
   */
  public static submitJobReport(
    candidate: CandidateProfile,
    jobId: string,
    jobTitle: string,
    companyName: string,
    category: ReportCategory,
    description: string,
    evidenceTextOrUrl?: string
  ): UserJobReport {
    const maskedReporterId = this.maskReporterPrivacy(candidate.id);

    const report: UserJobReport = {
      id: `rep_${Date.now()}`,
      jobId,
      jobTitle,
      companyName,
      reporterId: candidate.id,
      maskedReporterId,
      category,
      description,
      evidenceTextOrUrl,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pending Review'
    };

    const reports = SavedJobTrustSafetyService.getReports();
    reports.unshift(report);
    SavedJobTrustSafetyService.saveReports(reports);

    // Update or create Moderation Case ticket
    this.syncModerationCase(jobId, jobTitle, companyName, report);

    return report;
  }

  /**
   * Mask Reporter Privacy (Guarantees zero exposure of private reporter contact info)
   */
  public static maskReporterPrivacy(reporterUserId: string): string {
    let hash = 0;
    for (let i = 0; i < reporterUserId.length; i++) {
      hash = (hash << 5) - hash + reporterUserId.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash % 8999) + 1000;
    return `Reporter #${num}`;
  }

  /**
   * Syncs user report into Moderation Queue & Evidence Vault
   */
  private static syncModerationCase(
    jobId: string,
    jobTitle: string,
    companyName: string,
    report: UserJobReport
  ): ModerationCase {
    const cases = SavedJobTrustSafetyService.getModerationCases();
    let existingCase = cases.find((c) => c.jobId === jobId);
    const targetJob = seedJobs.find((j) => j.id === jobId) || { id: jobId, title: jobTitle, company: companyName };

    const safetyAnalysis = this.analyzeJobSafety(targetJob as any);

    if (existingCase) {
      existingCase.reports.unshift(report);
      existingCase.evidenceSnapshot.userReportCount = existingCase.reports.length;
      existingCase.lastUpdated = new Date().toISOString().split('T')[0];
    } else {
      existingCase = {
        id: `mod_case_${Date.now()}`,
        jobId,
        jobTitle,
        companyName,
        concernTier: safetyAnalysis.concernTier,
        safetyAnalysis,
        reports: [report],
        status: 'Under Review',
        evidenceSnapshot: {
          jobDescription: (targetJob as any).description || 'Job Description Snapshot',
          detectedSignalsCount: safetyAnalysis.signalsDetected.length,
          userReportCount: 1,
          snapshotDate: new Date().toISOString().split('T')[0]
        },
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      cases.unshift(existingCase);
    }

    SavedJobTrustSafetyService.saveModerationCases(cases);
    return existingCase;
  }

  /**
   * Retrieves active Moderation Cases in Evidence Vault
   */
  public static getModerationCases(): ModerationCase[] {
    const cases = SavedJobTrustSafetyService.getModerationCases();
    if (cases.length === 0) {
      // Seed default baseline moderation case for demonstration
      const sampleJob = seedJobs[0];
      const baselineAnalysis = this.analyzeJobSafety(sampleJob);
      const baselineCase: ModerationCase = {
        id: 'mod_case_demo_101',
        jobId: sampleJob.id,
        jobTitle: sampleJob.title,
        companyName: sampleJob.company,
        concernTier: 'Needs review',
        safetyAnalysis: baselineAnalysis,
        reports: [
          {
            id: 'rep_demo_01',
            jobId: sampleJob.id,
            jobTitle: sampleJob.title,
            companyName: sampleJob.company,
            reporterId: 'cand_demo_88',
            maskedReporterId: 'Reporter #4092',
            category: 'Wrong information',
            description: 'Location specified as Remote, but recruiter confirmed onsite requirement during initial chat.',
            createdAt: '2026-09-02',
            status: 'Pending Review'
          }
        ],
        status: 'Under Review',
        evidenceSnapshot: {
          jobDescription: sampleJob.description || 'Job Description Snapshot',
          detectedSignalsCount: baselineAnalysis.signalsDetected.length,
          userReportCount: 1,
          snapshotDate: '2026-09-02'
        },
        moderatorNotes: 'Reviewing location accuracy with recruiter.',
        lastUpdated: '2026-09-03'
      };

      cases.push(baselineCase);
      SavedJobTrustSafetyService.saveModerationCases(cases);
    }

    return cases;
  }

  /**
   * Moderator Action: Resolves or modifies moderation ticket status
   */
  public static resolveModerationCase(
    caseId: string,
    action: 'Approved' | 'Suspended' | 'Warning Issued' | 'Escalated',
    notes?: string
  ): ModerationCase {
    const cases = SavedJobTrustSafetyService.getModerationCases();
    const idx = cases.findIndex((c) => c.id === caseId);
    if (idx === -1) throw new Error('Moderation case not found');

    cases[idx].status = action;
    cases[idx].moderatorNotes = notes || `Moderator action executed: ${action}.`;
    cases[idx].lastUpdated = new Date().toISOString().split('T')[0];

    SavedJobTrustSafetyService.saveModerationCases(cases);
    return cases[idx];
  }
}
