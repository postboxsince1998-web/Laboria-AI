import { CandidateProfile } from '../types';

export interface SoftSkillDimensionResult {
  areaName: string;
  key: string;
  score: number; // 0 to 100
  status: 'Strong' | 'Highly Capable' | 'Refinement Opportunity';
  positiveInsight: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  category: string;
  duration: string;
  objective: string;
  guidedPrompt: string;
  sampleModelAnswer: string;
}

export interface WeeklyPlanStep {
  week: number;
  focusArea: string;
  goal: string;
  recommendedAction: string;
  targetExerciseId: string;
}

export interface SoftSkillsEvaluationOutput {
  overallCommunicationScore: number;
  toneAssessment: string;
  evaluatedAreas: SoftSkillDimensionResult[];
  strengthsHighlight: string[];
  constructiveRefinements: string[];
  targetedExercises: PracticeExercise[];
  fourWeekPlan: WeeklyPlanStep[];
}

export class SoftSkillsCoachService {
  public static evaluateSampleText(
    inputText: string,
    _candidate?: CandidateProfile
  ): SoftSkillsEvaluationOutput {
    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

    // Evaluated 10 Soft Skill Areas
    const evaluatedAreas: SoftSkillDimensionResult[] = [
      { areaName: 'Communication', key: 'communication', score: wordCount > 20 ? 84 : 70, status: 'Strong', positiveInsight: 'Clear expression of intent and core professional background.' },
      { areaName: 'Clarity', key: 'clarity', score: wordCount > 25 ? 86 : 72, status: 'Strong', positiveInsight: 'Ideas are expressed directly with minimal filler phrasing.' },
      { areaName: 'Professional Language', key: 'profLanguage', score: 88, status: 'Strong', positiveInsight: 'Uses respectful, formal industry terminology.' },
      { areaName: 'Answer Structure (STAR)', key: 'answerStructure', score: 76, status: 'Refinement Opportunity', positiveInsight: 'Logical progression. Framing with Situation-Task-Action-Result will increase impact.' },
      { areaName: 'Teamwork', key: 'teamwork', score: 82, status: 'Highly Capable', positiveInsight: 'Highlights cross-functional collaboration and joint ownership.' },
      { areaName: 'Problem Solving', key: 'probSolving', score: 85, status: 'Strong', positiveInsight: 'Demonstrates analytical mindset when approaching technical challenges.' },
      { areaName: 'Leadership', key: 'leadership', score: 78, status: 'Highly Capable', positiveInsight: 'Conveys initiative, mentorship, and willingness to author RFCs.' },
      { areaName: 'Adaptability', key: 'adaptability', score: 80, status: 'Highly Capable', positiveInsight: 'Flexible posture toward evolving requirements and remote async workflows.' },
      { areaName: 'Professional Behavior', key: 'behavior', score: 90, status: 'Strong', positiveInsight: 'Exhibits high courtesy, active listening tone, and reliability.' },
      { areaName: 'Critical Thinking', key: 'critThinking', score: 83, status: 'Strong', positiveInsight: 'Evaluates trade-offs thoughtfully before reaching technical conclusions.' }
    ];

    const overallCommunicationScore = Math.round(
      evaluatedAreas.reduce((acc, curr) => acc + curr.score, 0) / evaluatedAreas.length
    );

    // Strictly Constructive Phrasing (Never Labeling Negatively)
    const strengthsHighlight = [
      'Your technical background is communicated with high confidence and authority.',
      'Professional behavior and polite closing tone establish immediate recruiter rapport.',
      'Clear demonstration of problem-solving capabilities and engineering initiative.'
    ];

    const constructiveRefinements = [
      'Your answers are clear; adding specific quantifiable metrics (e.g. "reduced latency by 40%") will maximize impact.',
      'Your technical knowledge is strong. Structuring responses using the STAR framework will make complex projects easier for recruiters to follow.',
      'Closing your outreach with a specific date and time availability will boost recruiter response rates.'
    ];

    // Targeted Practice Exercises
    const targetedExercises: PracticeExercise[] = [
      {
        id: 'ex_1',
        title: '2-Minute Elevator Pitch Builder',
        category: 'Communication & Clarity',
        duration: '15 Mins',
        objective: 'Formulate a crisp 2-minute introduction covering your background, core strengths, and target role goals.',
        guidedPrompt: 'Draft an intro stating: 1) Who you are, 2) Your top 2 technical strengths, 3) Key project metric, 4) Target role focus.',
        sampleModelAnswer: '"Hi, I am a Software Professional specializing in web applications and data systems. Recently, I built high-performance APIs reducing latency by 40%. I am looking to bring my technical expertise to a high-growth engineering role."'
      },
      {
        id: 'ex_2',
        title: 'STAR Method Behavioral Response Structuring',
        category: 'Answer Structure & Problem Solving',
        duration: '20 Mins',
        objective: 'Structure answers to behavioral questions cleanly into Situation, Task, Action, and Result.',
        guidedPrompt: 'Describe a technical disagreement with a Product Manager using the STAR framework.',
        sampleModelAnswer: '"SITUATION: We faced a tight investor demo deadline for real-time collaboration. TASK: Deliver core functionality without technical debt. ACTION: I proposed a phased MVP launch with optimistic offline UI followed by full WebSockets. RESULT: Delivered on time with zero downtime."'
      },
      {
        id: 'ex_3',
        title: 'High-Impact Recruiter Cold Outreach Email',
        category: 'Professional Language & Behavior',
        duration: '10 Mins',
        objective: 'Draft a direct, highly engaging outreach note to tech recruiters on LinkedIn.',
        guidedPrompt: 'Write a 3-paragraph cold email for a Senior Frontend position.',
        sampleModelAnswer: '"Hi Sarah, I noticed your opening for Senior Frontend Developer at HyperScale AI. With 4 years experience in React, TypeScript, and micro-frontends, I recently reduced page load time by 58%. I would love to connect for 10 minutes this Thursday at 2 PM."'
      }
    ];

    // 4-Week Soft Skills Improvement Plan
    const fourWeekPlan: WeeklyPlanStep[] = [
      {
        week: 1,
        focusArea: 'Clarity & Concise Messaging',
        goal: 'Eliminate conversational filler words and lead with quantifiable project metrics.',
        recommendedAction: 'Complete the 2-Minute Elevator Pitch exercise and record 3 practice runs.',
        targetExerciseId: 'ex_1'
      },
      {
        week: 2,
        focusArea: 'STAR Method Mastery',
        goal: 'Format all technical interview answers into Situation, Task, Action, and Result.',
        recommendedAction: 'Practice 3 behavioral scenarios using the STAR Structuring guide.',
        targetExerciseId: 'ex_2'
      },
      {
        week: 3,
        focusArea: 'Recruiter Outreach Optimization',
        goal: 'Increase cold outreach callback rates by refining professional outreach tone.',
        recommendedAction: 'Draft and evaluate 2 recruiter outreach emails in Soft Skills Coach.',
        targetExerciseId: 'ex_3'
      },
      {
        week: 4,
        focusArea: 'Executive Presence & Leadership Phrasing',
        goal: 'Convey engineering leadership, trade-off evaluation, and team mentorship capabilities.',
        recommendedAction: 'Participate in a mock system design interview focusing on RFC trade-offs.',
        targetExerciseId: 'ex_2'
      }
    ];

    return {
      overallCommunicationScore,
      toneAssessment: 'Professional, Confident, and Direct',
      evaluatedAreas,
      strengthsHighlight,
      constructiveRefinements,
      targetedExercises,
      fourWeekPlan
    };
  }
}
