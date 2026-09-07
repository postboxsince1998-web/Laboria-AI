import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CandidateProfile,
  JobOpening,
  TwoSidedMatchResult,
  ConnectionRequest,
  MatchingAuditLogEntry,
  MatchingPerspective
} from '../types';
import { seedJobs } from '../data/seedData';
import { TwoSidedMatchingService, SavedTwoSidedMatchingService, HIRING_DISCLAIMER } from '../services/twoSidedMatchingService';
import { runTwoSidedMatchingEngineTests, TwoSidedMatchingTestReport } from '../services/twoSidedMatchingEngineTests';
import {
  ArrowLeftRight,
  UserCheck,
  Building2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bookmark,
  Star,
  Send,
  Eye,
  EyeOff,
  Briefcase,
  FileText,
  Sliders,
  History,
  Layers,
  MapPin,
  DollarSign,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface TwoSidedMatchingProps {
  candidate: CandidateProfile;
}

export const TwoSidedMatching: React.FC<TwoSidedMatchingProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const [perspective, setPerspective] = useState<MatchingPerspective>('Candidate');
  const [matches, setMatches] = useState<TwoSidedMatchResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<MatchingAuditLogEntry[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);

  // Selected Match for Breakdown Modal
  const [selectedMatch, setSelectedMatch] = useState<TwoSidedMatchResult | null>(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  // Connection Request Modal State
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [connectionNote, setConnectionNote] = useState('');
  const [targetForConnection, setTargetForConnection] = useState<TwoSidedMatchResult | null>(null);

  // Audit Logs Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Test Suite Modal State
  const [testReport, setTestReport] = useState<TwoSidedMatchingTestReport | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    refreshMatches();
  }, [perspective, candidate]);

  const refreshMatches = () => {
    if (perspective === 'Candidate') {
      const results = TwoSidedMatchingService.evaluateCandidateToJobs(candidate, seedJobs);
      setMatches(results.filter((m) => !m.isDismissed));
    } else {
      const results = TwoSidedMatchingService.evaluateEmployerToCandidates(seedJobs[0], [candidate]);
      setMatches(results.filter((m) => !m.isDismissed));
    }
    setAuditLogs(TwoSidedMatchingService.getAuditLogs());
    setConnections(TwoSidedMatchingService.getConnections());
  };

  // Handle Shortlist Toggle
  const handleShortlist = (match: TwoSidedMatchResult) => {
    TwoSidedMatchingService.shortlistMatch(match, perspective);
    refreshMatches();
  };

  // Handle Save Toggle
  const handleSave = (match: TwoSidedMatchResult) => {
    TwoSidedMatchingService.saveMatch(match, perspective);
    refreshMatches();
  };

  // Handle Dismiss
  const handleDismiss = (match: TwoSidedMatchResult) => {
    TwoSidedMatchingService.dismissMatch(match, perspective);
    refreshMatches();
  };

  // Handle Connection Request Submit
  const handleSendConnection = () => {
    if (!targetForConnection) return;

    TwoSidedMatchingService.requestConnection(
      perspective === 'Candidate' ? 'Candidate' : 'Employer',
      perspective === 'Candidate' ? candidate.id : targetForConnection.companyName,
      perspective === 'Candidate' ? candidate.fullName : targetForConnection.companyName,
      perspective === 'Candidate' ? targetForConnection.jobId : candidate.id,
      targetForConnection.jobId,
      targetForConnection.jobTitle,
      targetForConnection.companyName,
      connectionNote
    );

    refreshMatches();
    setIsConnectionModalOpen(false);
    setConnectionNote('');
    alert(`Connection request sent successfully to ${targetForConnection.companyName}!`);
  };

  // Handle Candidate Connection Response (Accept/Decline)
  const handleRespondConnection = (connId: string, response: 'Accepted' | 'Declined') => {
    TwoSidedMatchingService.respondToConnectionRequest(connId, response);
    refreshMatches();
  };

  // Run Automated Test Suite
  const handleRunTests = () => {
    const report = runTwoSidedMatchingEngineTests();
    setTestReport(report);
    setIsTestModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Perspective Switcher */}
      <Card glow className="bg-gradient-to-r from-gray-900 via-brand-950/50 to-gray-900 border-brand-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white font-display">Two-Sided Intelligent Matcher</h1>
                  <Badge variant="info">10-Factor AI Engine</Badge>
                </div>
                <p className="text-gray-400 text-xs">
                  Bi-directional matching evaluating skills, experience, education, portfolio evidence, work mode, and readiness.
                </p>
              </div>
            </div>
          </div>

          {/* Perspective Switcher & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Perspective Picker */}
            <div className="bg-gray-950/90 border border-gray-800 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setPerspective('Candidate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  perspective === 'Candidate'
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Candidate View (Jobs)
              </button>
              <button
                onClick={() => setPerspective('Employer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  perspective === 'Employer'
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Employer View (Candidates)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuditModalOpen(true)}
                icon={<History className="w-4 h-4 text-brand-400" />}
              >
                Audit Logs ({auditLogs.length})
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleRunTests}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Run Step 22 Tests
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Non-Discrimination & Hiring Outcome Notice */}
      <Card className="bg-amber-950/20 border-amber-800/40 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-300 font-display">
              Ethical Non-Discrimination Compliance & Hiring Disclaimer
            </h4>
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              Matching algorithms use objective technical skills, experience, education, portfolio evidence, work mode, and readiness metrics. Protected/sensitive characteristics (age, gender, race, ethnicity, religion) are strictly excluded from all matching calculations.
            </p>
            <p className="text-amber-300 font-mono text-[10px]">
              ⚠️ {HIRING_DISCLAIMER}
            </p>
          </div>
        </div>
      </Card>

      {/* Pending Connection Requests (Candidate View) */}
      {perspective === 'Candidate' && connections.filter((c) => c.status === 'Pending').length > 0 && (
        <Card className="bg-purple-950/30 border-purple-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-300 font-display flex items-center gap-2">
              <Send className="w-4 h-4" /> Pending Recruiter Connection Requests ({connections.filter((c) => c.status === 'Pending').length})
            </h3>
            <Badge variant="purple">Candidate Consent Required</Badge>
          </div>

          <div className="space-y-2">
            {connections.filter((c) => c.status === 'Pending').map((conn) => (
              <div key={conn.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{conn.senderName}</span>
                    <span className="text-gray-400">from</span>
                    <span className="font-semibold text-brand-300">{conn.companyName}</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">"{conn.note}"</p>
                  <span className="text-gray-500 font-mono text-[10px]">Requested for role: {conn.jobTitle}</span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleRespondConnection(conn.id, 'Accepted')}
                  >
                    Accept Connection
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRespondConnection(conn.id, 'Declined')}
                    className="text-gray-400 hover:text-rose-400"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Two-Sided Match Cards List */}
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            {perspective === 'Candidate' ? `Matched Opportunities (${matches.length})` : `Matched Candidates (${matches.length})`}
          </h3>
          <span className="text-gray-400 font-mono text-xs">Ranked by Overall Composite Match Score</span>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.matchId} className="space-y-4">
              {/* Card Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white font-display">
                      {perspective === 'Candidate' ? match.jobTitle : match.candidateName}
                    </h4>
                    <Badge variant="match-high" className="py-1 px-2.5 text-xs font-bold">
                      {match.overallMatchScore}% Composite Match
                    </Badge>
                    {match.isShortlisted && <Badge variant="success">Shortlisted</Badge>}
                    {match.isSaved && <Badge variant="info">Saved</Badge>}
                    {match.connectionStatus === 'Accepted' && <Badge variant="purple">Connection Accepted</Badge>}
                  </div>

                  <p className="text-brand-300 font-semibold text-xs">
                    {perspective === 'Candidate' ? `${match.companyName}` : `${match.candidateHeadline} for ${match.jobTitle}`}
                  </p>
                </div>

                {/* Card Action Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <Button
                    variant={match.isShortlisted ? 'accent' : 'outline'}
                    size="sm"
                    onClick={() => handleShortlist(match)}
                    icon={<Star className="w-3.5 h-3.5" />}
                  >
                    {match.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </Button>

                  <Button
                    variant={match.isSaved ? 'accent' : 'outline'}
                    size="sm"
                    onClick={() => handleSave(match)}
                    icon={<Bookmark className="w-3.5 h-3.5" />}
                  >
                    {match.isSaved ? 'Saved' : 'Save'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetForConnection(match);
                      setIsConnectionModalOpen(true);
                    }}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    {match.connectionStatus === 'Accepted' ? 'Message' : 'Request Connection'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(match)}
                    className="text-gray-500 hover:text-rose-400"
                    title="Dismiss Match"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Match Explanation Grid: Why Matched, Strengths, Potential Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5">
                  <span className="text-brand-400 font-mono font-bold text-[11px] uppercase block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Why Matched
                  </span>
                  <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                    {match.whyMatched.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                  <span className="text-emerald-400 font-mono font-bold text-[11px] uppercase block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Key Strengths
                  </span>
                  <ul className="space-y-1 text-[11px] text-emerald-200/90 list-disc list-inside">
                    {match.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5">
                  <span className="text-amber-400 font-mono font-bold text-[11px] uppercase block flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Potential Technical Gaps
                  </span>
                  <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                    {match.potentialGaps.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer: 10-Factor Score Drawer Trigger */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-[11px]">
                <div className="flex items-center gap-4 text-gray-400 font-mono">
                  <span>Skills: <strong className="text-white">{match.breakdown.skillsScore}%</strong></span>
                  <span>JD Fit: <strong className="text-white">{match.breakdown.jdFitScore}%</strong></span>
                  <span>Readiness: <strong className="text-white">{match.breakdown.readinessScore}%</strong></span>
                  <span>Projects: <strong className="text-white">{match.breakdown.portfolioScore}%</strong></span>
                </div>

                <button
                  onClick={() => {
                    setSelectedMatch(match);
                    setIsBreakdownModalOpen(true);
                  }}
                  className="text-brand-300 hover:text-brand-200 font-semibold flex items-center gap-1"
                >
                  Inspect 10-Factor Radar &rarr;
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* MODAL 1: 10-FACTOR SCORE BREAKDOWN DRAWER */}
      <Modal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        title={selectedMatch ? `10-Factor Match Breakdown — ${selectedMatch.jobTitle}` : 'Match Breakdown'}
      >
        {selectedMatch && (
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-gray-400">Composite Score</span>
                <div className="text-2xl font-extrabold text-brand-300 font-display mt-0.5">
                  {selectedMatch.overallMatchScore}%
                </div>
              </div>
              <Badge variant="info">Non-Discrimination Verified</Badge>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Skills Compatibility', weight: '25%', score: selectedMatch.breakdown.skillsScore },
                { label: 'Job Description Text Fit', weight: '20%', score: selectedMatch.breakdown.jdFitScore },
                { label: 'Experience Trajectory', weight: '15%', score: selectedMatch.breakdown.experienceScore },
                { label: 'Job Readiness Score', weight: '10%', score: selectedMatch.breakdown.readinessScore },
                { label: 'Portfolio Case Studies', weight: '10%', score: selectedMatch.breakdown.portfolioScore },
                { label: 'Education Credentials', weight: '5%', score: selectedMatch.breakdown.educationScore },
                { label: 'Work Mode Alignment', weight: '5%', score: selectedMatch.breakdown.workModeScore },
                { label: 'Location Radius', weight: '4%', score: selectedMatch.breakdown.locationScore },
                { label: 'Candidate Preferences', weight: '3%', score: selectedMatch.breakdown.preferenceScore },
                { label: 'Career Path Alignment', weight: '3%', score: selectedMatch.breakdown.careerPathScore }
              ].map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-gray-300 font-semibold">{factor.label} ({factor.weight})</span>
                    <span className="text-brand-300 font-bold">{factor.score}%</span>
                  </div>
                  <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-brand-400 h-full transition-all duration-300"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-[11px]">
              ⚠️ {selectedMatch.hiringGuaranteeDisclaimer}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: SEND CONNECTION REQUEST */}
      <Modal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        title="Request Connection & Consent"
      >
        {targetForConnection && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-gray-400 font-mono text-[11px] block">Connection Target:</span>
              <h4 className="font-bold text-white text-sm">{targetForConnection.jobTitle} at {targetForConnection.companyName}</h4>
              <p className="text-brand-300 text-[11px]">Match Score: {targetForConnection.overallMatchScore}%</p>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Invitation Note *</label>
              <textarea
                rows={3}
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                placeholder="Write a personalized connection invitation..."
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-800">
              <Button variant="ghost" onClick={() => setIsConnectionModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSendConnection} icon={<Send className="w-3.5 h-3.5" />}>
                Send Connection Request
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: AUDIT LOG INSPECTOR */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Matching Audit Trail & Compliance Log"
      >
        <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-mono">Total Recorded Events: {auditLogs.length}</span>
            <Badge variant="info">Immutable Compliance Log</Badge>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-300">{log.action}</span>
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-300 text-xs">{log.details}</p>
                <div className="flex items-center gap-3 pt-1 text-[10px] text-emerald-400">
                  <span>✓ Non-Discrimination Verified</span>
                  <span>✓ Protected Attributes Excluded</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 4: TEST REPORT */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Step 22: Two-Sided Candidate-Employer Matching Test Report"
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
