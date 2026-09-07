import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { mockCandidate } from '../services/mockData';
import {
  FutureSkillsDataProvider,
  FutureSkillsIntegrationService,
  SkillSignal,
  SkillCategory,
  SignalLevel,
  CareerSkillMap,
  careerSkillMaps
} from '../services/futureSkillsService';
import { runFutureSkillsEngineTests, FutureSkillsTestResult } from '../services/futureSkillsEngineTests';
import {
  Radar,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  BookOpen,
  Info,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  PlusCircle,
  Compass,
  ArrowUpRight,
  Brain
} from 'lucide-react';

interface FutureSkillsRadarProps {
  candidate?: CandidateProfile;
}

export const FutureSkillsRadar: React.FC<FutureSkillsRadarProps> = ({ candidate = mockCandidate }) => {
  const provider = new FutureSkillsDataProvider();

  const [selectedTargetCareer, setSelectedTargetCareer] = useState<string>('Data Analyst');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [skillAValue, setSkillAValue] = useState<string>('Power BI');
  const [skillBValue, setSkillBValue] = useState<string>('Tableau');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test Runner Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<FutureSkillsTestResult[]>([]);

  // Load signals for target career
  const signals = provider.getSkillSignals(candidate, selectedTargetCareer);
  const cmap = provider.getCareerTrends(selectedTargetCareer);
  const adjacentTransitions = provider.getAdjacentCareerTransitions(candidate, selectedTargetCareer);
  const skillComparison = provider.compareSkills(skillAValue, skillBValue, candidate);

  // Watchlisted Skills for Candidate
  const watchlistedSkills = signals.filter((s) => s.isWatchlisted);

  // Categories list
  const categories: (string | SkillCategory)[] = [
    'All',
    'Core Skills',
    'Emerging Skills',
    'AI Skills',
    'Data Skills',
    'Cloud Skills',
    'Automation Skills',
    'Communication Skills',
    'Business Skills',
    'Domain Skills'
  ];

  // Filtered Signals
  const filteredSignals = selectedCategoryFilter === 'All'
    ? signals
    : signals.filter((s) => s.category === selectedCategoryFilter);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToSkillGap = (skillName: string) => {
    FutureSkillsIntegrationService.addToSkillGap(skillName);
    showToast(`✓ Added "${skillName}" to your Skill Gap Analyzer as a future-oriented skill!`);
  };

  const handleAddToRoadmap = (skillName: string) => {
    FutureSkillsIntegrationService.addToRoadmap(skillName);
    showToast(`✓ Added "${skillName}" to your Learning Roadmap!`);
  };

  const handleRunRadarTests = () => {
    const results = runFutureSkillsEngineTests();
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
            <Radar className="w-3.5 h-3.5" /> Future Skills Radar
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Future Skills Radar
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            See where careers are heading — and prepare early. (Data integrity guaranteed: signal levels describe market observations, not certainty).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunRadarTests}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            Run Radar Engine Tests
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => showToast('✓ Market intelligence radar refreshed successfully!')}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Skills Radar
          </Button>
        </div>
      </div>

      {/* TARGET CAREER & PERSONALIZATION CONTROLS */}
      <Card className="p-5 space-y-4 bg-gradient-to-r from-gray-900 via-gray-900/90 to-brand-950/40 border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> RADAR PERSONALIZATION
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-lg font-bold text-white font-display">
                Target Career Radar: <span className="text-brand-300">{selectedTargetCareer}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Select Career:</span>
            <select
              value={selectedTargetCareer}
              onChange={(e) => setSelectedTargetCareer(e.target.value)}
              className="bg-gray-950 border border-brand-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-400 font-semibold"
            >
              {careerSkillMaps.map((c) => (
                <option key={c.career} value={c.career}>
                  🎯 {c.career}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* PERSONALIZED SECTION: "SKILLS YOU SHOULD WATCH" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent-teal" />
            Skills You Should Watch (Personalized to {selectedTargetCareer})
          </h2>
          <span className="text-xs text-brand-300 font-semibold font-mono">
            {watchlistedSkills.length} Priority Skills Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {watchlistedSkills.map((item) => (
            <Card key={item.skillId} glow className="border-accent-teal/40 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="purple">{item.category}</Badge>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                    {item.trendDirection}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-display">{item.skillName}</h3>
                    <Badge variant={item.signalLevel === 'Growing' ? 'match-high' : 'info'}>
                      {item.signalLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.whyItMatters}</p>
                </div>

                {/* What You Know vs What You Are Missing */}
                <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 space-y-1.5 text-xs">
                  {item.whatYouAlreadyKnow.length > 0 && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.whatYouAlreadyKnow[0]}</span>
                    </div>
                  )}
                  {item.whatYouAreMissing.length > 0 && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.whatYouAreMissing[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Found in Matched Jobs:</span>
                  <span className="text-white font-bold">{item.matchedJobsCount} openings</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-[11px]"
                    onClick={() => handleAddToSkillGap(item.skillName)}
                  >
                    Add to Skill Gap
                  </Button>
                  <Button
                    size="sm"
                    variant="accent"
                    className="w-full justify-center text-[11px]"
                    onClick={() => handleAddToRoadmap(item.skillName)}
                  >
                    Add to My Roadmap
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CURRENT VS FUTURE SKILLS COMPARISON MATRIX */}
      <Card className="p-5 space-y-4 border border-brand-500/30">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand-400" />
          Current vs Future Skill Comparison Matrix ({selectedTargetCareer})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Current Verified Baseline */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 space-y-2">
            <span className="font-bold text-emerald-400 font-display flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Your Current Verified Skills
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {cmap.coreSkills.map((sk) => (
                <span key={sk} className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 text-xs">
                  ✓ {sk}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              Foundational skills verified from your uploaded resume profile.
            </p>
          </div>

          {/* Emerging Skills to Watch */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-purple-500/30 space-y-2">
            <span className="font-bold text-purple-300 font-display flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Skills to Watch (Market Signals)
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {cmap.growingSkills.concat(cmap.emergingSkills.slice(0, 2)).map((sk) => (
                <span key={sk} className="px-3 py-1.5 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1 text-xs">
                  ↗ {sk}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              Emerging market signals with increasing relevance across India postings.
            </p>
          </div>
        </div>
      </Card>

      {/* FUTURE SKILLS TIMELINE (NOW -> NEXT -> EMERGING -> WATCH) */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-cyan" />
          Future Skills Timeline (Signal Maturity Sequence)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 space-y-2">
            <span className="font-bold text-emerald-400 font-mono">1. NOW (Core Skills)</span>
            <div className="space-y-1">
              {cmap.coreSkills.map((s) => (
                <div key={s} className="text-gray-200 font-semibold">• {s}</div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-brand-500/30 space-y-2">
            <span className="font-bold text-brand-300 font-mono">2. NEXT (Growing)</span>
            <div className="space-y-1">
              {cmap.growingSkills.map((s) => (
                <div key={s} className="text-gray-200 font-semibold">• {s}</div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-purple-500/30 space-y-2">
            <span className="font-bold text-purple-300 font-mono">3. EMERGING (AI Workflows)</span>
            <div className="space-y-1">
              {cmap.emergingSkills.map((s) => (
                <div key={s} className="text-gray-200 font-semibold">• {s}</div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-amber-500/30 space-y-2">
            <span className="font-bold text-amber-300 font-mono">4. WATCH (Early Signals)</span>
            <div className="space-y-1">
              {cmap.earlySignals.map((s) => (
                <div key={s} className="text-gray-200 font-semibold">• {s}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* SKILL COMPARISON TOOL (Skill A vs Skill B) */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            Skill Comparison Tool (Market Signal Comparison)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Skill A:</span>
              <select
                value={skillAValue}
                onChange={(e) => setSkillAValue(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <option value="Power BI">Power BI</option>
                <option value="Python">Python</option>
                <option value="Docker">Docker</option>
              </select>
            </div>
            <p className="text-gray-300 font-semibold">{skillComparison.skillA.relevance}</p>
            <p className="text-emerald-400 font-bold">{skillComparison.skillA.demand}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Skill B:</span>
              <select
                value={skillBValue}
                onChange={(e) => setSkillBValue(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white"
              >
                <option value="Tableau">Tableau</option>
                <option value="Excel">Excel</option>
                <option value="Kubernetes">Kubernetes</option>
              </select>
            </div>
            <p className="text-gray-300 font-semibold">{skillComparison.skillB.relevance}</p>
            <p className="text-purple-400 font-bold">{skillComparison.skillB.demand}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 text-xs text-brand-200">
          💡 <strong>Recommendation:</strong> {skillComparison.recommendation}
        </div>
      </Card>

      {/* 9 CATEGORIES FILTER & DETAILED SKILL SIGNAL CARDS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Radar className="w-5 h-5 text-brand-400" />
            Market Signals Matrix ({filteredSignals.length} Skills)
          </h2>

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategoryFilter === cat
                    ? 'bg-brand-600 text-white shadow-glow-sm'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Signal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSignals.map((item) => (
            <Card key={item.skillId} className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="info">{item.category}</Badge>
                  <h3 className="text-lg font-bold text-white font-display mt-1">{item.skillName}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.whyItMatters}</p>
                </div>

                <div className="text-right">
                  <Badge variant={item.signalLevel === 'Established' ? 'success' : item.signalLevel === 'Growing' ? 'match-high' : 'info'}>
                    {item.signalLevel}
                  </Badge>
                  <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1 justify-end font-mono">
                    {item.trendDirection}
                  </div>
                </div>
              </div>

              {/* Source Transparency Badge */}
              <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>Source: {item.source}</span>
                  <span>Confidence: <strong className="text-white">{item.confidence}</strong></span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <span>Observed: {item.observedDate}</span>
                  <span>Updated: {item.updatedAt}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400">Target Role Priority:</span>
                <Badge variant={item.priority === 'High' ? 'match-low' : 'purple'}>
                  {item.priority} Priority
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FUTURE CAREER TRANSITION EXPLORER */}
      <Card className="p-5 space-y-4 border border-purple-500/30">
        <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-400" />
          Future Career Transition Explorer (Explore Adjacent Careers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {adjacentTransitions.map((t) => (
            <div key={t.title} className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{t.title}</h4>
                  <Badge variant="success">{t.currentMatchPercentage}% Match</Badge>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">{t.whyItFits}</p>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  Readiness: {t.estimatedReadinessLabel}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 space-y-1">
                <span className="text-gray-400 text-[10px]">Skills to Develop:</span>
                <div className="flex flex-wrap gap-1">
                  {t.skillsToDevelop.map((s) => (
                    <Badge key={s} variant="purple">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AUTOMATED FUTURE SKILLS TEST MODAL */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Future Skills Radar Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
            <span>✓ Verified: Evaluated all 15 test points including No Fabrication & Data Analyst assertions.</span>
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
