import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Users,
  Sparkles,
  Rocket,
  Compass,
  Target,
  Award,
  Bot,
  Radar,
  FileText,
  MapPin,
  MessageSquareCode,
  Mic,
  Zap,
  Radio,
  Bell,
  Briefcase,
  BookOpen,
  FileCheck,
  FolderGit2,
  Building2,
  ArrowLeftRight,
  ShieldAlert,
  TrendingUp,
  Cpu,
  Activity,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Share2,
  Lock,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Closed Beta Operations', path: '/beta', icon: Rocket },
  { name: 'Privacy & Data Compliance', path: '/privacy-compliance', icon: Lock },
  { name: 'Production Infra & Health', path: '/production-infra', icon: ShieldCheck },
  { name: 'User Growth & Referrals', path: '/growth', icon: Share2 },
  { name: 'Monetization & Entitlements', path: '/monetization', icon: DollarSign },
  { name: 'Admin Product Analytics', path: '/analytics', icon: Activity },
  { name: 'Employer Pilot Control Center', path: '/employer-pilot', icon: Building2 },
  { name: 'Career UX Optimization', path: '/ux-optimization', icon: Compass },
  { name: 'Job Quality Engine', path: '/job-quality', icon: Database },
  { name: 'Matching Accuracy Engine', path: '/matching-accuracy', icon: Target },
  { name: 'Usability & User Testing', path: '/usability-testing', icon: Users },
  { name: 'Real AI Engine Service', path: '/real-ai', icon: Sparkles },
  { name: 'Final Product Audit', path: '/product-audit', icon: ShieldCheck },
  { name: 'Production & Launch', path: '/launch', icon: Rocket },
  { name: 'Full Platform Testing', path: '/full-testing', icon: CheckCircle2 },
  { name: 'Security & Privacy', path: '/security-privacy', icon: ShieldCheck },
  { name: 'Performance & Scale', path: '/performance', icon: Activity },
  { name: 'Personal Career OS', path: '/career-os', icon: Cpu },
  { name: 'India Market Intelligence', path: '/market-intelligence', icon: TrendingUp },
  { name: 'Job Trust & Safety System', path: '/job-safety', icon: ShieldAlert },
  { name: 'Two-Sided Matching Engine', path: '/two-sided-matching', icon: ArrowLeftRight },
  { name: 'Employer & Recruiter Portal', path: '/employer', icon: Building2 },
  { name: 'Skill & Project Portfolio', path: '/portfolio', icon: FolderGit2 },
  { name: 'AI Application Assistant', path: '/application-assistant', icon: FileCheck },
  { name: 'AI Resume Builder', path: '/resume-builder', icon: FileText },
  { name: 'AI Learning Hub', path: '/learning', icon: BookOpen },


  { name: 'Application Tracker', path: '/applications', icon: Briefcase },
  { name: 'Notification Center', path: '/notifications', icon: Bell },
  { name: 'Final Launch', path: '/final-launch', icon: Sparkles },
  { name: 'AI Job Watch', path: '/job-watch', icon: Radio },
  { name: 'AI Career Navigator', path: '/navigator', icon: Compass },
  { name: 'AI Skill Gap Analyzer', path: '/skill-gap', icon: Target },
  { name: 'AI Job Readiness Score', path: '/readiness', icon: Award },
  { name: 'Personal AI Mentor', path: '/mentor', icon: Bot },
  { name: 'Future Skills Radar', path: '/radar', icon: Radar },
  { name: 'Resume → Opportunity', path: '/resume-match', icon: FileText },
  { name: 'Discover Opportunities', path: '/discover', icon: MapPin },
  { name: 'Location Recommendations', path: '/location-jobs', icon: MapPin },
  { name: 'Advanced Interview Simulator', path: '/interview-prep', icon: MessageSquareCode },
  { name: 'Soft Skills Coach', path: '/soft-skills', icon: Mic },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 glass-panel border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-teal flex items-center justify-center text-white shadow-glow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white tracking-wide">
                LABORIA <span className="text-brand-400">AI</span>
              </span>
              <p className="text-[10px] text-gray-400 -mt-1 font-mono">Stop searching. Start matching.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
            Core Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-white border-l-4 border-brand-500 shadow-glow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Tag */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-950/40">
          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs">
            <p className="text-gray-300 font-semibold mb-0.5">Matching Principle</p>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Profile Relevance (60%) &gt; Distance (20%). Skills shine over proximity.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
