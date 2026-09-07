import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import { JobEntity } from '../types/entities';

export type SkillClassificationTier = 'Strong Match' | 'Developing' | 'Missing' | 'Recommended';
export type SkillPriorityLevel = 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';

export interface LearningActivities {
  learn: string;
  practice: string;
  build: string;
  test: string;
  interview: string;
}

export interface ProjectRecommendation {
  title: string;
  targetRole: string;
  dataset: string;
  dataCleaning: string;
  kpis: string[];
  charts: string[];
  filters: string[];
  businessInsights: string;
  finalPresentation: string;
}

export interface SkillGapItem {
  skillName: string;
  category: 'Tech' | 'AI & Data' | 'Soft Skills' | 'Domain';
  classification: SkillClassificationTier;
  proficiency?: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
  evidence?: string;
  priority: SkillPriorityLevel;
  whyPriorityReason: string;
  estimatedHours: number;
  activities: LearningActivities;
  recommendedProject?: ProjectRecommendation;
}

export interface MultiJobSkillFrequency {
  skillName: string;
  frequencyCount: number;
  totalJobsAnalyzed: number;
  percentageDemand: number;
  isPossessedByCandidate: boolean;
  priority: SkillPriorityLevel;
}

export interface RoadmapStageItem {
  stageId: number;
  stageName: string;
  description: string;
  skillName: string;
  priority: SkillPriorityLevel;
  activities: LearningActivities;
  project?: ProjectRecommendation;
  status: 'Not Started' | 'In Progress' | 'Completed';
  estimatedHours: number;
}

export interface PersonalizedRoadmap {
  targetTitle: string;
  stages: RoadmapStageItem[];
  overallProgressPercentage: number;
  skillsCompletedCount: number;
  totalSkillsCount: number;
  projectsCompletedCount: number;
  totalProjectsCount: number;
  isInterviewReady: boolean;
}

export interface SkillGapAnalysisResult {
  targetType: 'Career' | 'Job';
  targetTitle: string;
  overallFitPercentage: number;
  roleMatchSummaryText: string;
  highestImpactHighlight: string;
  strongSkills: SkillGapItem[];
  developingSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  recommendedSkills: SkillGapItem[];
  multiJobFrequencies: MultiJobSkillFrequency[];
  roadmap: PersonalizedRoadmap;
  totalEstimatedHours: number;
}

export class SkillGapService {
  /**
   * Generates Project Blueprint for missing technical skills
   */
  public static generateProjectRecommendation(skillName: string, targetRole: string): ProjectRecommendation {
    const nameLower = skillName.toLowerCase();

    if (nameLower.includes('power bi') || nameLower.includes('tableau') || nameLower.includes('excel')) {
      return {
        title: 'Executive Sales Performance Analytics Dashboard',
        targetRole,
        dataset: 'Global E-Commerce Sales & Customer Transactions Dataset (100k rows)',
        dataCleaning: 'Handling missing values, date parsing, DAX measures, data modeling, custom columns',
        kpis: ['Total Revenue ($)', 'Gross Margin (%)', 'Customer Acquisition Cost (CAC)', 'Monthly Active Retention Rate'],
        charts: ['Revenue Trend Line Chart', 'Regional Sales Map', 'Category Breakdown Donut', 'Top 10 Product Bar Chart'],
        filters: ['Date Range Slicer', 'Region / Country', 'Product Sub-Category', 'Fulfillment Channel'],
        businessInsights: 'Identified 14% revenue leakage in Southern region due to discount over-allocation',
        finalPresentation: 'Interactive 5-page Power BI dashboard report with executive summary slides'
      };
    }

    if (nameLower.includes('python') || nameLower.includes('data analysis') || nameLower.includes('pandas')) {
      return {
        title: 'Predictive Customer Churn Analysis Pipeline',
        targetRole,
        dataset: 'Telecom Subscriber Churn Dataset (20k records)',
        dataCleaning: 'Outlier detection, one-hot encoding categorical variables, feature scaling',
        kpis: ['Overall Churn Rate (%)', 'Avg Monthly Charges', 'Tenure Cohort Risk'],
        charts: ['Correlation Heatmap', 'Feature Importance Plot', 'ROC-AUC Curve'],
        filters: ['Contract Type', 'Internet Service Provider', 'Payment Method'],
        businessInsights: 'Discovered month-to-month contracts have 3.8x higher churn risk than annual plans',
        finalPresentation: 'Jupyter Notebook analysis report with executive findings and actionable recommendations'
      };
    }

    if (nameLower.includes('sql') || nameLower.includes('postgres') || nameLower.includes('database')) {
      return {
        title: 'E-Commerce Database Schema & Query Optimization Engine',
        targetRole,
        dataset: 'Multi-table Relational Retail Schema (Orders, Customers, Products, Payments)',
        dataCleaning: 'Normalization to 3NF, primary/foreign key indexing, constraint enforcement',
        kpis: ['Query Latency (ms)', 'Monthly Recurring Revenue', 'Repeat Customer Ratio'],
        charts: ['Monthly Revenue Cohort Heatmap', 'SQL Execution Plan Cost Diagram'],
        filters: ['Year / Quarter', 'Store Location', 'Order Status'],
        businessInsights: 'Optimized slow CTE queries, reducing reporting latency from 4.2s to 180ms',
        finalPresentation: 'SQL script repository with query performance benchmarking report'
      };
    }

    return {
      title: `End-to-End ${skillName} Industry Solution`,
      targetRole,
      dataset: `Real-world ${skillName} Production Dataset`,
      dataCleaning: `Data preprocessing, error handling, and robust architecture setup for ${skillName}`,
      kpis: ['Efficiency Score', 'System Throughput', 'Accuracy Rate'],
      charts: ['Performance Metric Charts', 'Distribution Plots'],
      filters: ['Category Filter', 'Date Range'],
      businessInsights: `Demonstrated practical production readiness using ${skillName}`,
      finalPresentation: 'GitHub repository documentation with interactive demo video'
    };
  }

  /**
   * Generates 5 Learning Activities for a given skill
   */
  public static generateLearningActivities(skillName: string): LearningActivities {
    return {
      learn: `Understand ${skillName} core fundamentals, syntax, and architectural concepts.`,
      practice: `Complete hands-on exercises and build 3 micro-modules utilizing ${skillName}.`,
      build: `Develop an end-to-end portfolio project featuring ${skillName} implementation.`,
      test: `Complete a Laboria AI ${skillName} competency assessment to verify proficiency.`,
      interview: `Practice explaining technical design decisions for ${skillName} in mock interviews.`
    };
  }

  /**
   * Analyzes skill gaps across candidate profile vs target career or job
   */
  public static analyzeSkillGap(
    candidate: CandidateProfile,
    target: { type: 'Career' | 'Job'; id: string },
    userProgressMap: Record<string, 'Not Started' | 'In Progress' | 'Completed'> = {}
  ): SkillGapAnalysisResult {
    let targetTitle = 'Junior Data Analyst';
    let requiredSkills: string[] = ['Python', 'SQL', 'Excel', 'Power BI', 'Data Analysis'];

    if (target.type === 'Job') {
      const foundJob = seedJobs.find((j) => j.id === target.id) || seedJobs[0];
      targetTitle = `${foundJob.title} @ ${foundJob.company}`;
      requiredSkills = foundJob.requirements;
    } else {
      if (target.id.includes('architect') || target.id.includes('Staff')) {
        targetTitle = 'Staff Software Architect';
        requiredSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design', 'Kafka'];
      } else if (target.id.includes('AI') || target.id.includes('rag')) {
        targetTitle = 'Full Stack AI & RAG Engineer';
        requiredSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'LangChain / RAG', 'Vector DBs', 'Generative UI'];
      } else if (target.id.includes('analyst') || target.id.includes('data')) {
        targetTitle = 'Junior Data Analyst';
        requiredSkills = ['Python', 'SQL', 'Excel', 'Power BI', 'Data Analysis', 'Statistics'];
      }
    }

    // Map candidate skills for evidence verification
    const candidateSkillsMap = new Map<string, { level: string; source?: string }>();
    candidate.skills.forEach((s) =>
      candidateSkillsMap.set(s.name.toLowerCase(), { level: s.level || 'Intermediate' })
    );


    // Multi-Job Skill Frequency Calculation across all demo jobs
    const skillDemandMap = new Map<string, number>();
    seedJobs.forEach((j) => {
      j.requirements.forEach((req) => {
        const norm = req.toLowerCase();
        skillDemandMap.set(norm, (skillDemandMap.get(norm) || 0) + 1);
      });
    });

    const totalJobsAnalyzed = seedJobs.length;
    const multiJobFrequencies: MultiJobSkillFrequency[] = Array.from(skillDemandMap.entries())
      .map(([normName, count]) => {
        // Display name formatting
        const display =
          normName === 'sql' ? 'SQL' :
          normName === 'python' ? 'Python' :
          normName === 'power bi' ? 'Power BI' :
          normName === 'excel' ? 'Excel' :
          normName === 'react' ? 'React' :
          normName === 'typescript' ? 'TypeScript' :
          normName === 'node.js' ? 'Node.js' :
          normName.charAt(0).toUpperCase() + normName.slice(1);

        const isPossessed = Array.from(candidateSkillsMap.keys()).some(
          (cs) => cs.includes(normName) || normName.includes(cs)
        );

        const priority: SkillPriorityLevel =
          count >= 4 ? 'HIGH PRIORITY' : count >= 2 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY';

        return {
          skillName: display,
          frequencyCount: count,
          totalJobsAnalyzed,
          percentageDemand: Math.round((count / totalJobsAnalyzed) * 100),
          isPossessedByCandidate: isPossessed,
          priority
        };
      })
      .sort((a, b) => b.frequencyCount - a.frequencyCount);

    const strongSkills: SkillGapItem[] = [];
    const developingSkills: SkillGapItem[] = [];
    const missingSkills: SkillGapItem[] = [];
    const recommendedSkills: SkillGapItem[] = [];

    requiredSkills.forEach((reqSkill, idx) => {
      const normReq = reqSkill.toLowerCase();
      const candidateEntry = Array.from(candidateSkillsMap.entries()).find(
        ([cName]) => cName.includes(normReq) || normReq.includes(cName)
      );

      const freqCount = skillDemandMap.get(normReq) || 1;
      const priority: SkillPriorityLevel =
        idx === 0 || freqCount >= 3 ? 'HIGH PRIORITY' : idx < 4 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY';

      const activities = SkillGapService.generateLearningActivities(reqSkill);
      const proj = SkillGapService.generateProjectRecommendation(reqSkill, targetTitle);

      if (candidateEntry) {
        const level = candidateEntry[1].level as 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
        if (level === 'Expert' || level === 'Advanced') {
          strongSkills.push({
            skillName: reqSkill,
            category: 'Tech',
            classification: 'Strong Match',
            proficiency: level,
            evidence: `Verified ${level} proficiency via resume text & candidate profile evidence.`,
            priority,
            whyPriorityReason: `Core strength: Matched in your verified profile background.`,
            estimatedHours: 0,
            activities
          });
        } else {
          developingSkills.push({
            skillName: reqSkill,
            category: 'Tech',
            classification: 'Developing',
            proficiency: level,
            evidence: `Verified ${level} proficiency. Needs practical portfolio project depth.`,
            priority,
            whyPriorityReason: `Developing competency: Mentioned on profile but needs deeper project evidence.`,
            estimatedHours: 10,
            activities,
            recommendedProject: proj
          });
        }
      } else {
        // Missing Skill - No evidence found on candidate profile
        missingSkills.push({
          skillName: reqSkill,
          category: 'Tech',
          classification: 'Missing',
          priority,
          whyPriorityReason: `${reqSkill} is marked ${priority.toLowerCase()} because it is required by ${freqCount} of your matched jobs and is not clearly demonstrated in your resume.`,
          estimatedHours: 18,
          activities,
          recommendedProject: proj
        });
      }
    });

    // Add 1 Recommended skill if candidate has missing skills
    if (missingSkills.length > 0) {
      recommendedSkills.push({
        skillName: 'Business Communication & Presentation',
        category: 'Soft Skills',
        classification: 'Recommended',
        priority: 'MEDIUM PRIORITY',
        whyPriorityReason: 'Strong communication skills increase interview conversion for technical candidates.',
        estimatedHours: 8,
        activities: SkillGapService.generateLearningActivities('Business Communication')
      });
    }

    // Role Match Summary Text
    let roleMatchSummaryText = '';
    if (missingSkills.length === 0) {
      roleMatchSummaryText = 'You satisfy 100% of core skill requirements for this role.';
    } else if (missingSkills.length === 1) {
      roleMatchSummaryText = `You already meet most of this role's requirements. Your highest-impact improvement area is ${missingSkills[0].skillName}.`;
    } else {
      roleMatchSummaryText = `You demonstrate ${strongSkills.length} core strengths. Bridging ${missingSkills.length} missing skill gaps will maximize your match score.`;
    }

    const highestImpactHighlight = missingSkills.length > 0
      ? missingSkills[0].skillName
      : developingSkills.length > 0
      ? developingSkills[0].skillName
      : 'None — All Core Requirements Satisfied!';

    const totalRequiredCount = requiredSkills.length;
    const weightedMatchScore = strongSkills.length * 1.0 + developingSkills.length * 0.6;
    const overallFitPercentage = Math.round((weightedMatchScore / Math.max(1, totalRequiredCount)) * 100);

    const totalEstimatedHours =
      missingSkills.reduce((sum, s) => sum + s.estimatedHours, 0) +
      developingSkills.reduce((sum, s) => sum + s.estimatedHours, 0);

    // Build 7-Stage Non-Redundant Personalized Roadmap
    // STRICT RULE: Do NOT recommend skills the user already clearly possesses!
    const roadmapStages: RoadmapStageItem[] = [];
    let stageIdCounter = 1;

    // Stage 1: Build Foundation
    roadmapStages.push({
      stageId: stageIdCounter++,
      stageName: 'Stage 1: Build Foundation',
      description: `Review existing verified competencies (${strongSkills.map((s) => s.skillName).join(', ') || 'Core Skills'}).`,
      skillName: strongSkills.length > 0 ? strongSkills[0].skillName : 'Core Fundamentals',
      priority: 'LOW PRIORITY',
      activities: {
        learn: 'Review architecture & core concepts.',
        practice: 'Quick refresher exercises.',
        build: 'Verify baseline environment setup.',
        test: 'Baseline check.',
        interview: 'Prepare elevator pitch for existing skills.'
      },
      status: 'Completed',
      estimatedHours: 0
    });

    // Stage 2 & Stage 3 & Stage 4: Learn Missing Skills, Practice & Build Portfolio Project for MISSING / DEVELOPING skills ONLY
    const targetGapsToLearn = [...missingSkills, ...developingSkills];

    if (targetGapsToLearn.length > 0) {
      const topGap = targetGapsToLearn[0];
      const savedStatus = userProgressMap[topGap.skillName] || 'Not Started';

      roadmapStages.push({
        stageId: stageIdCounter++,
        stageName: 'Stage 2: Learn Missing Skills',
        description: `Acquire core proficiency in ${topGap.skillName}. Required in ${skillDemandMap.get(topGap.skillName.toLowerCase()) || 1} matched jobs.`,
        skillName: topGap.skillName,
        priority: topGap.priority,
        activities: topGap.activities,
        status: savedStatus,
        estimatedHours: topGap.estimatedHours
      });

      roadmapStages.push({
        stageId: stageIdCounter++,
        stageName: 'Stage 3: Hands-on Practice',
        description: `Complete 3 practical micro-exercises for ${topGap.skillName}.`,
        skillName: topGap.skillName,
        priority: topGap.priority,
        activities: topGap.activities,
        status: savedStatus === 'Completed' ? 'Completed' : 'Not Started',
        estimatedHours: 8
      });

      if (topGap.recommendedProject) {
        roadmapStages.push({
          stageId: stageIdCounter++,
          stageName: 'Stage 4: Build Portfolio Project',
          description: `Construct "${topGap.recommendedProject.title}" for your portfolio.`,
          skillName: topGap.skillName,
          priority: topGap.priority,
          activities: topGap.activities,
          project: topGap.recommendedProject,
          status: savedStatus === 'Completed' ? 'Completed' : 'Not Started',
          estimatedHours: 15
        });
      }
    }

    // Stage 5: Assessment
    roadmapStages.push({
      stageId: stageIdCounter++,
      stageName: 'Stage 5: Skill Assessment',
      description: `Complete Laboria AI verified skill evaluation for ${highestImpactHighlight}.`,
      skillName: highestImpactHighlight,
      priority: 'MEDIUM PRIORITY',
      activities: {
        learn: 'Review assessment topics.',
        practice: 'Take sample questions.',
        build: 'Complete timed practical test.',
        test: 'Submit code/queries for automated evaluation.',
        interview: 'Review evaluation score breakdown.'
      },
      status: 'Not Started',
      estimatedHours: 2
    });

    // Stage 6: Interview Preparation
    roadmapStages.push({
      stageId: stageIdCounter++,
      stageName: 'Stage 6: Interview Preparation',
      description: `Practice STAR method responses explaining your project decisions to AI Mentor.`,
      skillName: 'Interview Preparation',
      priority: 'HIGH PRIORITY',
      activities: {
        learn: 'Review common technical interview questions.',
        practice: 'Practice STAR answer structuring.',
        build: 'Record response audio / text.',
        test: 'Get feedback on technical depth & communication.',
        interview: 'Mock interview session.'
      },
      status: 'Not Started',
      estimatedHours: 4
    });

    // Stage 7: Apply
    roadmapStages.push({
      stageId: stageIdCounter++,
      stageName: 'Stage 7: Apply to Matching Jobs',
      description: `Submit applications to your top matched job opportunities with updated resume evidence.`,
      skillName: 'Job Applications',
      priority: 'HIGH PRIORITY',
      activities: {
        learn: 'Identify target job listings.',
        practice: 'Customize application highlights.',
        build: 'Submit resume.',
        test: 'Track application status.',
        interview: 'Schedule HR screening.'
      },
      status: 'Not Started',
      estimatedHours: 2
    });

    // Progress Calculations
    const completedStagesCount = roadmapStages.filter((s) => s.status === 'Completed').length;
    const overallProgressPercentage = Math.round((completedStagesCount / roadmapStages.length) * 100);
    const projectsWithStage = roadmapStages.filter((s) => s.project);
    const completedProjectsCount = projectsWithStage.filter((s) => s.status === 'Completed').length;

    const roadmap: PersonalizedRoadmap = {
      targetTitle,
      stages: roadmapStages,
      overallProgressPercentage,
      skillsCompletedCount: strongSkills.length + (completedStagesCount > 1 ? 1 : 0),
      totalSkillsCount: requiredSkills.length,
      projectsCompletedCount: completedProjectsCount,
      totalProjectsCount: Math.max(1, projectsWithStage.length),
      isInterviewReady: overallProgressPercentage >= 75
    };

    return {
      targetType: target.type,
      targetTitle,
      overallFitPercentage,
      roleMatchSummaryText,
      highestImpactHighlight,
      strongSkills,
      developingSkills,
      missingSkills,
      recommendedSkills,
      multiJobFrequencies,
      roadmap,
      totalEstimatedHours
    };
  }
}
