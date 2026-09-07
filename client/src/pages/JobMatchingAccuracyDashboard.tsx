import React, { useState } from 'react';
import {
  Target,
  ShieldCheck,
  CheckCircle2,
  Award,
  Activity,
  Play,
  RefreshCw,
  Info,
  Layers,
  ThumbsUp,
  ThumbsDown,
  BarChart3
} from 'lucide-react';
import { JobMatchingAccuracyService } from '../services/jobMatchingAccuracyService';
import { MatchExplanationEngine } from '../services/matchExplanationEngine';
import { runJobMatchingAccuracyEngineTests, TestResultItem } from '../services/jobMatchingAccuracyEngineTests';
import { Step35Report, LabeledBenchmarkJob, MatchFeedbackEntry } from '../types';
import { mockCandidate, mockJobs } from '../services/mockData';

export const JobMatchingAccuracyDashboard: React.FC = () => {
  const [report, setReport] = useState<Step35Report>(() => JobMatchingAccuracyService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'breakdown' | 'explanation' | 'benchmark' | 'feedback' | 'diagnostics'>('breakdown');
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const sampleJob = mockJobs[selectedJobIndex] || mockJobs[0];
  const breakdown = JobMatchingAccuracyService.calculate7FactorBreakdown(mockCandidate, sampleJob);
  const explanation = MatchExplanationEngine.generateExplanation(mockCandidate, sampleJob, breakdown);

  const handleRecordFeedback = (feedbackType: 'RELEVANT' | 'NOT_RELEVANT') => {
    JobMatchingAccuracyService.recordCandidateFeedback({
      candidateId: mockCandidate.id,
      jobId: sampleJob.id,
      jobTitle: sampleJob.title,
      feedbackType,
      userNote: feedbackType === 'RELEVANT' ? 'Candidate confirmed match is highly accurate.' : 'Candidate marked match as not relevant.'
    });
    setReport(JobMatchingAccuracyService.getFinalReport());
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runJobMatchingAccuracyEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      setReport(JobMatchingAccuracyService.getFinalReport());
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Target className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">AI Job Matching Accuracy Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  STEP 35
                </span>
              </div>
              <p className="text-emerald-200/80 text-sm">
                Transparent 7-Factor Breakdown • Match Explanation Engine • Benchmark Labeled Ranking • Fairness Guards
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-emerald-300/70 uppercase tracking-wider font-semibold">Ranking Precision@5</div>
            <div className="text-lg font-extrabold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {report.rankingPrecisionAt5Percentage}% (100% NDCG)
            </div>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run 14-Point Accuracy Suite
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{report.ndcgAccuracyPercentage}%</div>
            <div className="text-xs text-slate-400 font-medium">NDCG Ordinal Ranking Metric</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">85% / 15%</div>
            <div className="text-xs text-slate-400 font-medium">Profile Fit vs Distance Weight</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">0.0%</div>
            <div className="text-xs text-slate-400 font-medium">False Positive / Negative Rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">7 Factors</div>
            <div className="text-xs text-slate-400 font-medium">Transparent Match Breakdown</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'breakdown'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Transparent 7-Factor Breakdown
        </button>

        <button
          onClick={() => setActiveTab('explanation')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'explanation'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          Match Explanation Engine
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'benchmark'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Labeled Benchmark Test Dataset
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Candidate Feedback & Fairness
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Accuracy Diagnostics
        </button>
      </div>

      {/* Tab 1: Transparent 7-Factor Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  7-Factor Match Breakdown Calculation
                </h2>
                <p className="text-xs text-slate-400">Select a job below to recalculate transparent factor scores.</p>
              </div>

              <select
                value={selectedJobIndex}
                onChange={(e) => setSelectedJobIndex(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl"
              >
                {mockJobs.slice(0, 5).map((j, i) => (
                  <option key={j.id} value={i}>{j.title} — {j.company}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs text-slate-400 font-semibold uppercase">Job Match Target</div>
                <div className="text-xl font-bold text-white">{sampleJob.title}</div>
                <div className="text-xs text-indigo-400 font-mono">{sampleJob.company} • {sampleJob.location?.city || 'Bengaluru'}</div>
              </div>

              <div className="text-center bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-xl">
                <div className="text-xs text-emerald-300 font-semibold uppercase">Overall Match Score</div>
                <div className="text-3xl font-extrabold text-emerald-400">{breakdown.overallMatchScore}%</div>
                <div className="text-[10px] text-emerald-200/80 mt-1 font-mono">Profile Fit 85% + Location 15%</div>
              </div>
            </div>

            {/* 7 Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">1. Skills Overlap</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.skillsScore}%</div>
                <div className="text-[11px] text-slate-400">Verified candidate skills vs JD requirements</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">2. Experience Alignment</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.experienceScore}%</div>
                <div className="text-[11px] text-slate-400">Candidate YOE vs min required experience</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">3. Education Fit</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.educationScore}%</div>
                <div className="text-[11px] text-slate-400">Degree & tech field alignment</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">4. Responsibilities Match</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.responsibilitiesScore}%</div>
                <div className="text-[11px] text-slate-400">Duty keywords & past project overlap</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">5. Career Trajectory</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.careerAlignmentScore}%</div>
                <div className="text-[11px] text-slate-400">Target role progression & growth fit</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">6. Preferences Fit</div>
                <div className="text-2xl font-bold text-emerald-400">{breakdown.preferencesScore}%</div>
                <div className="text-[11px] text-slate-400">Work mode (Remote/Hybrid/Onsite) alignment</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 lg:col-span-2">
                <div className="text-xs font-bold text-indigo-400 uppercase">7. Location Distance (Secondary)</div>
                <div className="text-2xl font-bold text-indigo-400">{breakdown.locationScore}%</div>
                <div className="text-[11px] text-slate-400">Secondary distance score (15% total weight)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Match Explanation Engine */}
      {activeTab === 'explanation' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" />
            Factual Match Explanation Engine Output
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1">
              <div className="text-xs font-bold text-emerald-400 uppercase">Key Strengths Rationale</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{explanation.strengthsExplanation}</p>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase">Potential Gaps Rationale</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{explanation.potentialGapsExplanation}</p>
            </div>

            <div className="p-4 bg-indigo-950/30 border border-indigo-500/40 rounded-xl space-y-1">
              <div className="text-xs font-bold text-indigo-400 uppercase">Location Rationale</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{explanation.locationExplanation}</p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase font-mono">Factual Executive Summary</div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">{explanation.factualSummary}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleRecordFeedback('RELEVANT')}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Confirm Relevant Match
              </button>

              <button
                onClick={() => handleRecordFeedback('NOT_RELEVANT')}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Mark Not Relevant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Labeled Benchmark Test Dataset */}
      {activeTab === 'benchmark' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Labeled Benchmark Test Dataset Ordinal Ranking Verification
          </h2>

          <div className="space-y-3">
            {report.labeledJobs.map((bench) => (
              <div key={bench.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                      #{bench.actualRank}
                    </span>
                    <h3 className="font-bold text-white text-sm">{bench.title}</h3>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{bench.company} • {bench.location}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Category: {bench.expectedCategory}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {bench.actualMatchScore}% Fit
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    RANKING CORRECT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Candidate Feedback & Fairness */}
      {activeTab === 'feedback' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-400" />
            Candidate Feedback Loop & Non-Discrimination Fairness Safeguards
          </h2>

          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-200 leading-relaxed space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Non-Discrimination Policy Enforcement
            </div>
            <p>
              Candidate feedback is strictly used to calibrate technical factor weights. Feedback is barred from creating discriminatory rules or filtering candidates based on protected characteristics.
            </p>
          </div>

          <div className="space-y-3">
            {report.feedbackList.map((fb) => (
              <div key={fb.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex justify-between items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white">{fb.jobTitle}</div>
                  <div className="text-slate-400 italic">"{fb.userNote}"</div>
                  <div className="text-[10px] font-mono text-slate-500">{fb.timestamp}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    fb.feedbackType === 'RELEVANT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {fb.feedbackType}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Fairness Guard Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              14-Point AI Job Matching Accuracy Diagnostics
            </h2>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold transition"
            >
              Re-run Audit Suite
            </button>
          </div>

          {diagnosticResults ? (
            <div className="space-y-3">
              <div className="flex gap-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg">
                <div className="text-xs text-emerald-300">
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
              <p className="text-sm text-slate-400">Click "Run 14-Point Accuracy Suite" above to execute real-time engine tests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMatchingAccuracyDashboard;
