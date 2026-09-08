import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  EmployerUser,
  CompanyProfile,
  EmployerJobPost,
  CandidateApplicationSummary,
  InterviewScheduleRequest,
  EmployerRole,
  CandidateProfile
} from '../types';
import { EmployerPortalService } from '../services/employerPortalService';
import { runEmployerPortalEngineTests, EmployerPortalTestReport } from '../services/employerPortalEngineTests';
import {
  Building2,
  Plus,
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  MapPin,
  DollarSign,
  Globe,
  ExternalLink,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Send,
  Eye,
  EyeOff,
  Settings,
  Lock,
  Layers,
  Filter,
  Award
} from 'lucide-react';

interface EmployerPortalProps {
  candidate?: CandidateProfile;
}

type TabType = 'overview' | 'jobs' | 'candidates' | 'applications' | 'company';

export const EmployerPortal: React.FC<EmployerPortalProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<EmployerUser>(() => EmployerPortalService.getCurrentUser());
  const [company, setCompany] = useState<CompanyProfile>(() => EmployerPortalService.getCompanyProfile());
  const [jobs, setJobs] = useState<EmployerJobPost[]>(() => EmployerPortalService.getJobs());
  const [applications, setApplications] = useState<CandidateApplicationSummary[]>(() =>
    EmployerPortalService.searchAndMatchCandidates(jobs[0]?.id || '')
  );

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Search & Filter state
  const [selectedJobForMatches, setSelectedJobForMatches] = useState<string>(jobs[0]?.id || '');
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [minMatchScoreFilter, setMinMatchScoreFilter] = useState<number>(75);

  // Modals state
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<EmployerJobPost>>({});

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedAppForModal, setSelectedAppForModal] = useState<CandidateApplicationSummary | null>(null);

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState<Partial<InterviewScheduleRequest>>({});

  // Test Suite Modal State
  const [testReport, setTestReport] = useState<EmployerPortalTestReport | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const u = EmployerPortalService.getCurrentUser();
    const c = EmployerPortalService.getCompanyProfile();
    const j = EmployerPortalService.getJobs();
    setCurrentUser(u);
    setCompany(c);
    setJobs(j);
    if (j.length > 0 && !selectedJobForMatches) {
      setSelectedJobForMatches(j[0].id);
    }
    const apps = EmployerPortalService.searchAndMatchCandidates(selectedJobForMatches || j[0]?.id || '', {
      minMatchScore: minMatchScoreFilter,
      skillFilter: skillSearchQuery
    });
    setApplications(apps);
  };

  // Switch Employer RBAC Role
  const handleRoleChange = (newRole: EmployerRole) => {
    const updated = EmployerPortalService.updateUserRole(newRole);
    setCurrentUser(updated);
  };

  // Handle Save Job in Post/Edit Modal
  const handleSaveJob = () => {
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, editingJob.id ? 'EDIT_JOB' : 'POST_JOB');
    if (!rbac.permitted) {
      alert(`RBAC Access Denied: ${rbac.reason}`);
      return;
    }

    if (!editingJob.title || !editingJob.description) {
      alert('Please enter at least the Job Title and Job Description.');
      return;
    }

    const skillsArray = Array.isArray(editingJob.skills)
      ? editingJob.skills
      : typeof editingJob.skills === 'string'
      ? (editingJob.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
      : ['TypeScript', 'React', 'Node.js'];

    const payload = {
      title: editingJob.title || 'Software Engineer',
      description: editingJob.description || '',
      skills: skillsArray,
      niceToHaveSkills: Array.isArray(editingJob.niceToHaveSkills)
        ? editingJob.niceToHaveSkills
        : typeof editingJob.niceToHaveSkills === 'string'
        ? (editingJob.niceToHaveSkills as string).split(',').map((s) => s.trim()).filter(Boolean)
        : ['AWS', 'Docker'],
      minExperience: editingJob.minExperience ?? 2,
      maxExperience: editingJob.maxExperience ?? 6,
      educationRequired: editingJob.educationRequired || 'B.Tech in Computer Science or equivalent',
      location: editingJob.location || 'Bengaluru, India',
      workMode: editingJob.workMode || 'Hybrid',
      employmentType: editingJob.employmentType || 'Full-time',
      salaryRange: editingJob.salaryRange || { min: 1400000, max: 2400000, currency: 'INR' },
      benefits: Array.isArray(editingJob.benefits)
        ? editingJob.benefits
        : typeof editingJob.benefits === 'string'
        ? (editingJob.benefits as string).split(',').map((b) => b.trim()).filter(Boolean)
        : ['Health Coverage', 'Flexible Working'],
      applicationMethod: editingJob.applicationMethod || 'Laboria One-Click',
      externalApplyUrl: editingJob.externalApplyUrl,
      status: editingJob.status || 'Active'
    };

    if (editingJob.id) {
      EmployerPortalService.editJob(editingJob.id, payload);
    } else {
      EmployerPortalService.postJob(payload);
    }

    refreshData();
    setIsPostJobModalOpen(false);
    setEditingJob({});
  };

  // Handle Close Job
  const handleCloseJob = (jobId: string) => {
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'CLOSE_JOB');
    if (!rbac.permitted) {
      alert(`RBAC Access Denied: ${rbac.reason}`);
      return;
    }

    if (confirm('Are you sure you want to close this job posting? Candidates will no longer be able to apply.')) {
      EmployerPortalService.closeJob(jobId);
      refreshData();
    }
  };

  // Handle Shortlist Candidate
  const handleShortlist = (appId: string) => {
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'SHORTLIST');
    if (!rbac.permitted) {
      alert(`RBAC Access Denied: ${rbac.reason}`);
      return;
    }

    EmployerPortalService.shortlistCandidate(appId);
    refreshData();
  };

  // Handle Reject Candidate
  const handleReject = (appId: string) => {
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'REJECT');
    if (!rbac.permitted) {
      alert(`RBAC Access Denied: ${rbac.reason}`);
      return;
    }

    if (confirm('Are you sure you want to reject this candidate application?')) {
      EmployerPortalService.rejectCandidate(appId);
      refreshData();
    }
  };

  // Handle Grant Candidate Consent (Demo Unmask)
  const handleGrantConsent = (appId: string) => {
    EmployerPortalService.grantCandidateConsent(appId);
    refreshData();
    if (selectedAppForModal && selectedAppForModal.applicationId === appId) {
      setSelectedAppForModal({
        ...selectedAppForModal,
        hasConsentedPrivacy: true,
        candidateName: candidate?.fullName || 'Candidate Name',
        maskedEmail: candidate?.email || 'candidate@laboria.ai',
        maskedPhone: candidate?.phone || '+91 90000 00000'
      });
    }
  };

  // Handle Schedule Interview Form Submit
  const handleScheduleSubmit = () => {
    const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'SCHEDULE_INTERVIEW');
    if (!rbac.permitted) {
      alert(`RBAC Access Denied: ${rbac.reason}`);
      return;
    }

    if (!interviewForm.applicationId || !interviewForm.date || !interviewForm.time) {
      alert('Please fill in the interview date, time, and round type.');
      return;
    }

    EmployerPortalService.scheduleInterview({
      applicationId: interviewForm.applicationId,
      candidateId: interviewForm.candidateId || 'cand_101',
      jobId: interviewForm.jobId || jobs[0].id,
      roundType: interviewForm.roundType || 'Technical Deep-Dive',
      date: interviewForm.date,
      time: interviewForm.time,
      meetingLink: interviewForm.meetingLink || 'https://meet.laboria.ai/techpartner-interview',
      interviewerName: interviewForm.interviewerName || currentUser.name
    });

    refreshData();
    setIsInterviewModalOpen(false);
    setInterviewForm({});
  };

  // Run Automated Engine Tests
  const handleRunTests = () => {
    const report = runEmployerPortalEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalApplicantsCount = applications.length;
  const scheduledInterviewsCount = applications.filter((a) => a.status === 'Interview Scheduled').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Corporate Identity & RBAC Switcher */}
      <Card glow className="bg-gradient-to-r from-gray-900 via-brand-950/50 to-gray-900 border-brand-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white font-display">{company.name}</h1>
                  <Badge variant="info">Verified Corporate Account</Badge>
                </div>
                <p className="text-gray-400 text-xs">
                  {currentUser.name} • <span className="text-brand-300 font-semibold">{currentUser.designation}</span> ({company.industry})
                </p>
              </div>
            </div>
          </div>

          {/* RBAC Role Selector & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* RBAC Role Picker */}
            <div className="bg-gray-950/90 border border-gray-800 p-2 rounded-2xl flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono uppercase px-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Role Permissions:
              </span>
              {(['Admin', 'Recruiter', 'Hiring Manager'] as EmployerRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentUser.role === r
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setEditingJob({});
                  setIsPostJobModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Post New Job
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunTests}
                icon={<Sparkles className="w-4 h-4 text-brand-400" />}
              >
                Run Step 21 Tests
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Overview Stat Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Card className="p-3 bg-gray-900 border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-[11px] block font-mono">Active Job Postings</span>
            <span className="text-2xl font-extrabold text-white mt-0.5 block font-display">{activeJobsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3 bg-gray-900 border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-[11px] block font-mono">Matched Candidates</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-0.5 block font-display">{totalApplicantsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3 bg-gray-900 border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-[11px] block font-mono">Scheduled Interviews</span>
            <span className="text-2xl font-extrabold text-purple-400 mt-0.5 block font-display">{scheduledInterviewsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Calendar className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3 bg-gray-900 border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-gray-400 text-[11px] block font-mono">Privacy Protection</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-0.5 block font-display">Masked</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <EyeOff className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Employer Dashboard Overview', icon: Layers },
          { id: 'jobs', label: `Job Postings (${jobs.length})`, icon: Briefcase },
          { id: 'candidates', label: `Profile-First Candidate Matcher (${applications.length})`, icon: Search },
          { id: 'applications', label: 'Applications & Shortlist Pipeline', icon: Users },
          { id: 'company', label: 'Company Profile & RBAC Settings', icon: Building2 }
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-xs">
          {/* Active Job Posting Quick Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-400" /> Active Job Postings ({activeJobsCount})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('jobs')}>
                Manage All Jobs &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jobs.map((j) => (
                <Card key={j.id} className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-sm font-display">{j.title}</h4>
                      <Badge variant={j.status === 'Active' ? 'success' : 'match-low'}>{j.status}</Badge>
                    </div>

                    <p className="text-gray-400 text-[11px] line-clamp-2">{j.description}</p>

                    <div className="space-y-1 pt-1 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" /> {j.location} ({j.workMode})
                      </div>
                      {j.salaryRange && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5" /> ₹{(j.salaryRange.min / 100000).toFixed(1)}L - ₹{(j.salaryRange.max / 100000).toFixed(1)}L PA
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {j.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-gray-300 font-mono text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <span className="text-gray-400 text-[11px] font-mono">{j.applicantCount} Candidates Matched</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJobForMatches(j.id);
                        setActiveTab('candidates');
                      }}
                    >
                      View Candidates
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Profile/JD Candidate Matches */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Top Candidate Matches (Profile/JD Match Primary)
              </h3>
              <Badge variant="info">Candidate Contact Masking Active</Badge>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.applicationId} className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.candidateName}</span>
                      <Badge variant="match-high">{app.profileMatchScore}% JD Match</Badge>
                      <Badge variant={app.hasConsentedPrivacy ? 'success' : 'warning'}>
                        {app.hasConsentedPrivacy ? 'Consented' : 'Contact Masked'}
                      </Badge>
                    </div>

                    <p className="text-brand-300 font-semibold text-xs">{app.candidateHeadline} ({app.experienceYears} YOE)</p>

                    <div className="flex items-center gap-4 text-gray-400 text-[11px] font-mono">
                      <span>Email: <strong className="text-gray-200">{app.maskedEmail}</strong></span>
                      <span>Phone: <strong className="text-gray-200">{app.maskedPhone}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAppForModal(app);
                        setIsCandidateModalOpen(true);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShortlist(app.applicationId)}
                    >
                      Shortlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: JOB MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" /> Corporate Job Posting Lifecycle
            </h3>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setEditingJob({});
                setIsPostJobModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Post New Job
            </Button>
          </div>

          <div className="space-y-3">
            {jobs.map((j) => (
              <Card key={j.id} className="space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white font-display">{j.title}</h4>
                      <Badge variant={j.status === 'Active' ? 'success' : 'match-low'}>{j.status}</Badge>
                      <Badge variant="info">{j.employmentType}</Badge>
                    </div>
                    <p className="text-brand-300 font-semibold text-xs mt-0.5">{j.companyName} • Posted on {j.postedDate}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingJob(j);
                        setIsPostJobModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-gray-900 text-gray-300 hover:text-white border border-gray-800"
                      title="Edit Job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {j.status === 'Active' && (
                      <button
                        onClick={() => handleCloseJob(j.id)}
                        className="p-2 rounded-lg bg-gray-900 text-rose-400 hover:text-rose-300 border border-gray-800"
                        title="Close Job"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed">{j.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-gray-950 border border-gray-800 text-[11px] font-mono">
                  <div>
                    <span className="text-gray-500 block">Experience:</span>
                    <span className="text-white font-bold">{j.minExperience} - {j.maxExperience} YOE</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location & Mode:</span>
                    <span className="text-white font-bold">{j.location} ({j.workMode})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Salary Range:</span>
                    <span className="text-emerald-400 font-bold">₹{(j.salaryRange?.min || 0) / 100000}L - ₹{(j.salaryRange?.max || 0) / 100000}L</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Application Method:</span>
                    <span className="text-brand-300 font-bold">{j.applicationMethod}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800">
                  <div className="flex flex-wrap gap-1.5">
                    {j.skills.map((s, sidx) => (
                      <span key={sidx} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300 font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>

                  <span className="text-gray-400 text-[11px] font-mono">
                    {j.benefits?.length || 0} Company Benefits Included
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CANDIDATE MATCHER & SEARCH */}
      {activeTab === 'candidates' && (
        <div className="space-y-4 text-xs">
          {/* Controls & Filters Header */}
          <Card>
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-400" /> Candidate Search & Matching Engine
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Target Job Opening</label>
                  <select
                    value={selectedJobForMatches}
                    onChange={(e) => {
                      setSelectedJobForMatches(e.target.value);
                      refreshData();
                    }}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2 font-bold text-xs focus:ring-2 focus:ring-brand-500"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Skill Filter</label>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => {
                      setSkillSearchQuery(e.target.value);
                      refreshData();
                    }}
                    placeholder="Search by skill (e.g. TypeScript, Python)"
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2 font-mono text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Min Match Score ({minMatchScoreFilter}%)</label>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={minMatchScoreFilter}
                    onChange={(e) => {
                      setMinMatchScoreFilter(Number(e.target.value));
                      refreshData();
                    }}
                    className="w-full accent-brand-500 mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Matched Candidate Cards List */}
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.applicationId} className="space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-display">{app.candidateName}</h4>
                      <Badge variant="match-high">{app.profileMatchScore}% Profile Match</Badge>
                      <Badge variant={app.hasConsentedPrivacy ? 'success' : 'warning'}>
                        {app.hasConsentedPrivacy ? 'Consented' : 'Contact Masked'}
                      </Badge>
                    </div>

                    <p className="text-brand-300 font-semibold text-xs">{app.candidateHeadline} • {app.experienceYears} YOE</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!app.hasConsentedPrivacy ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGrantConsent(app.applicationId)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Unmask (Demo Consent)
                      </Button>
                    ) : (
                      <Badge variant="success" className="py-1 px-3">
                        ✓ Contact Unmasked
                      </Badge>
                    )}

                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleShortlist(app.applicationId)}
                    >
                      Shortlist
                    </Button>
                  </div>
                </div>

                {/* Masked Contact Details Bar */}
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    {app.hasConsentedPrivacy ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-gray-400">Email:</span>
                    <strong className="text-white">{app.maskedEmail}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.hasConsentedPrivacy ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-gray-400">Phone:</span>
                    <strong className="text-white">{app.maskedPhone}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-gray-500 font-mono text-[10px]">Matched Skills:</span>
                    {app.matchedSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono text-[10px]">
                        ✓ {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAppForModal(app);
                      setIsCandidateModalOpen(true);
                    }}
                    className="text-brand-300 hover:text-brand-200 font-semibold text-[11px] flex items-center gap-1"
                  >
                    Full Profile Case Study &rarr;
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: APPLICATIONS & SHORTLIST PIPELINE */}
      {activeTab === 'applications' && (
        <div className="space-y-4 text-xs">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Candidate Application Management Pipeline
          </h3>

          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.applicationId} className="space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base font-display">{app.candidateName}</h4>
                      <Badge variant={app.status === 'Shortlisted' ? 'success' : app.status === 'Rejected' ? 'match-low' : 'info'}>
                        {app.status}
                      </Badge>
                      <Badge variant="match-high">{app.profileMatchScore}% Match</Badge>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">Applied for <strong className="text-white">{app.jobTitle}</strong> on {app.appliedDate}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShortlist(app.applicationId)}
                    >
                      Shortlist
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInterviewForm({ applicationId: app.applicationId, candidateId: app.candidateId, jobId: app.jobId });
                        setIsInterviewModalOpen(true);
                      }}
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Schedule Interview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(app.applicationId)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {app.interviewDetails && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1 font-mono text-[11px]">
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Scheduled Interview: {app.interviewDetails.roundType}
                    </span>
                    <p className="text-gray-200">
                      Date: <strong>{app.interviewDetails.date}</strong> at <strong>{app.interviewDetails.time}</strong> • Interviewer: {app.interviewDetails.interviewerName}
                    </p>
                    <a
                      href={app.interviewDetails.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-300 hover:text-purple-200 font-semibold inline-flex items-center gap-1 pt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" /> Meeting Link: {app.interviewDetails.meetingLink}
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPANY PROFILE & RBAC */}
      {activeTab === 'company' && (
        <div className="space-y-6 text-xs">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" /> Corporate Profile & Branding Settings
              </h3>
              <Badge variant="info">RBAC Role: {currentUser.role}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Corporate Website</label>
                <input
                  type="url"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Industry</label>
                <input
                  type="text"
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Headquarters</label>
                <input
                  type="text"
                  value={company.headquarters}
                  onChange={(e) => setCompany({ ...company, headquarters: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Company Description</label>
              <textarea
                rows={3}
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="accent"
                onClick={() => {
                  const rbac = EmployerPortalService.evaluateRBACPermission(currentUser.role, 'MANAGE_COMPANY');
                  if (!rbac.permitted) {
                    alert(`RBAC Access Denied: ${rbac.reason}`);
                    return;
                  }
                  EmployerPortalService.updateCompanyProfile(company);
                  alert('Company profile updated successfully.');
                }}
              >
                Save Company Profile
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: POST/EDIT JOB BUILDER */}
      <Modal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        title={editingJob.id ? 'Edit Job Posting' : 'Post New Job — Corporate Hiring Builder'}
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Job Title *</label>
            <input
              type="text"
              value={editingJob.title || ''}
              onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
              placeholder="e.g. Senior Telemetry & Full Stack Engineer"
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Job Description *</label>
            <textarea
              rows={3}
              value={editingJob.description || ''}
              onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
              placeholder="Describe key responsibilities and expectations."
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Required Skills (Comma separated) *</label>
              <input
                type="text"
                value={Array.isArray(editingJob.skills) ? editingJob.skills.join(', ') : (editingJob.skills as any) || ''}
                onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value as any })}
                placeholder="TypeScript, Node.js, React, PostgreSQL"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Education Requirements</label>
              <input
                type="text"
                value={editingJob.educationRequired || ''}
                onChange={(e) => setEditingJob({ ...editingJob, educationRequired: e.target.value })}
                placeholder="B.Tech in CS/IT or equivalent"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Min YOE</label>
              <input
                type="number"
                value={editingJob.minExperience ?? 2}
                onChange={(e) => setEditingJob({ ...editingJob, minExperience: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Max YOE</label>
              <input
                type="number"
                value={editingJob.maxExperience ?? 6}
                onChange={(e) => setEditingJob({ ...editingJob, maxExperience: Number(e.target.value) })}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Work Mode</label>
              <select
                value={editingJob.workMode || 'Hybrid'}
                onChange={(e) => setEditingJob({ ...editingJob, workMode: e.target.value as any })}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsPostJobModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveJob}>
              Save & Post Job
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: SCHEDULE INTERVIEW */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Candidate Interview"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Interview Round Type *</label>
            <select
              value={interviewForm.roundType || 'Technical Deep-Dive'}
              onChange={(e) => setInterviewForm({ ...interviewForm, roundType: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-brand-500"
            >
              <option value="Technical Deep-Dive">Technical Deep-Dive</option>
              <option value="System Architecture">System Architecture</option>
              <option value="HR Culture Fit">HR Culture Fit</option>
              <option value="Executive Final">Executive Final</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Date *</label>
              <input
                type="date"
                value={interviewForm.date || '2026-09-10'}
                onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Time *</label>
              <input
                type="text"
                value={interviewForm.time || '14:00 IST'}
                onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                placeholder="14:00 IST"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Interviewer Name</label>
            <input
              type="text"
              value={interviewForm.interviewerName || currentUser.name}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsInterviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleScheduleSubmit}>
              Schedule Interview
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: AUTOMATED TEST REPORT */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Step 21: Employer & Recruiter Portal Test Report"
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
