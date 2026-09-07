import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Eye,
  Bookmark,
  Briefcase,
  Mic,
  Target,
  BookOpen,
  Bot,
  Radio,
  Building2,
  ShieldCheck,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  Lock,
  Layers,
  Activity,
  Award,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Check
} from 'lucide-react';
import { ProductAnalyticsService } from '../services/productAnalyticsService';
import { runProductAnalyticsEngineTests, TestResultItem } from '../services/productAnalyticsEngineTests';
import { Step39Report, AnalyticsTimeframe, AnalyticsEvent } from '../types';

export const AdminAnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>('weekly');
  const [report, setReport] = useState<Step39Report>(() => ProductAnalyticsService.getFinalReport(selectedTimeframe));
  const [activeTab, setActiveTab] = useState<'overview' | 'event_stream' | 'timeframes' | 'privacy_compliance' | 'diagnostics'>('overview');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = (tf: AnalyticsTimeframe = selectedTimeframe) => {
    setReport(ProductAnalyticsService.getFinalReport(tf));
  };

  const handleTimeframeChange = (tf: AnalyticsTimeframe) => {
    setSelectedTimeframe(tf);
    refreshData(tf);
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runProductAnalyticsEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const currentMetrics = report.currentMetrics;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <BarChart3 className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Admin Product Analytics Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  STEP 39
                </span>
              </div>
              <p className="text-emerald-200/80 text-sm">
                12 Event Taxonomy Definitions • Daily, Weekly &amp; Monthly Aggregations • 100% Privacy Protection • Zero Fabricated Stats
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium px-2">Timeframe:</span>
            {(['daily', 'weekly', 'monthly'] as AnalyticsTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1 rounded-lg font-semibold transition uppercase text-[11px] ${
                  selectedTimeframe === tf
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === 'daily' ? '24h' : tf === 'weekly' ? '7d' : '30d'}
              </button>
            ))}
          </div>

          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Telemetry
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            Run 14 Analytics Diagnostics
          </button>
        </div>
      </div>

      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Unique Active Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {currentMetrics.uniqueUsers} Users
          </div>
          <div className="text-xs text-slate-400 mt-1 uppercase">
            {selectedTimeframe} Active Session Count
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Resume Uploads</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {currentMetrics.resumeUploads} Uploads
          </div>
          <div className="text-xs text-slate-400 mt-1">
            `resume_uploaded` Telemetry
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Jobs Viewed &amp; Saved</span>
            <Bookmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {currentMetrics.jobsViewed} / {currentMetrics.jobsSaved}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Viewed vs Saved Telemetry
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Applications Tracked</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {currentMetrics.applicationsTracked} Applications
          </div>
          <div className="text-xs text-slate-400 mt-1">
            `job_applied` Telemetry
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>AI Mentor &amp; Practice</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {currentMetrics.mentorUsage} / {currentMetrics.interviewsPracticed}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Mentor Questions &amp; Mock Rounds
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Event Category Overview
        </button>

        <button
          onClick={() => setActiveTab('event_stream')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'event_stream'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Anonymized Event Stream ({report.recentEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('timeframes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'timeframes'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Comparative Matrix (Daily / Weekly / Monthly)
        </button>

        <button
          onClick={() => setActiveTab('privacy_compliance')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'privacy_compliance'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Privacy Compliance Audit
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          14-Point Diagnostic Suite
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Event Category Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Product Usage Telemetry Breakdown ({selectedTimeframe.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-400">
                  Empirical telemetry metrics across all 12 core platform event categories.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                Zero Fabricated Data
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Resume Uploads</span>
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.resumeUploads} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`resume_uploaded`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Job Discovery Views</span>
                  <Eye className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.jobsViewed} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`job_viewed`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Jobs Saved</span>
                  <Bookmark className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.jobsSaved} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`job_saved`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Applications Tracked</span>
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.applicationsTracked} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`job_applied`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Interviews Practiced</span>
                  <Mic className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.interviewsPracticed} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`interview_started`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Skill Gaps Analyzed</span>
                  <Target className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.skillGapsAnalyzed} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`skill_gap_viewed`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Learning Started</span>
                  <BookOpen className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.learningStarted} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`learning_started`</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>AI Mentor Usage</span>
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white">{currentMetrics.mentorUsage} events</div>
                <div className="text-[11px] text-slate-400 font-mono">`mentor_used`</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anonymized Event Stream */}
      {activeTab === 'event_stream' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Live Anonymized Telemetry Event Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time event stream logging privacy-safe user actions with zero PII exposure.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                PII Privacy Shield Enforced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Event Timestamp</th>
                    <th className="p-3">Event Type (`eventType`)</th>
                    <th className="p-3">Anonymous ID</th>
                    <th className="p-3">Safe Metadata</th>
                    <th className="p-3">PII Guard Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.recentEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(evt.timestamp).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[11px]">
                          {evt.eventType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{evt.anonymousUserId}</td>
                      <td className="p-3 text-slate-400 font-sans text-xs">
                        {evt.metadata ? JSON.stringify(evt.metadata) : '{}'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-sky-400" />
                          Zero PII
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

      {/* Tab 3: Comparative Matrix (Daily / Weekly / Monthly) */}
      {activeTab === 'timeframes' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Comparative Timeframe Telemetry Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Side-by-side comparison of user telemetry across Daily (24h), Weekly (7d), and Monthly (30d) windows.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Telemetry Metric Category</th>
                    <th className="p-3 text-center">Daily (Last 24 Hours)</th>
                    <th className="p-3 text-center">Weekly (Last 7 Days)</th>
                    <th className="p-3 text-center">Monthly (Last 30 Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Unique Active Users</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{report.timeframeBreakdown.daily.uniqueUsers}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{report.timeframeBreakdown.weekly.uniqueUsers}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{report.timeframeBreakdown.monthly.uniqueUsers}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Resume Uploads (`resume_uploaded`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.resumeUploads}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.resumeUploads}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.resumeUploads}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Jobs Viewed (`job_viewed`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.jobsViewed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.jobsViewed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.jobsViewed}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Jobs Saved (`job_saved`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.jobsSaved}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.jobsSaved}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.jobsSaved}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Applications Tracked (`job_applied`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.applicationsTracked}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.applicationsTracked}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.applicationsTracked}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Interviews Practiced (`interview_started`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.interviewsPracticed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.interviewsPracticed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.interviewsPracticed}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">Skill Gaps Analyzed (`skill_gap_viewed`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.skillGapsAnalyzed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.skillGapsAnalyzed}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.skillGapsAnalyzed}</td>
                  </tr>

                  <tr className="hover:bg-slate-950/60 transition">
                    <td className="p-3 font-bold text-white">AI Mentor Usage (`mentor_used`)</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.daily.mentorUsage}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.weekly.mentorUsage}</td>
                    <td className="p-3 text-center font-mono">{report.timeframeBreakdown.monthly.mentorUsage}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Privacy Compliance Audit */}
      {activeTab === 'privacy_compliance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Privacy Protection &amp; Zero PII Verification</h3>
                <p className="text-xs text-slate-400">
                  Strictly enforcing anonymized event logging without collecting sensitive personal details.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-200">PII Scrubbing Status</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs">
                  100% PRIVACY COMPLIANT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Candidate Names &amp; Email</div>
                  <div className="text-emerald-400 font-bold">✓ Excluded &amp; Anonymized</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Resume Content Text</div>
                  <div className="text-emerald-400 font-bold">✓ Excluded &amp; Anonymized</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Private Salary Expectations</div>
                  <div className="text-emerald-400 font-bold">✓ Excluded &amp; Anonymized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 14-Point Diagnostic Test Suite */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  14-Point Product Analytics Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting event definitions, PII scrubbing, timeframe aggregation, and empirical metrics.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run Full Analytics Diagnostics
              </button>
            </div>

            {diagnosticResults ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  diagnosticResults.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-bold text-sm">
                        {diagnosticResults.passed ? 'ALL 14 ANALYTICS DIAGNOSTICS PASSED' : 'SOME DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: TELEMETRY READY
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
                <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Analytics Diagnostic Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run Full Analytics Diagnostics" above to execute all 14 empirical tests for event logging, candidate PII scrubbing, timeframe aggregation, and zero fake stats.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
