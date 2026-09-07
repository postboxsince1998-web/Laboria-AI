import React, { useState } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Play,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Unlock,
  Plus,
  Send,
  Check,
  X,
  FileText,
  HelpCircle,
  Activity,
  Award,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { EmployerPilotService } from '../services/employerPilotService';
import { SavedEmployerPortalService, EmployerPortalService } from '../services/employerPortalService';
import { runEmployerPilotEngineTests, TestResultItem } from '../services/employerPilotEngineTests';
import {
  Step38Report,
  CandidateApplicationSummary,
  EmployerJobPost,
  PilotApplicationStatus,
  EmployerUser,
  EmployerRole
} from '../types';

export const EmployerPilotDashboard: React.FC = () => {
  const [report, setReport] = useState<Step38Report>(() => EmployerPilotService.getFinalReport());
  const [activeTab, setActiveTab] = useState<'workflow' | 'candidates' | 'jobs' | 'audit_logs' | 'diagnostics'>('workflow');

  // Application & Candidate states
  const [applications, setApplications] = useState<CandidateApplicationSummary[]>(() => SavedEmployerPortalService.getApplications());
  const [jobs, setJobs] = useState<EmployerJobPost[]>(() => EmployerPortalService.getJobs());
  const [selectedJobId, setSelectedJobId] = useState<string>(() => jobs[0]?.id || '');
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<CandidateApplicationSummary | null>(null);

  // Active Employer User / RBAC State
  const [currentUser, setCurrentUser] = useState<EmployerUser>(() => EmployerPortalService.getCurrentUser());

  // Diagnostics state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{ passed: boolean; results: TestResultItem[] } | null>(null);

  // New Job Post Form State
  const [showPostJobModal, setShowPostJobModal] = useState<boolean>(false);
  const [newJobTitle, setNewJobTitle] = useState<string>('');
  const [newJobLocation, setNewJobLocation] = useState<string>('Bengaluru, Karnataka, India');
  const [newJobMinExp, setNewJobMinExp] = useState<number>(3);
  const [newJobSkills, setNewJobSkills] = useState<string>('TypeScript, React, Node.js, PostgreSQL');

  const refreshData = () => {
    setReport(EmployerPilotService.getFinalReport());
    setApplications(SavedEmployerPortalService.getApplications());
    setJobs(EmployerPortalService.getJobs());
    setCurrentUser(EmployerPortalService.getCurrentUser());
  };

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const res = runEmployerPilotEngineTests();
      setDiagnosticResults(res);
      setIsRunningDiagnostics(false);
      refreshData();
    }, 500);
  };

  const handleRoleSwitch = (role: EmployerRole) => {
    const updated = EmployerPortalService.updateUserRole(role);
    setCurrentUser(updated);
    refreshData();
  };

  const handleShortlist = (appId: string) => {
    EmployerPilotService.shortlistCandidate(appId);
    refreshData();
  };

  const handleRequestContact = (appId: string) => {
    EmployerPilotService.requestCandidateContact(appId);
    refreshData();
  };

  const handleScheduleInterview = (appId: string) => {
    EmployerPilotService.scheduleInterview(appId, '2026-09-12', '14:00 IST', 'Technical Interview');
    refreshData();
  };

  const handleUpdateOutcome = (appId: string, status: PilotApplicationStatus) => {
    EmployerPilotService.updateCandidateOutcome(appId, status);
    refreshData();
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'POST_JOB');
    if (!rbac.permitted) {
      alert(rbac.reason || 'Unauthorized action.');
      return;
    }

    if (!newJobTitle.trim()) return;

    EmployerPortalService.postJob({
      title: newJobTitle,
      description: 'Pilot job post for verified candidate matching.',
      skills: newJobSkills.split(',').map(s => s.trim()),
      niceToHaveSkills: ['AWS', 'Docker'],
      minExperience: newJobMinExp,
      maxExperience: newJobMinExp + 4,
      educationRequired: 'Bachelor of Technology (B.Tech) in CS/IT',
      location: newJobLocation,
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryRange: { min: 1400000, max: 2400000, currency: 'INR' },
      benefits: ['Health Insurance', 'Learning Stipend'],
      applicationMethod: 'Laboria One-Click',
      status: 'Active'
    });

    EmployerPilotService.logEmployerAction('JOB_POSTED', undefined, undefined, `Published job posting: ${newJobTitle}`);

    setNewJobTitle('');
    setShowPostJobModal(false);
    refreshData();
  };

  const currentSelectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const activeCandidateMatches = currentSelectedJob
    ? EmployerPortalService.searchAndMatchCandidates(currentSelectedJob.id)
    : applications;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-sky-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Building2 className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Employer Pilot Readiness Control Center</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/30 text-sky-300 border border-sky-400/40">
                  STEP 38
                </span>
              </div>
              <p className="text-sky-200/80 text-sm">
                8-Step Pilot Workflow • Candidate Privacy &amp; Consent Guard • Transparent Match Explanations • Audit Trail
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* RBAC Role Switcher */}
          <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium px-2">Role:</span>
            {(['Admin', 'Recruiter', 'Hiring Manager'] as EmployerRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  currentUser.role === r
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Telemetry
          </button>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            Run 14 Employer Pilot Tests
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Jobs Posted</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {report.pilotMetrics.jobsPosted} Active Jobs
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Empirical Pilot Job Count
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Candidates Viewed</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {report.pilotMetrics.candidatesViewed} Profiles
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Audited Profile Inspections
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Shortlisted Candidates</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {report.pilotMetrics.candidatesShortlisted} Shortlisted
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Empirical Shortlist Count
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Interviews Initiated</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {report.pilotMetrics.interviewsInitiated} Interviews
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Initiated &amp; Contact Requested
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium mb-1">
            <span>Audit Trail Entries</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {report.pilotMetrics.auditLogsCount} Logs
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Persistent Security Audit Logs
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'workflow'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          8-Step Pilot Workflow
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'candidates'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Matched Candidates &amp; Explanations ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Posted Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'audit_logs'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security Audit Logs ({report.auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          14-Point Diagnostic Suite
          {diagnosticResults && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${diagnosticResults.passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
              {diagnosticResults.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: 8-Step Pilot Workflow */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  Streamlined 8-Step Employer Pilot Pipeline
                </h3>
                <p className="text-xs text-slate-400">
                  Lightweight employer pilot workflow guiding recruiters from signup to final hiring outcome.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-full">
                Controlled Pilot Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.workflowSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-950 border border-slate-800 hover:border-sky-500/50 p-4 rounded-xl flex flex-col justify-between transition group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-sky-600/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center">
                        #{step.stepNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                        {step.stepName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                        Workflow Action
                      </div>
                      <div className="text-sky-300 font-medium flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                        {step.requiredAction}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Matched Candidates & Match Explanations */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Matched Candidates &amp; Match Explanations
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect profile-matched candidates with transparent match score breakdowns and privacy consent shields.
                </p>
              </div>

              {/* Job Filter Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Job Position:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {activeCandidateMatches.map((app) => {
                const privacy = EmployerPilotService.getCandidatePrivacyState(app);
                const explanation = currentSelectedJob
                  ? EmployerPilotService.generateMatchExplanation(currentSelectedJob, app)
                  : null;

                return (
                  <div
                    key={app.applicationId}
                    className="bg-slate-950 border border-slate-800 hover:border-sky-500/40 p-5 rounded-xl space-y-4 transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header Badge */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{privacy.displayName}</h4>
                            {privacy.isMasked ? (
                              <span className="p-1 bg-amber-500/20 text-amber-400 rounded text-[10px] border border-amber-500/30 flex items-center gap-1" title="PII Contact Details Masked for Privacy">
                                <Lock className="w-3 h-3" />
                                Masked PII
                              </span>
                            ) : (
                              <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded text-[10px] border border-emerald-500/30 flex items-center gap-1" title="Candidate Granted Contact Access">
                                <Unlock className="w-3 h-3" />
                                Consented
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{app.candidateHeadline}</p>
                        </div>

                        <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-bold text-sm rounded-full border border-sky-500/30">
                          {app.profileMatchScore}% Match
                        </span>
                      </div>

                      {/* Contact Info Box */}
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
                        <div className="text-slate-300 flex justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span>{privacy.email}</span>
                        </div>
                        <div className="text-slate-300 flex justify-between">
                          <span className="text-slate-400">Phone:</span>
                          <span>{privacy.phone}</span>
                        </div>
                      </div>

                      {/* Transparent Match Score Explanation Box */}
                      {explanation && (
                        <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-lg space-y-2">
                          <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-indigo-400" />
                            Why Candidate Matches ({explanation.overallMatchScore}%)
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {explanation.explanationSummary}
                          </p>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {explanation.matchedSkills.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded border border-emerald-500/30">
                                ✓ {s}
                              </span>
                            ))}
                            {explanation.missingSkills.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 text-[10px] rounded border border-rose-500/20">
                                ✗ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-900 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Status:</span>
                        <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-semibold text-xs">
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                        <button
                          onClick={() => handleShortlist(app.applicationId)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleRequestContact(app.applicationId)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Request PII
                        </button>

                        <button
                          onClick={() => handleScheduleInterview(app.applicationId)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Interview
                        </button>

                        <button
                          onClick={() => handleUpdateOutcome(app.applicationId, 'Hired')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hire Candidate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Posted Jobs Inventory & Job Creation Modal */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                  Active Employer Jobs Inventory
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active employer pilot job postings and publish new candidate matches.
                </p>
              </div>

              <button
                onClick={() => setShowPostJobModal(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post New Pilot Job
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-950 border border-slate-800 hover:border-sky-500/40 p-5 rounded-xl space-y-3 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-white">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.companyName} • {job.location}</p>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold">
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 text-[11px] rounded font-mono">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Experience: {job.minExperience}-{job.maxExperience} yrs</span>
                    <span className="text-sky-300 font-semibold">{job.applicantCount} Candidates Matched</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Candidate Access Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Employer Security &amp; Candidate Access Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Persistent security logs recording profile views, PII consent requests, shortlisting, and hiring outcomes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Employer / Recruiter</th>
                    <th className="p-3">Security Action</th>
                    <th className="p-3">Audit Details</th>
                    <th className="p-3">IP Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {report.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/60 transition">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-semibold text-slate-200">{log.employerName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-sans text-xs">{log.details}</td>
                      <td className="p-3 text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 14-Point Diagnostic Test Suite */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  14-Point Employer Pilot Readiness Diagnostic Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Automated test suite asserting candidate privacy, RBAC permissions, audit logging, and pilot workflow.
                </p>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={isRunningDiagnostics}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isRunningDiagnostics ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                Run Full Employer Pilot Diagnostics
              </button>
            </div>

            {diagnosticResults ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  diagnosticResults.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-bold text-sm">
                        {diagnosticResults.passed ? 'ALL 14 EMPLOYER PILOT DIAGNOSTICS PASSED' : 'SOME DIAGNOSTICS FAILED'}
                      </div>
                      <div className="text-xs opacity-80">
                        {diagnosticResults.results.filter(r => r.passed).length} of {diagnosticResults.results.length} assertions verified successfully.
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 rounded-full text-xs font-mono border border-slate-800">
                    Status: PILOT READY
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
                <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-slate-300">Employer Diagnostic Suite Ready</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Run Full Employer Pilot Diagnostics" above to execute all 14 empirical tests for candidate privacy masking, RBAC permissions, audit logs, and match score transparency.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Post New Employer Pilot Job</h3>
              <button onClick={() => setShowPostJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Min Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={newJobMinExp}
                  onChange={(e) => setNewJobMinExp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Skills (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={newJobSkills}
                  onChange={(e) => setNewJobSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Publish Pilot Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
