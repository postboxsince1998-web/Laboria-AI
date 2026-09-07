import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';

export type SkillCategory =
  | 'Core Skills'
  | 'Emerging Skills'
  | 'AI Skills'
  | 'Data Skills'
  | 'Cloud Skills'
  | 'Automation Skills'
  | 'Communication Skills'
  | 'Business Skills'
  | 'Domain Skills';

export type SignalLevel = 'Established' | 'Growing' | 'Emerging' | 'Early Signal';

export type TrendDirection = '↗ Increasing' | '→ Stable' | '↘ Declining' | '? Insufficient Data';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Insufficient Data';

export interface SkillSignal {
  skillId: string;
  skillName: string;
  career: string;
  category: SkillCategory;
  signalLevel: SignalLevel;
  trendDirection: TrendDirection;
  currentRelevance: 'High' | 'Medium' | 'Low';
  futureRelevance: 'High' | 'Medium' | 'Low';
  evidenceCount: number | null;
  source: string;
  sourceUrl: string | null;
  observedDate: string;
  updatedAt: string;
  confidence: ConfidenceLevel;
  whyItMatters: string;
  whatYouAlreadyKnow: string[];
  whatYouAreMissing: string[];
  whatToLearn: string;
  matchedJobsCount: number;
  priority: 'High' | 'Medium' | 'Low';
  candidateReadiness: 'High' | 'Medium' | 'Low';
  isWatchlisted: boolean;
  isUserPossessed: boolean;
}

export interface CareerSkillMap {
  career: string;
  coreSkills: string[];
  growingSkills: string[];
  emergingSkills: string[];
  earlySignals: string[];
}

export interface AdjacentCareerTransition {
  title: string;
  currentMatchPercentage: number;
  skillsAlreadyPossessed: string[];
  skillsToDevelop: string[];
  estimatedReadinessLabel: string;
  whyItFits: string;
}

export interface SkillComparisonResult {
  skillA: { name: string; relevance: string; demand: string; trend: string; candidateHas: boolean };
  skillB: { name: string; relevance: string; demand: string; trend: string; candidateHas: boolean };
  recommendation: string;
}

export interface IFutureSkillsDataProvider {
  getSkillSignals(candidate: CandidateProfile, targetCareer?: string): SkillSignal[];
  getCareerTrends(targetCareer: string): CareerSkillMap;
  getSkillDemand(skillName: string): { demandIndex: number; matchedJobsCount: number; status: SignalLevel };
  getEmergingSkills(targetCareer: string): SkillSignal[];
  getCareerSkillMap(): CareerSkillMap[];
  getAdjacentCareerTransitions(candidate: CandidateProfile, currentCareer?: string): AdjacentCareerTransition[];
  compareSkills(skillA: string, skillB: string, candidate: CandidateProfile): SkillComparisonResult;
}

// Configurable Career Skill Maps Repository
export const careerSkillMaps: CareerSkillMap[] = [
  {
    career: 'Data Analyst',
    coreSkills: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Statistics'],
    growingSkills: ['Power BI', 'Tableau', 'Cloud Analytics', 'Data Modeling'],
    emergingSkills: ['AI-assisted Analytics', 'Generative AI for Data', 'Automated Data Workflows'],
    earlySignals: ['Agentic AI Data Bots', 'Vector Database Queries']
  },
  {
    career: 'Junior Data Analyst',
    coreSkills: ['SQL', 'Python', 'Excel', 'Statistics'],
    growingSkills: ['Power BI', 'Data Cleaning', 'SQL Optimization'],
    emergingSkills: ['AI-assisted Analytics', 'Automated Dashboarding'],
    earlySignals: ['Agentic Analytics Workflows']
  },
  {
    career: 'Business Analyst',
    coreSkills: ['SQL', 'Excel', 'Process Mapping', 'Jira', 'Agile'],
    growingSkills: ['Power BI', 'Tableau', 'Business Strategy'],
    emergingSkills: ['AI Product Analytics', 'Automated Reporting'],
    earlySignals: ['AI Decision Support Engines']
  },
  {
    career: 'Full Stack Engineer',
    coreSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git'],
    growingSkills: ['Docker', 'AWS Lambda', 'GraphQL', 'CI/CD Pipelines'],
    emergingSkills: ['RAG Architecture & Vector Search', 'Apache Kafka', 'Micro-frontends'],
    earlySignals: ['Autonomous AI Agents & Workflows', 'Generative UI']
  },
  {
    career: 'Software Architect',
    coreSkills: ['System Design', 'Node.js', 'TypeScript', 'Docker', 'AWS'],
    growingSkills: ['Kubernetes', 'Terraform', 'Apache Kafka', 'Zero Trust Security'],
    emergingSkills: ['Multi-Agent Orchestration', 'Event-Driven Microservices'],
    earlySignals: ['Quantum-Safe Encryption', 'Self-Healing Cloud Clusters']
  }
];

export class FutureSkillPriorityService {
  /**
   * Calculates Skill Priority (High, Medium, Low) considering career fit & candidate readiness
   */
  public static calculatePriority(
    signalLevel: SignalLevel,
    futureRelevance: 'High' | 'Medium' | 'Low',
    candidateHasSkill: boolean,
    isSkillGap: boolean
  ): 'High' | 'Medium' | 'Low' {
    if (candidateHasSkill) return 'Low';
    if (isSkillGap && (signalLevel === 'Growing' || signalLevel === 'Emerging') && futureRelevance === 'High') {
      return 'High';
    }
    if (signalLevel === 'Emerging' || signalLevel === 'Growing') return 'Medium';
    return 'Low';
  }
}

export class FutureSkillsDataProvider implements IFutureSkillsDataProvider {
  public getCareerSkillMap(): CareerSkillMap[] {
    return careerSkillMaps;
  }

  public getCareerTrends(targetCareer = 'Data Analyst'): CareerSkillMap {
    const found = careerSkillMaps.find((c) => c.career.toLowerCase().includes(targetCareer.toLowerCase()));
    return found || careerSkillMaps[0];
  }

  public getSkillDemand(skillName: string): { demandIndex: number; matchedJobsCount: number; status: SignalLevel } {
    const lower = skillName.toLowerCase();
    const matchedCount = seedJobs.filter((j: any) => j.skills && j.skills.some((s: string) => s.toLowerCase().includes(lower))).length;
    
    if (matchedCount >= 3 || lower.includes('sql') || lower.includes('python')) {
      return { demandIndex: 92, matchedJobsCount: Math.max(matchedCount, 8), status: 'Established' };
    }
    if (lower.includes('power bi') || lower.includes('docker') || lower.includes('kafka')) {
      return { demandIndex: 85, matchedJobsCount: Math.max(matchedCount, 5), status: 'Growing' };
    }
    if (lower.includes('ai') || lower.includes('rag') || lower.includes('vector')) {
      return { demandIndex: 78, matchedJobsCount: Math.max(matchedCount, 3), status: 'Emerging' };
    }

    return { demandIndex: 50, matchedJobsCount: matchedCount, status: 'Early Signal' };
  }

  public getSkillSignals(candidate: CandidateProfile, targetCareer = 'Data Analyst'): SkillSignal[] {
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));
    const cmap = this.getCareerTrends(targetCareer);

    const signals: SkillSignal[] = [];

    // 1. Established Core Skills (e.g. SQL, Python, Excel)
    cmap.coreSkills.forEach((sk, idx) => {
      const hasSkill = candidateSkillsLower.has(sk.toLowerCase());
      const demandInfo = this.getSkillDemand(sk);
      signals.push({
        skillId: `sig_core_${idx}`,
        skillName: sk,
        career: cmap.career,
        category: 'Core Skills',
        signalLevel: 'Established',
        trendDirection: '→ Stable',
        currentRelevance: 'High',
        futureRelevance: 'High',
        evidenceCount: demandInfo.matchedJobsCount * 12,
        source: 'Laboria Job Discovery Engine (Demo Market Signal)',
        sourceUrl: 'https://laboria.ai/market-data/core',
        observedDate: '2026-09-01',
        updatedAt: '2026-09-04',
        confidence: 'High',
        whyItMatters: `${sk} remains a foundational core requirement for ${cmap.career} positions across India.`,
        whatYouAlreadyKnow: hasSkill ? [`Verified proficiency in ${sk} on candidate profile.`] : [],
        whatYouAreMissing: hasSkill ? [] : [`Log hands-on project evidence for ${sk}.`],
        whatToLearn: `Master core query execution and data modeling patterns in ${sk}.`,
        matchedJobsCount: demandInfo.matchedJobsCount,
        priority: hasSkill ? 'Low' : 'High',
        candidateReadiness: hasSkill ? 'High' : 'Low',
        isWatchlisted: false,
        isUserPossessed: hasSkill
      });
    });

    // 2. Growing Skills (e.g. Power BI, Tableau, Cloud Analytics)
    cmap.growingSkills.forEach((sk, idx) => {
      const hasSkill = candidateSkillsLower.has(sk.toLowerCase());
      const demandInfo = this.getSkillDemand(sk);
      const isGap = !hasSkill;
      signals.push({
        skillId: `sig_growing_${idx}`,
        skillName: sk,
        career: cmap.career,
        category: sk.toLowerCase().includes('cloud') ? 'Cloud Skills' : 'Data Skills',
        signalLevel: 'Growing',
        trendDirection: '↗ Increasing',
        currentRelevance: 'High',
        futureRelevance: 'High',
        evidenceCount: demandInfo.matchedJobsCount * 9,
        source: 'Laboria Market Intelligence (Demo Market Signal)',
        sourceUrl: 'https://laboria.ai/market-data/growing',
        observedDate: '2026-09-01',
        updatedAt: '2026-09-04',
        confidence: 'High',
        whyItMatters: `High market demand growth rate observed across active ${cmap.career} job postings.`,
        whatYouAlreadyKnow: hasSkill ? [`Verified proficiency in ${sk}.`] : [`Strong foundation in core ${cmap.coreSkills[0]} skills.`],
        whatYouAreMissing: hasSkill ? [] : [`Hands-on project experience with ${sk} dashboards & reports.`],
        whatToLearn: `Learn DAX, data modeling, and interactive reporting in ${sk}.`,
        matchedJobsCount: demandInfo.matchedJobsCount,
        priority: FutureSkillPriorityService.calculatePriority('Growing', 'High', hasSkill, isGap),
        candidateReadiness: hasSkill ? 'High' : 'Medium',
        isWatchlisted: true,
        isUserPossessed: hasSkill
      });
    });

    // 3. Emerging Skills (e.g. AI-assisted Analytics, Generative AI for Data)
    cmap.emergingSkills.forEach((sk, idx) => {
      const hasSkill = candidateSkillsLower.has(sk.toLowerCase());
      const isGap = !hasSkill;
      signals.push({
        skillId: `sig_emerging_${idx}`,
        skillName: sk,
        career: cmap.career,
        category: 'AI Skills',
        signalLevel: 'Emerging',
        trendDirection: '↗ Increasing',
        currentRelevance: 'Medium',
        futureRelevance: 'High',
        evidenceCount: 42,
        source: 'Laboria AI Future Signals (Demo Market Signal)',
        sourceUrl: 'https://laboria.ai/market-data/emerging',
        observedDate: '2026-09-01',
        updatedAt: '2026-09-04',
        confidence: 'Medium',
        whyItMatters: `Modern ${cmap.career} workflows increasingly integrate AI-assisted tools for automated data exploration.`,
        whatYouAlreadyKnow: hasSkill ? [`Verified experience in ${sk}.`] : [`Familiarity with foundational ${cmap.coreSkills[0]} workflows.`],
        whatYouAreMissing: hasSkill ? [] : [`Experience applying AI tools to automated data insight generation.`],
        whatToLearn: `Learn how AI tools assist data exploration, visualization, and insight generation.`,
        matchedJobsCount: 8,
        priority: FutureSkillPriorityService.calculatePriority('Emerging', 'High', hasSkill, isGap),
        candidateReadiness: hasSkill ? 'High' : 'Low',
        isWatchlisted: true,
        isUserPossessed: hasSkill
      });
    });

    // 4. Early Signals (e.g. Agentic AI Data Bots)
    cmap.earlySignals.forEach((sk, idx) => {
      const hasSkill = candidateSkillsLower.has(sk.toLowerCase());
      signals.push({
        skillId: `sig_early_${idx}`,
        skillName: sk,
        career: cmap.career,
        category: 'AI Skills',
        signalLevel: 'Early Signal',
        trendDirection: '? Insufficient Data',
        currentRelevance: 'Low',
        futureRelevance: 'High',
        evidenceCount: null,
        source: 'Laboria Early Signal Radar (Demo Market Signal)',
        sourceUrl: null,
        observedDate: '2026-09-01',
        updatedAt: '2026-09-04',
        confidence: 'Insufficient Data',
        whyItMatters: `Early technology signal observed in leading R&D teams and multi-agent frameworks.`,
        whatYouAlreadyKnow: [],
        whatYouAreMissing: [`Early-stage research exploration topic.`],
        whatToLearn: `Follow early developer tutorials and agentic workflow prototypes.`,
        matchedJobsCount: 2,
        priority: 'Low',
        candidateReadiness: 'Low',
        isWatchlisted: false,
        isUserPossessed: hasSkill
      });
    });

    return signals;
  }

  public getEmergingSkills(targetCareer = 'Data Analyst'): SkillSignal[] {
    const candidateSkillsLower = new Set(['python', 'sql', 'excel']);
    const mockCandidateProfile: any = { skills: [{ name: 'Python' }, { name: 'SQL' }, { name: 'Excel' }] };
    const all = this.getSkillSignals(mockCandidateProfile, targetCareer);
    return all.filter((s) => s.signalLevel === 'Emerging' || s.signalLevel === 'Growing');
  }

  public getAdjacentCareerTransitions(candidate: CandidateProfile, currentCareer = 'Data Analyst'): AdjacentCareerTransition[] {
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));

    return [
      {
        title: 'AI Data Analyst',
        currentMatchPercentage: candidateSkillsLower.has('sql') && candidateSkillsLower.has('python') ? 78 : 64,
        skillsAlreadyPossessed: ['SQL', 'Python', 'Excel'],
        skillsToDevelop: ['AI-assisted Analytics', 'Power BI'],
        estimatedReadinessLabel: 'Nearly Ready (2 Weeks Prep)',
        whyItFits: 'Strong alignment with your core SQL & Python data baseline while leveraging emerging AI tools.'
      },
      {
        title: 'Analytics Engineer',
        currentMatchPercentage: candidateSkillsLower.has('sql') ? 72 : 58,
        skillsAlreadyPossessed: ['SQL', 'Data Modeling'],
        skillsToDevelop: ['dbt', 'Cloud Data Warehousing', 'Airflow'],
        estimatedReadinessLabel: 'Developing (1 Month Prep)',
        whyItFits: 'Bridges data analysis with scalable data pipeline engineering.'
      },
      {
        title: 'BI Specialist',
        currentMatchPercentage: 81,
        skillsAlreadyPossessed: ['SQL', 'Excel', 'Data Visualization'],
        skillsToDevelop: ['Power BI DAX', 'Executive Dashboarding'],
        estimatedReadinessLabel: 'Highly Ready (1 Week Prep)',
        whyItFits: 'Directly utilizes your data visualization and query optimization strengths.'
      }
    ];
  }

  public compareSkills(skillA: string, skillB: string, candidate: CandidateProfile): SkillComparisonResult {
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));

    return {
      skillA: {
        name: skillA,
        relevance: 'High (Immediate Market Demand)',
        demand: '85/100 Demand Index',
        trend: '↗ Increasing',
        candidateHas: candidateSkillsLower.has(skillA.toLowerCase())
      },
      skillB: {
        name: skillB,
        relevance: 'Medium (Alternative BI Tool)',
        demand: '72/100 Demand Index',
        trend: '→ Stable',
        candidateHas: candidateSkillsLower.has(skillB.toLowerCase())
      },
      recommendation: `For your target career, ${skillA} currently exhibits higher market demand across active job postings in India than ${skillB}. We recommend prioritizing ${skillA} first.`
    };
  }
}

// In-Memory Skill Gap & Roadmap State Handler
export class FutureSkillsIntegrationService {
  private static skillGaps: string[] = ['Power BI'];
  private static roadmapSkills: string[] = ['Power BI'];

  public static addToSkillGap(skillName: string): boolean {
    if (!this.skillGaps.includes(skillName)) {
      this.skillGaps.push(skillName);
      return true;
    }
    return false;
  }

  public static addToRoadmap(skillName: string): boolean {
    if (!this.roadmapSkills.includes(skillName)) {
      this.roadmapSkills.push(skillName);
      return true;
    }
    return false;
  }

  public static getSkillGaps(): string[] {
    return [...this.skillGaps];
  }

  public static getRoadmapSkills(): string[] {
    return [...this.roadmapSkills];
  }
}
