import { JobEntity } from '../types/entities';
import { seedJobs } from '../data/seedData';
import { normalizeCityName } from './locationService';

export interface SearchJobFilters {
  query?: string;
  career?: string;
  skills?: string[];
  city?: string;
  state?: string;
  radiusKm?: number;
  candidateLat?: number;
  candidateLon?: number;
  experienceMin?: number;
  experienceMax?: number;
  workMode?: 'Remote' | 'Hybrid' | 'Onsite' | 'Any';
  employmentType?: string;
  minProfileMatchScore?: number;
  status?: 'Active' | 'Expired' | 'Unknown';
}

export interface IJobDataProvider {
  getSourceName(): string;
  fetchJobs(): Promise<JobEntity[]>;
  searchJobs(filters: SearchJobFilters): Promise<JobEntity[]>;
  getJob(id: string): Promise<JobEntity | null>;
  normalizeJob(rawJob: any): JobEntity;
  validateJob(job: JobEntity): { valid: boolean; error?: string };
}

/**
 * Normalization Service standardizing job fields into Laboria AI JobEntity schema
 */
export class JobNormalizationService {
  public static normalizeJob(rawJob: any, sourceName = 'Permitted Feed Provider'): JobEntity {
    const rawLocation = rawJob.location || 'Bengaluru, Karnataka';
    const cityPart = rawLocation.split(',')[0].trim();
    const statePart = rawLocation.split(',')[1]?.trim() || 'Karnataka';

    const normalizedCity = normalizeCityName(cityPart);

    return {
      id: rawJob.id || `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: rawJob.title || 'Software Developer',
      company: rawJob.company || 'Tech Employer',
      description: rawJob.description || 'Position details available.',
      requirements: Array.isArray(rawJob.requirements) ? rawJob.requirements : ['Python', 'SQL'],
      location: `${normalizedCity}, ${statePart}`,
      latitude: typeof rawJob.latitude === 'number' ? rawJob.latitude : 12.9716,
      longitude: typeof rawJob.longitude === 'number' ? rawJob.longitude : 77.5946,
      employmentType: rawJob.employmentType || rawJob.workType || 'Full-time',
      experienceRequired: rawJob.experienceRequired || { min: 1, max: 3 },
      salaryRange: rawJob.salaryRange || { min: 600000, max: 1200000, currency: 'INR' },
      source: rawJob.source || sourceName,
      sourceUrl: rawJob.sourceUrl || 'https://laboria.ai/jobs/demo',
      postedDate: rawJob.postedDate || '2026-09-01',
      expiryDate: rawJob.expiryDate || '2026-10-01',
      status: rawJob.status || 'Active'
    };
  }
}

/**
 * Duplicate Detection Service identifying duplicate postings across data providers
 */
export class DuplicateDetectionService {
  public static isDuplicate(jobA: JobEntity, jobB: JobEntity): boolean {
    if (jobA.id === jobB.id) return true;

    const normTitleA = jobA.title.toLowerCase().trim();
    const normTitleB = jobB.title.toLowerCase().trim();
    const normCompanyA = jobA.company.toLowerCase().trim();
    const normCompanyB = jobB.company.toLowerCase().trim();
    const normCityA = normalizeCityName(jobA.location.split(',')[0]);
    const normCityB = normalizeCityName(jobB.location.split(',')[0]);

    const isSameCompany = normCompanyA === normCompanyB;
    const isSameTitle = normTitleA === normTitleB || normTitleA.includes(normTitleB) || normTitleB.includes(normTitleA);
    const isSameCity = normCityA.toLowerCase() === normCityB.toLowerCase();
    const isSameSourceUrl = jobA.sourceUrl && jobB.sourceUrl && jobA.sourceUrl === jobB.sourceUrl;

    return isSameSourceUrl || (isSameCompany && isSameTitle && isSameCity);
  }

  public static deduplicateJobs(jobs: JobEntity[]): JobEntity[] {
    const unique: JobEntity[] = [];

    for (const job of jobs) {
      const exists = unique.some((existing) => DuplicateDetectionService.isDuplicate(existing, job));
      if (!exists) {
        unique.push(job);
      }
    }

    return unique;
  }
}

/**
 * Demo Job Data Provider implementing IJobDataProvider interface
 */
export class DemoJobDataProvider implements IJobDataProvider {
  public getSourceName(): string {
    return 'Permitted Employer Submission & Demo Feed';
  }

  public async fetchJobs(): Promise<JobEntity[]> {
    return seedJobs.map((j) => JobNormalizationService.normalizeJob(j, this.getSourceName()));
  }

  public async searchJobs(filters: SearchJobFilters): Promise<JobEntity[]> {
    const allJobs = await this.fetchJobs();

    return allJobs.filter((job) => {
      // Exclude expired jobs
      if (job.status === 'Expired') return false;

      // Query filter
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesReqs = job.requirements.some((r) => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesReqs) return false;
      }

      // City filter with alias normalization
      if (filters.city) {
        const normFilterCity = normalizeCityName(filters.city).toLowerCase();
        const normJobCity = normalizeCityName(job.location.split(',')[0]).toLowerCase();
        if (normFilterCity !== normJobCity && job.employmentType !== 'Remote') return false;
      }

      // Work mode filter
      if (filters.workMode && filters.workMode !== 'Any') {
        if (filters.workMode === 'Remote' && job.employmentType !== 'Remote') return false;
        if (filters.workMode === 'Hybrid' && !job.employmentType.toLowerCase().includes('hybrid')) return false;
      }

      return true;
    });
  }

  public async getJob(id: string): Promise<JobEntity | null> {
    const jobs = await this.fetchJobs();
    return jobs.find((j) => j.id === id) || null;
  }

  public normalizeJob(rawJob: any): JobEntity {
    return JobNormalizationService.normalizeJob(rawJob, this.getSourceName());
  }

  public validateJob(job: JobEntity): { valid: boolean; error?: string } {
    if (!job.title || !job.company) {
      return { valid: false, error: 'Job title and company are required.' };
    }
    return { valid: true };
  }
}
