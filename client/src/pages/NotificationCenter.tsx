import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { mockCandidate } from '../services/mockData';
import {
  SmartJobAlertsService,
  SmartNotification,
  AlertCategory,
  AlertSettings,
  DailyDigest
} from '../services/smartAlertsService';
import { runSmartAlertsEngineTests, SmartAlertsTestResult } from '../services/smartAlertsEngineTests';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sliders,
  MessageSquareCode,
  BookOpen,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Radar,
  Info,
  Check,
  RefreshCw
} from 'lucide-react';

interface NotificationCenterProps {
  candidate?: CandidateProfile;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ candidate = mockCandidate }) => {
  const navigate = useNavigate();

  const [viewFilter, setViewFilter] = useState<'unread' | 'read' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [settings, setSettings] = useState<AlertSettings>(() => SmartJobAlertsService.getSettings());
  const [dailyDigest, setDailyDigest] = useState<DailyDigest>(() => SmartJobAlertsService.getDailyDigest(candidate));

  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<SmartAlertsTestResult[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshNotifications();
  }, [viewFilter, selectedCategory]);

  const refreshNotifications = () => {
    SmartJobAlertsService.generateSmartAlerts(candidate, settings);
    let list = SmartJobAlertsService.getNotifications(viewFilter);
    if (selectedCategory !== 'All') {
      list = list.filter((n) => n.category === selectedCategory);
    }
    setNotifications(list);
    setDailyDigest(SmartJobAlertsService.getDailyDigest(candidate));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkRead = (id: string) => {
    SmartJobAlertsService.markAsRead(id);
    refreshNotifications();
  };

  const handleMarkAllRead = () => {
    SmartJobAlertsService.markAllAsRead();
    refreshNotifications();
    showToast('✓ All notifications marked as read.');
  };

  const handleDelete = (id: string) => {
    SmartJobAlertsService.clearNotification(id);
    refreshNotifications();
    showToast('Notification deleted.');
  };

  const handleActionClick = (notif: SmartNotification) => {
    SmartJobAlertsService.markAsRead(notif.id);
    refreshNotifications();
    if (notif.actionPath) {
      navigate(notif.actionPath);
    }
  };

  const handleUpdateSettings = (updates: Partial<AlertSettings>) => {
    const updated = SmartJobAlertsService.updateSettings(updates);
    setSettings(updated);
    refreshNotifications();
    showToast('✓ Alert settings updated.');
  };

  const handleRunTests = () => {
    const results = runSmartAlertsEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const highPriorityCount = notifications.filter((n) => n.priority === 'High').length;

  const categoriesList = [
    'All',
    'New Job Match',
    'Strong Match',
    'Application Reminder',
    'Interview Preparation',
    'Skill Gap',
    'Learning Reminder',
    'Career Insight'
  ];

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
            <Bell className="w-3.5 h-3.5 text-amber-400" /> Notification Center
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Notification Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Intelligent alerts & daily career insights. Fatigue-free notification rules protect your focus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsDigestModalOpen(true)}
            icon={<Sparkles className="w-4 h-4" />}
          >
            In-App Daily Digest
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            icon={<Sliders className="w-4 h-4 text-brand-400" />}
          >
            Alert Settings
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
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1">
          <span className="text-[10px] text-gray-400 font-mono uppercase">Total Notifications</span>
          <p className="text-lg font-extrabold text-white font-display">
            {notifications.length} Alerts
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-amber-500/40 space-y-1">
          <span className="text-[10px] text-amber-300 font-mono uppercase">Unread Notifications</span>
          <p className="text-lg font-extrabold text-amber-300 font-display">
            {unreadCount} Unread
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-rose-500/40 space-y-1">
          <span className="text-[10px] text-rose-300 font-mono uppercase">High Priority</span>
          <p className="text-lg font-extrabold text-rose-300 font-display">
            {highPriorityCount} Urgent
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-900/90 border border-brand-500/40 space-y-1">
          <span className="text-[10px] text-brand-300 font-mono uppercase">Match Threshold</span>
          <p className="text-lg font-extrabold text-brand-300 font-display">
            ≥{settings.minMatchScore}% Match
          </p>
        </div>
      </div>

      {/* VIEW FILTER TABS & CATEGORY PILLS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
          {/* Unread / Read / All Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-900 border border-gray-800">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewFilter === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setViewFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewFilter === 'unread' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setViewFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewFilter === 'read' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Read
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIFICATION FEED */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`p-4 transition space-y-3 ${
                  !n.readAt
                    ? 'bg-gradient-to-r from-gray-900 via-gray-900 to-brand-950/30 border-brand-500/40 shadow-glow-sm'
                    : 'bg-gray-900/60 border-gray-800 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl text-white flex-shrink-0 ${
                      n.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    }`}>
                      {n.category.includes('Job') ? <Radio className="w-4 h-4" /> :
                       n.category.includes('Interview') ? <MessageSquareCode className="w-4 h-4" /> :
                       n.category.includes('Skill') ? <TargetIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={n.priority === 'High' ? 'match-low' : 'info'}>
                          {n.priority} Priority
                        </Badge>
                        <Badge variant="purple">{n.category}</Badge>
                        {!n.readAt && <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />}
                      </div>

                      <h4 className="font-bold text-white text-sm mt-0.5">{n.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">{n.createdAt}</span>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 text-gray-500 hover:text-rose-400 transition"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer: Source Tag & Direct Action Button */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-500 font-mono">Source: {n.source}</span>

                  <div className="flex items-center gap-2">
                    {!n.readAt && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[11px] text-gray-400 hover:text-white transition"
                      >
                        Mark Read
                      </button>
                    )}

                    {n.actionPath && (
                      <Button
                        size="sm"
                        variant="accent"
                        className="text-[11px] py-1"
                        onClick={() => handleActionClick(n)}
                        icon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {n.actionLabel || 'View Detail'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-gray-800 text-gray-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white">No notifications found</h3>
            <p className="text-xs text-gray-400">You are completely up to date.</p>
          </Card>
        )}
      </div>

      {/* IN-APP DAILY DIGEST MODAL */}
      <Modal
        isOpen={isDigestModalOpen}
        onClose={() => setIsDigestModalOpen(false)}
        title={`Laboria In-App Daily Summary Digest (${dailyDigest.date})`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-2">
            <span className="text-[10px] font-mono text-brand-300 uppercase font-bold">TODAY'S HIGHLIGHT</span>
            <h4 className="text-base font-bold text-white font-display">
              {dailyDigest.newMatchesCount} New High Matches Found Today
            </h4>
            <p className="text-gray-200 text-xs">
              Top Opportunity Spotlight: <strong className="text-emerald-400">{dailyDigest.bestMatchTitle} @ {dailyDigest.bestMatchCompany}</strong> ({dailyDigest.bestMatchScore}% Profile Match).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <span className="text-[10px] font-mono text-purple-300 uppercase font-bold">RECOMMENDED ACTION</span>
            <p className="text-gray-200 text-xs leading-relaxed">{dailyDigest.recommendedAction}</p>
            <p className="text-amber-300 font-semibold">Priority Gap: {dailyDigest.prioritySkillGap}</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="accent"
              onClick={() => {
                setIsDigestModalOpen(false);
                navigate(dailyDigest.actionPath);
              }}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              {dailyDigest.actionLabel}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ALERT SETTINGS CONFIGURATOR MODAL */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Smart Job Alert Settings & Frequency Rules"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
            <span className="font-bold text-white">Global Alerts Enabled:</span>
            <button
              onClick={() => handleUpdateSettings({ enabled: !settings.enabled })}
              className={`w-10 h-5 rounded-full p-0.5 transition ${settings.enabled ? 'bg-brand-600' : 'bg-gray-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition ${settings.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-white">Minimum Match Score Threshold (%):</label>
            <input
              type="number"
              min={60}
              max={95}
              value={settings.minMatchScore}
              onChange={(e) => handleUpdateSettings({ minMatchScore: Number(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-white">Preferred Alert Categories:</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 'jobAlertsEnabled', label: 'Job Matches' },
                { key: 'interviewAlertsEnabled', label: 'Interview Reminders' },
                { key: 'learningAlertsEnabled', label: 'Skill Gap & Learning' },
                { key: 'careerAlertsEnabled', label: 'Career Insights' }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 p-2 rounded bg-gray-900 border border-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={(e) => handleUpdateSettings({ [item.key]: e.target.checked })}
                  />
                  <span className="text-gray-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="accent" onClick={() => setIsSettingsModalOpen(false)}>
              Save Alert Preferences
            </Button>
          </div>
        </div>
      </Modal>

      {/* AUTOMATED ENGINE DIAGNOSTIC TESTS MODAL */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Smart Job Alerts Diagnostic & Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
            <span>✓ Verified: Evaluated notification fatigue rules & zero duplicate alerts.</span>
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

function TargetIcon(props: any) {
  return <BookOpen {...props} />;
}
