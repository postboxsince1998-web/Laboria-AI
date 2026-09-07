import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile, FinalInterviewReadinessReport, InterviewSimulatorConfig, JobOpening, SimulatorDifficulty, SimulatorRoundType } from '../types';
import { seedJobs } from '../data/seedData';
import { AnswerEvaluation, InterviewSession, MockQuestion, QuestionDifficulty } from '../services/interviewCoachService';
import { InterviewSimulatorService, SavedInterviewHistoryService } from '../services/interviewSimulatorService';
import { runAdvancedInterviewSimulatorEngineTests, AdvancedInterviewSimulatorTestReport } from '../services/advancedInterviewSimulatorEngineTests';
import {
  MessageSquareCode,
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Compass,
  Target,
  Bot,
  FileText,
  Building2,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  History,
  TrendingUp,
  SlidersHorizontal as Sliders,
  ArrowRight
} from 'lucide-react';

interface AIInterviewSimulatorProps {
  candidate: CandidateProfile;
}

export const AIInterviewSimulator: React.FC<AIInterviewSimulatorProps> = ({ candidate }) => {
  const navigate = useNavigate();

  // Active View State: 'setup' | 'arena' | 'report' | 'history'
  const [viewState, setViewState] = useState<'setup' | 'arena' | 'report' | 'history'>('setup');

  // Config State
  const [selectedJob, setSelectedJob] = useState<JobOpening>(seedJobs[0]);
  const [roundType, setRoundType] = useState<SimulatorRoundType>('Full Simulation');
  const [difficulty, setDifficulty] = useState<SimulatorDifficulty>('Adaptive');
  const [timeLimit, setTimeLimit] = useState<number>(120); // 120 seconds default

  // Active Simulation State
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answersList, setAnswersList] = useState<{ question: MockQuestion; userAnswer: string; evaluation: AnswerEvaluation }[]>([]);

  // Active Timer State
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [currentDiff, setCurrentDiff] = useState<QuestionDifficulty>('Intermediate');

  // Report & History State
  const [finalReport, setFinalReport] = useState<FinalInterviewReadinessReport | null>(null);
  const [history, setHistory] = useState<InterviewSession[]>([]);

  // Diagnostics Suite Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testReport, setTestReport] = useState<AdvancedInterviewSimulatorTestReport | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(SavedInterviewHistoryService.getHistory(candidate));
  }, [candidate]);

  // Countdown timer effect during active arena
  useEffect(() => {
    if (viewState !== 'arena' || timeLimit === 0) return;
    setTimeLeft(timeLimit);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, viewState, timeLimit]);

  // Start Simulation
  const handleStartSimulation = () => {
    const config: InterviewSimulatorConfig = {
      roundType,
      difficulty,
      timeLimitSecondsPerQuestion: timeLimit,
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      company: selectedJob.company
    };

    const generated = InterviewSimulatorService.generateSimulationQuestions(candidate, config, selectedJob);
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswersList([]);
    setUserAnswer('');
    setCurrentDiff('Intermediate');
    setViewState('arena');
  };

  // Submit Active Question Answer
  const handleSubmitAnswer = () => {
    if (!questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    const evaluation = InterviewSimulatorService.evaluateAnswer(currentQ, userAnswer || '(No response provided within time limit)', candidate, timeLimit - timeLeft);

    const updatedAnswers = [
      ...answersList,
      {
        question: currentQ,
        userAnswer: userAnswer || '(No response provided)',
        evaluation
      }
    ];
    setAnswersList(updatedAnswers);

    // Adaptive difficulty adjustment
    if (difficulty === 'Adaptive') {
      const nextDiff = InterviewSimulatorService.evaluateAdaptiveDifficulty(currentDiff, evaluation.overallScore);
      setCurrentDiff(nextDiff);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
    } else {
      // Simulation Complete: Calculate Session & Generate Report
      const totalScoreSum = updatedAnswers.reduce((acc, item) => acc + item.evaluation.overallScore, 0);
      const avgScore = Math.round(totalScoreSum / updatedAnswers.length);

      const session: InterviewSession = {
        id: `sim_sess_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        mode: 'Job-Specific',
        type: roundType as any,
        totalScore: avgScore,
        technicalScore: Math.round(avgScore * 1.05 > 100 ? 95 : avgScore * 1.05),
        communicationScore: Math.round(avgScore * 0.95),
        structureScore: Math.round(avgScore * 0.98),
        roleKnowledgeScore: Math.round(avgScore * 1.02 > 100 ? 96 : avgScore * 1.02),
        behavioralScore: Math.round(avgScore * 0.94),
        scoreBreakdown: {
          technicalMath: `${avgScore}% x 0.35`,
          communicationMath: `${avgScore}% x 0.20`,
          structureMath: `${avgScore}% x 0.15`,
          roleKnowledgeMath: `${avgScore}% x 0.15`,
          behavioralMath: `${avgScore}% x 0.15`,
          totalMath: `${avgScore}%`
        },
        questionsAnswered: updatedAnswers,
        strengths: ['Structured technical context', 'Clear role alignment'],
        improvements: ['Incorporate quantifiable metrics in STAR results']
      };

      const updatedHistory = SavedInterviewHistoryService.saveSession(session, candidate);
      setHistory(updatedHistory);

      const report = InterviewSimulatorService.generateFinalReadinessReport(session, candidate, selectedJob);
      setFinalReport(report);
      setViewState('report');
    }
  };

  const handleRunDiagnostics = () => {
    const report = runAdvancedInterviewSimulatorEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
              <MessageSquareCode className="w-3.5 h-3.5" /> Step 19: Advanced AI Interview Simulator
            </div>
            <h1 className="text-2xl font-bold text-white font-display">
              Advanced AI Interview Simulator
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              6 Round Types, Adaptive Difficulty, Real-Time Timer & Final Readiness Reports. <strong className="text-brand-300">Model answers strictly labeled "Reference Answer".</strong>
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
              variant={viewState === 'history' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewState('history')}
              icon={<History className="w-4 h-4" />}
            >
              Interview History ({history.length})
            </Button>
            <Button
              variant={viewState === 'setup' ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setViewState('setup')}
              icon={<Zap className="w-4 h-4" />}
            >
              New Simulation
            </Button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SETUP & CONFIGURATION */}
      {viewState === 'setup' && (
        <Card glow>
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" /> Configure Interview Simulation Parameters
              </h3>
              <p className="text-gray-400 mt-1">
                Customize target opportunity, specialized round type, difficulty mode, and question timer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Job Selector */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Target Job Description</label>
                <select
                  value={selectedJob.id}
                  onChange={(e) => {
                    const found = seedJobs.find((j) => j.id === e.target.value);
                    if (found) setSelectedJob(found);
                  }}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-brand-500"
                >
                  {seedJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company} ({typeof j.location === 'string' ? j.location : String(j.location || '')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Round Type Selector */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Specialized Round Type</label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value as SimulatorRoundType)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Full Simulation">🔥 6-Round Full Simulation (Sequential Multi-Round)</option>
                  <option value="Technical">💻 Technical Round (Algorithmic & System Design)</option>
                  <option value="HR">🤝 HR & Cultural Fit Round</option>
                  <option value="Behavioral">⭐ Behavioral STAR Round</option>
                  <option value="Resume">📄 Resume & Project Deep Dive Round</option>
                  <option value="Situational">🚨 Situational & Incident Response Round</option>
                  <option value="Company-Specific">🏢 Company-Specific & Product Strategy Round</option>
                </select>
              </div>

              {/* Difficulty Mode */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Difficulty Mode</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as SimulatorDifficulty)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs"
                >
                  <option value="Adaptive">⚡ Adaptive Difficulty (Auto-adjusts based on performance)</option>
                  <option value="Beginner">🟢 Beginner Level</option>
                  <option value="Intermediate">🟡 Intermediate Level</option>
                  <option value="Advanced">🔴 Advanced / Staff Engineer Level</option>
                </select>
              </div>

              {/* Timer Limit Dropdown */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Per-Question Time Limit</label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 font-bold text-xs"
                >
                  <option value={60}>⏱️ 60 Seconds (Fast Blitz)</option>
                  <option value={120}>⏱️ 120 Seconds (Standard 2 Mins)</option>
                  <option value={180}>⏱️ 180 Seconds (Extended 3 Mins)</option>
                  <option value={0}>♾️ Untimed / Practice Mode</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <Button size="lg" variant="accent" onClick={handleStartSimulation} icon={<Play className="w-4 h-4" />}>
                Launch Interview Simulation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* VIEW 2: ACTIVE SIMULATION ARENA */}
      {viewState === 'arena' && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Header & Timer Bar */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-4 flex-wrap text-xs">
            <div>
              <span className="text-brand-400 font-mono font-bold uppercase block text-[11px]">
                {questions[currentIndex]?.roundName || `Question ${currentIndex + 1} of ${questions.length}`}
              </span>
              <h3 className="text-white font-bold text-sm mt-0.5">{questions[currentIndex]?.topic}</h3>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={currentDiff === 'Advanced' ? 'match-high' : 'match-mid'}>
                Difficulty: {currentDiff}
              </Badge>

              {timeLimit > 0 && (
                <div className={`flex items-center gap-1.5 font-mono text-sm font-extrabold px-3 py-1.5 rounded-xl border ${
                  timeLeft <= 20 ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse' : 'bg-gray-950 text-emerald-400 border-gray-800'
                }`}>
                  <Clock className="w-4 h-4" /> {timeLeft}s remaining
                </div>
              )}
            </div>
          </div>

          {/* Active Question Prompt */}
          <Card glow>
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                <span className="text-gray-400 font-semibold block mb-1">Interviewer Prompt:</span>
                <p className="text-white text-base font-display font-bold leading-relaxed">
                  "{questions[currentIndex]?.question}"
                </p>
              </div>

              {/* Framework Guidance Hint */}
              <div className="p-3 rounded-xl bg-brand-950/30 border border-brand-500/30 text-brand-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Recommended Framework Strategy ({questions[currentIndex]?.framework}):</span>
                  <span className="text-gray-300 text-[11px]">
                    {questions[currentIndex]?.contextHint}
                  </span>
                </div>
              </div>

              {/* Candidate Response Textarea */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Your Response:</label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response here using structured framework (STAR / Technical)..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 text-[11px]">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <Button size="md" variant="accent" onClick={handleSubmitAnswer} icon={<ArrowRight className="w-4 h-4" />}>
                  {currentIndex + 1 === questions.length ? 'Complete Simulation' : 'Submit & Next Question'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 3: FINAL INTERVIEW READINESS REPORT */}
      {viewState === 'report' && finalReport && (
        <div className="space-y-6">
          {/* Hero Overall Score Banner */}
          <Card glow className="bg-gradient-to-r from-gray-900 via-brand-950/40 to-gray-900 border-brand-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <Badge variant={finalReport.overallScore >= 80 ? 'success' : 'warning'} className="mb-2">
                  {finalReport.readinessStatus}
                </Badge>
                <h2 className="text-2xl font-bold text-white font-display">
                  Final Interview Readiness Report
                </h2>
                <p className="text-gray-300 mt-1">
                  Evaluated for <strong className="text-brand-300">{finalReport.jobTitle}</strong> at <strong className="text-white">{finalReport.company}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-950/80 border border-gray-800 p-4 rounded-2xl">
                <div className="text-center px-3">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Overall Simulation Score</span>
                  <div className="text-4xl font-extrabold text-brand-300 font-display mt-1">
                    {finalReport.overallScore}%
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 5-Category Evidence-Based Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {[
              { label: 'Technical (35%)', score: finalReport.categoryScores.technical },
              { label: 'Communication (20%)', score: finalReport.categoryScores.communication },
              { label: 'Structure (15%)', score: finalReport.categoryScores.structure },
              { label: 'Role Knowledge (15%)', score: finalReport.categoryScores.roleKnowledge },
              { label: 'Behavioral (15%)', score: finalReport.categoryScores.behavioral }
            ].map((cat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-center">
                <span className="text-gray-400 text-[11px] font-semibold block">{cat.label}</span>
                <span className="text-2xl font-bold text-white mt-1 block">{cat.score}%</span>
              </div>
            ))}
          </div>

          {/* Weak Topics & Personalized Prep Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Weak Topics */}
            <Card>
              <h3 className="text-base font-bold text-rose-400 font-display mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Weak Topics Detected ({finalReport.weakTopics.length})
              </h3>
              <div className="space-y-3">
                {finalReport.weakTopics.map((wt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{wt.topic}</span>
                      <Badge variant="match-low">{wt.averageScore}% Score</Badge>
                    </div>
                    <p className="text-gray-400 text-[11px]">{wt.recommendation}</p>
                    <button
                      onClick={() => navigate(wt.actionModulePath)}
                      className="text-brand-300 hover:text-brand-200 text-[11px] font-semibold flex items-center gap-1 mt-1"
                    >
                      Open {wt.actionModulePath === '/skill-gap' ? 'Skill Gap Analyzer' : 'Learning Hub'} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Personalized Prep Plan */}
            <Card>
              <h3 className="text-base font-bold text-emerald-400 font-display mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Personalized Preparation Plan
              </h3>
              <div className="space-y-3">
                {finalReport.personalizedPrepPlan.map((plan, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">{plan.timeframe}</span>
                    <p className="text-gray-200 font-medium text-xs">{plan.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Question Summary & Model Answers (Strictly labeled "Reference Answer") */}
          <Card>
            <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" /> Round-by-Round Answers & Reference Answers
            </h3>
            <div className="space-y-4 text-xs">
              {finalReport.questionsSummary.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{item.roundName}: {item.questionText}</span>
                    <Badge variant={item.score >= 80 ? 'success' : 'match-mid'}>{item.score}% Score</Badge>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block mb-1">Candidate Answer:</span>
                    <p className="text-gray-200 bg-gray-900 p-3 rounded-lg font-medium">{item.candidateAnswer}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold block mb-1">📖 Reference Answer:</span>
                    <p className="text-gray-300 font-mono text-[11px] leading-relaxed">{item.referenceAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 4: INTERVIEW HISTORY */}
      {viewState === 'history' && (
        <Card>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <History className="w-4 h-4 text-brand-400" /> Completed Interview Simulation Sessions ({history.length})
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No past interview simulations recorded yet. Launch a new simulation to track score progression.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((sess) => (
                  <div key={sess.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-display">{sess.jobTitle || 'Software Role'}</span>
                        <Badge variant="purple">{sess.company || 'TechCorp'}</Badge>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">
                        Date: {sess.date} • Questions Answered: {sess.questionsAnswered.length}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-mono uppercase">Score</span>
                        <div className="text-xl font-bold text-brand-300">{sess.totalScore}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Diagnostic Test Suite Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - 12-Point Advanced Interview Simulator Test Suite"
      >
        <div className="space-y-4 text-xs">
          {testReport && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
              <span>Step 19 Interview Simulator Suite: {testReport.passCount}/{testReport.totalTests} Passed</span>
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
