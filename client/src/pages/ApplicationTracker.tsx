import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateProfile, JobApplication, ApplicationStatus, AIApplicationInsight } from '../types';
import { ApplicationTrackerService, ALL_APPLICATION_STATUSES } from '../services/applicationTrackerService';
import { runApplicationTrackerEngineTests, ApplicationTrackerTestResult } from '../services/applicationTrackerEngineTests';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  MapPin,
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Play,
  X,
  History,
  Edit3,
  Award,
  CheckSquare
} from 'lucide-react';

interface ApplicationTrackerProps {
  candidate: CandidateProfile;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Core State
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    ApplicationTrackerService.getApplications(candidate.id)
  );
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals State
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<ApplicationTrackerTestResult[] | null>(null);

  // Form State for Add Modal
  const [newAppForm, setNewAppForm] = useState({
    title: '',
    company: '',
    location: candidate.currentLocation ? `${candidate.currentLocation.city}, ${candidate.currentLocation.state}` : 'Remote',
    status: 'Applied' as ApplicationStatus,
    source: 'Laboria AI Direct Match',
    resumeVersionUsed: 'Resume_FullStack_Lead_v2.pdf',
    notes: '',
    nextAction: ''
  });

  // Form State for Editing Notes/Next Action
  const [editingNotes, setEditingNotes] = useState('');
  const [editingNextAction, setEditingNextAction] = useState('');
  const [editingInterviewDate, setEditingInterviewDate] = useState('');
  const [newTimelineNote, setNewTimelineNote] = useState('');
  const [statusChangeTarget, setStatusChangeTarget] = useState<ApplicationStatus | ''>('');

  // Derived Statistics & Insights
  const stats = useMemo(
    () => ApplicationTrackerService.calculateStatistics(applications),
    [applications]
  );

  const aiInsights = useMemo(
    () => ApplicationTrackerService.generateAIInsights(applications),
    [applications]
  );

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Handle Status Update
  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus, note?: string) => {
    const updated = ApplicationTrackerService.updateStatus(appId, newStatus, note);
    if (updated) {
      setApplications([...ApplicationTrackerService.getApplications(candidate.id)]);
      if (selectedAppForDetail && selectedAppForDetail.id === appId) {
        setSelectedAppForDetail(updated);
      }
    }
  };

  // Handle Add New Application
  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.title || !newAppForm.company) return;

    const created = ApplicationTrackerService.addApplication({
      jobId: `job_custom_${Date.now()}`,
      userId: candidate.id,
      title: newAppForm.title,
      company: newAppForm.company,
      location: newAppForm.location,
      status: newAppForm.status,
      appliedDate: new Date().toISOString().split('T')[0],
      notes: newAppForm.notes,
      nextAction: newAppForm.nextAction,
      source: newAppForm.source,
      resumeVersionUsed: newAppForm.resumeVersionUsed,
      matchScore: 88
    });

    setApplications([...ApplicationTrackerService.getApplications(candidate.id)]);
    setIsAddModalOpen(false);
    setNewAppForm({
      title: '',
      company: '',
      location: 'Remote',
      status: 'Applied',
      source: 'Laboria AI Direct Match',
      resumeVersionUsed: 'Resume_FullStack_Lead_v2.pdf',
      notes: '',
      nextAction: ''
    });
  };

  // Save Notes & Next Action Edits in Modal
  const handleSaveModalEdits = () => {
    if (!selectedAppForDetail) return;

    if (editingNotes !== selectedAppForDetail.notes) {
      ApplicationTrackerService.updateNotes(selectedAppForDetail.id, editingNotes);
    }

    if (
      editingNextAction !== selectedAppForDetail.nextAction ||
      editingInterviewDate !== selectedAppForDetail.interviewDate
    ) {
      ApplicationTrackerService.updateNextAction(
        selectedAppForDetail.id,
        editingNextAction,
        editingInterviewDate || undefined
      );
    }

    if (statusChangeTarget && statusChangeTarget !== selectedAppForDetail.status) {
      ApplicationTrackerService.updateStatus(
        selectedAppForDetail.id,
        statusChangeTarget,
        newTimelineNote || undefined
      );
      setStatusChangeTarget('');
      setNewTimelineNote('');
    }

    const reloaded = ApplicationTrackerService.getApplicationById(selectedAppForDetail.id);
    if (reloaded) {
      setSelectedAppForDetail(reloaded);
    }
    setApplications([...ApplicationTrackerService.getApplications(candidate.id)]);
  };

  // Run Test Suite
  const handleRunDiagnostics = () => {
    const results = runApplicationTrackerEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  // Kanban Stage Groupings
  const kanbanColumns = [
    { title: 'Saved & Interested', statuses: ['Interested', 'Saved'] as ApplicationStatus[], color: 'border-blue-500/50 bg-blue-950/20' },
    { title: 'Applied & Under Review', statuses: ['Applied', 'Application Submitted', 'Under Review'] as ApplicationStatus[], color: 'border-yellow-500/50 bg-yellow-950/20' },
    { title: 'Interviewing & Shortlisted', statuses: ['Shortlisted', 'Interview Scheduled', 'Interview Completed'] as ApplicationStatus[], color: 'border-purple-500/50 bg-purple-950/20' },
    { title: 'Offers & Final Outcome', statuses: ['Offer', 'Rejected', 'Withdrawn', 'Closed'] as ApplicationStatus[], color: 'border-emerald-500/50 bg-emerald-950/20' }
  ];

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Interview Scheduled':
      case 'Interview Completed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Shortlisted':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Under Review':
      case 'Application Submitted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Applied':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-700/40 text-gray-300 border-gray-600/40';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-teal flex items-center justify-center text-white shadow-glow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
                AI Application Tracker
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Track every opportunity from discovery to final offer with empirical metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunDiagnostics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-accent-teal" />
            Run Diagnostics (12 Tests)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Statistics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Total Applications</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-white">{stats.totalApplications}</span>
            <Briefcase className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-[10px] text-gray-500">Non-draft active submissions</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Applied This Month</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-white">{stats.appliedThisMonth}</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-[10px] text-gray-500">September 2026</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Active Interviews</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-purple-300">{stats.interviewsCount}</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-[10px] text-gray-500">Scheduled or in-progress</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Offers Received</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-emerald-400">{stats.offersCount}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[10px] text-gray-500">Formal job offers</p>
        </div>

        <div className="col-span-2 md:col-span-1 glass-card p-4 rounded-xl border border-gray-800/80 space-y-1 bg-gradient-to-br from-brand-950/40 to-gray-900">
          <p className="text-[11px] font-mono uppercase text-brand-300">Empirical Response Rate</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-accent-teal">{stats.responseRate}%</span>
            <TrendingUp className="w-4 h-4 text-accent-teal" />
          </div>
          <p className="text-[10px] text-gray-400">Strictly computed from candidate data</p>
        </div>
      </div>

      {/* AI Data Insights Panel */}
      {aiInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-accent-teal" />
            AI Application Insights
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="glass-card p-4 rounded-xl border border-brand-500/20 bg-brand-950/20 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-accent-teal flex-shrink-0" />
                    <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{insight.description}</p>
                </div>

                {insight.actionLabel && insight.actionPath && (
                  <button
                    onClick={() => navigate(insight.actionPath!, { state: insight.actionPayload })}
                    className="mt-3 flex items-center justify-between text-xs font-medium text-accent-teal hover:text-white transition-colors"
                  >
                    <span>{insight.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar: Search, Status Filter & View Toggle */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applications by role, company, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses (12)</option>
              {ALL_APPLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border border-gray-800 p-1 rounded-xl bg-gray-900/50">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban Board
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}

      {/* 1. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colApps = filteredApplications.filter((app) =>
              col.statuses.includes(app.status)
            );

            return (
              <div
                key={col.title}
                className={`glass-card p-4 rounded-2xl border ${col.color} space-y-3 flex flex-col justify-between min-h-[500px]`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-800/60 pb-3 mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-gray-200 tracking-wider">
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-300">
                      {colApps.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colApps.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500">No applications in this stage</p>
                      </div>
                    ) : (
                      colApps.map((app) => (
                        <div
                          key={app.id}
                          className="glass-card p-4 rounded-xl border border-gray-800 hover:border-brand-500/50 transition-all space-y-3 bg-gray-900/90 shadow-md group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${getStatusBadgeColor(
                                  app.status
                                )}`}
                              >
                                {app.status}
                              </span>
                              <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                                {app.title}
                              </h4>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-gray-500" />
                                {app.company}
                              </p>
                            </div>
                            {app.matchScore && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-950 text-accent-teal border border-brand-500/30">
                                {app.matchScore}%
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-[11px] text-gray-400 font-mono">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="truncate">{app.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span>Applied: {app.appliedDate}</span>
                            </div>
                            {app.resumeVersionUsed && (
                              <div className="flex items-center gap-1.5 text-gray-400 truncate">
                                <FileText className="w-3 h-3 text-brand-400" />
                                <span className="truncate">{app.resumeVersionUsed}</span>
                              </div>
                            )}
                          </div>

                          {app.nextAction && (
                            <div className="p-2 rounded-lg bg-gray-950/60 border border-gray-800 text-[11px] text-amber-300/90 space-y-1">
                              <span className="font-semibold block text-[10px] uppercase text-amber-400/70">
                                Next Action:
                              </span>
                              <p className="line-clamp-2">{app.nextAction}</p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppForDetail(app);
                                setEditingNotes(app.notes || '');
                                setEditingNextAction(app.nextAction || '');
                                setEditingInterviewDate(app.interviewDate || '');
                              }}
                              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                              <History className="w-3 h-3 text-brand-400" />
                              Timeline & Notes ({app.timeline.length})
                            </button>

                            {(app.status === 'Interview Scheduled' || app.status === 'Shortlisted') && (
                              <button
                                onClick={() =>
                                  navigate('/interview-prep', {
                                    state: { company: app.company, title: app.title }
                                  })
                                }
                                className="px-2 py-1 rounded-md text-[10px] font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 transition-colors"
                              >
                                Practice Interview
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/90 text-gray-400 font-mono text-[11px] uppercase border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Role & Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3">Resume Version</th>
                  <th className="px-4 py-3">Next Action</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No applications match the current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="text-white font-semibold">{app.title}</div>
                        <div className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          {app.company}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadgeColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">
                        {app.location}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">
                        {app.appliedDate}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[11px]">
                        {app.resumeVersionUsed || 'Standard Resume'}
                      </td>
                      <td className="px-4 py-3 text-amber-300/90 text-[11px] max-w-xs truncate">
                        {app.nextAction || '—'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppForDetail(app);
                            setEditingNotes(app.notes || '');
                            setEditingNextAction(app.nextAction || '');
                            setEditingInterviewDate(app.interviewDate || '');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all"
                        >
                          Timeline & Notes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION TIMELINE & NOTES */}
      {selectedAppForDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[90vh] bg-gray-900">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-start justify-between bg-gray-950/60">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border mb-1 ${getStatusBadgeColor(
                    selectedAppForDetail.status
                  )}`}
                >
                  {selectedAppForDetail.status}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedAppForDetail.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  {selectedAppForDetail.company} • {selectedAppForDetail.location}
                </p>
              </div>

              <button
                onClick={() => setSelectedAppForDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Quick Status Updater */}
              <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800 space-y-3">
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block">
                  Update Application Status & Log Event
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={statusChangeTarget || selectedAppForDetail.status}
                    onChange={(e) => setStatusChangeTarget(e.target.value as ApplicationStatus)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {ALL_APPLICATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Event log note (e.g. Cleared HR round)..."
                    value={newTimelineNote}
                    onChange={(e) => setNewTimelineNote(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Next Action & Interview Scheduler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1.5">
                    Next Action Reminder
                  </label>
                  <input
                    type="text"
                    value={editingNextAction}
                    onChange={(e) => setEditingNextAction(e.target.value)}
                    placeholder="e.g. Prepare System Design & Redis Caching"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1.5">
                    Scheduled Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingInterviewDate ? editingInterviewDate.substring(0, 16) : ''}
                    onChange={(e) => setEditingInterviewDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Candidate Notes */}
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1.5">
                  Candidate Notes & Feedback
                </label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add private application notes, salary discussion notes, or interviewer feedback..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Chronological Application Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-gray-300">
                  <History className="w-4 h-4 text-brand-400" />
                  Chronological Timeline Audit Trail
                </div>

                <div className="border-l-2 border-gray-800 ml-2 pl-4 space-y-4 py-1">
                  {selectedAppForDetail.timeline.map((event) => (
                    <div key={event.id} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-gray-900" />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white">{event.status}</span>
                        <span className="text-[10px] font-mono text-gray-500">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-400">{event.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
              <button
                onClick={() => {
                  ApplicationTrackerService.deleteApplication(selectedAppForDetail.id);
                  setApplications([...ApplicationTrackerService.getApplications(candidate.id)]);
                  setSelectedAppForDetail(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-800/40 transition-colors"
              >
                Delete Record
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedAppForDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModalEdits}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD APPLICATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-gray-800 overflow-hidden bg-gray-900">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                Add New Job Application
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={newAppForm.title}
                  onChange={(e) => setNewAppForm({ ...newAppForm, title: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TechCorp India"
                    value={newAppForm.company}
                    onChange={(e) => setNewAppForm({ ...newAppForm, company: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newAppForm.location}
                    onChange={(e) => setNewAppForm({ ...newAppForm, location: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Status
                  </label>
                  <select
                    value={newAppForm.status}
                    onChange={(e) => setNewAppForm({ ...newAppForm, status: e.target.value as ApplicationStatus })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {ALL_APPLICATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newAppForm.source}
                    onChange={(e) => setNewAppForm({ ...newAppForm, source: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Resume Version Used
                </label>
                <input
                  type="text"
                  value={newAppForm.resumeVersionUsed}
                  onChange={(e) => setNewAppForm({ ...newAppForm, resumeVersionUsed: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newAppForm.notes}
                  onChange={(e) => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                  placeholder="Initial application notes..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm transition-all"
                >
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNOSTICS TEST RESULTS */}
      {isTestModalOpen && testResults && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-gray-800 overflow-hidden bg-gray-900 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-teal" />
                <div>
                  <h3 className="text-base font-bold text-white">Application Tracker Diagnostic Results</h3>
                  <p className="text-xs text-gray-400 font-mono">12-Point Automated Engine Verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {testResults.map((r) => (
                <div
                  key={r.testId}
                  className="p-3 rounded-xl border border-gray-800 bg-gray-950 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span className="text-brand-400 font-mono">#{r.testId}</span>
                      <span>{r.testName}</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">{r.details}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      r.status === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                {testResults.filter((t) => t.status === 'PASSED').length} / {testResults.length} Tests Passed
              </span>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
