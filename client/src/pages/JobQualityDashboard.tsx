import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Play,
  RefreshCw,
  Info,
  Layers,
  Search,
  Radio,
  Bell,
  Briefcase,
  SlidersHorizontal,
  XCircle,
  FileCheck
} from 'lucide-react';
import { JobQualityService } from '../services/jobQualityService';
import { runJobQualityEngineTests, TestResultItem } from '../services/jobQualityEngineTests';
import { Step36Report, JobQualityState } from '../types';
import { mockJobs } from '../services/mockData';

export const JobQualityDashboard: React.FC = () => {
  const [report, setReport] = useState<Step36Report>(() => JobQualityService.getFinalReport(mockJobs));
  const [activeTab, setActiveTab] = useState<'metrics' | 'records' | 'taxonomy' | 'integration' | 'diagnostics'>('metrics');
  const [filterState, setFilterState] = useState<string>('ALL');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setReport(JobQualityService.getFinalReport(mockJobs));
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runJobQualityEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 600);
  };

  const filteredResults = filterState === 'ALL'
    ? report.auditResults
    : report.auditResults.filter(r => r.qualityState === filterState);

  const getBadgeStyle = (state: JobQualityState) => {
    switch (state) {
      case 'VERIFIED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'DEMO_TEST': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'NEEDS_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'STALE': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'EXPIRED': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'INVALID': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-teal-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Database className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Admin Job Data Quality Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-300 border border-teal-400/40">
                  STEP 36
                </span>
              </div>
              <p className="text-teal-200/80 text-sm">
                6 Quality States • Normalization Pipeline • Duplicate & Stale Guards • Zero Fabricated Numbers
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Audit Dataset
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run 14-Point Quality Suite
          </button>
        </div>
      </div>

      {/* Empirical Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Jobs</div>
          <div className="text-xl font-bold text-white">{report.metrics.totalJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase">Active Usable</div>
          <div className="text-xl font-bold text-emerald-400">{report.metrics.activeJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Stale Jobs</div>
          <div className="text-xl font-bold text-slate-300">{report.metrics.staleJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-orange-400 font-semibold uppercase">Expired Jobs</div>
          <div className="text-xl font-bold text-orange-400">{report.metrics.expiredJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-purple-400 font-semibold uppercase">Duplicates</div>
          <div className="text-xl font-bold text-purple-400">{report.metrics.duplicateJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-rose-400 font-semibold uppercase">Invalid Jobs</div>
          <div className="text-xl font-bold text-rose-400">{report.metrics.invalidJobs}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-amber-400 font-semibold uppercase">Needs Review</div>
          <div className="text-xl font-bold text-amber-400">{report.metrics.jobsNeedingReview}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Empirical Metrics & States
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'records'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Audited Job Records ({filteredResults.length})
        </button>

        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'taxonomy'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Normalization Taxonomy Rules
        </button>

        <button
          onClick={() => setActiveTab('integration')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'integration'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Cross-Platform Integrations
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Quality Diagnostics
        </button>
      </div>

      {/* Tab 1: Empirical Metrics & Quality State Breakdown */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              Empirical Job Quality State Breakdown
            </h2>

            <div className="space-y-3">
              {[
                { state: 'VERIFIED', count: report.metrics.verifiedJobs, label: 'Source-backed with verified URL & complete metadata' },
                { state: 'DEMO_TEST', count: report.metrics.demoTestJobs, label: 'Explicitly labeled benchmark demonstration postings' },
                { state: 'NEEDS_REVIEW', count: report.metrics.jobsNeedingReview, label: 'Missing minor non-critical info' },
                { state: 'STALE', count: report.metrics.staleJobs, label: 'Posted >30 days ago without recent telemetry' },
                { state: 'EXPIRED', count: report.metrics.expiredJobs, label: 'Deadline passed or status inactive' },
                { state: 'INVALID', count: report.metrics.invalidJobs, label: 'Malformed URL or severe data defect' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getBadgeStyle(item.state as JobQualityState)}`}>
                      {item.state}
                    </span>
                    <div className="text-xs text-slate-400 pt-1">{item.label}</div>
                  </div>
                  <div className="text-lg font-bold text-white font-mono">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Quality Governance & Evidence Rules
            </h2>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-200 space-y-1">
                <div className="font-bold text-emerald-300">Mandatory Verification Guard</div>
                <p>
                  Laboria AI strictly enforces that zero jobs are labeled VERIFIED without verified source URL evidence and complete metadata.
                </p>
              </div>

              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-indigo-200 space-y-1">
                <div className="font-bold text-indigo-300">Duplicate Hashing Strategy</div>
                <p>
                  Jobs are hashed via normalized company + title + location key. Duplicate submissions are automatically suppressed from candidate discovery.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 space-y-1">
                <div className="font-bold text-white">Empirical Analytics Guarantee</div>
                <p>
                  All quality counts displayed above are generated strictly from empirical dataset evaluation. Zero numbers are fabricated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audited Job Records Table */}
      {activeTab === 'records' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-400" />
              Audited Job Records Inventory
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Filter State:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg"
              >
                <option value="ALL">All States ({report.auditResults.length})</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="DEMO_TEST">DEMO_TEST</option>
                <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                <option value="STALE">STALE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="INVALID">INVALID</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredResults.map((rec) => (
              <div key={rec.jobId} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-sm">{rec.jobTitle}</h3>
                    <div className="text-xs text-slate-400 font-mono">
                      Norm: {rec.normalizedCompany} • {rec.normalizedLocation}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border w-fit ${getBadgeStyle(rec.qualityState)}`}>
                    {rec.qualityState}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Normalized Skills: </span>
                  {rec.normalizedSkills.slice(0, 5).join(', ')}
                </div>

                {rec.qualityIssues.length > 0 && (
                  <div className="p-2 bg-amber-950/20 border border-amber-500/30 rounded text-[11px] text-amber-300 space-y-0.5">
                    {rec.qualityIssues.map((iss, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Normalization Rules Taxonomy */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-teal-400" />
              Skill Synonym Taxonomy Normalization
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { raw: 'ReactJS / React.js', canonical: 'React' },
                { raw: 'NodeJS / Node.js', canonical: 'Node.js' },
                { raw: 'TypeScript.js / TS', canonical: 'TypeScript' },
                { raw: 'Postgres / PostgreSQL Database', canonical: 'PostgreSQL' }
              ].map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="font-mono text-slate-400">{rule.raw}</span>
                  <span className="font-bold text-teal-400 font-mono">➔ {rule.canonical}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              Company Alias Normalization Rules
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { raw: 'Google Inc / Google LLC / Google India', canonical: 'Google' },
                { raw: 'Microsoft Corp / Microsoft India Pvt Ltd', canonical: 'Microsoft' },
                { raw: 'Amazon Development Center / AWS India', canonical: 'Amazon' }
              ].map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="font-mono text-slate-400">{rule.raw}</span>
                  <span className="font-bold text-indigo-400 font-mono">➔ {rule.canonical}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cross-Platform Integrations */}
      {activeTab === 'integration' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            Job Quality Integration Across 4 Key Platform Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Search className="w-4 h-4 text-emerald-400" />
                1. Job Discovery & Search (/discover)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically filters out stale (&gt;30 days), expired, and invalid postings. Candidates primarily view active, verified, usable opportunities.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Radio className="w-4 h-4 text-indigo-400" />
                2. AI Job Watch (/job-watch)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suppresses duplicate posting triggers and stale telemetry rules to ensure candidates only receive high-signal job watch notifications.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Bell className="w-4 h-4 text-amber-400" />
                3. Notification Center (/notifications)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verifies job active status before dispatching priority alerts or email digest recommendations.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Briefcase className="w-4 h-4 text-teal-400" />
                4. Application Tracker (/applications)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Preserves candidate application history even if the original job posting becomes expired or closed by the employer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              14-Point Job Data Quality Engine Diagnostics
            </h2>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30 text-xs font-semibold transition"
            >
              Re-run Audit Suite
            </button>
          </div>

          {diagnosticResults ? (
            <div className="space-y-3">
              <div className="flex gap-4 p-3 bg-teal-950/30 border border-teal-500/30 rounded-lg">
                <div className="text-xs text-teal-300">
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
              <p className="text-sm text-slate-400">Click "Run 14-Point Quality Suite" above to execute real-time engine tests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobQualityDashboard;
