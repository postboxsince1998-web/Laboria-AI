import { ServerJob } from '../data/sampleJobs';

export interface ServerCandidatePayload {
  skills: string[];
  targetRoles: string[];
  yearsOfExperience: number;
  city: string;
  preferredWorkType: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  latitude?: number;
  longitude?: number;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function matchJobForCandidate(candidate: ServerCandidatePayload, job: ServerJob) {
  // 1. Profile / Skill match (60%)
  const candidateSkills = candidate.skills.map((s) => s.toLowerCase());
  let matchCount = 0;
  job.skillsRequired.forEach((reqSkill) => {
    if (candidateSkills.some((cs) => cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs))) {
      matchCount++;
    }
  });

  const skillRatio = job.skillsRequired.length > 0 ? matchCount / job.skillsRequired.length : 0.8;
  const isRoleMatch = candidate.targetRoles.some((tr) => job.title.toLowerCase().includes(tr.toLowerCase()));
  const profileScore = Math.min(100, Math.round(skillRatio * 85 + (isRoleMatch ? 15 : 0)));

  // 2. Location (20%)
  const distanceKm = calculateDistance(
    candidate.latitude || 12.9716,
    candidate.longitude || 77.5946,
    job.latitude,
    job.longitude
  );

  let locationScore = 100;
  if (job.workType === 'Remote') {
    locationScore = 100;
  } else if (candidate.city.toLowerCase() === job.city.toLowerCase()) {
    locationScore = 95;
  } else {
    locationScore = Math.max(30, Math.round(100 - distanceKm / 25));
  }

  // 3. Experience (10%)
  let expScore = 100;
  if (candidate.yearsOfExperience < job.minExperience) {
    expScore = Math.max(40, 100 - (job.minExperience - candidate.yearsOfExperience) * 20);
  }

  // 4. Preference (10%)
  const prefScore = candidate.preferredWorkType === job.workType || candidate.preferredWorkType === 'Flexible' ? 100 : 75;

  const overallScore = Math.round(
    profileScore * 0.60 + locationScore * 0.20 + expScore * 0.10 + prefScore * 0.10
  );

  return {
    job,
    overallScore,
    breakdown: {
      profileScore,
      locationScore,
      expScore,
      prefScore
    },
    distanceKm
  };
}
