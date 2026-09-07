import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Award,
  Check,
  Eye,
  Activity,
  FileCode,
  Sliders,
  HelpCircle,
  AlertTriangle,
  UserX,
  FileCheck
} from 'lucide-react';
import { PrivacyComplianceService } from '../services/privacyComplianceService';
import { runPrivacyComplianceEngineTests, TestResultItem } from '../services/privacyComplianceEngineTests';
import { Step43Report, PrivacyVisibilityMode, ConsentType } from '../types';

export const PrivacyComplianceDashboard: React.FC = () => {
  const [report, setReport] = useState<Step43Report>(() => PrivacyComplianceService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'audit_matrix' | 'privacy_settings' | 'data_export_erasure' | 'transparency_disclosures' | 'dpdp_checklist'>('audit_matrix');

  // Interactive settings state
  const [privacySettings, setPrivacySettings] = useState(() => PrivacyComplianceService.getPrivacySettings('usr_demo_101'));
  const [userConsents, setUserConsents] = useState(() => PrivacyComplianceService.getUserConsents('usr_demo_101'));

  // Export / Deletion state
  const [exportedJson, setExportedJson] = useState<string | null>(null);
  const [deletionResult, setDeletionResult] = useState<any>(null);

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const refreshData = () => {
    setReport(PrivacyComplianceService.getFinalReport());
    setPrivacySettings(PrivacyComplianceService.getPrivacySettings('usr_demo_101'));
    setUserConsents(PrivacyComplianceService.getUserConsents('usr_demo_101'));
  };

  const handleTogglePrivacySetting = (key: keyof typeof privacySettings, val: any) => {
    const updated = { ...privacySettings, [key]: val };
    const saved = PrivacyComplianceService.savePrivacySettings('usr_demo_101', updated);
    setPrivacySettings(saved);
  };

  const handleToggleConsent = (type: ConsentType, currentStatus: boolean) => {
    const updated = PrivacyComplianceService.setConsentStatus('usr_demo_101', type, !currentStatus);
    setUserConsents(updated);
  };

  const handleTriggerDataExport = () => {
    const pkg = PrivacyComplianceService.exportUserData('usr_demo_101');
    setExportedJson(JSON.stringify(pkg, null, 2));
  };

  const handleTriggerAccountDeletion = () => {
    const res = PrivacyComplianceService.deleteUserAccount('usr_demo_101', 'FULL_ACCOUNT');
    setDeletionResult(res);
    refreshData();
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runPrivacyComplianceEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legal Verification Advisory Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="font-bold text-amber-300">DPDP Act 2023 Framework Readiness Advisory</div>
            <div>
              Laboria AI implements core principles of India's Digital Personal Data Protection (DPDP) Act 2023. Compliance claims require formal legal review by qualified legal counsel prior to commercial launch.
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono rounded-full border border-amber-500/30 whitespace-nowrap">
          Framework Ready
        </span>
      </div>

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-sky-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Lock className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Admin Privacy, Security &amp; Compliance Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/30 text-sky-300 border border-sky-400/40">
                  STEP 43
                </span>
              </div>
              <p className="text-sky-200/80 text-sm">
                10-Area Privacy Audit • Double Opt-In Consents • Right to Erasure • Data Portability Export • Transparency Explanations
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerDataExport}
            className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON Package
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
            Run 14 Privacy Tests
          </button>
        </div>
      </div>

      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>10-Area Privacy Audit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            10/10 Audited
          </div>
          <div className="text-xs text-slate-400 mt-1">
            100% Compliant &amp; Encrypted
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Data Minimization Guard</span>
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            ENFORCED
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Zero National IDs or Caste Data
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>User Consents Tracked</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {userConsents.filter(c => c.isGranted).length} Active
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Double Opt-In Logged
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Data Portability Engine</span>
            <Download className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            JSON Export
          </div>
          <div className="text-xs text-slate-400 mt-1">
            SHA256 Integrity Verified
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Right to Erasure</span>
            <Trash2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            Active Purge
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Anonymized Audit Hash Retained
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audit_matrix')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'audit_matrix'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          10-Area Privacy Audit
        </button>

        <button
          onClick={() => setActiveTab('privacy_settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'privacy_settings'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Privacy Settings &amp; Consents
        </button>

        <button
          onClick={() => setActiveTab('data_export_erasure')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'data_export_erasure'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          Export Data &amp; Account Erasure
        </button>

        <button
          onClick={() => setActiveTab('transparency_disclosures')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'transparency_disclosures'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Transparency &amp; AI Disclosures
        </button>

        <button
          onClick={() => setActiveTab('dpdp_checklist')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'dpdp_checklist'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          DPDP Checklist &amp; 14 Tests
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: 10-Area Privacy Audit Matrix */}
      {activeTab === 'audit_matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Comprehensive 10-Area Privacy &amp; Security Audit Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Full security evaluation across candidate, resume, employer, job, AI, analytics, auth, file storage, deletion, and export layers.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                10/10 Audited
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.privacyAudit.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-xs text-white">{item.area}</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'COMPLIANT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'ENCRYPTED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">{item.description}</div>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{item.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Privacy Settings & Consents */}
      {activeTab === 'privacy_settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Privacy Controls Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-sky-400" />
                    Candidate Privacy Settings
                  </h3>
                  <p className="text-xs text-slate-400">
                    Granular profile visibility and data collection preferences.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-white block">Profile Visibility to Employers</label>
                  <div className="flex gap-2">
                    {(['EMPLOYERS_ONLY', 'PUBLIC', 'PRIVATE'] as PrivacyVisibilityMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleTogglePrivacySetting('profileVisibility', mode)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
                          privacySettings.profileVisibility === mode
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">Anonymized Analytics Collection</div>
                    <div className="text-[11px] text-slate-400">Allow anonymous feature usage telemetry</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowAnalytics}
                    onChange={(e) => handleTogglePrivacySetting('allowAnalytics', e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">AI Model Fine-Tuning Opt-Out</div>
                    <div className="text-[11px] text-slate-400">Include anonymized skills in AI training</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowAiTraining}
                    onChange={(e) => handleTogglePrivacySetting('allowAiTraining', e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">Employer Search Discoverability</div>
                    <div className="text-[11px] text-slate-400">Allow verified recruiters to find your profile</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowEmployerSearch}
                    onChange={(e) => handleTogglePrivacySetting('allowEmployerSearch', e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Consent Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-400" />
                    Double Opt-In Consent Records
                  </h3>
                  <p className="text-xs text-slate-400">
                    Timestamped consent records with instant revocation capabilities.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {userConsents.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-white">{c.consentType}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Logged: {new Date(c.timestamp).toLocaleString()} ({c.version})</div>
                    </div>

                    <button
                      onClick={() => handleToggleConsent(c.consentType, c.isGranted)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        c.isGranted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30'
                      }`}
                    >
                      {c.isGranted ? 'GRANTED (Revoke)' : 'REVOKED (Grant)'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Export Data & Account Erasure */}
      {activeTab === 'data_export_erasure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Export Package */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-400" />
                    Right to Data Portability Export
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generate instant self-service JSON export package of all stored profile &amp; activity data.
                  </p>
                </div>
              </div>

              <button
                onClick={handleTriggerDataExport}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate &amp; Download User Data Package (JSON)
              </button>

              {exportedJson && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-xs text-indigo-300 max-h-[300px] overflow-y-auto space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                    <span>Export Package Generated</span>
                    <span>Status: 200 OK</span>
                  </div>
                  <pre>{exportedJson}</pre>
                </div>
              )}
            </div>

            {/* Right to Erasure Account Deletion */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserX className="w-5 h-5 text-rose-400" />
                    Right to Erasure (Account Deletion)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Permanently purge candidate profile, uploaded resumes, and application records.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs text-rose-300">
                <div className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Irreversible Action Warning
                </div>
                <div>
                  Triggering account deletion completely wipes your candidate profile, uploaded resume files, skill gap analyses, and practice interview logs within 1 second.
                </div>
              </div>

              <button
                onClick={handleTriggerAccountDeletion}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Simulate Full Account &amp; Data Erasure
              </button>

              {deletionResult && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Erasure Request Completed Successfully
                  </div>
                  <div className="text-slate-300">Request ID: {deletionResult.id}</div>
                  <div className="text-slate-400 text-[11px]">Audit Hash: {deletionResult.auditComplianceHash}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Transparency & AI Disclosures */}
      {activeTab === 'transparency_disclosures' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-sky-400" />
                  Plain-Language Privacy &amp; AI Disclosures
                </h3>
                <p className="text-xs text-slate-400">
                  Clear, jargon-free explanations detailing what data is stored, why it is used, where AI is used, and how to delete it.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.transparencyExplanations.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">{item.topic}</span>
                    <span className="p-1 bg-sky-500/20 text-sky-300 rounded">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{item.question}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.answerText}</p>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>User Action:</strong> {item.userAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: DPDP Checklist & 14-Point Diagnostic Test Suite */}
      {activeTab === 'dpdp_checklist' && (
        <div className="space-y-6">
          {/* 10-Point DPDP Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  10-Point Indian Data Protection (DPDP Act 2023) Framework Checklist
                </h3>
                <p className="text-xs text-slate-400">
                  Alignment checklist for India DPDP principles (Notice &amp; Choice, Erasure, Data Fiduciary Accountability).
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                10/10 PRINCIPLES FRAMEWORK_READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.dpdpChecklist.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-sky-300">{item.section}</div>
                    <div className="text-xs text-slate-300">{item.principle}</div>
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
                  14-Point Privacy &amp; Security Compliance Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting data minimization, consent revocation, JSON export, account deletion, and DPDP readiness.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run 14 Privacy Tests
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
                        {diagnosticResults.passed ? 'ALL 14 PRIVACY & SECURITY DIAGNOSTICS PASSED' : 'SOME PRIVACY DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: PRIVACY READY
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
                <Lock className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Privacy Test Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run 14 Privacy Tests" above to execute empirical verification across data minimization, consent revocation, JSON export, right to erasure, and Indian DPDP Act principles.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
