import {
  CandidateProfile,
  CandidatePortfolio,
  PortfolioProject,
  SkillEvidenceMapping,
  PortfolioAchievement,
  WorkSample,
  SkillEvidenceSourceType
} from '../types';

const PORTFOLIO_STORAGE_KEY_PREFIX = 'laboria_portfolio_data_';
const EVIDENCE_STORAGE_KEY_PREFIX = 'laboria_skill_evidence_';

export class SavedPortfolioService {
  public static getPortfolio(candidate: CandidateProfile): CandidatePortfolio | null {
    try {
      const raw = localStorage.getItem(`${PORTFOLIO_STORAGE_KEY_PREFIX}${candidate.id}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static savePortfolio(candidate: CandidateProfile, portfolio: CandidatePortfolio): void {
    try {
      localStorage.setItem(`${PORTFOLIO_STORAGE_KEY_PREFIX}${candidate.id}`, JSON.stringify(portfolio));
    } catch (err) {
      console.warn('Failed to save portfolio to localStorage:', err);
    }
  }

  public static getEvidenceMappings(candidate: CandidateProfile): SkillEvidenceMapping[] {
    try {
      const raw = localStorage.getItem(`${EVIDENCE_STORAGE_KEY_PREFIX}${candidate.id}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static saveEvidenceMappings(candidate: CandidateProfile, mappings: SkillEvidenceMapping[]): void {
    try {
      localStorage.setItem(`${EVIDENCE_STORAGE_KEY_PREFIX}${candidate.id}`, JSON.stringify(mappings));
    } catch (err) {
      console.warn('Failed to save skill evidence mappings to localStorage:', err);
    }
  }
}

export class PortfolioService {
  /**
   * Initializes or loads Candidate Portfolio from LocalStorage or baseline Profile
   */
  public static getPortfolio(candidate: CandidateProfile): CandidatePortfolio {
    const saved = SavedPortfolioService.getPortfolio(candidate);
    if (saved) {
      return saved;
    }

    const baselineProjects: PortfolioProject[] = (candidate.projects || []).map((p, idx) => ({
      id: p.id || `proj_init_${idx + 1}`,
      title: p.title || p.name || `Project ${idx + 1}`,
      problem: `High latency and fragmented data processing across legacy client systems required a modernized real-time pipeline.`,
      technologies: p.techStack || ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
      role: 'Lead Full Stack & Analytics Developer',
      process: `Architected modular microservices using ${p.techStack ? p.techStack.join(', ') : 'TypeScript'}, built automated CI/CD validation pipelines, and optimized database indices.`,
      outcome: `Achieved 40% improvement in throughput and reduced query latency by 120ms across production workloads.`,
      learnings: `Gained deep insights into distributed cache invalidation, asynchronous state management, and real-time WebSocket connection handling.`,
      demoUrl: 'https://demo.laboria.ai/telemetry-dashboard',
      repoUrl: 'https://github.com/candidate/telemetry-dashboard',
      featured: idx === 0
    }));

    if (baselineProjects.length === 0) {
      baselineProjects.push({
        id: 'proj_sample_01',
        title: 'Real-Time Telemetry & Analytics Dashboard',
        problem: 'Engineering teams lacked real-time visibility into high-volume event streams across microservices.',
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        role: 'Full Stack Developer & System Architect',
        process: 'Designed WebSockets event ingestion pipeline, integrated virtualized canvas data tables, and implemented role-based telemetry security.',
        outcome: 'Streamlined operational decision making, handling over 50,000 telemetry events per second with zero UI frame drops.',
        learnings: 'Mastered high-performance DOM virtualization, memory leak profiling, and WebSockets reconnection backoff strategies.',
        demoUrl: 'https://demo.laboria.ai/telemetry',
        repoUrl: 'https://github.com/candidate/telemetry-system',
        featured: true
      });
    }

    const baselineCertifications = (candidate.certifications || []).map((c, idx) => ({
      id: `cert_init_${idx + 1}`,
      title: typeof c === 'string' ? c : (c as any).title || 'AWS Certified Developer',
      issuer: typeof c === 'string' ? 'Amazon Web Services' : (c as any).issuer || 'Certification Board',
      date: '2025-06-15',
      credentialUrl: 'https://aws.amazon.com/verification'
    }));

    if (baselineCertifications.length === 0) {
      baselineCertifications.push({
        id: 'cert_sample_01',
        title: 'AWS Certified Developer - Associate',
        issuer: 'Amazon Web Services (AWS)',
        date: '2025-04-10',
        credentialUrl: 'https://aws.amazon.com/verification/AWS-102938'
      });
    }

    const baselineAchievements: PortfolioAchievement[] = [
      {
        id: 'ach_01',
        title: '1st Place Winner — HackNation AI & Data Challenge 2025',
        issuerOrOrg: 'National Tech Foundation',
        date: '2025-03-20',
        description: 'Built automated document intelligence pipeline processing unstructured PDF resumes with 96% field extraction accuracy.',
        category: 'Hackathon'
      },
      {
        id: 'ach_02',
        title: 'Spot Award for Technical Excellence',
        issuerOrOrg: 'TechCorp Engineering',
        date: '2024-11-15',
        description: 'Recognized for zero-downtime database migration strategy across 3 core production databases.',
        category: 'Award'
      }
    ];

    const baselineWorkSamples: WorkSample[] = [
      {
        id: 'ws_01',
        title: 'Async Telemetry Ingestion Microservice Code Snippet',
        type: 'Code Snippet',
        description: 'TypeScript implementation of sliding-window rate limiting & async buffer flushing.',
        urlOrContent: 'https://gist.github.com/candidate/telemetry-buffer-snippet',
        tags: ['TypeScript', 'Node.js', 'System Architecture']
      },
      {
        id: 'ws_02',
        title: 'Distributed System Security & Event Pipeline Diagram',
        type: 'Architecture Diagram',
        description: 'High-level architectural blueprint outlining event flows, auth tokens, and database replications.',
        urlOrContent: 'https://laboria.ai/assets/diagram-distributed-pipeline.png',
        tags: ['System Design', 'Security', 'Cloud']
      }
    ];

    const evidenceMappings = SavedPortfolioService.getEvidenceMappings(candidate);
    if (evidenceMappings.length === 0) {
      const defaultMappings: SkillEvidenceMapping[] = [
        {
          id: 'ev_01',
          skillName: candidate.skills[0]?.name || 'TypeScript',
          sourceType: 'Project',
          title: baselineProjects[0].title,
          description: `Applied ${candidate.skills[0]?.name || 'TypeScript'} to build full stack telemetry components with strict type safety.`,
          dateLinked: '2026-09-01',
          verificationStatus: 'Verified'
        },
        {
          id: 'ev_02',
          skillName: candidate.skills[1]?.name || 'Node.js',
          sourceType: 'Experience',
          title: candidate.experience[0]?.role || 'Senior Full Stack Engineer',
          description: `Utilized ${candidate.skills[1]?.name || 'Node.js'} to design scalable microservices handling async web events.`,
          dateLinked: '2026-09-02',
          verificationStatus: 'Verified'
        },
        {
          id: 'ev_03',
          skillName: candidate.skills[2]?.name || 'React',
          sourceType: 'Certification',
          title: baselineCertifications[0].title,
          description: `Demonstrated technical mastery through verified certification course.`,
          dateLinked: '2026-09-03',
          verificationStatus: 'Verified'
        }
      ];
      SavedPortfolioService.saveEvidenceMappings(candidate, defaultMappings);
    }

    const currentMappings = SavedPortfolioService.getEvidenceMappings(candidate);

    const skillsWithEvidence = (candidate.skills || []).map((s) => {
      const sName = typeof s === 'string' ? s : s.name;
      const sLevel = typeof s === 'string' ? 'Intermediate' : s.level || 'Intermediate';
      const related = currentMappings.filter((m) => m.skillName.toLowerCase() === sName.toLowerCase());
      const sources = Array.from(new Set(related.map((r) => r.sourceType)));
      return {
        name: sName,
        level: sLevel,
        evidenceCount: related.length,
        evidenceSources: sources
      };
    });

    const portfolio: CandidatePortfolio = {
      candidateId: candidate.id,
      headline: candidate.headline || 'Full Stack & Software Engineering Candidate',
      bio: `Dedicated candidate with ${candidate.yearsOfExperience || 4} years of software development experience specializing in clean architecture, performance optimization, and real-time data products.`,
      githubUrl: 'https://github.com/candidate-portfolio',
      linkedinUrl: 'https://linkedin.com/in/candidate-profile',
      websiteUrl: 'https://candidate-portfolio.laboria.io',
      skills: skillsWithEvidence,
      projects: baselineProjects,
      certifications: baselineCertifications,
      education: candidate.education || [],
      experience: candidate.experience || [],
      achievements: baselineAchievements,
      workSamples: baselineWorkSamples,
      evidenceScore: 88,
      profileUnderstandingScore: 94
    };

    portfolio.evidenceScore = this.calculateEvidenceScore(portfolio).evidenceScore;
    portfolio.profileUnderstandingScore = this.calculateEvidenceScore(portfolio).profileUnderstandingScore;

    SavedPortfolioService.savePortfolio(candidate, portfolio);
    return portfolio;
  }

  /**
   * Calculates overall Evidence Score & Profile Understanding Score
   */
  public static calculateEvidenceScore(portfolio: CandidatePortfolio): {
    evidenceScore: number;
    profileUnderstandingScore: number;
    evidenceLevelLabel: 'High Verification' | 'Moderate Verification' | 'Basic Portfolio';
  } {
    let score = 40; // Base score

    // Projects contribution (up to 30 pts)
    const projectCount = portfolio.projects.length;
    score += Math.min(30, projectCount * 12);

    // Skill Evidence mapping contribution (up to 20 pts)
    const skillsWithEvidence = portfolio.skills.filter((s) => s.evidenceCount > 0).length;
    score += Math.min(20, skillsWithEvidence * 5);

    // Certifications & Work Samples (up to 10 pts)
    score += Math.min(5, portfolio.certifications.length * 3);
    score += Math.min(5, portfolio.workSamples.length * 2.5);

    const evidenceScore = Math.min(100, Math.round(score));
    const profileUnderstandingScore = Math.min(100, Math.round(evidenceScore * 0.95 + 5));

    const evidenceLevelLabel =
      evidenceScore >= 80 ? 'High Verification' : evidenceScore >= 60 ? 'Moderate Verification' : 'Basic Portfolio';

    return {
      evidenceScore,
      profileUnderstandingScore,
      evidenceLevelLabel
    };
  }

  /**
   * Adds or updates a portfolio project
   */
  public static saveProject(candidate: CandidateProfile, project: PortfolioProject): CandidatePortfolio {
    const portfolio = this.getPortfolio(candidate);
    const existingIdx = portfolio.projects.findIndex((p) => p.id === project.id);

    if (existingIdx >= 0) {
      portfolio.projects[existingIdx] = project;
    } else {
      portfolio.projects.unshift(project);
    }

    const scores = this.calculateEvidenceScore(portfolio);
    portfolio.evidenceScore = scores.evidenceScore;
    portfolio.profileUnderstandingScore = scores.profileUnderstandingScore;

    SavedPortfolioService.savePortfolio(candidate, portfolio);
    return portfolio;
  }

  /**
   * Deletes a project from the portfolio
   */
  public static deleteProject(candidate: CandidateProfile, projectId: string): CandidatePortfolio {
    const portfolio = this.getPortfolio(candidate);
    portfolio.projects = portfolio.projects.filter((p) => p.id !== projectId);

    const scores = this.calculateEvidenceScore(portfolio);
    portfolio.evidenceScore = scores.evidenceScore;
    portfolio.profileUnderstandingScore = scores.profileUnderstandingScore;

    SavedPortfolioService.savePortfolio(candidate, portfolio);
    return portfolio;
  }

  /**
   * Adds a skill evidence link
   */
  public static addSkillEvidence(
    candidate: CandidateProfile,
    mapping: SkillEvidenceMapping
  ): SkillEvidenceMapping[] {
    const existing = SavedPortfolioService.getEvidenceMappings(candidate);
    const updated = [mapping, ...existing.filter((m) => m.id !== mapping.id)];
    SavedPortfolioService.saveEvidenceMappings(candidate, updated);

    // Refresh portfolio evidence state
    this.getPortfolio(candidate);
    return updated;
  }

  /**
   * Removes a skill evidence link
   */
  public static removeSkillEvidence(
    candidate: CandidateProfile,
    mappingId: string
  ): SkillEvidenceMapping[] {
    const existing = SavedPortfolioService.getEvidenceMappings(candidate);
    const updated = existing.filter((m) => m.id !== mappingId);
    SavedPortfolioService.saveEvidenceMappings(candidate, updated);

    // Refresh portfolio evidence state
    this.getPortfolio(candidate);
    return updated;
  }

  /**
   * Gets all active skill evidence mappings
   */
  public static getSkillEvidenceMappings(candidate: CandidateProfile): SkillEvidenceMapping[] {
    return SavedPortfolioService.getEvidenceMappings(candidate);
  }

  /**
   * Module 1 Integration: Formats Portfolio items for ATS Resume Builder
   */
  public static generateResumePortfolioSection(portfolio: CandidatePortfolio): {
    projectsMarkdown: string;
    achievementsMarkdown: string;
    skillsEvidenceSnippet: string;
  } {
    const projectsMarkdown = portfolio.projects
      .map(
        (p) => `### ${p.title} (${p.technologies.join(', ')})
**Role:** ${p.role}
* **Problem:** ${p.problem}
* **Process:** ${p.process}
* **Outcome:** ${p.outcome}
* **Key Learnings:** ${p.learnings}`
      )
      .join('\n\n');

    const achievementsMarkdown = portfolio.achievements
      .map((a) => `* **${a.title}** (${a.issuerOrOrg}, ${a.date}): ${a.description}`)
      .join('\n');

    const skillsEvidenceSnippet = portfolio.skills
      .map((s) => `${s.name} (${s.level}) - ${s.evidenceCount} Verified Evidence Sources (${s.evidenceSources.join(', ') || 'Self-Reported'})`)
      .join('\n');

    return {
      projectsMarkdown,
      achievementsMarkdown,
      skillsEvidenceSnippet
    };
  }

  /**
   * Module 2 Integration: Calculates JD Skill Evidence Boost for Job Matching
   */
  public static calculateJobMatchingEvidenceBoost(
    portfolio: CandidatePortfolio,
    requiredSkills: string[]
  ): {
    evidenceBoostPoints: number;
    verifiedRequiredSkills: string[];
    evidenceSummary: string;
  } {
    const verifiedSkills = portfolio.skills
      .filter((s) => s.evidenceCount > 0)
      .map((s) => s.name.toLowerCase());

    const verifiedRequiredSkills = requiredSkills.filter((s) =>
      verifiedSkills.includes(s.toLowerCase())
    );

    // Boost up to 10 points on JD profile match calculation
    const evidenceBoostPoints = Math.min(10, verifiedRequiredSkills.length * 3);
    const evidenceSummary = `${verifiedRequiredSkills.length} of ${requiredSkills.length} required JD skills have verified portfolio evidence (+${evidenceBoostPoints}% Match Confidence).`;

    return {
      evidenceBoostPoints,
      verifiedRequiredSkills,
      evidenceSummary
    };
  }

  /**
   * Module 3 Integration: Generates STAR/Technical Interview Prompts from Portfolio Projects
   */
  public static generateInterviewPromptsFromPortfolio(portfolio: CandidatePortfolio): {
    projectTitle: string;
    questionText: string;
    suggestedSTARStructure: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }[] {
    return portfolio.projects.map((p) => ({
      projectTitle: p.title,
      questionText: `In your portfolio project "${p.title}", you served as ${p.role}. Can you describe how you tackled the problem: "${p.problem}" and what measurable outcomes were achieved?`,
      suggestedSTARStructure: {
        situation: p.problem,
        task: `Execute engineering solution using ${p.technologies.slice(0, 3).join(', ')}.`,
        action: p.process,
        result: p.outcome
      }
    }));
  }

  /**
   * Module 4 Integration: Generates AI Mentor recommendations for portfolio enhancement
   */
  public static generateMentorPortfolioAdvice(portfolio: CandidatePortfolio): {
    currentStatus: string;
    portfolioStrengths: string[];
    recommendedAdditions: string[];
    careerTransitionImpact: string;
  } {
    const portfolioStrengths = [
      `Structured case studies presenting problem, process, outcome, and learnings narratives.`,
      `${portfolio.projects.length} documented projects demonstrating tech stack proficiency in ${portfolio.projects[0]?.technologies.slice(0, 3).join(', ') || 'modern stacks'}.`
    ];

    const recommendedAdditions: string[] = [];
    if (portfolio.workSamples.length < 3) {
      recommendedAdditions.push('Upload an Architecture Diagram or Code Snippet work sample to showcase technical documentation skills.');
    }
    if (portfolio.certifications.length === 0) {
      recommendedAdditions.push('Link a verified industry certification (e.g. AWS, React, GCP) to strengthen skill provenance.');
    }

    if (recommendedAdditions.length === 0) {
      recommendedAdditions.push('Maintain updated repository links and live demo URLs for upcoming target job interviews!');
    }

    return {
      currentStatus: `Portfolio Evidence Verification: ${portfolio.evidenceScore}% (${portfolio.skills.filter((s) => s.evidenceCount > 0).length} verified skills).`,
      portfolioStrengths,
      recommendedAdditions,
      careerTransitionImpact: `Strong evidence backing your skills increases interview selection rate by up to 2.4x for mid/senior software roles.`
    };
  }
}
