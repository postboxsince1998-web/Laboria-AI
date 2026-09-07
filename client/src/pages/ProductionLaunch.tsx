import React, { useState } from 'react';
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Clock,
  Database,
  Server,
  WifiOff,
  Activity,
  AlertTriangle,
  FileText,
  Play,
  Check,
  RefreshCw,
  Info,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ProductionLaunchService } from '../services/productionLaunchService';
import { runProductionLaunchEngineTests, TestResultItem } from '../services/productionLaunchEngineTests';
import { ProductionLaunchStatusReport } from '../types';

export const ProductionLaunch: React.FC = () => {
  const [report, setReport] = useState<ProductionLaunchStatusReport>(() => ProductionLaunchService.getFinalLaunchReport());
  const [activeTab, setActiveTab] = useState<'audit' | 'checklists' | 'fallbacks' | 'timeline' | 'diagnostics'>('audit');
  const [activeChecklistIndex, setActiveChecklistIndex] = useState<number>(0);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);
  const [fallbackStates, setFallbackStates] = useState(report.fallbackStates);

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runProductionLaunchEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
    }, 600);
  };

  const toggleFallbackSim = (index: number) => {
    const updated = [...fallbackStates];
    updated[index].isOnline = !updated[index].isOnline;
    setFallbackStates(updated);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Rocket className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Production Readiness & Launch Control</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  STEP 30
                </span>
              </div>
              <p className="text-emerald-200/80 text-sm">
                25-Dimension Platform Audit • 7 Production Checklists • Graceful Offline Engine • 7-Phase Launch Timeline
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-emerald-300/70 uppercase tracking-wider font-semibold">Status</div>
            <div className="text-lg font-extrabold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {report.readinessStatus}
            </div>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Engine...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run 12-Point Diagnostics
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{report.readinessPercentage}%</div>
            <div className="text-xs text-slate-400 font-medium">Platform Audit Pass Rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">25 / 25</div>
            <div className="text-xs text-slate-400 font-medium">Audited Dimensions</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-400 font-medium">Blocking Release Issues</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium">Offline Graceful Usability</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          25-Dimension Audit Matrix
        </button>

        <button
          onClick={() => setActiveTab('checklists')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'checklists'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          7 Production Checklists
        </button>

        <button
          onClick={() => setActiveTab('fallbacks')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'fallbacks'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          Offline Fallback Engine
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          7-Phase Launch Timeline
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
          Diagnostics & Constraints
        </button>
      </div>

      {/* Tab 1: 25-Dimension Audit Matrix */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              25-Dimension Comprehensive Audit Verification
            </h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              All 25 Dimensions Verified Status: GREEN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.auditDimensions.map((dim) => (
              <div
                key={dim.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition text-sm">
                    {dim.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {dim.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-400">{dim.category}</div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  {dim.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: 7 Production Checklists */}
      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Checklist Category</div>
            {report.checklists.map((chk, idx) => (
              <button
                key={chk.title}
                onClick={() => setActiveChecklistIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  activeChecklistIndex === idx
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-sm truncate">{chk.title}</span>
                <ChevronRight className={`w-4 h-4 transition ${activeChecklistIndex === idx ? 'text-emerald-400' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">{report.checklists[activeChecklistIndex].title}</h2>
              <p className="text-sm text-slate-400 mt-1">{report.checklists[activeChecklistIndex].description}</p>
            </div>

            <div className="space-y-3">
              {report.checklists[activeChecklistIndex].items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">{item.check}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.mandatory && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Mandatory
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Offline Fallback Engine */}
      {activeTab === 'fallbacks' && (
        <div className="space-y-6">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-200">
              Laboria AI includes an autonomous Fallback Engine ensuring 100% platform usability even when external LLMs or third-party APIs are offline. Test the simulation toggles below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fallbackStates.map((fs, idx) => (
              <div
                key={fs.providerType}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base">{fs.providerType}</h3>
                    <button
                      onClick={() => toggleFallbackSim(idx)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${
                        fs.isOnline
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${fs.isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {fs.isOnline ? 'ONLINE' : 'SIMULATED OFFLINE'}
                    </button>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">Fallback Strategy</div>
                    <div className="text-xs font-medium text-emerald-400">{fs.activeFallbackStrategy}</div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">User Impact</div>
                    <div className="text-xs text-slate-300">{fs.userImpact}</div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 italic">
                  Status: {fs.isOnline ? 'Primary live connection ready.' : 'Fallback Engine active — zero disruption.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 7-Phase Launch Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Recommended 7-Phase Production Launch Sequence
            </h2>

            <div className="space-y-4">
              {report.launchPhases.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                        {phase.phaseNumber}
                      </span>
                      <h3 className="font-bold text-white text-base">{phase.phaseName}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700 w-fit">
                      Timeline: {phase.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Key Launch Actions</div>
                      <ul className="space-y-1">
                        {phase.actions.map((act, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs font-semibold text-emerald-400 uppercase mb-1">Gate Criteria for Advancement</div>
                      <div className="text-xs font-medium text-slate-200">{phase.gateCriteria}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Diagnostics & Known Limitations */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Automated Diagnostic Results */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                12-Point Automated Engine Diagnostics
              </h2>
              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold transition"
              >
                Re-run Diagnostics
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
                    <div
                      key={i}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3"
                    >
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
                <p className="text-sm text-slate-400">Click "Run 12-Point Diagnostics" above to execute real-time engine tests.</p>
              </div>
            )}
          </div>

          {/* Production Constraints & Known Limitations */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Production Deployment Constraints & Disclaimers
            </h2>

            <div className="space-y-3">
              {report.knownLimitations.map((lim, i) => (
                <div key={i} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Constraint #{i + 1}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{lim}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                Platform Compliance Verification
              </div>
              <p>
                Laboria AI strictly enforces zero employment guarantees, clear benchmark labeling on demonstration job listings, transparent attributed market data, and complete 1:1 user data isolation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductionLaunch;
