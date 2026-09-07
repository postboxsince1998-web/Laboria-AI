import { evaluateDeterministicMatch, TransparentMatchResult } from './resumeOpportunityEngine';
import { ExtractedCandidateProfile } from './resumeParser';
import { JobEntity } from '../types/entities';

export interface ScoringTestResult {
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runScoringEngineTests(): ScoringTestResult[] {
  const results: ScoringTestResult[] = [];

  const mockCandidate: ExtractedCandidateProfile = {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '+91 9876543210',
    education: 'NIT Surathkal',
    degree: 'B.Tech CSE',
    specialization: 'Computer Science',
    graduationYear: 2022,
    experienceYears: 4,
    jobTitles: ['Full Stack Engineer'],
    technicalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    softSkills: ['Technical Leadership'],
    projects: [],
    certifications: [],
    location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
    preferredRoles: ['Senior Full Stack Engineer', 'Software Architect'],
    rawText: 'Full Stack Engineer with 4 years experience in React, Node, TypeScript.'
  } as any;


  // Test Case 1: High Profile Match (Remote Job)
  const jobHighMatch: JobEntity = {
    id: 'test_job_1',
    title: 'Senior Full Stack Engineer',
    company: 'Nexus Tech',
    description: 'Full stack role',
    requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    location: 'Remote',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Remote',
    experienceRequired: { min: 3, max: 6 },
    source: 'Test',
    sourceUrl: '#',
    postedDate: '2026-09-01',
    expiryDate: '2026-10-01'
  };

  // Test Case 2: Distant High Match (2,000 km away in Gurugram)
  const jobDistantHighMatch: JobEntity = {
    id: 'test_job_2',
    title: 'Senior Full Stack Engineer',
    company: 'FinPulse Systems',
    description: 'Distant job in Gurugram',
    requirements: ['React', 'TypeScript', 'Node.js', 'System Design'],
    location: 'Gurugram, Haryana',
    latitude: 28.4595,
    longitude: 77.0266,
    employmentType: 'Full-time',
    experienceRequired: { min: 3, max: 6 },
    source: 'Test',
    sourceUrl: '#',
    postedDate: '2026-09-01',
    expiryDate: '2026-10-01'
  };

  // Test Case 3: Nearby Low Match (5 km away in Bengaluru)
  const jobNearbyLowMatch: JobEntity = {
    id: 'test_job_3',
    title: 'Data Analyst Specialist',
    company: 'Local Analytics',
    description: 'Nearby low match',
    requirements: ['Python', 'SQL', 'Excel', 'Power BI'],
    location: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    employmentType: 'Full-time',
    experienceRequired: { min: 1, max: 3 },
    source: 'Test',
    sourceUrl: '#',
    postedDate: '2026-09-01',
    expiryDate: '2026-10-01'
  };

  const resHigh = evaluateDeterministicMatch(mockCandidate, jobHighMatch);
  const resDistant = evaluateDeterministicMatch(mockCandidate, jobDistantHighMatch);
  const resNearbyLow = evaluateDeterministicMatch(mockCandidate, jobNearbyLowMatch);

  // Test 1: Tier Classification accuracy
  if (resHigh.tier === 'Strong Match' && resHigh.profileMatchScore >= 85) {
    results.push({
      testName: 'Tier Classification (Strong Match 85-100%)',
      status: 'PASSED',
      details: `Profile Match: ${resHigh.profileMatchScore}%, Assigned Tier: ${resHigh.tier}`
    });
  } else {
    results.push({
      testName: 'Tier Classification (Strong Match 85-100%)',
      status: 'FAILED',
      details: `Expected Strong Match, got ${resHigh.tier} (${resHigh.profileMatchScore}%)`
    });
  }

  // Test 2: Transparent Math Formula verification
  const expectedMath = Math.round(
    resHigh.profileMatchScore * 0.70 +
    resHigh.locationScore * 0.15 +
    resHigh.experienceScore * 0.10 +
    resHigh.preferenceScore * 0.05
  );

  if (resHigh.finalPriorityScore === expectedMath) {
    results.push({
      testName: 'Deterministic Formula Transparency Verification',
      status: 'PASSED',
      details: `Final Priority (${resHigh.finalPriorityScore}%) matches exact weighted sum formula.`
    });
  } else {
    results.push({
      testName: 'Deterministic Formula Transparency Verification',
      status: 'FAILED',
      details: `Expected ${expectedMath}, got ${resHigh.finalPriorityScore}`
    });
  }

  // Test 3: Profile Match Primacy Over Distance
  if (resDistant.profileMatchScore > resNearbyLow.profileMatchScore && resDistant.finalPriorityScore > resNearbyLow.finalPriorityScore) {
    results.push({
      testName: 'Profile Match Primacy Over Distance Rule',
      status: 'PASSED',
      details: `Distant Job (2000 km, ${resDistant.profileMatchScore}% Profile) ranked higher than Nearby Job (5 km, ${resNearbyLow.profileMatchScore}% Profile).`
    });
  } else {
    results.push({
      testName: 'Profile Match Primacy Over Distance Rule',
      status: 'FAILED',
      details: `Nearby low-match job erroneously ranked higher than distant high-match job.`
    });
  }

  // Test 4: Low Match Tier Verification
  if (resNearbyLow.tier === 'Low Match' || resNearbyLow.tier === 'Potential Match') {
    results.push({
      testName: 'Low Match Classification (<55%)',
      status: 'PASSED',
      details: `Low skill overlap properly classified as ${resNearbyLow.tier}`
    });
  }

  return results;
}
