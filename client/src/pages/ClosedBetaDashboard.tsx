import React, { useState } from 'react';
import {
  Rocket,
  Users,
  AlertTriangle,
  MessageSquare,
  Activity,
  CheckCircle2,
  RefreshCw,
  Play,
  Plus,
  Award,
  Check,
  Building2,
  HelpCircle,
  Clock,
  Star,
  Search,
  Filter,
  Layers,
  Sparkles,
  LifeBuoy,
  FileText
} from 'lucide-react';
import { ClosedBetaService } from '../services/closedBetaService';
import { runClosedBetaEngineTests, TestResultItem } from '../services/closedBetaEngineTests';
import { Step44Report, BetaGroup, BetaIssueCategory } from '../types';

export const ClosedBetaDashboard: React.FC = () => {
  const [report, setReport] = useState<Step44Report>(() => ClosedBetaService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'cohort_onboarding' | 'issue_tracker' | 'feedback_hub' | 'telemetry_monitor' | 'launch_checklist'>('cohort_onboarding');

  // Modals state
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Form states
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardName, setOnboardName] = useState('');
  const [onboardGroup, setOnboardGroup] = useState<BetaGroup>('Candidate');

  const [issueCategory, setIssueCategory] = useState<BetaIssueCategory>('CRITICAL_BUG');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueStep, setIssueStep] = useState('Step 37: Career UX');
  const [issueGroup, setIssueGroup] = useState<BetaGroup>('Candidate');

  const [fbGroup, setFbGroup] = useState<BetaGroup>('Candidate');
  const [fbUseful, setFbUseful] = useState(true);
  const [fbRelevance, setFbRelevance] = useState(5);
  const [fbClarity, setFbClarity] = useState(5);
  const [fbConfusing, setFbConfusing] = useState('');
  const [fbCategory, setFbCategory] = useState('AI Match Explanations');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setReport(ClosedBetaService.getFinalReport());
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardEmail || !onboardName) return;
    ClosedBetaService.onboardBetaUser(onboardEmail, onboardName, onboardGroup);
    setShowOnboardModal(false);
    setOnboardEmail('');
    setOnboardName('');
    refreshData();
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle || !issueDesc) return;
    ClosedBetaService.reportIssue(issueCategory, issueTitle, issueDesc, issueStep, issueGroup);
    setShowIssueModal(false);
    setIssueTitle('');
    setIssueDesc('');
    refreshData();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ClosedBetaService.submitFeedback({
      group: fbGroup,
      wasUseful: fbUseful,
      matchRelevanceRating: fbRelevance,
      explanationClarityRating: fbClarity,
      confusingPoints: fbConfusing || 'None',
      featureCategory: fbCategory
    });
    setShowFeedbackModal(false);
    setFbConfusing('');
    refreshData();
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runClosedBetaEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const telemetry = report.telemetry;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Rocket className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Closed Beta Launch &amp; Operations Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  STEP 44
                </span>
              </div>
              <p className="text-emerald-200/80 text-sm">
                Controlled Rollout • Candidate, Employer &amp; Institution Cohorts • Prioritized Issue Triage • 7-Vector Beta Telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowOnboardModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Onboard Beta User
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Issue
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Submit Feedback
          </button>

          <button
            onClick={refreshData}
            className="px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            Run 14 Beta Tests
          </button>
        </div>
      </div>

      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Active Cohort Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {report.cohortMembers.length} Members
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Candidate, Employer &amp; Institution
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Open Critical Bugs</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {telemetry.openCriticalBugsCount} Blockers
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Prioritized Bug Queue
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Match Relevance Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {telemetry.userSatisfactionScore} / 5.0
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Empirical Usability Feedback
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>AI Processing Reliability</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {telemetry.aiSuccessRatePercent}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            L1 LRU Cache &amp; Fallbacks
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Applications &amp; Shortlists</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {telemetry.applicationsTrackedCount} / {telemetry.employerShortlistCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Applied vs Shortlisted
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cohort_onboarding')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'cohort_onboarding'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Cohort Onboarding ({report.cohortMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('issue_tracker')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'issue_tracker'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Prioritized Issue Tracker ({report.issues.length})
        </button>

        <button
          onClick={() => setActiveTab('feedback_hub')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'feedback_hub'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback &amp; Ratings Hub ({report.feedbackList.length})
        </button>

        <button
          onClick={() => setActiveTab('telemetry_monitor')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'telemetry_monitor'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          7-Vector Telemetry Monitor
        </button>

        <button
          onClick={() => setActiveTab('launch_checklist')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'launch_checklist'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Launch Checklist &amp; 14 Tests
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Cohort Onboarding & Rollout */}
      {activeTab === 'cohort_onboarding' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  3-Group Beta Cohort Onboarding Management
                </h3>
                <p className="text-xs text-slate-400">
                  Controlled onboarding across Candidate, Employer, and Institution beta cohorts.
                </p>
              </div>

              <button
                onClick={() => setShowOnboardModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Invite Beta User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">User ID</th>
                    <th className="p-3">Name &amp; Email</th>
                    <th className="p-3">Beta Group</th>
                    <th className="p-3">Cohort Batch</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3">Onboarding Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.cohortMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3 text-slate-400">{mem.id}</td>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-white">{mem.name}</div>
                        <div className="text-[11px] text-slate-400">{mem.email}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          mem.group === 'Candidate'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : mem.group === 'Employer'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {mem.group}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-300">{mem.cohortName}</td>
                      <td className="p-3 text-slate-400 font-sans">{mem.joinedDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                          {mem.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prioritized Issue Tracker */}
      {activeTab === 'issue_tracker' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Prioritized Beta Issue Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Triaged issues prioritized by Critical Bugs, User Confusion, Poor Job Matches, and Broken Workflows.
                </p>
              </div>

              <button
                onClick={() => setShowIssueModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Report New Issue
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Priority</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Title &amp; Description</th>
                    <th className="p-3">Module / Step</th>
                    <th className="p-3">Reporter Group</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.issues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          iss.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : iss.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {iss.priority}
                        </span>
                      </td>
                      <td className="p-3 font-sans font-bold text-slate-200">{iss.category.replace('_', ' ')}</td>
                      <td className="p-3 font-sans max-w-md">
                        <div className="font-bold text-white">{iss.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{iss.description}</div>
                      </td>
                      <td className="p-3 font-sans text-slate-300">{iss.stepName}</td>
                      <td className="p-3 font-sans text-slate-400">{iss.group}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          iss.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : iss.status === 'TRIAGED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {iss.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Feedback & Ratings Hub */}
      {activeTab === 'feedback_hub' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  User Feedback &amp; Usability Ratings Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Ratings on match relevance, explanation clarity, and identified points of user confusion.
                </p>
              </div>

              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Submit Feedback Entry
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.feedbackList.map((fb) => (
                <div key={fb.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-300">{fb.featureCategory}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                      {fb.group}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>Relevance: {fb.matchRelevanceRating}/5</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Clarity: {fb.explanationClarityRating}/5</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-semibold block mb-0.5">Confusing Points / Feedback:</span>
                    {fb.confusingPoints}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Submitted: {new Date(fb.submittedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 7-Vector Telemetry Monitor */}
      {activeTab === 'telemetry_monitor' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  7-Vector Real-Time Beta Operational Telemetry
                </h3>
                <p className="text-xs text-slate-400">
                  Empirical monitoring across Errors, Job Relevance, Engagement, Resume Processing, AI Failures, Application Tracking, and Employer Activity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>1. Errors &amp; Blockers</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.openCriticalBugsCount} Critical Bugs</div>
                <div className="text-[11px] text-slate-400">Triage Priority Engine Active</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>2. Job Match Relevance</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.userSatisfactionScore} / 5.0 Score</div>
                <div className="text-[11px] text-slate-400">7-Factor Match Breakdown</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>3. User Engagement</span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.avgTimeToFirstJobSeconds}s Avg Time</div>
                <div className="text-[11px] text-slate-400">Time to first relevant job</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>4. Resume Processing</span>
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.totalResumesProcessed} Resumes</div>
                <div className="text-[11px] text-slate-400">ATS Parsing Engine</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>5. AI Reliability &amp; Failures</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.aiSuccessRatePercent}% Success</div>
                <div className="text-[11px] text-slate-400">L1 Cache &amp; Fallbacks</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>6. Application Tracking</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.applicationsTrackedCount} Applications</div>
                <div className="text-[11px] text-slate-400">Candidate Pipeline</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>7. Employer Activity</span>
                  <Building2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xl font-bold text-white">{telemetry.employerShortlistCount} Shortlisted</div>
                <div className="text-[11px] text-slate-400">Recruiter Portal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Launch Checklist & 14-Point Diagnostic Test Suite */}
      {activeTab === 'launch_checklist' && (
        <div className="space-y-6">
          {/* 8-Section Beta Launch Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  8-Section Beta Launch Readiness Checklist
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive validation checklist across cohorts, issue triage, telemetry, and zero fake stats.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                8/8 SECTIONS READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.checklist.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-300">{item.section}</div>
                    <div className="text-xs text-slate-300">{item.task}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 14-Point Automated Diagnostic Suite Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  14-Point Closed Beta Operational Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting cohort rollout, priority issue triage, feedback collection, support tickets, and telemetry.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run 14 Automated Beta Tests
              </button>
            </div>

            {diagnosticResults ? (
              <div className="space-y-3 pt-2">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  diagnosticResults.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-bold text-sm">
                        {diagnosticResults.passed ? 'ALL 14 CLOSED BETA DIAGNOSTICS PASSED' : 'SOME BETA DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: BETA LAUNCH READY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {diagnosticResults.results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition ${
                        res.passed
                          ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
                          : 'bg-rose-950/30 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className={`p-1 rounded mt-0.5 ${res.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{res.name}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{res.message}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${res.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <Rocket className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Beta Diagnostic Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run 14 Automated Beta Tests" above to execute empirical verification across cohort rollout, priority issue triage, feedback collection, support tickets, and telemetry.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboard Beta User Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Onboard Beta Cohort Member
            </h3>
            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={onboardEmail}
                  onChange={(e) => setOnboardEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Beta Group</label>
                <select
                  value={onboardGroup}
                  onChange={(e) => setOnboardGroup(e.target.value as BetaGroup)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Candidate">Candidate (Job Seeker)</option>
                  <option value="Employer">Employer (Recruiter / Hiring Manager)</option>
                  <option value="Institution">Institution (University Placement Office)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                >
                  Onboard User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Report Beta Bug or Friction Issue
            </h3>
            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Issue Category (Auto Priority Triage)</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as BetaIssueCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="CRITICAL_BUG">CRITICAL_BUG (Priority: CRITICAL)</option>
                  <option value="USER_CONFUSION">USER_CONFUSION (Priority: HIGH)</option>
                  <option value="POOR_JOB_MATCH">POOR_JOB_MATCH (Priority: HIGH)</option>
                  <option value="BROKEN_WORKFLOW">BROKEN_WORKFLOW (Priority: MEDIUM)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Navigation button misaligned on mobile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe what happened and how to reproduce..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reporter Group</label>
                <select
                  value={issueGroup}
                  onChange={(e) => setIssueGroup(e.target.value as BetaGroup)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Candidate">Candidate</option>
                  <option value="Employer">Employer</option>
                  <option value="Institution">Institution</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Submit &amp; Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Submit Usability &amp; Relevance Feedback
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Feature Category</label>
                <input
                  type="text"
                  required
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Match Relevance Rating (1-5 Stars)</label>
                <select
                  value={fbRelevance}
                  onChange={(e) => setFbRelevance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value={5}>5 Stars - Highly Relevant</option>
                  <option value={4}>4 Stars - Good Relevance</option>
                  <option value={3}>3 Stars - Moderate</option>
                  <option value={2}>2 Stars - Poor Relevance</option>
                  <option value={1}>1 Star - Irrelevant</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confusing Points / Feedback</label>
                <textarea
                  rows={2}
                  value={fbConfusing}
                  onChange={(e) => setFbConfusing(e.target.value)}
                  placeholder="Was anything confusing or difficult to understand?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
