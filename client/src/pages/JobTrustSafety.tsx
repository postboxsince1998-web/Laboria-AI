import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CandidateProfile,
  JobOpening,
  JobSafetyAnalysis,
  ConcernTier,
  UserJobReport,
  ReportCategory,
  ModerationCase
} from '../types';
import { seedJobs } from '../data/seedData';
import { JobTrustSafetyService } from '../services/jobTrustSafetyService';
import { runJobTrustSafetyEngineTests, JobTrustSafetyTestReport } from '../services/jobTrustSafetyEngineTests';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Layers,
  Flag,
  Lock,
  Globe,
  DollarSign,
  Briefcase,
  HelpCircle,
  Clock,
  Archive,
  Info
} from 'lucide-react';

interface JobTrustSafetyProps {
  candidate: CandidateProfile;
}

type TabType = 'auditor' | 'reports' | 'moderation' | 'signals';

export const JobTrustSafety: React.FC<JobTrustSafetyProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('auditor');
  const [selectedJobId, setSelectedJobId] = useState<string>(seedJobs[0].id);
  const [currentAnalysis, setCurrentAnalysis] = useState<JobSafetyAnalysis>(() =>
    JobTrustSafetyService.analyzeJobSafety(seedJobs[0])
  );

  const [moderationCases, setModerationCases] = useState<ModerationCase[]>(() =>
    JobTrustSafetyService.getModerationCases()
  );

  // Report Job Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>('Suspicious');
  const [reportDescription, setReportDescription] = useState('');
  const [reportEvidenceUrl, setReportEvidenceUrl] = useState('');

  // Test Suite Modal State
  const [testReport, setTestReport] = useState<JobTrustSafetyTestReport | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    refreshAnalysis();
  }, [selectedJobId]);

  const refreshAnalysis = () => {
    const target = seedJobs.find((j) => j.id === selectedJobId) || seedJobs[0];
    const analysis = JobTrustSafetyService.analyzeJobSafety(target);
    setCurrentAnalysis(analysis);
    setModerationCases(JobTrustSafetyService.getModerationCases());
  };

  // Submit Job Report
  const handleSubmitReport = () => {
    if (!reportDescription) {
      alert('Please enter a description of why you are reporting this job.');
      return;
    }

    const target = seedJobs.find((j) => j.id === selectedJobId) || seedJobs[0];
    JobTrustSafetyService.submitJobReport(
      candidate,
      target.id,
      target.title,
      target.company,
      reportCategory,
      reportDescription,
      reportEvidenceUrl
    );

    refreshAnalysis();
    setIsReportModalOpen(false);
    setReportDescription('');
    setReportEvidenceUrl('');
    alert(`Thank you for reporting. Your report has been archived in the Evidence Vault under anonymized ID "${JobTrustSafetyService.maskReporterPrivacy(candidate.id)}".`);
  };

  // Moderator Action Handler
  const handleResolveCase = (caseId: string, action: 'Approved' | 'Suspended' | 'Warning Issued' | 'Escalated') => {
    JobTrustSafetyService.resolveModerationCase(caseId, action);
    refreshAnalysis();
  };

  // Run Automated Test Suite
  const handleRunTests = () => {
    const report = runJobTrustSafetyEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  const getConcernBadgeVariant = (tier: ConcernTier) => {
    switch (tier) {
      case 'Low concern':
        return 'success';
      case 'Needs review':
        return 'info';
      case 'Potential concern':
        return 'warning';
      case 'High concern':
        return 'match-low';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card glow className="bg-gradient-to-r from-gray-900 via-brand-950/50 to-gray-900 border-brand-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white font-display">Job Trust & Safety System</h1>
                  <Badge variant="info">8 Signal Detectors</Badge>
                </div>
                <p className="text-gray-400 text-xs">
                  Automated suspicious pattern detection layer, 4 evidence-based concern tiers, and candidate-focused report workflow.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-gray-950/90 border border-gray-800 p-2 rounded-2xl flex items-center gap-2 text-xs font-mono">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">Reporter Privacy:</span>
              <strong className="text-emerald-400 font-bold">100% Anonymized</strong>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                icon={<Flag className="w-4 h-4" />}
              >
                Report a Job
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunTests}
                icon={<Sparkles className="w-4 h-4 text-brand-400" />}
              >
                Run Step 23 Tests
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Fair Evidence Policy Callout */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white font-display">
              Fair Evidence & Anti-False-Positive Policy
            </h4>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Laboria AI does not automatically declare a company fraudulent without sufficient empirical proof. Postings with minor ambiguities or unverified domains are classified as <strong className="text-amber-300 font-mono">Needs review</strong> or <strong className="text-amber-400 font-mono">Potential concern</strong> to preserve fair platform access for legitimate hiring managers.
            </p>
          </div>
        </div>
      </Card>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto text-xs">
        {[
          { id: 'auditor', label: 'Real-Time Job Safety Auditor', icon: ShieldCheck },
          { id: 'moderation', label: `Evidence Vault & Moderation Queue (${moderationCases.length})`, icon: Archive },
          { id: 'signals', label: '8 Suspicious Pattern Signals Guide', icon: FileWarning }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-brand-500 text-brand-300 bg-brand-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REAL-TIME AUDITOR */}
      {activeTab === 'auditor' && (
        <div className="space-y-6 text-xs">
          {/* Job Selector Selector */}
          <Card>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 w-full md:w-auto">
                <label className="text-gray-300 font-semibold block text-xs">Select Job Opening to Analyze</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full md:w-96 bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-brand-500"
                >
                  {seedJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-gray-400 text-[11px] font-mono uppercase block">Platform Trust Score</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-display">
                    {currentAnalysis.overallTrustScore}%
                  </span>
                </div>
                <Badge variant={getConcernBadgeVariant(currentAnalysis.concernTier)} className="py-1 px-3 text-xs">
                  {currentAnalysis.concernTier}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Analysis Results Card */}
          <Card glow className="space-y-4">
            <div>
              <span className="text-gray-400 font-mono text-[11px] block">Job Title & Employer:</span>
              <h3 className="text-lg font-bold text-white font-display">
                {currentAnalysis.jobTitle} at {currentAnalysis.companyName}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-brand-400 font-mono font-bold text-[11px] uppercase block">
                Evidence Rationale & Reasoning Explanation
              </span>
              <p className="text-gray-200 text-xs leading-relaxed">{currentAnalysis.reasoningExplanation}</p>
            </div>

            {/* Detected Safety Signals Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-400" /> Detected Safety Signal Flags ({currentAnalysis.signalsDetected.length})
              </h4>

              {currentAnalysis.signalsDetected.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentAnalysis.signalsDetected.map((sig, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{sig.signalType}</span>
                        <Badge variant={sig.severity === 'Critical' ? 'match-low' : sig.severity === 'High' ? 'warning' : 'info'}>
                          {sig.severity} Severity
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-[11px]">{sig.description}</p>
                      {sig.evidenceSnippet && (
                        <p className="text-gray-500 font-mono text-[10px]">Snippet: {sig.evidenceSnippet}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <span className="font-bold text-emerald-300 text-xs block">Zero Suspicious Signal Flags Detected</span>
                  <p className="text-emerald-200/80 text-[11px]">
                    Posting features verified corporate entity, standard application links, and clean job details.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(true)}
                icon={<Flag className="w-4 h-4 text-amber-400" />}
              >
                Report This Job Opening
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: EVIDENCE VAULT & MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Archive className="w-4 h-4 text-brand-400" /> Evidence Vault & Moderation Queue
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Review archived job snapshots, user report tickets, and execute moderator enforcement actions.
              </p>
            </div>
            <Badge variant="info">{moderationCases.length} Active Moderation Tickets</Badge>
          </div>

          <div className="space-y-4">
            {moderationCases.map((mCase) => (
              <Card key={mCase.id} className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white font-display">{mCase.jobTitle}</h4>
                      <Badge variant={getConcernBadgeVariant(mCase.concernTier)}>{mCase.concernTier}</Badge>
                      <Badge variant={mCase.status === 'Approved' ? 'success' : mCase.status === 'Suspended' ? 'match-low' : 'warning'}>
                        {mCase.status}
                      </Badge>
                    </div>
                    <p className="text-brand-300 font-semibold text-xs mt-0.5">Employer: {mCase.companyName}</p>
                  </div>

                  {/* Moderator Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveCase(mCase.id, 'Approved')}
                    >
                      Approve Job
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveCase(mCase.id, 'Warning Issued')}
                    >
                      Issue Warning
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolveCase(mCase.id, 'Suspended')}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Suspend Posting
                    </Button>
                  </div>
                </div>

                {/* Evidence Snapshot Container */}
                <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <span className="text-gray-400 font-mono font-bold text-[11px] uppercase block">
                    Archived Evidence Snapshot:
                  </span>
                  <p className="text-gray-300 text-xs italic font-mono bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                    "{mCase.evidenceSnapshot.jobDescription.slice(0, 200)}..."
                  </p>

                  <div className="flex items-center gap-4 text-gray-400 font-mono text-[11px] pt-1">
                    <span>Signals Flagged: <strong className="text-white">{mCase.evidenceSnapshot.detectedSignalsCount}</strong></span>
                    <span>User Reports: <strong className="text-white">{mCase.evidenceSnapshot.userReportCount}</strong></span>
                    <span>Snapshot Date: <strong className="text-white">{mCase.evidenceSnapshot.snapshotDate}</strong></span>
                  </div>
                </div>

                {/* User Reports List with Anonymized Reporter IDs */}
                {mCase.reports.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-200 text-xs block">User Report Tickets (Reporter Identities Masked):</span>
                    {mCase.reports.map((rep) => (
                      <div key={rep.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5" /> {rep.maskedReporterId} ({rep.category})
                          </span>
                          <span className="text-gray-500">{rep.createdAt}</span>
                        </div>
                        <p className="text-gray-300 text-xs">{rep.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 8 SUSPICIOUS SIGNALS GUIDE */}
      {activeTab === 'signals' && (
        <div className="space-y-4 text-xs">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-brand-400" /> 8 Suspicious Pattern Signal Reference Guide
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: '1. Missing Company Information', severity: 'Medium', desc: 'Job posting lacks corporate entity name, company description, or verifiable headquarters address.' },
              { title: '2. Suspicious URLs & Webmail', severity: 'High', desc: 'Unencrypted HTTP links, URL shorteners (bit.ly), or free webmail contact handles (@gmail/@yahoo).' },
              { title: '3. Unusual Contact Requests', severity: 'High', desc: 'Recruiter requests applicants to bypass official application channels via Telegram/WhatsApp handles.' },
              { title: '4. Requests for Money', severity: 'Critical', desc: 'Explicit request for upfront training fees, equipment deposits, or registration charges.' },
              { title: '5. Requests for Sensitive Info', severity: 'Critical', desc: 'Demanding SSN, credit card numbers, or bank account passwords upfront prior to interview.' },
              { title: '6. Duplicate Job Postings', severity: 'Medium', desc: 'Identical job posting title and company posted across multiple listing IDs.' },
              { title: '7. Inconsistent Job Details', severity: 'Low', desc: 'Senior Title indicating 0 YOE requirement, or Entry Title requiring 15 YOE.' },
              { title: '8. Unverified Employer', severity: 'Low', desc: 'Recruiter domain or corporate account pending official verification check.' }
            ].map((sig, idx) => (
              <Card key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm font-display">{sig.title}</h4>
                  <Badge variant={sig.severity === 'Critical' ? 'match-low' : sig.severity === 'High' ? 'warning' : 'info'}>
                    {sig.severity} Severity
                  </Badge>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{sig.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: REPORT JOB FORM */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Job Opening — Trust & Safety"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <span className="text-gray-400 font-mono text-[11px] block">Target Job Opening:</span>
            <h4 className="font-bold text-white text-sm">{currentAnalysis.jobTitle} at {currentAnalysis.companyName}</h4>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Report Category *</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value as ReportCategory)}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            >
              <option value="Suspicious">Suspicious Pattern / Contact Handle</option>
              <option value="Fake">Fake Job / Non-Existent Company</option>
              <option value="Duplicate">Duplicate Listing</option>
              <option value="Misleading">Misleading Job Details / Location</option>
              <option value="Payment request">Payment / Upfront Deposit Request</option>
              <option value="Wrong information">Incorrect Information</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Detailed Rationale & Evidence *</label>
            <textarea
              rows={3}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe why this job posting violates platform trust & safety guidelines."
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Evidence URL or Chat Snippet (Optional)</label>
            <input
              type="text"
              value={reportEvidenceUrl}
              onChange={(e) => setReportEvidenceUrl(e.target.value)}
              placeholder="https://evidence.laboria.ai/screenshot.png"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2 text-emerald-300 font-mono text-[11px]">
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <span>Reporter Privacy Guarantee: Your personal contact info is anonymized as <strong>{JobTrustSafetyService.maskReporterPrivacy(candidate.id)}</strong>.</span>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSubmitReport} icon={<Flag className="w-3.5 h-3.5" />}>
              Submit Job Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: TEST REPORT */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Step 23: Job Trust & Safety System Test Report"
      >
        {testReport && (
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-gray-400">Total Executed: {testReport.totalTests}</span>
                <div className="text-base font-bold text-white font-display mt-0.5">
                  {testReport.passCount} PASSED / {testReport.failCount} FAILED
                </div>
              </div>
              <Badge variant={testReport.passed ? 'success' : 'match-low'}>
                {testReport.passed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
              </Badge>
            </div>

            <div className="space-y-2">
              {testReport.details.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Test #{idx + 1}: {t.name}</span>
                    <Badge variant={t.status === 'PASS' ? 'success' : 'match-low'}>{t.status}</Badge>
                  </div>
                  <p className="text-gray-400 text-[11px]">{t.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
