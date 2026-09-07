import { CandidateProfile, JobOpening, CareerPath, FutureSkillTrend, InterviewQuestion } from '../types';
import { AuthService } from './authService';

const emptyCandidate: CandidateProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  headline: '',
  yearsOfExperience: 0,
  currentLocation: { city: '', state: '', country: '', latitude: 0, longitude: 0 },
  preferredLocations: [],
  preferredWorkType: 'Remote',
  targetRoles: [],
  skills: [],
  education: [],
  experience: [],
  projects: [],
  technicalSkills: [],
  softSkills: [],
  certifications: [],
  resumeText: ''
};

export const mockCandidate: CandidateProfile = new Proxy(emptyCandidate, {
  get(target, prop) {
    const activeProfile = AuthService.getCurrentProfile();
    if (activeProfile && activeProfile[prop as keyof CandidateProfile] !== undefined) {
      return activeProfile[prop as keyof CandidateProfile];
    }
    return target[prop as keyof CandidateProfile];
  }
});

export const mockJobs: JobOpening[] = [
  {
    id: 'job_201',
    title: 'Senior Full Stack Engineer (React + Node.js)',
    company: 'Nexus Cloud Technologies',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
    workType: 'Hybrid',
    minExperience: 3,
    maxExperience: 6,
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    niceToHaveSkills: ['GraphQL', 'AWS', 'Docker'],
    description: 'We are seeking a seasoned Full Stack Engineer to lead front-to-back architecture of our enterprise cloud governance product.',
    salaryRange: { min: 2200000, max: 3200000, currency: 'INR' },
    postedDate: '2026-09-01',
    source: 'Direct Portal',
    applyUrl: '#'
  },
  {
    id: 'job_202',
    title: 'Lead Frontend Developer',
    company: 'HyperScale AI',
    location: { city: 'Remote', state: 'Pan-India', country: 'India', latitude: 12.9716, longitude: 77.5946 },
    workType: 'Remote',
    minExperience: 4,
    maxExperience: 7,
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    niceToHaveSkills: ['Next.js', 'Generative AI UI', 'System Design'],
    description: 'Build cutting-edge AI workspace tools with fast response times and sleek modern user interfaces.',
    salaryRange: { min: 2800000, max: 3800000, currency: 'INR' },
    postedDate: '2026-09-03',
    source: 'Laboria Direct',
    applyUrl: '#'
  },
  {
    id: 'job_203',
    title: 'Staff UI / Frontend Specialist',
    company: 'FinPulse Systems',
    location: { city: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4595, longitude: 77.0266 },
    workType: 'On-site',
    minExperience: 4,
    maxExperience: 8,
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Redux / Zustand'],
    niceToHaveSkills: ['WebSockets', 'Micro-frontends'],
    description: 'High-frequency trading interface engineering requiring ultra-low latency canvas and state rendering.',
    salaryRange: { min: 3000000, max: 4200000, currency: 'INR' },
    postedDate: '2026-08-28',
    source: 'TechCareers India',
    applyUrl: '#'
  },
  {
    id: 'job_204',
    title: 'Backend Systems Engineer',
    company: 'ZettaData Labs',
    location: { city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
    workType: 'Hybrid',
    minExperience: 3,
    maxExperience: 5,
    skillsRequired: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    niceToHaveSkills: ['Kafka', 'Kubernetes', 'Go'],
    description: 'Scale our data ingestion APIs processing 100M+ webhooks daily across global infrastructure.',
    salaryRange: { min: 1800000, max: 2600000, currency: 'INR' },
    postedDate: '2026-09-02',
    source: 'Direct Portal',
    applyUrl: '#'
  },
  {
    id: 'job_205',
    title: 'Junior React Frontend Developer',
    company: 'QuickStart Media',
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
    workType: 'On-site',
    minExperience: 1,
    maxExperience: 2,
    skillsRequired: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
    niceToHaveSkills: ['Tailwind CSS'],
    description: 'Entry-level frontend role for web landing pages and client dashboards.',
    salaryRange: { min: 600000, max: 900000, currency: 'INR' },
    postedDate: '2026-09-04',
    source: 'Local Boards',
    applyUrl: '#'
  },
  {
    id: 'job_206',
    title: 'Principal Software Architect',
    company: 'OmniGlobal Tech',
    location: { city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
    workType: 'Hybrid',
    minExperience: 10,
    maxExperience: 15,
    skillsRequired: ['System Design', 'Enterprise Architecture', 'Cloud Infrastructure', 'Java / Node.js'],
    niceToHaveSkills: ['Multi-cloud', 'Security Compliance'],
    description: 'Drive overall architecture roadmap and technical standards across 200+ engineering teams.',
    salaryRange: { min: 4500000, max: 6500000, currency: 'INR' },
    postedDate: '2026-08-25',
    source: 'Executive Search',
    applyUrl: '#'
  }
];

export const mockCareerPaths: CareerPath[] = [
  {
    id: 'path_1',
    currentRole: 'Full Stack Engineer',
    targetRole: 'Staff Software Engineer / Architect',
    readinessPercentage: 74,
    salaryIncreaseEstimate: '+45% to +65%',
    milestones: [
      {
        step: 1,
        title: 'Master Advanced Distributed Systems',
        duration: '2 - 3 Months',
        keySkillsToAcquire: ['Event-Driven Architecture', 'Kafka / Event Streaming', 'Cache Invalidation Strategies'],
        description: 'Deepen system design capabilities for high-concurrency cloud environments.'
      },
      {
        step: 2,
        title: 'Lead End-to-End Microservices Deployment',
        duration: '3 - 4 Months',
        keySkillsToAcquire: ['Kubernetes', 'CI/CD Pipelines', 'AWS EKS / Terraform'],
        description: 'Take ownership of infra provisioning and DevOps orchestration.'
      },
      {
        step: 3,
        title: 'Architect Enterprise Level Features & Team Mentorship',
        duration: '3 Months',
        keySkillsToAcquire: ['Technical Leadership', 'RFC Writing', 'Security & Compliance'],
        description: 'Author technical proposals, establish coding guidelines, and mentor junior devs.'
      }
    ]
  },
  {
    id: 'path_2',
    currentRole: 'Full Stack Engineer',
    targetRole: 'AI Application Engineer / Generative AI Lead',
    readinessPercentage: 68,
    salaryIncreaseEstimate: '+50% to +80%',
    milestones: [
      {
        step: 1,
        title: 'Master LLM Integration & RAG Pipelines',
        duration: '1.5 Months',
        keySkillsToAcquire: ['LangChain / LlamaIndex', 'Vector Databases (Chroma/Pinecone)', 'Prompt Engineering'],
        description: 'Learn to build context-aware AI applications using embeddings and vector search.'
      },
      {
        step: 2,
        title: 'AI Native UI & Streaming Agents',
        duration: '2 Months',
        keySkillsToAcquire: ['Server-Sent Events (SSE)', 'Vercel AI SDK', 'Generative UI Patterns'],
        description: 'Create interactive real-time interfaces powered by generative AI.'
      }
    ]
  }
];

export const mockFutureSkills: FutureSkillTrend[] = [
  { skill: 'RAG Architecture & Vector DBs', category: 'AI & Data', growthRate: '+185%', demandIndex: 96, topLocationsInIndia: ['Bengaluru', 'Hyderabad', 'Gurugram'], status: 'Surging' },
  { skill: 'TypeScript & Micro-Frontends', category: 'Tech', growthRate: '+65%', demandIndex: 91, topLocationsInIndia: ['Bengaluru', 'Pune', 'Remote'], status: 'High Demand' },
  { skill: 'System Design for High Scale', category: 'Tech', growthRate: '+40%', demandIndex: 88, topLocationsInIndia: ['Bengaluru', 'Hyderabad', 'Mumbai'], status: 'Stable' },
  { skill: 'Generative UI & Agentic Workflows', category: 'AI & Data', growthRate: '+210%', demandIndex: 98, topLocationsInIndia: ['Bengaluru', 'Remote'], status: 'Surging' },
  { skill: 'Rust for WebAssembly & Backend', category: 'Tech', growthRate: '+82%', demandIndex: 78, topLocationsInIndia: ['Bengaluru', 'Kochi'], status: 'Emerging' },
  { skill: 'AWS Cloud Native & Serverless', category: 'Tech', growthRate: '+35%', demandIndex: 85, topLocationsInIndia: ['Hyderabad', 'Pune', 'Chennai'], status: 'Stable' }
];

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: 'q1',
    role: 'Senior Full Stack Engineer',
    category: 'Technical',
    question: 'How do you optimize initial load performance and state management in a large-scale React single-page application?',
    contextHint: 'Focus on code splitting, dynamic imports, state normalization, memoization, and critical rendering path.',
    starGuide: {
      situation: 'In my previous project at TechNovation Labs, our analytics dashboard payload exceeded 3.5MB.',
      task: 'I was tasked with reducing initial bundle load time below 1.5 seconds on 3G connections.',
      action: 'Implemented React.lazy route splitting, normalized Redux slices, asset preloading, and custom stale-while-revalidate hooks.',
      result: 'Reduced initial bundle size by 58% and improved First Contentful Paint from 3.2s to 1.1s.'
    }
  },
  {
    id: 'q2',
    role: 'Senior Full Stack Engineer',
    category: 'Behavioral',
    question: 'Describe a situation where you had a strong technical disagreement with a Product Manager regarding feature timelines.',
    contextHint: 'Focus on trade-off analysis, MVP scoping, clear communication, and business alignment.',
    starGuide: {
      situation: 'A feature request demanded complex real-time collaboration before a key investor demo.',
      task: 'Provide a reliable delivery without introducing architectural debt or missing deadlines.',
      action: 'Proposed a phased approach: launched optimistic offline-first UI for demo, then shipped full WebSockets back-end next sprint.',
      result: 'Met the deadline seamlessly with 0 downtime and 100% investor satisfaction.'
    }
  }
];



