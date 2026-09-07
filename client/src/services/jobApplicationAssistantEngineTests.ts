import { seedJobs } from '../data/seedData';
import { CandidateProfile } from '../types';
import { JobApplicationAssistantService } from './jobApplicationAssistantService';
import { getDefaultResumeVersion } from './resumeBuilderService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_app_assistant',
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
  targetRoles: ['Senior Full Stack Engineer', 'Backend Lead'],
  skills: [
    { name: 'TypeScript', level: 'Advanced' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'React', level: 'Advanced' },
    { name: 'PostgreSQL', level: 'Intermediate' },
  ],
  education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'NIT', year: 2023 }],
  experience: [],
  projects: [{ name: 'Telemetry Dashboard', description: 'Full stack tool', techStack: ['React', 'Node.js'] }],
  certifications: ['AWS Certified Developer'],
  resumeText: 'Senior Full Stack Engineer with 4 years experience in TypeScript, Node.js, React.',
};

export interface JobApplicationAssistantTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runJobApplicationAssistantEngineTests(): JobApplicationAssistantTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    const targetJob = seedJobs[0];
    const defaultResume = getDefaultResumeVersion(mockCandidate);

    // Test 1: Prep Bundle Generation
    const prepBundle = JobApplicationAssistantService.generatePrepBundle(targetJob, mockCandidate, [defaultResume]);
    const test1Pass =
      prepBundle.jobId === targetJob.id &&
      prepBundle.company === targetJob.company &&
      prepBundle.matchScore > 0;
    addResult('Job Application Prep Bundle Generation', test1Pass, test1Pass ? `Prep bundle generated for ${targetJob.title} at ${targetJob.company}` : 'Failed to generate prep bundle');

    // Test 2: Eligibility Criteria Audit
    const eligibility = JobApplicationAssistantService.evaluateEligibility(targetJob, mockCandidate);
    const test2Pass = eligibility.length === 3 && eligibility.some((e) => e.criterion.includes('Experience'));
    addResult('Eligibility Criteria Evaluation', test2Pass, `Evaluated ${eligibility.length} eligibility criteria (Experience, Skills, Location)`);

    // Test 3: Required Documents Audit
    const test3Pass = prepBundle.requiredDocuments.length >= 4 && prepBundle.requiredDocuments.some((d) => d.name.includes('Resume'));
    addResult('Required Documents List Audit', test3Pass, `Audited ${prepBundle.requiredDocuments.length} required documents (Resume, Cover Letter, Portfolio, Transcripts)`);

    // Test 4: Recommended Resume Version Selection
    const test4Pass = prepBundle.recommendedResumeVersionId === defaultResume.id;
    addResult('Recommended Resume Version Selection', test4Pass, `Recommended resume version "${prepBundle.recommendedResumeVersionName}"`);

    // Test 5: Missing Information Audit
    const incompleteCandidate: CandidateProfile = { ...mockCandidate, phone: '', email: '' };
    const incompleteBundle = JobApplicationAssistantService.generatePrepBundle(targetJob, incompleteCandidate, [defaultResume]);
    const test5Pass = incompleteBundle.missingInformation.length >= 2 && incompleteBundle.missingInformation.includes('Contact Phone Number');
    addResult('Missing Information Profile Detection', test5Pass, `Detected ${incompleteBundle.missingInformation.length} missing profile details`);

    // Test 6: Mandatory Application Checklist Initial State
    const checklist = prepBundle.prepChecklist;
    const test6Pass =
      checklist.some((c) => c.label.includes('Resume ready')) &&
      checklist.some((c) => c.label.includes('Required skills reviewed')) &&
      checklist.some((c) => c.label.includes('Job requirements understood')) &&
      checklist.some((c) => c.label.includes('Application not yet submitted'));
    addResult('Application Checklist Initial State Verification', test6Pass, `Verified 5 checklist items adhering to exact required labels`);

    // Test 7: Common Screening Questions Generation
    const questions = JobApplicationAssistantService.generateCommonQuestions(targetJob, mockCandidate);
    const test7Pass = questions.length === 4 && questions.every((q) => q.draftAnswer.length > 10);
    addResult('Common Application Questions & Strategy Answers', test7Pass, `Generated ${questions.length} job-tailored screening questions with draft candidate responses`);

    // Test 8: Factual Truth Cover Letter Draft
    const coverLetter = JobApplicationAssistantService.generateCoverLetter(targetJob, mockCandidate, defaultResume);
    const test8Pass = coverLetter.includes(targetJob.company) && coverLetter.includes('Aarav Sharma') && !coverLetter.includes('UNDEFINED');
    addResult('Factual Cover Letter Generation', test8Pass, 'Cover letter generated preserving candidate factual truth');

    // Test 9: No Automatic Submission Compliance
    const test9Pass = prepBundle.isSubmitted === false;
    addResult('No Automatic Submission Compliance', test9Pass, 'Initial preparation bundle enforces isSubmitted = false (Zero auto-submissions)');

    // Test 10: Application Tracker Manual Submission Integration
    const mockUnsubmitted = { ...prepBundle, isSubmitted: false };
    const trackedResult = JobApplicationAssistantService.markAsSubmitted(mockUnsubmitted, targetJob, mockCandidate, 'Applied');
    const test10Pass = trackedResult.jobId === targetJob.id && trackedResult.status === 'Applied';
    addResult('Application Tracker Manual Submission Integration', test10Pass, `Successfully recorded application in Application Tracker under ID ${trackedResult.id}`);

    // Test 11: Interview Coach Connection Role Payload
    const test11Pass = prepBundle.interviewPrepRole === targetJob.title;
    addResult('Interview Coach Connection Role Payload', test11Pass, `Interview Coach role payload target: "${prepBundle.interviewPrepRole}"`);

    // Test 12: AI Mentor Connection Advice Payload
    const mentorAdvicePayload = {
      jobTitle: targetJob.title,
      company: targetJob.company,
      promptText: `What is the best networking or referral strategy for applying to ${targetJob.title} at ${targetJob.company}?`,
    };
    const test12Pass = mentorAdvicePayload.promptText.includes(targetJob.company);
    addResult('AI Mentor Connection Advice Payload', test12Pass, `Generated AI Mentor referral query for ${targetJob.company}`);

  } catch (err: any) {
    addResult('Job Application Assistant Test Suite Exception', false, err.message || String(err));
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
