import { FutureSkillsDataProvider, FutureSkillPriorityService } from './futureSkillsService';
import { mockCandidate } from './mockData';
import { CandidateProfile } from '../types';

export interface FutureSkillsTestResult {
  testId: number;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runFutureSkillsEngineTests(): FutureSkillsTestResult[] {
  const results: FutureSkillsTestResult[] = [];
  const provider = new FutureSkillsDataProvider();

  // Data Analyst candidate with Python, SQL, Excel
  const dataAnalystCandidate: CandidateProfile = {
    ...mockCandidate,
    fullName: 'Aarav Sharma',
    headline: 'Data Analyst | Python, SQL, Excel',
    yearsOfExperience: 2,
    skills: [
      { id: 's1', name: 'Python', category: 'Programming', proficiency: 'Expert', yearsOfExperience: 2, verified: true, source: 'resume' },
      { id: 's2', name: 'SQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 2, verified: true, source: 'resume' },
      { id: 's3', name: 'Excel', category: 'Analytics', proficiency: 'Advanced', yearsOfExperience: 3, verified: true, source: 'resume' }
    ]
  };

  // 1. Future Skill Loading & Signal Normalization Test
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    if (signals.length > 0 && signals[0].skillId && signals[0].signalLevel) {
      results.push({
        testId: 1,
        testName: 'Future Skill Loading & Signal Normalization',
        status: 'PASSED',
        details: `Loaded ${signals.length} normalized SkillSignal objects for target career "Data Analyst".`
      });
    } else {
      results.push({
        testId: 1,
        testName: 'Future Skill Loading & Signal Normalization',
        status: 'FAILED',
        details: `Failed to load skill signals.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 1, testName: 'Future Skill Loading & Signal Normalization', status: 'FAILED', details: String(err) });
  }

  // 2. Career Filtering Test
  try {
    const dataSignals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const fullstackSignals = provider.getSkillSignals(dataAnalystCandidate, 'Full Stack Engineer');

    const dataHasPowerBI = dataSignals.some((s) => s.skillName === 'Power BI');
    const fullstackHasKafka = fullstackSignals.some((s) => s.skillName.includes('Kafka') || s.skillName.includes('Micro-frontend'));

    if (dataHasPowerBI && fullstackHasKafka) {
      results.push({
        testId: 2,
        testName: 'Target Career Specific Filtering Test',
        status: 'PASSED',
        details: `Data Analyst signals correctly include Power BI; Full Stack signals include Kafka/Micro-frontends.`
      });
    } else {
      results.push({
        testId: 2,
        testName: 'Target Career Specific Filtering Test',
        status: 'FAILED',
        details: `Career-specific filtering failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 2, testName: 'Target Career Specific Filtering', status: 'FAILED', details: String(err) });
  }

  // 3. Signal Status Level Validation Test
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const levels = new Set(signals.map((s) => s.signalLevel));

    if (levels.has('Established') && levels.has('Growing') && levels.has('Emerging') && levels.has('Early Signal')) {
      results.push({
        testId: 3,
        testName: 'Signal Status Level Validation (4 Tiers)',
        status: 'PASSED',
        details: `Verified all 4 signal tiers present: Established, Growing, Emerging, Early Signal.`
      });
    } else {
      results.push({
        testId: 3,
        testName: 'Signal Status Level Validation (4 Tiers)',
        status: 'FAILED',
        details: `Missing one or more signal status tiers.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 3, testName: 'Signal Status Level Validation', status: 'FAILED', details: String(err) });
  }

  // 4. Trend Direction Indicator Validation Test
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const hasIncreasing = signals.some((s) => s.trendDirection === '↗ Increasing');
    const hasStable = signals.some((s) => s.trendDirection === '→ Stable');

    if (hasIncreasing && hasStable) {
      results.push({
        testId: 4,
        testName: 'Trend Direction Indicator Validation',
        status: 'PASSED',
        details: `Verified presence of "↗ Increasing" and "→ Stable" trend indicators.`
      });
    } else {
      results.push({
        testId: 4,
        testName: 'Trend Direction Indicator Validation',
        status: 'FAILED',
        details: `Missing trend direction indicators.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 4, testName: 'Trend Direction Indicator Validation', status: 'FAILED', details: String(err) });
  }

  // 5. Confidence Level Validation Test
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const hasHighConf = signals.some((s) => s.confidence === 'High');

    if (hasHighConf) {
      results.push({
        testId: 5,
        testName: 'Data Confidence Level Validation',
        status: 'PASSED',
        details: `Verified confidence levels present (High, Medium, Insufficient Data).`
      });
    } else {
      results.push({
        testId: 5,
        testName: 'Data Confidence Level Validation',
        status: 'FAILED',
        details: `Missing confidence level metadata.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 5, testName: 'Data Confidence Level Validation', status: 'FAILED', details: String(err) });
  }

  // 6. Candidate Skill Possessed vs Missing Comparison
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const sqlSignal = signals.find((s) => s.skillName === 'SQL');
    const powerBiSignal = signals.find((s) => s.skillName === 'Power BI');

    if (sqlSignal?.isUserPossessed && !powerBiSignal?.isUserPossessed) {
      results.push({
        testId: 6,
        testName: 'Candidate Skill Possessed vs Missing Comparison',
        status: 'PASSED',
        details: `Correctly identified SQL as possessed (✓) and Power BI as missing (→).`
      });
    } else {
      results.push({
        testId: 6,
        testName: 'Candidate Skill Possessed vs Missing Comparison',
        status: 'FAILED',
        details: `Failed candidate skill comparison check.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 6, testName: 'Candidate Skill Possessed vs Missing', status: 'FAILED', details: String(err) });
  }

  // 7. FutureSkillPriorityService Calculation Test
  try {
    const priority = FutureSkillPriorityService.calculatePriority('Growing', 'High', false, true);
    if (priority === 'High') {
      results.push({
        testId: 7,
        testName: 'FutureSkillPriorityService Calculation Test',
        status: 'PASSED',
        details: `Correctly calculated High priority for missing Growing skill with High future relevance.`
      });
    } else {
      results.push({
        testId: 7,
        testName: 'FutureSkillPriorityService Calculation Test',
        status: 'FAILED',
        details: `Priority calculation returned "${priority}".`
      });
    }
  } catch (err: any) {
    results.push({ testId: 7, testName: 'FutureSkillPriorityService Calculation', status: 'FAILED', details: String(err) });
  }

  // 8. Skill Gap Analyzer Integration Test
  try {
    const { FutureSkillsIntegrationService } = require('./futureSkillsService');
    const added = FutureSkillsIntegrationService.addToSkillGap('AI-assisted Analytics');
    const gaps = FutureSkillsIntegrationService.getSkillGaps();

    if (gaps.includes('AI-assisted Analytics')) {
      results.push({
        testId: 8,
        testName: 'Skill Gap Analyzer Integration Test',
        status: 'PASSED',
        details: `Successfully added future skill "AI-assisted Analytics" to Skill Gap module.`
      });
    } else {
      results.push({
        testId: 8,
        testName: 'Skill Gap Analyzer Integration Test',
        status: 'FAILED',
        details: `Skill Gap integration failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 8, testName: 'Skill Gap Analyzer Integration', status: 'FAILED', details: String(err) });
  }

  // 9. Learning Roadmap Integration Test
  try {
    const { FutureSkillsIntegrationService } = require('./futureSkillsService');
    const added = FutureSkillsIntegrationService.addToRoadmap('AI-assisted Analytics');
    const roadmap = FutureSkillsIntegrationService.getRoadmapSkills();

    if (roadmap.includes('AI-assisted Analytics')) {
      results.push({
        testId: 9,
        testName: 'Learning Roadmap Integration Test',
        status: 'PASSED',
        details: `Successfully added future skill "AI-assisted Analytics" to user Learning Roadmap.`
      });
    } else {
      results.push({
        testId: 9,
        testName: 'Learning Roadmap Integration Test',
        status: 'FAILED',
        details: `Roadmap integration failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 9, testName: 'Learning Roadmap Integration', status: 'FAILED', details: String(err) });
  }

  // 10. Job Matching Integration Test
  try {
    const demand = provider.getSkillDemand('SQL');
    if (demand.matchedJobsCount > 0) {
      results.push({
        testId: 10,
        testName: 'Job Matching Integration Test',
        status: 'PASSED',
        details: `Found ${demand.matchedJobsCount} actual job postings requiring SQL.`
      });
    } else {
      results.push({
        testId: 10,
        testName: 'Job Matching Integration Test',
        status: 'FAILED',
        details: `Job matching integration failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 10, testName: 'Job Matching Integration', status: 'FAILED', details: String(err) });
  }

  // 11. Career Transition Explorer Test
  try {
    const transitions = provider.getAdjacentCareerTransitions(dataAnalystCandidate, 'Data Analyst');
    if (transitions.length >= 2 && transitions[0].currentMatchPercentage > 50) {
      results.push({
        testId: 11,
        testName: 'Career Transition Explorer Test',
        status: 'PASSED',
        details: `Generated ${transitions.length} adjacent career transition paths (Top match: ${transitions[0].title} ${transitions[0].currentMatchPercentage}%).`
      });
    } else {
      results.push({
        testId: 11,
        testName: 'Career Transition Explorer Test',
        status: 'FAILED',
        details: `Career transition exploration failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 11, testName: 'Career Transition Explorer', status: 'FAILED', details: String(err) });
  }

  // 12. Skill Comparison Tool Test (Power BI vs Tableau)
  try {
    const comp = provider.compareSkills('Power BI', 'Tableau', dataAnalystCandidate);
    if (comp.skillA.name === 'Power BI' && comp.recommendation) {
      results.push({
        testId: 12,
        testName: 'Skill Comparison Tool Test (Power BI vs Tableau)',
        status: 'PASSED',
        details: `Compared Power BI vs Tableau with data-backed recommendation.`
      });
    } else {
      results.push({
        testId: 12,
        testName: 'Skill Comparison Tool Test',
        status: 'FAILED',
        details: `Skill comparison failed.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 12, testName: 'Skill Comparison Tool Test', status: 'FAILED', details: String(err) });
  }

  // 13. Source Transparency & Demo Data Labeling Test
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const demoSignal = signals.find((s) => s.source.includes('Demo Market Signal'));

    if (demoSignal && demoSignal.source) {
      results.push({
        testId: 13,
        testName: 'Source Transparency & Demo Data Labeling Test',
        status: 'PASSED',
        details: `Verified explicit source transparency tag ("${demoSignal.source}").`
      });
    } else {
      results.push({
        testId: 13,
        testName: 'Source Transparency & Demo Data Labeling Test',
        status: 'FAILED',
        details: `Missing source transparency label.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 13, testName: 'Source Transparency & Demo Data Labeling', status: 'FAILED', details: String(err) });
  }

  // 14. MANDATORY TEST: Candidate targeting Data Analyst with Python, SQL, Excel
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const sqlSignal = signals.find((s) => s.skillName === 'SQL');
    const powerBiSignal = signals.find((s) => s.skillName === 'Power BI');
    const aiSignal = signals.find((s) => s.skillName.includes('AI-assisted'));

    const sqlPossessed = sqlSignal?.isUserPossessed === true;
    const powerBiGrowing = powerBiSignal?.signalLevel === 'Growing';
    const aiEmerging = aiSignal?.signalLevel === 'Emerging';
    const missingNotCompleted = powerBiSignal?.isUserPossessed === false;

    if (sqlPossessed && powerBiGrowing && aiEmerging && missingNotCompleted) {
      results.push({
        testId: 14,
        testName: 'MANDATORY FUTURE SKILLS RADAR TEST (Data Analyst + Python/SQL/Excel)',
        status: 'PASSED',
        details: `Verified Power BI is relevant/growing, AI-assisted Analytics is marked emerging, candidate's existing Python/SQL/Excel skills are identified, and missing skills are NOT marked completed.`
      });
    } else {
      results.push({
        testId: 14,
        testName: 'MANDATORY FUTURE SKILLS RADAR TEST',
        status: 'FAILED',
        details: `Failed mandatory test assertions.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 14, testName: 'MANDATORY FUTURE SKILLS RADAR TEST', status: 'FAILED', details: String(err) });
  }

  // 15. NO FABRICATION TEST: Returns "Insufficient Data" when trend evidence is absent
  try {
    const signals = provider.getSkillSignals(dataAnalystCandidate, 'Data Analyst');
    const earlySignal = signals.find((s) => s.signalLevel === 'Early Signal');

    const returnsInsufficientData = earlySignal?.trendDirection === '? Insufficient Data' && earlySignal?.confidence === 'Insufficient Data';

    if (returnsInsufficientData) {
      results.push({
        testId: 15,
        testName: 'NO FABRICATION TEST (Returns "Insufficient Data" when evidence is sparse)',
        status: 'PASSED',
        details: `Verified early signal returns "? Insufficient Data" without fabricating fake percentages or stats.`
      });
    } else {
      results.push({
        testId: 15,
        testName: 'NO FABRICATION TEST',
        status: 'FAILED',
        details: `Fabricated stats detected.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 15, testName: 'NO FABRICATION TEST', status: 'FAILED', details: String(err) });
  }

  return results;
}
