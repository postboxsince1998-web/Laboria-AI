import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  Activity,
  Play,
  RefreshCw,
  Info,
  Lock,
  Layers,
  Zap,
  Terminal,
  Clock,
  Trash2,
  Send
} from 'lucide-react';
import { realAIService } from '../services/realAIService';
import { runRealAIEngineTests, TestResultItem } from '../services/realAIEngineTests';
import { AIProviderConfigStatus, AICacheStats, AILogEntry } from '../types';
import { mockCandidate } from '../services/mockData';

export const RealAIServiceDashboard: React.FC = () => {
  const [config, setConfig] = useState<AIProviderConfigStatus>(() => realAIService.getConfigStatus());
  const [cacheStats, setCacheStats] = useState<AICacheStats>(() => realAIService.getCacheStats());
  const [logs, setLogs] = useState<AILogEntry[]>(() => realAIService.getRecentLogs());
  const [activeTab, setActiveTab] = useState<'config' | 'playground' | 'cache' | 'logs' | 'diagnostics'>('config');

  // Playground state
  const [playgroundPrompt, setPlaygroundPrompt] = useState<string>('What are the top 3 high-demand skills for a Senior Full Stack Engineer in 2026?');
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [isExecutingPlayground, setIsExecutingPlayground] = useState<boolean>(false);
  const [playgroundLatency, setPlaygroundLatency] = useState<number | null>(null);

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setConfig(realAIService.getConfigStatus());
    setCacheStats(realAIService.getCacheStats());
    setLogs(realAIService.getRecentLogs());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRunPlayground = async () => {
    setIsExecutingPlayground(true);
    setPlaygroundResponse(null);
    const start = Date.now();
    try {
      const res = await realAIService.generateText(playgroundPrompt);
      setPlaygroundResponse(res);
    } catch (err: any) {
      setPlaygroundResponse(`Error: ${err.message}`);
    } finally {
      setPlaygroundLatency(Date.now() - start);
      setIsExecutingPlayground(false);
      refreshData();
    }
  };

  const handleClearCache = () => {
    realAIService.clearCache();
    refreshData();
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setTimeout(async () => {
      const res = await runRealAIEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Central Real AI Engine Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-300 border border-purple-400/40">
                  STEP 33
                </span>
              </div>
              <p className="text-purple-200/80 text-sm">
                Provider Abstraction • Secure Credentials • L1 LRU Cache & Cost Control • Zero Hallucination • Safe Logging
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-purple-950/70 border border-purple-500/40 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-purple-300/70 uppercase tracking-wider font-semibold">Active Provider</div>
            <div className="text-sm font-extrabold text-purple-300 flex items-center gap-1.5 truncate max-w-[200px]">
              <Cpu className="w-4 h-4 text-purple-400 flex-shrink-0" />
              {config.providerName}
            </div>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Real AI...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run 14-Point AI Diagnostic Suite
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white truncate">{config.apiKeyMasked}</div>
            <div className="text-xs text-slate-400 font-medium">Environment API Key Security</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{cacheStats.savedCallsCount}</div>
            <div className="text-xs text-slate-400 font-medium">L1 Cache Calls Saved</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">12 / 12</div>
            <div className="text-xs text-slate-400 font-medium">Laboria Features Integrated</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium">Offline Resilient Fallback</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Provider Architecture & Credentials
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'playground'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Live AI Prompt Playground
        </button>

        <button
          onClick={() => setActiveTab('cache')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'cache'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Cache & Cost Control
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Safe Telemetry Logs
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          14-Point AI Diagnostics
        </button>
      </div>

      {/* Tab 1: Provider Architecture & Configuration */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Central Provider Configuration Status
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Provider Name</span>
                <span className="text-xs font-bold text-purple-300">{config.providerName}</span>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Active AI Model</span>
                <span className="text-xs font-mono text-indigo-300">{config.modelName}</span>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Credentials Masked</span>
                <span className="text-xs font-mono text-emerald-400">{config.apiKeyMasked}</span>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Environment Mode</span>
                <span className="text-xs font-semibold text-slate-200 uppercase">{config.environment}</span>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Fallback Strategy Status</span>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {config.isFallbackActive ? 'Zero-Cost Fallback Active' : 'Live Gemini API Connected'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Integrated Laboria Features Architecture
            </h2>

            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-4 text-xs text-purple-200 leading-relaxed space-y-1">
              <div className="font-bold text-purple-300">Decoupled Adapter Architecture</div>
              <p>
                Feature components communicate exclusively with CentralAIService via AIProviderAdapter. Provider can be changed in 1 line of code without touching UI components.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Resume Analyzer',
                'Job Description Parser',
                'Skill Gap Engine',
                'Job Readiness Evaluator',
                'Personal AI Mentor',
                'Interview Coach Simulator',
                'Future Skills Radar',
                'Career Navigator',
                'AI Learning Hub',
                'ATS Resume Builder',
                'Job Application Assistant',
                'Career OS Dashboard'
              ].map((ft, i) => (
                <div key={i} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium">{ft}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live AI Prompt Playground */}
      {activeTab === 'playground' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            Live AI Service Prompt Tester
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Test Prompt Query</label>
              <textarea
                value={playgroundPrompt}
                onChange={(e) => setPlaygroundPrompt(e.target.value)}
                rows={3}
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleRunPlayground}
                disabled={isExecutingPlayground}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {isExecutingPlayground ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Execute Central AI Service
              </button>

              {playgroundLatency !== null && (
                <div className="text-xs text-indigo-400 font-mono">Execution Latency: {playgroundLatency} ms</div>
              )}
            </div>

            {playgroundResponse && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-purple-400">Response Output:</div>
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {playgroundResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Cache & Cost Control */}
      {activeTab === 'cache' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              L1 LRU Response Cache & Cost Control Metrics
            </h2>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear L1 Cache
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Current Cache Size</div>
              <div className="text-2xl font-bold text-white">{cacheStats.cacheSize} Entries</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Cache Hits</div>
              <div className="text-2xl font-bold text-emerald-400">{cacheStats.hitCount}</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">API Calls Saved</div>
              <div className="text-2xl font-bold text-indigo-400">{cacheStats.savedCallsCount}</div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Deduplicated Requests</div>
              <div className="text-2xl font-bold text-purple-400">{cacheStats.deduplicatedRequestsCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Safe Telemetry Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Safe Telemetry & Audit Logs (PII & API Key Masked)
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex justify-between items-center gap-4 text-xs">
                  <div>
                    <div className="font-bold text-white">{log.requestType}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{log.timestamp} • Provider: {log.provider}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-400">{log.latencyMs} ms</span>
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No telemetry logs recorded yet. Run playground or diagnostics above.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: 14-Point AI Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              14-Point Real AI Engine Diagnostics
            </h2>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-semibold transition"
            >
              Re-run Audit Suite
            </button>
          </div>

          {diagnosticResults ? (
            <div className="space-y-3">
              <div className="flex gap-4 p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg">
                <div className="text-xs text-purple-300">
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
              <p className="text-sm text-slate-400">Click "Run 14-Point AI Diagnostic Suite" above to execute real-time engine tests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealAIServiceDashboard;
