import React, { useState } from 'react';
import { Bell, Sparkles, MapPin, Database, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import { CandidateProfile } from '../../types';
import { db } from '../../db';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { runStep2ComprehensiveTests, ComprehensiveTestResult } from '../../services/comprehensiveTestRunner';

interface HeaderProps {
  candidate: CandidateProfile;
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ candidate, onMobileMenuToggle }) => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [testResults, setTestResults] = useState<ComprehensiveTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const executeDbTests = async () => {
    setIsRunningTests(true);
    const results = await runStep2ComprehensiveTests();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleOpenDbModal = () => {
    setIsDbModalOpen(true);
    if (testResults.length === 0) {
      executeDbTests();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-gray-800/80 bg-dark-bg/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            aria-label="Toggle Navigation"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Database & Architecture Suite Diagnostics Trigger */}
          <button
            onClick={handleOpenDbModal}
            className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 hover:border-brand-500/50 rounded-full px-3 py-1.5 text-xs text-gray-300 transition shadow-glow-sm"
          >
            <Database className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold text-white">Step 2 Architecture</span>
            <Badge variant="info" className="text-[10px] py-0 px-1.5">
              12 Models Verified
            </Badge>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Service Provider Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 border border-brand-500/30 text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span className="hidden md:inline">{db.providerName}</span>
            <span className="md:hidden">Service Active</span>
          </div>

          {/* Location Badge */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{candidate.currentLocation.city}, {candidate.currentLocation.state}</span>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>

          {/* Candidate Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-accent-teal flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
              {candidate.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-white">{candidate.fullName}</div>
              <div className="text-gray-400 truncate max-w-[140px]">{candidate.headline.split('|')[0]}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Step 2 Comprehensive Architecture Test Modal */}
      <Modal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        title="Laboria AI - Step 2 Platform Architecture & 12 Models Verification Suite"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-brand-950/40 border border-brand-500/30 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Service Provider: {db.providerName}</p>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Service/Repository pattern active. Pluggable to Supabase, PostgreSQL & permitted job APIs without frontend changes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={executeDbTests}
              disabled={isRunningTests}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />}
            >
              Re-run Suite
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-300 uppercase tracking-wider font-mono text-[11px]">
              Step 2 Comprehensive Verification Results ({testResults.length} Tests)
            </h4>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {testResults.map((tr, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    {tr.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-brand-300 mr-2">[{tr.category}]</span>
                      <span className="text-gray-200 font-semibold">{tr.testName}:</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">{tr.details}</p>
                    </div>
                  </div>
                  <Badge variant={tr.status === 'PASSED' ? 'success' : 'match-low'}>
                    {tr.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
