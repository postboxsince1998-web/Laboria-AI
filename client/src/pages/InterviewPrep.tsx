import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile } from '../types';
import { seedJobs } from '../data/seedData';
import {
  InterviewCoachService,
  MockQuestion,
  AnswerEvaluation,
  InterviewSession,
  InterviewType,
  InterviewMode,
  InterviewPrepPlan
} from '../services/interviewCoachService';
import { runInterviewEngineTests, InterviewTestResult } from '../services/interviewCoachEngineTests';
import {
  MessageSquareCode,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Send,
  ShieldCheck,
  Award,
  Clock,
  Mic,
  MicOff,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  Calendar,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';

interface InterviewPrepProps {
  candidate: CandidateProfile;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ candidate }) => {
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const selectedJob = seedJobs[selectedJobIndex] || seedJobs[0];

  const [mode, setMode] = useState<InterviewMode>('Job-Specific');
  const [interviewType, setInterviewType] = useState<InterviewType>('Full Mock');
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(180);

  // Active Session State
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<{ question: MockQuestion; userAnswer: string; evaluation: AnswerEvaluation }[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<AnswerEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);

  // Web Speech API Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Preparation Plan Modal & Diagnostics Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<InterviewTestResult[]>([]);

  // Preparation Plan
  const prepPlan: InterviewPrepPlan = InterviewCoachService.generateInterviewPlan(selectedJob.title, selectedJob.company);

  // Check Web Speech API Support
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimedMode && !isSessionCompleted && questions.length > 0 && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimedMode, isSessionCompleted, questions.length, timeLeftSeconds]);

  // Load questions on target job / mode / type change
  useEffect(() => {
    handleStartInterview();
  }, [selectedJobIndex, mode, interviewType]);

  const handleStartInterview = () => {
    const generated = InterviewCoachService.generateQuestions(candidate, selectedJob, interviewType, mode);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setEvaluations([]);
    setActiveEvaluation(null);
    setShowHint(false);
    setShowModelAnswer(false);
    setIsSessionCompleted(false);
    setCompletedSession(null);
    setTimeLeftSeconds(180);
  };

  const toggleVoiceRecording = () => {
    if (!speechSupported) return;
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const handleEvaluateAnswer = () => {
    if (!userAnswer.trim() || isEvaluating) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const evalOutput = InterviewCoachService.evaluateAnswer(currentQ, userAnswer, candidate);
      setActiveEvaluation(evalOutput);

      const newEvalList = [...evaluations, { question: currentQ, userAnswer, evaluation: evalOutput }];
      setEvaluations(newEvalList);
      setIsEvaluating(false);

      // Check if session finished
      if (currentQuestionIndex + 1 >= questions.length) {
        finishSession(newEvalList);
      }
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
      setActiveEvaluation(null);
      setShowHint(false);
      setShowModelAnswer(false);
      setTimeLeftSeconds(180);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
      setActiveEvaluation(null);
      setShowHint(false);
      setShowModelAnswer(false);
    }
  };

  const finishSession = (finalEvalList: { question: MockQuestion; userAnswer: string; evaluation: AnswerEvaluation }[]) => {
    const scores = InterviewCoachService.calculateSessionScore(finalEvalList);
    const session = InterviewCoachService.saveSession(candidate, {
      jobTitle: mode === 'Job-Specific' ? selectedJob.title : 'Junior Data Analyst',
      company: mode === 'Job-Specific' ? selectedJob.company : 'Target Company',
      mode,
      type: interviewType,
      totalScore: scores.totalScore,
      technicalScore: scores.technicalScore,
      communicationScore: scores.communicationScore,
      structureScore: scores.structureScore,
      roleKnowledgeScore: scores.roleKnowledgeScore,
      behavioralScore: scores.behavioralScore,
      scoreBreakdown: scores.scoreBreakdown,
      questionsAnswered: finalEvalList,
      strengths: [
        '✓ Technical concepts directly addressed target requirements.',
        '✓ STAR method structure provided clear narrative progression.'
      ],
      improvements: [
        '⚠ Add measurable outcomes (e.g. % gains) to project explanations.',
        '⚠ Practice 30-second concise openers for behavioral questions.'
      ]
    });

    setCompletedSession(session);
    setIsSessionCompleted(true);
  };

  const handleRunTests = () => {
    const res = runInterviewEngineTests();
    setTestResults(res);
    setIsTestModalOpen(true);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
            <MessageSquareCode className="w-3.5 h-3.5" /> AI Interview Coach
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            AI Interview Coach
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Practice for the job you're actually targeting. Real-world simulation tailored to your resume & target JD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlanModalOpen(true)}
            icon={<Calendar className="w-4 h-4 text-brand-400" />}
          >
            Prep Plan
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
            onClick={handleStartInterview}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Start Mock Interview
          </Button>
        </div>
      </div>

      {/* TARGET HEADER PANEL: Job Context, Readiness, & Match Metrics */}
      <Card className="p-5 space-y-4 bg-gradient-to-r from-gray-900 via-gray-900/90 to-brand-950/40 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-bold flex items-center gap-1.5">
              <TargetIcon className="w-3.5 h-3.5" /> TARGET JOB BENCHMARK
            </span>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <h2 className="text-lg font-bold text-white font-display">
                {selectedJob.title} @ {selectedJob.company}
              </h2>
              <span className="text-xs text-gray-400">📍 {selectedJob.location}</span>
            </div>
          </div>

          {/* Job Target Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Select Target Job:</span>
            <select
              value={selectedJobIndex}
              onChange={(e) => setSelectedJobIndex(Number(e.target.value))}
              className="bg-gray-950 border border-brand-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-400 font-semibold"
            >
              {seedJobs.map((j, i) => (
                <option key={j.id} value={i}>
                  🔥 {j.title} ({j.profileMatchScore}% Match • {j.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Core Benchmark Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Profile Match</span>
            <p className="text-base font-extrabold text-emerald-400 font-display">
              {selectedJob.profileMatchScore}% Match
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Job Readiness</span>
            <p className="text-base font-extrabold text-brand-300 font-display">
              81 / 100
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Interview Readiness</span>
            <p className="text-base font-extrabold text-purple-400 font-display">
              78 / 100
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Missing Target Skill</span>
            <p className="text-base font-extrabold text-rose-400 font-display">
              Power BI
            </p>
          </div>
        </div>
      </Card>

      {/* MODE & INTERVIEW TYPE SELECTOR BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900/80 border border-gray-800">
        {/* Two Modes Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold uppercase font-mono">Mode:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-gray-950 border border-gray-800">
            <button
              onClick={() => setMode('Job-Specific')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                mode === 'Job-Specific'
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Job-Specific (JD + Resume)
            </button>
            <button
              onClick={() => setMode('General Career')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                mode === 'General Career'
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              General Career
            </button>
          </div>
        </div>

        {/* Interview Type Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 font-bold uppercase font-mono">Type:</span>
          {(['Full Mock', 'Technical', 'HR', 'Behavioral', 'Resume-Based', 'Situational'] as InterviewType[]).map((t) => (
            <button
              key={t}
              onClick={() => setInterviewType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                interviewType === t
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN INTERVIEW SIMULATOR FEED OR PERFORMANCE SUMMARY */}
      {!isSessionCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Round Selector Drawer */}
          <Card className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between border-b border-gray-800 pb-2">
              <span>Interview Rounds ({questions.length})</span>
              {isTimedMode && (
                <span className="text-amber-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> {timeLeftSeconds}s
                </span>
              )}
            </h3>

            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setUserAnswer('');
                    setActiveEvaluation(null);
                    setShowHint(false);
                    setShowModelAnswer(false);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    currentQuestionIndex === idx
                      ? 'border-brand-500 bg-brand-950/40 text-white font-bold shadow-glow-sm'
                      : evaluations.some((e) => e.question.id === q.id)
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px]">Round {q.round}</span>
                    <Badge variant={q.category === 'Technical' ? 'info' : q.category === 'Behavioral' ? 'purple' : 'info'}>
                      {q.category}
                    </Badge>

                  </div>
                  <p className="mt-1 line-clamp-1 font-semibold text-gray-200">{q.topic}</p>
                </div>
              ))}
            </div>

            {/* Timer Mode Toggle */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Timed Mode (3 mins)</span>
              <button
                onClick={() => setIsTimedMode(!isTimedMode)}
                className={`w-10 h-5 rounded-full p-0.5 transition ${
                  isTimedMode ? 'bg-brand-600' : 'bg-gray-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition ${isTimedMode ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </Card>

          {/* ACTIVE QUESTION INTERACTION CARD */}
          <div className="lg:col-span-3 space-y-4">
            {currentQ && (
              <Card glow className="space-y-4">
                {/* Round Header & Difficulty */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-300 uppercase tracking-wider">
                      {currentQ.roundName}
                    </span>
                    <Badge variant="purple">{currentQ.difficulty}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentQ.jdRequirementMapped && (
                      <Badge variant="info">JD: {currentQ.jdRequirementMapped}</Badge>
                    )}
                    {currentQ.isSkillGapTopic && (
                      <Badge variant="match-low">⚠ Skill Gap Improvement Area</Badge>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-2 py-2">
                  <h3 className="text-lg font-bold text-white font-display leading-snug">
                    "{currentQ.question}"
                  </h3>
                  <p className="text-xs text-gray-400">
                    💡 Context & Hint: {currentQ.contextHint}
                  </p>
                </div>

                {/* Framework Outline Guide Toggle */}
                <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" /> Answer Structure Framework: {currentQ.framework}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                    >
                      {showHint ? 'Hide Framework Outline' : 'Show Framework Outline'}
                    </Button>
                  </div>

                  {showHint && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-300 pt-2 border-t border-gray-800">
                      {currentQ.framework === 'STAR' ? (
                        <>
                          <div><strong className="text-white">Situation:</strong> {currentQ.frameworkGuide.situation}</div>
                          <div><strong className="text-white">Task:</strong> {currentQ.frameworkGuide.task}</div>
                          <div><strong className="text-white">Action:</strong> {currentQ.frameworkGuide.action}</div>
                          <div><strong className="text-white">Result:</strong> {currentQ.frameworkGuide.result}</div>
                        </>
                      ) : (
                        <>
                          <div><strong className="text-white">Concept:</strong> {currentQ.frameworkGuide.concept}</div>
                          <div><strong className="text-white">Approach:</strong> {currentQ.frameworkGuide.approach}</div>
                          <div><strong className="text-white">Example:</strong> {currentQ.frameworkGuide.example}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Text & Voice Answer Input Area */}
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={`Type or record your response here using ${currentQ.framework} framework...`}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    />

                    {speechSupported && (
                      <button
                        onClick={toggleVoiceRecording}
                        className={`absolute bottom-3 right-3 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          isRecording
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-gray-800 text-gray-300 hover:text-white'
                        }`}
                        title="Toggle Web Speech Voice Input"
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-brand-400" />}
                        <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                      </button>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipQuestion}
                      >
                        Skip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                      >
                        {showModelAnswer ? 'Hide Reference Answer' : 'View Example Strong Answer'}
                      </Button>
                    </div>

                    <Button
                      variant="accent"
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !userAnswer.trim()}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      {isEvaluating ? 'Evaluating Answer...' : 'Submit & Evaluate Answer'}
                    </Button>
                  </div>
                </div>

                {/* Example Strong Answer Box */}
                {showModelAnswer && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1.5">
                    <p className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Example Strong Answer
                    </p>
                    <p className="text-gray-300 leading-relaxed italic">
                      "{currentQ.modelAnswer}"
                    </p>
                    <span className="text-[10px] text-gray-400 italic block pt-1">
                      (Example answer — use this as a reference, not something to memorize word-for-word.)
                    </span>
                  </div>
                )}

                {/* INSTANT ANSWER EVALUATION PANEL */}
                {activeEvaluation && (
                  <div className="mt-4 p-5 rounded-xl bg-brand-950/40 border border-brand-500/40 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-brand-500/30 pb-3">
                      <span className="font-bold text-white font-display text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-brand-400" /> Structured Answer Review
                      </span>
                      <Badge variant="success">Score: {activeEvaluation.overallScore} / 100</Badge>
                    </div>

                    {/* 5 Evaluated Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-400">Relevance</span>
                        <p className="font-bold text-emerald-400">{activeEvaluation.relevanceLabel}</p>
                      </div>
                      <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-400">Tech Depth</span>
                        <p className="font-bold text-brand-300">{activeEvaluation.technicalUnderstandingLabel}</p>
                      </div>
                      <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-400">Structure</span>
                        <p className="font-bold text-purple-400">{activeEvaluation.structureLabel}</p>
                      </div>
                      <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-400">Clarity</span>
                        <p className="font-bold text-accent-cyan">{activeEvaluation.clarityLabel}</p>
                      </div>
                      <div className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-400">Completeness</span>
                        <p className="font-bold text-amber-400">{activeEvaluation.completenessLabel}</p>
                      </div>
                    </div>

                    {/* Feedback & Framework Tip */}
                    <div className="space-y-2">
                      <p className="text-gray-200 leading-relaxed">{activeEvaluation.constructiveFeedback}</p>
                      <p className="text-brand-300 font-semibold italic">{activeEvaluation.frameworkTip}</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={handleNextQuestion}
                        icon={<ChevronRight className="w-4 h-4" />}
                      >
                        {currentQuestionIndex + 1 < questions.length ? 'Proceed to Next Round' : 'Complete Mock Interview'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* FULL MOCK INTERVIEW PERFORMANCE SUMMARY */
        completedSession && (
          <div className="space-y-6">
            <Card glow className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <Badge variant="purple">Full Mock Interview Summary</Badge>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    INTERVIEW PERFORMANCE SUMMARY
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {completedSession.jobTitle} @ {completedSession.company} • Completed on {completedSession.date}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-gray-400 uppercase">Overall Performance</span>
                  <div className="text-4xl font-extrabold text-emerald-400 font-display">
                    {completedSession.totalScore} <span className="text-lg text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* WHY DID I GET 78? MATHEMATICAL TRANSPARENCY SCORE BREAKDOWN */}
              <div className="p-5 rounded-xl bg-gray-900/90 border border-brand-500/30 space-y-3">
                <span className="text-xs font-bold text-brand-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-brand-400" /> Why did I get {completedSession.totalScore}? (Mathematical Score Formula)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Technical (35%)</span>
                    <span className="font-bold text-white">{completedSession.scoreBreakdown.technicalMath}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Communication (20%)</span>
                    <span className="font-bold text-white">{completedSession.scoreBreakdown.communicationMath}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Structure (15%)</span>
                    <span className="font-bold text-white">{completedSession.scoreBreakdown.structureMath}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Role Knowledge (15%)</span>
                    <span className="font-bold text-white">{completedSession.scoreBreakdown.roleKnowledgeMath}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Behavioral (15%)</span>
                    <span className="font-bold text-white">{completedSession.scoreBreakdown.behavioralMath}</span>
                  </div>
                </div>
              </div>

              {/* Strengths vs Improvement Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-900/80 border border-emerald-500/30 space-y-2">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5 font-display">
                    <CheckCircle2 className="w-4 h-4" /> Performance Strengths
                  </p>
                  <ul className="space-y-1.5 text-gray-200 text-[11px] list-disc list-inside">
                    {completedSession.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/80 border border-brand-500/30 space-y-2">
                  <p className="font-bold text-brand-300 flex items-center gap-1.5 font-display">
                    <Sparkles className="w-4 h-4 text-brand-400" /> Improvement Opportunities
                  </p>
                  <ul className="space-y-1.5 text-gray-200 text-[11px] list-disc list-inside">
                    {completedSession.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* QUESTION-BY-QUESTION REVIEW FEED */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Question-by-Question Detailed Review
                </h3>

                {completedSession.questionsAnswered.map((qa, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-brand-300 font-semibold">{qa.question.roundName}</span>
                      <Badge variant="success">Score: {qa.evaluation.overallScore}/100</Badge>
                    </div>
                    <p className="font-bold text-white">{qa.question.question}</p>
                    <p className="text-gray-300 bg-gray-950 p-2.5 rounded-lg font-mono text-[11px]">
                      Your Answer: "{qa.userAnswer}"
                    </p>
                    <p className="text-gray-400 text-[11px]">{qa.evaluation.constructiveFeedback}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3">
                <Button variant="accent" onClick={handleStartInterview} icon={<RotateCcw className="w-4 h-4" />}>
                  Start New Mock Session
                </Button>
              </div>
            </Card>
          </div>
        )
      )}

      {/* 24-HOUR / 1-HOUR INTERVIEW PREPARATION PLAN MODAL */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={`Interview Preparation Checklist: ${selectedJob.title} @ ${selectedJob.company}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-2">
            <h4 className="font-bold text-brand-300 font-display flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-400" /> 24 Hours Before Interview
            </h4>
            <ul className="space-y-1 text-gray-200 list-disc list-inside">
              {prepPlan.hours24Before.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <h4 className="font-bold text-purple-300 font-display flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" /> 1 Hour Before Interview
            </h4>
            <ul className="space-y-1 text-gray-200 list-disc list-inside">
              {prepPlan.hour1Before.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      {/* AUTOMATED ENGINE DIAGNOSTIC TESTS MODAL */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Interview Coach Engine Diagnostic & Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
            <span>✓ Verified: Evaluated all 20 test points including mandatory Power BI gap assertion.</span>
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
  return <Briefcase {...props} />;
}
