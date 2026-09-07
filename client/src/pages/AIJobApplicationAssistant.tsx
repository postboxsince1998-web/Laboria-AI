import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile, JobOpening, JobApplicationPrepBundle, ResumeVersion } from '../types';
import { seedJobs } from '../data/seedData';
import { JobApplicationAssistantService } from '../services/jobApplicationAssistantService';
import { SavedResumeVersionService } from '../services/resumeBuilderService';
import { runJobApplicationAssistantEngineTests, JobApplicationAssistantTestReport } from '../services/jobApplicationAssistantEngineTests';
import {
  FileCheck,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  Download,
  ExternalLink,
  MessageSquare,
  Compass,
  FileText,
  Briefcase,
  Bot,
  MessageSquareCode,
  Calendar,
  CheckSquare,
  HelpCircle,
  Plus,
  Target
} from 'lucide-react';


interface AIJobApplicationAssistantProps {
  candidate: CandidateProfile;
}

export const AIJobApplicationAssistant: React.FC<AIJobApplicationAssistantProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Selected Target Job State
  const [selectedJob, setSelectedJob] = useState<JobOpening>(seedJobs[0]);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [prepBundle, setPrepBundle] = useState<JobApplicationPrepBundle | null>(null);

  // Active Tab / View: 'checklist' | 'coverletter' | 'questions' | 'documents'
  const [activeSection, setActiveSection] = useState<'checklist' | 'coverletter' | 'questions' | 'documents'>('checklist');

  // Copy Feedback Toast
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Diagnostics Suite Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testReport, setTestReport] = useState<JobApplicationAssistantTestReport | null>(null);

  // Load candidate resume versions & prep bundle on job change
  useEffect(() => {
    const loadedVersions = SavedResumeVersionService.getVersions(candidate);
    setResumeVersions(loadedVersions);
    const bundle = JobApplicationAssistantService.generatePrepBundle(selectedJob, candidate, loadedVersions);
    setPrepBundle(bundle);
  }, [selectedJob, candidate]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyNotice(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopyNotice(null), 2500);
  };

  const handleMarkSubmitted = () => {
    if (!prepBundle) return;
    JobApplicationAssistantService.markAsSubmitted(prepBundle, selectedJob, candidate, 'Applied');
    // Refresh prep bundle
    const updated = JobApplicationAssistantService.generatePrepBundle(selectedJob, candidate, resumeVersions);
    setPrepBundle(updated);
    setCopyNotice(`Successfully tracked application for ${selectedJob.company} in Application Tracker!`);
    setTimeout(() => setCopyNotice(null), 3000);
  };

  const handleRunDiagnostics = () => {
    const report = runJobApplicationAssistantEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <FileCheck className="w-3.5 h-3.5" /> Step 18: AI Job Application Assistant
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              AI Job Application Assistant
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Prepare, audit eligibility, draft cover letters & track applications. <strong className="text-brand-300">No automatic submissions without candidate consent.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunDiagnostics}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Run 12-Point Tests
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/applications')}
              icon={<Briefcase className="w-4 h-4" />}
            >
              Application Tracker
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Notice */}
      {copyNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" /> {copyNotice}
        </div>
      )}

      {/* Target Job Selector & Job Overview Card */}
      <Card glow>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="w-full md:w-2/3 space-y-2">
            <label className="text-gray-400 font-semibold block">Select Target Opportunity to Prepare Application For:</label>
            <select
              value={selectedJob.id}
              onChange={(e) => {
                const found = seedJobs.find((j) => j.id === e.target.value);
                if (found) setSelectedJob(found);
              }}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-sm focus:ring-2 focus:ring-brand-500"
            >
              {seedJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company} ({typeof j.location === 'string' ? j.location : (j.location as any)?.city || 'Bengaluru'})
                </option>

              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-3 rounded-xl shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-mono">Job Match Score</span>
              <div className="text-2xl font-extrabold text-brand-300 font-display">
                {prepBundle?.matchScore}%
              </div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 uppercase font-mono">Status</span>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                {prepBundle?.isSubmitted ? 'Submitted' : 'Preparing'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Application Preparation Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {[
            { id: 'checklist', label: '📋 Application Checklist' },
            { id: 'coverletter', label: '✉️ Tailored Cover Letter' },
            { id: 'questions', label: '❓ Common Application Questions' },
            { id: 'documents', label: '📄 Required Documents & Eligibility' }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeSection === sec.id
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: APPLICATION CHECKLIST & SUBMISSION CONTROL */}
      {activeSection === 'checklist' && prepBundle && (
        <div className="space-y-6">
          <Card glow>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" /> Mandatory Application Checklist
                  </h3>
                  <p className="text-gray-400 mt-0.5">
                    Complete all preparation steps before manually submitting your application on the employer portal.
                  </p>
                </div>
                <Badge variant={prepBundle.isSubmitted ? 'success' : 'warning'}>
                  {prepBundle.isSubmitted ? '✓ Application Tracked' : '○ Ready for Submission'}
                </Badge>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {prepBundle.prepChecklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                      item.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${item.isCompleted ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {item.isCompleted ? '✓' : '○'}
                      </span>
                      <div>
                        <span className="font-bold text-sm block">{item.label}</span>
                        <span className="text-[11px] text-gray-400">{item.helpTip}</span>
                      </div>
                    </div>

                    {item.id === 'chk_1' && (
                      <Button size="sm" variant="outline" onClick={() => navigate('/resume-builder')}>
                        Edit Resume
                      </Button>
                    )}
                    {item.id === 'chk_4' && (
                      <Button size="sm" variant="outline" onClick={() => setActiveSection('coverletter')}>
                        View Cover Letter
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Manual Submission Tracking Control */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-950 p-4 rounded-xl border border-brand-500/30">
                <div>
                  <span className="font-bold text-white text-sm block">Manual Application Submission Control</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Laboria AI strictly enforces zero auto-submissions. Click below when you submit on employer portal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedJob.applyUrl && (
                    <a
                      href={selectedJob.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-gray-300 hover:text-white border border-gray-800 font-semibold text-xs transition"
                    >
                      Apply on Employer Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <Button
                    variant={prepBundle.isSubmitted ? 'secondary' : 'accent'}
                    size="sm"
                    onClick={handleMarkSubmitted}
                    disabled={prepBundle.isSubmitted}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  >
                    {prepBundle.isSubmitted ? 'Already Tracked in Tracker' : 'Mark Application as Submitted'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 5-Module Connections Hub */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" /> Connected Laboria AI Modules Hub
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <button
                onClick={() => navigate('/resume-builder')}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-brand-500 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-brand-400 font-bold">
                  <FileText className="w-4 h-4" /> Resume Builder
                </div>
                <p className="text-[11px] text-gray-400">Recommended: {prepBundle.recommendedResumeVersionName}</p>
              </button>

              <button
                onClick={() => navigate('/discover')}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-emerald-500 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Target className="w-4 h-4" /> Job Matcher
                </div>
                <p className="text-[11px] text-gray-400">Match score: {prepBundle.matchScore}%</p>
              </button>

              <button
                onClick={() => navigate('/applications')}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-purple-500 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Briefcase className="w-4 h-4" /> Application Tracker
                </div>
                <p className="text-[11px] text-gray-400">Track status & timeline</p>
              </button>

              <button
                onClick={() => navigate('/interview-prep')}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-blue-500 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <MessageSquareCode className="w-4 h-4" /> Interview Coach
                </div>
                <p className="text-[11px] text-gray-400">Practice questions for {selectedJob.title}</p>
              </button>

              <button
                onClick={() => navigate('/mentor')}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-amber-500 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Bot className="w-4 h-4" /> AI Mentor
                </div>
                <p className="text-[11px] text-gray-400">Ask for application advice</p>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 2: TAILORED COVER LETTER DRAFT */}
      {activeSection === 'coverletter' && prepBundle && (
        <Card>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" /> Job-Specific Cover Letter Draft
                </h3>
                <p className="text-gray-400 mt-0.5">
                  Factual, professional cover letter draft tailored to {selectedJob.company}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyText(prepBundle.coverLetterDraft, 'Cover Letter Draft')}
                  icon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy Cover Letter
                </Button>
              </div>
            </div>

            <textarea
              rows={12}
              value={prepBundle.coverLetterDraft}
              onChange={(e) => setPrepBundle({ ...prepBundle, coverLetterDraft: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-white font-mono leading-relaxed"
            />
          </div>
        </Card>
      )}

      {/* SECTION 3: COMMON APPLICATION QUESTIONS */}
      {activeSection === 'questions' && prepBundle && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-400" /> Common Application & Screening Questions ({prepBundle.commonQuestions.length})
            </h3>
            <div className="space-y-4 text-xs">
              {prepBundle.commonQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm font-display flex items-center gap-2">
                      {q.question}
                      <Badge variant="purple" className="text-[10px]">{q.category}</Badge>
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyText(q.draftAnswer, 'Draft Answer')}
                      icon={<Copy className="w-3 h-3" />}
                    >
                      Copy Answer
                    </Button>
                  </div>

                  <p className="text-brand-300 font-semibold text-[11px] italic">
                    💡 Strategy Tip: {q.suggestedStrategy}
                  </p>

                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-200 font-medium">
                    {q.draftAnswer}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 4: REQUIRED DOCUMENTS & ELIGIBILITY AUDIT */}
      {activeSection === 'documents' && prepBundle && (
        <div className="space-y-6">
          {/* Missing Profile Details Warning if any */}
          {prepBundle.missingInformation.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs space-y-1">
              <h4 className="font-bold flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4" /> Missing Profile Information Detected
              </h4>
              <p className="text-[11px] text-gray-300">
                The following details are missing in your profile. Adding them ensures your job application is complete:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prepBundle.missingInformation.map((info) => (
                  <Badge key={info} variant="match-low">⚠ {info}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Eligibility Checklist */}
            <Card>
              <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Candidate Eligibility Checklist
              </h3>
              <div className="space-y-3">
                {prepBundle.eligibilityChecklist.map((el, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start gap-2.5">
                    <span className={`text-base font-bold ${el.met ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {el.met ? '✓' : '⚠'}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{el.criterion}</span>
                      <span className="text-gray-400 text-[11px]">{el.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Required Documents Audit */}
            <Card>
              <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-400" /> Required Documents Audit
              </h3>
              <div className="space-y-3">
                {prepBundle.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-white block">{doc.name}</span>
                      <span className="text-gray-400 text-[11px]">{doc.description}</span>
                    </div>
                    <Badge variant={doc.status === 'Ready' ? 'success' : 'match-mid'}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Diagnostic Test Suite Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 12-Point AI Job Application Assistant Test Suite"
      >
        <div className="space-y-4 text-xs">
          {testReport && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
              <span>Step 18 Application Assistant Suite: {testReport.passCount}/{testReport.totalTests} Passed</span>
              <Badge variant={testReport.passed ? 'success' : 'match-low'}>
                {testReport.passed ? 'ALL PASSED' : 'FAILED'}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            {testReport?.details.map((tr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Test #{idx + 1}: {tr.name}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.message}</p>
                </div>
                <Badge variant={tr.status === 'PASS' ? 'success' : 'match-low'}>
                  {tr.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
