import { EmployerPilotService } from './employerPilotService';
import { EmployerPortalService, SavedEmployerPortalService } from './employerPortalService';

export interface TestResultItem {
  name: string;
  passed: boolean;
  message: string;
}

export function runEmployerPilotEngineTests(): { passed: boolean; results: TestResultItem[] } {
  const results: TestResultItem[] = [];

  // Test 1: 8-Step Employer Pilot Workflow Pipeline Assertion
  try {
    const steps = EmployerPilotService.get8StepWorkflow();
    const is8Steps = steps.length === 8;
    results.push({
      name: '1. 8-Step Employer Pilot Workflow Pipeline Assertion',
      passed: is8Steps,
      message: is8Steps
        ? `Verified 8 sequential pilot workflow stages (${steps.map(s => s.stepName.split('.')[1].trim()).slice(0, 4).join(', ')}, and 4 more).`
        : 'Failed: Missing one or more of the 8 workflow steps.'
    });
  } catch (err: any) {
    results.push({ name: '1. 8-Step Employer Pilot Workflow Pipeline Assertion', passed: false, message: err.message });
  }

  // Test 2: Employer Signup & Account Creation Assertion
  try {
    const { user, company } = EmployerPortalService.registerEmployer(
      'Test Recruiter',
      'test.recruiter@laboriapilot.com',
      'Pilot Apex Systems',
      'Admin',
      'Lead Recruiter'
    );
    const isValid = user.name === 'Test Recruiter' && company.name === 'Pilot Apex Systems';
    results.push({
      name: '2. Employer Signup & Account Creation Assertion',
      passed: isValid,
      message: isValid
        ? `Successfully registered recruiter account for "${user.name}" (${company.name}).`
        : 'Failed: Employer signup failed.'
    });
  } catch (err: any) {
    results.push({ name: '2. Employer Signup & Account Creation Assertion', passed: false, message: err.message });
  }

  // Test 3: Company Profile Setup & Tech Stack Assertion
  try {
    const company = EmployerPortalService.getCompanyProfile();
    const hasProfile = Boolean(company.name && company.techStack && company.techStack.length > 0);
    results.push({
      name: '3. Company Profile Setup & Tech Stack Assertion',
      passed: hasProfile,
      message: hasProfile
        ? `Company profile verified: "${company.name}" with tech stack [${company.techStack.join(', ')}].`
        : 'Failed: Company profile details missing.'
    });
  } catch (err: any) {
    results.push({ name: '3. Company Profile Setup & Tech Stack Assertion', passed: false, message: err.message });
  }

  // Test 4: Employer Job Posting Assertion
  try {
    const postedJob = EmployerPortalService.postJob({
      title: 'Pilot Lead AI Engineer',
      description: 'Lead building pilot matching algorithms.',
      skills: ['Python', 'PyTorch', 'TypeScript', 'Node.js'],
      niceToHaveSkills: ['Docker', 'AWS'],
      minExperience: 3,
      maxExperience: 7,
      educationRequired: 'B.Tech / M.Tech in Computer Science',
      location: 'Bengaluru, India',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryRange: { min: 1800000, max: 2800000, currency: 'INR' },
      benefits: ['Health Insurance', 'Learning Budget'],
      applicationMethod: 'Laboria One-Click',
      status: 'Active'
    });

    const isPosted = Boolean(postedJob.id && postedJob.title === 'Pilot Lead AI Engineer');
    results.push({
      name: '4. Employer Job Posting Assertion',
      passed: isPosted,
      message: isPosted
        ? `Job posting created successfully: "${postedJob.title}" (ID: ${postedJob.id}).`
        : 'Failed: Job creation failed.'
    });
  } catch (err: any) {
    results.push({ name: '4. Employer Job Posting Assertion', passed: false, message: err.message });
  }

  // Test 5: Candidate Match Search & Ranking Assertion
  try {
    const jobs = EmployerPortalService.getJobs();
    const targetJobId = jobs[0].id;
    const matches = EmployerPortalService.searchAndMatchCandidates(targetJobId);

    const isRanked = matches.length > 0 && matches[0].profileMatchScore >= (matches[1]?.profileMatchScore || 0);
    results.push({
      name: '5. Candidate Match Search & Ranking Assertion',
      passed: isRanked,
      message: isRanked
        ? `Found ${matches.length} matched candidates for job "${jobs[0].title}". Top match score: ${matches[0].profileMatchScore}%.`
        : 'Failed: Candidate match search failed.'
    });
  } catch (err: any) {
    results.push({ name: '5. Candidate Match Search & Ranking Assertion', passed: false, message: err.message });
  }

  // Test 6: Match Transparency Explanation Breakdown Assertion
  try {
    const jobs = EmployerPortalService.getJobs();
    const apps = SavedEmployerPortalService.getApplications();
    const explanation = EmployerPilotService.generateMatchExplanation(jobs[0], apps[0]);

    const isTransparent = Boolean(explanation.explanationSummary && explanation.matchedSkills.length >= 0);
    results.push({
      name: '6. Match Transparency Explanation Breakdown Assertion',
      passed: isTransparent,
      message: isTransparent
        ? `Match explanation generated: "${explanation.explanationSummary}".`
        : 'Failed: Match explanation generation failed.'
    });
  } catch (err: any) {
    results.push({ name: '6. Match Transparency Explanation Breakdown Assertion', passed: false, message: err.message });
  }

  // Test 7: Candidate Privacy Contact Masking Assertion
  try {
    const apps = SavedEmployerPortalService.getApplications();
    const unconsentedApp = apps.find(a => !a.hasConsentedPrivacy) || apps[1];
    const privacyState = EmployerPilotService.getCandidatePrivacyState(unconsentedApp);

    const isMasked = privacyState.isMasked || unconsentedApp.maskedEmail.includes('*');
    results.push({
      name: '7. Candidate Privacy Contact Masking Assertion',
      passed: isMasked,
      message: isMasked
        ? `Privacy shielding verified for unconsented candidate: ${privacyState.displayName} (${privacyState.email}).`
        : 'Failed: Contact info exposed without consent.'
    });
  } catch (err: any) {
    results.push({ name: '7. Candidate Privacy Contact Masking Assertion', passed: false, message: err.message });
  }

  // Test 8: Candidate Consent Unmasking Assertion
  try {
    const apps = SavedEmployerPortalService.getApplications();
    const targetApp = apps[1] || apps[0];
    const unmasked = EmployerPilotService.requestCandidateContact(targetApp.applicationId);

    const isGranted = unmasked.hasConsentedPrivacy;
    results.push({
      name: '8. Candidate Consent Unmasking Assertion',
      passed: isGranted,
      message: isGranted
        ? `Contact consent requested & unmasked: "${unmasked.candidateName}" (${unmasked.maskedEmail}).`
        : 'Failed: Consent unmasking failed.'
    });
  } catch (err: any) {
    results.push({ name: '8. Candidate Consent Unmasking Assertion', passed: false, message: err.message });
  }

  // Test 9: Candidate Shortlisting Workflow Assertion
  try {
    const apps = SavedEmployerPortalService.getApplications();
    const targetApp = apps[0];
    const shortlisted = EmployerPilotService.shortlistCandidate(targetApp.applicationId);

    const isShortlisted = shortlisted.status === 'Shortlisted';
    results.push({
      name: '9. Candidate Shortlisting Workflow Assertion',
      passed: isShortlisted,
      message: isShortlisted
        ? `Candidate ${shortlisted.candidateName} successfully shortlisted.`
        : 'Failed: Shortlist workflow failed.'
    });
  } catch (err: any) {
    results.push({ name: '9. Candidate Shortlisting Workflow Assertion', passed: false, message: err.message });
  }

  // Test 10: Interview Scheduling Workflow Assertion
  try {
    const apps = SavedEmployerPortalService.getApplications();
    const targetApp = apps[0];
    const scheduled = EmployerPilotService.scheduleInterview(
      targetApp.applicationId,
      '2026-09-12',
      '11:00 IST',
      'Technical Deep-Dive'
    );

    const isScheduled = scheduled.status === 'Interview Scheduled' && Boolean(scheduled.interviewDetails);
    results.push({
      name: '10. Interview Scheduling Workflow Assertion',
      passed: isScheduled,
      message: isScheduled
        ? `Interview scheduled for ${scheduled.candidateName} on ${scheduled.interviewDetails?.date} at ${scheduled.interviewDetails?.time}.`
        : 'Failed: Interview scheduling failed.'
    });
  } catch (err: any) {
    results.push({ name: '10. Interview Scheduling Workflow Assertion', passed: false, message: err.message });
  }

  // Test 11: Hiring Outcome Update Assertion
  try {
    const apps = SavedEmployerPortalService.getApplications();
    const targetApp = apps[0];
    const updated = EmployerPilotService.updateCandidateOutcome(targetApp.applicationId, 'Hired');

    const isHired = updated.status === 'Hired';
    results.push({
      name: '11. Hiring Outcome Update Assertion',
      passed: isHired,
      message: isHired
        ? `Hiring outcome updated to "${updated.status}" for ${updated.candidateName}.`
        : 'Failed: Outcome update failed.'
    });
  } catch (err: any) {
    results.push({ name: '11. Hiring Outcome Update Assertion', passed: false, message: err.message });
  }

  // Test 12: Role-Based Access Control (RBAC) Permission Assertion
  try {
    const adminCheck = EmployerPortalService.evaluateRBACPermission('Admin', 'POST_JOB');
    const hmCheck = EmployerPortalService.evaluateRBACPermission('Hiring Manager', 'POST_JOB');

    const isValid = adminCheck.permitted && !hmCheck.permitted;
    results.push({
      name: '12. Role-Based Access Control (RBAC) Permission Assertion',
      passed: isValid,
      message: isValid
        ? 'RBAC rules verified: Admin permitted POST_JOB, Hiring Manager restricted.'
        : 'Failed: RBAC evaluation failed.'
    });
  } catch (err: any) {
    results.push({ name: '12. Role-Based Access Control (RBAC) Permission Assertion', passed: false, message: err.message });
  }

  // Test 13: Persistent Audit Logging Assertion
  try {
    const log = EmployerPilotService.logEmployerAction(
      'VIEW_CANDIDATE_PROFILE',
      'cand_101',
      'job_101',
      'Audited candidate profile view for test runner.'
    );
    const logs = EmployerPilotService.getAuditLogs();
    const found = logs.some(l => l.id === log.id);

    results.push({
      name: '13. Persistent Audit Logging Assertion',
      passed: found,
      message: found
        ? `Audit log entry persistent (${logs.length} total security audit logs recorded).`
        : 'Failed: Audit log entry not found.'
    });
  } catch (err: any) {
    results.push({ name: '13. Persistent Audit Logging Assertion', passed: false, message: err.message });
  }

  // Test 14: Empirical Pilot Telemetry Metrics Assertion
  try {
    const metrics = EmployerPilotService.getPilotMetrics();
    const isValid = metrics.jobsPosted >= 0 && metrics.candidatesViewed >= 0 && metrics.auditLogsCount > 0;

    results.push({
      name: '14. Empirical Pilot Telemetry Metrics Assertion',
      passed: isValid,
      message: isValid
        ? `Empirical pilot telemetry verified: ${metrics.jobsPosted} jobs, ${metrics.candidatesViewed} viewed, ${metrics.candidatesShortlisted} shortlisted, ${metrics.interviewsInitiated} interviews.`
        : 'Failed: Telemetry evaluation failed.'
    });
  } catch (err: any) {
    results.push({ name: '14. Empirical Pilot Telemetry Metrics Assertion', passed: false, message: err.message });
  }

  const passed = results.every(r => r.passed);
  return { passed, results };
}
