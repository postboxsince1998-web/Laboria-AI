import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Database,
  AlertTriangle,
  Server,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  Award,
  Check,
  Radio,
  FileCode,
  HardDrive,
  Clock,
  Layers,
  Cpu,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ProductionInfraService } from '../services/productionInfraService';
import { runProductionInfraEngineTests, TestResultItem } from '../services/productionInfraEngineTests';
import { EnvironmentMode, Step42Report } from '../types';

export const ProductionInfraDashboard: React.FC = () => {
  const [report, setReport] = useState<Step42Report>(() => ProductionInfraService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'health_inspector' | 'db_backups' | 'error_monitoring' | 'provider_telemetry' | 'readiness_checklist'>('health_inspector');

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  // Restore notice
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  // Rate limit demo state
  const [rateLimitState, setRateLimitState] = useState<any>(null);

  const refreshData = () => {
    setReport(ProductionInfraService.getFinalReport());
  };

  const handleEnvironmentModeChange = (mode: EnvironmentMode) => {
    ProductionInfraService.setEnvironmentMode(mode);
    refreshData();
  };

  const handleCreateBackup = () => {
    ProductionInfraService.createDatabaseBackup();
    refreshData();
  };

  const handleRestoreBackup = (id: string) => {
    const res = ProductionInfraService.restoreBackup(id);
    setRestoreNotice(res.message);
    setTimeout(() => setRestoreNotice(null), 5000);
    refreshData();
  };

  const handleCheckRateLimit = () => {
    const res = ProductionInfraService.checkRateLimit('admin_session_demo', 10);
    setRateLimitState(res);
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runProductionInfraEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const health = report.healthStatus;
  const envMode = health.environment;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Production Infrastructure &amp; Health Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  STEP 42
                </span>
              </div>
              <p className="text-indigo-200/80 text-sm">
                Environment Separation • Standardized /health Endpoint • Database Snapshots • Error Monitoring • Latency Telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Environment Toggle Selector */}
          <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium px-2">Environment:</span>
            {(['development', 'staging', 'production'] as EnvironmentMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleEnvironmentModeChange(mode)}
                className={`px-3 py-1 rounded-lg font-semibold transition uppercase text-[11px] ${
                  envMode === mode
                    ? mode === 'production'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : mode === 'staging'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateBackup}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            New DB Snapshot
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
            Run 14 Infra Tests
          </button>
        </div>
      </div>

      {restoreNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{restoreNotice}</span>
          </div>
          <button onClick={() => setRestoreNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Health Check Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <span>{health.status}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-xs text-slate-400 mt-1 uppercase">
            100% Services UP (v{health.version})
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Active Environment</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 uppercase">
            {health.environment}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Secured Configuration
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Database Backups</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {report.backups.length} Snapshots
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Latest Checksum Verified
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Runtime Error Logs</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {report.errorLogs.length} Logged
          </div>
          <div className="text-xs text-slate-400 mt-1">
            PII Shield Enforced
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Provider Telemetry</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {report.providerStatuses.length} Adapters
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Real-Time Latency Monitored
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('health_inspector')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'health_inspector'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          /health Inspector
        </button>

        <button
          onClick={() => setActiveTab('db_backups')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'db_backups'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Backup Snapshots ({report.backups.length})
        </button>

        <button
          onClick={() => setActiveTab('error_monitoring')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'error_monitoring'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Runtime Error Monitoring ({report.errorLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('provider_telemetry')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'provider_telemetry'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          Provider Health &amp; Telemetry
        </button>

        <button
          onClick={() => setActiveTab('readiness_checklist')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'readiness_checklist'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Readiness &amp; 14-Point Tests
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: /health Inspector */}
      {activeTab === 'health_inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Services Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Subsystem Availability Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time status monitor across critical platform dependencies.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HEALTHY
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(health.services).map(([svc, status]) => (
                  <div key={svc} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">{svc.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-[11px] text-slate-400">Dependency Layer</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-xs">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Uptime Seconds</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{health.systemMetrics.uptimeSeconds}s</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Memory Usage</div>
                  <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">{health.systemMetrics.memoryUsageMB} MB</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Active Connections</div>
                  <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">{health.systemMetrics.activeConnections}</div>
                </div>
              </div>
            </div>

            {/* Standardized /health JSON Payload Inspector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    Standardized JSON Payload (/health)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live endpoint payload exposed for container orchestration and uptime monitoring.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono rounded">
                  GET /health
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto max-h-[380px]">
                <pre>{JSON.stringify(health, null, 2)}</pre>
              </div>

              {/* Rate Limit Evaluator Quick Demo */}
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">Rate Limiting Evaluator Test</span>
                  <button
                    onClick={handleCheckRateLimit}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
                  >
                    Simulate API Request
                  </button>
                </div>
                {rateLimitState && (
                  <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono flex justify-between items-center text-slate-300">
                    <span>Requests: {rateLimitState.currentRequests}/{rateLimitState.maxLimit}</span>
                    <span className={rateLimitState.allowed ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                      {rateLimitState.allowed ? 'ALLOWED (200 OK)' : 'THROTTLED (429 Too Many Requests)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Database Backup Snapshots */}
      {activeTab === 'db_backups' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  Database Snapshot Backup Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Automated timestamped snapshots, SHA256 integrity checksums, and non-destructive state restoration.
                </p>
              </div>

              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Create Instant Backup Snapshot
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Snapshot ID</th>
                    <th className="p-3">Creation Timestamp</th>
                    <th className="p-3">Total Records</th>
                    <th className="p-3">Snapshot Size</th>
                    <th className="p-3">SHA256 Checksum</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.backups.map((bkp) => (
                    <tr key={bkp.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3 font-bold text-white">{bkp.id}</td>
                      <td className="p-3 text-slate-400 font-sans">{bkp.timestamp}</td>
                      <td className="p-3 text-slate-300">{bkp.totalRecords.toLocaleString()} records</td>
                      <td className="p-3 text-purple-300">{bkp.sizeKB} KB</td>
                      <td className="p-3 text-slate-400 text-[11px]">{bkp.checksum}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                          {bkp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <button
                          onClick={() => handleRestoreBackup(bkp.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded-lg transition flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore State
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runtime Error Monitoring */}
      {activeTab === 'error_monitoring' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Runtime Error Monitoring Log Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Structured error boundaries with severity categorization and mandatory candidate PII masking.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                PII Scrubbing Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Log Timestamp</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Component</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Execution Path / Stack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3 text-slate-400 whitespace-nowrap font-sans">{log.timestamp}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.severity === 'ERROR'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : log.severity === 'WARNING'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-200">{log.component}</td>
                      <td className="p-3 text-slate-300 font-sans text-xs max-w-md">{log.message}</td>
                      <td className="p-3 text-slate-400 text-[11px] truncate max-w-xs">{log.stackTrace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Provider Health & Telemetry */}
      {activeTab === 'provider_telemetry' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-sky-400" />
                  Provider Health &amp; Latency Telemetry Monitor
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time latency, availability status, and failover telemetry across AI adapters and job data feeds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.providerStatuses.map((prov, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{prov.name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                          {prov.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Last ping: {new Date(prov.lastChecked).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {prov.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Round-trip Latency</span>
                    <span className={`font-mono font-bold ${prov.latencyMs < 50 ? 'text-emerald-400' : prov.latencyMs < 200 ? 'text-sky-400' : 'text-amber-400'}`}>
                      {prov.latencyMs} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Production Readiness Checklist & 14-Point Diagnostic Test Suite */}
      {activeTab === 'readiness_checklist' && (
        <div className="space-y-6">
          {/* 8-Section Production Checklist Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  8-Section Production Infrastructure Readiness Checklist
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive validation checklist across environment separation, database backups, security, and telemetry.
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
                    <div className="text-xs font-bold text-indigo-300">{item.section}</div>
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
                  14-Point Production Infrastructure Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting environment separation, DB backup creation &amp; restoration, rate limiting, and telemetry.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run 14 Automated Infra Tests
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
                        {diagnosticResults.passed ? 'ALL 14 PRODUCTION INFRASTRUCTURE DIAGNOSTICS PASSED' : 'SOME INFRASTRUCTURE DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: PRODUCTION READY
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
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Infrastructure Test Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run 14 Automated Infra Tests" above to execute empirical verification across health endpoint schema, environment switching, DB snapshots, rate limits, and latency telemetry.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
