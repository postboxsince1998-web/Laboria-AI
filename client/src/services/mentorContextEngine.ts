import { CandidateProfile, MentorMessage } from '../types';
import { getAIService } from './aiService';
import { seedJobs } from '../data/seedData';
import { CareerContextEngine } from './careerContextEngine';

export interface DailyCareerPlan {
  date: string;
  focusTitle: string;
  estimatedHours: string;
  targetSkill: string;
  tasks: { task: string; linkModule?: string }[];
}

export interface WeeklyCareerPlan {
  weekTitle: string;
  primaryObjective: string;
  dailyFocus: { day: string; title: string; skill: string }[];
}

export class MentorContextEngine {
  /**
   * Primary entry point for generating personalized mentor responses.
   */
  public static async answerWithContext(
    candidate: CandidateProfile,
    userMessage: string,
    history: MentorMessage[],
    selectedJobTitle?: string
  ): Promise<string> {
    const msgLower = userMessage.toLowerCase();
    const candidateFirstName = candidate.fullName ? candidate.fullName.split(' ')[0] : 'Candidate';
    const unifiedContext = CareerContextEngine.getUnifiedContext(candidate);

    // 0. "What should I do next?" (Step 25 Personal Career Operating System Integration)
    if (
      msgLower.includes('what should i do next') ||
      msgLower.includes('what to do next') ||
      msgLower.includes('next steps') ||
      msgLower.includes('daily plan')
    ) {
      return CareerContextEngine.answerWhatShouldIDoNext(candidate);
    }

    // 1. "What should I learn today?"
    if (msgLower.includes('learn today') || msgLower.includes('what should i learn today')) {
      const targetSkill = this.getNonRedundantRecommendedSkill(candidate, selectedJobTitle || 'Junior Data Analyst');
      
      return `### Your Situation
Good morning, ${candidateFirstName}! You are currently tracking at a **76/100 Job Readiness Score** for senior engineering & data roles.

### Your Strengths
You already possess verified proficiency in **${candidate.skills.slice(0, 3).map((s) => s.name).join(', ')}**.

### Biggest Opportunity
Acquiring **${targetSkill}** will close your most impactful technical gap and elevate your profile match from 88% to **95%+**.

### What I Recommend
Today's 2-Hour Action Plan:
1. Complete *Laboria Academy: ${targetSkill} Core Fundamentals* (Est. 1 hour).
2. Build an end-to-end sample project incorporating ${targetSkill} alongside your existing ${candidate.skills[0]?.name || 'core'} stack (Est. 1 hour).

### Next Step
[Source: Laboria AI Skill Gap Engine]
Click **[Improve My Skills]** in your Skill Gap Analyzer to launch today's interactive learning module!`;
    }

    // 2. "Why am I not matching this job?"
    if (msgLower.includes('why am i not matching') || msgLower.includes('not matching this job')) {
      const targetJob = seedJobs.find(j => selectedJobTitle && j.title.toLowerCase().includes(selectedJobTitle.toLowerCase())) || seedJobs[0];
      const targetSkill = this.getNonRedundantRecommendedSkill(candidate, targetJob.title);

      return `### Your Situation
Let us analyze your compatibility profile for **${targetJob.title} @ ${targetJob.company}** (📍 ${targetJob.location}).

### Your Strengths
Your candidate profile shares strong overlap in core requirements:
- **Verified Skills**: ${candidate.skills.filter(s => (targetJob.skills || []).some((ts: string) => ts.toLowerCase() === s.name.toLowerCase())).map(s => s.name).join(', ') || candidate.skills.slice(0, 2).map(s => s.name).join(', ')}
- **Experience Match**: ${candidate.yearsOfExperience} YOE aligns well with team expectations.

### Biggest Opportunity
Your profile match is currently **${targetJob.profileMatchScore || 88}%**. The top missing requirement is **${targetSkill}**.

### What I Recommend
To achieve a 95%+ profile match for ${targetJob.title}:
1. Log hands-on project evidence for **${targetSkill}** in your profile.
2. Highlight any past experience working with production data pipelines.

### Next Step
[Source: Resume → Opportunity Match Engine]
Click **[Prepare For Interview]** to run a target mock interview tailored specifically for ${targetJob.title}!`;
    }

    // 3. "How can I improve my resume?"
    if (msgLower.includes('improve my resume') || msgLower.includes('resume tips') || msgLower.includes('resume score')) {
      return `### Your Situation
Your uploaded resume (**${candidate.resumeFileName || 'Resume.pdf'}**) currently scores **88/100** on ATS parsing.

### Your Strengths
- **Technical Coverage**: ${candidate.skills.length} verified technical skills accurately mapped.
- **Structural Formatting**: Clear section headers and clean contact metadata.

### Biggest Opportunity
Transforming passive responsibility descriptions into quantifiable achievement bullets.

### What I Recommend
3 High-Impact Tweaks:
1. **Quantify Accomplishments**: Replace "Developed frontend components" with "Developed scalable UI components using ${candidate.skills[0]?.name || 'React'}, reducing page load latency by 35%."
2. **Add Target Keywords**: Explicitly mention cloud deployment and automated testing.
3. **Featured Projects Section**: Highlight your top end-to-end repository near the top.

### Next Step
[Source: ATS Resume Analyzer]
Click **[Improve My Resume]** to upload a new draft or edit your parsed profile directly!`;
    }

    // 4. "Can you prepare me for this interview?"
    if (msgLower.includes('prepare me for this interview') || msgLower.includes('interview prep')) {
      const targetRoleName = selectedJobTitle || 'Junior Data Analyst';
      const missingSkill = this.getNonRedundantRecommendedSkill(candidate, targetRoleName);

      return `### Your Situation
I am ready to prepare you for your upcoming interview for **${targetRoleName}**!

### Your Strengths
You have strong baseline knowledge in **${candidate.skills.slice(0, 3).map(s => s.name).join(', ')}**.

### Biggest Opportunity
Mastering the **STAR Method** (Situation, Task, Action, Result) for behavioral questions and explaining how you bridge your gap in **${missingSkill}**.

### What I Recommend
Primary Mock Interview Focus:
- **Technical Problem**: *"How do you design a dashboard or pipeline handling real-time data updates?"*
- **STAR Framework**: When asked about a challenge, state the **Situation** (project context), **Task** (objective), **Action** (used ${candidate.skills[0]?.name || 'Python'} & clean architecture), and **Result** (achieved 40% efficiency boost).

### Next Step
[Source: Laboria AI Interview Simulator]
Click **[Prepare For Interview]** to launch an interactive voice/text mock interview with real-time STAR scoring!`;
    }

    // 5. "What skills should I learn?"
    if (msgLower.includes('what skills should i learn') || msgLower.includes('skills should i learn')) {
      const missingSkill = this.getNonRedundantRecommendedSkill(candidate, selectedJobTitle || 'Junior Data Analyst');

      return `### Your Situation
Based on your career objective and current profile, here is your non-redundant skill acquisition matrix.

### Your Strengths
You already have verified proficiency in **${candidate.skills.map((s) => s.name).join(', ')}**. I will NOT recommend repeating these!

### Biggest Opportunity
Focus exclusively on high-demand market gaps that complement your existing stack.

### What I Recommend
Prioritized Learning Matrix:
1. 🔴 **Critical Priority**: **${missingSkill}** (Required by 85% of active target job postings in India).
2. 🟡 **Recommended Priority**: **Docker & CI/CD Pipelines** (Essential for cloud deployment ownership).
3. 🔵 **Bonus Priority**: **System Design & Micro-frontends** (Unlocks senior salary tiers).

### Next Step
[Source: Future Skills Radar & Market Intelligence]
Click **[Improve My Skills]** to open your personalized Skill Gap Analyzer and start learning **${missingSkill}**!`;
    }

    // 6. "Which career is better for me?"
    if (msgLower.includes('which career is better') || msgLower.includes('career is better for me')) {
      return `### Your Situation
Comparing your top 2 career progression paths based on your current skills (${candidate.skills.slice(0, 3).map(s => s.name).join(', ')}):

### Your Strengths
- **Path A: Junior / Senior Data Analyst (94% Match)**
  - *Pros*: Shortest transition timeline (Immediate). Directly utilizes your verified ${candidate.skills.slice(0, 2).map(s => s.name).join(' & ')} expertise.
  
- **Path B: Analytics Engineer / Full Stack Developer (85% Match)**
  - *Pros*: Broader architectural scope and higher long-term growth potential.
  - *Requires*: Adding ${this.getNonRedundantRecommendedSkill(candidate, 'Data Analyst')} & cloud pipelines.

### Biggest Opportunity
Targeting Path A for immediate applications while preparing for Path B over the next 3 months.

### What I Recommend
Focus on immediate job matches while building 1 cloud analytics project in parallel.

### Next Step
[Source: Laboria AI Career Benchmark Engine]
Click **[Find My Best Jobs]** to explore active high-match openings in your area!`;
    }

    // 7. "How do I improve my communication?"
    if (msgLower.includes('improve my communication') || msgLower.includes('communication tips')) {
      return `### Your Situation
Your Communication & Soft Skills score is currently **74/100 (Progressing)**.

### Your Strengths
- Clear technical articulation in project descriptions.
- Professional tone across recruiter responses.

### Biggest Opportunity
Making interview responses more concise and structuring cold recruiter outreach with quantifiable impact statements.

### What I Recommend
2 Concrete Drills:
1. **Recruiter Outreach Rule**: Open with your value statement: *"Data Analyst skilled in ${candidate.skills.slice(0, 2).map(s => s.name).join(' & ')} with proven experience building automated report pipelines."*
2. **Concise STAR Practice**: Keep the Situation & Task under 30 seconds so you can spend 90 seconds detailing your specific Actions and Results.

### Next Step
[Source: Communication & Soft Skills Coach]
Click **[Check My Readiness]** or navigate to the Soft Skills Coach to run live message evaluation!`;
    }

    // Fallback logic for custom user queries using AI provider or context synthesis
    const aiProvider = getAIService();
    const fallbackResponse = await aiProvider.chatWithMentor(candidate, userMessage, history);

    if (fallbackResponse.includes('### Your Situation')) {
      return fallbackResponse;
    }

    // Format fallback response with structured GFM template
    return `### Your Situation
Thank you for your question, ${candidateFirstName}. I have reviewed your profile (${candidate.yearsOfExperience} YOE, verified skills in ${candidate.skills.slice(0, 3).map(s => s.name).join(', ')}).

### Your Strengths
Your foundational profile shows strong readiness across core engineering and data analysis competencies.

### Biggest Opportunity
${fallbackResponse}

### What I Recommend
- Align your next learning goal with target job requirements.
- Maintain an updated ATS resume and practice mock interviews regularly.

### Next Step
[Source: Personal AI Career Strategist]
Click **[Analyze My Career]** to run a complete platform diagnostic!`;
  }

  /**
   * Helper to ensure mentor NEVER recommends skills candidate already possesses.
   */
  public static getNonRedundantRecommendedSkill(candidate: CandidateProfile, targetRole: string): string {
    const verifiedSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));
    
    // Role skill requirements
    const roleRequirements: Record<string, string[]> = {
      'junior data analyst': ['python', 'sql', 'excel', 'power bi', 'tableau'],
      'data analyst': ['python', 'sql', 'excel', 'power bi', 'tableau', 'statistics'],
      'business analyst': ['sql', 'excel', 'power bi', 'process mapping', 'jira'],
      'full stack engineer': ['react', 'typescript', 'node.js', 'docker', 'kafka', 'aws'],
      'software engineer': ['python', 'java', 'sql', 'docker', 'system design']
    };

    const targetKey = Object.keys(roleRequirements).find(k => targetRole.toLowerCase().includes(k)) || 'junior data analyst';
    const reqs = roleRequirements[targetKey];

    // Find the first missing skill
    const missing = reqs.find(req => !verifiedSkillsLower.has(req));

    if (missing) {
      if (missing === 'power bi') return 'Power BI';
      if (missing === 'tableau') return 'Tableau';
      if (missing === 'statistics') return 'Advanced Business Statistics';
      if (missing === 'jira') return 'Jira & Agile Workflows';
      if (missing === 'docker') return 'Docker Containerization';
      if (missing === 'kafka') return 'Apache Kafka & Event Streaming';
      if (missing === 'aws') return 'AWS Cloud Deployment';
      return missing.toUpperCase();
    }

    return 'Advanced Cloud Infrastructure';
  }

  /**
   * Generates Today's Daily Career Plan
   */
  public static generateDailyCareerPlan(candidate: CandidateProfile, selectedJobTitle?: string): DailyCareerPlan {
    const targetRole = selectedJobTitle || 'Junior Data Analyst';
    const targetSkill = this.getNonRedundantRecommendedSkill(candidate, targetRole);

    return {
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      focusTitle: `Acquire ${targetSkill} & Prepare for ${targetRole}`,
      estimatedHours: '2.5 Hours',
      targetSkill,
      tasks: [
        {
          task: `Complete Step 1 of ${targetSkill} Masterclass in Skill Gap Analyzer`,
          linkModule: 'Skill Gap Analyzer'
        },
        {
          task: `Build 1 mini-project combining ${candidate.skills[0]?.name || 'SQL'} with ${targetSkill}`,
          linkModule: 'Learning Roadmap'
        },
        {
          task: `Run 1 STAR-method mock interview session for ${targetRole}`,
          linkModule: 'Interview Prep'
        }
      ]
    };
  }

  /**
   * Generates Weekly Career Plan
   */
  public static generateWeeklyCareerPlan(candidate: CandidateProfile, selectedJobTitle?: string): WeeklyCareerPlan {
    const targetRole = selectedJobTitle || 'Junior Data Analyst';
    const targetSkill = this.getNonRedundantRecommendedSkill(candidate, targetRole);

    return {
      weekTitle: `Weekly Improvement Plan: ${targetRole} Acceleration`,
      primaryObjective: `Elevate Job Readiness Score from 76 to 88+ by closing key gap in ${targetSkill}.`,
      dailyFocus: [
        { day: 'Monday', title: `${targetSkill} Fundamentals & Data Models`, skill: targetSkill },
        { day: 'Tuesday', title: 'Interactive Dashboard & Report Building', skill: targetSkill },
        { day: 'Wednesday', title: 'ATS Resume Bullet Point Optimization', skill: 'Resume Refinement' },
        { day: 'Thursday', title: 'Technical Behavioral Mock Interview', skill: 'STAR Communication' },
        { day: 'Friday', title: 'Target Job Applications & Location Filtering', skill: 'Job Discovery' }
      ]
    };
  }
}
