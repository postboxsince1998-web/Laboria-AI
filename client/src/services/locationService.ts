export type LocationCategory =
  | 'Remote'
  | 'Very Near'
  | 'Near'
  | 'Moderate Distance'
  | 'Far'
  | 'Distance Unavailable';

export interface CandidateLocationPreferences {
  currentLocation: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  preferredLocations: string[];
  preferredRadiusKm: number;
  willingToRelocate: boolean;
  remotePreference: boolean;
  hybridPreference: boolean;
  officePreference: boolean;
}

export interface GeoCalculationResult {
  distanceKm: number | null;
  category: LocationCategory;
  isWithinPreferredRadius: boolean;
  isPreferredCity: boolean;
  isRelocationOpportunity: boolean;
  locationScore: number; // 0 - 100 Score for Location (15% Weight in Composite Priority)
  explanation: string;
}

/**
 * City Alias Normalization Map for Indian Tech Hubs
 */
export const CITY_ALIASES_MAP: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  bombay: 'Mumbai',
  mumbai: 'Mumbai',
  madras: 'Chennai',
  chennai: 'Chennai',
  calcutta: 'Kolkata',
  kolkata: 'Kolkata',
  gurgaon: 'Gurugram',
  gurugram: 'Gurugram',
  poona: 'Pune',
  pune: 'Pune',
  trivandrum: 'Thiruvananthapuram',
  thiruvananthapuram: 'Thiruvananthapuram'
};

/**
 * Normalizes city names to canonical Indian tech hub names
 */
export function normalizeCityName(rawCityName?: string): string {
  if (!rawCityName) return 'Bengaluru';
  const clean = rawCityName.trim().toLowerCase();
  return CITY_ALIASES_MAP[clean] || (rawCityName.charAt(0).toUpperCase() + rawCityName.slice(1).toLowerCase());
}

/**
 * Exact Haversine Spherical Distance Formula in Kilometers
 * Returns null if lat/lon coordinates are unavailable
 */
export function calculateHaversineDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null; // Never invent distance if coordinates are missing!
  }

  const R = 6371; // Earth radius in km
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

/**
 * Configurable Location Categorization
 */
export function categorizeLocation(
  distanceKm: number | null,
  workType: string,
  customRanges = { veryNear: 5, near: 15, moderate: 40 }
): LocationCategory {
  if (workType === 'Remote' || workType.toLowerCase().includes('remote')) {
    return 'Remote';
  }

  if (distanceKm === null) {
    return 'Distance Unavailable';
  }

  if (distanceKm <= customRanges.veryNear) {
    return 'Very Near';
  } else if (distanceKm <= customRanges.near) {
    return 'Near';
  } else if (distanceKm <= customRanges.moderate) {
    return 'Moderate Distance';
  } else {
    return 'Far';
  }
}

/**
 * LocationScoringService calculates location compatibility separately from profile match
 */
export class LocationScoringService {
  public static calculateLocationScore(
    candidatePrefs: CandidateLocationPreferences,
    distanceKm: number | null,
    jobWorkType: string,
    jobCity: string
  ): number {
    if (jobWorkType === 'Remote' || jobWorkType.toLowerCase().includes('remote')) {
      return 100;
    }

    const normCandidateCity = normalizeCityName(candidatePrefs.currentLocation.city);
    const normJobCity = normalizeCityName(jobCity);

    // Exact city match
    if (normCandidateCity.toLowerCase() === normJobCity.toLowerCase()) {
      return 95;
    }

    // Preferred cities match
    const isPreferredCity = candidatePrefs.preferredLocations.some(
      (p) => normalizeCityName(p).toLowerCase() === normJobCity.toLowerCase()
    );
    if (isPreferredCity) {
      return 90;
    }

    if (distanceKm === null) {
      return 50; // Neutral score when distance unavailable
    }

    if (distanceKm <= candidatePrefs.preferredRadiusKm) {
      return Math.max(70, Math.round(100 - (distanceKm / candidatePrefs.preferredRadiusKm) * 20));
    }

    if (candidatePrefs.willingToRelocate) {
      return Math.max(40, Math.round(80 - distanceKm / 20));
    }

    return Math.max(20, Math.round(60 - distanceKm / 15));
  }
}

export class LocationService {
  public static evaluateLocationFit(
    candidatePrefs: CandidateLocationPreferences,
    job: {
      location: string;
      latitude?: number;
      longitude?: number;
      workType: string;
    }
  ): GeoCalculationResult {
    const distanceKm = calculateHaversineDistance(
      candidatePrefs.currentLocation.latitude,
      candidatePrefs.currentLocation.longitude,
      job.latitude,
      job.longitude
    );

    const category = categorizeLocation(distanceKm, job.workType);

    const rawJobCity = job.location.split(',')[0].trim();
    const normJobCity = normalizeCityName(rawJobCity);
    const normCandidateCity = normalizeCityName(candidatePrefs.currentLocation.city);

    const isPreferredCity = candidatePrefs.preferredLocations.some(
      (p) => normalizeCityName(p).toLowerCase() === normJobCity.toLowerCase()
    );

    const isWithinPreferredRadius =
      job.workType === 'Remote' ||
      (distanceKm !== null && distanceKm <= candidatePrefs.preferredRadiusKm);

    const isRelocationOpportunity =
      job.workType !== 'Remote' &&
      normCandidateCity.toLowerCase() !== normJobCity.toLowerCase() &&
      !isWithinPreferredRadius &&
      candidatePrefs.willingToRelocate;

    const locationScore = LocationScoringService.calculateLocationScore(
      candidatePrefs,
      distanceKm,
      job.workType,
      normJobCity
    );

    let explanation = '';
    if (job.workType === 'Remote') {
      explanation = 'Remote position. Eliminates all geographic commute & relocation friction.';
    } else if (distanceKm === null) {
      explanation = 'Exact coordinates for this posting are missing. Distance calculation unavailable.';
    } else if (category === 'Very Near') {
      explanation = `Very near (${distanceKm} km). Ideal daily commute from ${normCandidateCity}.`;
    } else if (category === 'Near') {
      explanation = `Near (${distanceKm} km). Fits standard metro commute within ${candidatePrefs.preferredRadiusKm} km radius.`;
    } else if (category === 'Moderate Distance') {
      explanation = `Moderate distance (${distanceKm} km). May require hybrid remote flexibility or local travel.`;
    } else {
      explanation = `Far (${distanceKm} km). Located in ${job.location}. ${
        isRelocationOpportunity
          ? 'Strong career match — Relocation opportunity (candidate is willing to relocate).'
          : 'Relocation required (outside preferred radius).'
      }`;
    }

    return {
      distanceKm,
      category,
      isWithinPreferredRadius,
      isPreferredCity,
      isRelocationOpportunity,
      locationScore,
      explanation
    };
  }
}
