export interface ServerJob {
  id: string;
  title: string;
  company: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  minExperience: number;
  maxExperience: number;
  skillsRequired: string[];
  description: string;
  salaryMin: number;
  salaryMax: number;
}

export const serverJobsData: ServerJob[] = [
  {
    id: 'sjob_1',
    title: 'Senior Full Stack Engineer (React + Node)',
    company: 'Nexus Cloud Technologies',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    workType: 'Hybrid',
    minExperience: 3,
    maxExperience: 6,
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    description: 'Lead front-to-back architecture of our enterprise cloud governance product in Bengaluru.',
    salaryMin: 2200000,
    salaryMax: 3200000
  },
  {
    id: 'sjob_2',
    title: 'Lead Frontend Developer (Remote)',
    company: 'HyperScale AI',
    city: 'Remote',
    state: 'Pan-India',
    latitude: 12.9716,
    longitude: 77.5946,
    workType: 'Remote',
    minExperience: 4,
    maxExperience: 7,
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
    description: 'Build cutting-edge AI workspace tools with fast response times and sleek modern user interfaces.',
    salaryMin: 2800000,
    salaryMax: 3800000
  },
  {
    id: 'sjob_3',
    title: 'Backend Systems Engineer',
    company: 'ZettaData Labs',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.3850,
    longitude: 78.4867,
    workType: 'Hybrid',
    minExperience: 3,
    maxExperience: 5,
    skillsRequired: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    description: 'Scale our data ingestion APIs processing 100M+ webhooks daily across global infrastructure.',
    salaryMin: 1800000,
    salaryMax: 2600000
  }
];
