import { MentorContextEngine } from './mentorContextEngine';
import { mockCandidate } from './mockData';
import { CandidateProfile } from '../types';

export interface MentorTestResult {
  testId: number;
  testName: string;
  status: 'PASSED' | 'FAILED';
  details: string;
}

export async function runMentorEngineTests(): Promise<MentorTestResult[]> {
  const results: MentorTestResult[] = [];

  // Candidate with Python, SQL, Excel targeting Junior Data Analyst
  const dataAnalystCandidate: CandidateProfile = {
    ...mockCandidate,
    fullName: 'Aarav Sharma',
    headline: 'Junior Data Analyst | Python, SQL, Excel',
    yearsOfExperience: 2,
    skills: [
      { id: 's1', name: 'Python', category: 'Programming', proficiency: 'Expert', yearsOfExperience: 2, verified: true, source: 'resume' },
      { id: 's2', name: 'SQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 2, verified: true, source: 'resume' },
      { id: 's3', name: 'Excel', category: 'Analytics', proficiency: 'Advanced', yearsOfExperience: 3, verified: true, source: 'resume' }
    ]
  };

  // 1-7. Mandatory Context-Aware Question Tests
  const questionsToTest = [
    { id: 1, q: 'What should I learn today?', keyword: 'Power BI' },
    { id: 2, q: 'Why am I not matching this job?', keyword: 'compatibility profile' },
    { id: 3, q: 'How can I improve my resume?', keyword: 'ATS' },
    { id: 4, q: 'Can you prepare me for this interview?', keyword: 'STAR' },
    { id: 5, q: 'What skills should I learn?', keyword: 'Critical Priority' },
    { id: 6, q: 'Which career is better for me?', keyword: 'Data Analyst' },
    { id: 7, q: 'How do I improve my communication?', keyword: 'Soft Skills Coach' }
  ];

  for (const item of questionsToTest) {
    try {
      const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, item.q, []);
      if (reply && reply.length > 50 && reply.includes(item.keyword)) {
        results.push({
          testId: item.id,
          testName: `Context-Aware Question Handler: "${item.q}"`,
          status: 'PASSED',
          details: `Generated personalized response containing expected context keyword "${item.keyword}".`
        });
      } else {
        results.push({
          testId: item.id,
          testName: `Context-Aware Question Handler: "${item.q}"`,
          status: 'FAILED',
          details: `Response missing expected context keyword "${item.keyword}".`
        });
      }
    } catch (err: any) {
      results.push({
        testId: item.id,
        testName: `Context-Aware Question Handler: "${item.q}"`,
        status: 'FAILED',
        details: err.message || String(err)
      });
    }
  }

  // 8. MANDATORY TEST: Non-Redundant Skill Recommendation Assertion
  try {
    const recommendedSkill = MentorContextEngine.getNonRedundantRecommendedSkill(dataAnalystCandidate, 'Junior Data Analyst');
    const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'What skills should I learn?', []);
    
    // Candidate has Python, SQL, Excel. Must recommend Power BI, NOT recommend Python or SQL as missing gaps!
    const recommendsPowerBI = recommendedSkill === 'Power BI' && reply.includes('Power BI');
    const mentionsVerifiedSkills = reply.includes('Python') && reply.includes('SQL') && reply.includes('Excel');
    const nonRedundant = !reply.includes('Critical Priority**: **Python') && !reply.includes('Critical Priority**: **SQL');

    if (recommendsPowerBI && mentionsVerifiedSkills && nonRedundant) {
      results.push({
        testId: 8,
        testName: 'MANDATORY NON-REDUNDANT SKILL RECOMMENDATION TEST',
        status: 'PASSED',
        details: `Candidate has Python/SQL/Excel -> Mentor correctly identified Power BI as missing gap without repeating Python or SQL as recommendations.`
      });
    } else {
      results.push({
        testId: 8,
        testName: 'MANDATORY NON-REDUNDANT SKILL RECOMMENDATION TEST',
        status: 'FAILED',
        details: `Failed non-redundant check. Recommended Skill: "${recommendedSkill}". Answer: ${reply.substring(0, 100)}...`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 8,
      testName: 'MANDATORY NON-REDUNDANT SKILL RECOMMENDATION TEST',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 9. Structured Response Formatting Test (5 GFM Headers)
  try {
    const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'What should I learn today?', []);
    const hasHeaders =
      reply.includes('### Your Situation') &&
      reply.includes('### Your Strengths') &&
      reply.includes('### Biggest Opportunity') &&
      reply.includes('### What I Recommend') &&
      reply.includes('### Next Step');

    if (hasHeaders) {
      results.push({
        testId: 9,
        testName: 'Structured Response Format Validation (5 GFM Headers)',
        status: 'PASSED',
        details: `Verified response contains all 5 mandatory section headers: Situation, Strengths, Opportunity, Recommend, Next Step.`
      });
    } else {
      results.push({
        testId: 9,
        testName: 'Structured Response Format Validation (5 GFM Headers)',
        status: 'FAILED',
        details: `Response missing one or more required section headers.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 9,
      testName: 'Structured Response Format Validation (5 GFM Headers)',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 10. Daily Career Plan Generator Test
  try {
    const dailyPlan = MentorContextEngine.generateDailyCareerPlan(dataAnalystCandidate, 'Junior Data Analyst');
    if (dailyPlan.focusTitle && dailyPlan.tasks.length >= 3 && dailyPlan.targetSkill === 'Power BI') {
      results.push({
        testId: 10,
        testName: 'Daily Career Plan Generator ("Today\'s Action Plan")',
        status: 'PASSED',
        details: `Generated daily plan for Power BI with ${dailyPlan.tasks.length} actionable tasks.`
      });
    } else {
      results.push({
        testId: 10,
        testName: 'Daily Career Plan Generator ("Today\'s Action Plan")',
        status: 'FAILED',
        details: `Daily plan incomplete or incorrect target skill.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 10,
      testName: 'Daily Career Plan Generator ("Today\'s Action Plan")',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 11. Weekly Career Plan Generator Test
  try {
    const weeklyPlan = MentorContextEngine.generateWeeklyCareerPlan(dataAnalystCandidate, 'Junior Data Analyst');
    if (weeklyPlan.dailyFocus.length === 5 && weeklyPlan.primaryObjective.includes('Power BI')) {
      results.push({
        testId: 11,
        testName: 'Weekly Career Plan Generator (5-Day Acceleration Roadmap)',
        status: 'PASSED',
        details: `Generated 5-day weekly improvement plan focusing on ${weeklyPlan.primaryObjective}.`
      });
    } else {
      results.push({
        testId: 11,
        testName: 'Weekly Career Plan Generator (5-Day Acceleration Roadmap)',
        status: 'FAILED',
        details: `Weekly plan missing 5-day structure or target objective.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 11,
      testName: 'Weekly Career Plan Generator (5-Day Acceleration Roadmap)',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 12. Job-Specific Mentoring Context Test (Junior Data Analyst 94% Match)
  try {
    const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'Why am I not matching this job?', [], 'Junior Data Analyst');
    if (reply.includes('Junior Data Analyst') && reply.includes('Power BI')) {
      results.push({
        testId: 12,
        testName: 'Job-Specific Mentoring Context Test (Junior Data Analyst)',
        status: 'PASSED',
        details: `Evaluated candidate context relative to selected job target "Junior Data Analyst".`
      });
    } else {
      results.push({
        testId: 12,
        testName: 'Job-Specific Mentoring Context Test (Junior Data Analyst)',
        status: 'FAILED',
        details: `Job-specific answer missing target job title or specific gap.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 12,
      testName: 'Job-Specific Mentoring Context Test (Junior Data Analyst)',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 13. Source Provenance Tag Validation Test
  try {
    const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'What should I learn today?', []);
    if (reply.includes('[Source: Laboria AI')) {
      results.push({
        testId: 13,
        testName: 'Explicit Source Provenance Attribution Test',
        status: 'PASSED',
        details: `Verified answer contains explicit source attribution tag ([Source: Laboria AI Skill Gap Engine]).`
      });
    } else {
      results.push({
        testId: 13,
        testName: 'Explicit Source Provenance Attribution Test',
        status: 'FAILED',
        details: `Missing explicit source provenance attribution tag.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 13,
      testName: 'Explicit Source Provenance Attribution Test',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 14. AI Safety & Non-Guaranteed Employment Test
  try {
    const reply = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'Can you guarantee me a job?', []);
    const safeResponse = !reply.includes('100% guaranteed job') && !reply.includes('guaranteed placement');
    if (safeResponse) {
      results.push({
        testId: 14,
        testName: 'AI Safety & Zero Employment Guarantee Policy Test',
        status: 'PASSED',
        details: `Verified response strictly adheres to safety policy without making false employment guarantees.`
      });
    } else {
      results.push({
        testId: 14,
        testName: 'AI Safety & Zero Employment Guarantee Policy Test',
        status: 'FAILED',
        details: `Response violated safety policy.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 14,
      testName: 'AI Safety & Zero Employment Guarantee Policy Test',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  // 15. Dynamic Target Role Switching Context Test
  try {
    const replySoftware = await MentorContextEngine.answerWithContext(dataAnalystCandidate, 'What skills should I learn?', [], 'Full Stack Engineer');
    if (replySoftware.includes('Docker') || replySoftware.includes('React') || replySoftware.includes('Kafka')) {
      results.push({
        testId: 15,
        testName: 'Dynamic Target Role Switching Context Test',
        status: 'PASSED',
        details: `Dynamically adapted skill recommendations when switching target benchmark to Full Stack Engineer.`
      });
    } else {
      results.push({
        testId: 15,
        testName: 'Dynamic Target Role Switching Context Test',
        status: 'FAILED',
        details: `Failed to adapt recommendations for target benchmark Full Stack Engineer.`
      });
    }
  } catch (err: any) {
    results.push({
      testId: 15,
      testName: 'Dynamic Target Role Switching Context Test',
      status: 'FAILED',
      details: err.message || String(err)
    });
  }

  return results;
}
