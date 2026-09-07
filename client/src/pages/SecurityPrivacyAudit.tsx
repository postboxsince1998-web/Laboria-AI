import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  AlertTriangle,
  Zap,
  CheckCircle2,
  FileCheck,
  UserCheck,
  Clock,
  Filter,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SecurityPrivacyService } from '../services/securityPrivacyService';
import { runSecurityPrivacyEngineTests, TestResultItem } from '../services/securityPrivacyEngineTests';

export const SecurityPrivacyAudit: React.FC = () => {
  const [hasConsentToggle, setHasConsentToggle] = useState(false);
  const [xssInputText, setXssInputText] = useState('<script>alert("hack")</script><img src=x onerror=alert(1) />');
  const [pathInputText, setPathInputText] = useState('../../../etc/passwd');
  const [rateLimitCounter, setRateLimitCounter] = useState(0);

  const [testResultsModalOpen, setTestResultsModalOpen] = useState(false);
  const [testSuiteOutput, setTestSuiteOutput] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  const complianceReport = SecurityPrivacyService.getComplianceReport();
  const auditLogs = SecurityPrivacyService.getAuditLogs();

  // Test candidate data
  const sampleCandidate = {
    id: 'cand_9042',
    name: 'Jane Candidate',
    email: 'jane.candidate@laboria.ai',
    phone: '+91-9876543210',
    hasConsentedPrivacy: hasConsentToggle,
    skills: ['TypeScript', 'Security Architecture', 'React']
  };

  const employerAccessResult = SecurityPrivacyService.checkEmployerAccess('emp_demo_202', sampleCandidate);

  // Sanitized outputs
  const xssCheck = SecurityPrivacyService.sanitizeHTMLInput(xssInputText);
  const pathCheck = SecurityPrivacyService.validateFilePath(pathInputText);

  const handleBurstRateLimit = () => {
    const status = SecurityPrivacyService.checkRateLimit('client_simulated_ip', 5, 10000);
    setRateLimitCounter(prev => prev + 1);
  };

  const handleTestRun = () => {
    const res = runSecurityPrivacyEngineTests();
    setTestSuiteOutput(res);
    setTestResultsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="success" className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Security & Privacy Audit System
              </Badge>
              <span className="text-xs text-slate-400">Step 28 Module</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Security Controls & Privacy Engine
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed">
              Enforces Role-Based Access Control (RBAC), 1:1 candidate self-access boundaries, automatic PII masking, input XSS sanitization, rate limiting, and immutable audit logging with <span className="text-emerald-300 font-semibold">zero unmasked credential exposure</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleTestRun} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Run 12-Point Diagnostics
            </Button>
          </div>
        </div>

        {/* Audit Compliance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">PII Protection Score:</span>
            <span className="text-emerald-400 font-extrabold text-lg">{complianceReport.piiProtectionScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 block">RBAC Enforcement:</span>
            <span className="text-cyan-300 font-extrabold text-lg">{complianceReport.rbacEnforcementScore}/100</span>
          </div>
          <div>
            <span className="text-slate-400 block">Rate Limiter Status:</span>
            <span className="text-indigo-300 font-extrabold text-lg">Active (Token Bucket)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Audit Log Entries:</span>
            <span className="text-amber-300 font-extrabold text-lg">{complianceReport.totalSecurityEventsLogged} Logged</span>
          </div>
        </div>
      </div>

      {/* PII MASKING & PRIVACY CONSENT SIMULATOR */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Candidate PII Masking & Privacy Consent Engine</h2>
              <Badge variant="purple">Employer Consent Rule</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Employers strictly see anonymized profile data until candidate grants explicit privacy consent.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Candidate Consent State:</span>
            <Button
              variant={hasConsentToggle ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setHasConsentToggle(!hasConsentToggle)}
              className="text-xs flex items-center gap-1.5 min-h-[32px]"
            >
              {hasConsentToggle ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
              {hasConsentToggle ? 'Consent Granted' : 'Consent Withheld (Default)'}
            </Button>
          </div>
        </div>

        {/* Employer View Result Box */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Employer View Output:</span>
              <Badge variant={employerAccessResult.allowed ? 'success' : 'warning'}>
                {employerAccessResult.reason}
              </Badge>
            </div>
            <Badge variant={hasConsentToggle ? 'success' : 'warning'}>
              {hasConsentToggle ? 'UNMASKED PII' : 'AUTOMATICALLY MASKED'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 block mb-1">Candidate Name:</span>
              <span className="text-white font-bold">{employerAccessResult.sanitizedData.name}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 block mb-1">Email Address:</span>
              <span className="text-cyan-300 font-mono font-bold">{employerAccessResult.sanitizedData.email}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400 block mb-1">Phone Number:</span>
              <span className="text-indigo-300 font-mono font-bold">{employerAccessResult.sanitizedData.phone}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* INPUT SANITIZATION & PATH TRAVERSAL GUARD TEST BENCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* XSS Test Bench */}
        <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">XSS Script Injection Sanitizer</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">Test Malicious Input Payload:</label>
            <input
              type="text"
              value={xssInputText}
              onChange={e => setXssInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Sanitization Status:</span>
              <Badge variant={xssCheck.isSanitized ? 'warning' : 'success'}>
                {xssCheck.isSanitized ? 'XSS Vector Neutralized' : 'Clean Input'}
              </Badge>
            </div>
            <span className="text-slate-400 block pt-1">Safe Sanitized Output:</span>
            <p className="text-emerald-300 font-mono bg-slate-900 p-2 rounded border border-slate-800 break-all">
              {xssCheck.cleanText}
            </p>
          </div>
        </Card>

        {/* Path Traversal Test Bench */}
        <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Path Traversal Guard</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">Test Malicious File Path Payload:</label>
            <input
              type="text"
              value={pathInputText}
              onChange={e => setPathInputText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Path Security Check:</span>
              <Badge variant={pathCheck.isSafe ? 'success' : 'warning'}>
                {pathCheck.isSafe ? 'Safe Path' : 'Traversal Vector Blocked'}
              </Badge>
            </div>
            <span className="text-slate-400 block pt-1">Extracted Safe Filename:</span>
            <p className="text-cyan-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              {pathCheck.sanitizedName}
            </p>
          </div>
        </Card>
      </div>

      {/* RATE LIMITER TEST BENCH & IMMUTABLE AUDIT LOG VIEW */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Token Bucket Rate Limiter & Immutable Audit Trail</h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBurstRateLimit}
            className="text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Trigger Burst Requests ({rateLimitCounter})
          </Button>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Event Type</th>
                <th className="p-2.5">Actor Role</th>
                <th className="p-2.5">IP Address</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Sanitized Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auditLogs.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-slate-950/60">
                  <td className="p-2.5 font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2.5 font-bold text-cyan-300">{log.eventType}</td>
                  <td className="p-2.5">
                    <Badge variant={log.actorRole === 'Candidate' ? 'info' : 'purple'}>{log.actorRole}</Badge>
                  </td>
                  <td className="p-2.5 font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="p-2.5">
                    <Badge variant={log.actionStatus === 'SUCCESS' ? 'success' : log.actionStatus === 'BLOCKED' ? 'warning' : 'info'}>
                      {log.actionStatus}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-slate-300">{log.sanitizedDetails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Diagnostics Test Results Modal */}
      {testResultsModalOpen && testSuiteOutput && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Step 28 Security & Privacy Audit Diagnostics</h3>
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

export default SecurityPrivacyAudit;
