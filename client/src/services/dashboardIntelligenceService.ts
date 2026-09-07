import { CandidateProfile, TodayActionItem, CareerHealthMetrics } from '../types';
import { JobReadinessService } from './jobReadinessService';
import { ApplicationTrackerService } from './applicationTrackerService';
import { JobService } from './jobService';
import { LearningHubService } from './learningHubService';

export class DashboardIntelligenceService {
  /**
   * Generates a MAXIMUM OF 3 high-value, prioritized actions for "What Should I Do Today?"
   */
  public static getTodayRecommendedActions(candidate: CandidateProfile): TodayActionItem[] {
    const actions: TodayActionItem[] = [];

    // Rule 1: High Priority — Upcoming Interview Reminder & Practice Launcher
    const apps = ApplicationTrackerService.getApplications(candidate.id);
    const upcomingInterview = apps.find(
      (app) => app.status === 'Interview Scheduled' || (app.interviewDate && new Date(app.interviewDate) >= new Date())
    );

    if (upcomingInterview) {
      actions.push({
        id: 'act_interview_prep',
        title: `Practice Interview for ${upcomingInterview.company}`,
        description: `Your ${upcomingInterview.title} interview is coming up. Practice company-tailored technical & behavioral questions in AI Interview Coach.`,
        actionLabel: 'Practice Interview Questions',
        actionPath: '/interview-prep',
        actionPayload: { company: upcomingInterview.company, title: upcomingInterview.title },
        priority: 'High',
        category: 'Interview Preparation'
      });
    }

    // Rule 2: High Priority — Strong Job Match Available to Apply
    const matches = JobService.getMatchedJobs(candidate);
    if (matches.length > 0) {
      const topMatch = matches[0];
      actions.push({
        id: 'act_apply_job',
        title: `Apply to ${topMatch.job.title} (${topMatch.overallMatchScore}% Match)`,
        description: `${topMatch.job.company} in ${topMatch.job.location.city} is looking for candidate skills matching your profile.`,
        actionLabel: 'View Match & Apply',
        actionPath: '/resume-match',
        actionPayload: { jobId: topMatch.job.id },
        priority: 'High',
        category: 'Job Opportunity'
      });
    }

    // Rule 3: High Priority — Complete Today's Learning Task
    const learningTasks = LearningHubService.getTodayLearningTasks(candidate);
    const pendingTask = learningTasks.find((t) => !t.isCompleted);
    if (pendingTask) {
      actions.push({
        id: 'act_learning_task',
        title: `Complete Today's Task: ${pendingTask.title}`,
        description: `Bite-sized ${pendingTask.duration} task on ${pendingTask.skillName}. Improve your market readiness score.`,
        actionLabel: "Go to Today's Learning",
        actionPath: '/learning',
        priority: 'Medium',
        category: 'Skill Learning'
      });
    }

    // Rule 4: Backup Action — Skill Gap Optimization
    if (actions.length < 3) {
      actions.push({
        id: 'act_skill_gap',
        title: 'Bridge Power BI & System Design Skill Gap',
        description: 'Adding project evidence for Power BI & System Design will unlock eligibility across 18+ active job postings.',
        actionLabel: 'Analyze Skill Gaps',
        actionPath: '/skill-gap',
        priority: 'Medium',
        category: 'Career Alignment'
      });
    }

    // STRICT CONSTRAINT: Maximum of 3 high-value actions to avoid cognitive overload
    return actions.slice(0, 3);
  }

  /**
   * Calculates empirical 5-dimensional Career Health Index strictly derived from user data.
   */
  public static calculateCareerHealth(candidate: CandidateProfile): CareerHealthMetrics {
    // 1. Job Readiness Score (from Step 6)
    const readinessResult = JobReadinessService.calculateDetailedReadiness(candidate);
    const jobReadinessScore = readinessResult.overallScore;

    // 2. Skill Development Score (from verified skills & learning)
    const verifiedSkillsCount = candidate.skills.filter((s) => s.verified || s.source === 'verified').length;
    const totalSkillsCount = Math.max(1, candidate.skills.length);
    const skillDevelopmentScore = Math.min(100, Math.round((verifiedSkillsCount / totalSkillsCount) * 50 + 45));

    // 3. Job Search Activity Score (from Application Tracker)
    const apps = ApplicationTrackerService.getApplications(candidate.id);
    const nonDraftAppsCount = apps.filter((a) => a.status !== 'Interested' && a.status !== 'Saved').length;
    const jobSearchActivityScore = Math.min(100, Math.round(nonDraftAppsCount * 15 + 25));

    // 4. Interview Preparation Score
    const interviewingAppsCount = apps.filter(
      (a) => a.status === 'Interview Scheduled' || a.status === 'Interview Completed' || a.status === 'Offer'
    ).length;
    const interviewPrepScore = Math.min(100, Math.round(interviewingAppsCount * 30 + 35));

    // 5. Career Alignment Score
    const careerAlignmentScore = Math.min(100, Math.round(jobReadinessScore * 0.5 + skillDevelopmentScore * 0.5));

    // Composite Overall Health Score
    const overallHealthScore = Math.round(
      jobReadinessScore * 0.25 +
      skillDevelopmentScore * 0.25 +
      jobSearchActivityScore * 0.20 +
      interviewPrepScore * 0.15 +
      careerAlignmentScore * 0.15
    );

    let healthBand: 'Excellent' | 'Strong' | 'Developing' | 'Needs Attention' = 'Strong';
    if (overallHealthScore >= 88) healthBand = 'Excellent';
    else if (overallHealthScore >= 75) healthBand = 'Strong';
    else if (overallHealthScore >= 60) healthBand = 'Developing';
    else healthBand = 'Needs Attention';

    return {
      overallHealthScore,
      jobReadinessScore,
      skillDevelopmentScore,
      jobSearchActivityScore,
      interviewPrepScore,
      careerAlignmentScore,
      healthBand
    };
  }

  /**
   * Aggregates summary data across all 14 modules for the central control center
   */
  public static getDashboardSummary(candidate: CandidateProfile) {
    const health = this.calculateCareerHealth(candidate);
    const todayActions = this.getTodayRecommendedActions(candidate);
    const bestMatches = JobService.getMatchedJobs(candidate).slice(0, 3);
    const apps = ApplicationTrackerService.getApplications(candidate.id);
    const stats = ApplicationTrackerService.calculateStatistics(apps);
    const insights = ApplicationTrackerService.generateAIInsights(apps);
    const learningProgress = LearningHubService.calculateProgress(candidate);

    return {
      health,
      todayActions,
      bestMatches,
      applicationsCount: stats.totalApplications,
      interviewsCount: stats.interviewsCount,
      offersCount: stats.offersCount,
      responseRate: stats.responseRate,
      aiInsights: insights,
      learningProgress
    };
  }
}
