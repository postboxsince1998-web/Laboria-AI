import {
  CandidateProfile,
  FinalInterviewReadinessReport,
  InterviewSimulatorConfig,
  JobOpening,
  SimulatorDifficulty,
  SimulatorRoundType,
  WeakTopicInsight
} from '../types';
import {
  AnswerEvaluation,
  InterviewCoachService,
  InterviewSession,
  MockQuestion,
  QuestionDifficulty
} from './interviewCoachService';
import { updateReadinessFromInterview } from './jobReadinessService';

const SIMULATOR_HISTORY_STORAGE_KEY = 'laboria_interview_simulator_history';

export class InterviewSimulatorService {
  /**
   * Generates questions for selected simulator round type or 6-round Full Simulation
   */
  public static generateSimulationQuestions(
    candidate: CandidateProfile,
    config: InterviewSimulatorConfig,
    job?: JobOpening
  ): MockQuestion[] {
    const baseQuestions = InterviewCoachService.generateQuestions(candidate, job as any, 'Full Mock');

    if (config.roundType === 'Full Simulation') {
      // Create a structured 6-round simulation sequence
      const rounds: { type: SimulatorRoundType; title: string; defaultTopic: string; defaultQ: string; modelAns: string }[] = [
        {
          type: 'Resume',
          title: 'Round 1: Resume Deep Dive',
          defaultTopic: 'Project Architecture',
          defaultQ: `Walk me through your project "${candidate.projects[0]?.title || candidate.projects[0]?.name || 'Telemetry Engine'}". What was your exact technical contribution and tech stack?`,
          modelAns: `In this project, I architected the core application using ${candidate.skills[0]?.name || 'TypeScript'} and ${candidate.skills[1]?.name || 'React'}. My primary contribution was designing the modular state pipeline.`
        },
        {
          type: 'Technical',
          title: 'Round 2: Core Technical & System Design',
          defaultTopic: 'API Latency & Caching',
          defaultQ: `How would you diagnose and optimize a database query latency spike in a high-traffic production service?`,
          modelAns: `First, inspect query execution plans using EXPLAIN ANALYZE to identify unindexed scans. Then, add targeted composite indexes and introduce a Redis caching layer for read-heavy operations.`
        },
        {
          type: 'Behavioral',
          title: 'Round 3: Behavioral & STAR Framework',
          defaultTopic: 'Conflict Resolution & Teamwork',
          defaultQ: `Describe a situation where you had a technical disagreement with a team member. How did you resolve it?`,
          modelAns: `Situation: During architecture design, a teammate preferred GraphQL while I advocated REST APIs. Task: Align on standard. Action: Conducted benchmark tests and presented data. Result: Adopted REST, meeting latency target.`
        },
        {
          type: 'Situational',
          title: 'Round 4: Situational & Production Incidents',
          defaultTopic: 'Production Outage Under Pressure',
          defaultQ: `What would you do if a critical microservice goes down during peak business hours and logs are inconclusive?`,
          modelAns: `Immediately roll back to the last stable deployment to restore service availability. Simultaneously isolate the broken build in staging, enable verbose telemetry logging, and conduct a post-mortem.`
        },
        {
          type: 'HR',
          title: 'Round 5: HR, Culture & Career Alignment',
          defaultTopic: 'Career Motivations',
          defaultQ: `Why are you interested in joining ${config.company || 'TechCorp'} as a ${config.jobTitle || 'Developer'}, and where do you see your technical impact in 2 years?`,
          modelAns: `I am motivated by ${config.company || 'the team'}'s technical mission. In 2 years, I aim to lead complex feature architecture and mentor junior engineers.`
        },
        {
          type: 'Company-Specific',
          title: 'Round 6: Company-Specific & Product Scenario',
          defaultTopic: `${config.company || 'Employer'} Product Strategy`,
          defaultQ: `How would you design a scalable telemetry pipeline for ${config.company || 'TechCorp'}'s core infrastructure?`,
          modelAns: `Architect an event-driven pipeline using Kafka for log ingestion, processed by Node.js microservices, and persisted in PostgreSQL with Redis caching for real-time dashboards.`
        }
      ];

      return rounds.map((r, idx) => ({
        id: `sim_q_${idx + 1}`,
        round: idx + 1,
        roundName: r.title,
        category: r.type as any,
        difficulty: (config.difficulty === 'Adaptive' ? 'Intermediate' : config.difficulty) as QuestionDifficulty,
        topic: r.defaultTopic,
        question: r.defaultQ,
        contextHint: `Round ${idx + 1}: Focus on clear communication and technical structure.`,
        framework: r.type === 'Behavioral' ? 'STAR' : r.type === 'Resume' ? 'Project' : 'Technical',
        frameworkGuide: {
          situation: 'Set context',
          task: 'Define technical goal',
          action: 'Explain your execution',
          result: 'Quantify metrics'
        },
        modelAnswer: r.modelAns
      }));
    }

    // Filter single-round questions matching specific round type
    const filtered = baseQuestions.filter((q) => {
      if (config.roundType === 'Technical') return q.category === 'Technical';
      if (config.roundType === 'HR') return q.category === 'HR';
      if (config.roundType === 'Behavioral') return q.category === 'Behavioral';
      if (config.roundType === 'Resume') return q.category === 'Resume-Based';
      if (config.roundType === 'Situational') return q.category === 'Situational';
      return true;
    });

    if (filtered.length >= 3) {
      return filtered.slice(0, 5);
    }

    return baseQuestions.slice(0, 5);
  }

  /**
   * Adaptive difficulty adjustment engine
   */
  public static evaluateAdaptiveDifficulty(
    currentDifficulty: QuestionDifficulty,
    lastScore: number
  ): QuestionDifficulty {
    if (lastScore >= 80) {
      if (currentDifficulty === 'Beginner') return 'Intermediate';
      if (currentDifficulty === 'Intermediate') return 'Advanced';
      return 'Advanced';
    } else if (lastScore < 60) {
      if (currentDifficulty === 'Advanced') return 'Intermediate';
      if (currentDifficulty === 'Intermediate') return 'Beginner';
      return 'Beginner';
    }
    return currentDifficulty;
  }

  /**
   * Evaluates candidate answer using evidence-based scoring (Zero fake scores)
   */
  public static evaluateAnswer(
    question: MockQuestion,
    answerText: string,
    candidate: CandidateProfile,
    timeSpentSeconds: number = 60
  ): AnswerEvaluation {
    return InterviewCoachService.evaluateAnswer(question, answerText, candidate);
  }

  /**
   * Detects recurring weak topics from candidate interview history
   */
  public static detectWeakTopics(history: InterviewSession[]): WeakTopicInsight[] {
    const topicScoresMap = new Map<string, { totalScore: number; count: number; category: string }>();

    history.forEach((session) => {
      session.questionsAnswered.forEach((qItem) => {
        const topic = qItem.question.topic || qItem.question.category;
        const score = qItem.evaluation.overallScore;
        const current = topicScoresMap.get(topic) || { totalScore: 0, count: 0, category: qItem.question.category };
        topicScoresMap.set(topic, {
          totalScore: current.totalScore + score,
          count: current.count + 1,
          category: current.category
        });
      });
    });

    const insights: WeakTopicInsight[] = [];
    topicScoresMap.forEach((val, topic) => {
      const avg = Math.round(val.totalScore / val.count);
      if (avg < 75) {
        insights.push({
          topic,
          category: val.category,
          frequencyCount: val.count,
          averageScore: avg,
          recommendation: `Focus on closing gaps in ${topic}. Review core fundamentals and practice structured STAR responses.`,
          actionModulePath: topic.toLowerCase().includes('sql') || topic.toLowerCase().includes('skill') ? '/skill-gap' : '/learning'
        });
      }
    });

    if (insights.length === 0) {
      insights.push({
        topic: 'System Design & Metric Framing',
        category: 'Technical',
        frequencyCount: 1,
        averageScore: 72,
        recommendation: 'Practice incorporating quantifiable metrics ($X%, p99 latency) into your technical project descriptions.',
        actionModulePath: '/learning'
      });
    }

    return insights.sort((a, b) => a.averageScore - b.averageScore);
  }

  /**
   * Generates a personalized 24h & 1-week preparation plan based on weak topics
   */
  public static generatePrepPlan(weakTopics: WeakTopicInsight[]): { timeframe: string; action: string; targetModule: string }[] {
    const topWeak = weakTopics[0]?.topic || 'Technical Architecture';
    return [
      {
        timeframe: '24 Hours Before Interview',
        action: `Review core STAR stories and practice reference answer frameworks for ${topWeak}.`,
        targetModule: 'Interview Simulator'
      },
      {
        timeframe: '24 Hours Before Interview',
        action: 'Tailor your active resume version against target JD requirements using AI Resume Builder.',
        targetModule: 'Resume Builder'
      },
      {
        timeframe: '1 Week Before Interview',
        action: `Complete dedicated learning modules for ${topWeak} in AI Learning Hub.`,
        targetModule: 'Learning Hub'
      },
      {
        timeframe: '1 Week Before Interview',
        action: 'Run a 6-round Full Interview Simulation to test adaptive difficulty readiness.',
        targetModule: 'Interview Simulator'
      }
    ];
  }

  /**
   * Compiles the Final Interview Readiness Report (Model answers strictly labeled "Reference Answer")
   */
  public static generateFinalReadinessReport(
    session: InterviewSession,
    candidate: CandidateProfile,
    job?: JobOpening
  ): FinalInterviewReadinessReport {
    // Update Job Readiness Score in JobReadinessService
    updateReadinessFromInterview(candidate, session.totalScore);

    const history = SavedInterviewHistoryService.getHistory(candidate);
    const weakTopics = this.detectWeakTopics([...history, session]);
    const personalizedPrepPlan = this.generatePrepPlan(weakTopics);

    const roundScoresMap = new Map<string, { totalScore: number; count: number }>();
    session.questionsAnswered.forEach((item) => {
      const rName = item.question.roundName || `Round ${item.question.round}`;
      const curr = roundScoresMap.get(rName) || { totalScore: 0, count: 0 };
      roundScoresMap.set(rName, { totalScore: curr.totalScore + item.evaluation.overallScore, count: curr.count + 1 });
    });

    const roundScores: { roundName: string; score: number }[] = [];
    roundScoresMap.forEach((val, key) => {
      roundScores.push({ roundName: key, score: Math.round(val.totalScore / val.count) });
    });

    const questionsSummary = session.questionsAnswered.map((item) => ({
      questionText: item.question.question,
      roundName: item.question.roundName || `Round ${item.question.round}`,
      score: item.evaluation.overallScore,
      referenceAnswer: item.question.modelAnswer, // Strictly labeled "Reference Answer"
      candidateAnswer: item.userAnswer
    }));

    let readinessStatus: 'Highly Interview Ready' | 'Nearly Ready' | 'Needs Focused Practice' = 'Nearly Ready';
    if (session.totalScore >= 85) readinessStatus = 'Highly Interview Ready';
    else if (session.totalScore < 70) readinessStatus = 'Needs Focused Practice';

    return {
      sessionId: session.id,
      date: session.date,
      jobTitle: session.jobTitle || job?.title || 'Software Role',
      company: session.company || job?.company || 'Target Employer',
      overallScore: session.totalScore,
      roundScores,
      categoryScores: {
        technical: session.technicalScore,
        communication: session.communicationScore,
        structure: session.structureScore,
        roleKnowledge: session.roleKnowledgeScore,
        behavioral: session.behavioralScore
      },
      weakTopics,
      personalizedPrepPlan,
      questionsSummary,
      readinessStatus
    };
  }
}

/**
 * Storage Repository for Saved Interview Simulator History
 */
export class SavedInterviewHistoryService {
  public static getHistory(candidate: CandidateProfile): InterviewSession[] {
    try {
      const data = localStorage.getItem(SIMULATOR_HISTORY_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static saveSession(session: InterviewSession, candidate: CandidateProfile): InterviewSession[] {
    const existing = this.getHistory(candidate);
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    try {
      localStorage.setItem(SIMULATOR_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save interview history failed', e);
    }
    return updated;
  }

  public static clearHistory(): void {
    try {
      localStorage.removeItem(SIMULATOR_HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage clear interview history failed', e);
    }
  }
}
