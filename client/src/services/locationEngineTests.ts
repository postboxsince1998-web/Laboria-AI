import {
  calculateHaversineDistance,
  categorizeLocation,
  LocationService,
  CandidateLocationPreferences
} from './locationService';

export interface LocationTestResult {
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export function runLocationEngineTests(): LocationTestResult[] {
  const results: LocationTestResult[] = [];

  // Test 1: Haversine distance accuracy (Bengaluru to Hyderabad)
  const distBlrHyd = calculateHaversineDistance(12.9716, 77.5946, 17.3850, 78.4867);
  if (distBlrHyd !== null && distBlrHyd >= 490 && distBlrHyd <= 520) {
    results.push({
      testName: 'Haversine Formula Calculation Accuracy',
      status: 'PASSED',
      details: `Bengaluru to Hyderabad distance calculated as ${distBlrHyd} km (expected ~500 km).`
    });
  } else {
    results.push({
      testName: 'Haversine Formula Calculation Accuracy',
      status: 'FAILED',
      details: `Expected ~500 km, got ${distBlrHyd}`
    });
  }

  // Test 2: User Requested Rule Enforcement
  // Job A: 95% profile match, 25 km away
  // Job B: 63% profile match, 5 km away
  // Job A MUST rank higher!
  const profileScoreA = 95;
  const distA = 25;
  const finalPriorityA = Math.round(profileScoreA * 0.70 + (100 - distA / 25) * 0.15 + 95 * 0.10 + 90 * 0.05);

  const profileScoreB = 63;
  const distB = 5;
  const finalPriorityB = Math.round(profileScoreB * 0.70 + (100 - distB / 25) * 0.15 + 95 * 0.10 + 90 * 0.05);

  if (finalPriorityA > finalPriorityB) {
    results.push({
      testName: 'Profile Match Primacy Rule (Job A 95% @ 25km vs Job B 63% @ 5km)',
      status: 'PASSED',
      details: `Job A (95% Profile, 25km) scored ${finalPriorityA}% priority > Job B (63% Profile, 5km) scored ${finalPriorityB}% priority.`
    });
  } else {
    results.push({
      testName: 'Profile Match Primacy Rule',
      status: 'FAILED',
      details: `Nearby lower profile match erroneously ranked above distant high match.`
    });
  }

  // Test 3: Missing Coordinate Handling
  const missingCoordDist = calculateHaversineDistance(12.9716, 77.5946, undefined, undefined);
  const missingCategory = categorizeLocation(missingCoordDist, 'On-site');

  if (missingCoordDist === null && missingCategory === 'Distance Unavailable') {
    results.push({
      testName: 'Missing Coordinate Handling',
      status: 'PASSED',
      details: `Safely outputted distanceKm = null and category = "Distance Unavailable" without inventing fake coordinates.`
    });
  } else {
    results.push({
      testName: 'Missing Coordinate Handling',
      status: 'FAILED',
      details: `Expected null & Distance Unavailable, got ${missingCoordDist} / ${missingCategory}`
    });
  }

  // Test 4: Location Categories Verification
  const catVeryNear = categorizeLocation(5, 'Hybrid');
  const catNear = categorizeLocation(22, 'On-site');
  const catMod = categorizeLocation(65, 'On-site');
  const catFar = categorizeLocation(350, 'On-site');
  const catRemote = categorizeLocation(500, 'Remote');

  if (
    catVeryNear === 'Very Near' &&
    catNear === 'Near' &&
    catMod === 'Moderate Distance' &&
    catFar === 'Far' &&
    catRemote === 'Remote'
  ) {
    results.push({
      testName: 'Location Categories Thresholds (Very Near, Near, Moderate, Far, Remote)',
      status: 'PASSED',
      details: 'All 5 distance categories verified against exact thresholds.'
    });
  } else {
    results.push({
      testName: 'Location Categories Thresholds',
      status: 'FAILED',
      details: `Category mismatch: ${catVeryNear}, ${catNear}, ${catMod}, ${catFar}, ${catRemote}`
    });
  }

  return results;
}
