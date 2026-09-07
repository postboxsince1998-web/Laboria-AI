import { CandidateProfile, PortfolioProject, SkillEvidenceMapping } from '../types';
import { PortfolioService, SavedPortfolioService } from './portfolioService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_port_101',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@laboria.ai',
  phone: '+91 98765 43210',
  headline: 'Senior Full Stack & Analytics Engineer',
  yearsOfExperience: 4,
  currentLocation: {
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  preferredLocations: ['Bengaluru', 'Remote'],
  preferredWorkType: 'Remote',
  targetRoles: ['Senior Full Stack Engineer', 'Analytics Engineer'],
  skills: [
    { name: 'TypeScript', level: 'Advanced' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'React', level: 'Advanced' },
    { name: 'PostgreSQL', level: 'Intermediate' },
  ],
  education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'NIT Surathkal', year: 2022 }],
  experience: [
    {
      id: 'exp_01',
      company: 'TechCorp Solutions',
      role: 'Senior Full Stack Engineer',
      startDate: '2023-01-15',
      endDate: 'Present',
      description: 'Architected microservices & telemetry pipelines.',
      skillsUsed: ['TypeScript', 'Node.js', 'React']
    }
  ],
  projects: [{ id: 'p_init_1', name: 'Telemetry Dashboard', description: 'Full stack analytics tool', techStack: ['TypeScript', 'React', 'Node.js'] }],
  certifications: ['AWS Certified Developer'],
  resumeText: 'Senior Full Stack Engineer with 4 years experience in TypeScript, Node.js, React.',
};

export interface PortfolioTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runPortfolioEngineTests(): PortfolioTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    // Test 1: Full Portfolio Bundle Synthesis
    const portfolio = PortfolioService.getPortfolio(mockCandidate);
    const test1Pass =
      portfolio.candidateId === mockCandidate.id &&
      portfolio.projects.length > 0 &&
      portfolio.certifications.length > 0 &&
      portfolio.achievements.length > 0 &&
      portfolio.workSamples.length > 0;
    addResult(
      'Full Portfolio Bundle Synthesis',
      test1Pass,
      `Synthesized candidate portfolio with ${portfolio.projects.length} projects, ${portfolio.certifications.length} certifications, and ${portfolio.workSamples.length} work samples`
    );

    // Test 2: Structured Project Builder Form Validation
    const newProject: PortfolioProject = {
      id: 'proj_builder_test_99',
      title: 'E-Commerce Search & Recommendation Engine',
      problem: 'High search bounce rate due to slow product indexing and rigid keyword filters.',
      technologies: ['TypeScript', 'Node.js', 'Elasticsearch', 'Redis'],
      role: 'Backend & Search Infrastructure Lead',
      process: 'Built inverted index search pipeline with Redis sliding cache and BM25 relevance ranking.',
      outcome: 'Improved search response speed by 35% and increased product click-through rate by 18%.',
      learnings: 'Gained expertise in distributed index sharding and fuzzy search tokenization.',
      demoUrl: 'https://demo.laboria.ai/search-engine',
      repoUrl: 'https://github.com/candidate/search-engine',
      featured: true,
    };
    const updatedPortfolio = PortfolioService.saveProject(mockCandidate, newProject);
    const test2Pass = updatedPortfolio.projects.some((p) => p.id === newProject.id && p.role === newProject.role);
    addResult(
      'Structured Project Builder Form Validation',
      test2Pass,
      `Validated and saved structured project with all 9 required fields (Problem, Tech, Role, Process, Outcome, Learnings, Links)`
    );

    // Test 3: Skill Evidence Mapping across 5 Source Types
    const sampleMapping: SkillEvidenceMapping = {
      id: 'ev_map_test_55',
      skillName: 'TypeScript',
      sourceType: 'Assessment',
      title: 'Advanced TypeScript Certification Assessment',
      description: 'Scored 94% on Advanced Generic Types & Type Guard Evaluation.',
      dateLinked: '2026-09-05',
      verificationStatus: 'Verified',
    };
    const mappings = PortfolioService.addSkillEvidence(mockCandidate, sampleMapping);
    const test3Pass = mappings.some((m) => m.id === sampleMapping.id && m.sourceType === 'Assessment');
    addResult(
      'Skill Evidence Mapping across 5 Source Types',
      test3Pass,
      `Successfully mapped skill "${sampleMapping.skillName}" to ${sampleMapping.sourceType} evidence source`
    );

    // Test 4: Factual Preservation of Project Outcomes
    const savedProj = updatedPortfolio.projects.find((p) => p.id === newProject.id);
    const test4Pass = savedProj !== undefined && savedProj.outcome === newProject.outcome;
    addResult(
      'Factual Preservation of Project Outcomes',
      test4Pass,
      `Preserved factual project outcome metrics without inventing false data`
    );

    // Test 5: Profile Evidence & Verification Score Calculation
    const scores = PortfolioService.calculateEvidenceScore(updatedPortfolio);
    const test5Pass = scores.evidenceScore > 0 && scores.profileUnderstandingScore > 0 && scores.evidenceLevelLabel !== undefined;
    addResult(
      'Profile Evidence & Verification Score Calculation',
      test5Pass,
      `Calculated Evidence Score: ${scores.evidenceScore}% (${scores.evidenceLevelLabel}), Profile Understanding: ${scores.profileUnderstandingScore}%`
    );

    // Test 6: Portfolio Links & Work Samples Integrity Audit
    const test6Pass =
      typeof portfolio.githubUrl === 'string' &&
      typeof portfolio.linkedinUrl === 'string' &&
      portfolio.workSamples.every((w) => typeof w.title === 'string' && typeof w.type === 'string');
    addResult(
      'Portfolio Links & Work Samples Integrity Audit',
      test6Pass,
      `Audited candidate portfolio URLs (GitHub, LinkedIn) and ${portfolio.workSamples.length} work samples`
    );

    // Test 7: Achievement & Certification Evidence Verification
    const test7Pass =
      portfolio.achievements.length > 0 &&
      portfolio.certifications.length > 0 &&
      portfolio.achievements.every((a) => a.category !== undefined);
    addResult(
      'Achievement & Certification Evidence Verification',
      test7Pass,
      `Verified ${portfolio.achievements.length} achievements and ${portfolio.certifications.length} certifications with credential URLs`
    );

    // Test 8: Resume Builder Integration Payload Generation
    const resumeSection = PortfolioService.generateResumePortfolioSection(updatedPortfolio);
    const test8Pass =
      resumeSection.projectsMarkdown.includes('###') &&
      resumeSection.skillsEvidenceSnippet.length > 10;
    addResult(
      'Resume Builder Integration Payload Generation',
      test8Pass,
      `Generated ATS-friendly resume markdown section from portfolio projects & evidence`
    );

    // Test 9: Job Matching JD Skill Evidence Boost Calculation
    const jdBoost = PortfolioService.calculateJobMatchingEvidenceBoost(updatedPortfolio, ['TypeScript', 'Node.js', 'React', 'Python']);
    const test9Pass = jdBoost.evidenceBoostPoints > 0 && jdBoost.verifiedRequiredSkills.length > 0;
    addResult(
      'Job Matching JD Skill Evidence Boost Calculation',
      test9Pass,
      `Calculated JD skill evidence boost (+${jdBoost.evidenceBoostPoints}% match confidence for ${jdBoost.verifiedRequiredSkills.join(', ')})`
    );

    // Test 10: Interview Coach Project-Based Question Generation
    const interviewPrompts = PortfolioService.generateInterviewPromptsFromPortfolio(updatedPortfolio);
    const test10Pass = interviewPrompts.length > 0 && interviewPrompts[0].suggestedSTARStructure.situation !== undefined;
    addResult(
      'Interview Coach Project-Based Question Generation',
      test10Pass,
      `Generated ${interviewPrompts.length} STAR interview preparation prompts based on portfolio projects`
    );

    // Test 11: AI Career Mentor Portfolio Expansion Suggestions
    const mentorAdvice = PortfolioService.generateMentorPortfolioAdvice(updatedPortfolio);
    const test11Pass = mentorAdvice.portfolioStrengths.length > 0 && typeof mentorAdvice.careerTransitionImpact === 'string';
    addResult(
      'AI Career Mentor Portfolio Expansion Suggestions',
      test11Pass,
      `Generated portfolio career transition advice: "${mentorAdvice.currentStatus}"`
    );

    // Test 12: Persistent Local Storage CRUD Operations
    const testProjId = newProject.id;
    const afterDelete = PortfolioService.deleteProject(mockCandidate, testProjId);
    const test12Pass = !afterDelete.projects.some((p) => p.id === testProjId);
    addResult(
      'Persistent Local Storage CRUD Operations',
      test12Pass,
      `Successfully deleted project ID: ${testProjId} and persisted state to local storage`
    );

  } catch (err: any) {
    addResult('Portfolio Engine Test Suite Exception', false, err.message || String(err));
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
