import { CandidateProfile, JobOpening, MatchExplanationPayload, SevenFactorMatchBreakdown } from '../types';

export class MatchExplanationEngine {
  /**
   * Generates a 7-factor match breakdown and factual human-friendly explanations.
   */
  public static generateExplanation(
    candidate: CandidateProfile,
    job: JobOpening,
    breakdown: SevenFactorMatchBreakdown
  ): MatchExplanationPayload {
    const candidateSkillsLower = (candidate.skills || []).map(s => s.name.toLowerCase());
    const requiredSkills = job.skillsRequired || job.skills || ['Software Engineering'];

    // Identify matched & missing skills
    const matchedSkills = requiredSkills.filter(req => candidateSkillsLower.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs)));
    const missingSkills = requiredSkills.filter(req => !matchedSkills.includes(req));

    // Construct Strengths Explanation
    let strengthsExplanation = '';
    if (matchedSkills.length > 0) {
      strengthsExplanation = `Strong match because your ${matchedSkills.slice(0, 3).join(', ')} experience aligns directly with the main requirements.`;
    } else {
      strengthsExplanation = `Demonstrates foundational technical background suitable for progressive skill acquisition in ${job.title}.`;
    }

    // Construct Potential Gaps Explanation
    let potentialGapsExplanation = '';
    if (missingSkills.length > 0) {
      potentialGapsExplanation = `Potential gap: ${missingSkills.slice(0, 2).join(' and ')} is requested but is not demonstrated in your profile.`;
    } else {
      potentialGapsExplanation = `No major skill gaps identified against primary job requirements.`;
    }

    // Construct Location Explanation
    const city = job.location?.city || 'Target Location';
    let locationExplanation = '';
    if (job.workType === 'Remote' || candidate.preferredWorkType === 'Remote') {
      locationExplanation = `Remote work mode supported. Profile relevance remains the primary ranking factor.`;
    } else {
      locationExplanation = `Located in or near ${city}. Profile relevance remains the primary ranking factor over distance.`;
    }

    // Factual Summary
    const factualSummary = `${breakdown.overallMatchScore}% Overall Fit Score: ${breakdown.skillsScore}% Skills Match, ${breakdown.experienceScore}% Experience Fit, and ${breakdown.locationScore}% Location Alignment.`;

    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      overallScore: breakdown.overallMatchScore,
      breakdown,
      strengthsExplanation,
      potentialGapsExplanation,
      locationExplanation,
      factualSummary
    };
  }
}
