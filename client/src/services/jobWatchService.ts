import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import { calculateDistanceKm } from './jobService';

export type MatchCategory = 'High Match' | 'Good Match' | 'Possible Match';
export type MatchStatus = 'active' | 'expired' | 'dismissed';

export interface JobWatchMatch {
  id: string;
  userId: string;
  jobId: string;
  canonicalJobId: string;
  title: string;
  company: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite';
  minExperience: number;
  maxExperience: number;
  salaryRange: { min: number; max: number };
  
  // Scoring Components (Profile/JD Primacy)
  profileMatchScore: number;    // Weight: 70% (PRIMARY FACTOR)
  locationScore: number;         // Weight: 15% (SECONDARY)
  experienceScore: number;       // Weight: 10%
  preferenceScore: number;       // Weight: 5%
  finalPriorityScore: number;    // Weighted sum score

  matchCategory: MatchCategory;
  firstDetectedAt: string;
  lastEvaluatedAt: string;
  postedDate: string;
  expiryDate: string | null;
  source: string;
  sourceUrl: string;
  
  whyThisJob: string;
  matchingSkills: string[];
  missingSkills: string[];

  alerted: boolean;
  viewed: boolean;
  saved: boolean;
  dismissed: boolean;
  applied: boolean;
  status: MatchStatus;
}

export interface JobWatchAlert {
  id: string;
  userId: string;
  jobId: string;
  matchId: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  type: 'new_high_match' | 'digest' | 'status_update';
  priority: 'high' | 'medium' | 'low';
}

export interface JobWatchPreferences {
  targetCareers: string[];
  preferredCities: string[];
  workModes: string[]; // 'Remote' | 'Hybrid' | 'Onsite'
  searchRadiusKm: number;
  willingToRelocate: boolean;
  minMatchScore: number; // e.g. 70
}

export interface JobWatchSummary {
  totalActiveMatches: number;
  newMatchesCount: number;
  highMatchesCount: number;
  savedMatchesCount: number;
  unreadAlertsCount: number;
  lastScanTimestamp: string;
}

// In-Memory Persistent Data Repositories
const persistentMatches: Map<string, JobWatchMatch> = new Map();
const persistentAlerts: JobWatchAlert[] = [];
let userPreferences: JobWatchPreferences = {
  targetCareers: ['Junior Data Analyst', 'Data Analyst', 'Full Stack Engineer'],
  preferredCities: ['Bengaluru', 'Remote', 'Gurugram', 'Hyderabad'],
  workModes: ['Remote', 'Hybrid', 'Onsite'],
  searchRadiusKm: 50,
  willingToRelocate: true,
  minMatchScore: 70
};

let lastScanTimestamp = new Date().toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export class JobWatchService {
  /**
   * Primary Evaluation Engine: Scans dataset, applies profile-first matching formula,
   * performs canonical de-duplication, and flags new high-match alerts.
   * CRITICAL REQUIREMENT: Profile/JD match strictly dominates location.
   */
  public static evaluateAndDetectNewMatches(
    candidate: CandidateProfile,
    prefs: JobWatchPreferences = userPreferences
  ): JobWatchSummary {
    const candidateSkillsLower = new Set(candidate.skills.map((s) => s.name.toLowerCase()));
    const candidateCity = candidate.currentLocation?.city?.toLowerCase() || 'bengaluru';

    seedJobs.forEach((job) => {
      // 1. Canonical De-duplication Check
      const canonicalKey = `${job.title.toLowerCase()}_${job.company.toLowerCase()}_${job.location.toLowerCase()}`;
      const existingMatch = Array.from(persistentMatches.values()).find(
        (m) => m.canonicalJobId === canonicalKey || m.jobId === job.id
      );

      // Check Expiry
      const isExpired = job.status === 'expired';
      if (isExpired && existingMatch) {
        existingMatch.status = 'expired';
        return;
      }
      if (isExpired) return;

      // 2. Profile / JD Match Score (PRIMARY FACTOR - Weight 70%)
      const reqSkills = job.skills || ['Python', 'SQL', 'Excel'];
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      reqSkills.forEach((sk: string) => {
        if (candidateSkillsLower.has(sk.toLowerCase())) {
          matchedSkills.push(sk);
        } else {
          missingSkills.push(sk);
        }
      });

      const skillMatchRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 0.8;
      
      // Title match bonus
      const isTitleMatch = candidate.targetRoles?.some((r) =>
        job.title.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(job.title.toLowerCase())
      );
      const titleBonus = isTitleMatch ? 15 : 0;
      const profileMatchScore = Math.min(100, Math.round(skillMatchRatio * 85 + titleBonus));

      // 3. Location Compatibility (SECONDARY - Weight 15%)
      const distanceKm = calculateDistanceKm(
        candidate.currentLocation?.latitude,
        candidate.currentLocation?.longitude,
        job.locationCoordinates?.latitude,
        job.locationCoordinates?.longitude
      );

      let locationScore = 100;
      if (job.workType === 'Remote') {
        locationScore = 100;
      } else if (job.location.toLowerCase().includes(candidateCity)) {
        locationScore = 95;
      } else if (prefs.preferredCities.some((c) => job.location.toLowerCase().includes(c.toLowerCase()))) {
        locationScore = 85;
      } else {
        locationScore = Math.max(30, Math.round(100 - distanceKm / 25));
      }

      // 4. Experience Compatibility (Weight 10%)
      let experienceScore = 100;
      const minExp = job.minExperience ?? 0;
      const maxExp = job.maxExperience ?? 10;
      if (candidate.yearsOfExperience < minExp) {
        const gap = minExp - candidate.yearsOfExperience;
        experienceScore = Math.max(40, 100 - gap * 20);
      } else if (candidate.yearsOfExperience > maxExp + 3) {
        experienceScore = 85;
      }

      // 5. User Preferences Compatibility (Weight 5%)
      let preferenceScore = 70;
      if (prefs.workModes.includes(job.workType || 'Onsite')) {
        preferenceScore = 100;
      }


      // Weighted Priority Formula: Profile (70%) + Location (15%) + Exp (10%) + Pref (5%)
      const finalPriorityScore = Math.round(
        profileMatchScore * 0.70 +
        locationScore * 0.15 +
        experienceScore * 0.10 +
        preferenceScore * 0.05
      );

      // Determine Match Category
      let matchCategory: MatchCategory = 'Possible Match';
      if (finalPriorityScore >= 85) matchCategory = 'High Match';
      else if (finalPriorityScore >= 70) matchCategory = 'Good Match';

      // Generate "Why This Job?" Explanation
      let whyThisJob = '';
      if (matchedSkills.length > 0) {
        whyThisJob = `Your verified proficiency in ${matchedSkills.slice(0, 3).join(', ')} strongly matches core JD requirements for ${job.title}.`;
      } else {
        whyThisJob = `Target role alignment in ${job.title} matches your career objective.`;
      }

      if (missingSkills.length > 0) {
        whyThisJob += ` Opportunity gap: ${missingSkills[0]} is required.`;
      }

      const matchObj: JobWatchMatch = {
        id: existingMatch?.id || `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: candidate.id || 'usr_demo_101',
        jobId: job.id,
        canonicalJobId: canonicalKey,
        title: job.title,
        company: job.company,
        location: job.location,
        workType: (job.workType as any) || 'Onsite',
        minExperience: job.minExperience || 1,
        maxExperience: job.maxExperience || 4,
        salaryRange: job.salaryRange || { min: 6, max: 12 },
        profileMatchScore,
        locationScore,
        experienceScore,
        preferenceScore,
        finalPriorityScore,
        matchCategory,
        firstDetectedAt: existingMatch?.firstDetectedAt || new Date().toISOString(),
        lastEvaluatedAt: new Date().toISOString(),
        postedDate: job.postedDate || '2 days ago',
        expiryDate: job.expiryDate || null,
        source: job.source || 'Laboria Discovery Network',
        sourceUrl: job.sourceUrl || `https://laboria.ai/jobs/${job.id}`,
        whyThisJob,
        matchingSkills: matchedSkills,
        missingSkills,
        alerted: existingMatch?.alerted || false,
        viewed: existingMatch?.viewed || false,
        saved: existingMatch?.saved || false,
        dismissed: existingMatch?.dismissed || false,
        applied: existingMatch?.applied || false,
        status: existingMatch?.status || 'active'
      };

      // Detect New High-Match Alert
      if (!existingMatch && matchCategory === 'High Match' && !matchObj.alerted) {
        matchObj.alerted = true;
        persistentAlerts.unshift({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          userId: candidate.id || 'usr_demo_101',
          jobId: job.id,
          matchId: matchObj.id,
          title: `New High-Match Job Found (${finalPriorityScore}% Match)`,
          message: `${job.title} @ ${job.company} strongly matches your profile (${matchedSkills.join(', ')}).`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readAt: null,
          type: 'new_high_match',
          priority: 'high'
        });
      }

      persistentMatches.set(matchObj.id, matchObj);
    });

    lastScanTimestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const activeList = Array.from(persistentMatches.values()).filter((m) => m.status === 'active' && !m.dismissed);

    return {
      totalActiveMatches: activeList.length,
      newMatchesCount: activeList.filter((m) => !m.viewed).length,
      highMatchesCount: activeList.filter((m) => m.matchCategory === 'High Match').length,
      savedMatchesCount: activeList.filter((m) => m.saved).length,
      unreadAlertsCount: persistentAlerts.filter((a) => !a.readAt).length,
      lastScanTimestamp
    };
  }

  /**
   * Retrieves matches grouped by section, strictly ordered by Profile/JD Match Primacy
   */
  public static getMatchesBySection(
    candidate: CandidateProfile,
    section: 'new' | 'strong' | 'recent' | 'saved' | 'dismissed'
  ): JobWatchMatch[] {
    // Ensure scanner has run
    if (persistentMatches.size === 0) {
      this.evaluateAndDetectNewMatches(candidate);
    }

    const allMatches = Array.from(persistentMatches.values());

    // Filter by Section
    let filtered: JobWatchMatch[] = [];

    switch (section) {
      case 'new':
        filtered = allMatches.filter((m) => m.status === 'active' && !m.dismissed && !m.viewed);
        break;
      case 'strong':
        filtered = allMatches.filter((m) => m.status === 'active' && !m.dismissed && m.matchCategory === 'High Match');
        break;
      case 'recent':
        filtered = allMatches.filter((m) => m.status === 'active' && !m.dismissed);
        break;
      case 'saved':
        filtered = allMatches.filter((m) => m.saved && !m.dismissed);
        break;
      case 'dismissed':
        filtered = allMatches.filter((m) => m.dismissed);
        break;
      default:
        filtered = allMatches.filter((m) => m.status === 'active' && !m.dismissed);
    }

    // Sort strictly by finalPriorityScore (Profile/JD Primacy)
    return filtered.sort((a, b) => b.finalPriorityScore - a.finalPriorityScore);
  }

  public static saveMatch(matchId: string): boolean {
    const match = persistentMatches.get(matchId);
    if (match) {
      match.saved = !match.saved;
      return match.saved;
    }
    return false;
  }

  public static dismissMatch(matchId: string): boolean {
    const match = persistentMatches.get(matchId);
    if (match) {
      match.dismissed = true;
      return true;
    }
    return false;
  }

  public static markApplied(matchId: string): boolean {
    const match = persistentMatches.get(matchId);
    if (match) {
      match.applied = true;
      return true;
    }
    return false;
  }

  public static markMatchViewed(matchId: string): void {
    const match = persistentMatches.get(matchId);
    if (match) {
      match.viewed = true;
    }
  }

  public static getInAppAlerts(): JobWatchAlert[] {
    return [...persistentAlerts];
  }

  public static markAlertRead(alertId: string): void {
    const alert = persistentAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.readAt = new Date().toISOString();
    }
  }

  public static getUserPreferences(): JobWatchPreferences {
    return { ...userPreferences };
  }

  public static updateUserPreferences(newPrefs: Partial<JobWatchPreferences>): JobWatchPreferences {
    userPreferences = { ...userPreferences, ...newPrefs };
    return userPreferences;
  }
}
