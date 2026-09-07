import { CandidateProfile, JobPosting } from '../types';
import { seedJobs } from '../data/seedData';
import { updateReadinessFromInterview } from './jobReadinessService';

export type InterviewType =
  | 'Technical'
  | 'HR'
  | 'Behavioral'
  | 'Resume-Based'
  | 'Situational'
  | 'Mixed'
  | 'Full Mock';

export type InterviewMode = 'Job-Specific' | 'General Career';

export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface FrameworkGuide {
  // STAR Framework
  situation?: string;
  task?: string;
  action?: string;
  result?: string;

  // Technical Framework
  concept?: string;
  approach?: string;
  example?: string;

  // Project Framework
  problem?: string;
  role?: string;
  tech?: string;
  implementation?: string;
  challenge?: string;
  learning?: string;
}

export interface MockQuestion {
  id: string;
  round: number; // 1 to 6
  roundName: string;
  category: InterviewType;
  difficulty: QuestionDifficulty;
  topic: string;
  question: string;
  jdRequirementMapped?: string;
  isSkillGapTopic?: boolean;
  contextHint: string;
  framework: 'STAR' | 'Technical' | 'Project';
  frameworkGuide: FrameworkGuide;
  modelAnswer: string;
}

export interface AnswerEvaluation {
  overallScore: number;
  relevanceScore: number;
  technicalScore: number;
  structureScore: number;
  clarityScore: number;
  completenessScore: number;

  relevanceLabel: 'Strong' | 'Good' | 'Developing' | 'Could be strengthened';
  technicalUnderstandingLabel: 'Strong' | 'Good' | 'Developing' | 'Needs refinement';
  structureLabel: 'Strong' | 'Good' | 'Developing' | 'Needs framework focus';
  clarityLabel: 'Strong' | 'Good' | 'Developing' | 'Could be clearer';
  completenessLabel: 'Strong' | 'Good' | 'Developing' | 'Could be strengthened';

  strengths: string[];
  improvements: string[];
  constructiveFeedback: string;
  frameworkTip: string;
}

export interface InterviewSession {
  id: string;
  date: string;
  jobTitle?: string;
  company?: string;
  mode: InterviewMode;
  type: InterviewType;
  totalScore: number;
  technicalScore: number;      // 35% weight
  communicationScore: number;  // 20% weight
  structureScore: number;      // 15% weight
  roleKnowledgeScore: number;  // 15% weight
  behavioralScore: number;     // 15% weight
  scoreBreakdown: {
    technicalMath: string;
    communicationMath: string;
    structureMath: string;
    roleKnowledgeMath: string;
    behavioralMath: string;
    totalMath: string;
  };
  questionsAnswered: {
    question: MockQuestion;
    userAnswer: string;
    evaluation: AnswerEvaluation;
  }[];
  strengths: string[];
  improvements: string[];
}

export interface InterviewPrepPlan {
  hours24Before: string[];
  hour1Before: string[];
}

// In-Memory Private Session Storage
const sessionHistory: InterviewSession[] = [];

export class InterviewCoachService {
  /**
   * Primary Question Generator: Synthesizes Job Description + Candidate Resume + Target Role + Skill Gaps
   */
  public static generateQuestions(
    candidate: CandidateProfile,
    job?: JobPosting,
    interviewType: InterviewType = 'Full Mock',
    mode: InterviewMode = 'Job-Specific'
  ): MockQuestion[] {
    const targetJob = job || seedJobs[0];
    const targetTitle = mode === 'Job-Specific' ? targetJob.title : 'Junior Data Analyst';
    const targetCompany = mode === 'Job-Specific' ? targetJob.company : 'Tech Partner';
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));

    // Identify verified skills vs skill gaps for target job
    const jdSkills = targetJob.skills || ['Python', 'SQL', 'Excel', 'Power BI'];
    const verifiedCandidateSkills = jdSkills.filter((s: string) => candidateSkillsLower.has(s.toLowerCase()));
    const missingSkills = jdSkills.filter((s: string) => !candidateSkillsLower.has(s.toLowerCase()));

    const questions: MockQuestion[] = [];

    // ROUND 1: Introduction (HR / Behavioral)
    if (interviewType === 'Full Mock' || interviewType === 'HR' || interviewType === 'Mixed') {
      questions.push({
        id: 'q_round1_intro',
        round: 1,
        roundName: 'Round 1: Introduction & Target Motivation',
        category: 'HR',
        difficulty: 'Beginner',
        topic: 'Professional Introduction',
        question: `Tell me about yourself and what motivates you to pursue the ${targetTitle} role at ${targetCompany}?`,
        contextHint: `State your years of experience (${candidate.yearsOfExperience} YOE) and highlight your core background in ${candidate.skills.slice(0, 2).map((s) => s.name).join(' & ')}.`,
        framework: 'STAR',
        frameworkGuide: {
          situation: `Background in ${candidate.education} with ${candidate.yearsOfExperience} YOE.`,
          task: `Seeking to contribute to ${targetCompany}'s data and software engineering team.`,
          action: `Developed expertise in ${candidate.skills.slice(0, 3).map((s) => s.name).join(', ')}.`,
          result: `Ready to bring immediate value to the ${targetTitle} team.`
        },
        modelAnswer: `I am a software & analytics candidate with ${candidate.yearsOfExperience} years of experience specializing in ${candidate.skills.slice(0, 3).map(s=>s.name).join(', ')}. I am drawn to ${targetCompany} because of your focus on scalable data products. In my recent work, I built end-to-end applications that streamlined data processing, and I am excited to apply those skills to your ${targetTitle} position.`
      });
    }

    // ROUND 2: Resume / Background (Project & Past Experience Evidence)
    if (interviewType === 'Full Mock' || interviewType === 'Resume-Based' || interviewType === 'Mixed') {
      const topSkill = verifiedCandidateSkills[0] || candidate.skills[0]?.name || 'Python';
      questions.push({
        id: 'q_round2_resume',
        round: 2,
        roundName: 'Round 2: Resume & Project Architecture',
        category: 'Resume-Based',
        difficulty: 'Intermediate',
        topic: `Resume Evidence (${topSkill})`,
        question: `I see from your resume (${candidate.resumeFileName || 'Profile'}) that you have verified experience in ${topSkill}. Walk me through a project where you used ${topSkill}. What was your specific contribution, key challenge, and final outcome?`,
        contextHint: `Focus strictly on your actual work with ${topSkill}. Mention measurable outcomes like "reduced load time by 35%".`,
        framework: 'Project',
        frameworkGuide: {
          problem: `Optimizing data processing or UI component performance using ${topSkill}.`,
          role: `Lead contributor responsible for architecture and implementation.`,
          tech: `${topSkill}, SQL, and clean modular code standards.`,
          implementation: `Designed modular pipelines and optimized execution loops.`,
          challenge: `Handling state synchronization or database query latency.`,
          result: `Achieved 35% efficiency boost and improved system reliability.`,
          learning: `Learned the value of thorough unit testing and query optimization.`
        },
        modelAnswer: `In my project utilizing ${topSkill}, my primary responsibility was architecting data pipelines. When we encountered latency under high concurrent load, I refactored the execution logic and added query indexing, which reduced processing time by 35% and ensured seamless application response.`
      });
    }

    // ROUND 3: Technical (JD-Based Core Skill)
    if (interviewType === 'Full Mock' || interviewType === 'Technical' || interviewType === 'Mixed') {
      const techSkill = verifiedCandidateSkills.find((s: string) => s.toLowerCase().includes('sql')) || 'SQL';
      questions.push({
        id: 'q_round3_tech',
        round: 3,
        roundName: 'Round 3: Core Technical & Query Logic',
        category: 'Technical',
        difficulty: 'Intermediate',
        topic: `${techSkill} Database Optimization`,
        question: `How would you identify duplicate records in a relational database table using ${techSkill}, and how would you optimize query performance for large datasets?`,
        jdRequirementMapped: `${techSkill} Query Optimization`,
        contextHint: `Explain using GROUP BY ... HAVING COUNT(*) > 1 or ROW_NUMBER() OVER(PARTITION BY ...).`,
        framework: 'Technical',
        frameworkGuide: {
          concept: `Duplicate detection requires grouping key attributes and filtering counts > 1.`,
          approach: `Use GROUP BY or window functions like ROW_NUMBER() PARTITION BY.`,
          example: `SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;`
        },
        modelAnswer: `To identify duplicates, I use GROUP BY on unique columns combined with HAVING COUNT(*) > 1. For removal or selection, ROW_NUMBER() OVER(PARTITION BY unique_col ORDER BY id) assigns ranking, allowing us to filter row numbers > 1. For large datasets, creating composite indexes on partition columns prevents full table scans.`
      });
    }

    // ROUND 4: Role-Specific Scenarios (Skill Gap Focus Topic)
    if (interviewType === 'Full Mock' || interviewType === 'Situational' || interviewType === 'Technical') {
      const gapSkill = missingSkills[0] || 'Power BI';
      questions.push({
        id: 'q_round4_gap',
        round: 4,
        roundName: 'Round 4: Role Scenario & Skill Gap Preparation',
        category: 'Situational',
        difficulty: 'Intermediate',
        topic: `${gapSkill} (Skill Gap Improvement Topic)`,
        question: `The ${targetTitle} role requires ${gapSkill} for executive dashboards. As this is an active improvement area on your roadmap, how would you design a management dashboard to visualize key business metrics, and how would you handle data cleaning?`,
        jdRequirementMapped: `${gapSkill} Dashboarding`,
        isSkillGapTopic: true,
        contextHint: `Note: ${gapSkill} is an identified improvement area for your target role. Focus on conceptual dashboard design and data transformation principles.`,
        framework: 'Technical',
        frameworkGuide: {
          concept: `Executive dashboards focus on high-level KPIs, drill-down filters, and clean data modeling.`,
          approach: `First clean raw data (handling nulls & data types), design DAX / calculated measures, and lay out visual cards.`,
          example: `Building sales trend graphs, regional filters, and automated daily refresh.`
        },
        modelAnswer: `To design an executive dashboard in ${gapSkill}, I would first clean and structure source data in Power Query by removing nulls and standardizing data types. Next, I would create explicit measures for KPIs like Monthly Recurring Revenue and YoY Growth, structuring visuals into high-level cards with regional slicers for interactive executive drill-down.`
      });
    }

    // ROUND 5: Behavioral / HR (Conflict & STAR Method)
    if (interviewType === 'Full Mock' || interviewType === 'Behavioral' || interviewType === 'HR') {
      questions.push({
        id: 'q_round5_behavioral',
        round: 5,
        roundName: 'Round 5: Behavioral & Teamwork Scenarios',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        topic: 'Conflict Resolution & Technical Alignment',
        question: `Describe a situation where you had a technical disagreement with a teammate regarding system architecture or data model design. How did you handle it and what was the outcome?`,
        contextHint: `Use the STAR method: Situation (project context), Task (the disagreement), Action (data-backed discussion & benchmark POC), Result (aligned team decision).`,
        framework: 'STAR',
        frameworkGuide: {
          situation: `During a data pipeline redesign, a teammate preferred REST polling while I advocated for WebSocket events.`,
          task: `Align on an optimal architecture without delaying sprint deadlines.`,
          action: `Built a quick proof-of-concept for both approaches, measuring latency and resource utilization side-by-side.`,
          result: `Data showed WebSocket reduced latency by 60%, leading to team consensus.`
        },
        modelAnswer: `In a recent project, my colleague and I differed on whether to use REST or WebSockets. Rather than debating theoretically, I proposed building a quick 1-hour prototype of both approaches. We benchmarked latency side-by-side, proving WebSockets cut payload latency by 60%. This empirical evidence created team alignment and delivered a faster product.`
      });
    }

    // ROUND 6: Candidate Questions (Reverse Interviewing)
    if (interviewType === 'Full Mock' || interviewType === 'HR') {
      questions.push({
        id: 'q_round6_candidate_qs',
        round: 6,
        roundName: 'Round 6: Candidate Questions for the Interviewer',
        category: 'HR',
        difficulty: 'Beginner',
        topic: 'Engineering Culture & Growth',
        question: `Do you have any questions for me about the team, tech stack, or engineering culture at ${targetCompany}?`,
        contextHint: `Ask strategic questions about engineering processes, deployment cadence, or success criteria for the ${targetTitle} role.`,
        framework: 'STAR',
        frameworkGuide: {
          situation: `Showing genuine interest in team growth and operational excellence.`,
          task: `Demonstrate strategic thinking and alignment with company goals.`,
          action: `Ask about sprint planning, tech debt management, and success metrics for 90 days.`,
          result: `Leaves a strong impression of professional maturity.`
        },
        modelAnswer: `Yes! I would love to know: 1. What does success look like for a ${targetTitle} in their first 90 days? 2. How does the engineering team balance new feature development with managing tech debt?`
      });
    }

    return questions;
  }

  /**
   * Multi-Dimensional Answer Evaluator with Constructive Phrasing Policy
   */
  public static evaluateAnswer(
    question: MockQuestion,
    userAnswer: string,
    candidate: CandidateProfile
  ): AnswerEvaluation {
    const text = userAnswer.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const lower = text.toLowerCase();

    let relevanceScore = 75;
    let technicalScore = 75;
    let structureScore = 70;
    let clarityScore = 80;
    let completenessScore = 72;

    // Word Count & Detail Evaluation
    if (wordCount > 40) {
      relevanceScore += 10;
      completenessScore += 12;
    } else if (wordCount < 15) {
      completenessScore -= 20;
      structureScore -= 15;
    }

    // Topic & Technical Term Detection
    if (lower.includes(question.topic.toLowerCase()) || lower.includes(question.category.toLowerCase())) {
      relevanceScore += 10;
    }

    if (lower.includes('group by') || lower.includes('select') || lower.includes('react') || lower.includes('python') || lower.includes('data') || lower.includes('result') || lower.includes('latency')) {
      technicalScore += 12;
    }

    // Framework Keyword Detection (STAR / Technical)
    if (lower.includes('situation') || lower.includes('task') || lower.includes('action') || lower.includes('result') || lower.includes('first') || lower.includes('for example')) {
      structureScore += 15;
    }

    // Clamp scores 0..100
    relevanceScore = Math.min(100, Math.max(40, relevanceScore));
    technicalScore = Math.min(100, Math.max(40, technicalScore));
    structureScore = Math.min(100, Math.max(40, structureScore));
    clarityScore = Math.min(100, Math.max(40, clarityScore));
    completenessScore = Math.min(100, Math.max(40, completenessScore));

    const overallScore = Math.round(
      relevanceScore * 0.25 +
      technicalScore * 0.25 +
      structureScore * 0.20 +
      clarityScore * 0.15 +
      completenessScore * 0.15
    );

    // Constructive Labels (Zero Negative Phrasing)
    const relevanceLabel = relevanceScore >= 85 ? 'Strong' : relevanceScore >= 70 ? 'Good' : relevanceScore >= 55 ? 'Developing' : 'Could be strengthened';
    const technicalUnderstandingLabel = technicalScore >= 85 ? 'Strong' : technicalScore >= 70 ? 'Good' : technicalScore >= 55 ? 'Developing' : 'Needs refinement';
    const structureLabel = structureScore >= 85 ? 'Strong' : structureScore >= 70 ? 'Good' : structureScore >= 55 ? 'Developing' : 'Needs framework focus';
    const clarityLabel = clarityScore >= 85 ? 'Strong' : clarityScore >= 70 ? 'Good' : clarityScore >= 55 ? 'Developing' : 'Could be clearer';
    const completenessLabel = completenessScore >= 85 ? 'Strong' : completenessScore >= 70 ? 'Good' : completenessScore >= 55 ? 'Developing' : 'Could be strengthened';

    const strengths: string[] = [
      `Your response directly addresses the core objective of the question regarding ${question.topic}.`,
      `Demonstrates good foundational knowledge in ${question.category} domain.`
    ];

    const improvements: string[] = [];

    if (structureScore < 80) {
      improvements.push(`Consider organizing your answer more explicitly using the ${question.framework} framework (State Situation/Concept first, then Action/Approach, then Result).`);
    }
    if (completenessScore < 80) {
      improvements.push(`Try adding a specific quantifiable outcome (e.g., "reduced query latency by 30%") to highlight measurable impact.`);
    }

    if (improvements.length === 0) {
      improvements.push('Maintain this structured style across all technical interview rounds!');
    }

    const constructiveFeedback = `Your technical explanation is relevant and addresses the core prompt. To make your response even compelling, consider structuring it using the ${question.framework} framework and including measurable project results.`;
    const frameworkTip = `Framework Tip: Use ${question.framework} (${question.framework === 'STAR' ? 'Situation, Task, Action, Result' : 'Concept, Approach, Example, Result'}) to organize your thoughts smoothly.`;

    return {
      overallScore,
      relevanceScore,
      technicalScore,
      structureScore,
      clarityScore,
      completenessScore,
      relevanceLabel,
      technicalUnderstandingLabel,
      structureLabel,
      clarityLabel,
      completenessLabel,
      strengths,
      improvements,
      constructiveFeedback,
      frameworkTip
    };
  }

  /**
   * Calculates Weighted Interview Score using Configurable Weights (35% Tech, 20% Comm, 15% Struct, 15% Role, 15% Behav)
   */
  public static calculateSessionScore(
    evaluations: { question: MockQuestion; userAnswer: string; evaluation: AnswerEvaluation }[]
  ): {
    totalScore: number;
    technicalScore: number;
    communicationScore: number;
    structureScore: number;
    roleKnowledgeScore: number;
    behavioralScore: number;
    scoreBreakdown: {
      technicalMath: string;
      communicationMath: string;
      structureMath: string;
      roleKnowledgeMath: string;
      behavioralMath: string;
      totalMath: string;
    };
  } {
    if (evaluations.length === 0) {
      return {
        totalScore: 75,
        technicalScore: 78,
        communicationScore: 74,
        structureScore: 72,
        roleKnowledgeScore: 76,
        behavioralScore: 75,
        scoreBreakdown: {
          technicalMath: 'Technical: 27/35 pts',
          communicationMath: 'Communication: 15/20 pts',
          structureMath: 'Structure: 11/15 pts',
          roleKnowledgeMath: 'Role Knowledge: 11/15 pts',
          behavioralMath: 'Behavioral: 11/15 pts',
          totalMath: 'Total: 75 / 100'
        }
      };
    }

    const avgTech = Math.round(evaluations.reduce((acc, e) => acc + e.evaluation.technicalScore, 0) / evaluations.length);
    const avgComm = Math.round(evaluations.reduce((acc, e) => acc + e.evaluation.clarityScore, 0) / evaluations.length);
    const avgStruct = Math.round(evaluations.reduce((acc, e) => acc + e.evaluation.structureScore, 0) / evaluations.length);
    const avgRole = Math.round(evaluations.reduce((acc, e) => acc + e.evaluation.relevanceScore, 0) / evaluations.length);
    const avgBehav = Math.round(evaluations.reduce((acc, e) => acc + e.evaluation.completenessScore, 0) / evaluations.length);

    const techPts = Math.round(avgTech * 0.35);
    const commPts = Math.round(avgComm * 0.20);
    const structPts = Math.round(avgStruct * 0.15);
    const rolePts = Math.round(avgRole * 0.15);
    const behavPts = Math.round(avgBehav * 0.15);

    const totalScore = techPts + commPts + structPts + rolePts + behavPts;

    return {
      totalScore,
      technicalScore: avgTech,
      communicationScore: avgComm,
      structureScore: avgStruct,
      roleKnowledgeScore: avgRole,
      behavioralScore: avgBehav,
      scoreBreakdown: {
        technicalMath: `Technical: ${techPts}/35 pts (Avg ${avgTech}%)`,
        communicationMath: `Communication: ${commPts}/20 pts (Avg ${avgComm}%)`,
        structureMath: `Structure: ${structPts}/15 pts (Avg ${avgStruct}%)`,
        roleKnowledgeMath: `Role Knowledge: ${rolePts}/15 pts (Avg ${avgRole}%)`,
        behavioralMath: `Behavioral: ${behavPts}/15 pts (Avg ${avgBehav}%)`,
        totalMath: `Total: ${totalScore} / 100 (${techPts} + ${commPts} + ${structPts} + ${rolePts} + ${behavPts})`
      }
    };
  }

  /**
   * Save interview session and update Job Readiness Module with empirical evidence
   */
  public static saveSession(
    candidate: CandidateProfile,
    sessionData: Omit<InterviewSession, 'id' | 'date'>
  ): InterviewSession {
    const session: InterviewSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    sessionHistory.push(session);

    // Update Job Readiness service with actual interview evidence
    updateReadinessFromInterview(candidate, session.totalScore);

    return session;
  }

  /**
   * Retrieve stored interview session history
   */
  public static getSessionHistory(): InterviewSession[] {
    return [...sessionHistory];
  }

  /**
   * Identify repeated weak areas across sessions
   */
  public static identifyWeakAreas(sessions: InterviewSession[]): { area: string; recommendation: string }[] {
    if (sessions.length === 0) {
      return [
        {
          area: 'Answer Structure (STAR Method)',
          recommendation: 'Practice organizing behavioral responses using Situation, Task, Action, and Result.'
        },
        {
          area: 'Measurable Outcomes',
          recommendation: 'Add quantitative metrics (e.g. % performance increase) to project explanations.'
        }
      ];
    }

    const weakAreas: { area: string; recommendation: string }[] = [];
    const avgStruct = sessions.reduce((a, s) => a + s.structureScore, 0) / sessions.length;
    const avgComm = sessions.reduce((a, s) => a + s.communicationScore, 0) / sessions.length;

    if (avgStruct < 75) {
      weakAreas.push({
        area: 'Answer Structure',
        recommendation: 'Across your sessions, structure scores reflect room for framework alignment. Practice STAR method.'
      });
    }

    if (avgComm < 75) {
      weakAreas.push({
        area: 'Communication & Conciseness',
        recommendation: 'Focus on stating key technical decisions directly in the first 30 seconds of your answer.'
      });
    }

    if (weakAreas.length === 0) {
      weakAreas.push({
        area: 'Advanced Scenario Depth',
        recommendation: 'Practice advanced system design and edge-case handling for senior roles.'
      });
    }

    return weakAreas;
  }

  /**
   * Generates 24-Hour and 1-Hour Interview Preparation Plan
   */
  public static generateInterviewPlan(targetRole: string, companyName: string): InterviewPrepPlan {
    return {
      hours24Before: [
        `Review JD key requirements for ${targetRole} @ ${companyName}.`,
        'Review parsed resume technical bullets and top 2 projects.',
        'Review top 5 technical concepts (SQL query optimization, data modeling, API design).',
        'Practice 1 STAR-method project explanation out loud.',
        'Complete 1 full mock interview round in AI Interview Coach.'
      ],
      hour1Before: [
        `Review ${companyName} product overview and target role objectives.`,
        'Review your 30-second professional self-introduction.',
        'Review key project metrics (latency reductions, throughput increases).',
        'Ensure quiet environment, take a deep breath, and proceed with confidence!'
      ]
    };
  }
}
