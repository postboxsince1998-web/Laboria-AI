import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateProfile, LearningResource, ProjectLearningItem, LearningResourceType } from '../types';
import { LearningHubService } from '../services/learningHubService';
import { runLearningHubEngineTests, LearningHubTestResult } from '../services/learningHubEngineTests';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Award,
  Play,
  Plus,
  Search,
  Filter,
  CheckSquare,
  X,
  Target,
  FolderPlus,
  FileText,
  MessageSquareCode,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

interface LearningHubProps {
  candidate: CandidateProfile;
}

export const LearningHub: React.FC<LearningHubProps> = ({ candidate: initialCandidate }) => {
  const navigate = useNavigate();

  // State Management
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [activeTab, setActiveTab] = useState<'today' | 'roadmap' | 'matrix' | 'resources' | 'projects' | 'pathways'>('today');

  // Daily Tasks State
  const [dailyTasks, setDailyTasks] = useState(() => LearningHubService.getTodayLearningTasks(candidate));

  // Projects State
  const [projects, setProjects] = useState<ProjectLearningItem[]>(() => LearningHubService.getProjectSuggestions(candidate));

  // Resources Filter State
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('ALL');

  // Modals State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedSkillToVerify, setSelectedSkillToVerify] = useState<string>('');
  const [verifyEvidenceText, setVerifyEvidenceText] = useState('');

  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({
    title: '',
    provider: '',
    skillName: 'System Design',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    duration: '3 Hours',
    costLabel: '100% Free (User Added)',
    url: 'https://developer.mozilla.org',
    type: 'User Created' as LearningResourceType
  });

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<LearningHubTestResult[] | null>(null);

  // Derived Progress Statistics
  const completedProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'Completed' || p.status === 'Verified').length,
    [projects]
  );

  const progressStats = useMemo(
    () => LearningHubService.calculateProgress(candidate, completedProjectsCount),
    [candidate, completedProjectsCount]
  );

  const resourceProvider = LearningHubService.getResourceProvider();
  const allResources = useMemo(() => resourceProvider.getAllVerifiedResources(), [isAddResourceModalOpen]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return allResources.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.provider.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.skillName.toLowerCase().includes(resourceSearch.toLowerCase());

      const matchesCat = resourceCategoryFilter === 'ALL' || r.type === resourceCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [allResources, resourceSearch, resourceCategoryFilter]);

  // Toggle Daily Task Completion
  const handleToggleTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  // Submit Skill Verification
  const handleVerifySkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillToVerify || !verifyEvidenceText) return;

    const updated = LearningHubService.verifyAndCompleteSkill(
      candidate,
      selectedSkillToVerify,
      verifyEvidenceText
    );
    setCandidate(updated);
    setIsVerifyModalOpen(false);
    setSelectedSkillToVerify('');
    setVerifyEvidenceText('');
  };

  // Add Custom User Resource
  const handleAddCustomResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceForm.title || !newResourceForm.url) return;

    resourceProvider.addCustomUserResource({
      title: newResourceForm.title,
      provider: newResourceForm.provider || 'User Submission',
      skillName: newResourceForm.skillName,
      difficulty: newResourceForm.difficulty,
      duration: newResourceForm.duration,
      isFree: true,
      costLabel: newResourceForm.costLabel,
      url: newResourceForm.url,
      type: newResourceForm.type
    });

    setIsAddResourceModalOpen(false);
    setNewResourceForm({
      title: '',
      provider: '',
      skillName: 'System Design',
      difficulty: 'Intermediate',
      duration: '3 Hours',
      costLabel: '100% Free (User Added)',
      url: 'https://developer.mozilla.org',
      type: 'User Created'
    });
  };

  // Run Test Suite
  const handleRunDiagnostics = () => {
    const results = runLearningHubEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-teal flex items-center justify-center text-white shadow-glow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white tracking-wide">
                AI Learning Hub
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Convert career goals and skill gaps into actionable, verified learning.
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
            onClick={() => setIsAddResourceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom Resource
          </button>
        </div>
      </div>

      {/* Progress Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1 bg-gradient-to-br from-brand-950/40 to-gray-900">
          <p className="text-[11px] font-mono uppercase text-brand-300">Overall Progress</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-extrabold text-accent-teal">
              {progressStats.overallCompletionPercentage}%
            </span>
            <Zap className="w-4 h-4 text-accent-teal" />
          </div>
          <p className="text-[10px] text-gray-400">Milestone completion score</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Verified Skills</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-emerald-400">
              {progressStats.completedSkillsCount}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[10px] text-gray-500">Proven with evidence</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Skills To Learn</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-amber-300">
              {progressStats.inProgressSkillsCount}
            </span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[10px] text-gray-500">Active target gaps</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Portfolio Projects</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-purple-300">
              {progressStats.completedProjectsCount} / {projects.length}
            </span>
            <FolderPlus className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-[10px] text-gray-500">Hands-on capstones</p>
        </div>

        <div className="col-span-2 md:col-span-1 glass-card p-4 rounded-xl border border-gray-800/80 space-y-1">
          <p className="text-[11px] font-mono uppercase text-gray-400">Hours Logged</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-white">
              {progressStats.totalHoursLogged} hrs
            </span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-[10px] text-gray-500">Cumulative practice time</p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'today'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Today's Learning
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'roadmap'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          My Learning Roadmap
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'matrix'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <Target className="w-4 h-4" />
          Skills Matrix
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Recommended Free Resources ({filteredResources.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Project-Based Learning
        </button>
      </div>

      {/* TAB 1: TODAY'S LEARNING */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-teal" />
              Today's Actionable Learning Tasks
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              Bite-sized daily tasks tailored to {candidate.targetRoles[0] || 'Target Role'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className={`glass-card p-5 rounded-2xl border transition-all space-y-3 ${
                  task.isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20 opacity-85'
                    : 'border-gray-800 hover:border-brand-500/50 bg-gray-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        task.type === 'Learn'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : task.type === 'Practice'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : task.type === 'Build'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {task.type}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{task.duration}</span>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      task.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {task.isCompleted ? 'Completed' : 'Mark Done'}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{task.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{task.description}</p>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-brand-300">
                    Target Skill: <strong>{task.skillName}</strong>
                  </span>

                  <button
                    onClick={() => navigate('/mentor')}
                    className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
                  >
                    Ask AI Mentor <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY LEARNING ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-display">Personalized Multi-Stage Learning Roadmap</h2>
              <p className="text-xs text-gray-400 font-mono">
                Milestone pathway to achieve 95%+ readiness for {candidate.targetRoles[0] || 'Target Role'}
              </p>
            </div>
          </div>

          <div className="border-l-2 border-brand-500/40 ml-3 pl-6 space-y-6 py-2">
            <div className="relative space-y-2">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                1
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Stage 1: Core Skill Gap Mastery</h3>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  Est. 30 Hours
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Bridge critical gaps in System Design, LangChain, and vector embeddings through interactive official documentation.
              </p>
            </div>

            <div className="relative space-y-2">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                2
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Stage 2: Hands-On Capstone Project Building</h3>
                <span className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                  Est. 45 Hours
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Construct and deploy high-throughput microservices and vector RAG search bots connected to your portfolio.
              </p>
            </div>

            <div className="relative space-y-2">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                3
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Stage 3: Verification & Interview Preparation</h3>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Est. 15 Hours
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Log verified project evidence on candidate profile and practice tailored questions in AI Interview Coach.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">Skills Matrix (Active vs Completed)</h2>
            <button
              onClick={() => {
                setSelectedSkillToVerify(candidate.skills[0]?.name || 'System Design');
                setIsVerifyModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-glow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify & Complete Skill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verified / Completed Skills */}
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Verified & Completed Skills
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {candidate.skills.filter((s) => s.verified || s.source === 'verified').length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {candidate.skills
                  .filter((s) => s.verified || s.source === 'verified')
                  .map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{s.name}</span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          Source: {s.source} • Level: {s.level || 'Advanced'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Verified ✓
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* In-Progress / Target Skills */}
            <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Skills To Acquire & Master
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Active Gaps
                </span>
              </div>

              <div className="space-y-2">
                {['System Design', 'Kafka', 'Kubernetes', 'Vector Databases', 'Generative UI'].map((sk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{sk}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">Est. 25-40 Hours</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSkillToVerify(sk);
                        setIsVerifyModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
                    >
                      Verify Skill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDED FREE RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search verified free resources by title, provider, skill..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="relative">
              <select
                value={resourceCategoryFilter}
                onChange={(e) => setResourceCategoryFilter(e.target.value)}
                className="bg-gray-900/80 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Official Documentation">Official Documentation</option>
                <option value="Free Course">Free Courses</option>
                <option value="Free Tutorial">Free Tutorials</option>
                <option value="Open Educational Resource">Open Educational Resources (OER)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => (
              <div key={res.id} className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-brand-500/50 transition-all space-y-3 bg-gray-900/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-accent-teal border border-brand-500/30">
                      {res.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {res.costLabel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{res.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Provider: <strong className="text-gray-200">{res.provider}</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800/80 text-xs">
                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[11px]">
                    <div className="p-1.5 rounded bg-gray-950/60 text-gray-300 border border-gray-800">
                      Skill: {res.skillName}
                    </div>
                    <div className="p-1.5 rounded bg-gray-950/60 text-gray-300 border border-gray-800">
                      Level: {res.difficulty}
                    </div>
                    <div className="p-1.5 rounded bg-gray-950/60 text-gray-300 border border-gray-800">
                      Duration: {res.duration}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-gray-500">{res.lastVerified}</span>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-accent-teal hover:text-white transition-colors"
                    >
                      Open Verified Resource <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECT-BASED LEARNING */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" />
              Project-Based Learning Blueprints
            </h2>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 bg-gray-900/90">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                      Skill Capstone: {proj.skillName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{proj.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{proj.description}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : proj.status === 'In Progress'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-gray-400 block">
                    Key Deliverables:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {proj.deliverables.map((del, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-950 text-gray-300 border border-gray-800 text-xs">
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connection Controls */}
                <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <span className={proj.linkedToPortfolio ? 'text-emerald-400 font-semibold' : ''}>
                      {proj.linkedToPortfolio ? '✓ Linked to Portfolio' : '+ Add to Portfolio'}
                    </span>
                    <span>•</span>
                    <span className={proj.linkedToResume ? 'text-emerald-400 font-semibold' : ''}>
                      {proj.linkedToResume ? '✓ Linked to Resume' : '+ Add to Resume'}
                    </span>
                  </div>

                  {proj.interviewPrepPayload && (
                    <button
                      onClick={() =>
                        navigate('/interview-prep', { state: proj.interviewPrepPayload })
                      }
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-all shadow-glow-sm"
                    >
                      <MessageSquareCode className="w-4 h-4" />
                      Practice in AI Interview Coach
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SKILL VERIFICATION */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-gray-800 overflow-hidden bg-gray-900">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Verify & Log Skill Evidence
              </h3>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySkill} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Target Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedSkillToVerify}
                  onChange={(e) => setSelectedSkillToVerify(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Verified Evidence / Project Link
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your hands-on evidence (e.g. Built microservices repo handling 50k requests/min with unit test suite)..."
                  value={verifyEvidenceText}
                  onChange={(e) => setVerifyEvidenceText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-sm transition-all"
                >
                  Verify Skill & Log Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM RESOURCE */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-gray-800 overflow-hidden bg-gray-900">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                Add Custom Free Learning Resource
              </h3>
              <button
                onClick={() => setIsAddResourceModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomResource} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Developer Guide"
                  value={newResourceForm.title}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                  Verified URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://developer.mozilla.org"
                  value={newResourceForm.url}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, url: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={newResourceForm.provider}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, provider: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-1">
                    Target Skill
                  </label>
                  <input
                    type="text"
                    value={newResourceForm.skillName}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, skillName: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm transition-all"
                >
                  Save Resource
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
                  <h3 className="text-base font-bold text-white">Learning Hub Diagnostic Results</h3>
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
