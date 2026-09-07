import { CandidateProfile, JobOpening, MatchResult, MatchScoreBreakdown } from '../types';
import { mockJobs } from './mockData';

// Haversine formula to compute distance between candidate and job location
export function calculateDistanceKm(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 500; // Default estimate if coordinates absent
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function evaluateJobMatch(candidate: CandidateProfile, job: JobOpening): MatchResult {
  // 1. Profile / Resume Match (Weight: 60%)
  const candidateSkillNames = candidate.skills.map((s) => s.name.toLowerCase());
  const targetSkills = job.skillsRequired || job.skills || [];
  const requiredSkillsLower = targetSkills.map((s) => s.toLowerCase());

  let matchedSkillCount = 0;
  const keyStrengths: string[] = [];
  const skillGaps: string[] = [];

  targetSkills.forEach((skill: string) => {
    const isMatched = candidateSkillNames.some((cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs));
    if (isMatched) {
      matchedSkillCount++;
      keyStrengths.push(skill);
    } else {
      skillGaps.push(skill);
    }
  });

  const skillMatchRatio = targetSkills.length > 0 ? matchedSkillCount / targetSkills.length : 0.8;
  
  // Title / Role relevance check
  const isTitleMatch = candidate.targetRoles.some(role => 
    job.title.toLowerCase().includes(role.toLowerCase()) || role.toLowerCase().includes(job.title.toLowerCase())
  );
  
  const titleBonus = isTitleMatch ? 15 : 0;
  const profileMatchScore = Math.min(100, Math.round(skillMatchRatio * 85 + titleBonus));

  // 2. Location / Distance (Weight: 20%)
  const distanceKm = calculateDistanceKm(
    candidate.currentLocation.latitude,
    candidate.currentLocation.longitude,
    job.location.latitude,
    job.location.longitude
  );

  let locationMatchScore = 100;
  if (job.workType === 'Remote') {
    locationMatchScore = 100; // Remote jobs eliminate distance barriers
  } else if (candidate.currentLocation.city.toLowerCase() === job.location.city.toLowerCase()) {
    locationMatchScore = 95;
  } else if (candidate.preferredLocations.some((p) => p.toLowerCase() === job.location.city.toLowerCase())) {
    locationMatchScore = 85;
  } else {
    // Distance decay penalty (capped minimum 30)
    locationMatchScore = Math.max(30, Math.round(100 - distanceKm / 25));
  }

  // 3. Experience Match (Weight: 10%)
  let experienceMatchScore = 100;
  const minExp = job.minExperience ?? 0;
  const maxExp = job.maxExperience ?? 10;
  if (candidate.yearsOfExperience < minExp) {
    const gap = minExp - candidate.yearsOfExperience;
    experienceMatchScore = Math.max(40, 100 - gap * 20);
  } else if (candidate.yearsOfExperience > maxExp + 3) {
    experienceMatchScore = 85; // Slight overqualification penalty
  }

  // 4. User Preferences (Weight: 10%)
  let preferenceMatchScore = 70;
  if (candidate.preferredWorkType === job.workType || candidate.preferredWorkType === 'Flexible') {
    preferenceMatchScore = 100;
  } else if (job.workType === 'Remote') {
    preferenceMatchScore = 90;
  }

  // Weighted overall calculation: Primary (60%) + Secondary (20%) + Exp (10%) + Pref (10%)
  const overallMatchScore = Math.round(
    profileMatchScore * 0.60 +
    locationMatchScore * 0.20 +
    experienceMatchScore * 0.10 +
    preferenceMatchScore * 0.10
  );

  const breakdown: MatchScoreBreakdown = {
    profileMatch: profileMatchScore,
    locationMatch: locationMatchScore,
    experienceMatch: experienceMatchScore,
    preferenceMatch: preferenceMatchScore,
  };

  let explanation = '';
  if (profileMatchScore >= 80) {
    explanation = `Outstanding profile alignment (${profileMatchScore}% skill match). Core technical requirements strongly match your background.`;
  } else if (profileMatchScore >= 60) {
    explanation = `Moderate profile fit (${profileMatchScore}% skill match). You match ${keyStrengths.join(', ')}, but would benefit from closing gaps in ${skillGaps.join(', ')}.`;
  } else {
    explanation = `Lower profile match (${profileMatchScore}%). Strong focus required on missing core requirements: ${skillGaps.join(', ')}.`;
  }

  if (distanceKm > 200 && job.workType !== 'Remote' && overallMatchScore >= 70) {
    explanation += ` Rank prioritizes your strong profile match despite the ${distanceKm} km distance.`;
  }

  return {
    job,
    overallMatchScore,
    breakdown,
    distanceKm,
    keyStrengths,
    skillGaps,
    explanation,
  };
}

export class JobService {
  public static getMatchedJobs(candidate: CandidateProfile): MatchResult[] {
    return mockJobs
      .map((job) => evaluateJobMatch(candidate, job))
      .sort((a, b) => b.overallMatchScore - a.overallMatchScore); // Primary sort by match score
  }

  public static filterJobs(
    candidate: CandidateProfile,
    filters: { search?: string; workType?: string; minSalary?: number; maxDistance?: number }
  ): MatchResult[] {
    let matches = this.getMatchedJobs(candidate);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      matches = matches.filter(
        (m) =>
          m.job.title.toLowerCase().includes(q) ||
          m.job.company.toLowerCase().includes(q) ||
          (m.job.skillsRequired || m.job.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.workType && filters.workType !== 'All') {
      matches = matches.filter((m) => m.job.workType === filters.workType);
    }

    if (filters.minSalary) {
      matches = matches.filter((m) => m.job.salaryRange.max >= filters.minSalary!);
    }

    if (filters.maxDistance) {
      matches = matches.filter((m) => m.job.workType === 'Remote' || m.distanceKm <= filters.maxDistance!);
    }

    return matches;
  }
}
