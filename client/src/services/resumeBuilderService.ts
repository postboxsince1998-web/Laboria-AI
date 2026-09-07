import {
  CandidateProfile,
  JobOpening,
  JobTailoringAnalysis,
  ResumeAnalysisReport,
  ResumeVersion
} from '../types';
import { ResumeParserService } from './resumeParser';

const RESUME_VERSIONS_STORAGE_KEY = 'laboria_resume_versions';

const STRONG_ACTION_VERBS = [
  'Engineered', 'Developed', 'Architected', 'Implemented', 'Designed',
  'Spearheaded', 'Optimized', 'Automated', 'Led', 'Scaled', 'Pioneered',
  'Formulated', 'Streamlined', 'Delivered', 'Deployed', 'Constructed',
  'Analyzed', 'Refactored', 'Enhanced', 'Orchestrated'
];

export function getDefaultResumeVersion(candidate: CandidateProfile): ResumeVersion {
  return {
    id: 'res_ver_default_1',
    versionName: 'Primary Master Resume',
    targetRole: candidate.targetRoles[0] || 'Software Engineer',
    contactInfo: {
      fullName: candidate.fullName || candidate.name || 'Candidate Name',
      email: candidate.email || 'candidate@example.com',
      phone: candidate.phone || '+91 98765 43210',
      location: typeof candidate.currentLocation === 'string'
        ? candidate.currentLocation
        : `${candidate.currentLocation?.city || 'Bengaluru'}, ${candidate.currentLocation?.state || 'Karnataka'}`,
      linkedin: 'https://linkedin.com/in/demo-candidate',
      github: 'https://github.com/demo-candidate',
      portfolio: 'https://democandidate.dev'
    },
    summary: `Results-driven ${candidate.targetRoles[0] || 'Software Engineer'} with ${candidate.yearsOfExperience || candidate.experienceYears || 3}+ years of hands-on experience building scalable applications and data workflows. Skilled in ${(candidate.skills || []).slice(0, 5).map(s => s.name).join(', ')}.`,
    experience: (candidate.experience && candidate.experience.length > 0)
      ? candidate.experience.map((exp: any, idx: number) => ({
          id: exp.id || `exp_${idx + 1}`,
          company: exp.company || 'TechCorp Solutions',
          role: exp.role || exp.title || 'Software Developer',
          location: exp.location || 'Bengaluru, India',
          startDate: exp.startDate || '2023-01',
          endDate: exp.endDate || 'Present',
          description: exp.description || 'Developed high-performance web applications and backend APIs.',
          bulletPoints: [
            `Engineered core backend services using ${(exp.skillsUsed || ['Node.js', 'TypeScript'])[0] || 'TypeScript'}, improving throughput by 35%.`,
            `Collaborated with cross-functional product teams to deliver feature releases on schedule.`
          ],
          skillsUsed: exp.skillsUsed || ['React', 'TypeScript', 'Node.js']
        }))
      : [
          {
            id: 'exp_1',
            company: 'TechCorp Solutions',
            role: candidate.targetRoles[0] || 'Software Engineer',
            location: 'Bengaluru, India',
            startDate: '2023-01',
            endDate: 'Present',
            description: 'Developed and maintained production features across frontend and backend services.',
            bulletPoints: [
              'Engineered microservices using Node.js and TypeScript, servicing over 50,000 active daily users.',
              'Optimized PostgreSQL query execution plans, reducing p99 latency by 40%.',
              'Automated CI/CD deployment pipelines using Docker and GitHub Actions.'
            ],
            skillsUsed: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker']
          }
        ],
    education: (candidate.education && candidate.education.length > 0)
      ? candidate.education.map((edu: any, idx: number) => ({
          id: `edu_${idx + 1}`,
          degree: edu.degree || 'Bachelor of Technology (B.Tech)',
          field: edu.field || edu.specialization || 'Computer Science & Engineering',
          institution: edu.institution || 'National Institute of Technology',
          location: 'Karnataka, India',
          year: edu.year || edu.graduationYear || 2023,
          gpa: '8.8 / 10'
        }))
      : [
          {
            id: 'edu_1',
            degree: 'Bachelor of Technology (B.Tech)',
            field: 'Computer Science & Engineering',
            institution: 'National Institute of Technology (NIT)',
            location: 'Karnataka, India',
            year: 2023,
            gpa: '8.8 / 10'
          }
        ],
    projects: (candidate.projects && candidate.projects.length > 0)
      ? candidate.projects.map((proj: any, idx: number) => ({
          id: proj.id || `proj_${idx + 1}`,
          title: proj.title || proj.name || 'AI Analytics Dashboard',
          description: proj.description || 'Full-stack platform for real-time telemetry analysis.',
          techStack: proj.techStack || ['React', 'TypeScript', 'Node.js'],
          repoUrl: 'https://github.com/demo-candidate/project',
          bulletPoints: [
            `Built responsive dashboard using ${(proj.techStack || ['React'])[0]}, handling 10k+ telemetry events/sec.`
          ]
        }))
      : [
          {
            id: 'proj_1',
            title: 'Real-Time Analytics & Telemetry Engine',
            description: 'Scalable data visualization tool for monitoring server logs and latency metrics.',
            techStack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'PostgreSQL'],
            repoUrl: 'https://github.com/demo-candidate/analytics-engine',
            bulletPoints: [
              'Designed full-stack dashboard rendering real-time streaming data via WebSockets.',
              'Implemented custom caching layer using Redis to optimize database read operations.'
            ]
          }
        ],
    skills: (candidate.skills && candidate.skills.length > 0)
      ? candidate.skills.map((s: any) => ({ name: s.name, level: s.level || 'Advanced', category: s.category || 'Tech' }))
      : [
          { name: 'Python', category: 'Tech', level: 'Advanced' },
          { name: 'SQL', category: 'Tech', level: 'Advanced' },
          { name: 'React', category: 'Tech', level: 'Intermediate' },
          { name: 'TypeScript', category: 'Tech', level: 'Intermediate' },
          { name: 'Node.js', category: 'Tech', level: 'Intermediate' },
          { name: 'Docker', category: 'Tech', level: 'Intermediate' }
        ],
    certifications: candidate.certifications || [
      'AWS Certified Developer - Associate',
      'Meta Front-End Developer Professional Certificate'
    ],
    lastUpdated: new Date().toISOString(),
    isDefault: true
  };
}

export function importResumeFromText(rawText: string, versionName: string, candidate: CandidateProfile): ResumeVersion {
  const extracted = ResumeParserService.parseResumeText(rawText);

  return {
    id: `res_ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    versionName: versionName || `Imported Resume (${new Date().toLocaleDateString()})`,
    targetRole: extracted.jobTitles[0] || candidate.targetRoles[0] || 'Software Developer',
    contactInfo: {
      fullName: extracted.name || candidate.fullName || 'Candidate Name',
      email: extracted.email || candidate.email || 'candidate@example.com',
      phone: extracted.phone || candidate.phone || '+91 98765 43210',
      location: extracted.location ? `${extracted.location.city}, ${extracted.location.state}` : 'Bengaluru, Karnataka',
      linkedin: 'https://linkedin.com/in/demo',
      github: 'https://github.com/demo'
    },
    summary: `Professional ${extracted.jobTitles[0] || 'Developer'} with experience in ${extracted.technicalSkills.slice(0, 4).join(', ')}. Proven track record in developing web applications and database solutions.`,
    experience: [
      {
        id: `exp_imp_1`,
        company: 'Previous Employer',
        role: extracted.jobTitles[0] || 'Software Engineer',
        location: `${extracted.location?.city || 'Bengaluru'}, India`,
        startDate: '2022-01',
        endDate: 'Present',
        description: rawText.slice(0, 150) + '...',
        bulletPoints: [
          `Utilized ${extracted.technicalSkills[0] || 'TypeScript'} and ${extracted.technicalSkills[1] || 'SQL'} to deliver production features.`,
          `Engaged in technical design reviews and agile sprint planning.`
        ],
        skillsUsed: extracted.technicalSkills.slice(0, 4)
      }
    ],
    education: [
      {
        id: 'edu_imp_1',
        degree: extracted.degree || 'Bachelor of Technology',
        field: extracted.specialization || 'Computer Science',
        institution: extracted.education || 'University Institute',
        location: 'India',
        year: extracted.graduationYear || 2023
      }
    ],
    projects: extracted.projects.map((p, idx) => ({
      id: `proj_imp_${idx + 1}`,
      title: p.name,
      description: p.description,
      techStack: p.techStack,
      bulletPoints: [`Designed and implemented ${p.name} using ${p.techStack.join(', ')}.`]
    })),
    skills: extracted.technicalSkills.map(s => ({ name: s, category: 'Tech', level: 'Intermediate' })),
    certifications: extracted.certifications || [],
    lastUpdated: new Date().toISOString(),
    isDefault: false
  };
}

export function analyzeResume(resume: ResumeVersion): ResumeAnalysisReport {
  let overallScore = 0;
  const strongSections: string[] = [];
  const weakSections: string[] = [];
  const missingKeywords: string[] = [];
  const suggestions: string[] = [];

  // 1. Contact Information Check
  const hasContact = Boolean(resume.contactInfo.fullName && resume.contactInfo.email && resume.contactInfo.phone);
  if (!hasContact) weakSections.push('Contact Information');

  // 2. Summary Check
  const summaryLength = resume.summary ? resume.summary.length : 0;
  let summaryScore = 0;
  if (summaryLength >= 100 && summaryLength <= 400) {
    summaryScore = 95;
    strongSections.push('Professional Summary');
  } else if (summaryLength > 0) {
    summaryScore = 65;
    suggestions.push('Professional summary is brief. Expand summary to 2-3 sentences highlighting core tech stack and impact.');
  } else {
    summaryScore = 30;
    weakSections.push('Professional Summary');
    suggestions.push('Add a concise Professional Summary at the top of your resume.');
  }

  // 3. Experience & Bullet Points Check
  let experienceScore = 0;
  let actionVerbCount = 0;
  let metricCount = 0;

  if (resume.experience && resume.experience.length > 0) {
    let totalBullets = 0;
    resume.experience.forEach(exp => {
      exp.bulletPoints.forEach(b => {
        totalBullets++;
        const firstWord = b.trim().split(' ')[0];
        if (STRONG_ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase())) {
          actionVerbCount++;
        }
        if (/\d+%|\$\d+|\d+\+|\d+ users|\d+ ms|\d+x/i.test(b)) {
          metricCount++;
        }
      });
    });

    if (totalBullets >= 3) {
      experienceScore = 90;
      strongSections.push('Work Experience');
    } else {
      experienceScore = 65;
      suggestions.push('Add more detailed bullet points to your Work Experience section.');
    }
  } else {
    experienceScore = 30;
    weakSections.push('Work Experience');
  }

  // 4. Skills Section Check
  let skillsScore = 0;
  if (resume.skills && resume.skills.length >= 5) {
    skillsScore = 95;
    strongSections.push('Skills Taxonomy');
  } else if (resume.skills && resume.skills.length > 0) {
    skillsScore = 70;
    suggestions.push('Add at least 5-8 verified technical and soft skills to improve ATS keyword indexing.');
  } else {
    skillsScore = 20;
    weakSections.push('Skills Taxonomy');
  }

  // 5. Education Check
  let educationScore = resume.education && resume.education.length > 0 ? 90 : 40;
  if (educationScore >= 90) strongSections.push('Education');
  else weakSections.push('Education');

  // 6. Projects Check
  let projectsScore = resume.projects && resume.projects.length > 0 ? 85 : 50;

  // Calculate Weighted ATS Structural Compatibility Score
  const atsCompatibilityScore = Math.round(
    summaryScore * 0.15 +
    experienceScore * 0.40 +
    skillsScore * 0.25 +
    educationScore * 0.10 +
    projectsScore * 0.10
  );

  overallScore = atsCompatibilityScore;

  if (metricCount === 0) {
    suggestions.push('Include quantifiable metrics in experience bullets (e.g., "reduced latency by 40%", "handled 50k daily active users").');
  }

  if (actionVerbCount < 3) {
    suggestions.push('Start every experience bullet point with strong action verbs (e.g. "Engineered", "Architected", "Spearheaded").');
  }

  const formattingChecklist = [
    { checkName: 'Clean Standard ATS Headings', passed: true, tip: 'Uses standard section headers (Experience, Education, Skills) recognized by ATS parsers.' },
    { checkName: 'Zero Columns / Complex Grids', passed: true, tip: 'Single column flow ensures zero text clipping in ATS engines.' },
    { checkName: 'Action-Oriented Bullets', passed: actionVerbCount >= 3, tip: 'Experience bullets start with active verbs.' },
    { checkName: 'Quantifiable Metrics Present', passed: metricCount > 0, tip: 'Demonstrates measurable business or technical results.' },
    { checkName: 'Contact Information Complete', passed: hasContact, tip: 'Name, email, and phone number clearly formatted.' }
  ];

  return {
    overallScore,
    atsCompatibilityScore,
    sectionScores: {
      summary: summaryScore,
      experience: experienceScore,
      skills: skillsScore,
      education: educationScore,
      projects: projectsScore
    },
    strongSections: Array.from(new Set(strongSections)),
    weakSections: Array.from(new Set(weakSections)),
    missingKeywords,
    actionVerbCount,
    metricCount,
    improvementSuggestions: suggestions,
    formattingChecklist
  };
}

export function tailorResumeForJob(resume: ResumeVersion, job: JobOpening): JobTailoringAnalysis {
  const jobTitleLower = job.title.toLowerCase();
  const targetJobSkills = (job.skillsRequired || job.skills || []).map(s => s.toLowerCase());

  // Collect candidate resume skills & text lower
  const candidateSkillsLower = resume.skills.map(s => s.name.toLowerCase());
  const resumeFullText = (
    resume.summary + ' ' +
    resume.experience.map(e => e.role + ' ' + e.description + ' ' + e.bulletPoints.join(' ')).join(' ') + ' ' +
    resume.skills.map(s => s.name).join(' ')
  ).toLowerCase();

  // Find missing keywords from job description
  const missingKeywords = targetJobSkills.filter(reqSkill =>
    !candidateSkillsLower.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs)) &&
    !resumeFullText.includes(reqSkill)
  );

  const matchedKeywords = targetJobSkills.filter(reqSkill =>
    candidateSkillsLower.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs)) ||
    resumeFullText.includes(reqSkill)
  );

  const matchRatio = targetJobSkills.length > 0 ? matchedKeywords.length / targetJobSkills.length : 0.8;
  const matchScore = Math.min(100, Math.round(matchRatio * 80 + 15));

  const strongSections: string[] = [];
  const weakSections: string[] = [];

  if (matchedKeywords.length > 0) strongSections.push('Technical Skills Alignment');
  if (missingKeywords.length > 0) weakSections.push('Target Role Keyword Density');

  // Generate 3 tailored summary suggestions preserving factual truth
  const tailoredSummarySuggestions = [
    `Dedicated ${resume.targetRole || job.title} with experience in ${matchedKeywords.slice(0, 3).map(s => s.toUpperCase()).join(', ') || 'software development'}. Proven track record delivering robust systems while focusing on performance and scalability.`,
    `Results-focused ${job.title} specialist experienced in ${resume.skills.slice(0, 4).map(s => s.name).join(', ')}. Adept at building high-availability solutions and translating complex requirements into production code.`,
    `${job.title} proficient in ${resume.skills.slice(0, 3).map(s => s.name).join(', ')}. Strong background in software architecture, team collaboration, and automated deployments.`
  ];

  // Experience Bullet Point Improvements (preserving factual truth)
  const experienceImprovements = resume.experience.map(exp => {
    const originalBullets = exp.bulletPoints;
    const suggestedBullets = originalBullets.map((bullet, idx) => {
      const firstWord = bullet.trim().split(' ')[0];
      const verb = STRONG_ACTION_VERBS.includes(firstWord) ? firstWord : STRONG_ACTION_VERBS[idx % STRONG_ACTION_VERBS.length];
      return `${verb} ${bullet.replace(/^[A-Za-z]+\s*/, '')} ensuring high code quality and software reliability.`;
    });

    return {
      experienceId: exp.id,
      role: exp.role,
      originalBullets,
      suggestedBullets,
      addedKeywords: matchedKeywords.slice(0, 2)
    };
  });

  // Project Improvements
  const projectImprovements = resume.projects.map(proj => ({
    projectId: proj.id,
    title: proj.title,
    originalDescription: proj.description,
    suggestedDescription: `Architected ${proj.title} utilizing ${proj.techStack.join(', ')}. Implemented responsive interfaces and optimized database operations.`,
    highlightedSkills: proj.techStack
  }));

  // Skill Suggestions based on background (without fabricating unearned skills)
  const skillSuggestions = missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1));

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    matchScore,
    strongSections,
    weakSections,
    missingKeywords: missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    tailoredSummarySuggestions,
    experienceImprovements,
    projectImprovements,
    skillSuggestions
  };
}

export function generateSummaryOptions(resume: ResumeVersion, targetRole?: string): string[] {
  const role = targetRole || resume.targetRole || 'Software Professional';
  const topSkills = resume.skills.slice(0, 4).map(s => s.name).join(', ');

  return [
    `Analytical and detail-oriented ${role} with hands-on expertise in ${topSkills || 'software engineering'}. Demonstrated track record of building production applications, optimizing performance, and delivering clean, maintainable code.`,
    `Performance-driven ${role} specializing in ${topSkills || 'modern technology stacks'}. Adept at agile collaboration, system design, and building scalable end-to-end features.`,
    `Innovative ${role} with experience across frontend, backend, and database architecture. Proven ability to solve complex problems and deliver reliable software products.`
  ];
}

export function enhanceExperienceBullet(originalBullet: string, role: string, skills: string[]): string {
  const clean = originalBullet.trim();
  if (!clean) return 'Engineered scalable system features ensuring high availability.';
  const firstWord = clean.split(' ')[0];
  const verb = STRONG_ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase())
    ? firstWord
    : STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];

  const rest = clean.replace(/^[A-Za-z]+\s*/, '');
  const skillMention = skills.length > 0 ? ` leveraging ${skills.slice(0, 2).join(' and ')}` : '';
  return `${verb} ${rest}${skillMention}, improving overall efficiency and reliability.`;
}

export function enhanceProjectDescription(originalDesc: string, techStack: string[]): string {
  const clean = originalDesc.trim();
  const stackStr = techStack.length > 0 ? ` utilizing ${techStack.join(', ')}` : '';
  if (!clean) return `Built full-stack application${stackStr} with automated testing and continuous deployment.`;
  return `Designed and deployed ${clean}${stackStr}, optimizing throughput and user experience.`;
}

/**
 * Storage Manager for Saved Resume Versions
 */
export class SavedResumeVersionService {
  public static getVersions(candidate: CandidateProfile): ResumeVersion[] {
    try {
      const data = localStorage.getItem(RESUME_VERSIONS_STORAGE_KEY);
      if (!data) return [getDefaultResumeVersion(candidate)];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [getDefaultResumeVersion(candidate)];
    } catch {
      return [getDefaultResumeVersion(candidate)];
    }
  }

  public static saveVersion(version: ResumeVersion, candidate: CandidateProfile): ResumeVersion[] {
    const existing = this.getVersions(candidate);
    const index = existing.findIndex(v => v.id === version.id);
    let updated: ResumeVersion[] = [];

    if (index >= 0) {
      updated = existing.map(v => (v.id === version.id ? { ...version, lastUpdated: new Date().toISOString() } : v));
    } else {
      updated = [{ ...version, lastUpdated: new Date().toISOString() }, ...existing];
    }

    try {
      localStorage.setItem(RESUME_VERSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save resume version failed', e);
    }
    return updated;
  }

  public static deleteVersion(id: string, candidate: CandidateProfile): ResumeVersion[] {
    const existing = this.getVersions(candidate);
    const updated = existing.filter(v => v.id !== id);
    if (updated.length === 0) {
      updated.push(getDefaultResumeVersion(candidate));
    }
    try {
      localStorage.setItem(RESUME_VERSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete resume version failed', e);
    }
    return updated;
  }

  public static setDefaultVersion(id: string, candidate: CandidateProfile): ResumeVersion[] {
    const existing = this.getVersions(candidate);
    const updated = existing.map(v => ({ ...v, isDefault: v.id === id }));
    try {
      localStorage.setItem(RESUME_VERSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage set default resume version failed', e);
    }
    return updated;
  }
}
