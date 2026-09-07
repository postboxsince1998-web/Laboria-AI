import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CandidateProfile } from '../types';
import { DashboardIntelligenceService } from '../services/dashboardIntelligenceService';
import { runDashboardEngineTests, DashboardTestResult } from '../services/dashboardEngineTests';
import {
  Sparkles,
  Award,
  Briefcase,
  MapPin,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  Bot,
  Radar,
  Radio,
  BookOpen,
  Calendar,
  MessageSquareCode,
  CheckCircle2,
  Play,
  X,
  CheckSquare,
  ShieldCheck,
  Compass,
  Building2,
  Clock,
  Layers,
  HelpCircle,
  ChevronRight
} from 'lucide-react';


interface DashboardProps {
  candidate: CandidateProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Modals & Test State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<DashboardTestResult[] | null>(null);

  // Aggregated Intelligence Data
  const summary = useMemo(
    () => DashboardIntelligenceService.getDashboardSummary(candidate),
    [candidate]
  );

  const handleRunDiagnostics = () => {
    const results = runDashboardEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Welcome & Control Center Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-950/80 via-gray-900 to-gray-900 shadow-glow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
            <Zap className="w-3.5 h-3.5 text-accent-teal" /> AI Career Intelligence Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wide">
            Welcome back, <span className="text-brand-300">{candidate.fullName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Laboria AI continuously evaluates job opportunities across India, skill gaps, learning progress, and interview readiness for your target role: <strong className="text-white">{candidate.targetRoles[0] || 'Full Stack Engineer'}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunDiagnostics}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all shadow-sm"
          >
            <Play className="w-4 h-4 text-accent-teal" />
            Run Diagnostics (12 Tests)
          </button>

          <button
            onClick={() => navigate('/resume-match')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            Upload New Resume
          </button>
        </div>
      </div>

      {/* 2. WHAT SHOULD I DO TODAY? (Max 3 High-Value Actions) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-teal" />
            <h2 className="text-lg font-display font-bold text-white tracking-wide">What Should I Do Today?</h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Max 3 prioritized actions • Zero cognitive overload
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.todayActions.map((action) => (
            <div
              key={action.id}
              className="glass-card p-5 rounded-2xl border border-brand-500/30 bg-brand-950/20 flex flex-col justify-between space-y-4 hover:border-brand-500/60 transition-all shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-brand-950 text-accent-teal border border-brand-500/30">
                    {action.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {action.priority} Priority
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">{action.description}</p>
              </div>

              <button
                onClick={() => navigate(action.actionPath, { state: action.actionPayload })}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white flex items-center justify-between transition-all shadow-glow-sm"
              >
                <span>{action.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CAREER HEALTH INDEX (5 Dimensions, Zero Fabrication) */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 bg-gray-900/80">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-display font-bold text-white">Empirical Career Health Index</h2>
              <p className="text-xs text-gray-400 font-mono">
                Computed strictly from candidate profile, applications, and readiness data
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-display font-extrabold text-accent-teal">
              {summary.health.overallHealthScore}%
            </span>
            <span className="ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {summary.health.healthBand}
            </span>
          </div>
        </div>

        {/* 5-Dimensional Health Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-gray-300 font-mono">
              <span>1. Readiness</span>
              <span className="font-bold text-white">{summary.health.jobReadinessScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${summary.health.jobReadinessScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-gray-300 font-mono">
              <span>2. Skills</span>
              <span className="font-bold text-white">{summary.health.skillDevelopmentScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${summary.health.skillDevelopmentScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-gray-300 font-mono">
              <span>3. Activity</span>
              <span className="font-bold text-white">{summary.health.jobSearchActivityScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${summary.health.jobSearchActivityScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-gray-300 font-mono">
              <span>4. Interview</span>
              <span className="font-bold text-white">{summary.health.interviewPrepScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${summary.health.interviewPrepScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-gray-300 font-mono">
              <span>5. Alignment</span>
              <span className="font-bold text-white">{summary.health.careerAlignmentScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-accent-teal h-1.5 rounded-full" style={{ width: `${summary.health.careerAlignmentScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. CENTRAL CONTROL CENTER INTELLIGENCE GRID (Mobile Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Career Readiness Score */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-400" /> 1. Career Readiness Score
              </span>
              <span className="text-xs font-bold text-accent-teal">{summary.health.jobReadinessScore}%</span>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Evaluated across Resume Quality, Technical Fit, Soft Skills, and Portfolio Evidence.
            </p>
          </div>
          <button
            onClick={() => navigate('/readiness')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>View Full Readiness Score</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 2: Best Job Matches */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400" /> 2. Best Job Matches
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {summary.bestMatches.length} Matches
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {summary.bestMatches.map((m) => (
                <div key={m.job.id} className="p-2 rounded-lg bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white truncate block">{m.job.title}</span>
                    <span className="text-[10px] text-gray-400 truncate block">{m.job.company}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-950 text-accent-teal border border-brand-500/30">
                    {m.overallMatchScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/resume-match')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Explore All Job Matches</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 3: New Job Watch Matches */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-400" /> 3. AI Job Watch
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Auto-Evaluated
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Laboria AI automatically evaluates new permitted job feeds against your candidate profile.
            </p>
          </div>
          <button
            onClick={() => navigate('/job-watch')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Open AI Job Watch Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: Current Skill Gaps */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" /> 4. Current Skill Gaps
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Action Gaps
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Power BI', 'System Design', 'Kafka', 'Vector DBs'].map((sk, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px]">
                  ⚠ {sk}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/skill-gap')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Bridge Skill Gaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 5: Learning Roadmap */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent-teal" /> 5. Learning Roadmap
              </span>
              <span className="text-xs font-bold text-accent-teal">{summary.learningProgress.overallCompletionPercentage}%</span>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              {summary.learningProgress.completedSkillsCount} skills verified • {summary.learningProgress.totalHoursLogged} hrs practice logged.
            </p>
          </div>
          <button
            onClick={() => navigate('/learning')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Open Learning Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 6: Future Skills Radar */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Radar className="w-4 h-4 text-purple-400" /> 6. Future Skills Radar
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Surging
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Generative AI, LangChain RAG & Kafka Event Streaming are surging across tech roles in India.
            </p>
          </div>
          <button
            onClick={() => navigate('/radar')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Explore Future Skill Signals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 7: Application Status */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-400" /> 7. Application Status
              </span>
              <span className="text-xs font-bold text-white">{summary.applicationsCount} Apps</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-2 font-mono">
              <span>Interviews: <strong className="text-purple-300">{summary.interviewsCount}</strong></span>
              <span>Offers: <strong className="text-emerald-400">{summary.offersCount}</strong></span>
              <span>Response Rate: <strong className="text-accent-teal">{summary.responseRate}%</strong></span>
            </div>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Manage Application Tracker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 8: Upcoming Interviews */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <MessageSquareCode className="w-4 h-4 text-purple-400" /> 8. Upcoming Interviews
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Scheduled
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              System Design Interview with <strong>TechCorp India</strong> scheduled. Practice STAR responses.
            </p>
          </div>
          <button
            onClick={() => navigate('/interview-prep')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-between transition-colors shadow-glow-sm"
          >
            <span>Launch AI Interview Coach</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 9: Career Path */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-accent-teal" /> 9. Career Path Navigator
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-accent-teal border border-brand-500/30">
                Target Role
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Transition blueprint ready: <strong>Full Stack Engineer → AI Solutions Architect</strong> (88% Readiness).
            </p>
          </div>
          <button
            onClick={() => navigate('/navigator')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors flex items-center justify-between"
          >
            <span>Explore Career Navigator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 10: AI Mentor Guidance */}
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between bg-gray-900/90 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-xs font-mono font-bold text-brand-300 uppercase flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-brand-400" /> 10. Personal AI Career Mentor
            </span>
            <span className="text-xs text-gray-400 font-mono">Context-Aware Guidance</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-300">
              "Your candidate profile has strong technical overlap in React, TypeScript, and Node.js. Focus today on bridging Power BI and System Design to reach 95%+ match across enterprise roles."
            </p>
            <button
              onClick={() => navigate('/mentor')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex-shrink-0 flex items-center gap-1.5 transition-all shadow-glow-sm"
            >
              <Bot className="w-4 h-4" /> Ask AI Mentor
            </button>
          </div>
        </div>

      </div>

      {/* DIAGNOSTICS TEST RESULTS MODAL */}
      {isTestModalOpen && testResults && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-gray-800 overflow-hidden bg-gray-900 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-teal" />
                <div>
                  <h3 className="text-base font-bold text-white">Dashboard Diagnostic Results</h3>
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
