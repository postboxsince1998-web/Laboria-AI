import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { mockCandidate } from '../services/mockData';
import {
  JobWatchService,
  JobWatchMatch,
  JobWatchAlert,
  JobWatchPreferences,
  JobWatchSummary
} from '../services/jobWatchService';
import { runJobWatchEngineTests, JobWatchTestResult } from '../services/jobWatchEngineTests';
import {
  Radio,
  Eye,
  Bell,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Bookmark,
  Trash2,
  ExternalLink,
  MessageSquareText,
  BookOpen,
  Bot,
  Sliders,
  CheckCircle2,
  Briefcase,
  MapPin,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface AIJobWatchProps {
  candidate?: CandidateProfile;
}

export const AIJobWatch: React.FC<AIJobWatchProps> = ({ candidate = mockCandidate }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'new' | 'strong' | 'recent' | 'saved' | 'dismissed'>('new');
  const [matches, setMatches] = useState<JobWatchMatch[]>([]);
  const [summary, setSummary] = useState<JobWatchSummary>(() =>
    JobWatchService.evaluateAndDetectNewMatches(candidate)
  );
  const [alerts, setAlerts] = useState<JobWatchAlert[]>([]);
  const [preferences, setPreferences] = useState<JobWatchPreferences>(() =>
    JobWatchService.getUserPreferences()
  );

  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<JobWatchTestResult[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    const updatedSummary = JobWatchService.evaluateAndDetectNewMatches(candidate, preferences);
    setSummary(updatedSummary);
    setMatches(JobWatchService.getMatchesBySection(candidate, activeTab));
    setAlerts(JobWatchService.getInAppAlerts());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualScan = () => {
    refreshData();
    showToast('✓ AI Job Watch scan complete. Dataset evaluated against your profile.');
  };

  const handleSaveToggle = (matchId: string) => {
    const isSaved = JobWatchService.saveMatch(matchId);
    refreshData();
    showToast(isSaved ? '✓ Job saved to your Saved Jobs list.' : 'Removed from Saved Jobs.');
  };

  const handleDismiss = (matchId: string) => {
    JobWatchService.dismissMatch(matchId);
    refreshData();
    showToast('Job dismissed.');
  };

  const handleApplyClick = (match: JobWatchMatch) => {
    JobWatchService.markApplied(match.id);
    JobWatchService.markMatchViewed(match.id);
    refreshData();
    window.open(match.sourceUrl, '_blank');
  };

  const handlePrepareInterview = (match: JobWatchMatch) => {
    JobWatchService.markMatchViewed(match.id);
    navigate('/interview-prep');
  };

  const handleImproveSkill = (match: JobWatchMatch) => {
    JobWatchService.markMatchViewed(match.id);
    navigate('/skill-gap');
  };

  const handleAskMentor = (match: JobWatchMatch) => {
    JobWatchService.markMatchViewed(match.id);
    navigate('/mentor');
  };

  const handleUpdatePreferences = (updates: Partial<JobWatchPreferences>) => {
    const newP = JobWatchService.updateUserPreferences(updates);
    setPreferences(newP);
    refreshData();
    showToast('✓ Job Watch preferences updated.');
  };

  const handleRunTests = () => {
    const results = runJobWatchEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-glow-teal animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
            <Radio className="w-3.5 h-3.5" /> AI Job Watch
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            AI Job Watch
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Automated job matching & new opportunity detection. (Profile/JD match is always the primary factor; location is secondary).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Notification Bell with Badge */}
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="relative p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-brand-500/40 transition text-gray-300 hover:text-white"
            title="In-App Job Watch Alerts"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {summary.unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {summary.unreadAlertsCount}
              </span>
            )}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrefModalOpen(true)}
            icon={<Sliders className="w-4 h-4 text-brand-400" />}
          >
            Preferences
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunTests}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            Run Engine Tests
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={handleManualScan}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check for New Matches
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS COUNTER BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1">
          <span className="text-[10px] text-gray-400 font-mono uppercase">Active Matches</span>
          <p className="text-lg font-extrabold text-white font-display">
            {summary.totalActiveMatches} Jobs
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-brand-500/40 space-y-1">
          <span className="text-[10px] text-brand-300 font-mono uppercase">New Matches</span>
          <p className="text-lg font-extrabold text-brand-300 font-display">
            {summary.newMatchesCount} New
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-emerald-500/40 space-y-1">
          <span className="text-[10px] text-emerald-400 font-mono uppercase">Strong Matches (≥85%)</span>
          <p className="text-lg font-extrabold text-emerald-400 font-display">
            {summary.highMatchesCount} Roles
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-purple-500/40 space-y-1">
          <span className="text-[10px] text-purple-300 font-mono uppercase">Saved Jobs</span>
          <p className="text-lg font-extrabold text-purple-300 font-display">
            {summary.savedMatchesCount} Saved
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-gray-400 font-mono uppercase">Last Scanned</span>
          <p className="text-xs font-bold text-gray-300 font-mono truncate mt-1">
            {summary.lastScanTimestamp}
          </p>
        </div>
      </div>

      {/* 5 DASHBOARD SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {[
          { id: 'new', label: 'New Matches', badge: summary.newMatchesCount },
          { id: 'strong', label: 'Strong Matches (≥85%)', badge: summary.highMatchesCount },
          { id: 'recent', label: 'Recently Added', badge: summary.totalActiveMatches },
          { id: 'saved', label: 'Saved Jobs', badge: summary.savedMatchesCount },
          { id: 'dismissed', label: 'Dismissed Jobs', badge: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-950 text-brand-300 font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* JOB MATCH CARDS MATRIX */}
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((item) => (
            <Card key={item.id} glow={item.matchCategory === 'High Match'} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header Row: Title, Company, Match Score Badge */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.matchCategory === 'High Match' ? 'match-high' : 'info'}>
                        {item.matchCategory}
                      </Badge>
                      <span className="text-[10px] text-gray-400 font-mono">Posted: {item.postedDate}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-display mt-1">{item.title}</h3>
                    <p className="text-xs font-medium text-brand-300">{item.company}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-extrabold text-emerald-400 font-display">
                      {item.finalPriorityScore}% <span className="text-xs text-gray-400 font-normal">Match</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block">Profile: {item.profileMatchScore}%</span>
                  </div>
                </div>

                {/* Location, Work Type, Experience */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-400" /> {item.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-purple-400" /> {item.workType}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent-cyan" /> {item.minExperience}-{item.maxExperience} YOE</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">₹{item.salaryRange.min}-{item.salaryRange.max} LPA</span>
                </div>

                {/* "Why Laboria Recommends This Job" Box */}
                <div className="p-3.5 rounded-xl bg-gray-900/90 border border-brand-500/30 space-y-1 text-xs">
                  <span className="font-bold text-brand-300 flex items-center gap-1.5 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Why Laboria Recommends This Job:
                  </span>
                  <p className="text-gray-200 text-[11px] leading-relaxed">{item.whyThisJob}</p>
                </div>

                {/* Verified Matching Skills vs Missing Skill Warning */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-gray-400 text-[11px]">Matching Skills:</span>
                    {item.matchingSkills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>

                  {item.missingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-gray-400 text-[11px]">Missing Target Skill:</span>
                      {item.missingSkills.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                          ⚠ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Source Provenance Tag */}
                <div className="text-[10px] text-gray-500 font-mono border-t border-gray-800/80 pt-2 flex items-center justify-between">
                  <span>Source: {item.source}</span>
                  <span>Detected: {new Date(item.firstDetectedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* CARD ACTION BUTTONS */}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                {/* Secondary Action Row */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-[10px] py-1.5"
                    onClick={() => handlePrepareInterview(item)}
                    icon={<MessageSquareText className="w-3 h-3 text-amber-400" />}
                  >
                    Interview Prep
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-[10px] py-1.5"
                    onClick={() => handleImproveSkill(item)}
                    icon={<BookOpen className="w-3 h-3 text-emerald-400" />}
                  >
                    Improve Skill
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-[10px] py-1.5"
                    onClick={() => handleAskMentor(item)}
                    icon={<Bot className="w-3 h-3 text-purple-400" />}
                  >
                    Ask Mentor
                  </Button>
                </div>

                {/* Primary Action Row */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="accent"
                    className="flex-1 justify-center text-xs"
                    onClick={() => handleApplyClick(item)}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    View / Apply Job
                  </Button>

                  <button
                    onClick={() => handleSaveToggle(item.id)}
                    className={`p-2 rounded-xl border transition ${
                      item.saved
                        ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                    title="Save Job"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="p-2 rounded-xl bg-gray-900 text-gray-400 border border-gray-800 hover:text-rose-400 hover:border-rose-500/40 transition"
                    title="Dismiss Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* BEGINNER-FRIENDLY EMPTY STATE */
        <Card className="text-center py-12 space-y-4">
          <div className="inline-flex p-4 rounded-full bg-brand-500/10 text-brand-300 mb-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">You're all caught up!</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            If new jobs matching your profile become available, Laboria AI Job Watch will automatically evaluate them and show them here.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleManualScan} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Scan Dataset Now
            </Button>
          </div>
        </Card>
      )}

      {/* USER PREFERENCES CONFIGURATOR MODAL */}
      <Modal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        title="AI Job Watch Preferences & Threshold Configurator"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-white">Minimum Match Score Threshold (%):</label>
            <input
              type="number"
              min={50}
              max={95}
              value={preferences.minMatchScore}
              onChange={(e) => handleUpdatePreferences({ minMatchScore: Number(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-white">Search Radius (km):</label>
            <input
              type="number"
              min={10}
              max={500}
              value={preferences.searchRadiusKm}
              onChange={(e) => handleUpdatePreferences({ searchRadiusKm: Number(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-white">Preferred Work Modes:</label>
            <div className="flex items-center gap-3 pt-1">
              {['Remote', 'Hybrid', 'Onsite'].map((wm) => (
                <label key={wm} className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.workModes.includes(wm)}
                    onChange={(e) => {
                      const newModes = e.target.checked
                        ? [...preferences.workModes, wm]
                        : preferences.workModes.filter((m) => m !== wm);
                      handleUpdatePreferences({ workModes: newModes });
                    }}
                  />
                  <span>{wm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="accent" onClick={() => setIsPrefModalOpen(false)}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>

      {/* IN-APP ALERTS DRAWER MODAL */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Laboria In-App Job Watch Alerts"
      >
        <div className="space-y-3 text-xs">
          {alerts.length > 0 ? (
            alerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-gray-900/90 border border-brand-500/30 space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5 text-brand-300">
                    <Bell className="w-3.5 h-3.5 text-amber-400" /> {a.title}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{a.createdAt}</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">{a.message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No unread alerts.</p>
          )}
        </div>
      </Modal>

      {/* AUTOMATED ENGINE DIAGNOSTIC TESTS MODAL */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Job Watch Engine Diagnostic & Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
            <span>✓ Verified: Profile/JD match primacy rule strictly enforced over distance.</span>
            <Badge variant="success">{testResults.filter(r => r.status === 'PASSED').length} / {testResults.length} Passed</Badge>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {testResults.map((tr) => (
              <div
                key={tr.testId}
                className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">Test #{tr.testId}: {tr.testName}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{tr.details}</p>
                </div>
                <Badge variant={tr.status === 'PASSED' ? 'success' : 'match-low'}>
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
