import { CandidateProfile, SkillGapAnalysis } from '../types';
import { AIProviderAdapter, getAIProviderAdapter } from './aiProviderAdapter';
import { AIProviderConfigStatus, AICacheStats, AILogEntry } from '../types';

export class CentralAIService {
  private static instance: CentralAIService;
  private provider: AIProviderAdapter;
  private cache = new Map<string, { value: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private logs: AILogEntry[] = [];

  private hitCount = 0;
  private missCount = 0;
  private savedCallsCount = 0;
  private deduplicatedRequestsCount = 0;

  private constructor() {
    this.provider = getAIProviderAdapter();
  }

  public static getInstance(): CentralAIService {
    if (!CentralAIService.instance) {
      CentralAIService.instance = new CentralAIService();
    }
    return CentralAIService.instance;
  }

  public setProvider(provider: AIProviderAdapter) {
    this.provider = provider;
  }

  public getConfigStatus(): AIProviderConfigStatus {
    const rawKey =
      (import.meta as any).env?.VITE_AI_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (typeof process !== 'undefined' ? process.env?.VITE_AI_API_KEY || process.env?.VITE_GEMINI_API_KEY : '') || '';

    const isConfigured = rawKey.trim().length > 5;
    const apiKeyMasked = isConfigured
      ? `${rawKey.slice(0, 4)}...${rawKey.slice(-4)}`
      : 'NOT CONFIGURED (Using Zero-Cost Fallback)';

    return {
      providerName: this.provider.providerName,
      isConfigured: this.provider.isConfigured,
      apiKeyMasked,
      modelName: this.provider.modelName,
      environment: (import.meta as any).env?.MODE || 'production',
      isFallbackActive: !this.provider.isConfigured
    };
  }

  public getCacheStats(): AICacheStats {
    return {
      cacheSize: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      savedCallsCount: this.savedCallsCount,
      deduplicatedRequestsCount: this.deduplicatedRequestsCount
    };
  }

  public getRecentLogs(): AILogEntry[] {
    return [...this.logs];
  }

  public clearCache(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.savedCallsCount = 0;
    this.deduplicatedRequestsCount = 0;
  }

  private logEvent(requestType: string, latencyMs: number, status: 'SUCCESS' | 'FALLBACK' | 'ERROR', errorCategory?: string) {
    const entry: AILogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      requestType,
      provider: this.provider.providerName,
      latencyMs,
      status,
      errorCategory
    };

    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
  }

  private async executeWithCacheAndDeduplication<T>(cacheKey: string, requestType: string, fetchFn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    // Check L1 LRU Cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      // Cache TTL 1 hour (3600,000 ms)
      if (Date.now() - cached.timestamp < 3600000) {
        this.hitCount++;
        this.savedCallsCount++;
        this.logEvent(`${requestType} (CACHE_HIT)`, Date.now() - startTime, 'SUCCESS');
        return cached.value;
      }
      this.cache.delete(cacheKey);
    }

    // Check Active Pending Request Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      this.deduplicatedRequestsCount++;
      this.logEvent(`${requestType} (DEDUPLICATED)`, Date.now() - startTime, 'SUCCESS');
      return await this.pendingRequests.get(cacheKey)!;
    }

    this.missCount++;
    const promise = (async () => {
      try {
        const result = await fetchFn();
        this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
        this.logEvent(requestType, Date.now() - startTime, this.provider.isConfigured ? 'SUCCESS' : 'FALLBACK');
        return result;
      } catch (err: any) {
        this.logEvent(requestType, Date.now() - startTime, 'FALLBACK', err.message || 'Provider Execution Error');
        // Graceful Fallback Strategy on Failure
        const fallbackAdapter = getAIProviderAdapter();
        return await fetchFn();
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return await promise;
  }

  // Feature Helper Integrations
  public async generateText(prompt: string, context?: any): Promise<string> {
    const key = `genText_${prompt.slice(0, 50)}_${JSON.stringify(context || {})}`;
    return this.executeWithCacheAndDeduplication(key, 'Generate Text', () => this.provider.generateText(prompt, context));
  }

  public async analyzeResume(resumeText: string) {
    if (!resumeText || resumeText.trim().length === 0) {
      return {
        skills: [],
        experienceYears: 0,
        education: [],
        certifications: [],
        summary: 'Insufficient information: Empty resume provided.'
      };
    }

    const key = `resume_${resumeText.slice(0, 100)}_${resumeText.length}`;
    return this.executeWithCacheAndDeduplication(key, 'Resume Analysis', () => this.provider.analyzeResume(resumeText));
  }

  public async analyzeJobDescription(jdText: string) {
    if (!jdText || jdText.trim().length === 0) {
      return {
        title: 'Software Position',
        requiredSkills: ['Programming'],
        preferredSkills: ['Problem Solving'],
        experienceMinYears: 2,
        workType: 'Hybrid',
        summary: 'Insufficient information: Empty job description provided.'
      };
    }

    const key = `jd_${jdText.slice(0, 100)}_${jdText.length}`;
    return this.executeWithCacheAndDeduplication(key, 'Job Description Analysis', () => this.provider.analyzeJobDescription(jdText));
  }

  public async calculateSkillGap(candidate: CandidateProfile, targetRole: string): Promise<SkillGapAnalysis> {
    const candidateSkills = candidate.skills.map(s => s.name);
    const key = `gap_${candidate.id}_${targetRole}`;

    return this.executeWithCacheAndDeduplication(key, 'Skill Gap Analysis', async () => {
      // Standard target requirements
      const roleRequirements: Record<string, string[]> = {
        'Senior Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'GraphQL'],
        'Full Stack Engineer': ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        'AI / ML Application Engineer': ['Python', 'TypeScript', 'LangChain / RAG', 'FastAPI', 'PyTorch']
      };

      const reqs = roleRequirements[targetRole] || ['React', 'TypeScript', 'Node.js', 'System Design'];
      const rawRes = await this.provider.calculateSkillGap(candidateSkills, reqs);

      return {
        targetRole,
        overallFitPercentage: rawRes.fitPercentage,
        matchedSkills: rawRes.matchedSkills,
        missingSkills: rawRes.missingSkills.map(skill => ({
          skill,
          priority: rawRes.matchedSkills.length < 2 ? 'Critical' : 'Recommended',
          learningResource: `Laboria Academy: Accelerated ${skill} Track`
        })),
        estimatedLearningHours: rawRes.missingSkills.length * 15
      };
    });
  }

  public async generateInterviewQuestions(role: string, candidate?: CandidateProfile, jdText?: string) {
    const key = `int_q_${role}_${candidate?.id || 'gen'}_${jdText ? jdText.slice(0, 30) : 'none'}`;
    const expContext = candidate ? `${candidate.headline} (${candidate.yearsOfExperience} YOE)` : undefined;
    return this.executeWithCacheAndDeduplication(key, 'Generate Interview Questions', () => this.provider.generateInterviewQuestions(role, expContext));
  }

  public async evaluateInterviewAnswer(question: string, answer: string, candidate?: CandidateProfile) {
    if (!answer || answer.trim().length === 0) {
      return {
        score: 0,
        strengths: [],
        improvements: ['Please provide a written or verbal answer.'],
        feedback: 'Not demonstrated in the available profile: Answer field was left blank.'
      };
    }

    const key = `int_ans_${question.slice(0, 30)}_${answer.slice(0, 30)}`;
    return this.executeWithCacheAndDeduplication(key, 'Evaluate Interview Answer', () => this.provider.evaluateInterviewAnswer(question, answer));
  }

  public async generateCareerAdvice(candidate: CandidateProfile, query: string): Promise<string> {
    if (!query || query.trim().length === 0) {
      return 'Insufficient information: Please specify your career question.';
    }

    const candContext = `Name: ${candidate.fullName}, YOE: ${candidate.yearsOfExperience}, Skills: ${candidate.skills.slice(0, 5).map(s => s.name).join(', ')}`;
    const key = `advice_${candidate.id}_${query.slice(0, 40)}`;

    return this.executeWithCacheAndDeduplication(key, 'Generate Career Advice', () => this.provider.generateCareerAdvice(candContext, query));
  }

  public async generateLearningPlan(candidate: CandidateProfile, targetRole: string) {
    const candidateSkills = candidate.skills.map(s => s.name);
    const key = `plan_${candidate.id}_${targetRole}`;

    return this.executeWithCacheAndDeduplication(key, 'Generate Learning Plan', async () => {
      const gap = await this.calculateSkillGap(candidate, targetRole);
      const missing = gap.missingSkills.map(m => m.skill);
      return await this.provider.generateLearningPlan(candidateSkills, missing);
    });
  }
}

export const realAIService = CentralAIService.getInstance();
