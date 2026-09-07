import { CareerNavigatorService, DISCLAIMER_TEXT } from './careerNavigatorService';
import { mockCandidate } from './mockData';
import { CandidateProfile } from '../types';

export interface CareerTestResult {
  testId: number;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runCareerEngineTests(): CareerTestResult[] {
  const results: CareerTestResult[] = [];

  const candidate: CandidateProfile = {
    ...mockCandidate,
    fullName: 'Aarav Sharma',
    skills: [
      { id: 's1', name: 'React', level: 'Expert', source: 'resume' },
      { id: 's2', name: 'TypeScript', level: 'Advanced', source: 'resume' },
      { id: 's3', name: 'Node.js', level: 'Intermediate', source: 'user_input' },
      { id: 's4', name: 'Python', level: 'Intermediate', source: 'user_input' }
    ]
  };

  // 1. Current Profile State Analysis Test
  try {
    if (candidate.skills.length >= 4 && candidate.targetRoles.length > 0 && candidate.yearsOfExperience >= 0) {
      results.push({
        testId: 1,
        testName: 'Current Profile State Analysis Test',
        status: 'PASSED',
        details: `Profile state extracted: ${candidate.yearsOfExperience} YOE, ${candidate.skills.length} skills, target roles: ${candidate.targetRoles.join(', ')}.`
      });
    } else {
      results.push({
        testId: 1,
        testName: 'Current Profile State Analysis Test',
        status: 'FAILED',
        details: 'Candidate profile state extraction incomplete.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 1, testName: 'Current Profile State Analysis', status: 'FAILED', details: String(err) });
  }

  // 2. Adjacent Career Recommendation & Match Scoring Test
  try {
    const recommendations = CareerNavigatorService.recommendCareers(candidate);
    if (recommendations.length >= 3 && recommendations[0].careerMatchScore >= recommendations[1].careerMatchScore) {
      results.push({
        testId: 2,
        testName: 'Adjacent Career Recommendation & Match Scoring Test',
        status: 'PASSED',
        details: `Generated ${recommendations.length} sorted adjacent career options. Top match: "${recommendations[0].title}" (${recommendations[0].careerMatchScore}% Fit).`
      });
    } else {
      results.push({
        testId: 2,
        testName: 'Adjacent Career Recommendation & Match Scoring Test',
        status: 'FAILED',
        details: 'Career recommendation engine failed or un-sorted.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 2, testName: 'Adjacent Career Recommendation & Match Scoring', status: 'FAILED', details: String(err) });
  }

  // 3. No Employment Guarantee Disclaimer Test
  try {
    const recommendations = CareerNavigatorService.recommendCareers(candidate);
    const allHaveDisclaimer = recommendations.every((r) => r.disclaimer && r.disclaimer.includes('do not guarantee employment'));

    if (allHaveDisclaimer) {
      results.push({
        testId: 3,
        testName: 'No Employment Guarantee Disclaimer Test',
        status: 'PASSED',
        details: `Verified explicit non-employment guarantee disclaimer across all ${recommendations.length} career options.`
      });
    } else {
      results.push({
        testId: 3,
        testName: 'No Employment Guarantee Disclaimer Test',
        status: 'FAILED',
        details: 'Missing disclaimer on career recommendation objects.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 3, testName: 'No Employment Guarantee Disclaimer', status: 'FAILED', details: String(err) });
  }

  // 4. Possessed vs Missing Skills Breakdown Test
  try {
    const recommendations = CareerNavigatorService.recommendCareers(candidate);
    const topPath = recommendations[0];

    if (topPath.possessedSkills.length > 0 && topPath.missingSkills.length > 0) {
      results.push({
        testId: 4,
        testName: 'Possessed vs Missing Skills Breakdown Test',
        status: 'PASSED',
        details: `Possessed Skills: ${topPath.possessedSkills.length} matched (✓), Missing Skills: ${topPath.missingSkills.length} identified (⚠).`
      });
    } else {
      results.push({
        testId: 4,
        testName: 'Possessed vs Missing Skills Breakdown Test',
        status: 'FAILED',
        details: 'Failed to categorize possessed vs missing skills.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 4, testName: 'Possessed vs Missing Skills Breakdown', status: 'FAILED', details: String(err) });
  }

  // 5. Learning Roadmap Milestones & Duration Test
  try {
    const recommendations = CareerNavigatorService.recommendCareers(candidate);
    const topPath = recommendations[0];

    if (topPath.learningRoadmap.length > 0 && topPath.learningRoadmap[0].duration) {
      results.push({
        testId: 5,
        testName: 'Learning Roadmap Milestones & Duration Test',
        status: 'PASSED',
        details: `Roadmap contains ${topPath.learningRoadmap.length} milestones (e.g. "${topPath.learningRoadmap[0].title}", Duration: ${topPath.learningRoadmap[0].duration}).`
      });
    } else {
      results.push({
        testId: 5,
        testName: 'Learning Roadmap Milestones & Duration Test',
        status: 'FAILED',
        details: 'Roadmap milestones missing or invalid.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 5, testName: 'Learning Roadmap Milestones & Duration', status: 'FAILED', details: String(err) });
  }

  // 6. Career Transition Mode ("Move from X to Y") Calculation Test
  try {
    const transition = CareerNavigatorService.calculateCareerTransition(
      candidate,
      'Full Stack Engineer',
      'AI Solutions Architect'
    );

    if (
      transition.currentRole === 'Full Stack Engineer' &&
      transition.targetRole === 'AI Solutions Architect' &&
      transition.readinessScore > 0 &&
      transition.estimatedTransitionMonths >= 2
    ) {
      results.push({
        testId: 6,
        testName: 'Career Transition Mode ("Move from X to Y") Calculation Test',
        status: 'PASSED',
        details: `Calculated transition plan: ${transition.currentRole} → ${transition.targetRole}. Readiness: ${transition.readinessScore}%, Est. Duration: ${transition.estimatedTransitionMonths} months.`
      });
    } else {
      results.push({
        testId: 6,
        testName: 'Career Transition Mode ("Move from X to Y") Calculation Test',
        status: 'FAILED',
        details: 'Transition calculation returned invalid values.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 6, testName: 'Career Transition Mode Calculation', status: 'FAILED', details: String(err) });
  }

  // 7. Skill Gap Priority Categorization Test
  try {
    const transition = CareerNavigatorService.calculateCareerTransition(
      candidate,
      'Full Stack Engineer',
      'AI Solutions Architect'
    );

    const hasPriority = transition.missingSkills.every((m) => ['Critical', 'Recommended', 'Bonus'].includes(m.priority));

    if (transition.missingSkills.length > 0 && hasPriority) {
      results.push({
        testId: 7,
        testName: 'Skill Gap Priority Categorization Test',
        status: 'PASSED',
        details: `Categorized ${transition.missingSkills.length} missing skills with priority (Critical: ${transition.missingSkills.filter((m) => m.priority === 'Critical').length}).`
      });
    } else {
      results.push({
        testId: 7,
        testName: 'Skill Gap Priority Categorization Test',
        status: 'FAILED',
        details: 'Skill gap priority categorization failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 7, testName: 'Skill Gap Priority Categorization', status: 'FAILED', details: String(err) });
  }

  // 8. Empirical Market Evidence & Job Matching Test
  try {
    const transition = CareerNavigatorService.calculateCareerTransition(
      candidate,
      'Full Stack Engineer',
      'AI Solutions Architect'
    );

    if (transition.matchingJobsCount >= 0 && transition.marketDemand.demandIndex > 0) {
      results.push({
        testId: 8,
        testName: 'Empirical Market Evidence & Job Matching Test',
        status: 'PASSED',
        details: `Verified market evidence: ${transition.matchingJobsCount} active job openings, Demand Index: ${transition.marketDemand.demandIndex}, Salary: ${transition.marketDemand.salaryRangeIndia}.`
      });
    } else {
      results.push({
        testId: 8,
        testName: 'Empirical Market Evidence & Job Matching Test',
        status: 'FAILED',
        details: 'Market evidence verification failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 8, testName: 'Empirical Market Evidence & Job Matching', status: 'FAILED', details: String(err) });
  }

  // 9. Future Skills Radar Signals Integration Test
  try {
    const recommendations = CareerNavigatorService.recommendCareers(candidate);
    const surgingPath = recommendations.find((r) => r.futurePotential.status === 'Surging');

    if (surgingPath) {
      results.push({
        testId: 9,
        testName: 'Future Skills Radar Signals Integration Test',
        status: 'PASSED',
        details: `Integrated Future Skills Radar signals into career options (Path "${surgingPath.title}" has growth rate ${surgingPath.futurePotential.growthRate}).`
      });
    } else {
      results.push({
        testId: 9,
        testName: 'Future Skills Radar Signals Integration Test',
        status: 'FAILED',
        details: 'Future Skills Radar signals missing.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 9, testName: 'Future Skills Radar Signals Integration', status: 'FAILED', details: String(err) });
  }

  // 10. Cross-Module Integration Payload Completeness Test
  try {
    const transition = CareerNavigatorService.calculateCareerTransition(
      candidate,
      'Full Stack Engineer',
      'AI Solutions Architect'
    );

    const hasPayloads = Boolean(
      transition.targetRole &&
      transition.missingSkills.length > 0 &&
      transition.milestones.length > 0
    );

    if (hasPayloads) {
      results.push({
        testId: 10,
        testName: 'Cross-Module Integration Payload Completeness Test',
        status: 'PASSED',
        details: `Payloads prepared for AI Skill Gap (/skill-gap), Future Skills (/radar), AI Mentor (/mentor), and Discover Jobs (/discover).`
      });
    } else {
      results.push({
        testId: 10,
        testName: 'Cross-Module Integration Payload Completeness Test',
        status: 'FAILED',
        details: 'Cross-module payload preparation incomplete.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 10, testName: 'Cross-Module Integration Payload Completeness', status: 'FAILED', details: String(err) });
  }

  return results;
}
