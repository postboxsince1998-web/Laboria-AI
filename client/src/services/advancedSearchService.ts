import { AdvancedSearchFilters, CandidateProfile, JobOpening, MatchResult, SavedSearchQuery, SearchSortOption } from '../types';
import { evaluateJobMatch } from './jobService';

const SAVED_SEARCHES_STORAGE_KEY = 'laboria_saved_searches';

export function getDefaultAdvancedFilters(): AdvancedSearchFilters {
  return {
    minMatchScore: 0,
    skills: [],
    company: '',
    careerTarget: '',
    locationQuery: '',
    maxRadiusKm: 0,
    workModes: [],
    minExperience: 0,
    maxExperience: 50,
    employmentTypes: [],
    postedWithinDays: 0,
  };
}

/**
 * Executes advanced multi-criteria search over jobs.
 * Primary ranking factor MUST ALWAYS be Profile/JD match.
 */
export function executeAdvancedSearch(
  candidate: CandidateProfile,
  jobs: JobOpening[],
  queryStr: string = '',
  filters: AdvancedSearchFilters = getDefaultAdvancedFilters(),
  sortBy: SearchSortOption = 'bestMatch'
): MatchResult[] {
  // 1. Evaluate job match for candidate (preserves profile/JD 60% weighting + location 20%)
  let matchResults: MatchResult[] = jobs.map((job) => evaluateJobMatch(candidate, job));

  // 2. Filter by free-text search query (Job title, company, skills, description)
  if (queryStr && queryStr.trim() !== '') {
    const q = queryStr.trim().toLowerCase();
    matchResults = matchResults.filter((m) => {
      const titleMatch = m.job.title.toLowerCase().includes(q);
      const companyMatch = m.job.company.toLowerCase().includes(q);
      const skillsMatch = (m.job.skillsRequired || m.job.skills || []).some((s) =>
        s.toLowerCase().includes(q)
      );
      const descMatch = (m.job.description || '').toLowerCase().includes(q);
      return titleMatch || companyMatch || skillsMatch || descMatch;
    });
  }

  // 3. Filter by Company name
  if (filters.company && filters.company.trim() !== '') {
    const companyQuery = filters.company.trim().toLowerCase();
    matchResults = matchResults.filter((m) =>
      m.job.company.toLowerCase().includes(companyQuery)
    );
  }

  // 4. Filter by Target Career / Role
  if (filters.careerTarget && filters.careerTarget.trim() !== '') {
    const careerQuery = filters.careerTarget.trim().toLowerCase();
    matchResults = matchResults.filter(
      (m) =>
        m.job.title.toLowerCase().includes(careerQuery) ||
        (m.job.skillsRequired || m.job.skills || []).some((s) =>
          s.toLowerCase().includes(careerQuery)
        )
    );
  }

  // 5. Filter by Target Skills (Must match at least one selected skill if provided)
  if (filters.skills && filters.skills.length > 0) {
    const targetSkillsLower = filters.skills.map((s) => s.toLowerCase());
    matchResults = matchResults.filter((m) => {
      const jobSkills = (m.job.skillsRequired || m.job.skills || []).map((s) => s.toLowerCase());
      return targetSkillsLower.some((reqSkill) =>
        jobSkills.some((js) => js.includes(reqSkill) || reqSkill.includes(js))
      );
    });
  }

  // 6. Filter by Location Query
  if (filters.locationQuery && filters.locationQuery.trim() !== '') {
    const locQuery = filters.locationQuery.trim().toLowerCase();
    matchResults = matchResults.filter((m) => {
      const jobLocStr = typeof m.job.location === 'string'
        ? m.job.location.toLowerCase()
        : `${m.job.location?.city || ''} ${m.job.location?.state || ''}`.toLowerCase();
      return jobLocStr.includes(locQuery) || m.job.workType?.toLowerCase() === 'remote';
    });
  }

  // 7. Filter by Radius (Km) - Location is secondary, remote jobs bypass radius limits
  if (filters.maxRadiusKm && filters.maxRadiusKm > 0) {
    matchResults = matchResults.filter((m) => {
      if (m.job.workType === 'Remote') return true;
      return m.distanceKm <= filters.maxRadiusKm;
    });
  }

  // 8. Filter by Work Mode (Remote, Hybrid, On-site)
  if (filters.workModes && filters.workModes.length > 0) {
    const modesLower = filters.workModes.map((wm) => wm.toLowerCase());
    matchResults = matchResults.filter((m) => {
      const wt = (m.job.workType || 'On-site').toLowerCase();
      return modesLower.some((mode) => wt.includes(mode) || mode.includes(wt));
    });
  }

  // 9. Filter by Employment Type (Full-time, Contract, Internship, Part-time)
  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    const typesLower = filters.employmentTypes.map((et) => et.toLowerCase());
    matchResults = matchResults.filter((m) => {
      const empType = (m.job.employmentType || m.job.workType || 'Full-time').toLowerCase();
      return typesLower.some((t) => empType.includes(t) || t.includes(empType));
    });
  }

  // 10. Filter by Experience Range
  matchResults = matchResults.filter((m) => {
    const minExp = m.job.minExperience ?? 0;
    const maxExp = m.job.maxExperience ?? 50;
    return minExp <= filters.maxExperience && maxExp >= filters.minExperience;
  });

  // 11. Filter by Minimum Profile Match Score %
  if (filters.minMatchScore > 0) {
    matchResults = matchResults.filter(
      (m) => m.overallMatchScore >= filters.minMatchScore
    );
  }

  // 12. Filter by Date Posted
  if (filters.postedWithinDays > 0) {
    const now = new Date();
    matchResults = matchResults.filter((m) => {
      if (!m.job.postedDate) return true;
      const posted = new Date(m.job.postedDate);
      if (isNaN(posted.getTime())) return true;
      const diffTime = Math.abs(now.getTime() - posted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= filters.postedWithinDays;
    });
  }

  // 13. Sorting (Default: 'bestMatch' maintaining Profile/JD Primacy)
  matchResults.sort((a, b) => {
    switch (sortBy) {
      case 'scoreDesc':
      case 'bestMatch':
        return b.overallMatchScore - a.overallMatchScore;
      case 'distanceAsc':
        return a.distanceKm - b.distanceKm;
      case 'dateDesc':
        const dateA = a.job.postedDate ? new Date(a.job.postedDate).getTime() : 0;
        const dateB = b.job.postedDate ? new Date(b.job.postedDate).getTime() : 0;
        return dateB - dateA;
      case 'salaryDesc':
        const salA = a.job.salaryRange?.max || 0;
        const salB = b.job.salaryRange?.max || 0;
        return salB - salA;
      default:
        return b.overallMatchScore - a.overallMatchScore;
    }
  });

  return matchResults;
}

/**
 * Generates plain-English, beginner-friendly filter explanations.
 */
export function generateFilterExplanations(
  filters: AdvancedSearchFilters,
  queryStr: string = '',
  totalJobsCount: number = 0,
  filteredJobsCount: number = 0
): string[] {
  const explanations: string[] = [];

  if (queryStr && queryStr.trim()) {
    explanations.push(`Matching keyword query: "${queryStr.trim()}"`);
  }

  if (filters.minMatchScore > 0) {
    explanations.push(`Only show jobs that match at least ${filters.minMatchScore}% of your candidate profile.`);
  } else {
    explanations.push(`Showing all profile match percentage levels.`);
  }

  if (filters.skills && filters.skills.length > 0) {
    explanations.push(`Filtered by required skills: ${filters.skills.join(', ')}.`);
  }

  if (filters.careerTarget && filters.careerTarget.trim()) {
    explanations.push(`Targeting career path: "${filters.careerTarget.trim()}".`);
  }

  if (filters.company && filters.company.trim()) {
    explanations.push(`Restricted to employer: "${filters.company.trim()}".`);
  }

  if (filters.locationQuery && filters.locationQuery.trim()) {
    explanations.push(`Location specified: "${filters.locationQuery.trim()}".`);
  }

  if (filters.maxRadiusKm && filters.maxRadiusKm > 0) {
    explanations.push(`Within ${filters.maxRadiusKm} km radius (Remote opportunities automatically included).`);
  }

  if (filters.workModes && filters.workModes.length > 0) {
    explanations.push(`Work Mode restricted to: ${filters.workModes.join(', ')}.`);
  }

  if (filters.employmentTypes && filters.employmentTypes.length > 0) {
    explanations.push(`Employment Types restricted to: ${filters.employmentTypes.join(', ')}.`);
  }

  if (filters.minExperience > 0 || filters.maxExperience < 30) {
    explanations.push(`Experience range: ${filters.minExperience} to ${filters.maxExperience} years.`);
  }

  if (filters.postedWithinDays > 0) {
    explanations.push(`Posted within the last ${filters.postedWithinDays} days.`);
  }

  explanations.push(`Result: ${filteredJobsCount} of ${totalJobsCount} available opportunities matched your criteria.`);

  return explanations;
}

/**
 * Saved Searches Storage Manager
 */
export class SavedSearchService {
  public static getSavedSearches(): SavedSearchQuery[] {
    try {
      const data = localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
      if (!data) return this.getDefaultSavedSearches();
      return JSON.parse(data);
    } catch {
      return this.getDefaultSavedSearches();
    }
  }

  public static saveSearchQuery(search: Omit<SavedSearchQuery, 'id' | 'createdAt'>): SavedSearchQuery {
    const existing = this.getSavedSearches();
    const newEntry: SavedSearchQuery = {
      ...search,
      id: `saved_search_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing];
    try {
      localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save search failed', e);
    }
    return newEntry;
  }

  public static deleteSavedSearch(id: string): void {
    const existing = this.getSavedSearches();
    const updated = existing.filter((s) => s.id !== id);
    try {
      localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete search failed', e);
    }
  }

  public static toggleSavedSearchJobWatch(id: string, notifyJobWatch: boolean): SavedSearchQuery | null {
    const existing = this.getSavedSearches();
    let updatedQuery: SavedSearchQuery | null = null;
    const updated = existing.map((s) => {
      if (s.id === id) {
        updatedQuery = { ...s, notifyJobWatch };
        return updatedQuery;
      }
      return s;
    });
    try {
      localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage update search failed', e);
    }
    return updatedQuery;
  }

  private static getDefaultSavedSearches(): SavedSearchQuery[] {
    return [
      {
        id: 'saved_default_1',
        name: 'High-Match Data Roles (>80%)',
        searchQuery: 'Data',
        filters: {
          ...getDefaultAdvancedFilters(),
          minMatchScore: 80,
          workModes: ['Remote', 'Hybrid'],
        },
        sortBy: 'bestMatch',
        createdAt: '2026-09-01T10:00:00Z',
        notifyJobWatch: true,
        matchCountAtSave: 4,
      },
      {
        id: 'saved_default_2',
        name: 'Full Stack & Python - Remote',
        searchQuery: 'Python',
        filters: {
          ...getDefaultAdvancedFilters(),
          minMatchScore: 70,
          workModes: ['Remote'],
        },
        sortBy: 'bestMatch',
        createdAt: '2026-09-02T14:30:00Z',
        notifyJobWatch: false,
        matchCountAtSave: 3,
      },
    ];
  }
}

/**
 * Prepares architecture payload for Job Watch automated monitoring integration
 */
export function createJobWatchRuleFromSavedSearch(savedSearch: SavedSearchQuery) {
  return {
    ruleId: `job_watch_rule_${savedSearch.id}`,
    name: savedSearch.name,
    userId: 'default_user',
    targetQuery: savedSearch.searchQuery,
    minProfileMatchScore: savedSearch.filters.minMatchScore || 70,
    preferredWorkModes: savedSearch.filters.workModes,
    preferredRadiusKm: savedSearch.filters.maxRadiusKm,
    skillsOfInterest: savedSearch.filters.skills,
    activeMonitoring: savedSearch.notifyJobWatch,
    createdFromSavedSearchId: savedSearch.id,
    createdAt: new Date().toISOString(),
  };
}
