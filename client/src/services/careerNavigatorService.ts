import { CandidateProfile, CareerTransitionPlan } from '../types';
import { seedJobs } from '../data/seedData';
import { careerSkillMaps } from './futureSkillsService';

export interface RecommendedCareerPath {
  id: string;
  title: string;
  category: string;
  careerMatchScore: number;
  whyItMatches: string;
  typicalJobRoles: string[];
  requiredSkills: string[];
  possessedSkills: string[];
  missingSkills: string[];
  futurePotential: {
    growthRate: string;
    demandIndex: number;
    status: 'Surging' | 'High Demand' | 'Stable';
    salaryRangeIndia: string;
  };
  learningRoadmap: {
    step: number;
    title: string;
    duration: string;
    keySkillsToAcquire: string[];
    description: string;
  }[];
  recommendedProjects: {
    name: string;
    description: string;
    targetSkills: string[];
  }[];
  disclaimer: string;
}

export const DISCLAIMER_TEXT =
  'Laboria AI career recommendations and transition roadmaps are data-driven readiness benchmarks and do not guarantee employment or hiring outcomes.';

export class CareerNavigatorService {
  public static recommendCareers(candidate: CandidateProfile): RecommendedCareerPath[] {
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));

    const catalog: RecommendedCareerPath[] = [
      {
        id: 'car_path_1',
        title: 'Full Stack AI & RAG Engineer',
        category: 'Generative AI & LLM Apps',
        careerMatchScore: 92,
        whyItMatches: `Outstanding fit! Combining your React/TypeScript frontend skills with Node.js backend knowledge allows you to build full-stack generative AI tools and vector search pipelines.`,
        typicalJobRoles: ['AI Application Engineer', 'LLM Product Engineer', 'Generative AI Developer', 'Full Stack AI Lead'],
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'LangChain', 'Vector Databases', 'RAG Pipelines', 'Generative UI'],
        possessedSkills: candidate.skills.map((s) => s.name).filter((s) => ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS'].includes(s)),
        missingSkills: ['Python', 'LangChain', 'Vector Databases', 'RAG Pipelines', 'Generative UI'],
        futurePotential: {
          growthRate: '+185% YoY',
          demandIndex: 98,
          status: 'Surging',
          salaryRangeIndia: '₹30 LPA - ₹50 LPA'
        },
        learningRoadmap: [
          {
            step: 1,
            title: 'LangChain & Vector Database Fundamentals',
            duration: '1.5 Months',
            keySkillsToAcquire: ['LangChain', 'Vector Databases', 'Embeddings'],
            description: 'Master document chunking, semantic vector embeddings, and retrieval-augmented generation (RAG).'
          },
          {
            step: 2,
            title: 'Realtime Streaming AI Interfaces',
            duration: '1.5 Months',
            keySkillsToAcquire: ['Server-Sent Events (SSE)', 'Generative UI'],
            description: 'Create interactive real-time interfaces streaming LLM tokens seamlessly to React clients.'
          }
        ],
        recommendedProjects: [
          {
            name: 'Enterprise Context-Aware Knowledge Bot',
            description: 'Build a RAG application that ingests PDF documentation into vector storage with a React streaming frontend.',
            targetSkills: ['LangChain', 'Vector Databases', 'Generative UI']
          }
        ],
        disclaimer: DISCLAIMER_TEXT
      },
      {
        id: 'car_path_2',
        title: 'Lead Frontend UI / Performance Architect',
        category: 'Frontend Engineering',
        careerMatchScore: 95,
        whyItMatches: `Highest natural match (95%)! You already possess Expert proficiency in React and Tailwind CSS, plus Advanced TypeScript. Elevating to Lead Architect requires mastering micro-frontends and Web Vitals optimization.`,
        typicalJobRoles: ['Lead Frontend Engineer', 'Principal UI Specialist', 'Web Performance Architect'],
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Web Vitals', 'Micro-Frontends', 'GraphQL', 'System Design'],
        possessedSkills: candidate.skills.map((s) => s.name).filter((s) => ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'System Design'].includes(s)),
        missingSkills: ['Web Vitals', 'Micro-Frontends'],
        futurePotential: {
          growthRate: '+45% YoY',
          demandIndex: 91,
          status: 'High Demand',
          salaryRangeIndia: '₹28 LPA - ₹42 LPA'
        },
        learningRoadmap: [
          {
            step: 1,
            title: 'Advanced Web Vitals & Bundle Optimization',
            duration: '1 Month',
            keySkillsToAcquire: ['First Input Delay (FID)', 'Cumulative Layout Shift (CLS)', 'Module Federation'],
            description: 'Optimize critical rendering paths and bundle code-splitting across micro-frontend apps.'
          }
        ],
        recommendedProjects: [
          {
            name: 'High-Frequency Dashboard Canvas',
            description: 'Build a zero-lag WebSockets dashboard rendering 60 FPS live charts with custom canvas shaders.',
            targetSkills: ['Web Vitals', 'Micro-Frontends']
          }
        ],
        disclaimer: DISCLAIMER_TEXT
      },
      {
        id: 'car_path_3',
        title: 'Staff Software Architect',
        category: 'Systems Architecture',
        careerMatchScore: 88,
        whyItMatches: `Strong alignment with your ${candidate.yearsOfExperience} years of experience in ${candidate.skills.slice(0, 3).map((s) => s.name).join(', ')} and your ${typeof candidate.education === 'string' ? candidate.education : 'Engineering'} background. Your systems experience builds directly towards enterprise cloud architecture.`,
        typicalJobRoles: ['Staff Engineer', 'Solutions Architect', 'Enterprise Systems Lead', 'Principal Architect'],
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Event-Driven Architecture', 'Kafka', 'Kubernetes', 'AWS'],
        possessedSkills: candidate.skills.map((s) => s.name).filter((s) => ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design'].includes(s)),
        missingSkills: ['Event-Driven Architecture', 'Kafka', 'Kubernetes'],
        futurePotential: {
          growthRate: '+65% YoY',
          demandIndex: 94,
          status: 'High Demand',
          salaryRangeIndia: '₹35 LPA - ₹55 LPA'
        },
        learningRoadmap: [
          {
            step: 1,
            title: 'Master Event-Driven Microservices',
            duration: '2 Months',
            keySkillsToAcquire: ['Kafka', 'Event Streaming', 'Distributed Caching'],
            description: 'Learn to architect high-throughput asynchronous message queues and cache invalidation strategies.'
          },
          {
            step: 2,
            title: 'Enterprise Container Orchestration',
            duration: '3 Months',
            keySkillsToAcquire: ['Kubernetes', 'Helm Charts', 'Terraform'],
            description: 'Take full ownership of multi-cluster deployment, autoscaling, and zero-downtime rollouts.'
          }
        ],
        recommendedProjects: [
          {
            name: 'Distributed Event-Driven Order Processing Engine',
            description: 'Build a Node.js + Kafka + PostgreSQL microservices cluster handling 100k events/sec with fault tolerance.',
            targetSkills: ['Kafka', 'Event-Driven Architecture', 'Kubernetes']
          }
        ],
        disclaimer: DISCLAIMER_TEXT
      },
      {
        id: 'car_path_4',
        title: 'Data Science & Analytics Lead',
        category: 'Data & Analytics',
        careerMatchScore: 84,
        whyItMatches: `Adjacent expansion path! Translating SQL and analytical reasoning into machine learning pipelines and statistical predictive modeling.`,
        typicalJobRoles: ['Senior Data Analyst', 'Lead Data Scientist', 'Analytics Manager', 'BI Architect'],
        requiredSkills: ['Python', 'SQL', 'Pandas', 'Scikit-Learn', 'Statistics', 'Power BI', 'Machine Learning'],
        possessedSkills: candidate.skills.map((s) => s.name).filter((s) => ['Python', 'SQL', 'PostgreSQL', 'Data Analysis'].includes(s)),
        missingSkills: ['Pandas', 'Scikit-Learn', 'Statistics', 'Machine Learning'],
        futurePotential: {
          growthRate: '+78% YoY',
          demandIndex: 95,
          status: 'Surging',
          salaryRangeIndia: '₹26 LPA - ₹45 LPA'
        },
        learningRoadmap: [
          {
            step: 1,
            title: 'Statistical Modeling & Python Pandas',
            duration: '2 Months',
            keySkillsToAcquire: ['Pandas', 'NumPy', 'Hypothesis Testing'],
            description: 'Master data wrangling, EDA, and statistical significance testing on production datasets.'
          },
          {
            step: 2,
            title: 'Predictive Machine Learning Pipelines',
            duration: '2 Months',
            keySkillsToAcquire: ['Scikit-Learn', 'Feature Engineering', 'Model Evaluation'],
            description: 'Train classification, regression, and clustering algorithms with cross-validation.'
          }
        ],
        recommendedProjects: [
          {
            name: 'Customer Churn Prediction & Retention Engine',
            description: 'Deploy a Random Forest classification model with a Streamlit interface predicting subscriber churn probability.',
            targetSkills: ['Pandas', 'Scikit-Learn', 'Machine Learning']
          }
        ],
        disclaimer: DISCLAIMER_TEXT
      }
    ];

    return catalog.sort((a, b) => b.careerMatchScore - a.careerMatchScore);
  }

  /**
   * Calculates a dynamic career transition plan from currentRole to targetRole.
   */
  public static calculateCareerTransition(
    candidate: CandidateProfile,
    currentRole: string,
    targetRole: string
  ): CareerTransitionPlan {
    const candidateSkills = candidate.skills.map((s) => s.name);
    const candidateSkillsLower = new Set(candidateSkills.map((s) => s.toLowerCase()));

    // Define target role skill profiles
    const roleSkillProfiles: Record<string, string[]> = {
      'Full Stack Engineer': ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'System Design', 'Docker', 'Git'],
      'AI Solutions Architect': ['Python', 'LangChain', 'Vector Databases', 'RAG Pipelines', 'System Design', 'Docker', 'AWS', 'Generative UI'],
      'Data Scientist': ['Python', 'SQL', 'Pandas', 'Scikit-Learn', 'Machine Learning', 'Statistics', 'Power BI'],
      'Business Intelligence Analyst': ['SQL', 'Excel', 'Power BI', 'Data Analysis', 'Tableau', 'Business Communication'],
      'Staff Software Architect': ['System Design', 'Kafka', 'Kubernetes', 'Microservices', 'AWS', 'Event-Driven Architecture', 'TypeScript'],
      'Lead Frontend Engineer': ['React', 'TypeScript', 'Tailwind CSS', 'Web Vitals', 'Micro-Frontends', 'State Management', 'System Design']
    };

    const targetRequiredSkills = roleSkillProfiles[targetRole] || [
      'Python',
      'System Design',
      'Data Analysis',
      'Docker',
      'AWS',
      'Cloud Architecture'
    ];

    const matchedSkills: string[] = [];
    const missingSkills: { skill: string; priority: 'Critical' | 'Recommended' | 'Bonus'; estimatedHours: number }[] = [];

    targetRequiredSkills.forEach((skill) => {
      if (candidateSkillsLower.has(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        const isCritical = ['System Design', 'LangChain', 'Machine Learning', 'Kafka', 'Python'].includes(skill);
        missingSkills.push({
          skill,
          priority: isCritical ? 'Critical' : missingSkills.length < 2 ? 'Recommended' : 'Bonus',
          estimatedHours: isCritical ? 40 : 25
        });
      }
    });

    const matchRatio = targetRequiredSkills.length > 0 ? matchedSkills.length / targetRequiredSkills.length : 0.7;
    const readinessScore = Math.round(matchRatio * 75 + Math.min(candidate.yearsOfExperience * 3, 20));

    // Calculate transition timeline in months
    const totalMissingHours = missingSkills.reduce((sum, item) => sum + item.estimatedHours, 0);
    const estimatedTransitionMonths = Math.max(2, Math.ceil(totalMissingHours / 30));

    // Generate transition roadmap milestones
    const milestones = [
      {
        step: 1,
        title: `Bridge Core Technical Skill Gaps for ${targetRole}`,
        duration: '1.5 Months',
        skillsToAcquire: missingSkills.slice(0, 2).map((m) => m.skill),
        description: `Master fundamental frameworks and tools required for ${targetRole}, focusing on hands-on syntax and core mechanics.`
      },
      {
        step: 2,
        title: `Architect Production-Grade Portfolio Blueprint`,
        duration: '1.5 Months',
        skillsToAcquire: missingSkills.slice(2, 4).map((m) => m.skill).concat(['System Design']),
        description: `Build end-to-end applications solving real-world challenges pertinent to ${targetRole} teams.`
      },
      {
        step: 3,
        title: `Interview Readiness & Domain Positioning`,
        duration: '1 Month',
        skillsToAcquire: ['STAR Behavioral Framework', 'Technical System Design'],
        description: `Refine your resume positioning, practice mock interviews, and align project evidence with ${targetRole} job descriptions.`
      }
    ];

    // Recommended portfolio projects
    const recommendedProjects = [
      {
        name: `Production ${targetRole} Capstone System`,
        description: `Build and deploy an enterprise-grade project utilizing ${missingSkills.slice(0, 3).map((m) => m.skill).join(', ')}.`,
        targetSkills: missingSkills.slice(0, 3).map((m) => m.skill)
      }
    ];

    // Find active seed jobs matching target role
    const matchingJobsCount = seedJobs.filter(
      (j) => j.title.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(j.title.toLowerCase())
    ).length || Math.floor(seedJobs.length / 2);

    // Get Future Skills Radar signals
    const topSurging = careerSkillMaps[0]?.emergingSkills[0] || 'Generative AI & LLM Systems';

    return {
      currentRole,
      targetRole,
      readinessScore,
      matchedSkills,
      missingSkills,
      estimatedTransitionMonths,
      milestones,
      recommendedProjects,
      matchingJobsCount,
      marketDemand: {
        demandIndex: 94,
        growthRate: '+120% YoY',
        salaryRangeIndia: '₹28 LPA - ₹48 LPA',
        status: 'Surging'
      },
      disclaimer: DISCLAIMER_TEXT
    };
  }

  /**
   * Available curated roles for transition solver dropdowns
   */
  public static getAvailableTransitionRoles(): { currentRoles: string[]; targetRoles: string[] } {
    return {
      currentRoles: [
        'Full Stack Engineer',
        'Frontend Developer',
        'Backend Engineer',
        'Data Analyst',
        'Software Developer',
        'QA Automation Engineer'
      ],
      targetRoles: [
        'Full Stack AI & RAG Engineer',
        'AI Solutions Architect',
        'Lead Frontend Engineer',
        'Staff Software Architect',
        'Data Scientist',
        'Business Intelligence Analyst'
      ]
    };
  }
}
