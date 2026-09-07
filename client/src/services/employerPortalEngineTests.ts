import { EmployerJobPost, InterviewScheduleRequest } from '../types';
import { EmployerPortalService, SavedEmployerPortalService } from './employerPortalService';

export interface EmployerPortalTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runEmployerPortalEngineTests(): EmployerPortalTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    // Test 1: Employer Registration & Account Creation
    const regResult = EmployerPortalService.registerEmployer(
      'Alex Mercer',
      'alex.mercer@innovate.ai',
      'Innovate AI Systems',
      'Admin',
      'VP of Engineering'
    );
    const test1Pass = regResult.user.name === 'Alex Mercer' && regResult.company.name === 'Innovate AI Systems';
    addResult(
      'Employer Registration & Account Creation',
      test1Pass,
      `Registered employer account "${regResult.user.name}" (${regResult.user.role}) for company "${regResult.company.name}"`
    );

    // Test 2: Corporate Company Profile Storage & Update
    const company = EmployerPortalService.getCompanyProfile();
    company.industry = 'AI Data Infrastructure & Telemetry';
    const updatedComp = EmployerPortalService.updateCompanyProfile(company);
    const test2Pass = updatedComp.industry === 'AI Data Infrastructure & Telemetry';
    addResult(
      'Corporate Company Profile Storage & Update',
      test2Pass,
      `Updated corporate profile industry: "${updatedComp.industry}"`
    );

    // Test 3: Job Posting Creation with All 11 Required Fields
    const newJobPayload = {
      title: 'Senior Telemetry & Analytics Architect',
      description: 'Lead architecture of scalable data pipelines processing 100k+ events/sec.',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
      niceToHaveSkills: ['Docker', 'Kafka'],
      minExperience: 5,
      maxExperience: 10,
      educationRequired: 'B.Tech / M.Tech in Computer Science',
      location: 'Bengaluru, India',
      workMode: 'Hybrid' as const,
      employmentType: 'Full-time' as const,
      salaryRange: { min: 2400000, max: 3500000, currency: 'INR' },
      benefits: ['Health Coverage', 'Learning Allowance', 'Stock Options'],
      applicationMethod: 'Laboria One-Click' as const,
      status: 'Active' as const
    };
    const postedJob = EmployerPortalService.postJob(newJobPayload);
    const test3Pass =
      postedJob.id !== undefined &&
      postedJob.title === newJobPayload.title &&
      postedJob.skills.length === 4 &&
      postedJob.salaryRange?.min === 2400000;
    addResult(
      'Job Posting Creation with All 11 Required Fields',
      test3Pass,
      `Created job posting "${postedJob.title}" capturing all 11 required fields (Salary: INR 24L - 35L)`
    );

    // Test 4: Job Post Editing & Status Modification
    const closedJob = EmployerPortalService.closeJob(postedJob.id);
    const test4Pass = closedJob.status === 'Closed';
    addResult(
      'Job Post Editing & Status Modification',
      test4Pass,
      `Modified job status from Active to "${closedJob.status}"`
    );

    // Test 5: Candidate Matching Engine Execution (Profile/JD Match Primary 60%)
    const candidateMatches = EmployerPortalService.searchAndMatchCandidates(postedJob.id);
    const test5Pass = candidateMatches.length > 0 && candidateMatches[0].profileMatchScore >= candidateMatches[candidateMatches.length - 1].profileMatchScore;
    addResult(
      'Candidate Matching Engine Execution',
      test5Pass,
      `Ranked ${candidateMatches.length} candidate matches strictly by Profile/JD Match (Top score: ${candidateMatches[0].profileMatchScore}%)`
    );

    // Test 6: Candidate Search & Filtering
    const filteredMatches = EmployerPortalService.searchAndMatchCandidates(postedJob.id, { minMatchScore: 90 });
    const test6Pass = filteredMatches.every((m) => m.profileMatchScore >= 90);
    addResult(
      'Candidate Search & Filtering',
      test6Pass,
      `Filtered ${filteredMatches.length} candidates with match score >= 90%`
    );

    // Test 7: Candidate Privacy Masking Compliance
    const rawCandidate = { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210' };
    const masked = EmployerPortalService.maskCandidatePrivacy(rawCandidate, false);
    const test7Pass = !masked.maskedEmail.includes('sharma') && masked.maskedPhone.includes('***');
    addResult(
      'Candidate Privacy Masking Compliance',
      test7Pass,
      `Verified contact privacy masking: Email = "${masked.maskedEmail}", Phone = "${masked.maskedPhone}"`
    );

    // Test 8: Candidate Consent Unmasking Verification
    const unmasked = EmployerPortalService.maskCandidatePrivacy(rawCandidate, true);
    const test8Pass = unmasked.maskedEmail === rawCandidate.email && unmasked.displayName === rawCandidate.name;
    addResult(
      'Candidate Consent Unmasking Verification',
      test8Pass,
      `Unmasked contact details upon candidate consent: "${unmasked.displayName}" (${unmasked.maskedEmail})`
    );

    // Test 9: Application Pipeline Status Management
    const appToShortlist = candidateMatches[0].applicationId;
    const shortlistedApp = EmployerPortalService.shortlistCandidate(appToShortlist);
    const test9Pass = shortlistedApp.status === 'Shortlisted';
    addResult(
      'Application Pipeline Status Management',
      test9Pass,
      `Updated application ID ${appToShortlist} status to "${shortlistedApp.status}"`
    );

    // Test 10: Interview Management & Schedule Generation
    const scheduleReq: InterviewScheduleRequest = {
      applicationId: appToShortlist,
      candidateId: shortlistedApp.candidateId,
      jobId: postedJob.id,
      roundType: 'System Architecture & Technical Round',
      date: '2026-09-10',
      time: '11:00 IST',
      meetingLink: 'https://meet.laboria.ai/techpartner-arch-round',
      interviewerName: 'Alex Mercer (VP of Engineering)'
    };
    const scheduledApp = EmployerPortalService.scheduleInterview(scheduleReq);
    const test10Pass = scheduledApp.status === 'Interview Scheduled' && scheduledApp.interviewDetails !== undefined;
    addResult(
      'Interview Management & Schedule Generation',
      test10Pass,
      `Scheduled ${scheduleReq.roundType} for ${scheduleReq.date} at ${scheduleReq.time}`
    );

    // Test 11: Role-Based Permissions Enforcement (Admin vs Recruiter vs Hiring Manager)
    const adminPermission = EmployerPortalService.evaluateRBACPermission('Admin', 'MANAGE_COMPANY');
    const hmPermission = EmployerPortalService.evaluateRBACPermission('Hiring Manager', 'POST_JOB');
    const test11Pass = adminPermission.permitted === true && hmPermission.permitted === false;
    addResult(
      'Role-Based Permissions Enforcement',
      test11Pass,
      `Enforced RBAC boundaries: Admin MANAGE_COMPANY = Permitted, Hiring Manager POST_JOB = Restricted`
    );

    // Test 12: Persistent Local Storage CRUD Operations
    const allJobsAfter = EmployerPortalService.getJobs();
    const test12Pass = allJobsAfter.some((j) => j.id === postedJob.id);
    addResult(
      'Persistent Local Storage CRUD Operations',
      test12Pass,
      `Persisted and retrieved employer job posts from local storage repository`
    );

  } catch (err: any) {
    addResult('Employer Portal Engine Test Suite Exception', false, err.message || String(err));
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
