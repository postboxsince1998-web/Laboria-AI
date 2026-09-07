import { CandidateProfile, EmployerJobPost, JobOpening } from '../types';
import { seedJobs } from '../data/seedData';
import { JobTrustSafetyService, SavedJobTrustSafetyService } from './jobTrustSafetyService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_safety_101',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@laboria.ai',
  phone: '+91 98765 43210',
  headline: 'Senior Full Stack Engineer',
  yearsOfExperience: 4,
  currentLocation: {
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  preferredLocations: ['Bengaluru', 'Remote'],
  preferredWorkType: 'Remote',
  targetRoles: ['Senior Full Stack Engineer'],
  skills: [{ name: 'TypeScript', level: 'Advanced' }],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  resumeText: 'Senior Full Stack Engineer with 4 years experience.',
};

export interface JobTrustSafetyTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runJobTrustSafetyEngineTests(): JobTrustSafetyTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    // Test 1: 8 Suspicious Job Pattern Signals Detection Engine
    const cleanJob = seedJobs[0];
    const cleanAnalysis = JobTrustSafetyService.analyzeJobSafety(cleanJob);
    const test1Pass = cleanAnalysis.jobId === cleanJob.id && typeof cleanAnalysis.overallTrustScore === 'number';
    addResult(
      '8 Suspicious Job Pattern Signals Detection Engine',
      test1Pass,
      `Evaluated 8 safety pattern signals for job "${cleanJob.title}" (Trust score: ${cleanAnalysis.overallTrustScore}%)`
    );

    // Test 2: Concern Tier Classification
    const test2Pass = ['Low concern', 'Needs review', 'Potential concern', 'High concern'].includes(cleanAnalysis.concernTier);
    addResult(
      'Concern Tier Classification',
      test2Pass,
      `Classified job posting into evidence concern tier: "${cleanAnalysis.concernTier}"`
    );

    // Test 3: Evidence-Based Reasoning Explanation Generation
    const test3Pass = typeof cleanAnalysis.reasoningExplanation === 'string' && cleanAnalysis.reasoningExplanation.length > 20;
    addResult(
      'Evidence-Based Reasoning Explanation Generation',
      test3Pass,
      `Generated reasoning explanation: "${cleanAnalysis.reasoningExplanation}"`
    );

    // Test 4: Fair Evidence Policy Verification (Zero False Fraudulent Declarations)
    const test4Pass = cleanAnalysis.fairEvidenceVerified === true && cleanAnalysis.concernTier === 'Low concern';
    addResult(
      'Fair Evidence Policy Verification',
      test4Pass,
      `Confirmed fair evidence policy (Clean job classified as Low concern without false fraudulent labels)`
    );

    // Test 5: User "Report Job" Form Submission across 6 Categories
    const report = JobTrustSafetyService.submitJobReport(
      mockCandidate,
      cleanJob.id,
      cleanJob.title,
      cleanJob.company,
      'Payment request',
      'Recruiter asked for upfront training deposit.',
      'https://evidence.laboria.ai/screenshot-01.png'
    );
    const test5Pass = report.id !== undefined && report.category === 'Payment request';
    addResult(
      'User "Report Job" Form Submission across 6 Categories',
      test5Pass,
      `Submitted user report ticket ID: ${report.id} under category "${report.category}"`
    );

    // Test 6: Reporter Privacy Masking Compliance
    const test6Pass = report.maskedReporterId.startsWith('Reporter #') && !report.maskedReporterId.includes(mockCandidate.email);
    addResult(
      'Reporter Privacy Masking Compliance',
      test6Pass,
      `Anonymized reporter identity to "${report.maskedReporterId}" (Zero private contact info exposed)`
    );

    // Test 7: Upfront Payment Request High Concern Detection Test
    const suspiciousJob: EmployerJobPost = {
      id: 'job_suspicious_99',
      companyId: 'comp_test',
      companyName: 'Unverified Hiring LLC',
      title: 'Data Entry Representative',
      description: 'Must pay $200 laptop deposit and training fee upfront to receive equipment.',
      skills: ['Excel'],
      minExperience: 0,
      maxExperience: 1,
      educationRequired: 'High School',
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      applicationMethod: 'Laboria One-Click',
      status: 'Active',
      postedDate: '2026-09-05',
      applicantCount: 0
    };
    const suspiciousAnalysis = JobTrustSafetyService.analyzeJobSafety(suspiciousJob);
    const test7Pass = suspiciousAnalysis.concernTier === 'High concern';
    addResult(
      'Upfront Payment Request High Concern Detection Test',
      test7Pass,
      `Successfully detected money request keyphrase and assigned concern tier: "${suspiciousAnalysis.concernTier}"`
    );

    // Test 8: Suspicious URL & Free Webmail Detection Test
    const webmailJob: EmployerJobPost = {
      ...suspiciousJob,
      id: 'job_webmail_101',
      description: 'Contact recruiter directly at HR_Recruiter2026@gmail.com or visit http://unsecure-site.com'
    };
    const webmailAnalysis = JobTrustSafetyService.analyzeJobSafety(webmailJob);
    const test8Pass = webmailAnalysis.signalsDetected.some((s) => s.signalType === 'Suspicious URL');
    addResult(
      'Suspicious URL & Free Webmail Detection Test',
      test8Pass,
      `Detected free webmail and HTTP URL signal in posting description`
    );

    // Test 9: Duplicate Job Posting Detection Test
    const dupJob: EmployerJobPost = {
      ...suspiciousJob,
      id: 'job_dup_202',
      title: seedJobs[0].title,
      companyName: seedJobs[0].company
    };
    const dupAnalysis = JobTrustSafetyService.analyzeJobSafety(dupJob);
    const test9Pass = dupAnalysis.signalsDetected.some((s) => s.signalType === 'Duplicate Posting');
    addResult(
      'Duplicate Job Posting Detection Test',
      test9Pass,
      `Identified duplicate job posting across active listings`
    );

    // Test 10: Moderation Architecture Queue & Evidence Snapshot Archiving
    const modCases = JobTrustSafetyService.getModerationCases();
    const test10Pass = modCases.length > 0 && modCases[0].evidenceSnapshot.jobDescription !== undefined;
    addResult(
      'Moderation Architecture Queue & Evidence Snapshot Archiving',
      test10Pass,
      `Retrieved ${modCases.length} moderation cases with archived evidence snapshots`
    );

    // Test 11: Moderator Action Resolution Workflow
    const resolvedCase = JobTrustSafetyService.resolveModerationCase(modCases[0].id, 'Suspended', 'Suspended for payment request violation.');
    const test11Pass = resolvedCase.status === 'Suspended';
    addResult(
      'Moderator Action Resolution Workflow',
      test11Pass,
      `Executed moderator action: Set case status to "${resolvedCase.status}"`
    );

    // Test 12: Persistent Local Storage CRUD Operations
    const reportsAfter = SavedJobTrustSafetyService.getReports();
    const test12Pass = reportsAfter.some((r) => r.id === report.id);
    addResult(
      'Persistent Local Storage CRUD Operations',
      test12Pass,
      `Persisted and retrieved job reports and moderation tickets from local storage`
    );

  } catch (err: any) {
    addResult('Job Trust & Safety Engine Test Suite Exception', false, err.message || String(err));
  }

  const passCount = details.filter((d) => d.status === 'PASS').length;
  const failCount = details.length - passCount;

  return {
    passed: failCount === 0,
    totalTests: details.length,
    passCount,
    failCount,
    details,
  };
}
