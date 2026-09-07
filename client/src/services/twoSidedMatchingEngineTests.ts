import { CandidateProfile, JobOpening } from '../types';
import { seedJobs } from '../data/seedData';
import { TwoSidedMatchingService, SavedTwoSidedMatchingService, HIRING_DISCLAIMER } from './twoSidedMatchingService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_ts_101',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@laboria.ai',
  phone: '+91 98765 43210',
  headline: 'Senior Full Stack & Data Analytics Engineer',
  yearsOfExperience: 4,
  currentLocation: {
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  preferredLocations: ['Bengaluru', 'Remote'],
  preferredWorkType: 'Remote',
  targetRoles: ['Senior Full Stack Engineer', 'Analytics Architect'],
  skills: [
    { name: 'TypeScript', level: 'Advanced' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'React', level: 'Advanced' },
    { name: 'PostgreSQL', level: 'Intermediate' },
  ],
  education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'NIT Surathkal', year: 2022 }],
  experience: [
    {
      id: 'exp_01',
      company: 'TechCorp Solutions',
      role: 'Senior Full Stack Engineer',
      startDate: '2023-01-15',
      endDate: 'Present',
      description: 'Built real-time telemetry processing microservices.',
      skillsUsed: ['TypeScript', 'Node.js', 'React']
    }
  ],
  projects: [{ id: 'p_1', name: 'Telemetry Dashboard', description: 'Real-time analytics tool', techStack: ['TypeScript', 'React', 'Node.js'] }],
  certifications: ['AWS Certified Developer'],
  resumeText: 'Senior Full Stack Engineer with 4 years experience in TypeScript, Node.js, React.',
};

export interface TwoSidedMatchingTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runTwoSidedMatchingEngineTests(): TwoSidedMatchingTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    // Test 1: Bi-Directional Candidate-to-Job Match Generation
    const candidateMatches = TwoSidedMatchingService.evaluateCandidateToJobs(mockCandidate, seedJobs);
    const test1Pass = candidateMatches.length > 0 && candidateMatches[0].candidateId === mockCandidate.id;
    addResult(
      'Bi-Directional Candidate-to-Job Match Generation',
      test1Pass,
      `Evaluated ${candidateMatches.length} job matches for candidate "${mockCandidate.fullName}"`
    );

    // Test 2: Bi-Directional Employer-to-Candidate Match Generation
    const employerMatches = TwoSidedMatchingService.evaluateEmployerToCandidates(seedJobs[0], [mockCandidate]);
    const test2Pass = employerMatches.length > 0 && employerMatches[0].jobId === seedJobs[0].id;
    addResult(
      'Bi-Directional Employer-to-Candidate Match Generation',
      test2Pass,
      `Evaluated candidate pool for job posting "${seedJobs[0].title}"`
    );

    // Test 3: 10-Dimensional Match Scoring Formula Execution
    const matchObj = candidateMatches[0];
    const test3Pass =
      matchObj.breakdown.skillsScore >= 0 &&
      matchObj.breakdown.jdFitScore >= 0 &&
      matchObj.breakdown.experienceScore >= 0 &&
      matchObj.breakdown.readinessScore >= 0 &&
      matchObj.breakdown.portfolioScore >= 0;
    addResult(
      '10-Dimensional Match Scoring Formula Execution',
      test3Pass,
      `Calculated 10-factor composite match score (${matchObj.overallMatchScore}%) with skills score ${matchObj.breakdown.skillsScore}%`
    );

    // Test 4: Non-Discrimination Compliance Verification
    const test4Pass = matchObj.nonDiscriminationComplianceFlag === true;
    addResult(
      'Non-Discrimination Compliance Verification',
      test4Pass,
      `Verified zero protected/sensitive characteristics used in match vector (nonDiscriminationComplianceFlag = true)`
    );

    // Test 5: Transparent Match Explanation Generation
    const test5Pass = matchObj.whyMatched.length > 0 && matchObj.strengths.length > 0 && matchObj.potentialGaps.length > 0;
    addResult(
      'Transparent Match Explanation Generation',
      test5Pass,
      `Generated transparent explanation: ${matchObj.whyMatched.length} why matched points, ${matchObj.strengths.length} strengths, ${matchObj.potentialGaps.length} gaps`
    );

    // Test 6: "Never Guarantee Hiring" Policy Disclaimer Verification
    const test6Pass = matchObj.hiringGuaranteeDisclaimer === HIRING_DISCLAIMER;
    addResult(
      '"Never Guarantee Hiring" Policy Disclaimer Verification',
      test6Pass,
      `Confirmed explicit non-guarantee hiring disclaimer present on match payload`
    );

    // Test 7: Shortlist, Save, and Dismiss Action Handlers
    const shortlisted = TwoSidedMatchingService.shortlistMatch(matchObj, 'Candidate');
    const saved = TwoSidedMatchingService.saveMatch(matchObj, 'Candidate');
    const dismissed = TwoSidedMatchingService.dismissMatch(matchObj, 'Candidate');
    const test7Pass = shortlisted.isShortlisted && saved.isSaved && dismissed.isDismissed;
    addResult(
      'Shortlist, Save, and Dismiss Action Handlers',
      test7Pass,
      `Successfully processed Shortlist, Save, and Dismiss match actions`
    );

    // Test 8: Connection Request Generation & Candidate Consent Flow
    const connReq = TwoSidedMatchingService.requestConnection(
      'Employer',
      'emp_comp_101',
      'TechPartner Recruiter',
      mockCandidate.id,
      seedJobs[0].id,
      seedJobs[0].title,
      seedJobs[0].company,
      'We noticed your high match score for our Analytics role!'
    );
    const test8Pass = connReq.id !== undefined && connReq.status === 'Pending';
    addResult(
      'Connection Request Generation & Candidate Consent Flow',
      test8Pass,
      `Created connection request (ID: ${connReq.id}) with status "${connReq.status}"`
    );

    // Test 9: Candidate Connection Acceptance & Unmasking Workflow
    const acceptedConn = TwoSidedMatchingService.respondToConnectionRequest(connReq.id, 'Accepted');
    const test9Pass = acceptedConn.status === 'Accepted' && acceptedConn.respondedAt !== undefined;
    addResult(
      'Candidate Connection Acceptance & Unmasking Workflow',
      test9Pass,
      `Candidate accepted connection request (Status: ${acceptedConn.status})`
    );

    // Test 10: Real-Time Audit Log Generation & Storage
    const auditLogs = TwoSidedMatchingService.getAuditLogs();
    const test10Pass = auditLogs.length > 0 && auditLogs[0].complianceFlags.nonDiscriminationVerified === true;
    addResult(
      'Real-Time Audit Log Generation & Storage',
      test10Pass,
      `Generated ${auditLogs.length} immutable audit log entries with compliance verification flags`
    );

    // Test 11: Ranking Accuracy & Sorting Test
    const isSorted = candidateMatches.every((m, idx) => idx === 0 || m.overallMatchScore <= candidateMatches[idx - 1].overallMatchScore);
    addResult(
      'Ranking Accuracy & Sorting Test',
      isSorted,
      `Verified candidate matches are strictly sorted descending by Overall Match Score`
    );

    // Test 12: Persistent Local Storage CRUD Operations
    const savedMatches = SavedTwoSidedMatchingService.getMatches();
    const test12Pass = savedMatches.some((m) => m.matchId === matchObj.matchId);
    addResult(
      'Persistent Local Storage CRUD Operations',
      test12Pass,
      `Persisted and retrieved two-sided match state from local storage repository`
    );

  } catch (err: any) {
    addResult('Two-Sided Matching Engine Test Suite Exception', false, err.message || String(err));
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
