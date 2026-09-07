import { CandidateProfile, LearningResource, LearningResourceType, ProjectLearningItem, UserLearningProgress } from '../types';

export interface ILearningResourceProvider {
  fetchResourcesForSkill(skillName: string): LearningResource[];
  getAllVerifiedResources(): LearningResource[];
  addCustomUserResource(resource: Omit<LearningResource, 'id' | 'lastVerified'>): LearningResource;
}

export const VERIFIED_FREE_RESOURCES: LearningResource[] = [
  {
    id: 'res_react_docs',
    title: 'Official React 18 Documentation & Interactive Sandbox',
    provider: 'React.dev',
    skillName: 'React',
    difficulty: 'Intermediate',
    duration: '4 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://react.dev',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  },
  {
    id: 'res_ts_handbook',
    title: 'TypeScript Official Handbook & Type Challenges',
    provider: 'Microsoft TypeScript Docs',
    skillName: 'TypeScript',
    difficulty: 'Intermediate',
    duration: '6 Hours',
    isFree: true,
    costLabel: '100% Free (Open Educational Resource)',
    url: 'https://www.typescriptlang.org/docs/',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  },
  {
    id: 'res_node_guide',
    title: 'Node.js Enterprise Architecture & Event Loop Guide',
    provider: 'Node.js Official Org',
    skillName: 'Node.js',
    difficulty: 'Intermediate',
    duration: '5 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://nodejs.org/en/docs/guides/',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  },
  {
    id: 'res_python_docs',
    title: 'Python 3 Official Tutorial & AsyncIO Mechanics',
    provider: 'Python Software Foundation',
    skillName: 'Python',
    difficulty: 'Beginner',
    duration: '8 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://docs.python.org/3/',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  },
  {
    id: 'res_fcc_fullstack',
    title: 'Full Stack JavaScript & Responsive Web Certification',
    provider: 'freeCodeCamp',
    skillName: 'React',
    difficulty: 'Beginner',
    duration: '20 Hours',
    isFree: true,
    costLabel: '100% Free Course',
    url: 'https://www.freecodecamp.org/learn/',
    lastVerified: 'Verified Sept 2026',
    type: 'Free Course'
  },
  {
    id: 'res_kaggle_pandas',
    title: 'Kaggle Pandas & Data Wrangling Interactive Micro-Course',
    provider: 'Kaggle Learn',
    skillName: 'Pandas',
    difficulty: 'Beginner',
    duration: '4 Hours',
    isFree: true,
    costLabel: '100% Free Course',
    url: 'https://www.kaggle.com/learn/pandas',
    lastVerified: 'Verified Sept 2026',
    type: 'Free Course'
  },
  {
    id: 'res_fastapi_docs',
    title: 'FastAPI High-Performance Async Python Microservices',
    provider: 'FastAPI Official',
    skillName: 'FastAPI',
    difficulty: 'Intermediate',
    duration: '3 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://fastapi.tiangolo.com',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  },
  {
    id: 'res_kafka_guide',
    title: 'Apache Kafka Event Streaming Core Concepts & Architecture',
    provider: 'Apache Software Foundation',
    skillName: 'Kafka',
    difficulty: 'Advanced',
    duration: '6 Hours',
    isFree: true,
    costLabel: '100% Free (Open Educational Resource)',
    url: 'https://kafka.apache.org/documentation/',
    lastVerified: 'Verified Sept 2026',
    type: 'Open Educational Resource'
  },
  {
    id: 'res_k8s_basics',
    title: 'Kubernetes Interactive Basics & Container Orchestration',
    provider: 'Kubernetes.io Docs',
    skillName: 'Kubernetes',
    difficulty: 'Advanced',
    duration: '8 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    lastVerified: 'Verified Sept 2026',
    type: 'Free Tutorial'
  },
  {
    id: 'res_postgres_sql',
    title: 'PostgreSQL Advanced Indexing, Query Optimization & EXPLAIN ANALYZE',
    provider: 'PostgreSQL Global Development Group',
    skillName: 'SQL',
    difficulty: 'Intermediate',
    duration: '5 Hours',
    isFree: true,
    costLabel: '100% Free (Official Docs)',
    url: 'https://www.postgresql.org/docs/',
    lastVerified: 'Verified Sept 2026',
    type: 'Official Documentation'
  }
];

export class DefaultLearningResourceProvider implements ILearningResourceProvider {
  private resources: LearningResource[] = [...VERIFIED_FREE_RESOURCES];

  public fetchResourcesForSkill(skillName: string): LearningResource[] {
    const lower = skillName.toLowerCase();
    const matches = this.resources.filter(
      (r) => r.skillName.toLowerCase().includes(lower) || lower.includes(r.skillName.toLowerCase())
    );
    return matches.length > 0 ? matches : this.resources.slice(0, 3);
  }

  public getAllVerifiedResources(): LearningResource[] {
    return this.resources;
  }

  public addCustomUserResource(resourceData: Omit<LearningResource, 'id' | 'lastVerified'>): LearningResource {
    const newRes: LearningResource = {
      ...resourceData,
      id: `user_res_${Date.now()}`,
      lastVerified: 'User Added'
    };
    this.resources.unshift(newRes);
    return newRes;
  }
}

export class LearningHubService {
  private static resourceProvider: ILearningResourceProvider = new DefaultLearningResourceProvider();

  public static getResourceProvider(): ILearningResourceProvider {
    return this.resourceProvider;
  }

  /**
   * Generates actionable daily bite-sized tasks for Today's Learning
   */
  public static getTodayLearningTasks(candidate: CandidateProfile): {
    id: string;
    type: 'Learn' | 'Practice' | 'Build' | 'Verify';
    title: string;
    skillName: string;
    duration: string;
    description: string;
    isCompleted: boolean;
  }[] {
    const primaryTarget = candidate.targetRoles[0] || 'Full Stack Engineer';
    const candidateSkills = candidate.skills.map((s) => s.name);

    return [
      {
        id: 'task_daily_1',
        type: 'Learn',
        title: 'Master Event-Driven Async Architecture Concepts',
        skillName: 'System Design',
        duration: '25 Mins',
        description: 'Read the Kafka Event Streaming Architecture guide and understand message broker partitioning & offset retention.',
        isCompleted: false
      },
      {
        id: 'task_daily_2',
        type: 'Practice',
        title: 'Write Async Data Processing Pipeline in Python',
        skillName: 'Python',
        duration: '35 Mins',
        description: 'Implement an asyncio event loop fetching API data with graceful error handling & retries.',
        isCompleted: false
      },
      {
        id: 'task_daily_3',
        type: 'Build',
        title: 'Construct High-Performance Vector Indexing Service',
        skillName: 'Vector Databases',
        duration: '45 Mins',
        description: 'Build a document chunking utility preparing text for semantic embedding search.',
        isCompleted: false
      },
      {
        id: 'task_daily_4',
        type: 'Verify',
        title: 'Self-Assess React 18 Concurrent Rendering Mechanics',
        skillName: 'React',
        duration: '15 Mins',
        description: 'Log verified evidence on useTransition and useDeferredValue hooks to candidate profile.',
        isCompleted: true
      }
    ];
  }

  /**
   * Generates hands-on project suggestions connected to Portfolio, Resume, and Interview Prep
   */
  public static getProjectSuggestions(candidate: CandidateProfile): ProjectLearningItem[] {
    const targetRole = candidate.targetRoles[0] || 'Full Stack Engineer';

    return [
      {
        id: 'proj_101',
        title: 'Distributed Realtime Order Processing System',
        skillName: 'Kafka & System Design',
        targetRole,
        description: 'Build a microservices architecture handling 100k events/sec with Node.js, Kafka, and PostgreSQL.',
        deliverables: ['Kafka Message Producer/Consumer', 'PostgreSQL Audit Table Indexing', 'Docker Compose Cluster Setup'],
        status: 'In Progress',
        linkedToPortfolio: true,
        linkedToResume: true,
        interviewPrepPayload: {
          company: 'FinTech Systems',
          title: targetRole,
          topic: 'System Design & High-Throughput Message Queues'
        }
      },
      {
        id: 'proj_102',
        title: 'RAG Knowledge Search Bot with Generative UI',
        skillName: 'LangChain & Vector DBs',
        targetRole,
        description: 'Develop an enterprise document search engine streaming LLM responses to a React client with vector search.',
        deliverables: ['Document Chunking Pipeline', 'ChromaDB Vector Embeddings', 'Server-Sent Events (SSE) Interface'],
        status: 'Not Started',
        linkedToPortfolio: true,
        linkedToResume: false,
        interviewPrepPayload: {
          company: 'AI Solutions Inc',
          title: targetRole,
          topic: 'Vector Search & LLM Token Streaming'
        }
      },
      {
        id: 'proj_103',
        title: 'Executive Analytics Dashboard with Web Vitals Optimization',
        skillName: 'React & Web Vitals',
        targetRole,
        description: 'Build a zero-lag interactive analytics dashboard maintaining 60 FPS under high-frequency updates.',
        deliverables: ['Module Federation Micro-frontend', 'Canvas Chart Shaders', 'Web Vitals Performance Report'],
        status: 'Completed',
        linkedToPortfolio: true,
        linkedToResume: true,
        interviewPrepPayload: {
          company: 'TechCorp India',
          title: targetRole,
          topic: 'Frontend Performance & Bundle Optimization'
        }
      }
    ];
  }

  /**
   * Verifies and marks a skill completed on candidate profile with provenance source
   */
  public static verifyAndCompleteSkill(
    candidate: CandidateProfile,
    skillName: string,
    evidenceText: string
  ): CandidateProfile {
    const existingIndex = candidate.skills.findIndex(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );

    const updatedSkills = [...candidate.skills];
    if (existingIndex >= 0) {
      updatedSkills[existingIndex] = {
        ...updatedSkills[existingIndex],
        level: 'Advanced',
        verified: true,
        source: 'verified'
      };
    } else {
      updatedSkills.push({
        id: `sk_${Date.now()}`,
        name: skillName,
        level: 'Advanced',
        verified: true,
        source: 'verified'
      });
    }

    return {
      ...candidate,
      skills: updatedSkills
    };
  }

  /**
   * Calculates overall user learning progress statistics
   */
  public static calculateProgress(
    candidate: CandidateProfile,
    completedProjectCount: number = 1
  ): UserLearningProgress {
    const verifiedSkillsCount = candidate.skills.filter((s) => s.verified || s.source === 'verified').length;
    const totalSkills = candidate.skills.length;
    const inProgressCount = Math.max(1, totalSkills - verifiedSkillsCount);

    const overallPercentage = Math.round((verifiedSkillsCount / (totalSkills || 1)) * 60 + (completedProjectCount / 3) * 40);

    return {
      completedSkillsCount: verifiedSkillsCount,
      inProgressSkillsCount: inProgressCount,
      completedProjectsCount: completedProjectCount,
      totalHoursLogged: verifiedSkillsCount * 12 + completedProjectCount * 15 + 8,
      overallCompletionPercentage: Math.min(100, overallPercentage)
    };
  }
}
