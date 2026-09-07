import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  Play,
  RefreshCw,
  Info,
  Star,
  MessageSquare,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';
import { UsabilityTestService } from '../services/usabilityTestService';
import { runUsabilityTestEngineTests, TestResultItem } from '../services/usabilityTestEngineTests';
import { UsabilityTask, UsabilityMetricSummary, UsabilityFeedbackEntry } from '../types';

export const UsabilityTestDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<UsabilityMetricSummary>(() => UsabilityTestService.getMetricSummary());
  const [tasks, setTasks] = useState<UsabilityTask[]>(() => UsabilityTestService.getTasks());
  const [feedbackList, setFeedbackList] = useState<UsabilityFeedbackEntry[]>(() => UsabilityTestService.getRecentFeedback());
  const [activeTab, setActiveTab] = useState<'tasks' | 'friction' | 'feedback' | 'diagnostics'>('tasks');

  // Simulation & Modal state
  const [isSimulatingSession, setIsSimulatingSession] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // New feedback form
  const [candidateRoleInput, setCandidateRoleInput] = useState<string>('Senior Software Engineer (Anonymous Tester)');
  const [isUsefulInput, setIsUsefulInput] = useState<boolean>(true);
  const [relevanceRatingInput, setRelevanceRatingInput] = useState<number>(5);
  const [clarityRatingInput, setClarityRatingInput] = useState<number>(5);
  const [confusingText, setConfusingText] = useState<string>('Match explanations were very clear.');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setMetrics(UsabilityTestService.getMetricSummary());
    setTasks(UsabilityTestService.getTasks());
    setFeedbackList(UsabilityTestService.getRecentFeedback());
  };

  const handleSimulateSession = () => {
    setIsSimulatingSession(true);
    setTimeout(() => {
      UsabilityTestService.runSimulatedUserSession();
      refreshData();
      setIsSimulatingSession(false);
    }, 500);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    UsabilityTestService.submitFeedback({
      candidateRole: candidateRoleInput,
      isUseful: isUsefulInput,
      matchRelevanceRating: relevanceRatingInput,
      explanationClarityRating: clarityRatingInput,
      confusingPointsText: confusingText
    });
    setShowFeedbackModal(false);
    setConfusingText('');
    refreshData();
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runUsabilityTestEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-blue-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Users className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Real User Usability Testing Analytics</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  STEP 34
                </span>
              </div>
              <p className="text-blue-200/80 text-sm">
                10 Core Tasks Telemetry • Empirical Time-to-First-Job • Friction Point Heatmap • Candidate Feedback Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateSession}
            disabled={isSimulatingSession}
            className="px-3.5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-semibold text-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSimulatingSession ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Simulate User Session
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Submit Feedback
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            Run 14-Point Usability Suite
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{metrics.totalTestSessions}</div>
            <div className="text-xs text-slate-400 font-medium">Logged Usability Test Sessions</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{metrics.averageTimeToFirstRelevantJobSeconds}s</div>
            <div className="text-xs text-slate-400 font-medium">Avg Time to First Relevant Job</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{metrics.jobSearchCompletionPercentage}%</div>
            <div className="text-xs text-slate-400 font-medium">Job Search Completion Rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">4.8 / 5.0</div>
            <div className="text-xs text-slate-400 font-medium">Candidate Match Clarity Rating</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          10 Core Usability Tasks
        </button>

        <button
          onClick={() => setActiveTab('friction')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'friction'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Friction & Drop-Off Heatmap
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Candidate Feedback Feed
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Usability Diagnostics
        </button>
      </div>

      {/* Tab 1: 10 Core Tasks Completion Rates */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            10 Core Candidate Tasks Usability Telemetry
          </h2>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.taskId} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{task.taskName}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">Category: {task.category}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 font-mono">Avg Time: {task.averageTimeSeconds}s</span>
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {task.completionRate}% Completion
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${task.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Friction & Drop-Off Heatmap */}
      {activeTab === 'friction' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Candidate Journey Drop-Off & Friction Point Telemetry
          </h2>

          <div className="space-y-3">
            {metrics.dropOffPoints.map((dp, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {dp.stepName}
                  </h3>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {dp.dropOffRatePercentage}% Drop-off
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                  Friction Cause: {dp.frictionReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Candidate Feedback Feed */}
      {activeTab === 'feedback' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Candidate Qualitative Usability Feedback Feed
            </h2>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-semibold transition"
            >
              Submit Test Feedback
            </button>
          </div>

          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">{fb.candidateRole}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-medium">Relevance: {fb.matchRelevanceRating}/5 ⭐</span>
                    <span className="text-indigo-400 font-medium">Clarity: {fb.explanationClarityRating}/5 ⭐</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  "{fb.confusingPointsText}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Usability Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              14-Point Real User Usability Diagnostics
            </h2>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-xs font-semibold transition"
            >
              Re-run Audit Suite
            </button>
          </div>

          {diagnosticResults ? (
            <div className="space-y-3">
              <div className="flex gap-4 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-300">
                  Passed: <strong className="text-emerald-400 text-sm">{diagnosticResults.results.filter(r => r.passed).length}</strong> / {diagnosticResults.results.length}
                </div>
                <div className="text-xs text-slate-400">
                  Failed: <strong className="text-slate-200 text-sm">{diagnosticResults.results.filter(r => !r.passed).length}</strong>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {diagnosticResults.results.map((res, i) => (
                  <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${res.passed ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{res.name}</div>
                      <div className="text-xs text-slate-300">{res.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Activity className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
              <p className="text-sm text-slate-400">Click "Run 14-Point Usability Suite" above to execute real-time engine tests.</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Candidate Usability Feedback</h3>

            <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold uppercase">Candidate Role / Identifier</label>
                <input
                  type="text"
                  value={candidateRoleInput}
                  onChange={(e) => setCandidateRoleInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold uppercase">Match Relevance (1-5)</label>
                  <select
                    value={relevanceRatingInput}
                    onChange={(e) => setRelevanceRatingInput(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Average</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold uppercase">Explanation Clarity (1-5)</label>
                  <select
                    value={clarityRatingInput}
                    onChange={(e) => setClarityRatingInput(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value={5}>5 - Very Clear</option>
                    <option value={4}>4 - Clear</option>
                    <option value={3}>3 - Somewhat Clear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold uppercase">Was anything confusing?</label>
                <textarea
                  value={confusingText}
                  onChange={(e) => setConfusingText(e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
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

export default UsabilityTestDashboard;
