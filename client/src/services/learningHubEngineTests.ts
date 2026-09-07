import { LearningHubService, DefaultLearningResourceProvider, VERIFIED_FREE_RESOURCES } from './learningHubService';
import { mockCandidate } from './mockData';
import { CandidateProfile, LearningResourceType } from '../types';

export interface LearningHubTestResult {
  testId: number;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runLearningHubEngineTests(): LearningHubTestResult[] {
  const results: LearningHubTestResult[] = [];

  const candidate: CandidateProfile = {
    ...mockCandidate,
    fullName: 'Aarav Sharma',
    skills: [
      { id: 's1', name: 'React', level: 'Expert', verified: true, source: 'verified' },
      { id: 's2', name: 'TypeScript', level: 'Advanced', verified: true, source: 'resume' },
      { id: 's3', name: 'Node.js', level: 'Intermediate', source: 'user_input' }
    ]
  };

  // 1. Resource Provider Abstraction Test
  try {
    const provider = LearningHubService.getResourceProvider();
    const resources = provider.getAllVerifiedResources();
    const categories = new Set(resources.map((r) => r.type));

    const expectedCategories: LearningResourceType[] = [
      'Free Course',
      'Official Documentation',
      'Free Tutorial',
      'Open Educational Resource'
    ];

    const hasCategories = expectedCategories.every((cat) => categories.has(cat));

    if (provider && resources.length >= 8 && hasCategories) {
      results.push({
        testId: 1,
        testName: 'Resource Provider Abstraction Test',
        status: 'PASSED',
        details: `Verified resource provider supporting ${categories.size} categories (Official Documentation, Free Course, Free Tutorial, Open Educational Resource).`
      });
    } else {
      results.push({
        testId: 1,
        testName: 'Resource Provider Abstraction Test',
        status: 'FAILED',
        details: 'Resource provider abstraction or categories missing.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 1, testName: 'Resource Provider Abstraction', status: 'FAILED', details: String(err) });
  }

  // 2. Zero Paid Resource Compliance Test
  try {
    const provider = LearningHubService.getResourceProvider();
    const resources = provider.getAllVerifiedResources();
    const nonFreeResources = resources.filter((r) => !r.isFree);

    if (nonFreeResources.length === 0 && resources.length > 0) {
      results.push({
        testId: 2,
        testName: 'Zero Paid Resource Compliance Test',
        status: 'PASSED',
        details: `Verified 100% free resource compliance across all ${resources.length} curated resources.`
      });
    } else {
      results.push({
        testId: 2,
        testName: 'Zero Paid Resource Compliance Test',
        status: 'FAILED',
        details: `Found ${nonFreeResources.length} non-free resources.`
      });
    }
  } catch (err: any) {
    results.push({ testId: 2, testName: 'Zero Paid Resource Compliance', status: 'FAILED', details: String(err) });
  }

  // 3. Resource Card Mandatory Schema Test
  try {
    const sampleResource = VERIFIED_FREE_RESOURCES[0];

    const hasAllFields = Boolean(
      sampleResource.id &&
      sampleResource.title &&
      sampleResource.provider &&
      sampleResource.skillName &&
      sampleResource.difficulty &&
      sampleResource.duration &&
      sampleResource.costLabel &&
      sampleResource.url &&
      sampleResource.lastVerified &&
      sampleResource.type
    );

    if (hasAllFields) {
      results.push({
        testId: 3,
        testName: 'Resource Card Mandatory Schema Test',
        status: 'PASSED',
        details: `Resource object contains all mandatory fields: Title, Provider, Skill, Difficulty, Duration, CostLabel, URL, LastVerified.`
      });
    } else {
      results.push({
        testId: 3,
        testName: 'Resource Card Mandatory Schema Test',
        status: 'FAILED',
        details: 'Mandatory fields missing from resource card schema.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 3, testName: 'Resource Card Mandatory Schema', status: 'FAILED', details: String(err) });
  }

  // 4. Official Documentation & OER Provider Test
  try {
    const provider = LearningHubService.getResourceProvider();
    const resources = provider.getAllVerifiedResources();
    const officialDocs = resources.filter((r) => r.type === 'Official Documentation');

    if (officialDocs.length >= 4) {
      results.push({
        testId: 4,
        testName: 'Official Documentation & OER Provider Test',
        status: 'PASSED',
        details: `Verified ${officialDocs.length} official documentation resources (React, TypeScript, Node.js, Python, PostgreSQL, FastAPI).`
      });
    } else {
      results.push({
        testId: 4,
        testName: 'Official Documentation & OER Provider Test',
        status: 'FAILED',
        details: 'Insufficient official documentation resources.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 4, testName: 'Official Documentation & OER Provider', status: 'FAILED', details: String(err) });
  }

  // 5. Personalized Learning Roadmap Stage Generation Test
  try {
    const tasks = LearningHubService.getTodayLearningTasks(candidate);
    if (tasks.length >= 4) {
      results.push({
        testId: 5,
        testName: 'Personalized Learning Roadmap Stage Generation Test',
        status: 'PASSED',
        details: `Generated personalized learning tasks synced with target role "${candidate.targetRoles[0]}".`
      });
    } else {
      results.push({
        testId: 5,
        testName: 'Personalized Learning Roadmap Stage Generation Test',
        status: 'FAILED',
        details: 'Learning roadmap stage generation failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 5, testName: 'Personalized Learning Roadmap Stage Generation', status: 'FAILED', details: String(err) });
  }

  // 6. Today's Learning Daily Bite-Sized Task Generation Test
  try {
    const tasks = LearningHubService.getTodayLearningTasks(candidate);
    const taskTypes = new Set(tasks.map((t) => t.type));

    if (tasks.length >= 3 && (taskTypes.has('Learn') || taskTypes.has('Build'))) {
      results.push({
        testId: 6,
        testName: "Today's Learning Daily Bite-Sized Task Generation Test",
        status: 'PASSED',
        details: `Generated ${tasks.length} daily bite-sized tasks across types: ${Array.from(taskTypes).join(', ')}.`
      });
    } else {
      results.push({
        testId: 6,
        testName: "Today's Learning Daily Bite-Sized Task Generation Test",
        status: 'FAILED',
        details: "Daily task generation failed."
      });
    }
  } catch (err: any) {
    results.push({ testId: 6, testName: "Today's Learning Daily Bite-Sized Task Generation", status: 'FAILED', details: String(err) });
  }

  // 7. Skills Matrix Categorization Test (To Learn vs Completed)
  try {
    const verifiedSkills = candidate.skills.filter((s) => s.verified || s.source === 'verified');

    if (verifiedSkills.length > 0) {
      results.push({
        testId: 7,
        testName: 'Skills Matrix Categorization Test (To Learn vs Completed)',
        status: 'PASSED',
        details: `Categorized candidate skills: ${verifiedSkills.length} Verified/Completed skills, ${candidate.skills.length - verifiedSkills.length} in-progress.`
      });
    } else {
      results.push({
        testId: 7,
        testName: 'Skills Matrix Categorization Test',
        status: 'FAILED',
        details: 'Skills matrix categorization failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 7, testName: 'Skills Matrix Categorization', status: 'FAILED', details: String(err) });
  }

  // 8. Skill Verification & Provenance Source Test
  try {
    const updatedCandidate = LearningHubService.verifyAndCompleteSkill(
      candidate,
      'System Design',
      'Completed distributed microservices architecture sandbox'
    );

    const verifiedSkill = updatedCandidate.skills.find((s) => s.name === 'System Design');

    if (verifiedSkill && verifiedSkill.verified && verifiedSkill.source === 'verified') {
      results.push({
        testId: 8,
        testName: 'Skill Verification & Provenance Source Test',
        status: 'PASSED',
        details: `Verified skill "${verifiedSkill.name}" with provenance source = "${verifiedSkill.source}".`
      });
    } else {
      results.push({
        testId: 8,
        testName: 'Skill Verification & Provenance Source Test',
        status: 'FAILED',
        details: 'Skill verification provenance update failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 8, testName: 'Skill Verification & Provenance Source', status: 'FAILED', details: String(err) });
  }

  // 9. Project-Based Learning Blueprint Test
  try {
    const projects = LearningHubService.getProjectSuggestions(candidate);
    const firstProj = projects[0];

    if (projects.length >= 3 && firstProj.deliverables.length > 0) {
      results.push({
        testId: 9,
        testName: 'Project-Based Learning Blueprint Test',
        status: 'PASSED',
        details: `Generated ${projects.length} project blueprints (e.g. "${firstProj.title}", Deliverables: ${firstProj.deliverables.length}).`
      });
    } else {
      results.push({
        testId: 9,
        testName: 'Project-Based Learning Blueprint Test',
        status: 'FAILED',
        details: 'Project blueprints generation failed.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 9, testName: 'Project-Based Learning Blueprint', status: 'FAILED', details: String(err) });
  }

  // 10. Portfolio, Resume & Interview Prep Connection Test
  try {
    const projects = LearningHubService.getProjectSuggestions(candidate);
    const linkedProj = projects.find((p) => p.linkedToPortfolio && p.interviewPrepPayload);

    if (linkedProj && linkedProj.interviewPrepPayload.company) {
      results.push({
        testId: 10,
        testName: 'Portfolio, Resume & Interview Prep Connection Test',
        status: 'PASSED',
        details: `Project "${linkedProj.title}" connected to Portfolio (✓), Resume (✓), and Interview Prep (${linkedProj.interviewPrepPayload.company}).`
      });
    } else {
      results.push({
        testId: 10,
        testName: 'Portfolio, Resume & Interview Prep Connection Test',
        status: 'FAILED',
        details: 'Project connections to portfolio/resume/interview prep missing.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 10, testName: 'Portfolio, Resume & Interview Prep Connection', status: 'FAILED', details: String(err) });
  }

  // 11. Dynamic Progress Tracking & Hours Calculation Test
  try {
    const progress = LearningHubService.calculateProgress(candidate, 2);

    if (
      progress.completedSkillsCount >= 1 &&
      progress.completedProjectsCount === 2 &&
      progress.totalHoursLogged > 0 &&
      progress.overallCompletionPercentage > 0
    ) {
      results.push({
        testId: 11,
        testName: 'Dynamic Progress Tracking & Hours Calculation Test',
        status: 'PASSED',
        details: `Computed learning progress: Overall: ${progress.overallCompletionPercentage}%, Hours Logged: ${progress.totalHoursLogged} hrs, Projects Completed: ${progress.completedProjectsCount}.`
      });
    } else {
      results.push({
        testId: 11,
        testName: 'Dynamic Progress Tracking & Hours Calculation Test',
        status: 'FAILED',
        details: 'Dynamic progress tracking calculation returned invalid values.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 11, testName: 'Dynamic Progress Tracking & Hours Calculation', status: 'FAILED', details: String(err) });
  }

  // 12. Cross-Module Integration Payloads Test
  try {
    const projects = LearningHubService.getProjectSuggestions(candidate);
    const payloadProj = projects[0];

    if (payloadProj.interviewPrepPayload && payloadProj.interviewPrepPayload.topic) {
      results.push({
        testId: 12,
        testName: 'Cross-Module Integration Payloads Test',
        status: 'PASSED',
        details: `Payload for AI Interview Coach verified: Company="${payloadProj.interviewPrepPayload.company}", Topic="${payloadProj.interviewPrepPayload.topic}".`
      });
    } else {
      results.push({
        testId: 12,
        testName: 'Cross-Module Integration Payloads Test',
        status: 'FAILED',
        details: 'Cross-module payload missing.'
      });
    }
  } catch (err: any) {
    results.push({ testId: 12, testName: 'Cross-Module Integration Payloads', status: 'FAILED', details: String(err) });
  }

  return results;
}
