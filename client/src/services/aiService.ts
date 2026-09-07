import { CandidateProfile, CareerPath, SkillGapAnalysis, MentorMessage, InterviewQuestion, SoftSkillFeedback } from '../types';
import { mockCareerPaths, mockInterviewQuestions } from './mockData';

export interface IAIService {
  providerName: string;
  isRealAI: boolean;
  generateCareerRoadmap(candidate: CandidateProfile, targetRole: string): Promise<CareerPath>;
  analyzeSkillGaps(candidate: CandidateProfile, targetRole: string): Promise<SkillGapAnalysis>;
  calculateJobReadiness(candidate: CandidateProfile): Promise<{ score: number; resumeScore: number; skillFit: number; expFit: number; softSkills: number; recommendations: string[] }>;
  chatWithMentor(candidate: CandidateProfile, userMessage: string, history: MentorMessage[]): Promise<string>;
  generateMockInterviewQuestions(role: string): Promise<InterviewQuestion[]>;
  evaluateSoftSkills(sampleText: string): Promise<SoftSkillFeedback>;
}

// Development Mock Provider: Realistic, contextual logic clearly identified as Mock/Development Provider
export class MockAIProvider implements IAIService {
  public providerName = 'Development Mock AI Provider (Zero-Cost)';
  public isRealAI = false;

  public async generateCareerRoadmap(candidate: CandidateProfile, targetRole: string): Promise<CareerPath> {
    await new Promise((res) => setTimeout(res, 600)); // Simulate async processing
    const foundPath = mockCareerPaths.find(p => p.targetRole.toLowerCase().includes(targetRole.toLowerCase()));
    if (foundPath) return foundPath;

    return {
      id: `path_${Date.now()}`,
      currentRole: candidate.headline.split('|')[0] || 'Software Engineer',
      targetRole: targetRole || 'Lead Solutions Architect',
      readinessPercentage: 70,
      salaryIncreaseEstimate: '+35% to +55%',
      milestones: [
        {
          step: 1,
          title: `Acquire Core Competencies for ${targetRole}`,
          duration: '2 Months',
          keySkillsToAcquire: ['Advanced System Design', 'Cloud Architecture', 'Security Standards'],
          description: 'Focus on mastering modern enterprise design patterns and automated cloud infrastructure.'
        },
        {
          step: 2,
          title: 'Hands-on Production Ownership',
          duration: '3 Months',
          keySkillsToAcquire: ['Kubernetes / Docker', 'CI/CD Pipelines', 'Performance Tuning'],
          description: 'Take full lifecycle ownership of scalable microservices in production.'
        },
        {
          step: 3,
          title: 'Technical Leadership & Mentorship',
          duration: '3 Months',
          keySkillsToAcquire: ['Architecture Review (RFCs)', 'Cross-functional Collaboration', 'Budgeting'],
          description: 'Lead engineering strategy, author architecture decision records, and mentor developers.'
        }
      ]
    };
  }

  public async analyzeSkillGaps(candidate: CandidateProfile, targetRole: string): Promise<SkillGapAnalysis> {
    await new Promise((res) => setTimeout(res, 500));
    const candidateSkillsLower = candidate.skills.map((s) => s.name.toLowerCase());
    
    // Target requirements for common tech roles
    const standardRequirements: Record<string, string[]> = {
      'Senior Frontend Developer': ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'Micro-frontends', 'GraphQL'],
      'Full Stack Engineer': ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design'],
      'AI / ML Application Engineer': ['Python', 'TypeScript', 'LangChain / RAG', 'Vector Databases', 'FastAPI', 'PyTorch']
    };

    const targetKey = Object.keys(standardRequirements).find(k => k.toLowerCase().includes(targetRole.toLowerCase())) || 'Full Stack Engineer';
    const requiredList = standardRequirements[targetKey];

    const matchedSkills: string[] = [];
    const missingSkills: { skill: string; priority: 'Critical' | 'Recommended' | 'Bonus'; learningResource: string }[] = [];

    requiredList.forEach((skill) => {
      if (candidateSkillsLower.some((cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push({
          skill,
          priority: matchedSkills.length < 2 ? 'Critical' : 'Recommended',
          learningResource: `Laboria Academy: Accelerated ${skill} Masterclass`
        });
      }
    });

    const overallFitPercentage = Math.round((matchedSkills.length / requiredList.length) * 100);

    return {
      targetRole: targetRole || targetKey,
      overallFitPercentage,
      matchedSkills,
      missingSkills,
      estimatedLearningHours: missingSkills.length * 18
    };
  }

  public async calculateJobReadiness(candidate: CandidateProfile): Promise<{ score: number; resumeScore: number; skillFit: number; expFit: number; softSkills: number; recommendations: string[] }> {
    await new Promise((res) => setTimeout(res, 400));
    const resumeScore = candidate.resumeText ? 88 : 45;
    const skillFit = Math.min(95, candidate.skills.length * 9);
    const expFit = candidate.yearsOfExperience >= 3 ? 85 : 65;
    const softSkills = 82;

    const overall = Math.round(resumeScore * 0.3 + skillFit * 0.35 + expFit * 0.2 + softSkills * 0.15);

    const recommendations: string[] = [];
    if (skillFit < 80) recommendations.push('Add certifications or projects demonstrating Docker & AWS deployment.');
    if (resumeScore < 80) recommendations.push('Upload an updated ATS-friendly PDF resume to boost ATS parsing score.');
    recommendations.push('Practice behavioral STAR method interview responses in AI Interview Prep module.');

    return {
      score: overall,
      resumeScore,
      skillFit,
      expFit,
      softSkills,
      recommendations
    };
  }

  public async chatWithMentor(candidate: CandidateProfile, userMessage: string, _history: MentorMessage[]): Promise<string> {
    await new Promise((res) => setTimeout(res, 700));
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes('salary') || msgLower.includes('pay') || msgLower.includes('ctc')) {
      return `Based on current market data in India for ${candidate.headline.split('|')[0] || 'Full Stack Engineers'} with ${candidate.yearsOfExperience} years YOE, target compensation ranges between ₹22 LPA to ₹32 LPA. I recommend emphasizing your expertise in ${candidate.skills.slice(0, 3).map(s=>s.name).join(', ')} during salary negotiations.`;
    }

    if (msgLower.includes('resume') || msgLower.includes('cv')) {
      return `Your resume is currently strong in technical keywords (${candidate.skills.length} verified skills). To increase recruiter callback rate by 30%, ensure your work experience section quantifies achievements with metrics (e.g. "Improved page load by 40%" rather than "Worked on frontend").`;
    }

    if (msgLower.includes('remote') || msgLower.includes('location')) {
      return `Laboria AI prioritizes your candidate profile match first! Distance is secondary. For remote roles, emphasize your async communication skills and experience with Git workflows and self-managed task ownership.`;
    }

    return `That is a key aspect of your career navigation, ${candidate.fullName.split(' ')[0]}. With ${candidate.yearsOfExperience} years of experience in ${candidate.skills.slice(0, 2).map(s=>s.name).join(' & ')}, you are well-positioned for Senior roles. Would you like me to analyze your skill gap against Senior Solutions Architect or Lead Frontend positions?`;
  }

  public async generateMockInterviewQuestions(role: string): Promise<InterviewQuestion[]> {
    await new Promise((res) => setTimeout(res, 500));
    return mockInterviewQuestions.filter(q => q.role.toLowerCase().includes(role.toLowerCase()) || role === 'All');
  }

  public async evaluateSoftSkills(sampleText: string): Promise<SoftSkillFeedback> {
    await new Promise((res) => setTimeout(res, 600));
    const wordCount = sampleText.trim().split(/\s+/).length;
    
    return {
      category: 'Recruiter Outreach / Interview Communication',
      score: wordCount > 20 ? 86 : 64,
      toneAnalysis: 'Professional, confident, and direct with structured intent.',
      strengths: [
        'Clear state of core value proposition and technical focus',
        'Polite and appreciative closing phrasing'
      ],
      areasForImprovement: [
        'Could include a specific quantifiable metric from recent project experience',
        'Explicitly state availability for a 15-minute introductory call'
      ],
      actionableTip: 'Try adding: "In my recent role, I increased system throughput by 35% using React & TypeScript. I would love to share how I can bring similar value to your team."'
    };
  }
}

// Real Gemini API Provider (Zero-Cost when using free tier GEMINI_API_KEY)
export class GeminiAIProvider implements IAIService {
  public providerName = 'Google Gemini AI Provider (Live)';
  public isRealAI = true;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from Gemini API.';
    } catch (err) {
      console.error('Gemini API call failed, falling back to mock provider', err);
      throw err;
    }
  }

  public async generateCareerRoadmap(candidate: CandidateProfile, targetRole: string): Promise<CareerPath> {
    const mockFallback = new MockAIProvider();
    try {
      const prompt = `Act as an expert career advisor. Candidate Profile: ${JSON.stringify(candidate)}. Generate a 3-step career roadmap towards target role: ${targetRole}. Return ONLY JSON formatted according to CareerPath interface.`;
      const resText = await this.callGemini(prompt);
      const cleaned = resText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return mockFallback.generateCareerRoadmap(candidate, targetRole);
    }
  }

  public async analyzeSkillGaps(candidate: CandidateProfile, targetRole: string): Promise<SkillGapAnalysis> {
    const mockFallback = new MockAIProvider();
    try {
      const prompt = `Candidate Skills: ${candidate.skills.map(s => s.name).join(', ')}. Target Role: ${targetRole}. Analyze matched vs missing skills. Return JSON formatted for SkillGapAnalysis interface.`;
      const resText = await this.callGemini(prompt);
      const cleaned = resText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return mockFallback.analyzeSkillGaps(candidate, targetRole);
    }
  }

  public async calculateJobReadiness(candidate: CandidateProfile) {
    return new MockAIProvider().calculateJobReadiness(candidate);
  }

  public async chatWithMentor(candidate: CandidateProfile, userMessage: string, history: MentorMessage[]): Promise<string> {
    try {
      const historyContext = history.slice(-4).map(h => `${h.sender}: ${h.text}`).join('\n');
      const prompt = `You are Laboria AI Personal Mentor for candidate ${candidate.fullName} (Role: ${candidate.headline}, YOE: ${candidate.yearsOfExperience}).
Context history:
${historyContext}

Candidate question: "${userMessage}"
Provide a clear, encouraging, actionable 2-3 paragraph response tailoring advice to Indian software engineering job market.`;
      return await this.callGemini(prompt);
    } catch {
      return new MockAIProvider().chatWithMentor(candidate, userMessage, history);
    }
  }

  public async generateMockInterviewQuestions(role: string): Promise<InterviewQuestion[]> {
    return new MockAIProvider().generateMockInterviewQuestions(role);
  }

  public async evaluateSoftSkills(sampleText: string): Promise<SoftSkillFeedback> {
    return new MockAIProvider().evaluateSoftSkills(sampleText);
  }
}

// Service Factory
export function getAIService(): IAIService {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : '');
  if (apiKey && apiKey.trim().length > 5) {
    return new GeminiAIProvider(apiKey);
  }
  return new MockAIProvider();
}

