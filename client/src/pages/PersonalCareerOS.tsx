import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Sparkles,
  Zap,
  Target,
  Award,
  Briefcase,
  Calendar,
  BookOpen,
  Compass,
  Radar,
  TrendingUp,
  FolderGit2,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Bot,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CandidateProfile } from '../types';
import { CareerContextEngine } from '../services/careerContextEngine';
import { runCareerOperatingSystemEngineTests, TestResultItem } from '../services/careerOperatingSystemEngineTests';

interface PersonalCareerOSProps {
  candidate: CandidateProfile;
}

export const PersonalCareerOS: React.FC<PersonalCareerOSProps> = ({ candidate }) => {
  const navigate = useNavigate();

  const [testResultsModalOpen, setTestResultsModalOpen] = useState(false);
  const [testSuiteOutput, setTestSuiteOutput] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorResponseText, setMentorResponseText] = useState('');

  // Fetch unified context, daily plan, and weekly review from CareerContextEngine
  const unifiedContext = CareerContextEngine.getUnifiedContext(candidate);
  const dailyPlan = CareerContextEngine.getDailyCareerPlan(candidate);
  const weeklyReview = CareerContextEngine.getWeeklyCareerReview(candidate);

  const handleRunDiagnostics = () => {
    const res = runCareerOperatingSystemEngineTests();
    setTestSuiteOutput(res);
    setTestResultsModalOpen(true);
  };

  const handleAskWhatNext = () => {
    const text = CareerContextEngine.answerWhatShouldIDoNext(candidate);
    setMentorResponseText(text);
    setMentorModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="purple" className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Personal Career Operating System
              </Badge>
              <span className="text-xs text-slate-400">Step 25 Master Integration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Personal Career OS
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed">
              Consolidates 14 career modules into a unified command center. Synthesizes your profile, resume, skills, applications, and trajectory to answer <span className="text-cyan-300 font-semibold">"What should I do next?"</span> with zero contradictory advice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={handleAskWhatNext}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" /> What Should I Do Next?
            </Button>
            <Button variant="secondary" onClick={handleRunDiagnostics} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Run Diagnostics
            </Button>
          </div>
        </div>

        {/* Quick Context Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Overall Job Readiness:</span>
            <span className="text-emerald-400 font-extrabold text-lg">{unifiedContext.overallReadinessScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 block">ATS Resume Score:</span>
            <span className="text-cyan-300 font-extrabold text-lg">{unifiedContext.resumeSummary.atsScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 block">Active Applications:</span>
            <span className="text-indigo-300 font-extrabold text-lg">{unifiedContext.applicationsSummary.activeCount} Active</span>
          </div>
          <div>
            <span className="text-slate-400 block">Upcoming Interview:</span>
            <span className="text-amber-300 font-bold text-sm">{unifiedContext.interviewsSummary.nextInterviewDate}</span>
          </div>
        </div>
      </div>

      {/* DAILY CAREER PLAN (Strict Max 3 Actions) */}
      <Card className="bg-slate-900/90 border-cyan-500/30 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Daily Career Plan</h2>
              <Badge variant="success">Max 3 High-Value Actions</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {dailyPlan.date} • Rationale-backed prioritization (Est. Total Time: <span className="text-cyan-300 font-semibold">{dailyPlan.estimatedTotalMinutes} mins</span>)
            </p>
          </div>
          <Badge variant="purple">{dailyPlan.focusHeadline}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyPlan.prioritizedActions.map((action, idx) => (
            <Card key={action.id} className="bg-slate-950/80 border-slate-800 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={idx === 0 ? 'success' : idx === 1 ? 'warning' : 'info'}>
                    {action.priorityTier}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {action.estimatedMinutes} min
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">{action.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{action.rationale}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{action.category}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(action.targetModuleRoute)}
                  className="text-xs text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1.5"
                >
                  {action.actionButtonLabel} <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* WEEKLY CAREER REVIEW DASHBOARD */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Weekly Career Review</h2>
              <span className="text-xs text-slate-400">{weeklyReview.weekRange}</span>
            </div>
          </div>
          <Badge variant="purple" className="text-sm">
            Overall Score: {weeklyReview.overallProgressScore}%
          </Badge>
        </div>

        {/* 7 Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Progress</span>
            <span className="text-xs font-bold text-emerald-400">{weeklyReview.summaryMetrics.progress}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Jobs Matched</span>
            <span className="text-sm font-bold text-white">{weeklyReview.summaryMetrics.jobsMatched} Roles</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Applications</span>
            <span className="text-sm font-bold text-cyan-300">{weeklyReview.summaryMetrics.applicationsActive} Active</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Interviews</span>
            <span className="text-sm font-bold text-amber-300">{weeklyReview.summaryMetrics.interviewsScheduled} Scheduled</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Learning</span>
            <span className="text-sm font-bold text-purple-300">{weeklyReview.summaryMetrics.learningHoursCompleted} hrs</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Skills Mastered</span>
            <span className="text-sm font-bold text-emerald-300">{weeklyReview.summaryMetrics.skillsMasteredCount} Skills</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Readiness Delta</span>
            <span className="text-xs font-bold text-emerald-400">{weeklyReview.summaryMetrics.readinessDelta}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block mb-2">🏆 Key Milestones Achieved This Week:</span>
            <ul className="space-y-1.5">
              {weeklyReview.keyMilestonesAchieved.map((m, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Bot className="w-4 h-4 text-indigo-400" /> AI Mentor Strategic Synthesis:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {weeklyReview.aiMentorStrategicAdvice}
            </p>
          </div>
        </div>
      </Card>

      {/* 14 UNIFIED CAREER CONTEXT DIMENSIONS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Unified Career Context Data Matrix</h2>
          </div>
          <span className="text-xs text-slate-400">14 Active Context Streams</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Profile */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">1. Candidate Profile</span>
              <Badge variant="info">Active</Badge>
            </div>
            <h4 className="text-sm font-bold text-white">{unifiedContext.fullName}</h4>
            <p className="text-xs text-slate-300">{unifiedContext.profileSummary.yoe} YOE • {unifiedContext.profileSummary.preferredMode}</p>
          </Card>

          {/* 2. Resume */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">2. AI Resume</span>
              <Badge variant="success">{unifiedContext.resumeSummary.atsScore}/100 ATS</Badge>
            </div>
            <h4 className="text-sm font-bold text-white">{unifiedContext.resumeSummary.fileName}</h4>
            <p className="text-xs text-slate-300">{unifiedContext.resumeSummary.topParsedSkillsCount} parsed technical skills</p>
          </Card>

          {/* 3. Skills */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">3. Verified Skills</span>
              <Badge variant="purple">{unifiedContext.skillsSummary.verifiedCount} Skills</Badge>
            </div>
            <h4 className="text-xs font-bold text-cyan-300">{unifiedContext.skillsSummary.topSkillNames.join(', ')}</h4>
            <p className="text-xs text-slate-300">Verified evidence provenance</p>
          </Card>

          {/* 4. Skill Gaps */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">4. Skill Gap Analyzer</span>
              <Badge variant="warning">{unifiedContext.skillGapSummary.highPriorityGapsCount} Priority Gaps</Badge>
            </div>
            <h4 className="text-xs font-bold text-amber-300">{unifiedContext.skillGapSummary.topGapName}</h4>
            <p className="text-xs text-slate-300">Top target for match elevation</p>
          </Card>

          {/* 5. Learning */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">5. Learning Hub</span>
              <Badge variant="info">{unifiedContext.learningSummary.activeModulesCount} Modules</Badge>
            </div>
            <h4 className="text-xs font-bold text-white">{unifiedContext.learningSummary.todayTask}</h4>
            <p className="text-xs text-slate-300">Daily interactive task active</p>
          </Card>

          {/* 6. Readiness */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">6. Job Readiness Score</span>
              <Badge variant="success">{unifiedContext.readinessSummary.score}/100</Badge>
            </div>
            <h4 className="text-xs font-bold text-emerald-300">{unifiedContext.readinessSummary.employabilityLevel}</h4>
            <p className="text-xs text-slate-300">Target role ready</p>
          </Card>

          {/* 7. Career Goals */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">7. Career Goals</span>
              <Badge variant="purple">{unifiedContext.careerGoalsSummary.timeframe}</Badge>
            </div>
            <h4 className="text-sm font-bold text-white">{unifiedContext.careerGoalsSummary.targetTitle}</h4>
            <p className="text-xs text-slate-300">Salary Target: {unifiedContext.careerGoalsSummary.targetSalary}</p>
          </Card>

          {/* 8. Job Matches */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">8. Job Match Engine</span>
              <Badge variant="success">{unifiedContext.jobMatchesSummary.topMatchScore}% Match</Badge>
            </div>
            <h4 className="text-xs font-bold text-white">{unifiedContext.jobMatchesSummary.topMatchTitle}</h4>
            <p className="text-xs text-slate-300">@ {unifiedContext.jobMatchesSummary.topMatchCompany}</p>
          </Card>

          {/* 9. Applications */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">9. Application Tracker</span>
              <Badge variant="info">{unifiedContext.applicationsSummary.activeCount} Tracked</Badge>
            </div>
            <h4 className="text-xs font-bold text-white">Status: {unifiedContext.applicationsSummary.latestStatus}</h4>
            <p className="text-xs text-slate-300">Active telemetry tracked</p>
          </Card>

          {/* 10. Interviews */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">10. Interview Simulator</span>
              <Badge variant="warning">{unifiedContext.interviewsSummary.scheduledCount} Scheduled</Badge>
            </div>
            <h4 className="text-xs font-bold text-amber-300">{unifiedContext.interviewsSummary.nextInterviewRound}</h4>
            <p className="text-xs text-slate-300">Date: {unifiedContext.interviewsSummary.nextInterviewDate}</p>
          </Card>

          {/* 11. Projects */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">11. Portfolio Builder</span>
              <Badge variant="purple">{unifiedContext.projectsSummary.totalProjects} Projects</Badge>
            </div>
            <h4 className="text-xs font-bold text-white">{unifiedContext.projectsSummary.featuredProjectTitle}</h4>
            <p className="text-xs text-slate-300">Evidence linked to skills</p>
          </Card>

          {/* 12. Future Skills */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">12. Future Skills Radar</span>
              <Badge variant="success">{unifiedContext.futureSkillsSummary.growthYoY}</Badge>
            </div>
            <h4 className="text-xs font-bold text-cyan-300">{unifiedContext.futureSkillsSummary.emergingSkillName}</h4>
            <p className="text-xs text-slate-300">High growth emerging tech</p>
          </Card>

          {/* 13. Career Path */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">13. Career Navigator</span>
              <Badge variant="info">In Progress</Badge>
            </div>
            <h4 className="text-xs font-bold text-white">Target: {unifiedContext.careerPathSummary.recommendedNextRole}</h4>
            <p className="text-xs text-slate-300">From {unifiedContext.careerPathSummary.currentStage}</p>
          </Card>

          {/* 14. Market Intelligence */}
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">14. India Market Intelligence</span>
              <Badge variant="success">+{unifiedContext.marketIntelligenceSummary.marketGrowthPercent}% YoY</Badge>
            </div>
            <h4 className="text-xs font-bold text-emerald-300">{unifiedContext.marketIntelligenceSummary.topGrowingRole}</h4>
            <p className="text-xs text-slate-300">NASSCOM & MSDE attributed data</p>
          </Card>
        </div>
      </div>

      {/* AI Mentor Answer Modal */}
      {mentorModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">AI Mentor: What Should I Do Next?</h3>
              </div>
              <Button variant="ghost" onClick={() => setMentorModalOpen(false)} className="text-xs text-slate-400">
                Close
              </Button>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 whitespace-pre-wrap leading-relaxed">
              {mentorResponseText}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button variant="primary" onClick={() => setMentorModalOpen(false)} className="text-xs">
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Test Results Modal */}
      {testResultsModalOpen && testSuiteOutput && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Step 25 Personal Career OS Diagnostics Suite</h3>
              </div>
              <Button variant="ghost" onClick={() => setTestResultsModalOpen(false)} className="text-xs text-slate-400">
                Close
              </Button>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">Overall Suite Status:</span>
              <Badge variant={testSuiteOutput.passed ? 'success' : 'warning'}>
                {testSuiteOutput.passed ? '12/12 PASSED' : 'SOME TESTS FAILED'}
              </Badge>
            </div>

            <div className="space-y-2">
              {testSuiteOutput.results.map((r, idx) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{r.name}</span>
                    <Badge variant={r.passed ? 'success' : 'warning'}>
                      {r.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{r.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalCareerOS;
