import {
  UserEntity,
  ResumeEntity,
  SkillEntity,
  UserSkillEntity,
  JobEntity,
  JobMatchEntity,
  CareerEntity,
  ReadinessAssessmentEntity,
  InterviewSessionEntity,
  MentorConversationEntity,
  FutureSkillEntity
} from '../types/entities';

export const seedUsers: UserEntity[] = [
  {
    id: 'usr_101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    education: 'National Institute of Technology, Surathkal',
    degree: 'Bachelor of Technology (B.Tech)',
    specialization: 'Computer Science & Engineering',
    graduationYear: 2022,
    experienceLevel: 'Mid',
    currentLocation: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    preferredLocations: ['Bengaluru', 'Hyderabad', 'Remote', 'Pune'],
    preferredRadius: 50,
    willingToRelocate: true,
    workPreference: 'Hybrid',
    targetRoles: ['Senior Frontend Developer', 'Full Stack Engineer', 'Junior Data Analyst', 'Software Architect'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z'
  }
];

export const seedResumes: ResumeEntity[] = [
  {
    id: 'res_101',
    userId: 'usr_101',
    fileName: 'Aarav_Sharma_FullStack_Resume.pdf',
    extractedText: 'Aarav Sharma - Full Stack Engineer with 4 years of experience in React, Node.js, TypeScript, Python, SQL, Excel, Data Analysis, PostgreSQL, and AWS Cloud System Design.',
    parsedProfile: {
      skillsFound: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Python', 'SQL', 'Excel', 'Data Analysis', 'PostgreSQL', 'Docker', 'AWS'],
      experienceYears: 4,
      educationSummary: 'B.Tech CSE, NIT Surathkal (2022)',
      keyAchievements: [
        'Architected WebSockets pipeline handling 50k events/sec',
        'Reduced initial bundle load time by 58%'
      ]
    },
    uploadedAt: '2026-08-20T14:30:00Z',
    updatedAt: '2026-09-01T09:15:00Z'
  }
];

export const seedSkills: SkillEntity[] = [
  { id: 'skl_1', name: 'React', category: 'Tech' },
  { id: 'skl_2', name: 'TypeScript', category: 'Tech' },
  { id: 'skl_3', name: 'Node.js', category: 'Tech' },
  { id: 'skl_4', name: 'Express', category: 'Tech' },
  { id: 'skl_5', name: 'Tailwind CSS', category: 'Tech' },
  { id: 'skl_6', name: 'Python', category: 'Tech' },
  { id: 'skl_7', name: 'SQL', category: 'Tech' },
  { id: 'skl_8', name: 'Excel', category: 'Tech' },
  { id: 'skl_9', name: 'Data Analysis', category: 'Domain' },
  { id: 'skl_10', name: 'Power BI', category: 'Tech' },
  { id: 'skl_11', name: 'PostgreSQL', category: 'Tech' },
  { id: 'skl_12', name: 'Docker', category: 'Tech' },
  { id: 'skl_13', name: 'AWS Cloud', category: 'Tech' }
];

export const seedUserSkills: UserSkillEntity[] = [
  { userId: 'usr_101', skillId: 'skl_1', proficiency: 'Expert', evidence: 'Built micro-frontend framework serving 2M users' },
  { userId: 'usr_101', skillId: 'skl_2', proficiency: 'Advanced', evidence: 'Maintained strict type checking across monorepo' },
  { userId: 'usr_101', skillId: 'skl_3', proficiency: 'Advanced', evidence: 'Designed REST & WebSockets APIs in Node' },
  { userId: 'usr_101', skillId: 'skl_6', proficiency: 'Advanced', evidence: 'Built data extraction & analytics scripts in Python' },
  { userId: 'usr_101', skillId: 'skl_7', proficiency: 'Expert', evidence: 'Complex SQL queries and relational database schemas' },
  { userId: 'usr_101', skillId: 'skl_8', proficiency: 'Expert', evidence: 'Advanced modeling and pivot tables in Excel' },
  { userId: 'usr_101', skillId: 'skl_9', proficiency: 'Advanced', evidence: 'Statistical data analysis and insights extraction' }
];

export const seedJobs: JobEntity[] = [
  {
    id: 'job_analytics_1',
    title: 'Junior Data Analyst',
    company: 'Apex Data Insights',
    description: 'We are seeking a detail-oriented Junior Data Analyst in Bengaluru to perform SQL queries, Python data analysis, and dashboard modeling.',
    requirements: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Power BI'],
    location: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Full-time',
    experienceRequired: { min: 1, max: 3 },
    source: 'Laboria Direct',
    sourceUrl: '#',
    postedDate: '2026-09-04',
    expiryDate: '2026-10-04'
  },
  {
    id: 'job_analytics_2',
    title: 'Business Analyst',
    company: 'FinTech Growth Partners',
    description: 'Analyze key financial metrics and process requirements for our digital banking product in Bengaluru.',
    requirements: ['SQL', 'Excel', 'Data Analysis', 'Communication', 'Requirements Gathering'],
    location: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Full-time',
    experienceRequired: { min: 2, max: 4 },
    source: 'Laboria Direct',
    sourceUrl: '#',
    postedDate: '2026-09-03',
    expiryDate: '2026-10-03'
  },
  {
    id: 'job_analytics_3',
    title: 'Data Associate',
    company: 'CloudMetrics Solutions',
    description: 'Join our data operations team in Bengaluru processing customer insights and database cleanliness.',
    requirements: ['SQL', 'Excel', 'Data Cleaning', 'Python'],
    location: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Full-time',
    experienceRequired: { min: 1, max: 2 },
    source: 'TechCareers India',
    sourceUrl: '#',
    postedDate: '2026-09-02',
    expiryDate: '2026-10-02'
  },
  {
    id: 'job_201',
    title: 'Senior Full Stack Engineer (React + Node.js)',
    company: 'Nexus Cloud Technologies',
    description: 'We are seeking a seasoned Full Stack Engineer to lead front-to-back architecture of our enterprise cloud governance product in Bengaluru.',
    requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    location: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Full-time',
    experienceRequired: { min: 3, max: 6 },
    source: 'Direct Portal',
    sourceUrl: '#',
    postedDate: '2026-09-01',
    expiryDate: '2026-10-01'
  },
  {
    id: 'job_202',
    title: 'Lead Frontend Developer (Remote)',
    company: 'HyperScale AI',
    description: 'Build cutting-edge AI workspace tools with fast response times and sleek modern user interfaces.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    location: 'Remote, India',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Remote',
    experienceRequired: { min: 4, max: 7 },
    source: 'Laboria Direct',
    sourceUrl: '#',
    postedDate: '2026-09-03',
    expiryDate: '2026-10-03'
  }
];

export const seedJobMatches: JobMatchEntity[] = [
  {
    userId: 'usr_101',
    jobId: 'job_analytics_1',
    profileMatchScore: 94,
    locationScore: 95,
    experienceScore: 100,
    preferenceScore: 100,
    finalPriorityScore: 95,
    matchedSkills: ['Python', 'SQL', 'Excel', 'Data Analysis'],
    missingSkills: ['Power BI'],
    positiveSuggestions: [
      'Strong technical fit with 4 out of 5 required skills matched (Python, SQL, Excel, Data Analysis).',
      'Located only 12 km away from your base in Bengaluru.'
    ],
    negativeSuggestions: ['Missing Power BI.'],
    recommendation: 'Strong match. Consider improving Power BI before the interview.',
    createdAt: '2026-09-04T12:30:00Z'
  },
  {
    userId: 'usr_101',
    jobId: 'job_analytics_2',
    profileMatchScore: 88,
    locationScore: 98,
    experienceScore: 95,
    preferenceScore: 100,
    finalPriorityScore: 90,
    matchedSkills: ['SQL', 'Excel', 'Data Analysis', 'Communication'],
    missingSkills: ['Requirements Gathering'],
    positiveSuggestions: [
      'High profile match (88%). Located only 7 km away.'
    ],
    negativeSuggestions: [],
    recommendation: 'Strong match for Business Analyst positions.',
    createdAt: '2026-09-04T12:30:00Z'
  },
  {
    userId: 'usr_101',
    jobId: 'job_analytics_3',
    profileMatchScore: 81,
    locationScore: 90,
    experienceScore: 100,
    preferenceScore: 90,
    finalPriorityScore: 84,
    matchedSkills: ['SQL', 'Excel', 'Python'],
    missingSkills: ['Data Cleaning'],
    positiveSuggestions: [
      'Good profile match (81%). Located 18 km away.'
    ],
    negativeSuggestions: [],
    recommendation: 'Good match for Data Associate role.',
    createdAt: '2026-09-04T12:30:00Z'
  }
];

export const seedCareers: CareerEntity[] = [
  {
    id: 'car_1',
    title: 'Staff Software Architect',
    description: 'Lead technical design, microservices architecture, and technical standards across enterprise product lines.',
    requiredSkills: ['System Design', 'Event-Driven Architecture', 'Cloud Native', 'Kubernetes'],
    futureSkills: ['AI Native Workflows', 'Rust Microservices'],
    careerPath: [
      {
        step: 1,
        title: 'Master Advanced Distributed Systems',
        duration: '2 - 3 Months',
        keySkillsToAcquire: ['Kafka', 'Event Streaming', 'Cache Invalidation'],
        description: 'Deepen system design capabilities for high-concurrency cloud environments.'
      }
    ]
  }
];

export const seedReadinessAssessments: ReadinessAssessmentEntity[] = [
  {
    userId: 'usr_101',
    technicalScore: 92,
    communicationScore: 84,
    softSkillsScore: 82,
    resumeScore: 88,
    projectScore: 90,
    interviewScore: 85,
    overallScore: 88,
    recommendations: [
      'Add certifications or projects demonstrating Power BI or Docker deployment.',
      'Practice STAR method interview responses in AI Interview Prep module.'
    ],
    updatedAt: '2026-09-04T13:00:00Z'
  }
];

export const seedInterviewSessions: InterviewSessionEntity[] = [];
export const seedMentorConversations: MentorConversationEntity[] = [];
export const seedFutureSkills: FutureSkillEntity[] = [
  {
    name: 'RAG Architecture & Vector DBs',
    category: 'AI & Data',
    demandLevel: 'Surging',
    futurePotential: 96,
    relatedCareers: ['AI Application Engineer', 'LLM Solutions Architect']
  }
];
