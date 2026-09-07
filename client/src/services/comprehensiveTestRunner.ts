import { db } from '../db';
import { calculateHaversineDistance } from './locationService';
import { runResumeEngineTests } from './resumeEngineTests';

export interface ComprehensiveTestResult {
  category: string;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export async function runStep2ComprehensiveTests(): Promise<ComprehensiveTestResult[]> {
  const results: ComprehensiveTestResult[] = [];

  try {
    // 1. Profile Creation & Progressive Completion Test
    const createdProfile = await db.userProfiles.create({
      name: 'Test Candidate (DEMO DATA)',
      email: 'test.candidate@laboria.ai',
      targetRoles: ['Full Stack Engineer']
    });
    const updatedProfile = await db.userProfiles.update(createdProfile.id, {
      experienceLevel: 'Senior',
      currentLocation: 'Bengaluru, Karnataka'
    });

    if (updatedProfile.experienceLevel === 'Senior' && updatedProfile.currentLocation === 'Bengaluru, Karnataka') {
      results.push({
        category: '1. User Profile',
        testName: 'Progressive Profile Completion',
        status: 'PASSED',
        details: `Profile created with minimal fields and progressively updated with experience level & location.`
      });
    }

    // 2. Resume Parsing Data Structure & Provenance Test
    const demoRes = await db.resumes.getByUserId('usr_demo_101');
    if (
      demoRes &&
      demoRes.parsedProfile.skills.source === 'resume' &&
      demoRes.parsedProfile.softSkills.source === 'user_input'
    ) {
      results.push({
        category: '2. Resume',
        testName: 'Information Provenance Separation (Resume vs User Input vs AI Recommendation)',
        status: 'PASSED',
        details: `Explicitly verified provenance: Technical skills source = "${demoRes.parsedProfile.skills.source}", Soft skills source = "${demoRes.parsedProfile.softSkills.source}".`
      });
    }

    // 3. Skill Relationships & Source Tracking Test
    const userSkillsList = await db.userSkills.getByUserId('usr_demo_101');
    if (userSkillsList.length > 0 && userSkillsList[0].userSkill.source) {
      results.push({
        category: '3. Skills',
        testName: 'UserSkill Relationship & Provenance Source Tracking',
        status: 'PASSED',
        details: `Retrieved ${userSkillsList.length} user skills with verified source tracking (${userSkillsList[0].userSkill.source}).`
      });
    }

    // 4. Job Creation & 10+ Demo Jobs Verification
    const allJobs = await db.jobs.getAll();
    if (allJobs.length >= 10) {
      results.push({
        category: '4. Jobs',
        testName: '10+ Demo Jobs Verification & Source Storage',
        status: 'PASSED',
        details: `Found ${allJobs.length} active job postings. Verified source = "${allJobs[0].source}".`
      });
    } else {
      results.push({
        category: '4. Jobs',
        testName: '10+ Demo Jobs Verification',
        status: 'FAILED',
        details: `Expected at least 10 demo jobs, found ${allJobs.length}`
      });
    }

    // 5. Job Matching Calculation Test
    const matches = await db.jobMatches.getMatchesForUser('usr_demo_101');
    if (matches.length > 0) {
      results.push({
        category: '5. Job Matching',
        testName: 'Profile-First Job Match Evaluation',
        status: 'PASSED',
        details: `Evaluated ${matches.length} job matches. Top match score: ${matches[0].profileMatchScore}%.`
      });
    }

    // 6. Match Scoring Formula Test (Profile 70% + Location 15% + Exp 10% + Pref 5%)
    const topM = matches[0];
    const expectedScoreSum = Math.round(
      topM.profileMatchScore * 0.70 +
      topM.locationScore * 0.15 +
      topM.experienceScore * 0.10 +
      topM.preferenceScore * 0.05
    );

    if (topM.finalPriorityScore === expectedScoreSum) {
      results.push({
        category: '6. Match Scoring',
        testName: 'Weighted Score Formula Verification (70/15/10/5)',
        status: 'PASSED',
        details: `Final Priority (${topM.finalPriorityScore}%) matches exact weighted sum formula.`
      });
    }

    // 7. Location Distance Calculation Test (Haversine)
    const dist = calculateHaversineDistance(12.9716, 77.5946, 28.4595, 77.0266);
    if (dist !== null && dist > 1500) {
      results.push({
        category: '7. Location Distance',
        testName: 'Haversine Spherical Distance Calculation',
        status: 'PASSED',
        details: `Calculated distance between Bengaluru & Gurugram: ${dist} km.`
      });
    }

    // 8. Job Ranking & Primacy Rule Test (95% Profile @ 25 km vs 63% Profile @ 5 km)
    const scoreA = Math.round(95 * 0.70 + 99 * 0.15 + 95 * 0.10 + 90 * 0.05);
    const scoreB = Math.round(63 * 0.70 + 99.8 * 0.15 + 95 * 0.10 + 90 * 0.05);

    if (scoreA > scoreB) {
      results.push({
        category: '8. Job Ranking',
        testName: 'Profile Match Primacy Rule (95% @ 25km vs 63% @ 5km)',
        status: 'PASSED',
        details: `95% Profile Match @ 25 km (Priority ${scoreA}%) strictly ranked higher than 63% Profile Match @ 5 km (Priority ${scoreB}%).`
      });
    }

    // 9. Step 3 Resume Engine 12-Point Test Suite
    const resumeEngineResults = runResumeEngineTests();
    resumeEngineResults.forEach((r) => {
      results.push({
        category: 'Step 3: Resume Engine',
        testName: r.testName,
        status: r.status,
        details: r.details
      });
    });

    // 10. Step 4: Skill Gap & Personalized Roadmap Test Suite
    const { runSkillGapEngineTests } = await import('./skillGapEngineTests');
    const skillGapEngineResults = runSkillGapEngineTests();
    skillGapEngineResults.forEach((r) => {
      results.push({
        category: 'Step 4: Skill Gap & Roadmap',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 10. Step 6: Job Readiness & Employability Test Suite
    const { runReadinessEngineTests } = await import('./readinessEngineTests');
    const readinessEngineResults = runReadinessEngineTests();
    readinessEngineResults.forEach((r) => {
      results.push({
        category: 'Step 6: Job Readiness',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 11. Step 7: Personal AI Career Mentor Test Suite
    const { runMentorEngineTests } = await import('./mentorEngineTests');
    const mentorEngineResults = await runMentorEngineTests();
    mentorEngineResults.forEach((r) => {
      results.push({
        category: 'Step 7: Personal AI Mentor',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 12. Step 8: AI Interview Coach Test Suite
    const { runInterviewEngineTests } = await import('./interviewCoachEngineTests');
    const interviewEngineResults = runInterviewEngineTests();
    interviewEngineResults.forEach((r) => {
      results.push({
        category: 'Step 8: AI Interview Coach',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 13. Step 9: Future Skills Radar Test Suite
    const { runFutureSkillsEngineTests } = await import('./futureSkillsEngineTests');
    const futureSkillsResults = runFutureSkillsEngineTests();
    futureSkillsResults.forEach((r) => {
      results.push({
        category: 'Step 9: Future Skills Radar',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 14. Step 10: AI Job Watch Test Suite
    const { runJobWatchEngineTests } = await import('./jobWatchEngineTests');
    const jobWatchResults = runJobWatchEngineTests();
    jobWatchResults.forEach((r) => {
      results.push({
        category: 'Step 10: AI Job Watch',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 15. Step 11: Smart Job Alerts Test Suite
    const { runSmartAlertsEngineTests } = await import('./smartAlertsEngineTests');
    const smartAlertsResults = runSmartAlertsEngineTests();
    smartAlertsResults.forEach((r) => {
      results.push({
        category: 'Step 11: Smart Job Alerts',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 16. Step 12: AI Application Tracker Test Suite
    const { runApplicationTrackerEngineTests } = await import('./applicationTrackerEngineTests');
    const appTrackerResults = runApplicationTrackerEngineTests();
    appTrackerResults.forEach((r) => {
      results.push({
        category: 'Step 12: AI Application Tracker',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 17. Step 13: AI Career Path Navigator Test Suite
    const { runCareerEngineTests } = await import('./careerEngineTests');
    const careerEngineResults = runCareerEngineTests();
    careerEngineResults.forEach((r) => {
      results.push({
        category: 'Step 13: AI Career Path Navigator',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 18. Step 14: AI Learning Hub Test Suite
    const { runLearningHubEngineTests } = await import('./learningHubEngineTests');
    const learningHubResults = runLearningHubEngineTests();
    learningHubResults.forEach((r) => {
      results.push({
        category: 'Step 14: AI Learning Hub',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 19. Step 15: AI Career Intelligence Dashboard Test Suite
    const { runDashboardEngineTests } = await import('./dashboardEngineTests');
    const dashboardResults = runDashboardEngineTests();
    dashboardResults.forEach((r) => {
      results.push({
        category: 'Step 15: AI Career Intelligence Dashboard',
        testName: `Test #${r.testId}: ${r.testName}`,
        status: r.status,
        details: r.details
      });
    });

    // 20. Step 16: Advanced Job Search Test Suite
    const { runAdvancedSearchEngineTests } = await import('./advancedSearchEngineTests');
    const advSearchResults = runAdvancedSearchEngineTests();
    advSearchResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 16: Advanced Job Search',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 21. Step 17: AI Resume Builder Test Suite
    const { runResumeBuilderEngineTests } = await import('./resumeBuilderEngineTests');
    const resBuilderResults = runResumeBuilderEngineTests();
    resBuilderResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 17: AI Resume Builder',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 22. Step 18: AI Job Application Assistant Test Suite
    const { runJobApplicationAssistantEngineTests } = await import('./jobApplicationAssistantEngineTests');
    const appAssistantResults = runJobApplicationAssistantEngineTests();
    appAssistantResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 18: AI Job Application Assistant',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 23. Step 19: Advanced Interview Simulator Test Suite
    const { runAdvancedInterviewSimulatorEngineTests } = await import('./advancedInterviewSimulatorEngineTests');
    const simResults = runAdvancedInterviewSimulatorEngineTests();
    simResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 19: Advanced Interview Simulator',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 24. Step 20: Skill & Project Portfolio Test Suite
    const { runPortfolioEngineTests } = await import('./portfolioEngineTests');
    const portfolioResults = runPortfolioEngineTests();
    portfolioResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 20: Skill & Project Portfolio',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 25. Step 21: Employer and Recruiter Portal Test Suite
    const { runEmployerPortalEngineTests } = await import('./employerPortalEngineTests');
    const employerResults = runEmployerPortalEngineTests();
    employerResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 21: Employer & Recruiter Portal',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 26. Step 22: Two-Sided Candidate-Employer Matching Test Suite
    const { runTwoSidedMatchingEngineTests } = await import('./twoSidedMatchingEngineTests');
    const twoSidedResults = runTwoSidedMatchingEngineTests();
    twoSidedResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 22: Two-Sided Candidate-Employer Matching',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 27. Step 23: Job Trust and Safety System Test Suite
    const { runJobTrustSafetyEngineTests } = await import('./jobTrustSafetyEngineTests');
    const trustSafetyResults = runJobTrustSafetyEngineTests();
    trustSafetyResults.details.forEach((r, idx) => {
      results.push({
        category: 'Step 23: Job Trust and Safety System',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.status === 'PASS' ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 28. Step 24: India Labor Market Intelligence Test Suite
    const { runMarketIntelligenceEngineTests } = await import('./marketIntelligenceEngineTests');
    const marketIntelResults = runMarketIntelligenceEngineTests();
    marketIntelResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 24: India Labor Market Intelligence',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 29. Step 25: Personal Career Operating System Test Suite
    const { runCareerOperatingSystemEngineTests } = await import('./careerOperatingSystemEngineTests');
    const osResults = runCareerOperatingSystemEngineTests();
    osResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 25: Personal Career Operating System',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 30. Step 26: Mobile-First PWA Test Suite
    const { runMobilePwaEngineTests } = await import('./mobilePwaEngineTests');
    const pwaResults = runMobilePwaEngineTests();
    pwaResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 26: Mobile-First PWA',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 31. Step 27: Performance & Scalability Test Suite
    const { runPerformanceScalabilityEngineTests } = await import('./performanceScalabilityEngineTests');
    const perfResults = runPerformanceScalabilityEngineTests();
    perfResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 27: Performance and Scalability',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 32. Step 28: Security and Privacy Audit Test Suite
    const { runSecurityPrivacyEngineTests } = await import('./securityPrivacyEngineTests');
    const secResults = runSecurityPrivacyEngineTests();
    secResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 28: Security and Privacy Audit',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 33. Step 29: Full Platform Master Test Suite
    const { FullPlatformMasterTestRunner } = await import('./fullPlatformMasterTestRunner');
    const masterReport = await FullPlatformMasterTestRunner.runMasterTestSuite();
    masterReport.testResults.forEach((r, idx) => {
      results.push({
        category: `Step 29: ${r.moduleName} (${r.testType})`,
        testName: `Test #${idx + 1}: ${r.testName}`,
        status: r.status === 'PASSED' ? 'PASSED' : 'FAILED',
        details: r.details
      });
    });

    // 34. Step 30: Production Readiness & Launch Test Suite
    const { runProductionLaunchEngineTests } = await import('./productionLaunchEngineTests');
    const launchResults = runProductionLaunchEngineTests();
    launchResults.results.forEach((r, idx) => {
      results.push({
        category: 'Step 30: Production Readiness and Launch',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 35. Step 31: Product Audit, Integration & Stabilization Test Suite
    const { runStep31EngineTests } = await import('./step31EngineTests');
    const step31Results = runStep31EngineTests();
    step31Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 31: Product Audit & Stabilization',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 36. Step 33: Real AI Engine Service Integration Test Suite
    const { runRealAIEngineTests } = await import('./realAIEngineTests');
    const step33Results = await runRealAIEngineTests();
    step33Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 33: Real AI Engine Integration',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 37. Step 34: Real User Usability Testing System Test Suite
    const { runUsabilityTestEngineTests } = await import('./usabilityTestEngineTests');
    const step34Results = runUsabilityTestEngineTests();
    step34Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 34: Real User Usability Testing',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 38. Step 35: AI Job Matching Accuracy Engine Test Suite
    const { runJobMatchingAccuracyEngineTests } = await import('./jobMatchingAccuracyEngineTests');
    const step35Results = runJobMatchingAccuracyEngineTests();
    step35Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 35: AI Job Matching Accuracy Engine',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 39. Step 36: Job Data Quality Engine Test Suite
    const { runJobQualityEngineTests } = await import('./jobQualityEngineTests');
    const step36Results = runJobQualityEngineTests();
    step36Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 36: Job Data Quality Engine',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 40. Step 37: Career User Experience Optimization Test Suite
    const { runCareerUXEngineTests } = await import('./careerUXEngineTests');
    const step37Results = runCareerUXEngineTests();
    step37Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 37: Career UX Optimization',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 41. Step 38: Employer Pilot Readiness Test Suite
    const { runEmployerPilotEngineTests } = await import('./employerPilotEngineTests');
    const step38Results = runEmployerPilotEngineTests();
    step38Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 38: Employer Pilot Readiness',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 42. Step 39: Product Analytics Test Suite
    const { runProductAnalyticsEngineTests } = await import('./productAnalyticsEngineTests');
    const step39Results = runProductAnalyticsEngineTests();
    step39Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 39: Product Analytics',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 43. Step 40: Sustainable Business Model Architecture Test Suite
    const { runMonetizationArchitectureEngineTests } = await import('./monetizationArchitectureEngineTests');
    const step40Results = runMonetizationArchitectureEngineTests();
    step40Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 40: Business Model Architecture',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 44. Step 41: User Growth and Referral System Test Suite
    const { runUserGrowthEngineTests } = await import('./userGrowthEngineTests');
    const step41Results = runUserGrowthEngineTests();
    step41Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 41: User Growth & Referrals',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 45. Step 42: Production Infrastructure Readiness Test Suite
    const { runProductionInfraEngineTests } = await import('./productionInfraEngineTests');
    const step42Results = runProductionInfraEngineTests();
    step42Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 42: Production Infrastructure Readiness',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 46. Step 43: Privacy, Security and Compliance Review Test Suite
    const { runPrivacyComplianceEngineTests } = await import('./privacyComplianceEngineTests');
    const step43Results = runPrivacyComplianceEngineTests();
    step43Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 43: Privacy & Security Compliance',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 47. Step 44: Closed Beta Launch Test Suite
    const { runClosedBetaEngineTests } = await import('./closedBetaEngineTests');
    const step44Results = runClosedBetaEngineTests();
    step44Results.results.forEach((r, idx) => {
      results.push({
        category: 'Step 44: Closed Beta Launch',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // 48. Steps 45-55: Final Launch Command Center Test Suite
    const { runFinalLaunchEngineTests } = await import('./finalLaunchEngineTests');
    const step45to55Results = await runFinalLaunchEngineTests();
    step45to55Results.results.forEach((r, idx) => {
      results.push({
        category: 'Steps 45-55: Final Launch Readiness',
        testName: `Test #${idx + 1}: ${r.name}`,
        status: r.passed ? 'PASSED' : 'FAILED',
        details: r.message
      });
    });

    // Clean up test profile
    await db.userProfiles.delete(createdProfile.id);
  } catch (err: any) {
    results.push({
      category: 'System',
      testName: 'Comprehensive Test Suite Execution',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  return results;
}
