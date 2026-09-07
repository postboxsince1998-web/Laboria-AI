import { ExtractedCandidateProfile } from './resumeParser';
import { JobEntity } from '../types/entities';
import { seedJobs } from '../data/seedData';

export type MatchTier = 'Strong Match' | 'Good Match' | 'Potential Match' | 'Low Match';

export type ApplicationRecommendationTier =
  | 'Recommended — Apply'
  | 'Recommended — Improve These Areas First'
  | 'Potential Match — Consider After Skill Improvement'
  | 'Low Match — Not a Current Priority';

export interface TransparentMatchResult {
  job: JobEntity;
  profileMatchScore: number;     // Weight 70% (PRIMARY)
  locationScore: number;         // Weight 15%
  experienceScore: number;       // Weight 10%
  preferenceScore: number;       // Weight 5%
  finalPriorityScore: number;    // Transparent Composite
  tier: MatchTier;
  distanceKm: number;
  matchedRequiredSkills: string[];  // ✓ Required skills satisfied
  matchedPreferredSkills: string[]; // ✓ Preferred skills satisfied
  missingRequiredSkills: string[];  // ⚠ Missing required skills
  missingPreferredSkills: string[]; // ⚠ Missing preferred skills
  matchingSkills: string[];         // Combined matched skills
  missingSkills: string[];          // Combined missing skills
  whyThisJob: string[];             // Positive evidence points
  whatToImprove: string[];          // Constructive improvement points
  applicationRecommendation: ApplicationRecommendationTier;
  recommendationText: string;
}

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function evaluateDeterministicMatch(
  candidate: ExtractedCandidateProfile,
  job: JobEntity
): TransparentMatchResult {
  const allCandidateSkillsLower = [
    ...candidate.technicalSkills,
    ...candidate.softSkills
  ].map((s) => s.toLowerCase());

  // Separate required vs preferred requirements if available
  // Standard JobEntity requirements are required skills; first 70% required, remaining preferred if length > 4
  const reqSkillsList = job.requirements.slice(0, Math.ceil(job.requirements.length * 0.75));
  const prefSkillsList = job.requirements.slice(Math.ceil(job.requirements.length * 0.75));

  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const matchedPreferredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];

  reqSkillsList.forEach((skill) => {
    const isMatched = allCandidateSkillsLower.some(
      (cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
    );
    if (isMatched) {
      matchedRequiredSkills.push(skill);
    } else {
      missingRequiredSkills.push(skill);
    }
  });

  prefSkillsList.forEach((skill) => {
    const isMatched = allCandidateSkillsLower.some(
      (cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
    );
    if (isMatched) {
      matchedPreferredSkills.push(skill);
    } else {
      missingPreferredSkills.push(skill);
    }
  });

  const matchingSkills = [...matchedRequiredSkills, ...matchedPreferredSkills];
  const missingSkills = [...missingRequiredSkills, ...missingPreferredSkills];

  // 1. PROFILE_MATCH Calculation (70% Weight - PRIMARY)
  // Required skills carry 80% of profile score; Preferred skills carry 20%
  const reqMatchRatio = reqSkillsList.length > 0 ? matchedRequiredSkills.length / reqSkillsList.length : 1.0;
  const prefMatchRatio = prefSkillsList.length > 0 ? matchedPreferredSkills.length / prefSkillsList.length : 1.0;
  
  const baseSkillScore = reqMatchRatio * 75 + prefMatchRatio * 15;

  const isTitleMatch = candidate.preferredRoles.some(
    (role) => job.title.toLowerCase().includes(role.toLowerCase()) || role.toLowerCase().includes(job.title.toLowerCase())
  );
  const titleBonus = isTitleMatch ? 10 : 0;

  const profileMatchScore = Math.min(100, Math.round(baseSkillScore + titleBonus));

  // 2. LOCATION_MATCH Calculation (15% Weight)
  const distanceKm = calculateHaversineDistance(
    candidate.location.latitude,
    candidate.location.longitude,
    job.latitude,
    job.longitude
  );

  let locationScore = 100;
  if (job.employmentType === 'Remote') {
    locationScore = 100;
  } else if (candidate.location.city.toLowerCase() === job.location.split(',')[0].toLowerCase()) {
    locationScore = 95;
  } else {
    // Gradual penalty for distance, capped at minimum 20%
    locationScore = Math.max(20, Math.round(100 - distanceKm / 25));
  }

  // 3. EXPERIENCE_MATCH Calculation (10% Weight)
  let experienceScore = 100;
  if (candidate.experienceYears < job.experienceRequired.min) {
    const gap = job.experienceRequired.min - candidate.experienceYears;
    experienceScore = Math.max(40, 100 - gap * 20);
  } else if (candidate.experienceYears > job.experienceRequired.max + 3) {
    experienceScore = 85;
  }

  // 4. PREFERENCE_MATCH Calculation (5% Weight)
  const preferenceScore = job.employmentType === 'Remote' ? 100 : 85;

  // Final Priority Score Computation
  const finalPriorityScore = Math.round(
    profileMatchScore * 0.70 +
    locationScore * 0.15 +
    experienceScore * 0.10 +
    preferenceScore * 0.05
  );

  // Match Classification Tier Assignment
  let tier: MatchTier = 'Low Match';
  if (profileMatchScore >= 85) {
    tier = 'Strong Match';
  } else if (profileMatchScore >= 70) {
    tier = 'Good Match';
  } else if (profileMatchScore >= 55) {
    tier = 'Potential Match';
  } else {
    tier = 'Low Match';
  }

  // Application Recommendation Assignment
  let applicationRecommendation: ApplicationRecommendationTier = 'Low Match — Not a Current Priority';
  if (profileMatchScore >= 85 && missingRequiredSkills.length === 0) {
    applicationRecommendation = 'Recommended — Apply';
  } else if (profileMatchScore >= 70) {
    applicationRecommendation = 'Recommended — Improve These Areas First';
  } else if (profileMatchScore >= 55) {
    applicationRecommendation = 'Potential Match — Consider After Skill Improvement';
  } else {
    applicationRecommendation = 'Low Match — Not a Current Priority';
  }

  // "Why this job?" Positive Evidence Points
  const whyThisJob: string[] = [];
  if (matchedRequiredSkills.length > 0) {
    whyThisJob.push(`Your technical background satisfies core requirements (${matchedRequiredSkills.join(', ')}).`);
  }
  if (isTitleMatch) {
    whyThisJob.push(`Your preferred target role directly aligns with the position title ("${job.title}").`);
  }
  if (candidate.experienceYears >= job.experienceRequired.min) {
    whyThisJob.push(`Your experience (${candidate.experienceYears} YOE) meets or exceeds the required eligibility (${job.experienceRequired.min}–${job.experienceRequired.max} YOE).`);
  }
  if (job.employmentType === 'Remote') {
    whyThisJob.push(`Remote work option eliminates commute constraints.`);
  } else if (distanceKm <= 50) {
    whyThisJob.push(`Convenient location proximity: ${distanceKm} km away from your base in ${candidate.location.city}.`);
  }

  // "What may reduce your chances?" Constructive Improvement Points (Constructive & Positive Language)
  const whatToImprove: string[] = [];
  if (missingRequiredSkills.length > 0) {
    whatToImprove.push(`Required skill gap: ${missingRequiredSkills.join(', ')} is specified in the JD but not clearly demonstrated on your profile.`);
  }
  if (missingPreferredSkills.length > 0) {
    whatToImprove.push(`Preferred skill enhancement: Adding ${missingPreferredSkills.join(', ')} would further boost your application ranking.`);
  }
  if (candidate.experienceYears < job.experienceRequired.min) {
    whatToImprove.push(`Experience difference: Role prefers ${job.experienceRequired.min}+ years experience. Highlight hands-on projects to validate proficiency.`);
  }
  if (distanceKm > 100 && job.employmentType !== 'Remote') {
    whatToImprove.push(`Location consideration: Role is based in ${job.location} (${distanceKm} km away). Confirm relocation readiness during screening.`);
  }

  if (whatToImprove.length === 0) {
    whatToImprove.push(`Zero core skill gaps identified. Prepare your resume highlights for direct application.`);
  }

  // Recommendation Text
  let recommendationText = '';
  if (tier === 'Strong Match') {
    recommendationText = `Strong profile match (${profileMatchScore}%). Your background in ${matchingSkills.slice(0, 3).join(', ')} satisfies top technical criteria.`;
  } else if (tier === 'Good Match') {
    recommendationText = `Good match (${profileMatchScore}%). Reviewing missing items (${missingSkills.join(', ') || 'None'}) before interviewing will maximize your callback rate.`;
  } else if (tier === 'Potential Match') {
    recommendationText = `Potential match (${profileMatchScore}%). Focus on building hands-on projects for ${missingSkills.join(', ') || 'required skills'} to strengthen your profile.`;
  } else {
    recommendationText = `Low match (${profileMatchScore}%). Significant skill overlap gaps. Focus on target career roadmaps before applying.`;
  }

  return {
    job,
    profileMatchScore,
    locationScore,
    experienceScore,
    preferenceScore,
    finalPriorityScore,
    tier,
    distanceKm,
    matchedRequiredSkills,
    matchedPreferredSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    matchingSkills,
    missingSkills,
    whyThisJob,
    whatToImprove,
    applicationRecommendation,
    recommendationText
  };
}

export class ResumeOpportunityEngine {
  public static runMatchAnalysis(
    candidateProfile: ExtractedCandidateProfile,
    jobsList: JobEntity[] = seedJobs
  ): TransparentMatchResult[] {
    return jobsList
      .map((job) => evaluateDeterministicMatch(candidateProfile, job))
      .sort((a, b) => {
        // Primary sort: PROFILE_MATCH
        if (b.profileMatchScore !== a.profileMatchScore) {
          return b.profileMatchScore - a.profileMatchScore;
        }
        // Secondary sort: Final Priority Score
        return b.finalPriorityScore - a.finalPriorityScore;
      });
  }
}
