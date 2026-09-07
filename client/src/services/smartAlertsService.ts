import { CandidateProfile } from '../types';
import { JobWatchService } from './jobWatchService';
import { seedJobs } from '../data/seedData';

export type AlertCategory =
  | 'New Job Match'
  | 'Strong Match'
  | 'Application Reminder'
  | 'Interview Preparation'
  | 'Skill Gap'
  | 'Learning Reminder'
  | 'Career Insight';

export type AlertPriority = 'High' | 'Medium' | 'Low';

export interface SmartNotification {
  id: string;
  userId: string;
  category: AlertCategory;
  priority: AlertPriority;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  jobId?: string;
  actionPath?: string;
  actionLabel?: string;
  groupedCount?: number;
  source: string;
}

export interface AlertSettings {
  enabled: boolean;
  minMatchScore: number; // e.g. 80
  preferredFrequency: 'Immediate' | 'Daily Digest' | 'Weekly Summary';
  jobAlertsEnabled: boolean;
  interviewAlertsEnabled: boolean;
  learningAlertsEnabled: boolean;
  careerAlertsEnabled: boolean;
}

export interface DailyDigest {
  date: string;
  newMatchesCount: number;
  bestMatchTitle: string;
  bestMatchCompany: string;
  bestMatchScore: number;
  bestMatchJobId: string;
  prioritySkillGap: string;
  recommendedAction: string;
  actionPath: string;
  actionLabel: string;
}

// Persistent Storage
const notificationsStore: Map<string, SmartNotification> = new Map();
let alertSettings: AlertSettings = {
  enabled: true,
  minMatchScore: 80,
  preferredFrequency: 'Immediate',
  jobAlertsEnabled: true,
  interviewAlertsEnabled: true,
  learningAlertsEnabled: true,
  careerAlertsEnabled: true
};

export class SmartJobAlertsService {
  /**
   * Primary Evaluation Engine: Scans job matches & platform state,
   * enforces fatigue prevention rules, grouping rules, and priority calculation.
   */
  public static generateSmartAlerts(
    candidate: CandidateProfile,
    settings: AlertSettings = alertSettings
  ): SmartNotification[] {
    if (!settings.enabled) return Array.from(notificationsStore.values());

    const watchMatches = JobWatchService.getMatchesBySection(candidate, 'recent');
    const highMatches = watchMatches.filter((m) => m.finalPriorityScore >= settings.minMatchScore);

    // 1. Grouping Rule for Job Alerts (Prevent Notification Fatigue)
    if (settings.jobAlertsEnabled && highMatches.length >= 3) {
      const groupKey = `notif_group_jobs_${new Date().toISOString().slice(0, 10)}`;
      if (!notificationsStore.has(groupKey)) {
        notificationsStore.set(groupKey, {
          id: groupKey,
          userId: candidate.id || 'usr_demo_101',
          category: 'Strong Match',
          priority: 'High',
          title: `${highMatches.length} New Jobs Strongly Match Your Profile`,
          message: `Laboria AI found ${highMatches.length} openings matching your profile by ${settings.minMatchScore}%+. Top match: ${highMatches[0].title} @ ${highMatches[0].company}.`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readAt: null,
          jobId: highMatches[0].jobId,
          actionPath: '/job-watch',
          actionLabel: 'View Matches in Job Watch',
          groupedCount: highMatches.length,
          source: 'AI Job Watch Engine'
        });
      }
    } else if (settings.jobAlertsEnabled && highMatches.length > 0) {
      // Individual High Priority Match Notification
      highMatches.slice(0, 2).forEach((m) => {
        const key = `notif_job_${m.jobId}`;
        if (!notificationsStore.has(key)) {
          notificationsStore.set(key, {
            id: key,
            userId: candidate.id || 'usr_demo_101',
            category: 'New Job Match',
            priority: m.finalPriorityScore >= 90 ? 'High' : 'Medium',
            title: `High Match: ${m.title} (${m.finalPriorityScore}% Match)`,
            message: `${m.title} @ ${m.company} matches your profile. Verified skills: ${m.matchingSkills.slice(0, 2).join(', ')}.`,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            readAt: null,
            jobId: m.jobId,
            actionPath: '/job-watch',
            actionLabel: 'View Opportunity',
            source: 'AI Job Watch Engine'
          });
        }
      });
    }

    // 2. Interview Prep Reminder Notification
    if (settings.interviewAlertsEnabled && !notificationsStore.has('notif_interview_prep')) {
      const topJob = watchMatches[0] || seedJobs[0];
      notificationsStore.set('notif_interview_prep', {
        id: 'notif_interview_prep',
        userId: candidate.id || 'usr_demo_101',
        category: 'Interview Preparation',
        priority: 'High',
        title: `Prepare for Upcoming ${topJob.title || 'Data Analyst'} Interview`,
        message: `Run a 6-round technical & STAR behavioral mock session for your target role.`,
        createdAt: '10:00 AM',
        readAt: null,
        jobId: topJob.jobId || seedJobs[0].id,
        actionPath: '/interview-prep',
        actionLabel: 'Start Mock Interview',
        source: 'AI Interview Coach'
      });
    }

    // 3. Skill Gap & Learning Reminder Notification
    if (settings.learningAlertsEnabled && !notificationsStore.has('notif_skill_gap_powerbi')) {
      notificationsStore.set('notif_skill_gap_powerbi', {
        id: 'notif_skill_gap_powerbi',
        userId: candidate.id || 'usr_demo_101',
        category: 'Skill Gap',
        priority: 'Medium',
        title: `Bridge Critical Skill Gap: Power BI`,
        message: `Power BI is required by 85% of your target job matches. Bridge this gap to raise your readiness score from 76 to 88+.`,
        createdAt: 'Yesterday',
        readAt: null,
        actionPath: '/skill-gap',
        actionLabel: 'Improve Skill',
        source: 'Skill Gap Analyzer'
      });
    }

    // 4. Career Insight Notification
    if (settings.careerAlertsEnabled && !notificationsStore.has('notif_career_radar')) {
      notificationsStore.set('notif_career_radar', {
        id: 'notif_career_radar',
        userId: candidate.id || 'usr_demo_101',
        category: 'Career Insight',
        priority: 'Low',
        title: `Market Trend Update: AI-assisted Analytics`,
        message: `AI-assisted analytics is emerging as a growing requirement for Data Analyst paths in India.`,
        createdAt: '2 days ago',
        readAt: '2026-09-03T10:00:00Z',
        actionPath: '/radar',
        actionLabel: 'Open Future Skills Radar',
        source: 'Future Skills Radar'
      });
    }

    return Array.from(notificationsStore.values());
  }

  public static getNotifications(filter: 'unread' | 'read' | 'all' = 'all'): SmartNotification[] {
    const all = Array.from(notificationsStore.values());
    if (filter === 'unread') return all.filter((n) => !n.readAt);
    if (filter === 'read') return all.filter((n) => Boolean(n.readAt));
    return all;
  }

  public static markAsRead(notificationId: string): void {
    const notif = notificationsStore.get(notificationId);
    if (notif) {
      notif.readAt = new Date().toISOString();
    }
  }

  public static markAllAsRead(): void {
    notificationsStore.forEach((n) => {
      n.readAt = new Date().toISOString();
    });
  }

  public static clearNotification(notificationId: string): boolean {
    return notificationsStore.delete(notificationId);
  }

  /**
   * Generates In-App Daily Summary Digest
   */
  public static getDailyDigest(candidate: CandidateProfile): DailyDigest {
    const watchMatches = JobWatchService.getMatchesBySection(candidate, 'strong');
    const topJob = watchMatches[0] || { title: 'Junior Data Analyst', company: 'Nexus Cloud Technologies', finalPriorityScore: 94, jobId: seedJobs[0].id };

    return {
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      newMatchesCount: watchMatches.length || 3,
      bestMatchTitle: topJob.title,
      bestMatchCompany: topJob.company,
      bestMatchScore: topJob.finalPriorityScore || 94,
      bestMatchJobId: topJob.jobId || seedJobs[0].id,
      prioritySkillGap: 'Power BI',
      recommendedAction: `Complete 1 mock technical interview for ${topJob.title} and acquire Power BI in Skill Gap Analyzer.`,
      actionPath: '/job-watch',
      actionLabel: 'View Today\'s Best Matches'
    };
  }

  public static getSettings(): AlertSettings {
    return { ...alertSettings };
  }

  public static updateSettings(newSettings: Partial<AlertSettings>): AlertSettings {
    alertSettings = { ...alertSettings, ...newSettings };
    return alertSettings;
  }
}
