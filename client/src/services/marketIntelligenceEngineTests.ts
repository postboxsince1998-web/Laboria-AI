import { MarketIntelligenceService } from './marketIntelligenceService';

export interface TestResultItem {
  name: string;
  passed: boolean;
  message: string;
}

export function runMarketIntelligenceEngineTests(): { passed: boolean; results: TestResultItem[] } {
  const results: TestResultItem[] = [];

  // Test 1: All 8 labor market dimensions present
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const has8Dimensions =
      Array.isArray(bundle.growingCareers) &&
      Array.isArray(bundle.decliningCareers) &&
      Array.isArray(bundle.emergingSkills) &&
      Array.isArray(bundle.skillDemand) &&
      Array.isArray(bundle.locationTrends) &&
      Array.isArray(bundle.remoteOpportunities) &&
      Array.isArray(bundle.experienceTrends) &&
      Array.isArray(bundle.careerTransitions);

    results.push({
      name: '1. All 8 Labor Market Dimensions Present',
      passed: has8Dimensions,
      message: has8Dimensions
        ? `Successfully retrieved all 8 dimensions: ${bundle.growingCareers.length} growing, ${bundle.decliningCareers.length} declining, ${bundle.emergingSkills.length} emerging skills, ${bundle.skillDemand.length} skill demand, ${bundle.locationTrends.length} locations, ${bundle.remoteOpportunities.length} remote, ${bundle.experienceTrends.length} experience, ${bundle.careerTransitions.length} transitions.`
        : 'Failed: Missing one or more of the 8 market dimensions.'
    });
  } catch (err: any) {
    results.push({ name: '1. All 8 Labor Market Dimensions Present', passed: false, message: err.message });
  }

  // Test 2: Growing Careers Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.growingCareers.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '2. Growing Careers Data Attribution Validation',
      passed: valid && bundle.growingCareers.length > 0,
      message: valid ? 'All growing career entries contain valid data attribution metadata.' : 'Failed attribution check on growing careers.'
    });
  } catch (err: any) {
    results.push({ name: '2. Growing Careers Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 3: Declining Careers Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.decliningCareers.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '3. Declining Careers Data Attribution Validation',
      passed: valid && bundle.decliningCareers.length > 0,
      message: valid ? 'All declining career entries contain valid data attribution metadata.' : 'Failed attribution check on declining careers.'
    });
  } catch (err: any) {
    results.push({ name: '3. Declining Careers Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 4: Emerging Skills Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.emergingSkills.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '4. Emerging Skills Data Attribution Validation',
      passed: valid && bundle.emergingSkills.length > 0,
      message: valid ? 'All emerging skill entries contain valid data attribution metadata.' : 'Failed attribution check on emerging skills.'
    });
  } catch (err: any) {
    results.push({ name: '4. Emerging Skills Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 5: Skill Demand Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.skillDemand.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '5. Skill Demand Data Attribution Validation',
      passed: valid && bundle.skillDemand.length > 0,
      message: valid ? 'All skill demand entries contain valid data attribution metadata.' : 'Failed attribution check on skill demand.'
    });
  } catch (err: any) {
    results.push({ name: '5. Skill Demand Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 6: Location Trends Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.locationTrends.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '6. Location Trends Data Attribution Validation',
      passed: valid && bundle.locationTrends.length > 0,
      message: valid ? 'All location trend entries contain valid data attribution metadata.' : 'Failed attribution check on location trends.'
    });
  } catch (err: any) {
    results.push({ name: '6. Location Trends Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 7: Remote Opportunities Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.remoteOpportunities.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '7. Remote Opportunities Data Attribution Validation',
      passed: valid && bundle.remoteOpportunities.length > 0,
      message: valid ? 'All remote opportunity entries contain valid data attribution metadata.' : 'Failed attribution check on remote opportunities.'
    });
  } catch (err: any) {
    results.push({ name: '7. Remote Opportunities Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 8: Experience Trends Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.experienceTrends.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '8. Experience Trends Data Attribution Validation',
      passed: valid && bundle.experienceTrends.length > 0,
      message: valid ? 'All experience trend entries contain valid data attribution metadata.' : 'Failed attribution check on experience trends.'
    });
  } catch (err: any) {
    results.push({ name: '8. Experience Trends Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 9: Career Transitions Data Attribution Validation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const valid = bundle.careerTransitions.every(
      item =>
        item.attribution &&
        item.attribution.source &&
        item.attribution.sourceUrl &&
        item.attribution.observedDate &&
        item.attribution.updatedDate &&
        item.attribution.confidence
    );
    results.push({
      name: '9. Career Transitions Data Attribution Validation',
      passed: valid && bundle.careerTransitions.length > 0,
      message: valid ? 'All career transition entries contain valid data attribution metadata.' : 'Failed attribution check on career transitions.'
    });
  } catch (err: any) {
    results.push({ name: '9. Career Transitions Data Attribution Validation', passed: false, message: err.message });
  }

  // Test 10: Insufficient Data Handling for Sparse Queries
  try {
    const sparseBundle = MarketIntelligenceService.getMarketIntelligenceBundle({
      keyword: 'Quantum Cryptography Underwater Architecture'
    });
    const isSparseCorrect =
      sparseBundle.isSparseDataResult === true &&
      typeof sparseBundle.sparseDataReason === 'string' &&
      sparseBundle.sparseDataReason.includes('Insufficient data') &&
      sparseBundle.growingCareers.length === 0;

    results.push({
      name: '10. Insufficient Data Policy Enforcement',
      passed: isSparseCorrect,
      message: isSparseCorrect
        ? `Sparse query correctly returned isSparseDataResult=true and sparseDataReason: "${sparseBundle.sparseDataReason}". Zero fabricated statistics.`
        : 'Failed: Did not correctly trigger Insufficient Data policy for sparse query.'
    });
  } catch (err: any) {
    results.push({ name: '10. Insufficient Data Policy Enforcement', passed: false, message: err.message });
  }

  // Test 11: Keyword Filtering Accuracy
  try {
    const filteredBundle = MarketIntelligenceService.getMarketIntelligenceBundle({
      keyword: 'Cybersecurity'
    });
    const hasCyber = filteredBundle.growingCareers.some(c => c.category === 'Cybersecurity' || c.title.includes('Security'));

    results.push({
      name: '11. Keyword Filtering Accuracy',
      passed: hasCyber,
      message: hasCyber
        ? `Keyword "Cybersecurity" correctly filtered dataset, returning ${filteredBundle.growingCareers.length} matching career items.`
        : 'Failed: Keyword filtering did not match expected career items.'
    });
  } catch (err: any) {
    results.push({ name: '11. Keyword Filtering Accuracy', passed: false, message: err.message });
  }

  // Test 12: 4-Module Connection Payloads Generation
  try {
    const bundle = MarketIntelligenceService.getMarketIntelligenceBundle();
    const connections = bundle.moduleConnections;
    const has4Modules =
      Boolean(connections.futureSkillsRadarPayload) &&
      Boolean(connections.careerNavigatorPayload) &&
      Boolean(connections.jobMatchingPayload) &&
      Boolean(connections.aiMentorPayload);

    results.push({
      name: '12. 4-Module Connection Payloads Generation',
      passed: has4Modules,
      message: has4Modules
        ? 'Successfully generated connection payloads for Future Skills Radar, Career Navigator, Job Matching, and AI Mentor.'
        : 'Failed: Missing one or more module connection payloads.'
    });
  } catch (err: any) {
    results.push({ name: '12. 4-Module Connection Payloads Generation', passed: false, message: err.message });
  }

  const passed = results.every(r => r.passed);
  return { passed, results };
}
