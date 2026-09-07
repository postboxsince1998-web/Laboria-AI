import { SoftSkillsCoachService } from './softSkillsCoachService';
import { mockCandidate } from './mockData';

export interface SoftSkillsTestResult {
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runSoftSkillsEngineTests(): SoftSkillsTestResult[] {
  const results: SoftSkillsTestResult[] = [];

  const sampleInput = `Hi recruiter, I saw your opening for Senior Full Stack Engineer. I have 4 years of experience building React and Node.js applications at TechNovation Labs. I am interested in applying.`;

  const evaluation = SoftSkillsCoachService.evaluateSampleText(sampleInput, mockCandidate);

  // Test 1: 10 Evaluated Areas Coverage
  if (evaluation.evaluatedAreas.length === 10) {
    const areaNames = evaluation.evaluatedAreas.map((a) => a.areaName).join(', ');
    results.push({
      testName: '10 Soft Skill Evaluation Areas Coverage',
      status: 'PASSED',
      details: `Evaluated all 10 areas: ${areaNames}`
    });
  } else {
    results.push({
      testName: '10 Soft Skill Evaluation Areas Coverage',
      status: 'FAILED',
      details: `Expected 10 areas, got ${evaluation.evaluatedAreas.length}`
    });
  }

  // Test 2: Strict Constructive Phrasing Rule (No Negative Labels)
  const combinedFeedback = [
    ...evaluation.strengthsHighlight,
    ...evaluation.constructiveRefinements
  ].join(' ').toLowerCase();

  const prohibitedNegativeLabels = ['poor', 'bad', 'terrible', 'failing', 'horrible', 'inferior'];
  const hasNegativeLabel = prohibitedNegativeLabels.some((label) => combinedFeedback.includes(label));

  if (!hasNegativeLabel) {
    results.push({
      testName: 'Strict Constructive Phrasing Rule (Zero Negative Labels Used)',
      status: 'PASSED',
      details: 'All evaluation feedback uses encouraging, constructive language focusing on strengths first.'
    });
  } else {
    results.push({
      testName: 'Strict Constructive Phrasing Rule',
      status: 'FAILED',
      details: 'Feedback contained prohibited negative labels.'
    });
  }

  // Test 3: 4-Week Soft Skills Improvement Plan Generation
  if (evaluation.fourWeekPlan.length === 4) {
    results.push({
      testName: '4-Week Soft Skills Improvement Plan Generation',
      status: 'PASSED',
      details: `Generated complete 4-week roadmap: ${evaluation.fourWeekPlan.map((w) => `Week ${w.week}: ${w.focusArea}`).join(' | ')}`
    });
  } else {
    results.push({
      testName: '4-Week Soft Skills Improvement Plan Generation',
      status: 'FAILED',
      details: `Expected 4 weekly steps, got ${evaluation.fourWeekPlan.length}`
    });
  }

  return results;
}
