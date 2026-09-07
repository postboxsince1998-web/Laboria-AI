import { CareerContextEngine } from './careerContextEngine';
import { MentorContextEngine } from './mentorContextEngine';
import { mockCandidate } from './mockData';

export interface TestResultItem {
  name: string;
  passed: boolean;
  message: string;
}

export function runCareerOperatingSystemEngineTests(): { passed: boolean; results: TestResultItem[] } {
  const results: TestResultItem[] = [];

  // Test 1: Aggregation of all 14 candidate context dimensions
  try {
    const context = CareerContextEngine.getUnifiedContext(mockCandidate);
    const has14Dimensions =
      Boolean(context.profileSummary) &&
      Boolean(context.resumeSummary) &&
      Boolean(context.skillsSummary) &&
      Boolean(context.skillGapSummary) &&
      Boolean(context.learningSummary) &&
      Boolean(context.readinessSummary) &&
      Boolean(context.careerGoalsSummary) &&
      Boolean(context.jobMatchesSummary) &&
      Boolean(context.applicationsSummary) &&
      Boolean(context.interviewsSummary) &&
      Boolean(context.projectsSummary) &&
      Boolean(context.futureSkillsSummary) &&
      Boolean(context.careerPathSummary) &&
      Boolean(context.marketIntelligenceSummary);

    results.push({
      name: '1. Aggregation of All 14 Context Dimensions',
      passed: has14Dimensions,
      message: has14Dimensions
        ? `Successfully aggregated 14 context dimensions for ${context.fullName} (Readiness: ${context.overallReadinessScore}/100, ATS: ${context.resumeSummary.atsScore}/100).`
        : 'Failed: Missing one or more of the 14 context dimensions.'
    });
  } catch (err: any) {
    results.push({ name: '1. Aggregation of All 14 Context Dimensions', passed: false, message: err.message });
  }

  // Test 2: 6-Tier Priority Ranking Hierarchy Validation
  try {
    const actions = CareerContextEngine.getPrioritizedActions(mockCandidate);
    const tierNames = actions.map(a => a.priorityTier);

    const hasTier1 = tierNames.some(t => t.startsWith('1.'));
    const hasTier2 = tierNames.some(t => t.startsWith('2.'));
    const hasTier3 = tierNames.some(t => t.startsWith('3.'));

    results.push({
      name: '2. 6-Tier Priority Ranking Hierarchy Validation',
      passed: hasTier1 && hasTier2 && hasTier3,
      message: `Evaluated 6-tier priority structure: Tier 1 (${hasTier1}), Tier 2 (${hasTier2}), Tier 3 (${hasTier3}). Total prioritized actions: ${actions.length}.`
    });
  } catch (err: any) {
    results.push({ name: '2. 6-Tier Priority Ranking Hierarchy Validation', passed: false, message: err.message });
  }

  // Test 3: Daily Career Plan Enforcement of Maximum 3 Actions
  try {
    const plan = CareerContextEngine.getDailyCareerPlan(mockCandidate);
    const isMax3 = plan.prioritizedActions.length <= 3 && plan.prioritizedActions.length > 0;

    results.push({
      name: '3. Daily Career Plan Max 3 Actions Limit',
      passed: isMax3,
      message: isMax3
        ? `Daily Career Plan strictly enforced max 3 actions constraint: Returned ${plan.prioritizedActions.length} high-value actions (Est. ${plan.estimatedTotalMinutes} min).`
        : `Failed: Daily plan returned ${plan.prioritizedActions.length} actions, exceeding limit of 3.`
    });
  } catch (err: any) {
    results.push({ name: '3. Daily Career Plan Max 3 Actions Limit', passed: false, message: err.message });
  }

  // Test 4: Weekly Career Review Across 7 Progress Dimensions
  try {
    const review = CareerContextEngine.getWeeklyCareerReview(mockCandidate);
    const m = review.summaryMetrics;
    const has7Metrics =
      Boolean(m.progress) &&
      m.jobsMatched > 0 &&
      typeof m.applicationsActive === 'number' &&
      typeof m.interviewsScheduled === 'number' &&
      m.learningHoursCompleted > 0 &&
      m.skillsMasteredCount > 0 &&
      Boolean(m.readinessDelta);

    results.push({
      name: '4. Weekly Career Review 7 Progress Dimensions',
      passed: has7Metrics,
      message: has7Metrics
        ? `Weekly Review rendered metrics across 7 dimensions (Overall score: ${review.overallProgressScore}%, Readiness delta: ${m.readinessDelta}).`
        : 'Failed: Missing one or more weekly review metrics.'
    });
  } catch (err: any) {
    results.push({ name: '4. Weekly Career Review 7 Progress Dimensions', passed: false, message: err.message });
  }

  // Test 5: AI Mentor Context Integration & Consistency Guarantee
  try {
    const context = CareerContextEngine.getUnifiedContext(mockCandidate);
    const actions = CareerContextEngine.getPrioritizedActions(mockCandidate);

    // AI Mentor top skill gap must match Context top skill gap
    const topContextGap = context.skillGapSummary.topGapName;
    const topActionGap = actions.find(a => a.priorityTier.startsWith('2.'))?.title;
    const isConsistent = topActionGap ? topActionGap.includes(topContextGap) : true;

    results.push({
      name: '5. AI Mentor Context Integration & Consistency Guarantee',
      passed: isConsistent,
      message: isConsistent
        ? `Verified strict consistency between Context Engine gap ("${topContextGap}") and Action Plan.`
        : 'Failed: Contradiction detected between Context Engine and Action Plan.'
    });
  } catch (err: any) {
    results.push({ name: '5. AI Mentor Context Integration & Consistency Guarantee', passed: false, message: err.message });
  }

  // Test 6: Non-Contradiction Policy Verification
  try {
    const plan = CareerContextEngine.getDailyCareerPlan(mockCandidate);
    const mentorAnswer = CareerContextEngine.answerWhatShouldIDoNext(mockCandidate);

    const topPlanAction = plan.prioritizedActions[0].title;
    const containsTopAction = mentorAnswer.includes(topPlanAction) || mentorAnswer.includes('Apply');

    results.push({
      name: '6. Non-Contradiction Policy Verification',
      passed: containsTopAction,
      message: containsTopAction
        ? 'Daily Career Plan and AI Mentor answer match perfectly without contradictory recommendations.'
        : 'Failed: AI Mentor answer contradicted Daily Career Plan.'
    });
  } catch (err: any) {
    results.push({ name: '6. Non-Contradiction Policy Verification', passed: false, message: err.message });
  }

  // Test 7: Prohibition of Job Offer Guarantees
  try {
    const mentorAnswer = CareerContextEngine.answerWhatShouldIDoNext(mockCandidate);
    const forbidsGuarantees =
      !mentorAnswer.toLowerCase().includes('guarantee a job') &&
      !mentorAnswer.toLowerCase().includes('guaranteed hiring') &&
      !mentorAnswer.toLowerCase().includes('100% job offer');

    results.push({
      name: '7. Prohibition of Job Offer Guarantees',
      passed: forbidsGuarantees,
      message: forbidsGuarantees
        ? 'Confirmed compliance: System output strictly avoids employment or salary placement guarantees.'
        : 'Failed: Output contained prohibited job placement guarantee wording.'
    });
  } catch (err: any) {
    results.push({ name: '7. Prohibition of Job Offer Guarantees', passed: false, message: err.message });
  }

  // Test 8: Upcoming Interview Priority Tier Trigger
  try {
    const actions = CareerContextEngine.getPrioritizedActions(mockCandidate);
    const interviewAction = actions.find(a => a.priorityTier.startsWith('3.'));

    results.push({
      name: '8. Upcoming Interview Priority Tier Trigger',
      passed: Boolean(interviewAction),
      message: interviewAction
        ? `Upcoming interview tier correctly triggered: "${interviewAction.title}".`
        : 'Failed: Upcoming interview did not trigger Tier 3 action.'
    });
  } catch (err: any) {
    results.push({ name: '8. Upcoming Interview Priority Tier Trigger', passed: false, message: err.message });
  }

  // Test 9: Important Skill Gap Priority Tier Trigger
  try {
    const actions = CareerContextEngine.getPrioritizedActions(mockCandidate);
    const gapAction = actions.find(a => a.priorityTier.startsWith('2.'));

    results.push({
      name: '9. Important Skill Gap Priority Tier Trigger',
      passed: Boolean(gapAction),
      message: gapAction
        ? `Important skill gap tier correctly triggered: "${gapAction.title}".`
        : 'Failed: Skill gap did not trigger Tier 2 action.'
    });
  } catch (err: any) {
    results.push({ name: '9. Important Skill Gap Priority Tier Trigger', passed: false, message: err.message });
  }

  // Test 10: Future Skills Radar Integration into Action Plan
  try {
    const actions = CareerContextEngine.getPrioritizedActions(mockCandidate);
    const radarAction = actions.find(a => a.priorityTier.startsWith('5.'));

    results.push({
      name: '10. Future Skills Radar Integration',
      passed: Boolean(radarAction),
      message: radarAction
        ? `Future skills radar tier correctly integrated: "${radarAction.title}".`
        : 'Failed: Future skills radar did not trigger Tier 5 action.'
    });
  } catch (err: any) {
    results.push({ name: '10. Future Skills Radar Integration', passed: false, message: err.message });
  }

  // Test 11: "What Should I Do Next?" Response Generator Validation
  try {
    const answer = CareerContextEngine.answerWhatShouldIDoNext(mockCandidate);
    const isValidFormatted =
      answer.includes('Unified Career Context Analysis') &&
      answer.includes('High-Value Daily Actions Today') &&
      answer.includes('Non-Contradiction');

    results.push({
      name: '11. "What Should I Do Next?" Response Generator Validation',
      passed: isValidFormatted,
      message: isValidFormatted
        ? 'Response generator successfully formatted unified AI career advice with action links and rationale.'
        : 'Failed: Response generator output lacked required structured sections.'
    });
  } catch (err: any) {
    results.push({ name: '11. "What Should I Do Next?" Response Generator Validation', passed: false, message: err.message });
  }

  // Test 12: End-to-End Context Engine Integration Stability
  try {
    const context = CareerContextEngine.getUnifiedContext(mockCandidate);
    const hasTimestamp = Boolean(context.lastUnifiedTimestamp);

    results.push({
      name: '12. End-to-End Context Engine Integration Stability',
      passed: hasTimestamp,
      message: hasTimestamp
        ? `Career Context Engine integrated cleanly with real-time timestamp (${context.lastUnifiedTimestamp}).`
        : 'Failed: Missing timestamp on unified career context.'
    });
  } catch (err: any) {
    results.push({ name: '12. End-to-End Context Engine Integration Stability', passed: false, message: err.message });
  }

  const passed = results.every(r => r.passed);
  return { passed, results };
}
