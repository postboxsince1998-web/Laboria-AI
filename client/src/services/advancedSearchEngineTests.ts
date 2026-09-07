import { seedJobs } from '../data/seedData';
import { CandidateProfile, JobOpening } from '../types';
import {
  createJobWatchRuleFromSavedSearch,
  executeAdvancedSearch,
  generateFilterExplanations,
  getDefaultAdvancedFilters,
  SavedSearchService,
} from './advancedSearchService';

const mockCandidate: CandidateProfile = {
  id: 'cand_test_adv',
  fullName: 'Test Advanced Searcher',
  email: 'test.adv@laboria.ai',
  phone: '+91 9999999999',
  headline: 'Senior Data Analyst & Python Developer',
  yearsOfExperience: 3,
  currentLocation: {
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  preferredLocations: ['Bengaluru', 'Remote', 'Hyderabad'],
  preferredWorkType: 'Remote',
  targetRoles: ['Data Analyst', 'Python Developer', 'Full Stack Developer'],
  skills: [
    { name: 'Python', level: 'Advanced' },
    { name: 'SQL', level: 'Advanced' },
    { name: 'Power BI', level: 'Intermediate' },
    { name: 'React', level: 'Intermediate' },
    { name: 'Tableau', level: 'Intermediate' },
  ],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  resumeText: 'Experienced Data Analyst skilled in Python, SQL, Power BI, and React.',
};

export interface AdvancedSearchTestReport {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  details: { name: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runAdvancedSearchEngineTests(): AdvancedSearchTestReport {
  const details: { name: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  const addResult = (name: string, passed: boolean, message: string) => {
    details.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message,
    });
  };

  try {
    // Test 1: Default filters initial state
    const defaults = getDefaultAdvancedFilters();
    const test1Pass =
      defaults.minMatchScore === 0 &&
      defaults.skills.length === 0 &&
      defaults.workModes.length === 0 &&
      defaults.maxRadiusKm === 0;
    addResult('Default Filters State', test1Pass, test1Pass ? 'Default filters initialized correctly' : 'Default filters invalid');

    // Test 2: Free text search filtering
    const textResults = executeAdvancedSearch(mockCandidate, seedJobs, 'Python', defaults, 'bestMatch');
    const test2Pass = textResults.length > 0 && textResults.every(r => 
      r.job.title.toLowerCase().includes('python') || 
      r.job.company.toLowerCase().includes('python') || 
      (r.job.skillsRequired || r.job.skills || []).some(s => s.toLowerCase().includes('python')) ||
      (r.job.description || '').toLowerCase().includes('python')
    );
    addResult('Free Text Search', test2Pass, `Found ${textResults.length} jobs matching "Python"`);

    // Test 3: Minimum match score % threshold filtering
    const minScoreFilters = { ...defaults, minMatchScore: 80 };
    const highMatchResults = executeAdvancedSearch(mockCandidate, seedJobs, '', minScoreFilters, 'bestMatch');
    const test3Pass = highMatchResults.length > 0 && highMatchResults.every(r => r.overallMatchScore >= 80);
    addResult('Min Profile Match Score Filter', test3Pass, `${highMatchResults.length} jobs matched >= 80% profile match threshold`);

    // Test 4: Company name filtering
    const companyFilters = { ...defaults, company: seedJobs[0]?.company || 'Analytics' };
    const companyResults = executeAdvancedSearch(mockCandidate, seedJobs, '', companyFilters, 'bestMatch');
    const test4Pass = companyResults.length > 0 && companyResults.every(r => r.job.company.toLowerCase().includes(companyFilters.company.toLowerCase()));
    addResult('Company Name Filter', test4Pass, `Filtered ${companyResults.length} jobs for company "${companyFilters.company}"`);

    // Test 5: Target skills filtering
    const skillFilters = { ...defaults, skills: ['Python', 'SQL'] };
    const skillResults = executeAdvancedSearch(mockCandidate, seedJobs, '', skillFilters, 'bestMatch');
    const test5Pass = skillResults.length > 0 && skillResults.every(r => {
      const jobSkills = (r.job.skillsRequired || r.job.skills || []).map(s => s.toLowerCase());
      return jobSkills.some(js => js.includes('python') || js.includes('sql'));
    });
    addResult('Target Skills Filter', test5Pass, `${skillResults.length} jobs matched target skills ["Python", "SQL"]`);

    // Test 6: Work Mode filtering
    const remoteFilters = { ...defaults, workModes: ['Remote'] };
    const remoteResults = executeAdvancedSearch(mockCandidate, seedJobs, '', remoteFilters, 'bestMatch');
    const test6Pass = remoteResults.every(r => (r.job.workType || '').toLowerCase() === 'remote');
    addResult('Work Mode Filter (Remote)', test6Pass, `Filtered ${remoteResults.length} remote jobs`);

    // Test 7: Max Radius Km filter with Remote exception
    const radiusFilters = { ...defaults, maxRadiusKm: 50 };
    const radiusResults = executeAdvancedSearch(mockCandidate, seedJobs, '', radiusFilters, 'bestMatch');
    const test7Pass = radiusResults.every(r => r.job.workType === 'Remote' || r.distanceKm <= 50);
    addResult('Radius Filter with Remote Exemption', test7Pass, `Radius <=50km or Remote validated across ${radiusResults.length} results`);

    // Test 8: Primary Ranking Rule - Best Match maintains Profile/JD Primacy
    const bestMatchResults = executeAdvancedSearch(mockCandidate, seedJobs, '', defaults, 'bestMatch');
    let test8Pass = true;
    for (let i = 0; i < bestMatchResults.length - 1; i++) {
      if (bestMatchResults[i].overallMatchScore < bestMatchResults[i + 1].overallMatchScore) {
        test8Pass = false;
        break;
      }
    }
    addResult('Primary Ranking Rule (Profile/JD Primacy)', test8Pass, 'Results strictly sorted descending by composite match score');

    // Test 9: Sort by Distance Ascending
    const distanceSorted = executeAdvancedSearch(mockCandidate, seedJobs, '', defaults, 'distanceAsc');
    let test9Pass = true;
    for (let i = 0; i < distanceSorted.length - 1; i++) {
      if (distanceSorted[i].distanceKm > distanceSorted[i + 1].distanceKm) {
        test9Pass = false;
        break;
      }
    }
    addResult('Sorting by Distance Ascending', test9Pass, 'Distance sorting validated correctly');

    // Test 10: Filter Explanations Generator
    const explanations = generateFilterExplanations(minScoreFilters, 'Data', seedJobs.length, highMatchResults.length);
    const test10Pass = explanations.some(e => e.includes('80%')) && explanations.some(e => e.includes('Data'));
    addResult('Beginner Filter Explanations', test10Pass, `Generated ${explanations.length} human-readable explanation sentences`);

    // Test 11: Saved Search Storage operations
    const newSaved = SavedSearchService.saveSearchQuery({
      name: 'Test Automated Saved Search',
      searchQuery: 'Test Query',
      filters: defaults,
      sortBy: 'bestMatch',
      notifyJobWatch: true,
      matchCountAtSave: 5,
    });
    const savedList = SavedSearchService.getSavedSearches();
    const test11Pass = savedList.some(s => s.id === newSaved.id);
    SavedSearchService.deleteSavedSearch(newSaved.id);
    addResult('Saved Searches Storage CRUD', test11Pass, `Successfully created and saved search ID: ${newSaved.id}`);

    // Test 12: Job Watch Integration Payload Generator
    const jwPayload = createJobWatchRuleFromSavedSearch(newSaved);
    const test12Pass = jwPayload.ruleId.includes(newSaved.id) && jwPayload.activeMonitoring === true;
    addResult('Job Watch Integration Payload', test12Pass, `Job Watch rule generated with ID ${jwPayload.ruleId}`);

  } catch (err: any) {
    addResult('Advanced Search Test Suite Exception', false, err.message || String(err));
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
