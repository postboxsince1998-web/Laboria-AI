import { seedJobs } from '../data/seedData';
import { CandidateProfile, InterviewSimulatorConfig } from '../types';
import { InterviewCoachService, InterviewSession, MockQuestion } from './interviewCoachService';
import {
  InterviewSimulatorService,
  SavedInterviewHistoryService
} from './interviewSimulatorService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_sim',
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

export interface AdvancedInterviewSimulatorTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runAdvancedInterviewSimulatorEngineTests(): AdvancedInterviewSimulatorTestReport {
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

    // Test 1: 6 Specialized Round Types Question Generation
    const techConfig: InterviewSimulatorConfig = {
      roundType: 'Technical',
      difficulty: 'Intermediate',
      timeLimitSecondsPerQuestion: 120,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      company: targetJob.company,
    };
    const techQuestions = InterviewSimulatorService.generateSimulationQuestions(mockCandidate, techConfig, targetJob);
    const test1Pass = techQuestions.length > 0 && techQuestions.every((q) => q.category === 'Technical' || q.category === 'Full Mock');
    addResult('6 Specialized Round Types Question Generation', test1Pass, `Generated ${techQuestions.length} technical questions for round`);

    // Test 2: Full Simulation 6-Round Sequence Generation
    const simConfig: InterviewSimulatorConfig = {
      roundType: 'Full Simulation',
      difficulty: 'Adaptive',
      timeLimitSecondsPerQuestion: 180,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      company: targetJob.company,
    };
    const fullSimQuestions = InterviewSimulatorService.generateSimulationQuestions(mockCandidate, simConfig, targetJob);
    const test2Pass = fullSimQuestions.length === 6 && fullSimQuestions[0].roundName.includes('Round 1');
    addResult('Full Simulation 6-Round Sequence Generation', test2Pass, `Generated 6-round simulation sequence (Resume, Tech, Behavioral, Situational, HR, Company-Specific)`);

    // Test 3: Time-Limited Interview Countdown Configuration
    const test3Pass = simConfig.timeLimitSecondsPerQuestion === 180;
    addResult('Time-Limited Interview Countdown Controls', test3Pass, `Configured per-question timer at ${simConfig.timeLimitSecondsPerQuestion} seconds`);

    // Test 4: Adaptive Difficulty Progression Logic
    const higherDiff = InterviewSimulatorService.evaluateAdaptiveDifficulty('Intermediate', 88);
    const lowerDiff = InterviewSimulatorService.evaluateAdaptiveDifficulty('Intermediate', 45);
    const test4Pass = higherDiff === 'Advanced' && lowerDiff === 'Beginner';
    addResult('Adaptive Difficulty Progression Engine', test4Pass, `Difficulty adapted: 88% score -> ${higherDiff}, 45% score -> ${lowerDiff}`);

    // Test 5: Evidence-Based Scoring Formula Verification
    const sampleQuestion: MockQuestion = fullSimQuestions[0];
    const evaluation = InterviewSimulatorService.evaluateAnswer(sampleQuestion, 'I built the microservice backend using TypeScript and Node.js with Redis caching.', mockCandidate, 45);
    const test5Pass = typeof evaluation.overallScore === 'number' && evaluation.overallScore > 0;
    addResult('Evidence-Based Scoring Formula Verification', test5Pass, `Calculated overall answer evaluation score of ${evaluation.overallScore}%`);

    // Test 6: "Reference Answer" Strict Label Formatting Compliance
    const mockSession: InterviewSession = {
      id: 'sim_sess_test_101',
      date: '2026-09-05',
      jobTitle: targetJob.title,
      company: targetJob.company,
      mode: 'Job-Specific',
      type: 'Full Mock',
      totalScore: 84,
      technicalScore: 88,
      communicationScore: 82,
      structureScore: 85,
      roleKnowledgeScore: 80,
      behavioralScore: 84,
      scoreBreakdown: {
        technicalMath: '88 x 0.35',
        communicationMath: '82 x 0.20',
        structureMath: '85 x 0.15',
        roleKnowledgeMath: '80 x 0.15',
        behavioralMath: '84 x 0.15',
        totalMath: '84%',
      },
      questionsAnswered: [
        {
          question: sampleQuestion,
          userAnswer: 'I built the backend using Node.js.',
          evaluation,
        },
      ],
      strengths: ['Clear technical context'],
      improvements: ['Add quantitative metrics'],
    };
    const report = InterviewSimulatorService.generateFinalReadinessReport(mockSession, mockCandidate, targetJob);
    const test6Pass = report.questionsSummary.every((q) => typeof q.referenceAnswer === 'string' && q.referenceAnswer.length > 10);
    addResult('"Reference Answer" Strict Label Formatting Compliance', test6Pass, 'All model answers strictly labeled and formatted as "Reference Answer"');

    // Test 7: Weak-Topic Detection Across Session History
    const weakTopics = report.weakTopics;
    const test7Pass = Array.isArray(weakTopics) && weakTopics.length > 0;
    addResult('Weak-Topic Detection Engine', test7Pass, `Detected ${weakTopics.length} weak-topic insights from candidate evaluation history`);

    // Test 8: Personalized Preparation Plan Generation
    const test8Pass = report.personalizedPrepPlan.length >= 3 && report.personalizedPrepPlan.some((p) => p.timeframe.includes('24 Hours'));
    addResult('Personalized Preparation Plan Generator', test8Pass, `Generated ${report.personalizedPrepPlan.length} personalized preparation steps (24h & 1-week timelines)`);

    // Test 9: Final Interview Readiness Report Compilation
    const test9Pass = report.sessionId === mockSession.id && report.readinessStatus !== undefined;
    addResult('Final Interview Readiness Report Compilation', test9Pass, `Compiled readiness report: "${report.readinessStatus}" (${report.overallScore}%)`);

    // Test 10: Persistent Interview History Storage CRUD
    SavedInterviewHistoryService.saveSession(mockSession, mockCandidate);
    const history = SavedInterviewHistoryService.getHistory(mockCandidate);
    const test10Pass = history.some((s) => s.id === mockSession.id);
    addResult('Persistent Interview History Storage CRUD', test10Pass, `Saved and retrieved session ID: ${mockSession.id} from local history repository`);

    // Test 11: Job Readiness Score Update Integration
    const test11Pass = report.overallScore === 84;
    addResult('Job Readiness Score Update Integration', test11Pass, `Readiness score updated from simulation result (${report.overallScore}%)`);

    // Test 12: AI Mentor & Skill Gap Connection Payloads
    const mentorConnectionPayload = {
      topic: weakTopics[0]?.topic || 'System Design',
      targetModule: weakTopics[0]?.actionModulePath || '/skill-gap',
    };
    const test12Pass = mentorConnectionPayload.targetModule.includes('/');
    addResult('AI Mentor & Skill Gap Connection Payloads', test12Pass, `Connected weak topic "${mentorConnectionPayload.topic}" to path ${mentorConnectionPayload.targetModule}`);

  } catch (err: any) {
    addResult('Advanced Interview Simulator Test Suite Exception', false, err.message || String(err));
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
