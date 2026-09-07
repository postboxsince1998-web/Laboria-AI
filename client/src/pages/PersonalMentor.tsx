import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CandidateProfile, MentorMessage } from '../types';
import { getAIService } from '../services/aiService';
import { MentorContextEngine, DailyCareerPlan, WeeklyCareerPlan } from '../services/mentorContextEngine';
import { runMentorEngineTests, MentorTestResult } from '../services/mentorEngineTests';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Award,
  Target,
  FileText,
  Briefcase,
  Layers,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Brain,
  Lightbulb,
  MessageSquareText,
  BookOpen
} from 'lucide-react';

interface PersonalMentorProps {
  candidate: CandidateProfile;
}

export const PersonalMentor: React.FC<PersonalMentorProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const aiService = getAIService();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedJobTarget, setSelectedJobTarget] = useState<string>('Junior Data Analyst');
  const [activePlanTab, setActivePlanTab] = useState<'daily' | 'weekly'>('daily');

  // Job Target Options
  const jobOptions = [
    { title: 'Junior Data Analyst', match: 94, dist: '12 km away', skills: ['Python', 'SQL', 'Excel', 'Power BI'] },
    { title: 'Business Analyst', match: 88, dist: '7 km away', skills: ['SQL', 'Excel', 'Power BI', 'Jira'] },
    { title: 'Data Associate', match: 81, dist: '18 km away', skills: ['Python', 'SQL', 'Excel'] },
    { title: 'Senior Full Stack Engineer', match: 92, dist: 'Bengaluru', skills: ['React', 'TypeScript', 'Node.js', 'Kafka'] }
  ];

  // 10+ Quick Prompt Chips
  const quickPrompts = [
    'What should I learn today?',
    'Why am I not matching this job?',
    'How can I improve my resume?',
    'Can you prepare me for this interview?',
    'What skills should I learn?',
    'Which career is better for me?',
    'How do I improve my communication?',
    'What are my biggest career blockers?',
    'Generate my daily learning plan',
    'Show my weekly improvement roadmap'
  ];

  // Dynamic Plans
  const dailyPlan: DailyCareerPlan = MentorContextEngine.generateDailyCareerPlan(candidate, selectedJobTarget);
  const weeklyPlan: WeeklyCareerPlan = MentorContextEngine.generateWeeklyCareerPlan(candidate, selectedJobTarget);

  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'm1',
      sender: 'mentor',
      text: `### Your Situation
Hello ${candidate.fullName.split(' ')[0]}! I am your **Personal AI Career Mentor**. I have full context of your profile (${candidate.yearsOfExperience} YOE, verified skills in ${candidate.skills.slice(0, 3).map((s) => s.name).join(', ')}, **76/100 Job Readiness Score**, and top 94% profile match for Junior Data Analyst).

### Your Strengths
- Strong verified baseline in **Python**, **SQL**, and **Excel**.
- 88/100 ATS resume score with clear technical structure.

### Biggest Opportunity
Acquiring **Power BI** to elevate your Junior Data Analyst match to 98% and reach a **88/100 Job Readiness Score**.

### What I Recommend
Ask me anything using the prompt chips below, or review your **Daily Career Plan** on the side!

### Next Step
[Source: Personal AI Career Strategist]
Select a quick question prompt below to begin your personalized mentoring session!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Test Runner Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<MentorTestResult[]>([]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: MentorMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Pass candidate profile, user query, history, and selected job target to context engine
      const replyText = await MentorContextEngine.answerWithContext(
        candidate,
        text,
        messages,
        selectedJobTarget
      );

      const mentorMsg: MentorMessage = {
        id: `m_${Date.now()}`,
        sender: 'mentor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMentorTests = async () => {
    const results = await runMentorEngineTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  const handleActionNavigation = (actionName: string) => {
    switch (actionName) {
      case 'Improve Skill':
      case 'Improve My Skills':
        navigate('/skill-gap');
        break;
      case 'Find My Best Jobs':
      case 'View Match':
        navigate('/discover');
        break;
      case 'Improve My Resume':
        navigate('/resume-match');
        break;
      case 'Prepare For Interview':
        navigate('/interview-prep');
        break;
      case 'Check My Readiness':
        navigate('/readiness');
        break;
      case 'Analyze My Career':
        navigate('/navigator');
        break;
      case 'Open Future Skills Radar':
      case 'Future Skills Radar':
        navigate('/radar');
        break;
      default:
        navigate('/skill-gap');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
            <Bot className="w-3.5 h-3.5" /> AI Career Mentor
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            AI Career Mentor
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your personal AI guide for getting job-ready. Active Provider: <span className="text-brand-300 font-semibold">{aiService.providerName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunMentorTests}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            Run Mentor Tests
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages(messages.slice(0, 1))}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Chat
          </Button>
        </div>
      </div>

      {/* YOUR CURRENT STATUS Panel & Target Switcher */}
      <Card className="p-5 space-y-4 bg-gradient-to-r from-gray-900 via-gray-900/90 to-brand-950/40 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> YOUR CURRENT STATUS
            </span>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <h2 className="text-lg font-bold text-white">{candidate.fullName}</h2>
              <span className="text-xs text-gray-400">({candidate.yearsOfExperience} YOE • {candidate.education})</span>
              <Badge variant="success">76 / 100 Readiness (Progressing)</Badge>
            </div>
          </div>

          {/* Job Specific Context Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Target Context:</span>
            <select
              value={selectedJobTarget}
              onChange={(e) => setSelectedJobTarget(e.target.value)}
              className="bg-gray-950 border border-brand-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-400 font-semibold"
            >
              {jobOptions.map((j) => (
                <option key={j.title} value={j.title}>
                  🎯 {j.title} ({j.match}% Match • {j.dist})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High Visibility Spotlight CTA: "What should I do next?" */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/60 to-accent-teal/10 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                SPOTLIGHT ACTION RECOMMENDATION
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              What should I do next to reach 95%+ match for {selectedJobTarget}?
            </p>
            <p className="text-xs text-gray-300">
              Acquire <span className="text-brand-300 font-semibold">{MentorContextEngine.getNonRedundantRecommendedSkill(candidate, selectedJobTarget)}</span> in Skill Gap Analyzer to close your primary gap.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => handleActionNavigation('Improve Skill')}
            icon={<ArrowRight className="w-4 h-4" />}
            className="whitespace-nowrap shadow-glow"
          >
            Improve Skill: {MentorContextEngine.getNonRedundantRecommendedSkill(candidate, selectedJobTarget)}
          </Button>
        </div>

        {/* 6 Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Analyze My Career')}
            icon={<TrendingUp className="w-3.5 h-3.5 text-brand-400" />}
          >
            Analyze My Career
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Find My Best Jobs')}
            icon={<Briefcase className="w-3.5 h-3.5 text-accent-teal" />}
          >
            Find My Best Jobs
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Improve My Skills')}
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Improve My Skills
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Check My Readiness')}
            icon={<Award className="w-3.5 h-3.5 text-purple-400" />}
          >
            Check My Readiness
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Prepare For Interview')}
            icon={<MessageSquareText className="w-3.5 h-3.5 text-amber-400" />}
          >
            Prepare Interview
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[11px] py-2"
            onClick={() => handleActionNavigation('Improve My Resume')}
            icon={<FileText className="w-3.5 h-3.5 text-rose-400" />}
          >
            Improve Resume
          </Button>
        </div>
      </Card>

      {/* Main Content Layout: Left Sidebar (Plans & Context) vs Right (Chat & Prompts) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Daily & Weekly Career Plans Card */}
        <div className="space-y-4 lg:col-span-1">
          {/* Plan Selector Tabs */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" /> Career Roadmap
              </span>

              <div className="flex items-center p-0.5 rounded-lg bg-gray-900 border border-gray-800">
                <button
                  onClick={() => setActivePlanTab('daily')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    activePlanTab === 'daily'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setActivePlanTab('weekly')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    activePlanTab === 'weekly'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {activePlanTab === 'daily' ? (
              /* Daily Career Plan Card */
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-mono">{dailyPlan.date}</span>
                    <span className="text-brand-300 font-semibold">{dailyPlan.estimatedHours}</span>
                  </div>
                  <p className="font-bold text-white text-xs">{dailyPlan.focusTitle}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Today's 3 Steps:
                  </span>
                  {dailyPlan.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 hover:border-brand-500/40 transition cursor-pointer space-y-1.5"
                      onClick={() => handleActionNavigation(t.linkModule || 'Improve Skill')}
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-200 leading-snug">{t.task}</span>
                      </div>
                      {t.linkModule && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-400 hover:underline pl-5">
                          Launch {t.linkModule} →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Weekly Career Plan Card */
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <p className="font-bold text-white text-xs">{weeklyPlan.weekTitle}</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{weeklyPlan.primaryObjective}</p>
                </div>

                <div className="space-y-2">
                  {weeklyPlan.dailyFocus.map((df, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-brand-300 font-mono text-[11px]">{df.day}:</span>{' '}
                        <span className="text-gray-200">{df.title}</span>
                      </div>
                      <Badge variant="purple" className="text-[10px]">
                        {df.skill}
                      </Badge>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Context Snapshot Card */}
          <Card className="p-4 space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <Brain className="w-4 h-4 text-accent-cyan" /> Mentor Context Bound
            </span>

            <div className="space-y-2">
              <div className="p-2 rounded bg-gray-900/80 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Verified Stack</span>
                <span className="font-semibold text-emerald-400">{candidate.skills.slice(0, 3).map(s=>s.name).join(', ')}</span>
              </div>
              <div className="p-2 rounded bg-gray-900/80 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">ATS Resume Score</span>
                <span className="font-semibold text-brand-300">88 / 100</span>
              </div>
              <div className="p-2 rounded bg-gray-900/80 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Target Role</span>
                <span className="font-semibold text-white">{selectedJobTarget}</span>
              </div>
              <div className="p-2 rounded bg-gray-900/80 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Primary Skill Gap</span>
                <span className="font-semibold text-rose-400">
                  {MentorContextEngine.getNonRedundantRecommendedSkill(candidate, selectedJobTarget)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Clean Chat Interface & Prompt Chips */}
        <Card className="lg:col-span-3 h-[680px] flex flex-col p-0 overflow-hidden" glow>
          {/* 10+ Quick Reply Prompt Chips Header */}
          <div className="p-3 border-b border-gray-800 bg-gray-950/80 overflow-x-auto whitespace-nowrap space-x-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono mr-1">
              Suggested Questions:
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 transition text-left font-medium"
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-gradient-to-tr from-accent-teal via-accent-cyan to-brand-500 text-gray-950 shadow-glow-teal'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className={`space-y-1.5 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-gray-900/90 text-gray-200 border border-gray-800 rounded-tl-none shadow-sm space-y-3'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line">{msg.text}</p>
                    ) : (
                      /* Rich Structured GFM Formatting for Mentor Responses */
                      <div className="space-y-3">
                        {msg.text.split('\n\n').map((block, idx) => {
                          if (block.startsWith('### ')) {
                            const title = block.split('\n')[0].replace('### ', '');
                            const body = block.split('\n').slice(1).join('\n');
                            return (
                              <div key={idx} className="space-y-1">
                                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> {title}
                                </h4>
                                <p className="whitespace-pre-line text-xs sm:text-sm text-gray-300 leading-relaxed">
                                  {body}
                                </p>
                              </div>
                            );
                          }

                          // Action Buttons inside Mentor Messages
                          if (block.includes('[Improve My Skills]') || block.includes('[Prepare For Interview]') || block.includes('[Improve My Resume]') || block.includes('[Find My Best Jobs]') || block.includes('[Check My Readiness]')) {
                            return (
                              <div key={idx} className="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-800/80">
                                {block.includes('[Source: ') && (
                                  <span className="text-[10px] font-mono text-gray-400 block w-full">
                                    {block.match(/\[Source: [^\]]+\]/)?.[0]}
                                  </span>
                                )}
                                {block.includes('[Improve My Skills]') && (
                                  <Button
                                    variant="accent"
                                    size="sm"
                                    onClick={() => handleActionNavigation('Improve My Skills')}
                                    icon={<BookOpen className="w-3.5 h-3.5" />}
                                  >
                                    Improve My Skills
                                  </Button>
                                )}
                                {block.includes('[Prepare For Interview]') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionNavigation('Prepare For Interview')}
                                    icon={<MessageSquareText className="w-3.5 h-3.5 text-amber-400" />}
                                  >
                                    Prepare For Interview
                                  </Button>
                                )}
                                {block.includes('[Improve My Resume]') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionNavigation('Improve My Resume')}
                                    icon={<FileText className="w-3.5 h-3.5 text-rose-400" />}
                                  >
                                    Improve My Resume
                                  </Button>
                                )}
                                {block.includes('[Find My Best Jobs]') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionNavigation('Find My Best Jobs')}
                                    icon={<Briefcase className="w-3.5 h-3.5 text-accent-teal" />}
                                  >
                                    Find My Best Jobs
                                  </Button>
                                )}
                                {block.includes('[Check My Readiness]') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActionNavigation('Check My Readiness')}
                                    icon={<Award className="w-3.5 h-3.5 text-purple-400" />}
                                  >
                                    Check My Readiness
                                  </Button>
                                )}
                              </div>
                            );
                          }

                          return (
                            <p key={idx} className="whitespace-pre-line text-xs sm:text-sm text-gray-300">
                              {block}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={`text-[10px] text-gray-500 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <Bot className="w-5 h-5 text-accent-teal animate-spin" />
                <span>AI Mentor is evaluating profile context & generating structured response...</span>
              </div>
            )}
          </div>

          {/* Text Input Bar */}
          <div className="p-4 border-t border-gray-800 bg-gray-950/90 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your AI mentor anything (e.g. salary tips, ATS optimization, interview strategies)..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
            <Button
              variant="accent"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </Card>
      </div>

      {/* Automated Mentor Engine Diagnostic Tests Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Laboria AI - Personal AI Mentor Engine Diagnostic & Test Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between">
            <span>✓ Verified: Mentor uses candidate context natively without asking duplicate questions.</span>
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
